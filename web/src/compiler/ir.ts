import type {
  ProgramNode,
  FunctionDeclNode,
  StatementNode,
  ExprNode,
  LValueNode,
  SourceLocation,
} from './ast';

export interface IRProgram {
  type: 'IRProgram';
  functions: IRFunction[];
}

export interface IRFunction {
  type: 'IRFunction';
  name: string;
  kind: FunctionDeclNode['kind'];
  params: IRParam[];
  returnType?: string;
  body: IRStatement[];
  loc?: SourceLocation;
}

export interface IRParam {
  name: string;
  typeName: string;
  loc?: SourceLocation;
}

export type IRStatement =
  | IRDeclareStmt
  | IRAssignStmt
  | IRCallStmt
  | IRIfStmt
  | IRWhileStmt
  | IRReturnStmt;

export interface IRDeclareStmt {
  type: 'IRDeclare';
  name: string;
  kind: 'CAPTURE' | 'EQUIPO' | 'MOCHILA' | 'RADAR';
  typeName: string;
  value?: IRExpr;
  loc?: SourceLocation;
}

export interface IRAssignStmt {
  type: 'IRAssign';
  target: IRLValue;
  value: IRExpr;
  loc?: SourceLocation;
}

export interface IRCallStmt {
  type: 'IRCall';
  name: string;
  args: IRExpr[];
  loc?: SourceLocation;
}

export interface IRIfStmt {
  type: 'IRIf';
  test: IRExpr;
  consequent: IRStatement[];
  alternate?: IRStatement[];
  loc?: SourceLocation;
}

export interface IRWhileStmt {
  type: 'IRWhile';
  test: IRExpr;
  body: IRStatement[];
  loc?: SourceLocation;
}

export interface IRReturnStmt {
  type: 'IRReturn';
  value?: IRExpr;
  loc?: SourceLocation;
}

export type IRExpr = IRLiteral | IRIdentifier | IRBinary | IRCallExpr | IRLValueExpr;

export interface IRLiteral {
  type: 'IRLiteral';
  value: number | string | boolean;
  valueType: 'int' | 'float' | 'string' | 'bool';
  loc?: SourceLocation;
}

export interface IRIdentifier {
  type: 'IRIdentifier';
  name: string;
  loc?: SourceLocation;
}

export interface IRBinary {
  type: 'IRBinary';
  op: '+' | '-' | '*' | '/' | '<' | '>' | '==' | '!=' | '<=' | '>=' | '[]'; 
  left: IRExpr;
  right: IRExpr;
  loc?: SourceLocation;
}

export interface IRCallExpr {
  type: 'IRCallExpr';
  name: string;
  args: IRExpr[];
  loc?: SourceLocation;
}

export interface IRLValueExpr {
  type: 'IRLValueExpr';
  target: IRLValue;
  loc?: SourceLocation;
}

export type IRLValue = IRVarTarget | IRIndexTarget | IRSpecialTarget;

export interface IRVarTarget {
  type: 'IRVarTarget';
  name: string;
  loc?: SourceLocation;
}

export interface IRIndexTarget {
  type: 'IRIndexTarget';
  name: string;
  index: IRExpr;
  loc?: SourceLocation;
}

export interface IRSpecialTarget {
  type: 'IRSpecialTarget';
  kind: 'MIRAR_RADAR' | 'DEVOLVER_A_LA_BALL';
  arg: IRExpr;
  loc?: SourceLocation;
}

function lowerExpr(expr: ExprNode): IRExpr {
  switch (expr.type) {
    case 'Literal':
      return {
        type: 'IRLiteral',
        value: expr.value,
        valueType: expr.valueType,
        loc: expr.loc,
      };
    case 'Identifier':
      return {
        type: 'IRIdentifier',
        name: expr.name,
        loc: expr.loc,
      };
    case 'BinOp':
      return {
        type: 'IRBinary',
        op: expr.op,
        left: lowerExpr(expr.left),
        right: lowerExpr(expr.right),
        loc: expr.loc,
      };
    case 'CallExpr':
      return {
        type: 'IRCallExpr',
        name: expr.name,
        args: expr.args.map(lowerExpr),
        loc: expr.loc,
      };
    case 'LValueExpr':
      return {
        type: 'IRLValueExpr',
        target: lowerLValue(expr.lvalue),
        loc: expr.loc,
      };
  }
}

function lowerLValue(lvalue: LValueNode): IRLValue {
  switch (lvalue.type) {
    case 'IdentifierLValue':
      return { type: 'IRVarTarget', name: lvalue.name, loc: lvalue.loc };
    case 'IndexLValue':
      return {
        type: 'IRIndexTarget',
        name: lvalue.name,
        index: lowerExpr(lvalue.index),
        loc: lvalue.loc,
      };
    case 'SpecialLValue':
      return {
        type: 'IRSpecialTarget',
        kind: lvalue.kind,
        arg: lowerExpr(lvalue.arg),
        loc: lvalue.loc,
      };
  }
}

function lowerStmt(stmt: StatementNode): IRStatement {
  switch (stmt.type) {
    case 'CaptureDecl':
      return {
        type: 'IRDeclare',
        name: stmt.name,
        kind: 'CAPTURE',
        typeName: stmt.typeName,
        value: lowerExpr(stmt.value),
        loc: stmt.loc,
      };
    case 'EquipoDecl':
      return {
        type: 'IRDeclare',
        name: stmt.name,
        kind: 'EQUIPO',
        typeName: stmt.typeName,
        value: lowerExpr(stmt.capacity),
        loc: stmt.loc,
      };
    case 'MochilaDecl':
      return {
        type: 'IRDeclare',
        name: stmt.name,
        kind: 'MOCHILA',
        typeName: stmt.typeName,
        loc: stmt.loc,
      };
    case 'RadarDecl':
      return {
        type: 'IRDeclare',
        name: stmt.name,
        kind: 'RADAR',
        typeName: stmt.typeName,
        loc: stmt.loc,
      };
    case 'AssignmentStmt':
      return {
        type: 'IRAssign',
        target: lowerLValue(stmt.lvalue),
        value: lowerExpr(stmt.value),
        loc: stmt.loc,
      };
    case 'CallStmt':
      return {
        type: 'IRCall',
        name: stmt.name,
        args: stmt.args.map(lowerExpr),
        loc: stmt.loc,
      };
    case 'IfStmt':
      return {
        type: 'IRIf',
        test: lowerExpr(stmt.test),
        consequent: stmt.consequent.map(lowerStmt),
        alternate: stmt.alternate?.map(lowerStmt),
        loc: stmt.loc,
      };
    case 'WhileStmt':
      return {
        type: 'IRWhile',
        test: lowerExpr(stmt.test),
        body: stmt.body.map(lowerStmt),
        loc: stmt.loc,
      };
    case 'ReturnStmt':
      return {
        type: 'IRReturn',
        value: stmt.value ? lowerExpr(stmt.value) : undefined,
        loc: stmt.loc,
      };
  }
}

export function lowerProgramToIR(program: ProgramNode): IRProgram {
  return {
    type: 'IRProgram',
    functions: program.functions.map((fn): IRFunction => ({
      type: 'IRFunction',
      name: fn.name,
      kind: fn.kind,
      params: fn.params.map((param) => ({
        name: param.name,
        typeName: param.typeName,
        loc: param.loc,
      })),
      returnType: fn.returnType,
      body: fn.body.map(lowerStmt),
      loc: fn.loc,
    })),
  };
}
