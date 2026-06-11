# Pruebas y Control de Calidad 🧪

El proyecto **pikaCompiler** mantiene altos estándares de calidad de código mediante pruebas unitarias exhaustivas, pruebas de integración de extremo a extremo (E2E) y herramientas de análisis estático.

---

## 1. Suite de Pruebas con Vitest

Todas las pruebas del compilador se encuentran bajo la carpeta [`web/src/compiler/`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/web/src/compiler) y son ejecutadas mediante el test-runner **Vitest**, que es extremadamente veloz gracias al empaquetamiento en caliente de ESBuild.

### Estructura de las Pruebas

La suite de pruebas se divide de manera modular según las fases del compilador:

1.  **Pruebas del Escáner (`lexer.test.ts`)**:
    *   Verifica la correcta clasificación de tokens (ej. identificadores, números, palabras clave).
    *   Prueba que los comentarios sean omitidos de forma correcta.
    *   Valida la detección y captura de errores léxicos.
2.  **Pruebas del Árbol Sintáctico (`ast.test.ts`)**:
    *   Asegura que el parser procese de forma jerárquica las operaciones matemáticas respetando la precedencia de operadores.
    *   Verifica la correcta generación de nodos del AST para declaraciones complejas y sentencias de radar.
3.  **Pruebas del Analizador Semántico (`semantics.test.ts`)**:
    *   Prueba el correcto rechazo de asignaciones incompatibles.
    *   Valida el bloqueo de límites de equipo incorrectos (fuera de 1 a 6).
    *   Comprueba el bounds checking en tiempo de compilación de arreglos.
    *   Verifica que `DEVOLVER_A_LA_BALL` solo sea admitido dentro de funciones auxiliares `MOVIMIENTO`.
4.  **Pruebas de la Representación Intermedia (`ir.test.ts`)**:
    *   Prueba las simplificaciones algebraicas (ej. `x + 0` $\rightarrow$ `x`, `x * 0` $\rightarrow$ `0`).
    *   Verifica el plegado de constantes de operaciones compuestas.
    *   Prueba la eliminación de bloques de código inalcanzables.
5.  **Pruebas del Generador de Código C (`codegen.test.ts`)**:
    *   Valida que la salida transpiletada a C11 contenga los headers correctos, las estructuras de mochilas dinámicas, macros de sobrecarga `_Generic` e implementaciones nativas del radar.
6.  **Pruebas E2E del compilador (`e2e.test.ts`)**:
    *   Ejecuta programas completos a través de todo el compilador de extremo a extremo, simulando escenarios reales de combates, cálculos de promedios de equipos Pokémon e instanciación de radares.

---

## 2. Ejecutar Pruebas Localmente

Puedes correr toda la suite de pruebas localmente mediante los siguientes comandos:

*   Desde la raíz del repositorio:
    ```bash
    pnpm test
    ```
*   Directamente desde la subcarpeta `web`:
    ```bash
    pnpm --dir web run test
    ```
*   Generar cobertura de pruebas (Coverage):
    ```bash
    pnpm --dir web run coverage
    ```

---

## 3. Integración Continua (CI)

El repositorio incluye flujos de trabajo automatizados con **GitHub Actions** configurados en [`.github/workflows/ci.yml`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/.github/workflows/ci.yml). En cada Pull Request o inserción en la rama de trabajo principal, se ejecutan automáticamente los siguientes pasos:

1.  Instalación del gestor de paquetes `pnpm` y resolución de dependencias.
2.  Análisis de formato con `Prettier` y linter con `ESLint`.
3.  Prueba de compilación de producción de la aplicación web (`vite build`).
4.  Ejecución completa de la suite de pruebas con Vitest.

Si cualquiera de estos pasos arroja un error, el commit/PR es marcado como fallido, protegiendo la rama principal de código roto o inestable.
