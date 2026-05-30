import sys
import os
import json

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root not in sys.path:
    sys.path.insert(0, root)

from src.lexer import tokenize_text
from src.parser import Parser
from src.semantics import SemanticAnalyzer


def main(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()
    tokens = tokenize_text(code)
    p = Parser(tokens)
    program = p.parse()
    analyzer = SemanticAnalyzer(program)
    errors = analyzer.analyze()
    if analyzer.warnings:
        print('Warnings:')
        for w in analyzer.warnings:
            print('-', w)
    if errors:
        print('Semantic errors found:')
        for e in errors:
            print('-', e)
        sys.exit(2)
    print('Semantic analysis OK')


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'examples/pueblo.pika'
    main(path)
