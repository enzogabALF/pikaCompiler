import { describe, it, expect } from 'vitest';
import { PokeLexer } from '../lexer';
import { parser } from '../parser';
import { cstToAst } from '../ast';
import { buildGlobalSymbolTable } from './symbolTable';
import { collectSymbols } from './collector';
import { typeCheck } from './typeChecker';
import type { ProgramNode } from '../ast';

function parseProgram(code: string): ProgramNode {
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

describe('semantics - symbol table', () => {
  it('builds symbol table and finds functions', () => {
    const program: ProgramNode = {
      type: 'Program',
      functions: [
        {
          type: 'FunctionDecl',
          kind: 'MOVIMIENTO',
          name: 'm1',
          params: [],
          body: [],
        },
      ],
    };
    const table = buildGlobalSymbolTable(program);
    expect(table.lookupFunction('m1')).toBeDefined();
  });

  it('throws on duplicate functions', () => {
    const dupProgram: ProgramNode = {
      type: 'Program',
      functions: [
        { type: 'FunctionDecl', kind: 'MOVIMIENTO', name: 'm1', params: [], body: [] },
        { type: 'FunctionDecl', kind: 'MOVIMIENTO', name: 'm1', params: [], body: [] },
      ],
    };
    expect(() => buildGlobalSymbolTable(dupProgram)).toThrow();
  });

  it('collects local variables in function scope', () => {
    const program: ProgramNode = {
      type: 'Program',
      functions: [
        {
          type: 'FunctionDecl',
          kind: 'MOVIMIENTO',
          name: 'f',
          params: [{ type: 'Parameter', name: 'p', typeName: 'PokeBall' }],
          body: [
            {
              type: 'CaptureDecl',
              name: 'x',
              typeName: 'int',
              value: { type: 'Literal', value: 1, valueType: 'int' },
            },
          ],
        },
      ],
    };

    const { byFunction } = collectSymbols(program);
    const table = byFunction.get('f');
    expect(table).toBeDefined();
    expect(table?.lookupVar('p')).not.toBeUndefined();
    expect(table?.lookupVar('x')).not.toBeUndefined();
  });

  it('reports undefined function calls', () => {
    const program: ProgramNode = {
      type: 'Program',
      functions: [
        {
          type: 'FunctionDecl',
          kind: 'MOVIMIENTO',
          name: 'f',
          params: [],
          body: [
            {
              type: 'CallStmt',
              name: 'nope',
              args: [],
            },
          ],
        },
      ],
    };

    const errors = typeCheck(program);
    expect(errors.some((e) => e.message.includes("undefined function 'nope'"))).toBe(true);
  });

  it('reports unknown parameter types', () => {
    const program: ProgramNode = {
      type: 'Program',
      functions: [
        {
          type: 'FunctionDecl',
          kind: 'MOVIMIENTO',
          name: 'f',
          params: [{ type: 'Parameter', name: 'p', typeName: 'WeirdType' }],
          body: [],
        },
      ],
    };

    const errors = typeCheck(program);
    expect(errors.some((e) => e.message.includes('unknown type'))).toBe(true);
  });

  it('reports unknown return types', () => {
    const program: ProgramNode = {
      type: 'Program',
      functions: [
        {
          type: 'FunctionDecl',
          kind: 'MOVIMIENTO',
          name: 'f',
          params: [],
          returnType: 'NoType',
          body: [],
        },
      ],
    };

    const errors = typeCheck(program);
    expect(errors.some((e) => e.message.includes('unknown return type'))).toBe(true);
  });

  it('reports undefined variable locations from parsed code', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        x = 1;
      }
    `);

    const errors = typeCheck(program);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("undefined symbol 'x'");
    expect(errors[0].loc).toMatchObject({
      startLine: 3,
      startColumn: 9,
      endLine: 3,
      endColumn: 9,
    });
  });

  it('reports undefined function call locations from parsed code', () => {
    const program = parseProgram(`
      PUEBLO_NATAL() {
        NO_EXISTE();
      }
    `);

    const errors = typeCheck(program);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("undefined function 'NO_EXISTE'");
    expect(errors[0].loc).toMatchObject({
      startLine: 3,
      startColumn: 9,
    });
  });
});
