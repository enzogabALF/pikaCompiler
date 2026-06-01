import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { lowerProgramToIR } from './ir';

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
