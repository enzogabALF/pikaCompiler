import { CstParser } from 'chevrotain';
import {
  allTokens,
  PuebloNatal,
  Movimiento,
  Identifier,
  LParen,
  RParen,
  Comma,
  Retorna,
  LBrace,
  RBrace,
  PokeBall,
  SuperBall,
  UltraBall,
  MasterBall,
  Colon,
  Captura,
  En,
  Con,
  Semicolon,
  Equipo,
  De,
  Capacidad,
  Mochila,
  Radar,
  ApuntaA,
  SiEntrenadorDesafia,
  Sino,
  MientrasTengaPs,
  MirarRadar,
  DevolverALaBall,
  MochilaGuardar,
  MochilaSacar,
  MochilaCantidadDe,
  Assign,
  LBracket,
  RBracket,
  Equal,
  NotEqual,
  LessThan,
  GreaterThan,
  LessEqual,
  GreaterEqual,
  Plus,
  Minus,
  Mult,
  Div,
  Float,
  Int,
  StringLiteral,
} from './lexer';

export class PokeParser extends CstParser {
  // Rules declaration for TypeScript typing
  public program!: any;
  public functionDecl!: any;
  public typeName!: any;
  public param!: any;
  public statement!: any;
  public captureDecl!: any;
  public equipoDecl!: any;
  public mochilaDecl!: any;
  public radarDecl!: any;
  public mochilaGuardarStmt!: any;
  public mochilaSacarExpr!: any;
  public mochilaCantidadDeExpr!: any;
  public ifStmt!: any;
  public whileStmt!: any;
  public returnStmt!: any;
  public specialAssignmentStmt!: any;
  public assignOrCallStmt!: any;
  public expr!: any;
  public additionExpr!: any;
  public multiplicationExpr!: any;
  public specialCallExpr!: any;
  public primaryExpr!: any;

