# pikaCompiler

Compilador educativo en Python para un lenguaje temático inspirado en Pokémon. Diseñado para enseñar las fases de un compilador (léxico, sintáctico y semántico) con ejemplos y pruebas automáticas.

**Requisitos**
- Python 3.10+

**Estructura clave**
- `src/lexer.py` — tokenizador
- `src/parser.py` — parser recursivo-descendente y construcción de AST
- `src/semantics.py` — analizador semántico (scope, tipos, reglas)
- `src/parser_runner.py`, `src/semantics_runner.py`, `src/compile.py` — runners de línea de comandos
- `examples/` — programas de ejemplo
- `tests/` — pruebas unitarias ejecutadas con `unittest`

Uso rápido

- Ejecutar análisis semántico sobre un ejemplo:
```bash
python src/semantics_runner.py examples/pueblo.pika
```

- Imprimir AST de un ejemplo:
```bash
python src/parser_runner.py examples/pueblo.pika --ast
```

- Ejecutar la suite de tests localmente:
```bash
python -m unittest discover -v
```

Integración continua
- Se agregó un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta los tests en pushes y PRs.

Contribuir
- Abre un issue o PR en la rama `001-pokemon-compiler-language` para propuestas o fixes.

Limitaciones y próximos pasos
- Actualmente implementadas: análisis léxico, sintáctico y semántico con reglas temáticas.
- Pendiente: representación intermedia (IR) y generación de código objeto.

Contacto
- Autor: enzogabALF
- Autor:
- Autor: