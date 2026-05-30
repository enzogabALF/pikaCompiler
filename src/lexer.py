import re
from dataclasses import dataclass
from typing import List, Iterator


@dataclass
class Token:
    type: str
    value: str
    line: int
    column: int


class LexerError(Exception):
    pass


class Lexer:
    def __init__(self, code: str):
        self.code = code
        self.keywords = {
            # Types
            'PokeBall', 'SuperBall', 'UltraBall', 'MasterBall',
            # Control flow
            'SI_ENTRENADOR_DESAFIA', 'SINO', 'MIENTRAS_TENGA_PS', 'REPETIR_COMBATE',
            # Declarations / structures
            'MOVIMIENTO', 'DEVOLVER_A_LA_BALL', 'EQUIPO', 'MOCHILA', 'CAPACIDAD',
            # IO and helpers
            'DICE_PROF_OAK', 'CAPTURA', 'UBICACION_DE', 'RADAR', 'APUNTA_A', 'MIRAR_RADAR',
            'GUARDAR_EN_MOCHILA', 'SACAR_DE_MOCHILA', 'PUEBLO_NATAL',
              # Small words / helpers used in examples
              'EN', 'CON', 'DE', 'OAK_PREGUNTA', 'OAK_PREGUNTA_DIME_TU_GENERO',
              # Function return marker
              'RETORNA'
        }

        token_specification = [
            ('MCOMMENT', r'/\*[\s\S]*?\*/'),
            ('COMMENT', r'//.*'),
            ('STRING', r'"([^"\\]|\\.)*"'),
            ('CHAR', r"'([^'\\]|\\.)'"),
            ('FLOAT', r'\d+\.\d+'),
            ('INT', r'\d+'),
            ('ID', r'[A-Za-z_][A-Za-z0-9_]*'),
            ('ASSIGN', r'='),
            ('LBRACE', r'\{'),
            ('RBRACE', r'\}'),
            ('LPAREN', r'\('),
            ('RPAREN', r'\)'),
            ('COLON', r':'),
            ('LBRACKET', r'\['),
            ('RBRACKET', r'\]'),
            ('SEMICOLON', r';'),
            ('COMMA', r','),
            ('OP', r'<=|>=|==|!=|\+|\-|\*|\/|<|>'),
            ('NEWLINE', r'\n'),
            ('SKIP', r'[ \t\r]+'),
            ('MISMATCH', r'.'),
        ]

        parts = []
        for name, pattern in token_specification:
            parts.append(f"(?P<{name}>{pattern})")
        self.regex = re.compile('|'.join(parts))

    def tokenize(self) -> Iterator[Token]:
        line_num = 1
        line_start = 0
        for mo in self.regex.finditer(self.code):
            kind = mo.lastgroup
            value = mo.group(kind)
            column = mo.start() - line_start + 1
            if kind == 'NEWLINE':
                line_num += 1
                line_start = mo.end()
                continue
            elif kind == 'SKIP' or kind == 'COMMENT':
                continue
            elif kind == 'MCOMMENT':
                # update line numbers for multiline comments
                newlines = value.count('\n')
                if newlines:
                    line_num += newlines
                    # set line_start to position after last newline within the comment
                    last_nl = value.rfind('\n')
                    line_start = mo.start() + last_nl + 1
                continue
            elif kind == 'ID':
                if value in self.keywords:
                    yield Token('KEYWORD', value, line_num, column)
                else:
                    yield Token('IDENT', value, line_num, column)
            elif kind == 'INT':
                yield Token('INT', value, line_num, column)
            elif kind == 'FLOAT':
                yield Token('FLOAT', value, line_num, column)
            elif kind == 'STRING':
                # strip quotes and support escaped chars
                inner = value[1:-1]
                # update line numbers if string contains newlines
                newlines = inner.count('\n')
                if newlines:
                    line_num += newlines
                    last_nl = inner.rfind('\n')
                    line_start = mo.start() + 1 + last_nl + 1
                yield Token('STRING', inner, line_num, column)
            elif kind == 'CHAR':
                # strip single quotes and honor escapes
                val = value[1:-1]
                yield Token('CHAR', val, line_num, column)
            elif kind == 'MISMATCH':
                raise LexerError(f'Unexpected character {value!r} at {line_num}:{column}')
            else:
                yield Token(kind, value, line_num, column)


def tokenize_text(text: str) -> List[Token]:
    lexer = Lexer(text)
    return list(lexer.tokenize())


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        path = sys.argv[1]
        with open(path, 'r', encoding='utf-8') as f:
            code = f.read()
    else:
        code = sys.stdin.read()

    for tok in tokenize_text(code):
        print(f'{tok.line}:{tok.column}\t{tok.type}\t{tok.value}')
