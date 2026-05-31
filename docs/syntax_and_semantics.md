ReturnStmt ::= "RETORNA" [ Expr ] ";"

Reglas sobre `RETORNA`:
- `RETORNA expr;` devuelve `expr` desde la función actual.
- Si la función declara `RETORNA Type` en su firma, el tipo de `expr` debe ser compatible con `Type` (se permite promoción `int -> float`).
- Si la función no declara tipo de retorno, usar `RETORNA expr;` es error.
- Si la función declara un tipo de retorno pero no contiene `RETORNA`, se emite una advertencia.

FunctionDecl ::= ("PUEBLO_NATAL" | "MOVIMIENTO") "(" [ Param { "," Param } ] ")" [ "RETORNA" TYPE ] "{" { Statement } "}"

Param ::= IDENT ":" TYPE

Expr ::= ... (operadores aritméticos y comparaciones, llamadas, identificadores, literales)

5) Tipos y mapeo
# Lenguaje PikaCompiler — Sintaxis y Semántica

Resumen: lenguaje educativo inspirado en Pokemon. Objetivo del compilador: 5 fases conectadas end-to-end: léxica, sintáctica, semántica, IR/optimización y generación de código.

Fases del compilador
- Fase 1: análisis léxico.
- Fase 2: análisis sintáctico.
- Fase 3: análisis semántico.
- Fase 4: representación intermedia y optimización.
- Fase 5: generación de código objeto o backend de ejecución.

1) Elementos léxicos
- Identificadores: secuencia de letras, dígitos y _ que no comienzan con dígito. Token `IDENT`.
- Números: `INT` (sin punto) y `FLOAT` (con punto). Token `INT`/`FLOAT`.
- Cadenas: entre comillas dobles `"..."`. Token `STRING`.
- Comentarios: `// ...` y `/* ... */`.
- Tokens especiales: `LPAREN` `RPAREN` `LBRACE` `RBRACE` `LBRACKET` `RBRACKET` `COMMA` `SEMICOLON` `ASSIGN`.

2) Palabras reservadas (keywords)
- `PUEBLO_NATAL`, `MOVIMIENTO`, `CAPTURA`, `EN`, `CON`, `EQUIPO`, `DE`, `CAPACIDAD`, `MOCHILA`,
  `SI_ENTRENADOR_DESAFIA`, `SINO`, `MIENTRAS_TENGA_PS`, `RADAR`, `APUNTA_A`, `DICE_PROF_OAK`,
  `OAK_PREGUNTA`, `UBICACION_DE`, `MIRAR_RADAR`, `DEVOLVER_A_LA_BALL` (y otras similares de la API builtin).

3) Operadores
- Aritméticos: `+ - * /`.
- Comparación: `< > == != <= >=`.
- Indexing: `IDENT[EXPR]` representado internamente como `BinOp` con `op='[]'`.

4) Gramática (resumen EBNF simplificado)

Program ::= { FunctionDecl }
FunctionDecl ::= ("PUEBLO_NATAL" | "MOVIMIENTO") "(" ")" "{" { Statement } "}"

Statement ::= CaptureDecl
            | EquipoDecl
            | MochilaDecl
            | RadarDecl
            | IfStmt
            | WhileStmt
            | AssignmentStmt
            | CallStmt

CaptureDecl ::= "CAPTURA" IDENT "EN" TYPE "CON" (INT | FLOAT | STRING) ";"
EquipoDecl ::= "EQUIPO" IDENT "DE" TYPE "CAPACIDAD" INT ";"
MochilaDecl ::= "MOCHILA" IDENT "DE" TYPE ";"
RadarDecl ::= "RADAR" IDENT "APUNTA_A" TYPE ";"
IfStmt ::= "SI_ENTRENADOR_DESAFIA" "(" Expr ")" "{" { Statement } "}" [ "SINO" "{" { Statement } "}" ]
WhileStmt ::= "MIENTRAS_TENGA_PS" "(" Expr ")" "{" { Statement } "}"
AssignmentStmt ::= LValue "=" Expr ";"
CallStmt ::= IDENT "(" [ Expr { "," Expr } ] ")" ";"

Expr ::= ... (operadores aritméticos y comparaciones, llamadas, identificadores, literales)

5) Tipos y mapeo
- Tipos de contenedor declarados por palabras de tipo (PokeBall, SuperBall, UltraBall, MasterBall).
- Mapeo semántico implementado:
  - `PokeBall` -> `int`
  - `SuperBall` -> `float`
  - `UltraBall` -> `char`
  - `MasterBall` -> `bool`

6) Reglas semánticas implementadas
- Declaración: `CAPTURA name EN Type CON default;` crea variable `name` con base `Type`.
  - Se verifica que el `default` sea compatible con el tipo (int/float/string), permitiendo promoción `int -> float`.
- `EQUIPO name DE Type CAPACIDAD N;` crea array de capacidad `N`. Reglas:
  - `1 <= N <= 6`; si N>6 o N<1 se reporta error.
  - Acceso por índice `name[i]` requiere `i` entero.
  - Si `i` es literal se comprueba en tiempo de compilación que 0 <= i < N.
- `MOCHILA` crea una lista dinámica sin capacidad fija.
- `RADAR name APUNTA_A Type;` declara un radar apuntando a `Type` válido.
- Asignaciones: `LValue = Expr;` verifica compatibilidad de tipos; se permite `int -> float` promoción.
- L-values permitidos: identificadores, `ident[index]`, y ciertas llamadas que actúan como referencias (ej. `MIRAR_RADAR(rad)` y `DEVOLVER_A_LA_BALL`).
- `DEVOLVER_A_LA_BALL` sólo es legal dentro de funciones `MOVIMIENTO` (regla semántica específica).
- Uso de identificadores no declarados produce error.
- Llamadas a funciones desconocidas generan advertencia (se tratan como externas) salvo las builtins reconocidas.

7) Builtins reconocidos (firma simple)
- `OAK_PREGUNTA(string) -> int`
- `DICE_PROF_OAK(string|int|...) -> void` (imprime)
- `UBICACION_DE(x) -> int`
- `MIRAR_RADAR(radar) -> int` (puede usarse como l-value)
- `DEVOLVER_A_LA_BALL(...) -> int` (uso restringido a `MOVIMIENTO`)

8) Errores reportados por el analizador
- Duplicate declarations (mismo scope)
- Undeclared identifier
- Type mismatch en asignaciones
- Equipo capacidad fuera de rango
- Array index out of bounds (cuando índice literal)
- Default value incompatible con tipo de `CAPTURA`
- Uso ilegal de `DEVOLVER_A_LA_BALL`

9) Limitaciones actuales
- El parser aún no soporta parámetros de función; por tanto no hay comprobación de firma/params.
- No hay inferencia de tipos compleja ni sistema de tipos estructural.
- La Fase 4 (IR/optimización) todavía no existe en el worker actual.
- La Fase 5 (generación de código objeto o backend de ejecución) todavía no existe en el worker actual.

10) Cómo probar
Ejecutar:
```bash
python src/semantics_runner.py examples/pueblo.pika
```

11) Próximos pasos recomendados
- Añadir parsing de parámetros y tipos de retorno en `FunctionDecl`.
- Implementar comprobación de firmas y compatibilidad argumental.
- Diseñar y generar una IR estable para la Fase 4.
- Añadir un backend mínimo de salida para la Fase 5.
- Añadir pruebas unitarias en `tests/` para casos positivos y negativos.
