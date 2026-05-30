import sys
import os
# Ensure project root on path so `src` package can be imported when running script
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root not in sys.path:
    sys.path.insert(0, root)
from src.lexer import tokenize_text
from src.parser import Parser


def main(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()
    tokens = tokenize_text(code)
    p = Parser(tokens)
    program = p.parse()
    # quick dump
    from dataclasses import asdict
    print(program)


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'examples/pueblo.pika'
    main(path)
