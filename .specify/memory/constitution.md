# pikaCompiler Constitution

## Core Principles

### I. Compiler Pedagogy First
El compilador existe como herramienta académica para aprender la construcción de compiladores. Cada decisión de diseño debe priorizar claridad, trazabilidad y facilidad de explicación por encima de la optimización prematura o la complejidad innecesaria.

### II. Lenguaje Propio Con Identidad Temática
El lenguaje debe ser propio, consistente y fácil de leer, con una identidad inspirada en Pokémon solo como referencia estética y didáctica. No se deben copiar nombres, reglas o material protegido de forma literal; la temática debe servir para motivar el aprendizaje, no para ocultar ambigüedad técnica.

### III. Arquitectura En Cinco Fases
La arquitectura del compilador debe modelar explícitamente las cinco fases clásicas: análisis léxico, análisis sintáctico, análisis semántico, generación y optimización de código intermedio, y generación de código objeto. La implementación debe respetar el orden conceptual de esas fases y mantener separadas sus responsabilidades.

### IV. Mínimo Entregable De Tres Fases
Como base indispensable del proyecto, deben estar implementadas al menos tres fases completas y conectadas de extremo a extremo. La prioridad inicial es lexical, sintáctica y semántica; las fases de código intermedio y código objeto pueden incorporarse después como evolución natural del compilador.

### V. Diagnóstico Claro Y Verificable
Cada fase debe producir errores y trazas comprensibles, con información suficiente para ubicar el problema y explicar por qué ocurrió. Los mensajes deben ser deterministas, consistentes y útiles para depuración académica.

## Alcance Y Calidad

El proyecto debe mantener una separación limpia entre lexer, parser, analizador semántico, generador de IR y backend. Cada módulo debe ser testeable de forma aislada y también verificable en cadena. Las estructuras centrales del lenguaje, como tokens, AST, tabla de símbolos y tipos, deben definirse con estabilidad suficiente para evitar cambios arbitrarios entre fases.

La implementación debe favorecer ejemplos pequeños, casos de prueba reproducibles y documentación de uso orientada al aprendizaje. Cualquier optimización o extensión del lenguaje debe justificarse por valor pedagógico o por necesidad técnica del compilador.

## Flujo De Desarrollo

Toda nueva funcionalidad debe especificar primero qué fase del compilador afecta y qué artefacto produce o consume. Antes de ampliar el alcance, el equipo debe validar que la fase anterior conserva su comportamiento esperado. Las pruebas mínimas deben cubrir entrada válida, entrada inválida y un caso representativo por fase implementada.

Cuando el proyecto alcance más de tres fases, la integración entre fases será obligatoria en la validación. La meta de largo plazo es completar las cinco fases sin romper el contrato ya establecido por las tres primeras.

## Governance

Esta constitución tiene prioridad sobre guías, tareas y decisiones puntuales del proyecto. Cualquier cambio que altere la arquitectura de fases, el alcance del lenguaje o el mínimo de implementación debe actualizar este documento primero y dejar una explicación clara del motivo.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
