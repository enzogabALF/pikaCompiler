import { describe, it, expect } from 'vitest';
import { buildGlobalSymbolTable } from './symbolTable';
import { collectSymbols } from './collector';
import { typeCheck } from './typeChecker';
import type { ProgramNode } from '../ast';

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
    expect(table!.lookupVar('p')).toBeDefined();
    expect(table!.lookupVar('x')).toBeDefined();
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
    expect(errors.some((e) => e.includes("undefined function 'nope'"))).toBe(true);
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
    expect(errors.some((e) => e.includes('unknown type'))).toBe(true);
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
    expect(errors.some((e) => e.includes('unknown return type'))).toBe(true);
  });
});
