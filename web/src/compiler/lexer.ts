import { createToken, Lexer } from 'chevrotain';

export const TokenNames = {
  Identifier: 'Identifier',
  Int: 'Int',
  Float: 'Float',
  String: 'String',
  LineComment: 'LineComment',
  BlockComment: 'BlockComment',
  LParen: 'LParen',
  RParen: 'RParen',
  LBrace: 'LBrace',
  RBrace: 'RBrace',
  LBracket: 'LBracket',
  RBracket: 'RBracket',
  Comma: 'Comma',
  Semicolon: 'Semicolon',
  Colon: 'Colon',
  Assign: 'Assign',
  Plus: 'Plus',
  Minus: 'Minus',
  Mult: 'Mult',
  Div: 'Div',
  LessThan: 'LessThan',
  GreaterThan: 'GreaterThan',
  LessEqual: 'LessEqual',
  GreaterEqual: 'GreaterEqual',
  Equal: 'Equal',
  NotEqual: 'NotEqual',
  KeywordMovimiento: 'KeywordMovimiento',
  KeywordPuebloNatal: 'KeywordPuebloNatal',
  KeywordCaptura: 'KeywordCaptura',
  KeywordEn: 'KeywordEn',
  KeywordCon: 'KeywordCon',
  KeywordEquipo: 'KeywordEquipo',
  KeywordDe: 'KeywordDe',
  KeywordCapacidad: 'KeywordCapacidad',
  KeywordMochila: 'KeywordMochila',
  KeywordRadar: 'KeywordRadar',
  KeywordApuntaA: 'KeywordApuntaA',
  KeywordSiEntrenadorDesafia: 'KeywordSiEntrenadorDesafia',
  KeywordSino: 'KeywordSino',
  KeywordMientrasTengaPs: 'KeywordMientrasTengaPs',
  KeywordRetorna: 'KeywordRetorna',
  KeywordPokeBall: 'KeywordPokeBall',
  KeywordSuperBall: 'KeywordSuperBall',
  KeywordUltraBall: 'KeywordUltraBall',
  KeywordMasterBall: 'KeywordMasterBall',
  SpecialMirarRadar: 'SpecialMirarRadar',
  SpecialDevolverALaBall: 'SpecialDevolverALaBall',
  SpecialMochilaGuardar: 'SpecialMochilaGuardar',
  SpecialMochilaSacar: 'SpecialMochilaSacar',
  SpecialMochilaCantidadDe: 'SpecialMochilaCantidadDe',
} as const;

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t\n\r]+/,
  group: Lexer.SKIPPED,
});
export const LineComment = createToken({
  name: TokenNames.LineComment,
  pattern: /\/\/[^\n\r]*/,
  group: Lexer.SKIPPED,
});
export const BlockComment = createToken({
  name: TokenNames.BlockComment,
  pattern: /\/\*[\s\S]*?\*\//,
  group: Lexer.SKIPPED,
});
export const Float = createToken({ name: TokenNames.Float, pattern: /\d+\.\d+/ });
export const Int = createToken({ name: TokenNames.Int, pattern: /\d+/ });
export const StringLiteral = createToken({ name: TokenNames.String, pattern: /"(?:[^"\\]|\\.)*"/ });

export const KeywordMovimiento = createToken({
  name: TokenNames.KeywordMovimiento,
  pattern: /MOVIMIENTO\b/,
});
export const KeywordPuebloNatal = createToken({
  name: TokenNames.KeywordPuebloNatal,
  pattern: /PUEBLO_NATAL\b/,
});
export const KeywordCaptura = createToken({
  name: TokenNames.KeywordCaptura,
  pattern: /CAPTURA\b/,
});
export const KeywordEn = createToken({ name: TokenNames.KeywordEn, pattern: /EN\b/ });
export const KeywordCon = createToken({ name: TokenNames.KeywordCon, pattern: /CON\b/ });
export const KeywordEquipo = createToken({ name: TokenNames.KeywordEquipo, pattern: /EQUIPO\b/ });
export const KeywordDe = createToken({ name: TokenNames.KeywordDe, pattern: /DE\b/ });
export const KeywordCapacidad = createToken({
  name: TokenNames.KeywordCapacidad,
  pattern: /CAPACIDAD\b/,
});
export const KeywordMochila = createToken({
  name: TokenNames.KeywordMochila,
  pattern: /MOCHILA\b/,
});
export const KeywordRadar = createToken({ name: TokenNames.KeywordRadar, pattern: /RADAR\b/ });
export const KeywordApuntaA = createToken({
  name: TokenNames.KeywordApuntaA,
  pattern: /APUNTA_A\b/,
});
export const KeywordSiEntrenadorDesafia = createToken({
  name: TokenNames.KeywordSiEntrenadorDesafia,
  pattern: /SI_ENTRENADOR_DESAFIA\b/,
});
export const KeywordSino = createToken({ name: TokenNames.KeywordSino, pattern: /SINO\b/ });
export const KeywordMientrasTengaPs = createToken({
  name: TokenNames.KeywordMientrasTengaPs,
  pattern: /MIENTRAS_TENGA_PS\b/,
});
export const KeywordRetorna = createToken({
  name: TokenNames.KeywordRetorna,
  pattern: /RETORNA\b/,
});
export const KeywordPokeBall = createToken({
  name: TokenNames.KeywordPokeBall,
  pattern: /PokeBall\b/,
});
export const KeywordSuperBall = createToken({
  name: TokenNames.KeywordSuperBall,
  pattern: /SuperBall\b/,
});
export const KeywordUltraBall = createToken({
  name: TokenNames.KeywordUltraBall,
  pattern: /UltraBall\b/,
});
export const KeywordMasterBall = createToken({
  name: TokenNames.KeywordMasterBall,
  pattern: /MasterBall\b/,
});