  constructor() {
    super(allTokens);
    const $ = this;

    $.RULE('program', () => {
      $.MANY(() => {
        $.SUBRULE($.functionDecl);
      });
    });

    $.RULE('functionDecl', () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(PuebloNatal);
          },
        },
        {
          ALT: () => {
            $.CONSUME(Movimiento);
            $.CONSUME(Identifier);
          },
        },
      ]);
      $.CONSUME(LParen);
      $.OPTION(() => {
        $.SUBRULE($.param);
        $.MANY(() => {
          $.CONSUME(Comma);
          $.SUBRULE2($.param);
        });
      });
      $.CONSUME(RParen);
      $.OPTION2(() => {
        $.CONSUME(Retorna);
        $.SUBRULE($.typeName);
      });
      $.CONSUME(LBrace);
      $.MANY2(() => {
        $.SUBRULE($.statement);
      });
      $.CONSUME(RBrace);
    });

    $.RULE('typeName', () => {
      $.OR([
        { ALT: () => $.CONSUME(PokeBall) },
        { ALT: () => $.CONSUME(SuperBall) },
        { ALT: () => $.CONSUME(UltraBall) },
        { ALT: () => $.CONSUME(MasterBall) },
      ]);
    });

    $.RULE('param', () => {
      $.CONSUME(Identifier);
      $.CONSUME(Colon);
      $.SUBRULE($.typeName);
    });

    $.RULE('statement', () => {
      $.OR([
        { ALT: () => $.SUBRULE($.captureDecl) },
        { ALT: () => $.SUBRULE($.equipoDecl) },
        { ALT: () => $.SUBRULE($.mochilaDecl) },
        { ALT: () => $.SUBRULE($.radarDecl) },
        { ALT: () => $.SUBRULE($.mochilaGuardarStmt) },
        { ALT: () => $.SUBRULE($.ifStmt) },
        { ALT: () => $.SUBRULE($.whileStmt) },
        { ALT: () => $.SUBRULE($.returnStmt) },
        { ALT: () => $.SUBRULE($.specialAssignmentStmt) },
        { ALT: () => $.SUBRULE($.assignOrCallStmt) },
      ]);
    });

    $.RULE('captureDecl', () => {
      $.CONSUME(Captura);
      $.CONSUME(Identifier);
      $.CONSUME(En);
      $.SUBRULE($.typeName);
      $.CONSUME(Con);
      $.SUBRULE($.expr);
      $.CONSUME(Semicolon);
    });

    $.RULE('equipoDecl', () => {
      $.CONSUME(Equipo);
      $.CONSUME(Identifier);
      $.CONSUME(De);
      $.SUBRULE($.typeName);
      $.CONSUME(Capacidad);
      $.SUBRULE($.expr);
      $.CONSUME(Semicolon);
    });

    $.RULE('mochilaDecl', () => {
      $.CONSUME(Mochila);
      $.CONSUME(Identifier);
      $.CONSUME(De);
      $.SUBRULE($.typeName);
      $.CONSUME(Semicolon);
    });

    $.RULE('mochilaGuardarStmt', () => {
      $.CONSUME(MochilaGuardar);
      $.CONSUME(LParen);
      $.CONSUME(Identifier);
      $.CONSUME(Comma);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
      $.CONSUME(Semicolon);
    });

    $.RULE('radarDecl', () => {
      $.CONSUME(Radar);
      $.CONSUME(Identifier);
      $.CONSUME(ApuntaA);
      $.SUBRULE($.typeName);
      $.CONSUME(Semicolon);
    });

    $.RULE('ifStmt', () => {
      $.CONSUME(SiEntrenadorDesafia);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
      $.CONSUME(LBrace);
      $.MANY(() => {
        $.SUBRULE($.statement);
      });
      $.CONSUME(RBrace);
      $.OPTION(() => {
        $.CONSUME(Sino);
        $.CONSUME2(LBrace);
        $.MANY2(() => {
          $.SUBRULE2($.statement);
        });
        $.CONSUME2(RBrace);
      });
    });

    $.RULE('whileStmt', () => {
      $.CONSUME(MientrasTengaPs);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
      $.CONSUME(LBrace);
      $.MANY(() => {
        $.SUBRULE($.statement);
      });
      $.CONSUME(RBrace);
    });

    $.RULE('returnStmt', () => {
      $.CONSUME(Retorna);
      $.OPTION(() => {
        $.SUBRULE($.expr);
      });
      $.CONSUME(Semicolon);
    });

    $.RULE('specialAssignmentStmt', () => {
      $.OR([{ ALT: () => $.CONSUME(MirarRadar) }, { ALT: () => $.CONSUME(DevolverALaBall) }]);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
      $.CONSUME(Assign);
      $.SUBRULE2($.expr);
      $.CONSUME(Semicolon);
    });

    $.RULE('assignOrCallStmt', () => {
      $.CONSUME(Identifier);
      $.OR([
        {
          ALT: () => {
            $.CONSUME(LParen);
            $.OPTION(() => {
              $.SUBRULE($.expr);
              $.MANY(() => {
                $.CONSUME(Comma);
                $.SUBRULE2($.expr);
              });
            });
            $.CONSUME(RParen);
            $.CONSUME(Semicolon);
          },
        },
        {
          ALT: () => {
            $.CONSUME(LBracket);
            $.SUBRULE3($.expr);
            $.CONSUME(RBracket);
            $.CONSUME2(Assign);
            $.SUBRULE4($.expr);
            $.CONSUME2(Semicolon);
          },
        },
        {
          ALT: () => {
            $.CONSUME3(Assign);
            $.SUBRULE5($.expr);
            $.CONSUME3(Semicolon);
          },
        },
      ]);
    });

    $.RULE('expr', () => {
      $.SUBRULE($.additionExpr);
      $.OPTION(() => {
        $.OR([
          { ALT: () => $.CONSUME(Equal) },
          { ALT: () => $.CONSUME(NotEqual) },
          { ALT: () => $.CONSUME(LessThan) },
          { ALT: () => $.CONSUME(GreaterThan) },
          { ALT: () => $.CONSUME(LessEqual) },
          { ALT: () => $.CONSUME(GreaterEqual) },
        ]);
        $.SUBRULE2($.additionExpr);
      });
    });

    $.RULE('additionExpr', () => {
      $.SUBRULE($.multiplicationExpr);
      $.MANY(() => {
        $.OR([{ ALT: () => $.CONSUME(Plus) }, { ALT: () => $.CONSUME(Minus) }]);
        $.SUBRULE2($.multiplicationExpr);
      });
    });

    $.RULE('multiplicationExpr', () => {
      $.SUBRULE($.primaryExpr);
      $.MANY(() => {
        $.OR([{ ALT: () => $.CONSUME(Mult) }, { ALT: () => $.CONSUME(Div) }]);
        $.SUBRULE2($.primaryExpr);
      });
    });

    $.RULE('specialCallExpr', () => {
      $.OR([{ ALT: () => $.CONSUME(MirarRadar) }, { ALT: () => $.CONSUME(DevolverALaBall) }]);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
    });

    $.RULE('mochilaSacarExpr', () => {
      $.CONSUME(MochilaSacar);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
    });

    $.RULE('mochilaCantidadDeExpr', () => {
      $.CONSUME(MochilaCantidadDe);
      $.CONSUME(LParen);
      $.SUBRULE($.expr);
      $.CONSUME(RParen);
    });

    $.RULE('primaryExpr', () => {
      $.OR([
        { ALT: () => $.CONSUME(Float) },
        { ALT: () => $.CONSUME(Int) },
        { ALT: () => $.CONSUME(StringLiteral) },
        {
          ALT: () => {
            $.CONSUME(LParen);
            $.SUBRULE($.expr);
            $.CONSUME(RParen);
          },
        },
        { ALT: () => $.SUBRULE($.specialCallExpr) },
        { ALT: () => $.SUBRULE($.mochilaSacarExpr) },
        { ALT: () => $.SUBRULE($.mochilaCantidadDeExpr) },
        {
          ALT: () => {
            $.CONSUME(Identifier);
            $.OPTION(() => {
              $.OR2([
                {
                  ALT: () => {
                    $.CONSUME2(LParen);
                    $.OPTION2(() => {
                      $.SUBRULE2($.expr);
                      $.MANY(() => {
                        $.CONSUME(Comma);
                        $.SUBRULE3($.expr);
                      });
                    });
                    $.CONSUME2(RParen);
                  },
                },
                {
                  ALT: () => {
                    $.CONSUME(LBracket);
                    $.SUBRULE4($.expr);
                    $.CONSUME(RBracket);
                  },
                },
              ]);
            });
          },
        },
      ]);
    });

    this.performSelfAnalysis();
  }
}

export const parser = new PokeParser();
