import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { lowerProgramToIR, optimizeIR } from './ir';
import { compileIRToJS } from './codegen';

function compileCode(code: string): string {
  const lexResult = PokeLexer.tokenize(code);
  if (lexResult.errors.length) {
    throw new Error(`Lex errors: ${JSON.stringify(lexResult.errors)}`);
  }
  parser.input = lexResult.tokens;
  const cst = parser.program();
  if (parser.errors.length) {
    throw new Error(`Parse errors: ${JSON.stringify(parser.errors)}`);
  }
  const ast = cstToAst(cst);
  const ir = lowerProgramToIR(ast);
  const optimized = optimizeIR(ir);
  return compileIRToJS(optimized);
}

function runJS(compiledCode: string) {
  // We wrap code to make it return the runCompiledProgram function
  const runFn = new Function(`${compiledCode}\nreturn runCompiledProgram();`);
  return runFn();
}

describe('Target JS Codegen', () => {
  it('compiles and executes basic calculations and oak messages', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA calculo EN PokeBall CON 5 + 3 * 2;
        DICE_PROF_OAK("Calculado:");
        DICE_PROF_OAK(calculo);
        RETORNA calculo;
      }
    `;

    const compiled = compileCode(code);
    const result = runJS(compiled);

    expect(result.returnValue).toBe(11);
    expect(result.output).toEqual(['Calculado:', '11']);
  });

  it('compiles and executes Mochila dynamic operations', () => {
    const code = `
      PUEBLO_NATAL() {
        MOCHILA items DE PokeBall;
        GUARDAR(items, 10);
        GUARDAR(items, 20);
        CAPTURA len EN PokeBall CON CANTIDAD_DE(items);
        CAPTURA popped EN PokeBall CON SACAR(items);
        DICE_PROF_OAK(len);
        DICE_PROF_OAK(popped);
        DICE_PROF_OAK(CANTIDAD_DE(items));
      }
    `;

    const compiled = compileCode(code);
    const result = runJS(compiled);

    expect(result.output).toEqual(['2', '20', '1']);
  });

  it('compiles and executes Radars mutating local variables correctly', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA vida EN PokeBall CON 100;
        RADAR rad APUNTA_A PokeBall;
        rad = UBICACION_DE(vida);
        MIRAR_RADAR(rad) = 80;
        DICE_PROF_OAK(vida);
      }
    `;

    const compiled = compileCode(code);
    const result = runJS(compiled);

    expect(result.output).toEqual(['80']);
  });
});
