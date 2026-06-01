import type { ProgramNode, StatementNode } from '../ast';
import { buildGlobalSymbolTable } from './symbolTable';
import collectSymbols from './collector';

const KNOWN_TYPES = [
  'PokeBall',
  'SuperBall',
  'UltraBall',
  'MasterBall',
  'int',
  'float',
  'string',
  'bool',
];

export function typeCheck(program: ProgramNode) {
  const errors: string[] = [];
  const global = buildGlobalSymbolTable(program);
  const { byFunction } = collectSymbols(program);

  // check function signatures
  for (const fn of program.functions) {
    if (fn.returnType && !KNOWN_TYPES.includes(fn.returnType)) {
      errors.push(`Function ${fn.name} has unknown return type '${fn.returnType}'`);
    }
    for (const p of fn.params || []) {
      if (p.typeName && !KNOWN_TYPES.includes(p.typeName)) {
        errors.push(`Parameter ${p.name} in ${fn.name} has unknown type '${p.typeName}'`);
      }
    }

    // check calls inside body
    const fnTable = byFunction.get(fn.name);
    if (!fnTable) continue;
    const checkStmt = (stmt: StatementNode) => {
      if ((stmt as any).type === 'CallStmt') {
        const name = (stmt as any).name;
        if (!global.lookupFunction(name)) {
          errors.push(`Call to undefined function '${name}' in ${fn.name}`);
        }
      }
      // look for nested statements (if/while bodies)
      if ((stmt as any).type === 'IfStmt') {
        for (const s of (stmt as any).consequent || []) checkStmt(s);
        for (const s of (stmt as any).alternate || []) checkStmt(s);
      }
      if ((stmt as any).type === 'WhileStmt') {
        for (const s of (stmt as any).body || []) checkStmt(s);
      }
    };

    for (const s of fn.body || []) {
      checkStmt(s);
    }
  }

  return errors;
}

export default typeCheck;
