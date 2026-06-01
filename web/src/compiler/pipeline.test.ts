import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { typeCheck } from './semantics/typeChecker';
import { lowerProgramToIR } from './ir';

function compile(code: string) {
  const lexResult = PokeLexer.tokenize(code);
  expect(lexResult.errors).toHaveLength(0);

  parser.input = lexResult.tokens;
  const cst = parser.program();
  expect(parser.errors).toHaveLength(0);

  const ast = cstToAst(cst);
  const semanticErrors = typeCheck(ast);
  expect(semanticErrors).toHaveLength(0);

  const ir = lowerProgramToIR(ast);
  return { ast, ir };
}

describe('compiler pipeline', () => {
  it('compiles a representative program end to end', () => {
    const { ast, ir } = compile(`
      PUEBLO_NATAL() {
        CAPTURA inicial EN PokeBall CON 1;
        EQUIPO equipo_de_inicio DE SuperBall CAPACIDAD 3;
        MOCHILA mochila_general DE UltraBall;
        RADAR radar_principal APUNTA_A MasterBall;
        SI_ENTRENADOR_DESAFIA (inicial < 10) {
          CAPTURA bonus EN PokeBall CON inicial + 1;
        } SINO {
          RETORNA inicial;
        }
        MIENTRAS_TENGA_PS (inicial > 0) {
          inicial = inicial - 1;
        }
        RETORNA inicial;
      }

      MOVIMIENTO Curar(mi_poke: PokeBall) RETORNA PokeBall {
        RETORNA mi_poke;
      }
    `);

    expect(ast.functions).toHaveLength(2);
    expect(ir.functions).toHaveLength(2);
    expect(ir.functions[0]).toMatchObject({
      type: 'IRFunction',
      name: 'PUEBLO_NATAL',
      body: [
        { type: 'IRDeclare', kind: 'CAPTURE', name: 'inicial' },
        { type: 'IRDeclare', kind: 'EQUIPO', name: 'equipo_de_inicio' },
        { type: 'IRDeclare', kind: 'MOCHILA', name: 'mochila_general' },
        { type: 'IRDeclare', kind: 'RADAR', name: 'radar_principal' },
        { type: 'IRIf' },
        { type: 'IRWhile' },
        { type: 'IRReturn' },
      ],
    });
  });

  it('surfaces semantic errors with locations for the full pipeline', () => {
    const lexResult = PokeLexer.tokenize(`
      PUEBLO_NATAL() {
        desconocido = 1;
      }
    `);
    expect(lexResult.errors).toHaveLength(0);

    parser.input = lexResult.tokens;
    const cst = parser.program();
    expect(parser.errors).toHaveLength(0);

    const ast = cstToAst(cst);
    const semanticErrors = typeCheck(ast);

    expect(semanticErrors).toHaveLength(1);
    expect(semanticErrors[0]).toMatchObject({
      message: expect.stringContaining("undefined symbol 'desconocido'"),
      loc: {
        startLine: 3,
        startColumn: 9,
      },
    });
  });
});
