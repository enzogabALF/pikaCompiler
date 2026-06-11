import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'c-compiler-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/compile-c' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const { code } = JSON.parse(body);
                const tmpDir = path.join(__dirname, 'tmp');
                if (!fs.existsSync(tmpDir)) {
                  fs.mkdirSync(tmpDir, { recursive: true });
                }
                const cFile = path.join(tmpDir, 'pika_program.c');
                const exeFile = path.join(tmpDir, 'pika_program.exe');

                fs.writeFileSync(cFile, code, 'utf-8');

                // Intenta compilar con gcc
                exec(`gcc -O3 "${cFile}" -o "${exeFile}"`, (error, stdout, stderr) => {
                  if (error) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        error: stderr || error.message || 'Error de compilación local.',
                      })
                    );
                    return;
                  }

                  // Leer y retornar el archivo ejecutable compilado
                  if (fs.existsSync(exeFile)) {
                    const data = fs.readFileSync(exeFile);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.setHeader('Content-Disposition', 'attachment; filename="pika_program.exe"');
                    res.end(data);
                  } else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'No se generó el archivo ejecutable.' }));
                  }
                });
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message || 'Error al procesar la solicitud.' }));
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  server: { port: 5173 },
});
