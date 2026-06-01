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
  | { type: 'result'; text: string }
  | { type: 'errors'; errors: WorkerDiagnostic[] };

export default function App() {
  const [output, setOutput] = useState('');
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
        setOutput(msg.text);
        return;
      }

      if (msg.type === 'errors') {
        setOutput('Errors:\n' + msg.errors.map((err) => err.message).join('\n'));
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

  return (
    <div className="app-shell">
      <div className="editor-pane">
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          defaultValue={
            'MOVIMIENTO CURAR() RETORNA PokeBall {\n  CAPTURA cura EN PokeBall CON 0;\n  RETORNA cura;\n}'
          }
          onChange={() => {}}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco as MonacoLike;
            const debounced = () => run(editor.getValue());
            editor.onDidChangeModelContent(debounced);
            debounced();
          }}
        />
      </div>
      <div className="console-pane">
        <h3>Consola del Prof. Oak</h3>
        <pre className="console-output">{output}</pre>
      </div>
    </div>
  );
}
