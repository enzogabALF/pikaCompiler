import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

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
      compiledJS: string;
      jsExecutionResult: any;
      jsExecutionError: string | null;
      execution: any;
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
  const [activeTab, setActiveTab] = useState<'oak' | 'js' | 'details'>('oak');
  const [isSuccess, setIsSuccess] = useState(true);
  const [errors, setErrors] = useState<WorkerDiagnostic[]>([]);
  const [compiledData, setCompiledData] = useState<{
    ast: any;
    ir: any;
    optimizedIr: any;
    compiledJS: string;
    jsExecutionResult: any;
    jsExecutionError: string | null;
    execution: any;
  } | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker/compiler.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      const editor = editorRef.current;
      const monaco = monacoRef.current;

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
          compiledJS: msg.compiledJS,
          jsExecutionResult: msg.jsExecutionResult,
          jsExecutionError: msg.jsExecutionError,
          execution: msg.execution,
        });
        return;
      }

      if (msg.type === 'errors') {
        setIsSuccess(false);
        setErrors(msg.errors);
        setCompiledData(null);
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
          }
        }
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  function run(code: string) {
    workerRef.current?.postMessage({ code });
  }

  function loadTemplate(code: string) {
    if (editorRef.current) {
      editorRef.current.setValue(code);
    }
  }

  return (
    <div className="app-shell">
      {/* Header Estilo Pokédex */}
      <header className="header-bar">
        <div className="brand-section">
          <span className="brand-title">🔴 PIKA COMPILER ⚡</span>
        </div>
        <div className="pokeball-indicator">
          <div className={`pokeball-badge ${isSuccess ? 'success' : 'error'}`} />
          <span className={`status-text ${isSuccess ? 'success' : 'error'}`}>
            {isSuccess ? 'COMPILADO OK' : 'ENTRENADOR DEBILITADO'}
          </span>
        </div>
      </header>

      {/* Workspace Principal */}
      <div className="main-workspace">
        {/* Panel Izquierdo: Editor */}
        <div className="pane">
          <div className="pane-header">
            <span className="pane-title">Entrada de Código (.pika)</span>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="plaintext"
              defaultValue={TEMPLATE_COMBAT}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco as MonacoLike;
                const debounced = () => run(editor.getValue());
                editor.onDidChangeModelContent(debounced);
                debounced();
              }}
              options={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
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

        {/* Panel Derecho: Consola y Detalles */}
        <div className="pane">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'oak' ? 'active' : ''}`}
              onClick={() => setActiveTab('oak')}
            >
              🗣️ Consola de Oak
            </button>
            <button
              className={`tab-btn ${activeTab === 'js' ? 'active' : ''}`}
              onClick={() => setActiveTab('js')}
            >
              ⚡ Código Objeto JS
            </button>
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              🔍 Detalles del Compilador
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
                  {isSuccess && compiledData ? (
                    <div className="dialog-text">
                      {compiledData.execution.output.length > 0
                        ? compiledData.execution.output.join('\n')
                        : 'El programa corrió sin producir salida.'}
                    </div>
                  ) : (
                    <div className="dialog-text error">
                      {errors.length > 0
                        ? errors.map((err) => `[Línea ${err.line}] ${err.message}`).join('\n')
                        : 'Error desconocido durante la compilación o ejecución.'}
                    </div>
                  )}
                </div>

                {isSuccess && compiledData && (
                  <>
                    <div className="result-metric">
                      <span className="metric-label">Retorno Intérprete AST:</span>
                      <span className="metric-value">
                        {compiledData.execution.returnValue !== null
                          ? String(compiledData.execution.returnValue)
                          : 'sin retorno'}
                      </span>
                    </div>
                    <div className="result-metric">
                      <span className="metric-label">Retorno Código Objeto JS:</span>
                      <span className="metric-value">
                        {compiledData.jsExecutionError ? (
                          <span style={{ color: '#ff8080' }}>
                            Error: {compiledData.jsExecutionError}
                          </span>
                        ) : compiledData.jsExecutionResult?.returnValue !== undefined &&
                          compiledData.jsExecutionResult.returnValue !== null ? (
                          String(compiledData.jsExecutionResult.returnValue)
                        ) : (
                          'sin retorno'
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'js' && (
              <pre className="code-output">
                {isSuccess && compiledData ? compiledData.compiledJS : '// Sin código compilado.'}
              </pre>
            )}

            {activeTab === 'details' && (
              <div className="details-explorer">
                {isSuccess && compiledData ? (
                  <>
                    <div className="details-card">
                      <div className="details-card-header">1. Árbol Sintáctico (AST)</div>
                      <div className="details-card-body">
                        <pre className="json-block">
                          {JSON.stringify(compiledData.ast, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div className="details-card">
                      <div className="details-card-header">2. Código Intermedio (IR Original)</div>
                      <div className="details-card-body">
                        <pre className="json-block">{JSON.stringify(compiledData.ir, null, 2)}</pre>
                      </div>
                    </div>
                    <div className="details-card">
                      <div className="details-card-header">
                        3. Código Intermedio Optimizado (Algebraic Opt & DCE)
                      </div>
                      <div className="details-card-body">
                        <pre className="json-block">
                          {JSON.stringify(compiledData.optimizedIr, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted">Corrija los errores del código para explorar.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
