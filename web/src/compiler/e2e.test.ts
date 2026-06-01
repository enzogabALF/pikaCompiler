import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { typeCheck } from './semantics/typeChecker';
import { lowerProgramToIR, optimizeIR } from './ir';
import { executeProgram } from './interpreter';

function compileAndRun(code: string) {
  // 1. Lexer
  const lexResult = PokeLexer.tokenize(code);
  expect(lexResult.errors).toHaveLength(0);

  // 2. Parser
  parser.input = lexResult.tokens;
  const cst = parser.program();
  expect(parser.errors).toHaveLength(0);

  // 3. CST to AST
  const ast = cstToAst(cst);

  // 4. Semantic analysis
  const semanticErrors = typeCheck(ast);
  expect(semanticErrors).toHaveLength(0);

  // 5. Lower AST to IR
  const rawIr = lowerProgramToIR(ast);

  // 6. Optimize IR (Constant Folding)
  const optimizedIr = optimizeIR(rawIr);

  // 7. Execute Program
  const execution = executeProgram(ast);

  return { ast, rawIr, optimizedIr, execution };
}

describe('PokeLang Compiler E2E Integration Pipeline', () => {
  it('Caso 1: Combate con ciclos, bifurcaciones y optimización de IR', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("--- Combate Iniciado ---");
        CAPTURA mi_ps EN PokeBall CON 80;
        CAPTURA danio EN PokeBall CON 15 + 5; // Constantes a optimizar (20)
        
        // Simular ataque del oponente
        mi_ps = mi_ps - danio; // 80 - 20 = 60
        
        SI_ENTRENADOR_DESAFIA (mi_ps < 70) {
          DICE_PROF_OAK("¡Alerta! PS Bajos.");
          mi_ps = mi_ps + 30; // Curar -> 60 + 30 = 90
        }
        
        // Bucle de desgaste
        MIENTRAS_TENGA_PS (mi_ps > 85) {
          mi_ps = mi_ps - 2 * 2; // Constantes a optimizar (4) -> 90 - 4 = 86 -> 86 - 4 = 82
        }
        
        DICE_PROF_OAK("Combate terminado.");
        RETORNA mi_ps;
      }
    `;

    const { rawIr, optimizedIr, execution } = compileAndRun(code);

    // Verificar optimización de IR (Constant Folding)
    // 15 + 5 -> 20 en la IR Optimizada
    expect(rawIr.functions[0].body[2]).toMatchObject({
      type: 'IRDeclare',
      name: 'danio',
      value: { type: 'IRBinary', op: '+' },
    });

    expect(optimizedIr.functions[0].body[2]).toMatchObject({
      type: 'IRDeclare',
      name: 'danio',
      value: { type: 'IRLiteral', value: 20, valueType: 'int' },
    });

    // 2 * 2 -> 4 en la IR Optimizada
    const whileRaw = rawIr.functions[0].body[5] as any;
    expect(whileRaw.body[0].value).toMatchObject({
      type: 'IRBinary',
      op: '-',
    });

    const whileOpt = optimizedIr.functions[0].body[5] as any;
    expect(whileOpt.body[0].value).toMatchObject({
      type: 'IRBinary',
      op: '-',
      right: {
        type: 'IRLiteral',
        value: 4,
        valueType: 'int',
      },
    });

    // Verificar Ejecución del Intérprete
    expect(execution.entryFunction).toBe('PUEBLO_NATAL');
    expect(execution.returnValue).toBe(82);
    expect(execution.output).toEqual([
      '--- Combate Iniciado ---',
      '¡Alerta! PS Bajos.',
      'Combate terminado.',
    ]);
  });

  it('Caso 2: Nivel promedio de equipo Pokémon usando vectores (EQUIPO)', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Calculando niveles del equipo de inicio...");
        
        EQUIPO equipo_pokes DE PokeBall CAPACIDAD 3;
        equipo_pokes[0] = 10;
        equipo_pokes[1] = 15 + 5; // 20
        equipo_pokes[2] = 30;
        
        CAPTURA suma EN PokeBall CON equipo_pokes[0] + equipo_pokes[1] + equipo_pokes[2]; // 10 + 20 + 30 = 60
        CAPTURA promedio EN PokeBall CON suma / 3; // 60 / 3 = 20
        
        RETORNA promedio;
      }
    `;

    const { optimizedIr, execution } = compileAndRun(code);

    // Verificar optimización de la asignación del equipo
    expect(optimizedIr.functions[0].body[3]).toMatchObject({
      type: 'IRAssign',
      target: { type: 'IRIndexTarget', name: 'equipo_pokes' },
      value: { type: 'IRLiteral', value: 20 },
    });

    // Verificar Ejecución del Intérprete
    expect(execution.returnValue).toBe(20);
    expect(execution.output).toEqual(['Calculando niveles del equipo de inicio...']);
  });

  it('Caso 3: Punteros de Radar, builtins de localización y desvío', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Iniciando radar de PS...");
        
        CAPTURA ps_inicial EN PokeBall CON 50;
        RADAR radar_vida APUNTA_A PokeBall;
        
        radar_vida = UBICACION_DE(ps_inicial);
        
        // Mutar el valor original usando MIRAR_RADAR como LValue
        MIRAR_RADAR(radar_vida) = 100;
        
        DICE_PROF_OAK("PS del Pokémon modificados por radar:");
        DICE_PROF_OAK(ps_inicial);
        
        RETORNA ps_inicial;
      }
    `;

    const { execution } = compileAndRun(code);

    // Verificar que la mutación del radar modificó la variable original
    expect(execution.returnValue).toBe(100);
    expect(execution.output).toEqual([
      'Iniciando radar de PS...',
      'PS del Pokémon modificados por radar:',
      '100',
    ]);
  });
});
