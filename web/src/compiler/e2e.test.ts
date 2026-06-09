import { describe, expect, it } from 'vitest';
import { PokeLexer } from './lexer';
import { parser } from './parser';
import { cstToAst } from './ast';
import { typeCheck } from './semantics/typeChecker';
import { lowerProgramToIR, optimizeIR } from './ir';
import { compileIRToC } from './codegen';

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

  // 6. Optimize IR (Constant Folding & DCE)
  const optimizedIr = optimizeIR(rawIr);

  // 7. Generate C code
  const compiledC = compileIRToC(optimizedIr);

  return { ast, rawIr, optimizedIr, compiledC };
}

describe('PokeLang Compiler E2E Integration Pipeline (Destino C)', () => {
  it('Caso 1: Combate con ciclos, bifurcaciones y optimización de IR', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("--- Combate Iniciado ---");
        CAPTURA mi_ps EN PokeBall CON 80;
        CAPTURA danio EN PokeBall CON 15 + 5; // Constantes a optimizar (20)
        
        mi_ps = mi_ps - danio;
        
        SI_ENTRENADOR_DESAFIA (mi_ps < 70) {
          DICE_PROF_OAK("¡Alerta! PS Bajos.");
          mi_ps = mi_ps + 30;
        }
        
        MIENTRAS_TENGA_PS (mi_ps > 85) {
          mi_ps = mi_ps - 2 * 2; // Constantes a optimizar (4)
        }
        
        DICE_PROF_OAK("Combate terminado.");
        RETORNA mi_ps;
      }
    `;

    const { rawIr, optimizedIr, compiledC } = compileAndRun(code);

    // Verificar optimización de IR (Constant Folding)
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

    // Verificar generación de código C
    expect(compiledC).toContain('int main(void) {');
    expect(compiledC).toContain('int mi_ps = 80;');
    expect(compiledC).toContain('int danio = 20;');
    expect(compiledC).toContain('mi_ps = (mi_ps - danio);');
    expect(compiledC).toContain('if ((mi_ps < 70)) {');
    expect(compiledC).toContain('while ((mi_ps > 85)) {');
    expect(compiledC).toContain('return mi_ps;');
  });

  it('Caso 2: Nivel promedio de equipo Pokémon usando vectores (EQUIPO)', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Calculando niveles del equipo de inicio...");
        
        EQUIPO equipo_pokes DE PokeBall CAPACIDAD 3;
        equipo_pokes[0] = 10;
        equipo_pokes[1] = 15 + 5; // 20
        equipo_pokes[2] = 30;
        
        CAPTURA suma EN PokeBall CON equipo_pokes[0] + equipo_pokes[1] + equipo_pokes[2];
        CAPTURA promedio EN PokeBall CON suma / 3;
        
        RETORNA promedio;
      }
    `;

    const { optimizedIr, compiledC } = compileAndRun(code);

    // Verificar optimización de la asignación del equipo
    expect(optimizedIr.functions[0].body[3]).toMatchObject({
      type: 'IRAssign',
      target: { type: 'IRIndexTarget', name: 'equipo_pokes' },
      value: { type: 'IRLiteral', value: 20 },
    });

    // Verificar código C generado
    expect(compiledC).toContain('int equipo_pokes[3] = {0};');
    expect(compiledC).toContain('equipo_pokes[0] = 10;');
    expect(compiledC).toContain('equipo_pokes[1] = 20;');
    expect(compiledC).toContain('equipo_pokes[2] = 30;');
    expect(compiledC).toContain('int promedio = (suma / 3);');
  });

  it('Caso 3: Punteros de Radar, builtins de localización y desvío', () => {
    const code = `
      PUEBLO_NATAL() {
        DICE_PROF_OAK("Iniciando radar de PS...");
        
        CAPTURA ps_inicial EN PokeBall CON 50;
        RADAR radar_vida APUNTA_A PokeBall;
        
        radar_vida = UBICACION_DE(ps_inicial);
        
        MIRAR_RADAR(radar_vida) = 100;
        
        DICE_PROF_OAK("PS del Pokémon modificados por radar:");
        DICE_PROF_OAK(ps_inicial);
        
        RETORNA ps_inicial;
      }
    `;

    const { compiledC } = compileAndRun(code);

    // Verificar punteros nativos en C
    expect(compiledC).toContain('int ps_inicial = 50;');
    expect(compiledC).toContain('int* radar_vida = NULL;');
    expect(compiledC).toContain('radar_vida = (&(ps_inicial));');
    expect(compiledC).toContain('(*(radar_vida)) = 100;');
    expect(compiledC).toContain('DICE_PROF_OAK(ps_inicial);');
  });
});