export const PuebloNatal = KeywordPuebloNatal;
export const Movimiento = KeywordMovimiento;
export const Captura = KeywordCaptura;
export const En = KeywordEn;
export const Con = KeywordCon;
export const Equipo = KeywordEquipo;
export const De = KeywordDe;
export const Capacidad = KeywordCapacidad;
export const Mochila = KeywordMochila;
export const Radar = KeywordRadar;
export const ApuntaA = KeywordApuntaA;
export const SiEntrenadorDesafia = KeywordSiEntrenadorDesafia;
export const Sino = KeywordSino;
export const MientrasTengaPs = KeywordMientrasTengaPs;
export const Retorna = KeywordRetorna;
export const PokeBall = KeywordPokeBall;
export const SuperBall = KeywordSuperBall;
export const UltraBall = KeywordUltraBall;
export const MasterBall = KeywordMasterBall;

export const MirarRadar = createToken({
  name: TokenNames.SpecialMirarRadar,
  pattern: /MIRAR_RADAR\b/,
});
export const DevolverALaBall = createToken({
  name: TokenNames.SpecialDevolverALaBall,
  pattern: /DEVOLVER_A_LA_BALL\b/,
});
export const MochilaGuardar = createToken({
  name: TokenNames.SpecialMochilaGuardar,
  pattern: /GUARDAR\b/,
});
export const MochilaSacar = createToken({
  name: TokenNames.SpecialMochilaSacar,
  pattern: /SACAR\b/,
});
export const MochilaCantidadDe = createToken({
  name: TokenNames.SpecialMochilaCantidadDe,
  pattern: /CANTIDAD_DE\b/,
});

export const LParen = createToken({ name: TokenNames.LParen, pattern: /\(/ });
export const RParen = createToken({ name: TokenNames.RParen, pattern: /\)/ });
export const LBrace = createToken({ name: TokenNames.LBrace, pattern: /\{/ });
export const RBrace = createToken({ name: TokenNames.RBrace, pattern: /\}/ });
export const LBracket = createToken({ name: TokenNames.LBracket, pattern: /\[/ });
export const RBracket = createToken({ name: TokenNames.RBracket, pattern: /\]/ });
export const Comma = createToken({ name: TokenNames.Comma, pattern: /,/ });
export const Semicolon = createToken({ name: TokenNames.Semicolon, pattern: /;/ });
export const Colon = createToken({ name: TokenNames.Colon, pattern: /:/ });
export const Assign = createToken({ name: TokenNames.Assign, pattern: /=/ });
export const LessEqual = createToken({ name: TokenNames.LessEqual, pattern: /<=/ });
export const GreaterEqual = createToken({ name: TokenNames.GreaterEqual, pattern: />=/ });
export const Equal = createToken({ name: TokenNames.Equal, pattern: /==/ });
export const NotEqual = createToken({ name: TokenNames.NotEqual, pattern: /!=/ });
export const Plus = createToken({ name: TokenNames.Plus, pattern: /\+/ });
export const Minus = createToken({ name: TokenNames.Minus, pattern: /-/ });
export const Mult = createToken({ name: TokenNames.Mult, pattern: /\*/ });
export const Div = createToken({ name: TokenNames.Div, pattern: /\// });
export const LessThan = createToken({ name: TokenNames.LessThan, pattern: /</ });
export const GreaterThan = createToken({ name: TokenNames.GreaterThan, pattern: />/ });
export const Identifier = createToken({
  name: TokenNames.Identifier,
  pattern: /[A-Za-z_][A-Za-z0-9_]*/,
});

export const allTokens = [
  WhiteSpace,
  LineComment,
  BlockComment,
  Float,
  Int,
  StringLiteral,
  KeywordMovimiento,
  KeywordPuebloNatal,
  KeywordCaptura,
  KeywordEn,
  KeywordCon,
  KeywordEquipo,
  KeywordDe,
  KeywordCapacidad,
  KeywordMochila,
  KeywordRadar,
  KeywordApuntaA,
  KeywordSiEntrenadorDesafia,
  KeywordSino,
  KeywordMientrasTengaPs,
  KeywordRetorna,
  KeywordPokeBall,
  KeywordSuperBall,
  KeywordUltraBall,
  KeywordMasterBall,
  MirarRadar,
  DevolverALaBall,
  MochilaGuardar,
  MochilaSacar,
  MochilaCantidadDe,
  LessEqual,
  GreaterEqual,
  Equal,
  NotEqual,
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Comma,
  Semicolon,
  Colon,
  Assign,
  Plus,
  Minus,
  Mult,
  Div,
  LessThan,
  GreaterThan,
  Identifier,
];

export const pokeLexer = new Lexer(allTokens);
export const PokeLexer = pokeLexer;

export type TokenizationResult = ReturnType<typeof pokeLexer.tokenize>;

export function tokenizePokeCode(code: string) {
  return pokeLexer.tokenize(code);
}
