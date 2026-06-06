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
    case 'MochilaSacar':
      checkVar(expr.mochilaName, locFrom(expr));
      return;
    case 'MochilaCantidadDe':
      checkVar(expr.mochilaName, locFrom(expr));
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

function validateLValue(
  lvalue: LValueNode,
  fnName: string,
  fnTable: FunctionScope,
  global: ReturnType<typeof buildGlobalSymbolTable>,
  errors: SemanticDiagnostic[]
) {
  const checkVar = createCheckVar(fnName, fnTable, global, errors);
  switch (lvalue.type) {
    case 'IdentifierLValue':
      checkVar(lvalue.name, locFrom(lvalue));
      return;
    case 'IndexLValue':
      checkVar(lvalue.name, locFrom(lvalue));
      // if index is a literal integer and we know the capacity, validate bounds
      if ((lvalue as any).index && (lvalue as any).index.type === 'Literal') {
        const idxNode = (lvalue as any).index as any;
        if (idxNode.valueType === 'int') {
          const idx = Number(idxNode.value);
          const varInfo = fnTable.lookupVar(lvalue.name as string) as any;
          if (varInfo && typeof varInfo.capacity === 'number') {
            if (idx < 0 || idx >= varInfo.capacity) {
              errors.push(
                makeError(
                  `Index ${idx} out of bounds for '${lvalue.name}' (capacity ${varInfo.capacity}) in ${fnName}`,
                  locFrom(lvalue)
                )
              );
            }
          }
        }
      }
      // still walk index expr to check nested identifiers
      walkExpr((lvalue as any).index as ExprNode, checkVar);
      return;
    case 'SpecialLValue':
      // Only DEVOLVER_A_LA_BALL must appear inside MOVIMIENTO functions
      if ((lvalue as any).kind === 'DEVOLVER_A_LA_BALL') {
        const funcInfo = global.lookupFunction(fnName);
        if (funcInfo && (funcInfo as any).kind !== 'MOVIMIENTO') {
          errors.push(
            makeError(
              `'DEVOLVER_A_LA_BALL' used outside a MOVIMIENTO function in ${fnName}`,
              locFrom(lvalue)
            )
          );
        }
      }
      walkExpr((lvalue as any).arg as ExprNode, checkVar);
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

function areTypesCompatible(varType: string, valType: string): boolean {
  const mapping: Record<string, string> = {
    PokeBall: 'int',
    SuperBall: 'float',
    UltraBall: 'string',
    MasterBall: 'bool',
    int: 'int',
    float: 'float',
    string: 'string',
    bool: 'bool',
  };
  return mapping[varType] === mapping[valType];
}

function validateExpr(
  expr: ExprNode | undefined,
  fnName: string,
  fnTable: FunctionScope,
  errors: SemanticDiagnostic[]
) {
  if (!expr) return;
  switch (expr.type) {
    case 'MochilaSacar': {
      const info = fnTable.lookupVar(expr.mochilaName);
      if (info && !info.isMochila) {
        errors.push(
          makeError(`Symbol '${expr.mochilaName}' is not a MOCHILA in ${fnName}`, locFrom(expr))
        );
      }
      break;
    }
    case 'MochilaCantidadDe': {
      const info = fnTable.lookupVar(expr.mochilaName);
      if (info && !info.isMochila) {
        errors.push(
          makeError(`Symbol '${expr.mochilaName}' is not a MOCHILA in ${fnName}`, locFrom(expr))
        );
      }
      break;
    }
    case 'BinOp':
      validateExpr(expr.left, fnName, fnTable, errors);
      validateExpr(expr.right, fnName, fnTable, errors);
      break;
    case 'CallExpr':
      for (const arg of expr.args || []) validateExpr(arg, fnName, fnTable, errors);
      break;
    case 'LValueExpr':
      if (expr.lvalue.type === 'IndexLValue') {
        validateExpr(expr.lvalue.index, fnName, fnTable, errors);
      } else if (expr.lvalue.type === 'SpecialLValue') {
        validateExpr(expr.lvalue.arg, fnName, fnTable, errors);
      }
      break;
  }
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
        for (const arg of stmt.args || []) validateExpr(arg, fnName, fnTable, errors);
        break;
      case 'AssignmentStmt':
        validateLValue(stmt.lvalue, fnName, fnTable, global, errors);
        walkExpr(stmt.value, checkVar);
        validateExpr(stmt.value, fnName, fnTable, errors);
        break;
      case 'CaptureDecl':
        walkExpr(stmt.value, checkVar);
        validateExpr(stmt.value, fnName, fnTable, errors);
        break;
      case 'EquipoDecl':
        walkExpr(stmt.capacity, checkVar);
        validateExpr(stmt.capacity, fnName, fnTable, errors);
        if ((stmt as any).capacity && (stmt as any).capacity.type === 'Literal') {
          const capNode = (stmt as any).capacity as any;
          if (capNode.valueType === 'int') {
            const cap = Number(capNode.value);
            if (cap < 0) {
              errors.push(
                makeError(
                  `Equipo '${(stmt as any).name}' has negative capacity ${cap}`,
                  locFrom(stmt)
                )
              );
            }
            if (cap > 6) {
              errors.push(
                makeError(
                  `Equipo '${(stmt as any).name}' exceeds max capacity 6 (found ${cap})`,
                  locFrom(stmt)
                )
              );
            }
          }
        }
        break;
      case 'MochilaGuardar': {
        const varInfo = fnTable.lookupVar(stmt.name);
        if (!varInfo) {
          errors.push(
            makeError(`Use of undefined symbol '${stmt.name}' in ${fnName}`, locFrom(stmt))
          );
        } else if (!varInfo.isMochila) {
          errors.push(
            makeError(`Symbol '${stmt.name}' is not a MOCHILA in ${fnName}`, locFrom(stmt))
          );
        } else if (varInfo.typeName && stmt.value.type === 'Literal') {
          if (!areTypesCompatible(varInfo.typeName, (stmt.value as any).valueType)) {
            errors.push(
              makeError(
                `Type mismatch: cannot push value of type '${
                  (stmt.value as any).valueType
                }' to MOCHILA of type '${varInfo.typeName}' in ${fnName}`,
                locFrom(stmt)
              )
            );
          }
        }
        walkExpr(stmt.value, checkVar);
        validateExpr(stmt.value, fnName, fnTable, errors);
        break;
      }
      case 'IfStmt':
        walkExpr(stmt.test, checkVar);
        validateExpr(stmt.test, fnName, fnTable, errors);
        checkStatementList(stmt.consequent, fnName, fnTable, global, errors);
        checkStatementList(stmt.alternate, fnName, fnTable, global, errors);
        break;
      case 'WhileStmt':
        walkExpr(stmt.test, checkVar);
        validateExpr(stmt.test, fnName, fnTable, errors);
        checkStatementList(stmt.body, fnName, fnTable, global, errors);
        break;
      case 'ReturnStmt':
        if (stmt.value) {
          walkExpr(stmt.value, checkVar);
          validateExpr(stmt.value, fnName, fnTable, errors);
        }
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
