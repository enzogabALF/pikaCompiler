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
});
