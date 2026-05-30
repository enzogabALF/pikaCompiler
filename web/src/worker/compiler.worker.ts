import { createToken, Lexer, CstParser } from 'chevrotain'

// Minimal tokens for PokeLang subset
const Identifier = createToken({ name: 'Identifier', pattern: /[A-Za-z_][A-Za-z0-9_]*/ })
const Int = createToken({ name: 'Int', pattern: /\d+/ })
const LParen = createToken({ name: 'LParen', pattern: /\(/ })
const RParen = createToken({ name: 'RParen', pattern: /\)/ })
const LBrace = createToken({ name: 'LBrace', pattern: /\{/ })
const RBrace = createToken({ name: 'RBrace', pattern: /\}/ })
const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ })
const Comma = createToken({ name: 'Comma', pattern: /,/ })
const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /[ \t\n\r]+/, group: Lexer.SKIPPED })

const allTokens = [WhiteSpace, LParen, RParen, LBrace, RBrace, Semicolon, Comma, Int, Identifier]
const PokeLexer = new Lexer(allTokens)

class PokeParser extends CstParser {
  constructor() {
    super(allTokens)
    const $ = this
    $.RULE('program', () => {
      $.MANY(() => {
        $.SUBRULE($.functionDecl)
      })
    })
    $.RULE('functionDecl', () => {
      $.CONSUME(Identifier)
      $.CONSUME(LParen)
      $.CONSUME(RParen)
      $.CONSUME(LBrace)
      $.MANY(() => $.CONSUME(Identifier))
      $.CONSUME(RBrace)
      $.CONSUME(Semicolon)
    })
    this.performSelfAnalysis()
  }
}

const parser = new PokeParser()

onmessage = (e) => {
  const code = e.data.code || ''
  const lexResult = PokeLexer.tokenize(code)
  if (lexResult.errors.length) {
    postMessage({ type: 'errors', errors: lexResult.errors.map(err => err.message) })
    return
  }
  parser.input = lexResult.tokens
  const cst = parser.program()
  if (parser.errors.length) {
    postMessage({ type: 'errors', errors: parser.errors.map(err => err.message) })
    return
  }
  postMessage({ type: 'result', text: 'Parsed OK' })
}
