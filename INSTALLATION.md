# Instalación y puesta en marcha

Esta guía permite clonar el repositorio, instalar dependencias y retomar el trabajo desde el estado actual del proyecto.

## Requisitos

- Node.js 18.x
- pnpm 10.x
- Git

> El repositorio declara `engines` para Node 18. Si usas otra versión, puede que veas advertencias durante la instalación.

## Clonar el repositorio

```bash
git clone https://github.com/enzogabALF/pikaCompiler.git
cd pikaCompiler
git checkout 001-pokemon-compiler-language
```

## Instalar dependencias

Desde la raíz del repositorio:

```bash
pnpm install
```

Esto instala el workspace completo y deja listo el lockfile de pnpm.

## Activar hooks locales

Los hooks de Husky quedan preparados al instalar dependencias. Si necesitas reactivarlos manualmente:

```bash
pnpm --dir web run prepare
```

## Levantar el proyecto

```bash
pnpm dev
```

El comando anterior arranca la aplicación web desde la raíz mediante Turbo.

## Verificaciones de calidad

Antes de abrir PRs o continuar con nuevas fases del compilador, ejecuta:

```bash
pnpm lint
pnpm test
pnpm build
pnpm format
```

## Formatos de trabajo

- Código: TypeScript en el frontend y documentación en Markdown.
- Formato de código: Prettier.
- Lint: ESLint.
- Commits: Conventional Commits con Commitizen.
- Automatización local: Husky + lint-staged.
- Orquestación del workspace: Turbo + pnpm.

## Retomar el trabajo

Si vas a continuar desde donde quedó el equipo:

1. Cambia a la rama `001-pokemon-compiler-language`.
2. Ejecuta `pnpm install`.
3. Lanza `pnpm dev` para validar que el frontend arranca.
4. Revisa el estado actual de sintaxis y semántica en [docs/syntax_and_semantics.md](docs/syntax_and_semantics.md).
5. Revisa el estado de implementación en [README.md](README.md).

## Estructura útil

- `web/` contiene la app y el worker del compilador.
- `examples/` contiene programas `.pika` para probar cambios.
- `docs/` contiene la especificación del lenguaje.
- `.github/workflows/` contiene la CI y releases.
