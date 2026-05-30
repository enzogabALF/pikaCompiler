import sys
import os
import json

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root not in sys.path:
    sys.path.insert(0, root)

from src.lexer import tokenize_text
from src.parser import Parser
from src.semantics import SemanticAnalyzer


def compile_file(path: str, dump_ast: bool = False):
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()
    tokens = tokenize_text(code)
    p = Parser(tokens)
    program = p.parse()
    if dump_ast:
        # naive print
        print(program)
    analyzer = SemanticAnalyzer(program)
    errors = analyzer.analyze()
    if analyzer.warnings:
        print('Warnings:')
        for w in analyzer.warnings:
            print('-', w)
    if errors:
        print('Semantic errors:')
        for e in errors:
            print('-', e)
        return 2
    print('Compilation pipeline OK')
    return 0


def main():
    if len(sys.argv) < 2:
        print('Usage: python src/compile.py <file> [--ast]')
        sys.exit(1)
    path = sys.argv[1]
    dump = '--ast' in sys.argv
    rc = compile_file(path, dump_ast=dump)
    sys.exit(rc)


if __name__ == '__main__':
    main()
