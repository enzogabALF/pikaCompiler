import { describe, expect, it } from 'vitest';
import { tokenizePokeCode, TokenNames } from './lexer';

function tokenNames(code: string) {
  const result = tokenizePokeCode(code);
  return result.tokens.map((token) => token.tokenType.name);
}

describe('poke lexer', () => {
  it('tokeniza identificadores, números y palabras reservadas', () => {
    const names = tokenNames('MOVIMIENTO curar() RETORNA PokeBall { captura1 = 42; }');

    expect(names).toEqual([
      TokenNames.KeywordMovimiento,
      TokenNames.Identifier,
      TokenNames.LParen,
      TokenNames.RParen,
      TokenNames.KeywordRetorna,
      TokenNames.KeywordPokeBall,
      TokenNames.LBrace,
      TokenNames.Identifier,
      TokenNames.Assign,
      TokenNames.Int,
      TokenNames.Semicolon,
      TokenNames.RBrace,
    ]);
  });

  it('distingue palabras reservadas completas de identificadores parecidos', () => {
    const names = tokenNames('MOVIMIENTOx PokeBall_1 RETORNAR CAPTURA_');

    expect(names).toEqual([
      TokenNames.Identifier,
      TokenNames.Identifier,
      TokenNames.Identifier,
      TokenNames.Identifier,
    ]);
  });

  it('tokeniza números flotantes, operadores y comentarios', () => {
    const result = tokenizePokeCode('1 + 2.5 // suma\n/* bloque */ - 3');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens.map((token) => token.tokenType.name)).toEqual([
      TokenNames.Int,
      TokenNames.Plus,
      TokenNames.Float,
      TokenNames.Minus,
      TokenNames.Int,
    ]);
  });

  it('tokeniza operadores relacionales y de igualdad', () => {
    const names = tokenNames('a <= b >= c == d != e < f > g = h');

    expect(names).toEqual([
      TokenNames.Identifier,
      TokenNames.LessEqual,
      TokenNames.Identifier,
      TokenNames.GreaterEqual,
      TokenNames.Identifier,
      TokenNames.Equal,
      TokenNames.Identifier,
      TokenNames.NotEqual,
      TokenNames.Identifier,
      TokenNames.LessThan,
      TokenNames.Identifier,
      TokenNames.GreaterThan,
      TokenNames.Identifier,
      TokenNames.Assign,
      TokenNames.Identifier,
    ]);
  });

  it('reconoce cadenas y delimitadores temáticos', () => {
    const names = tokenNames('CAPTURA nombre EN SuperBall CON "texto";');

    expect(names).toEqual([
      TokenNames.KeywordCaptura,
      TokenNames.Identifier,
      TokenNames.KeywordEn,
      TokenNames.KeywordSuperBall,
      TokenNames.KeywordCon,
      TokenNames.String,
      TokenNames.Semicolon,
    ]);
  });

  it('reconoce símbolos temáticos de lista, estructura y especiales', () => {
    const names = tokenNames(
      'MOCHILA [x, y]: EQUIPO DE 3 RADAR APUNTA_A MIRAR_RADAR DEVOLVER_A_LA_BALL'
    );

    expect(names).toEqual([
      TokenNames.KeywordMochila,
      TokenNames.LBracket,
      TokenNames.Identifier,
      TokenNames.Comma,
      TokenNames.Identifier,
      TokenNames.RBracket,
      TokenNames.Colon,
      TokenNames.KeywordEquipo,
      TokenNames.KeywordDe,
      TokenNames.Int,
      TokenNames.KeywordRadar,
      TokenNames.KeywordApuntaA,
      TokenNames.SpecialMirarRadar,
      TokenNames.SpecialDevolverALaBall,
    ]);
  });
});
