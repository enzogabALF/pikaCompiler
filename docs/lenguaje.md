# Referencia del Lenguaje PokeCode (.pika) 📝

El lenguaje **PokeCode** (archivos `.pika`) es un lenguaje tipado, estructurado y educativo diseñado bajo la metáfora de un entrenador Pokémon que programa su aventura.

---

## 1. Sistema de Tipos (Poké Balls)

Las variables y estructuras deben declararse utilizando clases de Poké Balls, que equivalen a tipos nativos:

*   **`PokeBall`** $\rightarrow$ Números enteros (`int`).
*   **`SuperBall`** $\rightarrow$ Números de punto flotante (`float`).
*   **`UltraBall`** $\rightarrow$ Cadenas de caracteres (`string`/`const char*`).
*   **`MasterBall`** $\rightarrow$ Valores lógicos booleanos (`bool` / `true` o `false`).

---

## 2. Declaración de Estructuras y Variables

### Variables Simples (`CAPTURA`)
Declara una variable asignándole un valor y tipo inicial obligatorio.
```pika
CAPTURA nivel EN PokeBall CON 5;
CAPTURA ratio EN SuperBall CON 0.75;
CAPTURA nombre EN UltraBall CON "Pikachu";
CAPTURA capturado EN MasterBall CON true;
```

### Vectores Estáticos (`EQUIPO`)
Permite definir arreglos estáticos. Su capacidad de almacenamiento debe estar acotada **entre 1 y 6 elementos**, cumpliendo con la regla del límite del equipo de un entrenador.
```pika
EQUIPO party DE PokeBall CAPACIDAD 3;
party[0] = 45;
party[1] = 50;
party[2] = 55;
```

### Pilas Dinámicas (`MOCHILA`)
Representa colecciones dinámicas de tipo pila (LIFO). Soporta operaciones nativas integradas:
*   `GUARDAR(mochila, valor);` $\rightarrow$ Inserta un elemento compatible en la mochila.
*   `SACAR(mochila)` $\rightarrow$ Extrae y devuelve el último elemento de la mochila.
*   `CANTIDAD_DE(mochila)` $\rightarrow$ Devuelve el número de elementos guardados en la mochila.
```pika
MOCHILA bolsa DE PokeBall;
GUARDAR(bolsa, 10);
CAPTURA item EN PokeBall CON SACAR(bolsa);
```

### Radares / Punteros (`RADAR`)
Permite instanciar punteros para referenciar directamente variables en memoria.
*   `radar = UBICACION_DE(variable);` $\rightarrow$ Almacena la dirección de memoria.
*   `MIRAR_RADAR(radar) = valor;` $\rightarrow$ Modifica directamente el valor de la variable a la que apunta el radar.
```pika
CAPTURA ps EN PokeBall CON 80;
RADAR mi_radar APUNTA_A PokeBall;

mi_radar = UBICACION_DE(ps);
MIRAR_RADAR(mi_radar) = 100; // Modifica 'ps' a 100
```

---

## 3. Declaración de Funciones

*   **Función Principal (`PUEBLO_NATAL`)**: Es la puerta de entrada del programa. No recibe argumentos y equivale a la función `main` en C.
    ```pika
    PUEBLO_NATAL() {
      DICE_PROF_OAK("¡Hola Pueblo Paleta!");
    }
    ```
*   **Funciones Auxiliares (`MOVIMIENTO`)**: Subrutinas que pueden tener parámetros y tipo de retorno:
    ```pika
    MOVIMIENTO daño_efectivo(base: SuperBall, multiplicador: SuperBall) RETORNA SuperBall {
      RETORNA base * multiplicador;
    }
    ```

---

## 4. Control de Flujo

### Condicional (`SI_ENTRENADOR_DESAFIA` y `SINO`)
Estructura condicional equivalente a `if / else`.
```pika
SI_ENTRENADOR_DESAFIA (vida < 20) {
  DICE_PROF_OAK("¡Alerta de salud!");
} SINO {
  DICE_PROF_OAK("Continuar combate.");
}
```

### Ciclos (`MIENTRAS_TENGA_PS`)
Bucle condicional equivalente a `while`.
```pika
MIENTRAS_TENGA_PS (vida > 0) {
  vida = vida - 10;
}
```

---

## 5. Funciones Incorporadas (Built-ins)

*   `DICE_PROF_OAK(valor)`: Imprime en consola/pantalla el valor del argumento provisto.
*   `OAK_PREGUNTA(mensaje)`: Imprime un mensaje en consola y solicita una entrada entera del usuario.
*   `UBICACION_DE(variable)`: Devuelve el puntero de dirección de memoria.
*   `MIRAR_RADAR(radar)`: Devuelve o asigna el valor desreferenciado.
*   `DEVOLVER_A_LA_BALL(radar)`: Libera o devuelve al puntero (restringido únicamente dentro de funciones `MOVIMIENTO`).
