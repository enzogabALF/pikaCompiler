import type { ProgramNode, StatementNode, ExprNode, SourceLocation, LValueNode } from '../ast';
import { buildGlobalSymbolTable } from './symbolTable';
import collectSymbols from './collector';

const KNOWN_TYPES = new Set([
  'PokeBall',
  'SuperBall',
  'UltraBall',
  'MasterBall',
  'int',
  'float',
  'string',
  'bool',
]);

export type SemanticDiagnostic = {
  message: string;
  loc?: SourceLocation;
};

function makeError(message: string, loc?: SourceLocation): SemanticDiagnostic {
  return { message, loc };
}

function locFrom(node: any): SourceLocation | undefined {
  return node?.loc;
}

function walkExpr(expr: ExprNode, checkVar: (name: string, loc?: SourceLocation) => void) {
  switch (expr.type) {
    case 'Identifier':
      checkVar(expr.name, locFrom(expr));
      return;
    case 'BinOp':
      walkExpr(expr.left, checkVar);
      walkExpr(expr.right, checkVar);
      return;
    case 'CallExpr':
      for (const arg of expr.args || []) walkExpr(arg, checkVar);
      return;
    case 'LValueExpr':
      walkLValue(expr.lvalue, checkVar);
      return;
    case 'Literal':
      return;
  }
}

function walkLValue(lvalue: LValueNode, checkVar: (name: string, loc?: SourceLocation) => void) {
  switch (lvalue.type) {
    case 'IdentifierLValue':
      checkVar(lvalue.name, locFrom(lvalue));
      return;
    case 'IndexLValue':
      checkVar(lvalue.name, locFrom(lvalue));
      walkExpr(lvalue.index, checkVar);
      return;
    case 'SpecialLValue':
      walkExpr(lvalue.arg, checkVar);
      return;
  }
}

type FunctionScope = ReturnType<typeof collectSymbols>['byFunction'] extends Map<string, infer T>
  ? T
  : never;

function createCheckVar(
  fnName: string,
  fnTable: FunctionScope,
  global: ReturnType<typeof buildGlobalSymbolTable>,
  errors: SemanticDiagnostic[]
) {
  return (name: string, loc?: SourceLocation) => {
    if (!fnTable.lookupVar(name) && !global.lookupFunction(name)) {
      errors.push(makeError(`Use of undefined symbol '${name}' in ${fnName}`, loc));
    }
  };
}

const BUILTIN_FUNCTIONS = new Set([
  'DICE_PROF_OAK',
  'OAK_PREGUNTA',
  'UBICACION_DE',
  'MIRAR_RADAR',
  'DEVOLVER_A_LA_BALL',
]);

function checkCallStmt(
  stmt: Extract<StatementNode, { type: 'CallStmt' }>,
  fnName: string,
  checkVar: (name: string, loc?: SourceLocation) => void,
  global: ReturnType<typeof buildGlobalSymbolTable>,
  errors: SemanticDiagnostic[]
) {
  if (!global.lookupFunction(stmt.name) && !BUILTIN_FUNCTIONS.has(stmt.name)) {
    errors.push(makeError(`Call to undefined function '${stmt.name}' in ${fnName}`, stmt.loc));
  }
  for (const arg of stmt.args || []) walkExpr(arg, checkVar);
}

function checkStatementList(
  statements: StatementNode[] | undefined,
  fnName: string,
  fnTable: FunctionScope,
  global: ReturnType<typeof buildGlobalSymbolTable>,
  errors: SemanticDiagnostic[]
) {
  if (!statements) return;

  const checkVar = createCheckVar(fnName, fnTable, global, errors);

  for (const stmt of statements) {
    switch (stmt.type) {
      case 'CallStmt':
        checkCallStmt(stmt, fnName, checkVar, global, errors);
        break;
      case 'AssignmentStmt':
        walkLValue(stmt.lvalue, checkVar);
        walkExpr(stmt.value, checkVar);
        break;
      case 'CaptureDecl':
        walkExpr(stmt.value, checkVar);
        break;
      case 'EquipoDecl':
        walkExpr(stmt.capacity, checkVar);
        break;
      case 'IfStmt':
        walkExpr(stmt.test, checkVar);
        checkStatementList(stmt.consequent, fnName, fnTable, global, errors);
        checkStatementList(stmt.alternate, fnName, fnTable, global, errors);
        break;
      case 'WhileStmt':
        walkExpr(stmt.test, checkVar);
        checkStatementList(stmt.body, fnName, fnTable, global, errors);
        break;
      case 'ReturnStmt':
        if (stmt.value) walkExpr(stmt.value, checkVar);
        break;
      case 'MochilaDecl':
      case 'RadarDecl':
        break;
    }
  }
}

export function typeCheck(program: ProgramNode): SemanticDiagnostic[] {
  const errors: SemanticDiagnostic[] = [];
  const global = buildGlobalSymbolTable(program);
  const { byFunction } = collectSymbols(program);

  // check function signatures
  for (const fn of program.functions) {
    if (fn.returnType && !KNOWN_TYPES.has(fn.returnType)) {
      errors.push(
        makeError(`Function ${fn.name} has unknown return type '${fn.returnType}'`, fn.loc)
      );
    }
    for (const p of fn.params || []) {
      if (p.typeName && !KNOWN_TYPES.has(p.typeName)) {
        errors.push(
          makeError(`Parameter ${p.name} in ${fn.name} has unknown type '${p.typeName}'`, p.loc)
        );
      }
    }

    const fnTable = byFunction.get(fn.name);
    if (!fnTable) continue;
    checkStatementList(fn.body, fn.name, fnTable, global, errors);
  }

  return errors;
}

export default typeCheck;
