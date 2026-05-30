# pikaCompiler (TypeScript / Web)

Compilador educativo migrado a TypeScript y preparado para uso en la web.

Estructura relevante:
- `web/` — aplicación Vite + React + TypeScript con Monaco Editor y un WebWorker que contiene el core del compilador (Chevrotain).
- `examples/` — programas de ejemplo en PokeLang (archivos `.pika`).
- `CONTRIBUTING.md` — guía de contribución y versionado.

Arrancar localmente (desde la raíz):

```bash
cd web
npm ci
npm run dev
```

Descripción rápida
- El editor (Monaco) envía el código al WebWorker `web/src/worker/compiler.worker.ts` que tokeniza y parsea con `chevrotain`.
- Si hay errores, el worker devuelve diagnósticos; si el parseo es correcto, devuelve `Parsed OK` (en próximas iteraciones se añadirá AST y ejecución).

Control de versiones
- Sigue SemVer. Ver `CONTRIBUTING.md` para el flujo de branching y cómo publicar versiones del subproyecto `web/`.

CI
- El workflow `.github/workflows/ci.yml` ejecuta las pruebas del subproyecto `web/` en cada PR y push.

Contribuir
- Lee `CONTRIBUTING.md` y abre PRs desde ramas `feature/*` o `fix/*` contra `main`.

Conveniencia — commits convencionales
- Desde la raíz puedes lanzar Commitizen (guía interactiva para Conventional Commits):

```bash
./scripts/commit.sh   # POSIX
./scripts/commit.ps1 # PowerShell
```

- Alternativamente, desde `web/`:

```bash
cd web
npm run commit
```

Nota: instala dependencias en `web/` y ejecuta `npm run prepare` para activar Husky antes de usar los hooks.

python -m unittest discover -v
```

Integración continua
- Se agregó un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta los tests en pushes y PRs.

Contribuir
- Abre un issue o PR en la rama `001-pokemon-compiler-language` para propuestas o fixes.

Limitaciones y próximos pasos
- Actualmente implementadas: análisis léxico, sintáctico y semántico con reglas temáticas.
- Pendiente: representación intermedia (IR) y generación de código objeto.

Contacto
- Autor: enzogabALF
- Autor: Jeunex2004 (Jeuel Evin Linder)
- Autor: