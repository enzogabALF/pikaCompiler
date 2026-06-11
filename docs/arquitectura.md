# Arquitectura Interna del Compilador 🏛️

El núcleo del compilador **pikaCompiler** está escrito en TypeScript y estructurado en **5 fases modulares** clásicas conectadas end-to-end, ubicadas en [`web/src/compiler/`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/web/src/compiler).

---

## 1. Fase 1: Análisis Léxico (`lexer.ts`)
*   **Biblioteca**: Implementado sobre **Chevrotain Parser**.
*   **Función**: Convierte el código fuente en texto plano en un flujo estructurado de Tokens.
*   **Especificación de Tokens**:
    *   **Identificadores**: Letras, números y guiones bajos (`_`), sin comenzar con un dígito.
    *   **Palabras Clave (Keywords)**: `PUEBLO_NATAL`, `MOVIMIENTO`, `CAPTURA`, `EN`, `CON`, `EQUIPO`, `DE`, `CAPACIDAD`, `MOCHILA`, `SI_ENTRENADOR_DESAFIA`, `SINO`, `MIENTRAS_TENGA_PS`, `RADAR`, `APUNTA_A`, `RETORNA`.
    *   **Tipos de Contenedor**: `PokeBall`, `SuperBall`, `UltraBall`, `MasterBall`.
    *   **Operaciones Especiales**: `MIRAR_RADAR`, `DEVOLVER_A_LA_BALL`, `GUARDAR`, `SACAR`, `CANTIDAD_DE`.
*   **Errores**: Si hay símbolos no permitidos (ej. `@`, `$`), se reporta un error léxico con la coordenada de línea y columna.

---

## 2. Fase 2: Análisis Sintáctico y Generación del AST (`parser.ts`, `ast.ts`)
*   **Parser (`parser.ts`)**: Define las reglas gramaticales en notación EBNF mediante un parser por descenso recursivo. Genera un Árbol de Sintaxis Concreta (CST).
*   **Visitor AST (`ast.ts`)**: Implementa la clase `PokeCstVisitor` que hereda del visitante base de Chevrotain. Recorre recursivamente los nodos del CST y los reduce a un **Árbol de Sintaxis Abstracta (AST)** tipado bajo interfaces estructuradas de TypeScript (ej. `ProgramNode`, `FunctionDeclNode`, `BinOpNode`).

---

## 3. Fase 3: Análisis Semántico (`semantics/`)
Se divide en tres submódulos:
*   **Tabla de Símbolos (`symbolTable.ts`)**: Estructura de árbol para almacenar identificadores de variables y funciones por ámbitos (scopes), permitiendo búsquedas recursivas desde el ámbito actual hacia los padres.
*   **Recolector de Símbolos (`collector.ts`)**: Realiza una primera pasada sobre el AST de cada función, registrando parámetros, variables declaradas (`CAPTURA`), arreglos (`EQUIPO`), pilas (`MOCHILA`) y radares (`RADAR`) en sus respectivas tablas.
*   **Chequeador de Tipos (`typeChecker.ts`)**: Valida que el código cumpla con las reglas lógicas del lenguaje:
    *   Compatibilidad de tipos en asignaciones y comparaciones (ej. permitiendo la promoción implícita de `int` $\rightarrow$ `float` / `PokeBall` $\rightarrow$ `SuperBall`).
    *   Valida la capacidad de arreglos `EQUIPO` (debe estar entre 1 y 6).
    *   Verificación en tiempo de compilación de desbordamiento de índices en arreglos si el índice es un entero literal.
    *   Comprobación de que `DEVOLVER_A_LA_BALL` solo se use dentro de funciones marcadas con el tipo de función `MOVIMIENTO`.

---

## 4. Fase 4: Representación Intermedia y Optimización (`ir.ts`)
El AST validado se aplana y transforma en un árbol simplificado llamado `IRProgram`:
*   **Plegado de Constantes (Constant Folding)**: Evalúa en tiempo de compilación expresiones compuestas enteramente por literales (ej. `3 + 5 * 2` se simplifica directamente al nodo literal `13`).
*   **Simplificación Algebraica**: Simplifica identidades aritméticas redundantes:
    *   `x + 0` $\rightarrow$ `x`
    *   `x - 0` $\rightarrow$ `x`
    *   `x * 1` $\rightarrow$ `x`
    *   `x * 0` $\rightarrow$ `0` (literal 0)
*   **Eliminación de Código Muerto (DCE)**: Si un condicional `SI_ENTRENADOR_DESAFIA` contiene una condición que se pliega a un literal booleano constante (`true` o `false`), remueve la bifurcación condicional y conserva solo el bloque inalcanzable de código para aligerar la ejecución.

---

## 5. Fase 5: Generación de Código C (`codegen.ts`)
Traduce la IR optimizada a un archivo C estándar (compatible con C11):
*   **Mapeo de Tipos**: Traduce las Poké Balls a tipos nativos en C (`int`, `float`, `const char*`, `bool`).
*   **Mochila Dinámica**: Genera estructuras y funciones auxiliares en C (`Mochila_int`, `Mochila_float`, etc.) con realocación dinámica de memoria mediante `realloc`.
*   **Polimorfismo en C11 (`_Generic`)**: Genera macros de selección genérica para implementar las funciones incorporadas del lenguaje:
    *   `DICE_PROF_OAK(X)`: Llama a la función de impresión correcta (`print_int`, `print_float`, etc.) dependiendo del tipo del argumento evaluado.
    *   `GUARDAR(M, V)` y `SACAR(M)`: Selecciona la función correcta de empuje/extracción dinámica de la mochila correspondiente.
*   **Punteros**: Compila radares nativos utilizando referencias (`&`) y desreferenciaciones (`*`) en C.
