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
});
