import { parser } from './parser'

// --- AST Interfaces ---

export type ASTNode =
  | ProgramNode
  | FunctionDeclNode
  | StatementNode
  | ExprNode
  | ParameterNode
  | LValueNode

export interface ProgramNode {
  type: 'Program'
  functions: FunctionDeclNode[]
}

export interface ParameterNode {
  type: 'Parameter'
  name: string
  typeName: string // 'PokeBall' | 'SuperBall' | 'UltraBall' | 'MasterBall'
}

export interface FunctionDeclNode {
  type: 'FunctionDecl'
  kind: 'PUEBLO_NATAL' | 'MOVIMIENTO'
  name: string
  params: ParameterNode[]
  returnType?: string
  body: StatementNode[]
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
  | ReturnStmtNode

export interface CaptureDeclNode {
  type: 'CaptureDecl'
  name: string
  typeName: string
  value: ExprNode
}

export interface EquipoDeclNode {
  type: 'EquipoDecl'
  name: string
  typeName: string
  capacity: ExprNode
}

export interface MochilaDeclNode {
  type: 'MochilaDecl'
  name: string
  typeName: string
}

export interface RadarDeclNode {
  type: 'RadarDecl'
  name: string
  typeName: string
}

export interface IfStmtNode {
  type: 'IfStmt'
  test: ExprNode
  consequent: StatementNode[]
  alternate?: StatementNode[]
}

export interface WhileStmtNode {
  type: 'WhileStmt'
  test: ExprNode
  body: StatementNode[]
}

export interface AssignmentStmtNode {
  type: 'AssignmentStmt'
  lvalue: LValueNode
  value: ExprNode
}

export interface CallStmtNode {
  type: 'CallStmt'
  name: string
  args: ExprNode[]
}

export interface ReturnStmtNode {
  type: 'ReturnStmt'
  value?: ExprNode
}

export type ExprNode =
  | LiteralNode
  | IdentifierNode
  | BinOpNode
  | CallExprNode
  | LValueExprNode

export interface LiteralNode {
  type: 'Literal'
  value: number | string | boolean
  valueType: 'int' | 'float' | 'string' | 'bool'
}

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface BinOpNode {
  type: 'BinOp'
  op: '+' | '-' | '*' | '/' | '<' | '>' | '==' | '!=' | '<=' | '>=' | '[]'
  left: ExprNode
  right: ExprNode
}

export interface CallExprNode {
  type: 'CallExpr'
  name: string
  args: ExprNode[]
}

export interface LValueExprNode {
  type: 'LValueExpr'
  lvalue: LValueNode
}

export type LValueNode =
  | IdentifierLValueNode
  | IndexLValueNode
  | SpecialLValueNode

export interface IdentifierLValueNode {
  type: 'IdentifierLValue'
  name: string
}

export interface IndexLValueNode {
  type: 'IndexLValue'
  name: string
  index: ExprNode
}

export interface SpecialLValueNode {
  type: 'SpecialLValue'
  kind: 'MIRAR_RADAR' | 'DEVOLVER_A_LA_BALL'
  arg: ExprNode
}

// --- CST Visitor Implementation ---

const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

// Helper to sort tokens by start offset to preserve left-to-right evaluation order
function getOperators(ctx: any, tokenNames: string[]) {
  const tokens: any[] = []
  for (const name of tokenNames) {
    if (ctx[name]) {
      tokens.push(...ctx[name])
    }
  }
  return tokens.sort((a, b) => a.startOffset - b.startOffset)
}

class PokeCstVisitor extends BaseCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  program(ctx: any): ProgramNode {
    const functions = ctx.functionDecl ? ctx.functionDecl.map((f: any) => this.visit(f)) : []
    return {
      type: 'Program',
      functions
    }
  }

  functionDecl(ctx: any): FunctionDeclNode {
    const kind = ctx.PuebloNatal ? 'PUEBLO_NATAL' : 'MOVIMIENTO'
    const name = ctx.Identifier[0].image
    const params = ctx.param ? ctx.param.map((p: any) => this.visit(p)) : []
    const returnType = ctx.typeName ? this.visit(ctx.typeName[0]) : undefined
    const body = ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : []

    return {
      type: 'FunctionDecl',
      kind,
      name,
      params,
      returnType,
      body
    }
  }

  typeName(ctx: any): string {
    if (ctx.PokeBall) return 'PokeBall'
    if (ctx.SuperBall) return 'SuperBall'
    if (ctx.UltraBall) return 'UltraBall'
    if (ctx.MasterBall) return 'MasterBall'
    return ''
  }

  param(ctx: any): ParameterNode {
    const name = ctx.Identifier[0].image
    const typeName = this.visit(ctx.typeName[0])
    return {
      type: 'Parameter',
      name,
      typeName
    }
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
      ctx.assignOrCallStmt
    return this.visit(child[0])
  }

  captureDecl(ctx: any): CaptureDeclNode {
    const name = ctx.Identifier[0].image
    const typeName = this.visit(ctx.typeName[0])
    const value = this.visit(ctx.expr[0])
    return {
      type: 'CaptureDecl',
      name,
      typeName,
      value
    }
  }

  equipoDecl(ctx: any): EquipoDeclNode {
    const name = ctx.Identifier[0].image
    const typeName = this.visit(ctx.typeName[0])
    const capacity = this.visit(ctx.expr[0])
    return {
      type: 'EquipoDecl',
      name,
      typeName,
      capacity
    }
  }

  mochilaDecl(ctx: any): MochilaDeclNode {
    const name = ctx.Identifier[0].image
    const typeName = this.visit(ctx.typeName[0])
    return {
      type: 'MochilaDecl',
      name,
      typeName
    }
  }

