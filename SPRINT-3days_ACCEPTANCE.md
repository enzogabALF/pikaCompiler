Sprint 3 días — Criterios de Aceptación (equipo 3 personas)

Notas generales:
- Cada criterio debe ser verificable mediante tests automatizados, revisión de código o demostración en la UI.
- Use mensajes de commit siguiendo Conventional Commits (ej. `feat:`, `fix:`, `chore:`).

Day 1 — Onboarding y núcleo inicial

1) Day1: Dev env & onboarding (All)
- Criterio: `web/` instala dependencias sin errores con `pnpm install` y Husky se activa con `pnpm --dir web run prepare`.
- Criterio: README actualizado con pasos de arranque y scripts de commits; equipo puede ejecutar `pnpm --dir web run commit` desde la raíz.

2) Day1: Lexer + unit tests (A)
- Criterio: Implementación inicial del lexer en `web/src/worker/compiler.worker.ts` o `web/src/compiler/lexer.ts`.
- Criterio: Tests unitarios (Vitest) cubren tokenización de ejemplos básicos y edge-cases (identifiers, números, operadores, comentarios) y pasan en CI.

3) Day1: Parser core + tests (B)
- Criterio: Parser Chevrotain parsea programas simples definidos en la gramática y entrega un CST; `parser` devuelve errores legibles cuando hay fallo.
- Criterio: Tests unitarios que parsean 5 ejemplos representativos y validan estructura básica del CST.

4) Day1: Monaco markers + worker plumbing (C)
- Criterio: Editor envía código al worker y recibe respuesta; al menos errores léxicos/parse se muestran como markers en Monaco.
- Criterio: UI muestra mensajes en la consola (Profesor Oak) para parse OK / errores.

Day 1 — Pull Requests

5) Day1: Daily review & PRs (All)
- Criterio: Cada feature creada en ramas `feature/day1-<task>` con PR mínimo (descripción, checklist, asignados) y aprobada por al menos otro miembro.

Day 2 — Análisis semántico y IR

6) Day2: Parser->AST complete (A)
- Criterio: Transformación CST→AST implementada en `web/src/compiler/ast.ts` con nodos tipados (TS interfaces).
- Criterio: Tests que aseguran correspondencia entre ejemplos y AST esperada.

7) Day2: Semantic analysis + symbol table (B)
- Criterio: Implementación de análisis semántico que detecta: uso de variables no declaradas, redeclaraciones, tipos incompatibles básicos y reporta errores con ubicación.
- Criterio: Tests que cubren al menos 10 casos semánticos (válidos/erróneos).

8) Day2: IR design & lowering (C)
- Criterio: Definición de un IR simple (JSON/TS interfaces) y pass de lowering desde AST a IR en `web/src/compiler/ir.ts`.
- Criterio: Tests que validan lowering para funciones/expresiones/assigns.

9) Day2: Integration tests + parser fixes (All)
- Criterio: Integración lexer→parser→AST→semantic pasa para 5 programas de ejemplo; cualquier fallo documentado y corregido.

Day 3 — Generación/ejecución y entrega

10) Day3: IR opt + tests (A)
- Criterio: Implementar al menos 1 optimización (const-folding o dead-store removal) sobre IR con tests que demuestran mejora funcional.

11) Day3: Codegen/Interpreter implement (B)
- Criterio: Implementar un intérprete o codegen sencillo que ejecute programas de ejemplo (salida en consola o resultado retornado) y pasar tests E2E.

12) Day3: Run in worker & UI integration (C)
- Criterio: Ejecutor corre en WebWorker; la UI puede ejecutar un programa completo y mostrar salida/errores; prueba manual demostrable.

13) Day3: E2E tests + CI update (All)
- Criterio: Añadir al menos 3 E2E tests que ejecuten ciclo completo (editor → worker → ejecutor) y actualizar `.github/workflows/ci.yml` para correrlos.

14) Finalize docs & release prep (All)
- Criterio: `CONTRIBUTING.md` y `README.md` actualizados con flujo, convenciones de commit, comando de release; tag `v0.1.0` preparado y `semantic-release` configurado para `main`.

Criterios transversales (calidad)
- Todos los cambios tienen pruebas unitarias o E2E relevantes.
- Código con `pnpm run lint` sin errores y `pnpm run format` aplicado.
- Commits siguen Conventional Commits (usar `pnpm --dir web run commit` o `commitizen`).

*** Fin de criterios de aceptación ***
