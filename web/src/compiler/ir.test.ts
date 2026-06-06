import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { lowerProgramToIR, optimizeIR } from './ir';

function parseProgram(code: string) {
  const lexResult = PokeLexer.tokenize(code);
  if (lexResult.errors.length) {
    throw new Error(`Lex errors: ${JSON.stringify(lexResult.errors)}`);
  }
  parser.input = lexResult.tokens;
  const cst = parser.program();
  if (parser.errors.length) {
    throw new Error(`Parse errors: ${JSON.stringify(parser.errors)}`);
  }
  return cstToAst(cst);
}

describe('IR lowering', () => {
  it('lowers declarations, calls and control flow into IR', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        CAPTURA x EN PokeBall CON 1 + 2;
        NO_EXISTE(x);
        SI_ENTRENADOR_DESAFIA (x > 0) {
          RETORNA x;
        }
      }
    `);

    const ir = lowerProgramToIR(program);

    expect(ir).toMatchObject({
      type: 'IRProgram',
      functions: [
        {
          type: 'IRFunction',
          name: 'PUEBLO_NATAL',
          body: [
            {
              type: 'IRDeclare',
              kind: 'CAPTURE',
              name: 'x',
              value: {
                type: 'IRBinary',
                op: '+',
              },
            },
            {
              type: 'IRCall',
              name: 'NO_EXISTE',
              args: [{ type: 'IRLValueExpr' }],
            },
            {
              type: 'IRIf',
              consequent: [{ type: 'IRReturn' }],
            },
          ],
        },
      ],
    });
  });
});

describe('IR constant folding optimization', () => {
  it('simplifica sumas, multiplicaciones y comparaciones constantes', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        CAPTURA calculo EN PokeBall CON 5 + 3 * 2;
        CAPTURA comparacion EN MasterBall CON (10 > 5) == (2 < 1);
      }
    `);

    const rawIr = lowerProgramToIR(program);
    const opt = optimizeIR(rawIr);

    expect(opt.functions[0].body[0]).toMatchObject({
      type: 'IRDeclare',
      name: 'calculo',
      value: {
        type: 'IRLiteral',
        value: 11,
        valueType: 'int',
      },
    });

    expect(opt.functions[0].body[1]).toMatchObject({
      type: 'IRDeclare',
      name: 'comparacion',
      value: {
        type: 'IRLiteral',
        value: false,
        valueType: 'bool',
      },
    });
  });

  it('simplifica identidades algebraicas y elimina código muerto', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        CAPTURA x EN PokeBall CON 5;
        CAPTURA y EN PokeBall CON x + 0;
        CAPTURA z EN PokeBall CON x * 1;
        CAPTURA w EN PokeBall CON x * 0;
        
        SI_ENTRENADOR_DESAFIA (10 > 5) {
          x = 10;
        } SINO {
          x = 20;
        }

        SI_ENTRENADOR_DESAFIA (2 < 1) {
          y = 30;
        }
      }
    `);

    const rawIr = lowerProgramToIR(program);
    const opt = optimizeIR(rawIr);

    // x + 0 -> x (IRLValueExpr)
    expect(opt.functions[0].body[1]).toMatchObject({
      type: 'IRDeclare',
      name: 'y',
      value: { type: 'IRLValueExpr' },
    });

    // x * 1 -> x (IRLValueExpr)
    expect(opt.functions[0].body[2]).toMatchObject({
      type: 'IRDeclare',
      name: 'z',
      value: { type: 'IRLValueExpr' },
    });

    // x * 0 -> 0 (IRLiteral)
    expect(opt.functions[0].body[3]).toMatchObject({
      type: 'IRDeclare',
      name: 'w',
      value: { type: 'IRLiteral', value: 0 },
    });

    // SI_ENTRENADOR_DESAFIA (true) { x = 10; } SINO { x = 20; }
    // should flatten to just x = 10;
    expect(opt.functions[0].body[4]).toMatchObject({
      type: 'IRAssign',
      target: { type: 'IRVarTarget', name: 'x' },
      value: { type: 'IRLiteral', value: 10 },
    });

    // SI_ENTRENADOR_DESAFIA (false) { y = 30; }
    // should be completely removed, so body size is 5
    expect(opt.functions[0].body).toHaveLength(5);
  });

  it('lowers Mochila operations into IR', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        MOCHILA m DE PokeBall;
        GUARDAR(m, 10);
        CAPTURA x EN PokeBall CON SACAR(m);
        CAPTURA y EN PokeBall CON CANTIDAD_DE(m);
      }
    `);
    const ir = lowerProgramToIR(program);
    expect(ir.functions[0].body[1]).toMatchObject({
      type: 'IRMochilaPush',
      name: 'm',
      value: { type: 'IRLiteral', value: 10 },
    });
    expect(ir.functions[0].body[2]).toMatchObject({
      type: 'IRDeclare',
      name: 'x',
      value: {
        type: 'IRMochilaPop',
        mochilaName: 'm',
      },
    });
    expect(ir.functions[0].body[3]).toMatchObject({
      type: 'IRDeclare',
      name: 'y',
      value: {
        type: 'IRMochilaLength',
        mochilaName: 'm',
      },
    });
  });
});
