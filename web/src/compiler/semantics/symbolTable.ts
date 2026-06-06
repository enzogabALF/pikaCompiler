import { ProgramNode, FunctionDeclNode, ParameterNode } from '../ast';

export type VarInfo = { name: string; typeName?: string; capacity?: number; isMochila?: boolean };
export type FuncInfo = { name: string; kind: string; params: ParameterNode[]; returnType?: string };

export class SymbolTable {
  functions: Map<string, FuncInfo> = new Map();
  variables: Map<string, VarInfo> = new Map();
  parent?: SymbolTable;

  constructor(parent?: SymbolTable) {
    this.parent = parent;
  }

  defineFunction(f: FuncInfo) {
    if (this.functions.has(f.name)) {
      throw new Error(`Function ${f.name} already defined`);
    }
    this.functions.set(f.name, f);
  }

  defineVar(v: VarInfo) {
    if (this.variables.has(v.name)) {
      throw new Error(`Variable ${v.name} already defined`);
    }
    this.variables.set(v.name, v);
  }

  lookupFunction(name: string): FuncInfo | undefined {
    return this.functions.get(name) ?? this.parent?.lookupFunction(name);
  }

  lookupVar(name: string): VarInfo | undefined {
    return this.variables.get(name) ?? this.parent?.lookupVar(name);
  }
}

export function buildGlobalSymbolTable(program: ProgramNode): SymbolTable {
  const table = new SymbolTable();
  for (const fn of program.functions) {
    table.defineFunction({
      name: fn.name,
      kind: (fn as FunctionDeclNode).kind,
      params: fn.params || [],
      returnType: fn.returnType,
    });
  }
  return table;
}

export default SymbolTable;
