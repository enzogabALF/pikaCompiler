import { parser } from './parser';

// --- AST Interfaces ---

export interface SourceLocation {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface Locatable {
  loc?: SourceLocation;
}

export type ASTNode =
  | ProgramNode
  | FunctionDeclNode
  | StatementNode
  | ExprNode
  | ParameterNode
  | LValueNode;

export interface ProgramNode {
  type: 'Program';
  functions: FunctionDeclNode[];
  loc?: SourceLocation;
}

export interface ParameterNode {
  type: 'Parameter';
  name: string;
  typeName: string; // 'PokeBall' | 'SuperBall' | 'UltraBall' | 'MasterBall'
  loc?: SourceLocation;
}

export interface FunctionDeclNode {
  type: 'FunctionDecl';
  kind: 'PUEBLO_NATAL' | 'MOVIMIENTO';
  name: string;
  params: ParameterNode[];
  returnType?: string;
  body: StatementNode[];
  loc?: SourceLocation;
}

export type StatementNode =
  | CaptureDeclNode
  | EquipoDeclNode
  | MochilaDeclNode
  | RadarDeclNode
  | IfStmtNode
  | WhileStmtNode
  | AssignmentStmtNode
  | CallStmtNode
  | ReturnStmtNode;

export interface CaptureDeclNode {
  type: 'CaptureDecl';
  name: string;
  typeName: string;
  value: ExprNode;
  loc?: SourceLocation;
}

export interface EquipoDeclNode {
  type: 'EquipoDecl';
  name: string;
  typeName: string;
  capacity: ExprNode;
  loc?: SourceLocation;
}

export interface MochilaDeclNode {
  type: 'MochilaDecl';
  name: string;
  typeName: string;
  loc?: SourceLocation;
}

export interface RadarDeclNode {
  type: 'RadarDecl';
  name: string;
  typeName: string;
  loc?: SourceLocation;
}

export interface IfStmtNode {
  type: 'IfStmt';
  test: ExprNode;
  consequent: StatementNode[];
  alternate?: StatementNode[];
  loc?: SourceLocation;
}

export interface WhileStmtNode {
  type: 'WhileStmt';
  test: ExprNode;
  body: StatementNode[];
  loc?: SourceLocation;
}

export interface AssignmentStmtNode {
  type: 'AssignmentStmt';
  lvalue: LValueNode;
  value: ExprNode;
  loc?: SourceLocation;
}

export interface CallStmtNode {
  type: 'CallStmt';
  name: string;
  args: ExprNode[];
  loc?: SourceLocation;
}

export interface ReturnStmtNode {
  type: 'ReturnStmt';
  value?: ExprNode;
  loc?: SourceLocation;
}

export type ExprNode = LiteralNode | IdentifierNode | BinOpNode | CallExprNode | LValueExprNode;

export interface LiteralNode {
  type: 'Literal';
  value: number | string | boolean;
  valueType: 'int' | 'float' | 'string' | 'bool';
  loc?: SourceLocation;
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
  loc?: SourceLocation;
}

export interface BinOpNode {
  type: 'BinOp';
  op: '+' | '-' | '*' | '/' | '<' | '>' | '==' | '!=' | '<=' | '>=' | '[]';
  left: ExprNode;
  right: ExprNode;
  loc?: SourceLocation;
}

export interface CallExprNode {
  type: 'CallExpr';
  name: string;
  args: ExprNode[];
  loc?: SourceLocation;
}

export interface LValueExprNode {
  type: 'LValueExpr';
  lvalue: LValueNode;
  loc?: SourceLocation;
}

export type LValueNode = IdentifierLValueNode | IndexLValueNode | SpecialLValueNode;

export interface IdentifierLValueNode {
  type: 'IdentifierLValue';
  name: string;
  loc?: SourceLocation;
}

export interface IndexLValueNode {
  type: 'IndexLValue';
  name: string;
  index: ExprNode;
  loc?: SourceLocation;
}

export interface SpecialLValueNode {
  type: 'SpecialLValue';
  kind: 'MIRAR_RADAR' | 'DEVOLVER_A_LA_BALL';
  arg: ExprNode;
  loc?: SourceLocation;
}

// --- CST Visitor Implementation ---

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

// Helper to sort tokens by start offset to preserve left-to-right evaluation order
function getOperators(ctx: any, tokenNames: string[]) {
  const tokens: any[] = [];
  for (const name of tokenNames) {
    if (ctx[name]) {
      tokens.push(...ctx[name]);
    }
  }
  return tokens.sort((a, b) => a.startOffset - b.startOffset);
}

function getFirstTokenStartOffset(node: any): number {
  if (!node) return Number.POSITIVE_INFINITY;
  if (typeof node.startOffset === 'number') return node.startOffset;
  if (node.children) {
    for (const value of Object.values(node.children)) {
      for (const child of value as any[]) {
        const offset = getFirstTokenStartOffset(child);
        if (offset !== Number.POSITIVE_INFINITY) {
          return offset;
        }
      }
    }
  }
  return Number.POSITIVE_INFINITY;
}

function makeLoc(startToken?: any, endToken?: any): SourceLocation | undefined {
  if (!startToken) return undefined;
  return {
    startLine: startToken.startLine ?? 1,
    startColumn: startToken.startColumn ?? 1,
    endLine: endToken?.endLine ?? startToken.endLine ?? startToken.startLine ?? 1,
    endColumn: endToken?.endColumn ?? startToken.endColumn ?? (startToken.startColumn ?? 1) + 1,
  };
}

function firstToken(ctx: unknown, keys: string[]): unknown {
  const record = ctx as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key] as unknown[] | undefined;
    if (value?.[0]) return value[0];
  }
  return undefined;
}

