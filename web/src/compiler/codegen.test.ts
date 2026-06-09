import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { lowerProgramToIR, optimizeIR } from './ir';
import { compileIRToC } from './codegen';

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
  return compileIRToC(optimized);
}

describe('C Codegen Target', () => {
  it('compiles PUEBLO_NATAL to int main(void)', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Hola Mundo");
      }
    `;
    const cCode = compileCode(code);
    expect(cCode).toContain('#include <stdio.h>');
    expect(cCode).toContain('int main(void) {');
    expect(cCode).toContain('DICE_PROF_OAK("Hola Mundo");');
    expect(cCode).toContain('return 0;');
  });

  it('compiles PokeCode declarations to C standard variables and arrays', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA nivel EN PokeBall CON 5;
        CAPTURA precision EN SuperBall CON 85.5;
        CAPTURA nombre EN UltraBall CON "Pikachu";
        CAPTURA vivo EN MasterBall CON (1 > 0);
        EQUIPO equipo DE PokeBall CAPACIDAD 6;
      }
    `;
    const cCode = compileCode(code);
    expect(cCode).toContain('int nivel = 5;');
    expect(cCode).toContain('float precision = 85.5;');
    expect(cCode).toContain('const char* nombre = "Pikachu";');
    expect(cCode).toContain('bool vivo = true;');
    expect(cCode).toContain('int equipo[6] = {0};');
  });

  it('compiles Radars to native C pointers and operations', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA ps EN PokeBall CON 100;
        RADAR rad APUNTA_A PokeBall;
        rad = UBICACION_DE(ps);
        MIRAR_RADAR(rad) = 80;
      }
    `;
    const cCode = compileCode(code);
    expect(cCode).toContain('int* rad = NULL;');
    expect(cCode).toContain('rad = (&(ps));');
    expect(cCode).toContain('(*(rad)) = 80;');
  });

  it('compiles Mochila operations to helpers and macros', () => {
    const code = `
      PUEBLO_NATAL() {
        MOCHILA items DE PokeBall;
        GUARDAR(items, 10);
        CAPTURA sacado EN PokeBall CON SACAR(items);
        CAPTURA len EN PokeBall CON CANTIDAD_DE(items);
      }
    `;
    const cCode = compileCode(code);
    expect(cCode).toContain('Mochila_int items = { NULL, 0, 0 };');
    expect(cCode).toContain('GUARDAR(items, 10);');
    expect(cCode).toContain('int sacado = SACAR(items);');
    expect(cCode).toContain('int len = (items.size);');
  });
});
