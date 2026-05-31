# pikaCompiler

Compilador educativo con temática Pokémon, organizado en 5 fases: léxico, sintáctico, semántico, IR/optimización y generación de código.

## Estado actual

Implementado hoy:
- Análisis léxico básico en el worker del frontend.
- Análisis sintáctico básico con Chevrotain.
- Traducción CST a AST y salida estructurada del compilador.
- Reglas semánticas temáticas iniciales documentadas en [docs/syntax_and_semantics.md](docs/syntax_and_semantics.md).
- Flujo de desarrollo con `pnpm`, `turbo`, `ESLint`, `Prettier` y `Husky`.

Pendiente:
- Análisis semántico completo.
- IR y optimización.
- Generación de código o intérprete.

## Estructura relevante

- `web/` — app Vite + React + TypeScript con Monaco Editor y el WebWorker del compilador.
- `examples/` — ejemplos `.pika` para pruebas y demostraciones.
- `docs/` — especificación de sintaxis, semántica e instrucciones del proyecto.
- `INSTALLATION.md` — guía para clonar, instalar y retomar el trabajo.
- `CONTRIBUTING.md` — flujo de contribución, versionado y releases.

## Arranque rápido

```bash
pnpm install
pnpm dev
```

Si prefieres abrir solo la app web directamente:

```bash
pnpm --dir web dev
```

## Formatos y calidad

El repositorio usa estos formatos y verificaciones:

- Formato de código: `Prettier`.
- Lint: `ESLint`.
- Hooks locales: `Husky` + `lint-staged`.
- Commits: Conventional Commits con `Commitizen`.
- Orquestación del workspace: `turbo`.

Comandos útiles desde la raíz:

```bash
pnpm lint
pnpm test
pnpm build
pnpm format
```

## Commits convencionales

Desde la raíz:

```bash
./scripts/commit.sh
./scripts/commit.ps1
```

Desde `web/`:

```bash
pnpm --dir web run commit
```

## CI

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) instala con `pnpm` y ejecuta `lint`, `test` y `build`.
- [`.github/workflows/release.yml`](.github/workflows/release.yml) crea releases desde tags `v*.*.*`.
- [`.github/workflows/semantic-release.yml`](.github/workflows/semantic-release.yml) publica releases automáticos.

## Contribuir

- Sigue la rama de trabajo `001-pokemon-compiler-language`.
- Revisa [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir PRs.
- Usa [`INSTALLATION.md`](INSTALLATION.md) para preparar un entorno nuevo o retomar trabajo.

## Referencia técnica

- La gramática y la semántica del lenguaje están documentadas en [docs/syntax_and_semantics.md](docs/syntax_and_semantics.md).
- El worker principal vive en [web/src/worker/compiler.worker.ts](web/src/worker/compiler.worker.ts).