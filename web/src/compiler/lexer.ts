import { createToken, Lexer } from 'chevrotain'

// Base identifier
export const Identifier = createToken({ name: 'Identifier', pattern: /[A-Za-z_][A-Za-z0-9_]*/ })

// Keywords (using longer_alt: Identifier to ensure they don't match partially)
export const PuebloNatal = createToken({ name: 'PuebloNatal', pattern: /PUEBLO_NATAL/, longer_alt: Identifier })
export const Movimiento = createToken({ name: 'Movimiento', pattern: /MOVIMIENTO/, longer_alt: Identifier })
export const Captura = createToken({ name: 'Captura', pattern: /CAPTURA/, longer_alt: Identifier })
export const En = createToken({ name: 'En', pattern: /EN/, longer_alt: Identifier })
export const Con = createToken({ name: 'Con', pattern: /CON/, longer_alt: Identifier })
export const Equipo = createToken({ name: 'Equipo', pattern: /EQUIPO/, longer_alt: Identifier })
export const De = createToken({ name: 'De', pattern: /DE/, longer_alt: Identifier })
export const Capacidad = createToken({ name: 'Capacidad', pattern: /CAPACIDAD/, longer_alt: Identifier })
export const Mochila = createToken({ name: 'Mochila', pattern: /MOCHILA/, longer_alt: Identifier })
export const Radar = createToken({ name: 'Radar', pattern: /RADAR/, longer_alt: Identifier })
export const ApuntaA = createToken({ name: 'ApuntaA', pattern: /APUNTA_A/, longer_alt: Identifier })
export const SiEntrenadorDesafia = createToken({ name: 'SiEntrenadorDesafia', pattern: /SI_ENTRENADOR_DESAFIA/, longer_alt: Identifier })
export const Sino = createToken({ name: 'Sino', pattern: /SINO/, longer_alt: Identifier })
export const MientrasTengaPs = createToken({ name: 'MientrasTengaPs', pattern: /MIENTRAS_TENGA_PS/, longer_alt: Identifier })
export const Retorna = createToken({ name: 'Retorna', pattern: /RETORNA/, longer_alt: Identifier })

// Type keywords
export const PokeBall = createToken({ name: 'PokeBall', pattern: /PokeBall/, longer_alt: Identifier })
export const SuperBall = createToken({ name: 'SuperBall', pattern: /SuperBall/, longer_alt: Identifier })
export const UltraBall = createToken({ name: 'UltraBall', pattern: /UltraBall/, longer_alt: Identifier })
export const MasterBall = createToken({ name: 'MasterBall', pattern: /MasterBall/, longer_alt: Identifier })

// Special LValue Builtins
export const MirarRadar = createToken({ name: 'MirarRadar', pattern: /MIRAR_RADAR/, longer_alt: Identifier })
export const DevolverALaBall = createToken({ name: 'DevolverALaBall', pattern: /DEVOLVER_A_LA_BALL/, longer_alt: Identifier })

// Operators
export const Equal = createToken({ name: 'Equal', pattern: /==/ })
export const NotEqual = createToken({ name: 'NotEqual', pattern: /!=/ })
export const LessEqual = createToken({ name: 'LessEqual', pattern: /<=/ })
export const GreaterEqual = createToken({ name: 'GreaterEqual', pattern: />=/ })
export const LessThan = createToken({ name: 'LessThan', pattern: /</ })
export const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ })
export const Assign = createToken({ name: 'Assign', pattern: /=/ })

export const Plus = createToken({ name: 'Plus', pattern: /\+/ })
export const Minus = createToken({ name: 'Minus', pattern: /-/ })
export const Mult = createToken({ name: 'Mult', pattern: /\*/ })
export const Div = createToken({ name: 'Div', pattern: /\// })

// Punctuation
export const LParen = createToken({ name: 'LParen', pattern: /\(/ })
export const RParen = createToken({ name: 'RParen', pattern: /\)/ })
export const LBrace = createToken({ name: 'LBrace', pattern: /\{/ })
export const RBrace = createToken({ name: 'RBrace', pattern: /\}/ })
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ })
export const RBracket = createToken({ name: 'RBracket', pattern: /\]/ })
export const Comma = createToken({ name: 'Comma', pattern: /,/ })
export const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ })
export const Colon = createToken({ name: 'Colon', pattern: /:/ })

// Literals
export const Float = createToken({ name: 'Float', pattern: /\d+\.\d+/ })
export const Int = createToken({ name: 'Int', pattern: /\d+/ })
export const StringLiteral = createToken({ name: 'StringLiteral', pattern: /"[^"\\]*(?:\\.[^"\\]*)*"/ })

// Ignored
export const CommentSingle = createToken({ name: 'CommentSingle', pattern: /\/\/[^\n\r]*/, group: Lexer.SKIPPED })
export const CommentMulti = createToken({ name: 'CommentMulti', pattern: /\/\*[\s\S]*?\*\//, group: Lexer.SKIPPED })
export const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /[ \t\n\r]+/, group: Lexer.SKIPPED })

export const allTokens = [
  WhiteSpace,
  CommentSingle,
  CommentMulti,

  // Keywords (longest first / longer_alt handles priority, but keep here)
  PuebloNatal,
  Movimiento,
  Captura,
  En,
  Con,
  Equipo,
  De,
  Capacidad,
  Mochila,
  Radar,
  ApuntaA,
  SiEntrenadorDesafia,
  Sino,
  MientrasTengaPs,
  Retorna,

  // Type Keywords
  PokeBall,
  SuperBall,
  UltraBall,
  MasterBall,

  // Special LValue Builtins
  MirarRadar,
  DevolverALaBall,

  // Multi-char operators
  Equal,
  NotEqual,
  LessEqual,
  GreaterEqual,

  // Single-char operators
  LessThan,
  GreaterThan,
  Assign,
  Plus,
  Minus,
  Mult,
  Div,

  // Punctuation
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Comma,
  Semicolon,
  Colon,

  // Literals (Float before Int!)
  Float,
  Int,
  StringLiteral,

  // Identifier
  Identifier
]

export const PokeLexer = new Lexer(allTokens)
