# Contribuir a pikaCompiler

Gracias por querer contribuir. Estas son las pautas básicas para facilitar revisión y versionado.

Branching y flujo de trabajo
- Trabaja en ramas con nombre `feature/<tema>`, `fix/<tema>` o `chore/<tema>`.
- Abre Pull Requests contra `main` desde la rama de trabajo.
- Usa commits atómicos y mensajes claros en inglés o español.

Versionado y releases
- Seguimos SemVer: `MAJOR.MINOR.PATCH`.
- Para publicar una nueva versión del subproyecto `web/`, usa:
  ```bash
  cd web
  npm version patch   # o minor/major
  git push --follow-tags
  ```

Revisiones y CI
- Los PRs ejecutan la suite de tests (GitHub Actions). No merges hasta que CI pase.

Formatea y lintea antes de commitear
- Recomendado: configurar `pre-commit` con `lint-staged` y `husky` localmente.

Reporta issues
- Abre un issue en GitHub con título claro y pasos para reproducir.
