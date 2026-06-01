# Tasks: Lenguaje PokeCompiler

**Input**: Feature spec en `specs/001-pokemon-compiler-language/spec.md`
**Status**: Implementación parcial documentada; estas tareas reflejan lo ya completado en la rama actual

## Tareas completadas

- [x] T001 Implementar el lexer temático en [web/src/compiler/lexer.ts](web/src/compiler/lexer.ts)
- [x] T002 Definir el parser básico con Chevrotain en [web/src/compiler/parser.ts](web/src/compiler/parser.ts)
- [x] T003 Traducir CST a AST en [web/src/compiler/ast.ts](web/src/compiler/ast.ts)
- [x] T004 Conectar el worker del compilador en [web/src/worker/compiler.worker.ts](web/src/worker/compiler.worker.ts)
- [x] T005 Añadir pruebas del lexer en [web/src/compiler/lexer.test.ts](web/src/compiler/lexer.test.ts)
- [x] T006 Actualizar la documentación de estado en [README.md](README.md)

## Próximas tareas

- [ ] T007 Completar el análisis semántico del lenguaje
- [x] T008 Añadir IR y optimización (implementado)
- [x] T009 Implementar generación de código o intérprete (intérprete mínimo implementado)