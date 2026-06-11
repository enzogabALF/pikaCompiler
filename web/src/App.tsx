import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import Pikadex from './Pikadex';

type Marker = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity?: number;
};

type MonacoLike = {
  editor: {
    setModelMarkers: (model: unknown, owner: string, markers: Marker[]) => void;
  };
  MarkerSeverity: {
    Error: number;
  };
};

type WorkerDiagnostic = {
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
};

type WorkerMessage =
  | {
      type: 'result';
      ast: any;
      ir: any;
      optimizedIr: any;
      compiledC: string;
      executionResult: {
        entryFunction: string;
        output: string[];
        returnValue: any;
        error?: string;
      };
    }
  | { type: 'errors'; errors: WorkerDiagnostic[] };

const TEMPLATE_COMBAT = `PUEBLO_NATAL() {
  DICE_PROF_OAK("--- Inicia Bucle de Combate ---");
  CAPTURA ps EN PokeBall CON 100;
  CAPTURA danio EN PokeBall CON 20 + 5; // CF: 25

  SI_ENTRENADOR_DESAFIA (ps > 50) {
    ps = ps - danio; // 75
    DICE_PROF_OAK("¡Daño Recibido!");
  }

  // Simplificación algebraica: ps = ps + 0 (redundante)
  ps = ps + 0;

  DICE_PROF_OAK("PS Final:");
  DICE_PROF_OAK(ps);
  RETORNA ps;
}`;

const TEMPLATE_MOCHILA = `PUEBLO_NATAL() {
  DICE_PROF_OAK("--- Preparando Mochila ---");
  MOCHILA mochila DE PokeBall;
  
  GUARDAR(mochila, 15);
  GUARDAR(mochila, 30);
  
  CAPTURA cantidad EN PokeBall CON CANTIDAD_DE(mochila);
  DICE_PROF_OAK("Objetos guardados:");
  DICE_PROF_OAK(cantidad);
  
  CAPTURA sacado EN PokeBall CON SACAR(mochila);
  DICE_PROF_OAK("Objeto extraído:");
  DICE_PROF_OAK(sacado);
  
  DICE_PROF_OAK("Objetos restantes:");
  DICE_PROF_OAK(CANTIDAD_DE(mochila));
}`;

