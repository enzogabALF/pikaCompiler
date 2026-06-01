<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

# Instrucciones para agentes de código

Resumen rápido: este repositorio contiene una aplicación web (Vite+React) con un `WebWorker` que implementa las primeras fases del compilador educativo "pikaCompiler". Los agentes deben preferir enlaces y comandos aquí en vez de copiar documentación extensa.

**Comandos útiles (desde la raíz)**

- `pnpm install` — instalar dependencias.
- `pnpm dev` — iniciar flujo de desarrollo (usa `turbo` para el workspace).
- `pnpm --dir web dev` — iniciar sólo la app web.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm format` — comandos de verificación.

Node: `>=18 <19` (definido en `package.json`).

**Dónde mirar primero**

- Estructura y estado: [README.md](README.md)
- Instalación detallada: [INSTALLATION.md](INSTALLATION.md)
- Flujo de contribución: [CONTRIBUTING.md](CONTRIBUTING.md)
- Gramática y semántica del lenguaje: [docs/syntax_and_semantics.md](docs/syntax_and_semantics.md)
- Worker del compilador (punto clave): [web/src/worker/compiler.worker.ts](web/src/worker/compiler.worker.ts)
- Ejemplos de entrada: [examples/](examples/)

**Acciones recomendadas para un agente**

- Antes de modificar código: ejecutar `pnpm install` y `pnpm test` localmente.
- Para cambios relacionados con la web: ejecutar `pnpm --dir web dev` y revisar el `WebWorker`.
- Para cambios en análisis léxico/sintáctico/semántico: inspeccionar `web/src/compiler` y `docs/syntax_and_semantics.md`.
- Usar `pnpm lint` y `pnpm format` antes de crear PRs.

**Convenciones y notas importantes**

- Workspace orquestado con `turbo`; muchos scripts se delegan desde la raíz.
- Commits: Conventional Commits; use los scripts de `./scripts/commit.*` o `pnpm commit`.
- El repositorio incluye agentes y prompts generados por `speckit` en `.github/agents` y `.github/prompts` — revísalos antes de modificarlos y no los sobrescribas sin revisar (contienen tareas y flujos automáticos útiles).

Si necesitas más detalles o prefieres que cree `AGENTS.md` en la raíz con reglas adicionales, indícalo y lo añado.

