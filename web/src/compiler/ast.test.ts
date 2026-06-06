import { describe, it, expect } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';

function parseAndAst(code: string) {
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

describe('PokeLang Lexer, Parser and AST', () => {
  it('should parse an empty program', () => {
    const ast = parseAndAst('');
    expect(ast).toEqual({
      type: 'Program',
      functions: [],
    });
  });

  it('should parse a basic PUEBLO_NATAL declaration', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Hola");
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0]).toMatchObject({
      type: 'FunctionDecl',
      kind: 'PUEBLO_NATAL',
      name: 'PUEBLO_NATAL',
      params: [],
      body: [
        {
          type: 'CallStmt',
          name: 'DICE_PROF_OAK',
          args: [
            {
              type: 'Literal',
              value: 'Hola',
              valueType: 'string',
            },
          ],
        },
      ],
    });
  });

  it('should parse MOVIMIENTO declaration with parameters and return type', () => {
    const code = `
      MOVIMIENTO Curar(mi_poke: PokeBall, factor: SuperBall) RETORNA PokeBall {
        RETORNA mi_poke;
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0]).toMatchObject({
      type: 'FunctionDecl',
      kind: 'MOVIMIENTO',
      name: 'Curar',
      params: [
        { type: 'Parameter', name: 'mi_poke', typeName: 'PokeBall' },
        { type: 'Parameter', name: 'factor', typeName: 'SuperBall' },
      ],
      returnType: 'PokeBall',
      body: [
        {
          type: 'ReturnStmt',
          value: {
            type: 'LValueExpr',
            lvalue: {
              type: 'IdentifierLValue',
              name: 'mi_poke',
            },
          },
        },
      ],
    });
  });

  it('should parse all kinds of variable declarations', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA mi_nivel EN PokeBall CON 5;
        EQUIPO mis_pokes DE PokeBall CAPACIDAD 3;
        MOCHILA items DE UltraBall;
        RADAR rad APUNTA_A MasterBall;
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0].body).toMatchObject([
      {
        type: 'CaptureDecl',
        name: 'mi_nivel',
        typeName: 'PokeBall',
        value: { type: 'Literal', value: 5, valueType: 'int' },
      },
      {
        type: 'EquipoDecl',
        name: 'mis_pokes',
        typeName: 'PokeBall',
        capacity: { type: 'Literal', value: 3, valueType: 'int' },
      },
      {
        type: 'MochilaDecl',
        name: 'items',
        typeName: 'UltraBall',
      },
      {
        type: 'RadarDecl',
        name: 'rad',
        typeName: 'MasterBall',
      },
    ]);
  });

  it('should parse arithmetic and comparison operators with precedence', () => {
    const code = `
      PUEBLO_NATAL() {
        CAPTURA x EN PokeBall CON 2 + 3 * 4;
        CAPTURA y EN PokeBall CON (2 + 3) * 4;
        CAPTURA cond EN MasterBall CON x < y;
      }
    `;
    const ast = parseAndAst(code);

    // 2 + 3 * 4 -> left: 2, right: (3 * 4)
    expect(ast.functions[0].body[0]).toMatchObject({
      type: 'CaptureDecl',
      value: {
        type: 'BinOp',
        op: '+',
        left: { type: 'Literal', value: 2 },
        right: {
          type: 'BinOp',
          op: '*',
          left: { type: 'Literal', value: 3 },
          right: { type: 'Literal', value: 4 },
        },
      },
    });

    // (2 + 3) * 4 -> left: (2 + 3), right: 4
    expect(ast.functions[0].body[1]).toMatchObject({
      type: 'CaptureDecl',
      value: {
        type: 'BinOp',
        op: '*',
        left: {
          type: 'BinOp',
          op: '+',
          left: { type: 'Literal', value: 2 },
          right: { type: 'Literal', value: 3 },
        },
        right: { type: 'Literal', value: 4 },
      },
    });

    // x < y
    expect(ast.functions[0].body[2]).toMatchObject({
      type: 'CaptureDecl',
      value: {
        type: 'BinOp',
        op: '<',
        left: { type: 'LValueExpr', lvalue: { type: 'IdentifierLValue', name: 'x' } },
        right: { type: 'LValueExpr', lvalue: { type: 'IdentifierLValue', name: 'y' } },
      },
    });
  });

  it('should parse controls: IF and WHILE statements', () => {
    const code = `
      PUEBLO_NATAL() {
        SI_ENTRENADOR_DESAFIA (x < 5) {
          DICE_PROF_OAK("bajo");
        } SINO {
          DICE_PROF_OAK("alto");
        }
        MIENTRAS_TENGA_PS (y > 0) {
          y = y - 1;
        }
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0].body[0]).toMatchObject({
      type: 'IfStmt',
      test: { type: 'BinOp', op: '<' },
      consequent: [{ type: 'CallStmt', name: 'DICE_PROF_OAK' }],
      alternate: [{ type: 'CallStmt', name: 'DICE_PROF_OAK' }],
    });
    expect(ast.functions[0].body[1]).toMatchObject({
      type: 'WhileStmt',
      test: { type: 'BinOp', op: '>' },
      body: [{ type: 'AssignmentStmt', lvalue: { type: 'IdentifierLValue', name: 'y' } }],
    });
  });

  it('should parse special LValues like MIRAR_RADAR and DEVOLVER_A_LA_BALL', () => {
    const code = `
      PUEBLO_NATAL() {
        MIRAR_RADAR(radar) = 100;
        DEVOLVER_A_LA_BALL(poke) = 1;
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0].body).toMatchObject([
      {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'SpecialLValue',
          kind: 'MIRAR_RADAR',
          arg: { type: 'LValueExpr', lvalue: { type: 'IdentifierLValue', name: 'radar' } },
        },
        value: { type: 'Literal', value: 100 },
      },
      {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'SpecialLValue',
          kind: 'DEVOLVER_A_LA_BALL',
          arg: { type: 'LValueExpr', lvalue: { type: 'IdentifierLValue', name: 'poke' } },
        },
        value: { type: 'Literal', value: 1 },
      },
    ]);
  });

  it('should parse Mochila operations: GUARDAR, SACAR and CANTIDAD_DE', () => {
    const code = `
      PUEBLO_NATAL() {
        MOCHILA items DE PokeBall;
        GUARDAR(items, 10);
        CAPTURA item EN PokeBall CON SACAR(items);
        CAPTURA qty EN PokeBall CON CANTIDAD_DE(items);
      }
    `;
    const ast = parseAndAst(code);
    expect(ast.functions[0].body).toMatchObject([
      {
        type: 'MochilaDecl',
        name: 'items',
        typeName: 'PokeBall',
      },
      {
        type: 'MochilaGuardar',
        name: 'items',
        value: { type: 'Literal', value: 10 },
      },
      {
        type: 'CaptureDecl',
        name: 'item',
        typeName: 'PokeBall',
        value: {
          type: 'MochilaSacar',
          mochilaName: 'items',
        },
      },
      {
        type: 'CaptureDecl',
        name: 'qty',
        typeName: 'PokeBall',
        value: {
          type: 'MochilaCantidadDe',
          mochilaName: 'items',
        },
      },
    ]);
  });
});
