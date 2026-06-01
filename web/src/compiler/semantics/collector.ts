import { ProgramNode } from '../ast';
import SymbolTable from './symbolTable';

export function collectSymbols(program: ProgramNode) {
  const global = SymbolTable.prototype ? new SymbolTable() : new SymbolTable();
  const byFunction: Map<string, SymbolTable> = new Map();

  for (const fn of program.functions) {
    const fnTable = new SymbolTable(global);
    // params
    for (const p of fn.params || []) {
      fnTable.defineVar({ name: p.name, typeName: p.typeName });
    }
    // scan body for declarations
    for (const stmt of fn.body || []) {
      // we only care about declarations that introduce names
      if ((stmt as any).type === 'CaptureDecl') {
        const s = stmt as any;
        fnTable.defineVar({ name: s.name, typeName: s.typeName });
      } else if ((stmt as any).type === 'EquipoDecl') {
        const s = stmt as any;
        // capture capacity when it's a literal integer
        const cap =
          s.capacity && s.capacity.type === 'Literal' && s.capacity.valueType === 'int'
            ? Number(s.capacity.value)
            : undefined;
        fnTable.defineVar({ name: s.name, typeName: s.typeName, capacity: cap });
      } else if ((stmt as any).type === 'MochilaDecl') {
        const s = stmt as any;
        fnTable.defineVar({ name: s.name, typeName: s.typeName });
      } else if ((stmt as any).type === 'RadarDecl') {
        const s = stmt as any;
        fnTable.defineVar({ name: s.name, typeName: s.typeName });
      }
    }
    byFunction.set(fn.name, fnTable);
  }

  return { global, byFunction };
}

export default collectSymbols;
