# Flujo de Desarrollo y Buenas Prácticas 🛠️

Esta sección describe el flujo de desarrollo del proyecto **pikaCompiler**, los comandos disponibles en el monorrepisitorio y las políticas para realizar contribuciones y commits consistentes.

---

## 1. Comandos de la Raíz del Proyecto

Desde el directorio raíz del monorrepisitorio, puedes orquestar las tareas comunes mediante `pnpm` y `TurboRepo`:

| Comando | Acción Realizada |
| :--- | :--- |
| **`pnpm dev`** | Levanta el servidor local de Vite en `http://localhost:5173`. |
| **`pnpm build`** | Compila la aplicación web generando los archivos listos para producción en `/web/dist`. |
| **`pnpm test`** | Corre todas las pruebas unitarias y e2e con Vitest de forma reactiva (modo watch). |
| **`pnpm lint`** | Realiza el análisis estático de código buscando errores tipográficos o violaciones de tipos. |
| **`pnpm format`** | Formatea el código de todo el repositorio con Prettier. |

---

## 2. Desarrollo con Commits Convencionales

El proyecto sigue el estándar de **Conventional Commits** para mantener un historial de Git limpio y permitir la generación automática de versiones. Los mensajes de commit deben seguir el siguiente formato:

```
<tipo>(<ámbito-opcional>): <descripción corta en imperativo>

[cuerpo-opcional detallando los cambios]
```

### Tipos de Commit Permitidos
*   `feat`: Nueva funcionalidad (por ejemplo, agregar soporte para una nueva Pokeball o sentencia).
*   `fix`: Solución a un error o bug en el compilador o frontend.
*   `docs`: Cambios en la documentación.
*   `style`: Cambios en el estilo de código que no afectan el significado (espacios, formateo con Prettier).
*   `refactor`: Cambio de código que no arregla un bug ni añade una función.
*   `test`: Añadir o corregir pruebas unitarias.
*   `chore`: Tareas de mantenimiento, configuración de dependencias, etc.

### Asistente de Commits
Para automatizar y validar la creación de mensajes de commit, utiliza los scripts de la raíz:
*   En PowerShell (Windows):
    ```powershell
    .\scripts\commit.ps1
    ```
*   En Bash (Linux/macOS):
    ```bash
    ./scripts/commit.sh
    ```
*   Directamente desde la subcarpeta `web/`:
    ```bash
    pnpm --dir web run commit
    ```

---

## 3. Integración con Git Hooks (Husky)

El proyecto utiliza **Husky** combinado con **lint-staged** para asegurar que no se suban archivos con errores al repositorio:
*   Al ejecutar `git commit`, Husky intercepta la acción.
*   Se ejecutan automáticamente `ESLint` y `Prettier` únicamente sobre los archivos que fueron modificados (*staged*).
*   Si se encuentran advertencias o errores del linter, el commit se detiene automáticamente para que puedas corregirlos antes de subir los cambios.