function buildLiteralExpr(kind: 'float' | 'int' | 'string', token: any): LiteralNode {
  if (kind === 'float') {
    return {
      type: 'Literal',
      value: Number.parseFloat(token.image),
      valueType: 'float',
      loc: makeLoc(token, token),
    };
  }

  if (kind === 'int') {
    return {
      type: 'Literal',
      value: Number.parseInt(token.image, 10),
      valueType: 'int',
      loc: makeLoc(token, token),
    };
  }

  return {
    type: 'Literal',
    value: token.image.slice(1, -1),
    valueType: 'string',
    loc: makeLoc(token, token),
  };
}

function buildIdentifierOrCallExpr(ctx: any, name: string): ExprNode {
  if (ctx.LBracket) {
    const index = visitor.visit(ctx.expr[0]);
    return {
      type: 'LValueExpr',
      lvalue: {
        type: 'IndexLValue',
        name,
        index,
        loc: makeLoc(ctx.Identifier[0], ctx.RBracket ? ctx.RBracket[0] : ctx.Identifier[0]),
      },
      loc: makeLoc(ctx.Identifier[0], ctx.RBracket ? ctx.RBracket[0] : ctx.Identifier[0]),
    };
  }

  if (ctx.expr && ctx.expr.length > 0) {
    const args = ctx.expr ? ctx.expr.map((e: any) => visitor.visit(e)) : [];
    try {
      const fs = require('fs');
      const p = require('path');
      const logPath = p.join(__dirname, '..', '..', 'tmp', 'ast-visits.log');
      fs.appendFileSync(logPath, ` -> CallExpr args=${args.length}\n`);
    } catch (e) {}
    return {
      type: 'CallExpr',
      name,
      args,
      loc: makeLoc(ctx.Identifier[0], ctx.RParen ? ctx.RParen[0] : ctx.Identifier[0]),
    };
  }
  try {
    const fs = require('fs');
    const p = require('path');
    const logPath = p.join(__dirname, '..', '..', 'tmp', 'ast-visits.log');
    fs.appendFileSync(logPath, ` -> LValueExpr\n`);
  } catch (e) {}

  return {
    type: 'LValueExpr',
    lvalue: {
      type: 'IdentifierLValue',
      name,
      loc: makeLoc(ctx.Identifier[0], ctx.Identifier[0]),
    },
    loc: makeLoc(ctx.Identifier[0], ctx.Identifier[0]),
  };
}