const TEMPLATE_RADAR = `PUEBLO_NATAL() {
  DICE_PROF_OAK("--- Iniciando Punteros de Radar ---");
  CAPTURA coordenadas EN PokeBall CON 50;
  RADAR radar APUNTA_A PokeBall;
  
  radar = UBICACION_DE(coordenadas);
  
  // Cambiar el valor mediante el radar
  MIRAR_RADAR(radar) = 150;
  
  DICE_PROF_OAK("Coordenadas actualizadas:");
  DICE_PROF_OAK(coordenadas);
}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'oak' | 'terminal'>('oak');
  const [isSuccess, setIsSuccess] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errors, setErrors] = useState<WorkerDiagnostic[]>([]);
  const [view, setView] = useState<'compiler' | 'pikadex'>('compiler');
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [compiledData, setCompiledData] = useState<{
    ast: any;
    ir: any;
    optimizedIr: any;
    compiledC: string;
    executionResult: {
      entryFunction: string;
      output: string[];
      returnValue: any;
      error?: string;
    };
  } | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker/compiler.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      setIsCompiling(false);

      if (editor && monaco) {
        const model = editor.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'pikaCompiler', []);
        }
      }

      if (msg.type === 'result') {
        setIsSuccess(true);
        setErrors([]);
        setCompiledData({
          ast: msg.ast,
          ir: msg.ir,
          optimizedIr: msg.optimizedIr,
          compiledC: msg.compiledC,
          executionResult: msg.executionResult,
        });
        setActiveTab('terminal'); // Switch to terminal on compile success
        if (editor) {
          decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
        }
        return;
      }

      if (msg.type === 'errors') {
        setIsSuccess(false);
        setErrors(msg.errors);
        setCompiledData(null);
        setActiveTab('terminal'); // Switch to terminal on compile failure to show errors
        if (editor && monaco) {
          const model = editor.getModel();
          if (model) {
            const markers: Marker[] = msg.errors.map((err) => ({
              startLineNumber: err.line,
              startColumn: err.column,
              endLineNumber: err.endLine ?? err.line,
              endColumn: err.endColumn ?? err.column + 1,
              message: err.message,
              severity: monaco.MarkerSeverity.Error,
            }));
            monaco.editor.setModelMarkers(model, 'pikaCompiler', markers);

            // Add visual red line backgrounds and glyph margin icons
            const newDecorations = msg.errors.map((err) => ({
              range: new monaco.Range(err.line, 1, err.line, 1),
              options: {
                isWholeLine: true,
                className: 'error-line-decoration',
                glyphMarginClassName: 'error-glyph-decoration',
              },
            }));
            decorationsRef.current = editor.deltaDecorations(
              decorationsRef.current,
              newDecorations
            );

            // Scroll, place cursor and focus the first error
            if (msg.errors.length > 0) {
              const firstErr = msg.errors[0];
              editor.revealLineInCenter(firstErr.line);
              editor.setPosition({ lineNumber: firstErr.line, column: firstErr.column || 1 });
              editor.focus();
            }
          }
        }
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  function run(code: string) {
    setIsCompiling(true);
    workerRef.current?.postMessage({ code });
  }

  function handleCompile() {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      setIsDirty(false);
      run(code);
    }
  }

  function loadTemplate(code: string) {
    if (editorRef.current) {
      editorRef.current.setValue(code);
      setIsDirty(false);
      run(code);
    }
  }

  async function handleExport() {
    if (!compiledData || !compiledData.compiledC) {
      alert('Por favor, compila el programa con éxito primero.');
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      // 1. Descargar archivo .c
      const cBlob = new Blob([compiledData.compiledC], { type: 'text/x-csrc' });
      const cUrl = URL.createObjectURL(cBlob);
      const cLink = document.createElement('a');
      cLink.href = cUrl;
      cLink.download = 'pika_program.c';
      cLink.click();
      URL.revokeObjectURL(cUrl);

      // 2. Intentar compilar y descargar ejecutable
      const response = await fetch('/api/compile-c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: compiledData.compiledC }),
      });

      if (response.ok) {
        const exeBlob = await response.blob();
        const exeUrl = URL.createObjectURL(exeBlob);
        const exeLink = document.createElement('a');
        exeLink.href = exeUrl;
        exeLink.download = 'pika_program.exe';
        exeLink.click();
        URL.revokeObjectURL(exeUrl);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Error de servidor al compilar' }));
        setExportError(errorData.error || 'No se pudo generar el ejecutable.');
      }
    } catch (e: any) {
      setExportError(e.message || 'Error de conexión con el compilador local.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="app-shell">
      {/* Header Estilo Pokédex */}
      <header className="header-bar">
        <div className="brand-section">
          <span className="brand-title">🔴 PIKA COMPILER ⚡</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            className={`pikadex-toggle-btn ${view === 'pikadex' ? 'active' : ''}`}
            onClick={() => setView(view === 'compiler' ? 'pikadex' : 'compiler')}
          >
            {view === 'compiler' ? '📖 Ver Pikadex' : '💻 Regresar al Editor'}
          </button>
          <div className="pokeball-indicator">
            <div
              className={`pokeball-badge ${isDirty ? 'dirty' : isSuccess ? 'success' : 'error'} ${
                isCompiling ? 'compiling' : ''
              }`}
            />
            <span className={`status-text ${isDirty ? 'dirty' : isSuccess ? 'success' : 'error'}`}>
              {isCompiling
                ? 'COMPILANDO...'
                : isDirty
                ? 'CAMBIOS SIN COMPILAR'
                : isSuccess
                ? 'COMPILADO OK'
                : 'ENTRENADOR DEBILITADO'}
            </span>
          </div>
        </div>
      </header>

      {view === 'pikadex' ? (
        <Pikadex
          onLoadExample={(code) => {
            setView('compiler');
            setTimeout(() => {
              loadTemplate(code);
            }, 100);
          }}
          onClose={() => setView('compiler')}
        />
      ) : (
        /* Workspace Principal */
        <div className="main-workspace">
          {/* Panel Izquierdo: Editor */}
          <div className="pane">
            <div className="pane-header">
              <span className="pane-title">Entrada de Código (.pika)</span>
              <div className="pane-header-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`export-btn ${!isSuccess ? 'disabled' : ''}`}
                  onClick={handleExport}
                  disabled={!isSuccess || isCompiling || isExporting}
                  title="Descarga el archivo .c y compila un ejecutable binario"
                >
                  {isExporting ? '📥 Descargando...' : '📥 Exportar C/Ejecutable'}
                </button>
                <button
                  className={`compile-btn ${isDirty ? 'dirty' : ''} ${
                    isCompiling ? 'loading' : ''
                  }`}
                  onClick={handleCompile}
                  disabled={isCompiling}
                >
                  {isCompiling ? '⚡ Compilando...' : '⚡ Compilar y Ejecutar'}
                </button>
              </div>
            </div>
            <div className="editor-wrapper">
              <Editor
                height="100%"
                theme="vs-dark"
                language="pika"
                defaultValue={TEMPLATE_COMBAT}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco as MonacoLike;

                  // Register Pika language syntax highlighting
                  monaco.languages.register({ id: 'pika' });
                  monaco.languages.setMonarchTokensProvider('pika', {
                    keywords: [
                      'PUEBLO_NATAL',
                      'MOVIMIENTO',
                      'CAPTURA',
                      'EN',
                      'CON',
                      'EQUIPO',
                      'DE',
                      'CAPACIDAD',
                      'MOCHILA',
                      'SI_ENTRENADOR_DESAFIA',
                      'SINO',
                      'MIENTRAS_TENGA_PS',
                      'RADAR',
                      'APUNTA_A',
                      'RETORNA',
                    ],
                    builtins: [
                      'DICE_PROF_OAK',
                      'OAK_PREGUNTA',
                      'UBICACION_DE',
                      'MIRAR_RADAR',
                      'DEVOLVER_A_LA_BALL',
                      'GUARDAR',
                      'SACAR',
                      'CANTIDAD_DE',
                    ],
                    tokenizer: {
                      root: [
                        [
                          /[A-Za-z_][A-Za-z0-9_]*/,
                          {
                            cases: {
                              '@keywords': 'keyword',
                              '@builtins': 'predefined',
                              '@default': 'identifier',
                            },
                          },
                        ],
                        [/\/\/.*$/, 'comment'],
                        [/\/\*/, 'comment', '@comment'],
                        [/\d+\.\d+/, 'number.float'],
                        [/\d+/, 'number'],
                        [/"([^"\\]|\\.)*"/, 'string'],
                      ],
                      comment: [
                        [/[^/*]+/, 'comment'],
                        [/\*\//, 'comment', '@pop'],
                        [/[/*]/, 'comment'],
                      ],
                    },
                  });

                  editor.onDidChangeModelContent(() => {
                    setIsDirty(true);
                    const model = editor.getModel();
                    if (model) {
                      monaco.editor.setModelMarkers(model, 'pikaCompiler', []);
                    }
                    if (decorationsRef.current) {
                      editor.deltaDecorations(decorationsRef.current, []);
                      decorationsRef.current = [];
                    }
                  });
                  // Initial compilation of default template
                  setIsDirty(false);
                  run(editor.getValue());
                }}
                options={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  glyphMargin: true,
                }}
              />
            </div>
            <div className="template-bar">
              <span className="template-label">Plantillas:</span>
              <button className="template-btn" onClick={() => loadTemplate(TEMPLATE_COMBAT)}>
                🔴 Combate
              </button>
              <button className="template-btn" onClick={() => loadTemplate(TEMPLATE_MOCHILA)}>
                🎒 Mochila
              </button>
              <button className="template-btn" onClick={() => loadTemplate(TEMPLATE_RADAR)}>
                📡 Radares
              </button>
            </div>
          </div>

          {/* Panel Derecho: Consola y Terminal */}
          <div className="pane">
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'oak' ? 'active' : ''}`}
                onClick={() => setActiveTab('oak')}
              >
                🗣️ Consola de Oak
              </button>
              <button
                className={`tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminal')}
              >
                💻 Terminal de Ejecución
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'oak' && (
                <div className="oak-dialog-container">
                  <div className="dialog-box">
                    <div className="dialog-header">
                      <span className="dialog-avatar">👴</span>
                      <span className="dialog-title">PROF. OAK:</span>
                    </div>
                    {isSuccess ? (
                      <div className="dialog-text">
                        {isDirty
                          ? "Has editado el código. Haz clic en 'Compilar y Ejecutar' para que pueda analizar tus cambios e interpretar el programa."
                          : "¡Pika-Pika! El compilador ha traducido y ejecutado con éxito tu programa.\n\nHaz clic en 'Terminal de Ejecución' para ver la salida de tus comandos DICE_PROF_OAK."}
                      </div>
                    ) : (
                      <div className="dialog-text error">
                        {errors.length > 0
                          ? `¡Oh no! Parece que tu equipo ha sido debilitado por los siguientes errores:\n\n` +
                            errors.map((err) => `• [Línea ${err.line}] ${err.message}`).join('\n')
                          : 'Error de compilación. Por favor revisa los tipos y la sintaxis.'}
                      </div>
                    )}
                  </div>

                  {isSuccess && compiledData && !isDirty && (
                    <>
                      <div className="result-metric">
                        <span className="metric-label">Estado de Ejecución:</span>
                        <span className="metric-value" style={{ color: '#4caf50' }}>
                          FINALIZADO OK
                        </span>
                      </div>
                      <div className="result-metric">
                        <span className="metric-label">Líneas de Salida de Consola:</span>
                        <span className="metric-value">
                          {compiledData.executionResult?.output.length ?? 0}
                        </span>
                      </div>
                      {compiledData.executionResult?.returnValue !== null && (
                        <div className="result-metric">
                          <span className="metric-label">Valor de Retorno (PUEBLO_NATAL):</span>
                          <span className="metric-value" style={{ color: '#fbd743' }}>
                            {String(compiledData.executionResult?.returnValue)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="terminal-window">
                  <div className="terminal-titlebar">
                    <div className="terminal-dots">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <span className="terminal-title-text">pika-terminal</span>
                  </div>
                  <div className="terminal-body">
                    <div className="terminal-prompt">
                      pika-user@pallet-town:~$ ./run_pika_program
                    </div>

                    {compiledData && compiledData.executionResult ? (
                      <>
                        {/* Líneas de salida de DICE_PROF_OAK */}
                        {compiledData.executionResult.output.length > 0 ? (
                          compiledData.executionResult.output.map((line: string, i: number) => (
                            <div key={i} className="terminal-line">
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="terminal-line muted">
                            (El programa se ejecutó con éxito pero no generó ninguna salida
                            DICE_PROF_OAK)
                          </div>
                        )}

                        {/* Error de Ejecución si ocurre */}
                        {compiledData.executionResult.error && (
                          <div className="terminal-line error">
                            ❌ Error de ejecución: {compiledData.executionResult.error}
                          </div>
                        )}

                        {/* Valor Retornado de la función */}
                        {compiledData.executionResult.returnValue !== null && (
                          <div className="terminal-line return-value">
                            <span>=== Programa finalizado ===</span>
                            <br />
                            <span>
                              Valor de retorno: {String(compiledData.executionResult.returnValue)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : errors.length > 0 ? (
                      <div className="terminal-line error">
                        ❌ ERROR DE COMPILACIÓN:
                        {errors.map((err, i) => (
                          <div key={i} style={{ paddingLeft: '12px', marginTop: '6px' }}>
                            • [Línea {err.line}, Columna {err.column}] {err.message}
                          </div>
                        ))}
                      </div>
                    ) : isDirty ? (
                      <div className="terminal-line warning">
                        {
                          '⚠️ Los cambios no han sido compilados aún. Haz clic en "⚡ Compilar y Ejecutar" para actualizar.'
                        }
                      </div>
                    ) : (
                      <div className="terminal-line error">
                        ❌ El código tiene errores de compilación y no puede ejecutarse. Revisa la
                        Consola de Oak.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error de Exportación */}
      {exportError && (
        <div className="modal-overlay">
          <div className="modal-content warning-card">
            <h3>⚠️ Compilación de C Fallida</h3>
            <p className="modal-desc">
              Se descargó tu código C (<code>pika_program.c</code>) correctamente, pero no se pudo
              compilar el ejecutable localmente debido al siguiente error:
            </p>
            <pre className="error-log">{exportError}</pre>
            <div className="modal-tips">
              <strong>💡 ¿Cómo solucionarlo?</strong>
              <p>
                Para poder generar ejecutables binarios (.exe) desde la interfaz web, necesitas
                instalar un compilador de C en tu sistema:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                <li>
                  Instala <strong>MinGW-w64</strong> (a través de MSYS2 o w64devkit) o{' '}
                  <strong>LLVM/Clang</strong>.
                </li>
                <li>
                  Asegúrate de agregar la carpeta <code>bin</code> del compilador (que contiene{' '}
                  <code>gcc.exe</code>) a tu variable de entorno <strong>PATH</strong>.
                </li>
                <li>
                  Reinicia tu servidor de desarrollo (<code>pnpm dev</code>) para aplicar los
                  cambios del PATH.
                </li>
              </ul>
            </div>
            <button className="modal-close-btn" onClick={() => setExportError(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
