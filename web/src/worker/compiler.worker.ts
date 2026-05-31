import { PokeLexer } from '../compiler/lexer'
import { parser } from '../compiler/parser'
import { cstToAst } from '../compiler/ast'

onmessage = (e) => {
  const code = e.data.code || ''
  const lexResult = PokeLexer.tokenize(code)
  
  if (lexResult.errors.length) {
    postMessage({
      type: 'errors',
      errors: lexResult.errors.map(err => `Lexical error: [Line ${err.line}, Col ${err.column}] ${err.message}`)
    })
    return
  }
  
  parser.input = lexResult.tokens
  const cst = parser.program()
  
  if (parser.errors.length) {
    postMessage({
      type: 'errors',
      errors: parser.errors.map(err => `Syntax error: ${err.message}`)
    })
    return
  }
  
  try {
    const ast = cstToAst(cst)
    postMessage({
      type: 'result',
      text: 'Parsed OK!\n\n--- AST GENERADO ---\n' + JSON.stringify(ast, null, 2),
      ast
    })
  } catch (err: any) {
    postMessage({
      type: 'errors',
      errors: [`AST Translation Error: ${err.message}`]
    })
  }
}
