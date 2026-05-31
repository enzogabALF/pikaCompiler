import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

type Marker = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
};

export default function App() {
  const [output, setOutput] = useState('');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker/compiler.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'result') setOutput(msg.text);
      if (msg.type === 'errors') setOutput('Errors:\n' + msg.errors.join('\n'));
    };
    return () => workerRef.current?.terminate();
  }, []);

  function run(code: string) {
    workerRef.current?.postMessage({ code });
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          defaultValue={
            'MOVIMIENTO CURAR() RETORNA PokeBall {\n  CAPTURA cura EN PokeBall CON 0;\n  RETORNA cura;\n}'
          }
          onChange={(v) => {}}
          onMount={(editor) => {
            const debounced = () => run(editor.getValue());
            editor.onDidChangeModelContent(debounced);
          }}
        />
      </div>
      <div style={{ width: 420, borderLeft: '1px solid #ddd', padding: 8 }}>
        <h3>Consola del Prof. Oak</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{output}</pre>
      </div>
    </div>
  );
}