class PokeCstVisitor extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  program(ctx: any): ProgramNode {
    const functions = ctx.functionDecl ? ctx.functionDecl.map((f: any) => this.visit(f)) : [];
    return {
      type: 'Program',
      functions,
      loc: makeLoc(firstToken(ctx, ['KeywordPuebloNatal', 'KeywordMovimiento']), firstToken(ctx, ['RBrace'])) ?? undefined,
    };
  }

  functionDecl(ctx: any): FunctionDeclNode {
    const kind = ctx.KeywordPuebloNatal ? 'PUEBLO_NATAL' : 'MOVIMIENTO';
    const name = ctx.Identifier ? ctx.Identifier[0].image : 'PUEBLO_NATAL';
    const params = ctx.param ? ctx.param.map((p: any) => this.visit(p)) : [];
    const returnType = ctx.typeName ? this.visit(ctx.typeName[0]) : undefined;
    const body = ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : [];

    return {
      type: 'FunctionDecl',
      kind,
      name,
      params,
      returnType,
      body,
      loc: makeLoc(firstToken(ctx, ['KeywordPuebloNatal', 'KeywordMovimiento']), firstToken(ctx, ['RBrace'])),
    };
  }

  typeName(ctx: any): string {
    if (ctx.KeywordPokeBall) return 'PokeBall';
    if (ctx.KeywordSuperBall) return 'SuperBall';
    if (ctx.KeywordUltraBall) return 'UltraBall';
    if (ctx.KeywordMasterBall) return 'MasterBall';
    return '';
  }

  param(ctx: any): ParameterNode {
    const name = ctx.Identifier[0].image;
    const typeName = this.visit(ctx.typeName[0]);
    return {
      type: 'Parameter',
      name,
      typeName,
      loc: makeLoc(firstToken(ctx, ['Identifier']), firstToken(ctx, ['typeName'])),
    };
  }

  statement(ctx: any): StatementNode {
    const child =
      ctx.captureDecl ||
      ctx.equipoDecl ||
      ctx.mochilaDecl ||
      ctx.radarDecl ||
      ctx.ifStmt ||
      ctx.whileStmt ||
      ctx.returnStmt ||
      ctx.specialAssignmentStmt ||
      ctx.assignOrCallStmt;
    return this.visit(child[0]);
  }

  captureDecl(ctx: any): CaptureDeclNode {
    const name = ctx.Identifier[0].image;
    const typeName = this.visit(ctx.typeName[0]);
    // Use the last expr occurrence to capture the outermost expression (handles nested exprs inside calls)
    const exprIndex = Array.isArray(ctx.expr) ? ctx.expr.length - 1 : 0;
    const value = this.visit(ctx.expr[exprIndex]);
    return {
      type: 'CaptureDecl',
      name,
      typeName,
      value,
      loc: makeLoc(firstToken(ctx, ['KeywordCaptura']), firstToken(ctx, ['Semicolon'])),
    };
  }

  equipoDecl(ctx: any): EquipoDeclNode {
    const name = ctx.Identifier[0].image;
    const typeName = this.visit(ctx.typeName[0]);
    const capacity = this.visit(ctx.expr[0]);
    return {
      type: 'EquipoDecl',
      name,
      typeName,
      capacity,
      loc: makeLoc(firstToken(ctx, ['KeywordEquipo']), firstToken(ctx, ['Semicolon'])),
    };
  }

  mochilaDecl(ctx: any): MochilaDeclNode {
    const name = ctx.Identifier[0].image;
    const typeName = this.visit(ctx.typeName[0]);
    return {
      type: 'MochilaDecl',
      name,
      typeName,
      loc: makeLoc(firstToken(ctx, ['KeywordMochila']), firstToken(ctx, ['Semicolon'])),
    };
  }

  radarDecl(ctx: any): RadarDeclNode {
    const name = ctx.Identifier[0].image;
    const typeName = this.visit(ctx.typeName[0]);
    return {
      type: 'RadarDecl',
      name,
      typeName,
      loc: makeLoc(firstToken(ctx, ['KeywordRadar']), firstToken(ctx, ['Semicolon'])),
    };
  }

  ifStmt(ctx: any): IfStmtNode {
    const test = this.visit(ctx.expr[0]);
    const statements = ctx.statement ? [...ctx.statement] : [];
    const alternateToken = ctx.KeywordSino ? ctx.KeywordSino[0] : undefined;
    const alternateStart = alternateToken ? alternateToken.startOffset : Number.POSITIVE_INFINITY;
    const consequentStatements = statements.filter(
      (statement: any) => getFirstTokenStartOffset(statement) < alternateStart
    );
    const alternateStatements = statements.filter(
      (statement: any) => getFirstTokenStartOffset(statement) > alternateStart
    );
    return {
      type: 'IfStmt',
      test,
      consequent: consequentStatements.map((s: any) => this.visit(s)),
      alternate: alternateStatements.length
        ? alternateStatements.map((s: any) => this.visit(s))
        : undefined,
      loc: makeLoc(firstToken(ctx, ['KeywordSiEntrenadorDesafia']), firstToken(ctx, ['RBrace'])),
    };
  }

  whileStmt(ctx: any): WhileStmtNode {
    const test = this.visit(ctx.expr[0]);
    const body = ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : [];
    return {
      type: 'WhileStmt',
      test,
      body,
      loc: makeLoc(firstToken(ctx, ['KeywordMientrasTengaPs']), firstToken(ctx, ['RBrace'])),
    };
  }

  returnStmt(ctx: any): ReturnStmtNode {
    const value = ctx.expr ? this.visit(ctx.expr[0]) : undefined;
    return {
      type: 'ReturnStmt',
      value,
      loc: makeLoc(firstToken(ctx, ['KeywordRetorna']), firstToken(ctx, ['Semicolon'])),
    };
  }

  specialAssignmentStmt(ctx: any): AssignmentStmtNode {
    const kind = ctx.SpecialMirarRadar ? 'MIRAR_RADAR' : 'DEVOLVER_A_LA_BALL';
    const arg = this.visit(ctx.expr[0]);
    const value = this.visit(ctx.expr[1]);
    return {
      type: 'AssignmentStmt',
      lvalue: {
        type: 'SpecialLValue',
        kind,
        arg,
        loc: makeLoc(firstToken(ctx, ['SpecialMirarRadar']), firstToken(ctx, ['RParen'])),
      },
      value,
      loc: makeLoc(firstToken(ctx, ['SpecialMirarRadar']), firstToken(ctx, ['Semicolon'])),
    };
  }

  assignOrCallStmt(ctx: any): StatementNode {
    const name = ctx.Identifier[0].image;
    if (!ctx.LBracket && !ctx.Assign) {
      const args = ctx.expr ? ctx.expr.map((e: any) => this.visit(e)) : [];
      return {
        type: 'CallStmt',
        name,
        args,
        loc: makeLoc(firstToken(ctx, ['Identifier']), firstToken(ctx, ['Semicolon'])),
      };
    } else if (ctx.LBracket) {
      const index = this.visit(ctx.expr[0]);
      const value = this.visit(ctx.expr[1]);
      return {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'IndexLValue',
          name,
          index,
          loc: makeLoc(ctx.Identifier[0], ctx.RBracket ? ctx.RBracket[0] : ctx.Identifier[0]),
        },
        value,
        loc: makeLoc(firstToken(ctx, ['Identifier']), firstToken(ctx, ['Semicolon'])),
      };
    } else {
      const value = this.visit(ctx.expr[0]);
      return {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'IdentifierLValue',
          name,
          loc: makeLoc(ctx.Identifier[0], ctx.Identifier[0]),
        },
        value,
        loc: makeLoc(firstToken(ctx, ['Identifier']), firstToken(ctx, ['Semicolon'])),
      };
    }
  }

  expr(ctx: any): ExprNode {
    const left = this.visit(ctx.additionExpr[0]);
    if (ctx.additionExpr.length > 1) {
      const right = this.visit(ctx.additionExpr[1]);
      const opToken = getOperators(ctx, [
        'Equal',
        'NotEqual',
        'LessThan',
        'GreaterThan',
        'LessEqual',
        'GreaterEqual',
      ])[0];
      const op = opToken.image;
      return {
        type: 'BinOp',
        op,
        left,
        right,
        loc: makeLoc(firstToken(ctx, ['additionExpr']), firstToken(ctx, ['additionExpr'])),
      };
    }
    return left;
  }

  additionExpr(ctx: any): ExprNode {
    let result = this.visit(ctx.multiplicationExpr[0]);
    if (ctx.multiplicationExpr.length > 1) {
      const ops = getOperators(ctx, ['Plus', 'Minus']);
      for (let i = 1; i < ctx.multiplicationExpr.length; i++) {
        const right = this.visit(ctx.multiplicationExpr[i]);
        const op = ops[i - 1].image as '+' | '-';
        result = {
          type: 'BinOp',
          op,
          left: result,
          right,
          loc: makeLoc(firstToken(ctx, ['multiplicationExpr']), firstToken(ctx, ['multiplicationExpr'])),
        };
      }
    }
    return result;
  }

  multiplicationExpr(ctx: any): ExprNode {
    let result = this.visit(ctx.primaryExpr[0]);
    if (ctx.primaryExpr.length > 1) {
      const ops = getOperators(ctx, ['Mult', 'Div']);
      for (let i = 1; i < ctx.primaryExpr.length; i++) {
        const right = this.visit(ctx.primaryExpr[i]);
        const op = ops[i - 1].image as '*' | '/';
        result = {
          type: 'BinOp',
          op,
          left: result,
          right,
          loc: makeLoc(firstToken(ctx, ['primaryExpr']), firstToken(ctx, ['primaryExpr'])),
        };
      }
    }
    return result;
  }

  specialCallExpr(ctx: any): CallExprNode {
    const name = ctx.SpecialMirarRadar ? 'MIRAR_RADAR' : 'DEVOLVER_A_LA_BALL';
    const arg = this.visit(ctx.expr[0]);
    return {
      type: 'CallExpr',
      name,
      args: [arg],
      loc: makeLoc(firstToken(ctx, ['SpecialMirarRadar', 'SpecialDevolverALaBall']), firstToken(ctx, ['RParen'])),
    };
  }

  primaryExpr(ctx: any): ExprNode {
    if (ctx.Float) return buildLiteralExpr('float', ctx.Float[0]);
    if (ctx.Int) return buildLiteralExpr('int', ctx.Int[0]);
    if (ctx.String) return buildLiteralExpr('string', ctx.String[0]);
    // Identifier (possibly a call) should be handled before parenthesized expr
    if (ctx.specialCallExpr) return this.visit(ctx.specialCallExpr[0]);
    if (ctx.Identifier) {
      const name = ctx.Identifier[0].image;
      return buildIdentifierOrCallExpr(ctx, name);
    }
    if (ctx.LParen) {
      return this.visit(ctx.expr[0]);
    }
    throw new Error('Unknown primary expression');
  }
}

const visitor = new PokeCstVisitor();

export function cstToAst(cst: any): ProgramNode {
  return visitor.visit(cst);
}
