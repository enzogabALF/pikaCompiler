# Guía de Instalación y Configuración ⚙️

Esta guía detalla los requisitos previos y el proceso paso a paso para configurar tu entorno local y poner en marcha el proyecto **pikaCompiler**.

---

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema operativo:

*   **Node.js**: Se recomienda la versión `>= 18 < 19` (el compilador y las herramientas también han sido probadas en Node v20 y v22).
*   **pnpm**: Gestor de paquetes oficial del monorrepisitorio (`>= 8.0` es requerido). Puedes instalarlo globalmente ejecutando:
    ```bash
    npm install -g pnpm
    ```
*   **Git**: Utilizado para control de versiones y la orquestación de githooks locales.
*   **Compilador de C** *(Opcional)*: Como `gcc` (MinGW en Windows) o `clang` si deseas compilar y ejecutar de forma nativa los archivos de código fuente en C (`.c`) generados por el compilador.

---

## 2. Configuración Paso a Paso

Sigue estos pasos en tu terminal para preparar el repositorio:

### Paso 1: Clonar el Repositorio
Clona el repositorio desde tu plataforma de control de versiones y navega a la carpeta del proyecto:
```bash
git clone <url-del-repositorio> pikaCompiler
cd pikaCompiler
```

### Paso 2: Instalar Dependencias del Workspace
Instala todas las dependencias requeridas tanto para la aplicación web (frontend) como para el CLI y herramientas globales:
```bash
pnpm install
```
Este comando resolverá y enlazará las dependencias utilizando el archivo `pnpm-lock.yaml` en la raíz del proyecto.

### Paso 3: Configurar Githooks locales
Para garantizar que se mantenga el formato y la calidad de código en cada commit, configura los githooks locales del paquete web corriendo:
```bash
pnpm --dir web run prepare
```
Esto instalará y configurará **Husky**, asegurando que los hooks de formateo (`Prettier`) y análisis estático (`ESLint`) corran antes de registrar cada commit.

---

## 3. Estructura de Directorios Clave

*   [`/bin`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/bin): Contiene el script ejecutable del compilador de línea de comandos.
*   [`/docs`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/docs): Directorio de especificaciones y guías del compilador.
*   [`/examples`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/examples): Ejemplos prácticos de código en PokeCode (`.pika`).
*   [`/web`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/web): Aplicación web React (Vite + Monaco Editor + Web Worker).
    *   [`/web/src/compiler`](file:///c:/Users/Usuario/OneDrive/Desktop/Compilador%20y%20lenguaje/pikaCompiler/web/src/compiler): Archivos fuentes del compilador e intérprete (lexer, parser, AST, semantics, IR, codegen, interpreter).
