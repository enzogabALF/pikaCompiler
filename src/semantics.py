from typing import Any, Dict, List, Optional
from .ast_nodes import *


class SemanticError(Exception):
    pass


class SemanticAnalyzer:
    def __init__(self, program: Program):
        self.program = program
        self.scopes: List[Dict[str, Dict[str, Any]]] = [{}]
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.current_function: Optional[str] = None
        self.current_function_has_return: bool = False

    def push_scope(self):
        self.scopes.append({})

    def pop_scope(self):
        self.scopes.pop()

    def declare(self, name: str, info: Dict[str, Any]):
        if name in self.scopes[-1]:
            self.errors.append(f"Duplicate declaration of '{name}' in same scope")
        self.scopes[-1][name] = info

    def lookup(self, name: str) -> Optional[Dict[str, Any]]:
        for s in reversed(self.scopes):
            if name in s:
                return s[name]
        return None

    def type_of_decl_name(self, type_name: str) -> str:
        mapping = {
            'PokeBall': 'int',
            'SuperBall': 'float',
            'UltraBall': 'char',
            'MasterBall': 'bool',
        }
        return mapping.get(type_name, 'unknown')

    def analyze(self):
        # analyze top-level statements first
        if getattr(self.program, 'top_level', None):
            for stmt in self.program.top_level:
                self.analyze_stmt(stmt)

        # declare functions in global scope with signatures
        for func in self.program.functions:
            if func.name in self.scopes[0]:
                self.errors.append(f"Duplicate function '{func.name}'")
            # map param types to base types
            param_bases = [self.type_of_decl_name(t) for (_, t) in func.params]
            ret_base = self.type_of_decl_name(func.return_type) if func.return_type else None
            self.scopes[0][func.name] = {'kind': 'function', 'params': param_bases, 'return': ret_base}

        for func in self.program.functions:
            self.current_function = func.name
            # push a new scope for function and declare parameters
            self.push_scope()
            for (pname, ptype) in func.params:
                base = self.type_of_decl_name(ptype)
                self.declare(pname, {'kind': 'var', 'base': base})
            # reset return tracking
            self.current_function_has_return = False
            for stmt in func.body:
                self.analyze_stmt(stmt)
            self.pop_scope()
            # if function has declared return type but no return found -> warning
            func_info = self.lookup(func.name)
            expected = func_info.get('return') if func_info else None
            if expected and not self.current_function_has_return:
                self.warnings.append(f"Function '{func.name}' declares return {expected} but has no RETORNA")
            self.current_function = None
        return self.errors

    def analyze_stmt(self, stmt: Node):
        if isinstance(stmt, Capture):
            base = self.type_of_decl_name(stmt.type_name)
            # check default type matches
            if stmt.default is not None:
                # default is string numeral; create a fake Number or String
                if stmt.default.isdigit():
                    default_type = 'int'
                elif stmt.default.replace('.', '', 1).isdigit():
                    default_type = 'float'
                else:
                    default_type = 'string'
                if default_type != base and not (base == 'float' and default_type == 'int'):
                    self.errors.append(f"Default value for '{stmt.name}' ({default_type}) incompatible with declared type {base}")
            self.declare(stmt.name, {'kind': 'var', 'base': base})
        elif isinstance(stmt, EquipoDecl):
            base = self.type_of_decl_name(stmt.type_name)
            if stmt.capacity > 6:
                self.errors.append(f"Equipo '{stmt.name}' capacidad {stmt.capacity} > 6")
            if stmt.capacity < 1:
                self.errors.append(f"Equipo '{stmt.name}' capacidad {stmt.capacity} < 1")
            self.declare(stmt.name, {'kind': 'array', 'base': base, 'capacity': stmt.capacity})
        elif isinstance(stmt, MochilaDecl):
            base = self.type_of_decl_name(stmt.type_name)
            self.declare(stmt.name, {'kind': 'list', 'base': base})
        elif isinstance(stmt, RadarDecl):
            base = self.type_of_decl_name(stmt.type_name)
            if base == 'unknown':
                self.errors.append(f"Radar '{stmt.name}' uses unknown type '{stmt.type_name}'")
            self.declare(stmt.name, {'kind': 'radar', 'base': base})
        elif isinstance(stmt, VarAssign):
            left_type = self.eval_lvalue_type(stmt.target)
            right_type = self.eval_expr_type(stmt.expr)
            if left_type == 'unknown' or right_type == 'unknown':
                # cannot fully check
                return
            # allow numeric promotions int->float
            if left_type == right_type:
                return
            if left_type == 'float' and right_type == 'int':
                return
            self.errors.append(f"Type error: cannot assign {right_type} to {left_type}")
            # if assigning to array with literal index, check capacity
            if isinstance(stmt.target, BinOp) and stmt.target.op == '[]':
                left = stmt.target.left
                idx = stmt.target.right
                if isinstance(left, Identifier) and isinstance(idx, Number):
                    info = self.lookup(left.name)
                    if info and 'capacity' in info:
                        try:
                            idx_val = int(idx.value)
                            if idx_val < 0 or idx_val >= info['capacity']:
                                self.errors.append(f"Index {idx_val} out of bounds for '{left.name}' (capacity {info['capacity']})")
                        except Exception:
                            pass
        elif isinstance(stmt, Call):
            # check args types if builtin known
            for a in stmt.args:
                self.eval_expr_type(a)
            # check special builtins
            if stmt.callee == 'DEVOLVER_A_LA_BALL':
                if not self.current_function or not self.current_function.startswith('MOVIMIENTO'):
                    self.errors.append("'DEVOLVER_A_LA_BALL' only allowed inside 'MOVIMIENTO' functions")
            # warn on unknown calls
            if self.builtin_call_type(stmt.callee, stmt.args) == 'unknown':
                self.warnings.append(f"Call to unknown function '{stmt.callee}' treated as external")
        elif isinstance(stmt, IfStmt):
            cond_t = self.eval_expr_type(stmt.cond)
            if cond_t not in ('bool', 'int', 'float'):
                self.errors.append(f"If condition has non-boolean type '{cond_t}'")
            self.push_scope()
            for s in stmt.then_body:
                self.analyze_stmt(s)
            self.pop_scope()
            if stmt.else_body:
                self.push_scope()
                for s in stmt.else_body:
                    self.analyze_stmt(s)
                self.pop_scope()
        elif isinstance(stmt, WhileStmt):
            cond_t = self.eval_expr_type(stmt.cond)
            if cond_t not in ('bool', 'int', 'float'):
                self.errors.append(f"While condition has non-boolean type '{cond_t}'")
            self.push_scope()
            for s in stmt.body:
                self.analyze_stmt(s)
            self.pop_scope()
        elif isinstance(stmt, ReturnStmt):
            # ensure function context
            if not self.current_function:
                self.errors.append("'RETORNA' used outside of function")
                return
            self.current_function_has_return = True
            func_info = self.lookup(self.current_function)
            expected = func_info.get('return') if func_info else None
            expr_t = 'void'
            if stmt.expr is not None:
                expr_t = self.eval_expr_type(stmt.expr)
            else:
                expr_t = 'void'
            if expected is None:
                if expr_t != 'void':
                    self.errors.append(f"Function '{self.current_function}' has no return type but RETORNA has expression")
            else:
                if expected == 'unknown':
                    return
                if expr_t == 'unknown':
                    return
                if expected == expr_t:
                    return
                if expected == 'float' and expr_t == 'int':
                    return
                self.errors.append(f"Return type mismatch in '{self.current_function}': expected {expected}, got {expr_t}")
        else:
            # unknown statement types
            pass

    def eval_lvalue_type(self, target: Any) -> str:
        if isinstance(target, Identifier):
            info = self.lookup(target.name)
            if not info:
                self.errors.append(f"Undeclared identifier '{target.name}'")
                return 'unknown'
            if info['kind'] in ('var', 'radar'):
                return info['base']
            if info['kind'] in ('array', 'list'):
                return info['base']
            return 'unknown'
        if isinstance(target, BinOp) and target.op == '[]':
            # left should be identifier referring to array/list
            if isinstance(target.left, Identifier):
                info = self.lookup(target.left.name)
                if not info:
                    self.errors.append(f"Undeclared identifier '{target.left.name}'")
                    return 'unknown'
                if info['kind'] not in ('array', 'list'):
                    self.errors.append(f"'{target.left.name}' is not indexable")
                    return 'unknown'
                # check index type is int
                idx_t = self.eval_expr_type(target.right)
                if idx_t != 'int':
                    self.errors.append(f"Array index for '{target.left.name}' should be int, got {idx_t}")
                return info['base']
        if isinstance(target, Call):
            # some calls act as l-values (MIRAR_RADAR)
            return self.builtin_call_type(target.callee, target.args, as_lvalue=True)
        # fallback
        return 'unknown'

    def eval_expr_type(self, expr: Any) -> str:
        if isinstance(expr, Number):
            # decide int vs float naive
            if '.' in expr.value:
                return 'float'
            return 'int'
        if isinstance(expr, String):
            return 'string'
        if isinstance(expr, Identifier):
            info = self.lookup(expr.name)
            if not info:
                self.errors.append(f"Undeclared identifier '{expr.name}'")
                return 'unknown'
            return info['base']
        if isinstance(expr, BinOp):
            if expr.op == '[]':
                # indexing
                if isinstance(expr.left, Identifier):
                    info = self.lookup(expr.left.name)
                    if not info:
                        self.errors.append(f"Undeclared identifier '{expr.left.name}'")
                        return 'unknown'
                    return info.get('base', 'unknown')
            left_t = self.eval_expr_type(expr.left)
            right_t = self.eval_expr_type(expr.right)
            if expr.op in ('+', '-', '*', '/'):
                if left_t == 'float' or right_t == 'float':
                    return 'float'
                if left_t == 'int' and right_t == 'int':
                    return 'int'
                # allow int with unknown
                return left_t if left_t != 'unknown' else right_t
            if expr.op in ('<', '>', '==', '!=', '<=', '>='):
                return 'bool'
            return 'unknown'
        if isinstance(expr, Call):
            # check if function declared
            info = self.lookup(expr.callee)
            if info and info.get('kind') == 'function':
                # verify arg count and types
                expected = info.get('params', [])
                if len(expected) != len(expr.args):
                    self.errors.append(f"Call to '{expr.callee}' expects {len(expected)} args, got {len(expr.args)}")
                else:
                    for i, a in enumerate(expr.args):
                        at = self.eval_expr_type(a)
                        if expected[i] != 'unknown' and at != expected[i] and not (expected[i] == 'float' and at == 'int'):
                            self.errors.append(f"Arg {i} of call '{expr.callee}' expects {expected[i]}, got {at}")
                return info.get('return', 'unknown') or 'unknown'
            return self.builtin_call_type(expr.callee, expr.args)
        return 'unknown'

    def builtin_call_type(self, name: str, args: List[Any], as_lvalue: bool = False) -> str:
        # basic builtins mapping
        mapping = {
            'OAK_PREGUNTA': 'int',
            'DICE_PROF_OAK': 'void',
            'UBICACION_DE': 'int',
            'MIRAR_RADAR': 'int',
            'DEVOLVER_A_LA_BALL': 'int',
        }
        t = mapping.get(name, 'unknown')
        # MIRAR_RADAR can be used as l-value in our language
        if as_lvalue and name == 'MIRAR_RADAR':
            return 'int'
        if as_lvalue and name == 'DEVOLVER_A_LA_BALL':
            return 'int'
        return t
