# Aplicación Web Frontend 💻

La interfaz gráfica de **pikaCompiler** está construida sobre un stack moderno con **Vite + React + TypeScript** y está diseñada con una estética visual oscura y vibrante inspirada en la Pokédex.

---

## 1. Módulos de la Interfaz

La aplicación se divide en tres componentes visuales principales:

*   **Editor de Código (Panel Izquierdo)**: Basado en el componente Monaco Editor para React.
*   **Consola del Profesor Oak (Pestaña Derecha 1)**: Muestra diálogos interactivos del Profesor Oak que actúan como consejos y guías en caso de compilación exitosa o lista los errores detallados cuando ocurre un error.
*   **Terminal de Ejecución (Pestaña Derecha 2)**: Un emulador de terminal retro con estilo de línea de comandos UNIX que muestra la salida generada por las instrucciones del intérprete del compilador.

---

## 2. Tokenizador de Sintaxis Personalizado (Monarch)

Para mejorar la experiencia de escritura, Monaco Editor está configurado con un tokenizador personalizado para el lenguaje `pika` utilizando la API **Monarch** de Monaco:
*   Pinta de color diferenciado las palabras clave reservadas (`CAPTURA`, `EQUIPO`, `MOCHILA`, `SI_ENTRENADOR_DESAFIA`, etc.).
*   Colorea de forma distintiva las funciones incorporadas o built-ins (`DICE_PROF_OAK`, `MIRAR_RADAR`, etc.).
*   Resalta comentarios, números flotantes/enteros y cadenas de texto.

---

## 3. Web Worker de Compilación (`compiler.worker.ts`)

La compilación y ejecución de programas no corre en el hilo principal del navegador. En su lugar, se delega a un **Web Worker** en segundo plano:
*   **Hilo de UI (React)**: Captura el código escrito y lo envía al worker en respuesta al hacer clic en **"⚡ Compilar y Ejecutar"**.
*   **Hilo de Compilación (Worker)**: Corre todo el pipeline secuencialmente (lexer $\rightarrow$ parser $\rightarrow$ ast $\rightarrow$ semantics $\rightarrow$ interpreter). Retorna los resultados de la ejecución o la lista de errores encontrados.
*   **Beneficio**: Si el usuario escribe un ciclo infinito (como un bucle `MIENTRAS_TENGA_PS` mal estructurado), el navegador no se congela ni bloquea la interfaz de usuario, garantizando un rendimiento óptimo de 60 FPS.

---

## 4. Gestión de Errores e Interactividad

Cuando ocurre un error de compilación (léxico, sintáctico o semántico), la aplicación web interactúa con el editor para alertar al usuario:
1.  **Cambio de Tab automático**: La pestaña derecha cambia automáticamente a la **Terminal de Ejecución** mostrando un reporte en color rojo de los errores detectados con su línea y descripción.
2.  **Resaltados en el Código (Decoraciones)**: El editor de código resalta en color rojo translúcido el fondo de la línea que generó el error (`error-line-decoration`) y dibuja un punto rojo sólido en el margen lateral izquierdo (`error-glyph-decoration`).
3.  **Enfoque de Cursor**: Centra la pantalla del editor en la línea del primer error, posiciona el cursor y le da el foco al editor para que el desarrollador pueda corregirlo de inmediato.
4.  **Limpieza Inteligente**: Tan pronto como el usuario tipea un nuevo carácter en el editor, todos los resaltados y squiggly lines de error se limpian de inmediato para permitir una corrección limpia.
