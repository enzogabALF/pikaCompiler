# Feature Specification: Lenguaje PokeCompiler

**Feature Branch**: `001-pokemon-compiler-language`  
**Created**: 2026-05-30  
**Status**: Draft  
**Input**: User description: "Diseñar un compilador con lenguaje propio de temática Pokémon para uso académico, con al menos 3 fases implementadas y un objetivo total de 5 fases"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escribir programas básicos del lenguaje (Priority: P1)

Como estudiante, quiero escribir programas usando palabras reservadas temáticas y tipos base del lenguaje para expresar variables, condicionales, ciclos y funciones, de modo que pueda aprender la estructura de un compilador con ejemplos cercanos y legibles.

**Why this priority**: Es la base del lenguaje y permite validar la experiencia principal del proyecto: expresar lógica simple con sintaxis propia.

**Independent Test**: Puede validarse compilando un programa pequeño con declaraciones, un condicional, un ciclo y una función con retorno.

**Acceptance Scenarios**:

1. **Given** un programa que usa `PokeBall`, `SuperBall`, `UltraBall` y `MasterBall`, **When** se analiza, **Then** el lenguaje reconoce los tipos como equivalentes a entero, flotante, caracter y booleano.
2. **Given** una estructura `SI_ENTRENADOR_DESAFIA` con bloque `SINO`, **When** el programa es válido, **Then** el compilador acepta la rama condicional y permite el flujo alterno.
3. **Given** una función declarada con `MOVIMIENTO nombre(parametro) { ... }`, **When** contiene `DEVOLVER_A_LA_BALL [valor]`, **Then** el compilador acepta el retorno como parte de la función.

---

### User Story 2 - Trabajar con colecciones temáticas (Priority: P2)

Como estudiante, quiero representar el equipo Pokémon y la mochila con estructuras distintas, para aprender la diferencia entre arreglos de tamaño fijo y listas dinámicas.

**Why this priority**: Enseña estructuras de datos clave y introduce restricciones útiles del compilador.

**Independent Test**: Puede validarse declarando un `EQUIPO` con capacidad permitida y una `MOCHILA` con inserciones y extracciones.

**Acceptance Scenarios**:

1. **Given** una declaración `EQUIPO mis_niveles DE PokeBall CAPACIDAD 3;`, **When** se asignan valores por índice, **Then** el compilador acepta el acceso indexado.
2. **Given** una declaración `EQUIPO` con capacidad mayor a 6, **When** se valida, **Then** el compilador emite un error indicando que no se puede llevar más de 6 Pokémon en el equipo.
3. **Given** una declaración `MOCHILA objetos_curativos DE UltraBall;`, **When** se usan operaciones de guardar y sacar, **Then** el compilador trata la estructura como dinámica.

---

### User Story 3 - Leer, mostrar y referenciar valores (Priority: P3)

Como estudiante, quiero capturar entrada, imprimir mensajes y trabajar con referencias, para observar cómo circulan los datos durante la ejecución del programa.

**Why this priority**: Completa el recorrido de datos más visible para aprendizaje y depuración.

**Independent Test**: Puede validarse con un programa que capture un valor, lo muestre y lo modifique a través de una referencia o radar.

**Acceptance Scenarios**:

1. **Given** una instrucción `CAPTURA mi_nivel EN PokeBall CON 0;`, **When** se solicita información al usuario, **Then** el valor capturado se puede usar en expresiones posteriores.
2. **Given** una llamada `DICE_PROF_OAK(valor);`, **When** el programa se ejecuta, **Then** el lenguaje produce salida en consola usando el nombre temático definido por el usuario como `print`.
3. **Given** una variable referenciada mediante `RADAR` y `UBICACION_DE(...)`, **When** la referencia se actualiza, **Then** el valor original reflejará el cambio.

---

### Edge Cases

