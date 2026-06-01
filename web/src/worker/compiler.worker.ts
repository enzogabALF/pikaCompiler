import { cstToAst } from '../compiler/ast';
import { parser } from '../compiler/parser';
import { tokenizePokeCode } from '../compiler/lexer';
import { typeCheck } from '../compiler/semantics/typeChecker';

onmessage = (e) => {
  const code = e.data.code || '';
  const lexResult = tokenizePokeCode(code);

  if (lexResult.errors.length) {
    postMessage({
      type: 'errors',
      errors: lexResult.errors.map(
        (err) => `Lexical error: [Line ${err.line}, Col ${err.column}] ${err.message}`
      ),
    });
    return;
  }

  parser.input = lexResult.tokens;
  const cst = parser.program();

  if (parser.errors.length) {
    postMessage({
      type: 'errors',
      errors: parser.errors.map((err) => `Syntax error: ${err.message}`),
    });
    return;
  }

  try {
    const ast = cstToAst(cst);

    const semErrors = typeCheck(ast);
    if (semErrors.length) {
      postMessage({ type: 'errors', errors: semErrors.map((e) => `Semantic error: ${e}`) });
      return;
    }

    postMessage({
      type: 'result',
      text: 'Parsed OK!\n\n--- AST GENERADO ---\n' + JSON.stringify(ast, null, 2),
      ast,
    });
  } catch (err: any) {
    postMessage({ type: 'errors', errors: [`AST Translation Error: ${err.message}`] });
  }
};