  radarDecl(ctx: any): RadarDeclNode {
    const name = ctx.Identifier[0].image
    const typeName = this.visit(ctx.typeName[0])
    return {
      type: 'RadarDecl',
      name,
      typeName
    }
  }

  ifStmt(ctx: any): IfStmtNode {
    const test = this.visit(ctx.expr[0])
    const consequent = ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : []
    const alternate = ctx.statement2 ? ctx.statement2.map((s: any) => this.visit(s)) : undefined
    return {
      type: 'IfStmt',
      test,
      consequent,
      alternate
    }
  }

  whileStmt(ctx: any): WhileStmtNode {
    const test = this.visit(ctx.expr[0])
    const body = ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : []
    return {
      type: 'WhileStmt',
      test,
      body
    }
  }

  returnStmt(ctx: any): ReturnStmtNode {
    const value = ctx.expr ? this.visit(ctx.expr[0]) : undefined
    return {
      type: 'ReturnStmt',
      value
    }
  }

  specialAssignmentStmt(ctx: any): AssignmentStmtNode {
    const kind = ctx.MirarRadar ? 'MIRAR_RADAR' : 'DEVOLVER_A_LA_BALL'
    const arg = this.visit(ctx.expr[0])
    const value = this.visit(ctx.expr[1])
    return {
      type: 'AssignmentStmt',
      lvalue: {
        type: 'SpecialLValue',
        kind,
        arg
      },
      value
    }
  }

  assignOrCallStmt(ctx: any): StatementNode {
    const name = ctx.Identifier[0].image
    if (ctx.LParen) {
      const args = ctx.expr ? ctx.expr.map((e: any) => this.visit(e)) : []
      return {
        type: 'CallStmt',
        name,
        args
      }
    } else if (ctx.LBracket) {
      const index = this.visit(ctx.expr[0])
      const value = this.visit(ctx.expr[1])
      return {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'IndexLValue',
          name,
          index
        },
        value
      }
    } else {
      const value = this.visit(ctx.expr[0])
      return {
        type: 'AssignmentStmt',
        lvalue: {
          type: 'IdentifierLValue',
          name
        },
        value
      }
    }
  }

  expr(ctx: any): ExprNode {
    const left = this.visit(ctx.additionExpr[0])
    if (ctx.additionExpr.length > 1) {
      const right = this.visit(ctx.additionExpr[1])
      const opToken = getOperators(ctx, ['Equal', 'NotEqual', 'LessThan', 'GreaterThan', 'LessEqual', 'GreaterEqual'])[0]
      const op = opToken.image
      return {
        type: 'BinOp',
        op,
        left,
        right
      }
    }
    return left
  }

  additionExpr(ctx: any): ExprNode {
    let result = this.visit(ctx.multiplicationExpr[0])
    if (ctx.multiplicationExpr.length > 1) {
      const ops = getOperators(ctx, ['Plus', 'Minus'])
      for (let i = 1; i < ctx.multiplicationExpr.length; i++) {
        const right = this.visit(ctx.multiplicationExpr[i])
        const op = ops[i - 1].image as '+' | '-'
        result = {
          type: 'BinOp',
          op,
          left: result,
          right
        }
      }
    }
    return result
  }

  multiplicationExpr(ctx: any): ExprNode {
    let result = this.visit(ctx.primaryExpr[0])
    if (ctx.primaryExpr.length > 1) {
      const ops = getOperators(ctx, ['Mult', 'Div'])
      for (let i = 1; i < ctx.primaryExpr.length; i++) {
        const right = this.visit(ctx.primaryExpr[i])
        const op = ops[i - 1].image as '*' | '/'
        result = {
          type: 'BinOp',
          op,
          left: result,
          right
        }
      }
    }
    return result
  }

  specialCallExpr(ctx: any): CallExprNode {
    const name = ctx.MirarRadar ? 'MIRAR_RADAR' : 'DEVOLVER_A_LA_BALL'
    const arg = this.visit(ctx.expr[0])
    return {
      type: 'CallExpr',
      name,
      args: [arg]
    }
  }

  primaryExpr(ctx: any): ExprNode {
    if (ctx.Float) {
      return {
        type: 'Literal',
        value: parseFloat(ctx.Float[0].image),
        valueType: 'float'
      }
    }
    if (ctx.Int) {
      return {
        type: 'Literal',
        value: parseInt(ctx.Int[0].image, 10),
        valueType: 'int'
      }
    }
    if (ctx.StringLiteral) {
      return {
        type: 'Literal',
        value: ctx.StringLiteral[0].image.slice(1, -1),
        valueType: 'string'
      }
    }
    if (ctx.LParen) {
      return this.visit(ctx.expr[0])
    }
    if (ctx.specialCallExpr) {
      return this.visit(ctx.specialCallExpr[0])
    }
    if (ctx.Identifier) {
      const name = ctx.Identifier[0].image
      if (ctx.LParen) {
        const args = ctx.expr ? ctx.expr.map((e: any) => this.visit(e)) : []
        return {
          type: 'CallExpr',
          name,
          args
        }
      } else if (ctx.LBracket) {
        const index = this.visit(ctx.expr[0])
        return {
          type: 'LValueExpr',
          lvalue: {
            type: 'IndexLValue',
            name,
            index
          }
        }
      } else {
        return {
          type: 'LValueExpr',
          lvalue: {
            type: 'IdentifierLValue',
            name
          }
        }
      }
    }
    throw new Error('Unknown primary expression')
  }
}

const visitor = new PokeCstVisitor()

export function cstToAst(cst: any): ProgramNode {
  return visitor.visit(cst)
}