- Declarar un `EQUIPO` con capacidad negativa o con capacidad superior a 6.
- Usar un índice fuera de rango en un `EQUIPO`.
- Invocar `DEVOLVER_A_LA_BALL` fuera de una función `MOVIMIENTO`.
- Escribir palabras reservadas en minúsculas, mayúsculas o con espacios inconsistentes.
- Intentar usar `MOCHILA` con una operación que no corresponda a su naturaleza dinámica.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El lenguaje MUST definir los tipos base temáticos `PokeBall`, `SuperBall`, `UltraBall` y `MasterBall` como equivalentes a entero, flotante, caracter y booleano.
- **FR-002**: El lenguaje MUST mapear las palabras reservadas de control de flujo `SI_ENTRENADOR_DESAFIA`, `SINO`, `MIENTRAS_TENGA_PS` y `REPETIR_COMBATE` a estructuras condicionales y cíclicas reconocibles.
- **FR-003**: El lenguaje MUST permitir declaraciones de funciones con la forma `MOVIMIENTO nombre(parametros) { ... }`.
- **FR-004**: El lenguaje MUST permitir retornos con la forma `DEVOLVER_A_LA_BALL [valor]` dentro de funciones válidas.
- **FR-005**: El lenguaje MUST permitir declaraciones de `EQUIPO [nombre] DE [TipoBall] CAPACIDAD [Número];` como colección de tamaño fijo.
- **FR-006**: El compilador MUST rechazar cualquier `EQUIPO` cuya capacidad supere 6 y emitir un mensaje de error claro sobre el límite máximo de Pokémon.
- **FR-007**: El lenguaje MUST permitir acceso por índice a los elementos de un `EQUIPO`.
- **FR-008**: El lenguaje MUST permitir declaraciones de `MOCHILA [nombre] DE [TipoBall];` como colección dinámica.
- **FR-009**: El lenguaje MUST exponer operaciones para agregar y extraer elementos de la `MOCHILA`.
- **FR-010**: El lenguaje MUST permitir captura de datos con `CAPTURA [variable] EN [TipoBall] CON [valor_inicial];`.
- **FR-011**: El lenguaje MUST permitir impresión de valores mediante la palabra reservada temática `DICE_PROF_OAK`.
- **FR-012**: El lenguaje MUST permitir referencias o punteros educativos mediante `RADAR`, `APUNTA_A`, `UBICACION_DE` y `MIRAR_RADAR`.
- **FR-013**: El compilador MUST soportar un bloque principal de ejecución para iniciar el programa, usando una forma reconocible como `PUEBLO_NATAL() { ... }` o equivalente.
- **FR-014**: El compilador MUST implementar al menos tres fases completas y conectadas de extremo a extremo.
- **FR-015**: El compilador MUST priorizar inicialmente análisis léxico, análisis sintáctico y análisis semántico como el conjunto mínimo entregable.
- **FR-016**: El proyecto SHOULD dejar preparadas la generación y optimización de código intermedio y la generación de código objeto como fases posteriores del mismo lenguaje.

### Key Entities *(include if feature involves data)*

- **TipoBall**: Representa el conjunto de tipos base del lenguaje y su correspondencia semántica.
- **Token**: Unidad léxica emitida por el análisis léxico para palabras reservadas, identificadores, literales y símbolos.
- **AST**: Estructura sintáctica del programa que representa declaraciones, expresiones, bloques y funciones.
- **Símbolo**: Entrada de la tabla de símbolos que relaciona nombres con tipo, alcance y restricciones.
- **Equipo**: Colección de tamaño fijo con límite máximo de 6 elementos.
- **Mochila**: Colección dinámica para almacenar elementos sin límite fijo predefinido.
- **Radar**: Referencia educativa a una ubicación de memoria o valor compartido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un programa de ejemplo con tipos, condicionales, ciclo y función se reconoce correctamente en menos de 1 segundo en un entorno local de desarrollo.
- **SC-002**: El compilador identifica y reporta de forma clara al menos 95% de los errores de sintaxis definidos por la gramática base del lenguaje.
- **SC-003**: Un estudiante puede explicar el flujo de una sentencia desde caracteres de entrada hasta AST válido usando un ejemplo del lenguaje sin necesitar cambios al diseño base.
- **SC-004**: Al menos 3 fases del compilador quedan funcionales y conectadas antes de considerar la versión académica inicial como lista.
- **SC-005**: Las restricciones del `EQUIPO` y el comportamiento dinámico de `MOCHILA` pueden demostrarse con ejemplos reproducibles de inicio a fin.

## Assumptions

- El lenguaje está orientado a fines académicos y demostrativos, no a producción.
- La estética Pokémon se usa como tema pedagógico y no implica uso de material protegido.
- El término `MasterBall` representa un valor booleano en la propuesta del lenguaje.
- El bloque `PUEBLO_NATAL` se considera la forma de entrada del programa o su equivalente conceptual mientras se formaliza la gramática.
- La prioridad de entrega inicial es completar las fases léxica, sintáctica y semántica antes de abordar generación de código intermedio y código objeto.
