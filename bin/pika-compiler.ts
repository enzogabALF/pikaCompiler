#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import { tokenizePokeCode } from '../web/src/compiler/lexer';
import { parser } from '../web/src/compiler/parser';
import { cstToAst } from '../web/src/compiler/ast';
import { typeCheck } from '../web/src/compiler/semantics/typeChecker';
import { lowerProgramToIR, optimizeIR } from '../web/src/compiler/ir';
import { compileIRToC } from '../web/src/compiler/codegen';

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(`⚡ PIKA COMPILER - COMPILADOR DE ESCRITORIO DE PIKACHU ⚡`);
    console.log(`Uso: pnpm pika-compile <archivo.pika> [-o <salida.c>]`);
    process.exit(1);
  }

  const sourcePath = args[0];
  let outputPath = sourcePath.replace(/\.pika$/, '.c');
  if (args[1] === '-o' && args[2]) {
    outputPath = args[2];
  }

  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: El archivo "${sourcePath}" no existe.`);
    process.exit(1);
  }

  const code = fs.readFileSync(sourcePath, 'utf-8');

  // Fase 1: Análisis Léxico
  const lexResult = tokenizePokeCode(code);
  if (lexResult.errors.length) {
    console.error("❌ Errores léxicos encontrados:");
    lexResult.errors.forEach((e) =>
      console.error(`  - [Línea ${e.line}, Columna ${e.column}] ${e.message}`)
    );
    process.exit(1);
  }

  // Fase 2: Análisis Sintáctico
  parser.input = lexResult.tokens;
  const cst = parser.program();
  if (parser.errors.length) {
    console.error("❌ Errores sintácticos encontrados:");
    parser.errors.forEach((e) => {
      const token = (e as any).token ?? (e as any).previousToken;
      console.error(
        `  - [Línea ${token?.startLine}, Columna ${token?.startColumn}] ${e.message}`
      );
    });
    process.exit(1);
  }

  // Fase 3: Análisis Semántico
  const ast = cstToAst(cst);
  const semErrors = typeCheck(ast);
  if (semErrors.length) {
    console.error("❌ Errores semánticos encontrados:");
    semErrors.forEach((e) =>
      console.error(`  - [Línea ${e.loc?.startLine ?? 1}] ${e.message}`)
    );
    process.exit(1);
  }

  // Fase 4: Generación de Código Intermedio (IR)
  const ir = lowerProgramToIR(ast);

  // Fase 5: Optimización de Código (IR Opt)
  const optimizedIr = optimizeIR(ir);

  // Fase 6: Generación de Código Objeto (C Code)
  const cCode = compileIRToC(optimizedIr);

  // Escribir archivo final
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, cCode, 'utf-8');

  console.log(`⚡ ¡Pika-Compilado con éxito! Código C guardado en: ${outputPath}`);
}

main();
