from typing import List, Optional
from .lexer import tokenize_text, Lexer, Token
from .ast_nodes import *


class ParseError(Exception):
    pass


class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def peek(self) -> Optional[Token]:
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def advance(self) -> Optional[Token]:
        t = self.peek()
        if t:
            self.pos += 1
        return t

    def expect(self, ttype: str, value: Optional[str] = None) -> Token:
        t = self.peek()
        if t is None or t.type != ttype or (value is not None and t.value != value):
            raise ParseError(f'Expected {ttype} {value or ""} but got {t}')
        return self.advance()

    def parse(self) -> Program:
        funcs = []
        top_stmts = []
        # Parse top-level: functions and/or stray statements
        while self.peek():
            if self.peek().type == 'KEYWORD' and self.peek().value in ('PUEBLO_NATAL', 'MOVIMIENTO'):
                funcs.append(self.parse_function())
            else:
                # parse stray top-level statement
                stmt = self.parse_statement()
                if stmt is not None:
                    top_stmts.append(stmt)
        return Program(functions=funcs, top_level=top_stmts)

    def parse_function(self) -> FunctionDecl:
        name_tok = self.expect('KEYWORD')
        # function may have an explicit IDENT name after the keyword, e.g. MOVIMIENTO CURAR()
        name = name_tok.value
        if self.peek() and self.peek().type == 'IDENT':
            name = self.advance().value
        self.expect('LPAREN')
        params = []
        if self.peek() and self.peek().type != 'RPAREN':
            while True:
                p_name = self.expect('IDENT').value
                self.expect('COLON')
                type_tok = self.expect('KEYWORD')
                params.append((p_name, type_tok.value))
                if self.peek() and self.peek().type == 'COMMA':
                    self.advance()
                    continue
                break
        self.expect('RPAREN')
        # optional return type: RETORNA Type
        return_type = None
        if self.peek() and self.peek().type == 'KEYWORD' and self.peek().value == 'RETORNA':
            self.advance()
            rt = self.expect('KEYWORD')
            return_type = rt.value
        self.expect('LBRACE')
        body = self.parse_block()
        return FunctionDecl(name=name, params=params, return_type=return_type, body=body)

    def parse_block(self) -> List:
        stmts = []
        while True:
            t = self.peek()
            if t is None:
                break
            if t.type == 'RBRACE':
                self.advance()
                break
            stmt = self.parse_statement()
            if stmt is not None:
                stmts.append(stmt)
        return stmts

    def parse_statement(self):
        t = self.peek()
        if t.type == 'KEYWORD':
            if t.value == 'RETORNA':
                return self.parse_return()
            if t.value == 'RADAR':
                return self.parse_radar()
            if t.value == 'CAPTURA':
                return self.parse_capture()
            if t.value == 'EQUIPO':
                return self.parse_equipo()
            if t.value == 'MOCHILA':
                return self.parse_mochila()
            if t.value == 'SI_ENTRENADOR_DESAFIA':
                return self.parse_if()
            if t.value == 'MIENTRAS_TENGA_PS':
                return self.parse_while()
            if t.value == 'DICE_PROF_OAK':
                return self.parse_call_stmt()
            # other keywords -> treat as call
        if t.type == 'IDENT':
            # assignment or call
            # handle indexed assignment: IDENT [ expr ] = ...
            if self.pos+1 < len(self.tokens) and self.tokens[self.pos+1].type == 'LBRACKET':
                # find closing bracket
                j = self.pos+2
                depth = 1
                while j < len(self.tokens) and depth > 0:
                    if self.tokens[j].type == 'LBRACKET':
                        depth += 1
                    elif self.tokens[j].type == 'RBRACKET':
                        depth -= 1
                    j += 1
                next_tok = self.tokens[j] if j < len(self.tokens) else None
            else:
                next_tok = self.tokens[self.pos+1] if self.pos+1 < len(self.tokens) else None
            if next_tok and next_tok.type == 'ASSIGN':
                return self.parse_assign()
        # fallback: try parse expression statement
        expr = self.parse_expression()
        # support assignment to expression results: EXPR = RHS;
        if self.peek() and self.peek().type == 'ASSIGN':
            self.advance()
            rhs = self.parse_expression()
            if self.peek() and self.peek().type == 'SEMICOLON':
                self.advance()
            return VarAssign(target=expr, expr=rhs)
        # optional semicolon
        if self.peek() and self.peek().type == 'SEMICOLON':
            self.advance()
        return expr

    def parse_capture(self):
        self.expect('KEYWORD', 'CAPTURA')
        name_tok = self.expect('IDENT')
        name = name_tok.value
        # expect EN Type CON default ;
        self.expect('KEYWORD', 'EN')
        type_tok = self.expect('KEYWORD')
        type_name = type_tok.value
        self.expect('KEYWORD', 'CON')
        default = None
        if self.peek().type in ('INT', 'FLOAT', 'STRING'):
            default = self.advance().value
        self.expect('SEMICOLON')
        return Capture(name=name, type_name=type_name, default=default)

    def parse_equipo(self):
        self.expect('KEYWORD', 'EQUIPO')
        name_tok = self.expect('IDENT')
        name = name_tok.value
        self.expect('KEYWORD', 'DE')
        type_tok = self.expect('KEYWORD')
        self.expect('KEYWORD', 'CAPACIDAD')
        cap_tok = self.expect('INT')
        self.expect('SEMICOLON')
        return EquipoDecl(name=name, type_name=type_tok.value, capacity=int(cap_tok.value))

    def parse_mochila(self):
        self.expect('KEYWORD', 'MOCHILA')
        name_tok = self.expect('IDENT')
        name = name_tok.value
        self.expect('KEYWORD', 'DE')
        type_tok = self.expect('KEYWORD')
        self.expect('SEMICOLON')
        return MochilaDecl(name=name, type_name=type_tok.value)

    def parse_if(self):
        self.expect('KEYWORD', 'SI_ENTRENADOR_DESAFIA')
        self.expect('LPAREN')
        cond = self.parse_expression()
        self.expect('RPAREN')
        self.expect('LBRACE')
        then_body = self.parse_block()
        else_body = None
        if self.peek() and self.peek().type == 'KEYWORD' and self.peek().value == 'SINO':
            self.advance()
            self.expect('LBRACE')
            else_body = self.parse_block()
        return IfStmt(cond=cond, then_body=then_body, else_body=else_body)

    def parse_while(self):
        self.expect('KEYWORD', 'MIENTRAS_TENGA_PS')
        self.expect('LPAREN')
        cond = self.parse_expression()
        self.expect('RPAREN')
        self.expect('LBRACE')
        body = self.parse_block()
        return WhileStmt(cond=cond, body=body)

    def parse_return(self):
        # RETORNA Expr ;  (or RETORNA ; for void)
        self.expect('KEYWORD', 'RETORNA')
        expr = None
        if self.peek() and self.peek().type != 'SEMICOLON':
            expr = self.parse_expression()
        self.expect('SEMICOLON')
        return ReturnStmt(expr=expr)

    def parse_call_stmt(self):
        tok = self.expect('KEYWORD')
        name = tok.value
        self.expect('LPAREN')
        args = []
        while self.peek() and self.peek().type != 'RPAREN':
            args.append(self.parse_expression())
            if self.peek() and self.peek().type == 'COMMA':
                self.advance()
        self.expect('RPAREN')
        # support assignment to call result: CALL(...) = expr;
        if self.peek() and self.peek().type == 'ASSIGN':
            target = Call(callee=name, args=args)
            self.advance()
            expr = self.parse_expression()
            if self.peek() and self.peek().type == 'SEMICOLON':
                self.advance()
            return VarAssign(target=target, expr=expr)
        self.expect('SEMICOLON')
        return Call(callee=name, args=args)

    def parse_radar(self):
        self.expect('KEYWORD', 'RADAR')
        name_tok = self.expect('IDENT')
        name = name_tok.value
        self.expect('KEYWORD', 'APUNTA_A')
        type_tok = self.expect('KEYWORD')
        self.expect('SEMICOLON')
        return RadarDecl(name=name, type_name=type_tok.value)

    def parse_assign(self):
        # target can be IDENT or IDENT [ expr ]
        ident = self.expect('IDENT')
        target = Identifier(name=ident.value)
        if self.peek() and self.peek().type == 'LBRACKET':
            self.advance()
            idx = self.parse_expression()
            self.expect('RBRACKET')
            target = BinOp(left=target, op='[]', right=idx)
        self.expect('ASSIGN')
        expr = self.parse_expression()
        if self.peek() and self.peek().type == 'SEMICOLON':
            self.advance()
        return VarAssign(target=target, expr=expr)

    # Expression parsing (precedence climbing simplified)
    def parse_expression(self):
        return self.parse_comparison()

    def parse_comparison(self):
        node = self.parse_add()
        while self.peek() and self.peek().type == 'OP' and self.peek().value in ('<', '>', '==', '!=', '<=', '>='):
            op = self.advance().value
            right = self.parse_add()
            node = BinOp(left=node, op=op, right=right)
        return node

    def parse_add(self):
        node = self.parse_term()
        while self.peek() and self.peek().type == 'OP' and self.peek().value in ('+', '-'):
            op = self.advance().value
            right = self.parse_term()
            node = BinOp(left=node, op=op, right=right)
        return node

    def parse_term(self):
        node = self.parse_factor()
        while self.peek() and self.peek().type == 'OP' and self.peek().value in ('*', '/'):
            op = self.advance().value
            right = self.parse_factor()
            node = BinOp(left=node, op=op, right=right)
        return node

    def parse_factor(self):
        t = self.peek()
        if t.type == 'INT':
            self.advance()
            return Number(value=t.value)
        if t.type == 'FLOAT':
            self.advance()
            return Number(value=t.value)
        if t.type == 'STRING':
            self.advance()
            return String(value=t.value)
        if t.type == 'IDENT':
            # could be a call like f(...) or identifier (possibly indexed)
            name = t.value
            self.advance()
            if self.peek() and self.peek().type == 'LPAREN':
                # function call with ident name
                self.expect('LPAREN')
                args = []
                while self.peek() and self.peek().type != 'RPAREN':
                    args.append(self.parse_expression())
                    if self.peek() and self.peek().type == 'COMMA':
                        self.advance()
                self.expect('RPAREN')
                return Call(callee=name, args=args)
            # handle index access e.g., a[0]
            if self.peek() and self.peek().type == 'LBRACKET':
                self.advance()
                idx = self.parse_expression()
                self.expect('RBRACKET')
                return BinOp(left=Identifier(name=name), op='[]', right=idx)
            return Identifier(name=name)
        if t.type == 'KEYWORD':
            # calls like DICE_PROF_OAK(...)
            if self.pos+1 < len(self.tokens) and self.tokens[self.pos+1].type == 'LPAREN':
                name = self.advance().value
                self.expect('LPAREN')
                args = []
                while self.peek() and self.peek().type != 'RPAREN':
                    args.append(self.parse_expression())
                    if self.peek() and self.peek().type == 'COMMA':
                        self.advance()
                self.expect('RPAREN')
                return Call(callee=name, args=args)
        if t.type == 'LPAREN':
            self.advance()
            node = self.parse_expression()
            self.expect('RPAREN')
            return node
        raise ParseError(f'Unexpected token in expression: {t}')


def parse_text(text: str) -> Program:
    tokens = tokenize_text(text)
    p = Parser(tokens)
    return p.parse()
