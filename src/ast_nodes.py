from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class Node:
    pass


@dataclass
class Program(Node):
    functions: List['FunctionDecl']
    top_level: List[Node] = None


@dataclass
class FunctionDecl(Node):
    name: str
    # params: list of (param_name, type_name)
    params: List[Tuple[str, str]]
    return_type: Optional[str]
    body: List[Node]


@dataclass
class EquipoDecl(Node):
    name: str
    type_name: str
    capacity: int


@dataclass
class MochilaDecl(Node):
    name: str
    type_name: str


@dataclass
class RadarDecl(Node):
    name: str
    type_name: str


@dataclass
class VarAssign(Node):
    target: object
    expr: 'Expr'


@dataclass
class Capture(Node):
    name: str
    type_name: str
    default: Optional[str]


@dataclass
class IfStmt(Node):
    cond: 'Expr'
    then_body: List[Node]
    else_body: Optional[List[Node]]


@dataclass
class WhileStmt(Node):
    cond: 'Expr'
    body: List[Node]


@dataclass
class ReturnStmt(Node):
    expr: Optional['Expr']


@dataclass
class Expr(Node):
    pass


@dataclass
class BinOp(Expr):
    left: Expr
    op: str
    right: Expr


@dataclass
class Number(Expr):
    value: str


@dataclass
class String(Expr):
    value: str


@dataclass
class Identifier(Expr):
    name: str


@dataclass
class Call(Expr):
    callee: str
    args: List[Expr]
