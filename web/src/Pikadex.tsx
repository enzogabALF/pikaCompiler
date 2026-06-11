import React, { useState } from 'react';

type SectionId =
  | 'intro'
  | 'types'
  | 'variables'
  | 'control'
  | 'functions'
  | 'arrays'
  | 'stacks'
  | 'pointers'
  | 'builtins';

interface PikadexProps {
  onLoadExample: (code: string) => void;
  onClose: () => void;
}

export default function Pikadex({ onLoadExample, onClose }: PikadexProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sections: { id: SectionId; name: string; icon: string }[] = [
    { id: 'intro', name: '⚡ Introducción', icon: '🔴' },
    { id: 'types', name: '🔴 Poké Balls (Tipos)', icon: '🔵' },
    { id: 'variables', name: '📝 Variables', icon: '📝' },
    { id: 'control', name: '🔄 Control', icon: '🔄' },
    { id: 'functions', name: '🏃 Movimientos (Funciones)', icon: '👟' },
    { id: 'arrays', name: '🎒 Equipo (Arreglos)', icon: '🛡️' },
    { id: 'stacks', name: '💼 Mochila (Pilas)', icon: '💼' },
    { id: 'pointers', name: '📡 Radar (Punteros)', icon: '📡' },
    { id: 'builtins', name: '👴 Prof. Oak (Sistema)', icon: '👴' },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="pika-doc-content">
            <h2>⚡ Bienvenido a la Pikadex Oficial</h2>
            <p className="pika-lead">
              Esta es tu guía completa de referencia para programar en **PokeCode**, el lenguaje
              oficial del **PikaCompiler**. Aquí aprenderás cómo estructurar programas, controlar el
              flujo de combate y transpilar tus scripts a C11.
            </p>
            <div className="pika-card">
              <h3>🎮 Concepto General</h3>
              <p>
                Cada programa en PokeCode emula una aventura Pokémon. La función principal del
                programa debe llamarse <strong>PUEBLO_NATAL</strong>. Las variables se guardan
                usando distintas clases de <strong>Poké Balls</strong>, los arreglos representan tu{' '}
                <strong>EQUIPO</strong>, las pilas son tu <strong>MOCHILA</strong>, y los punteros
                son <strong>RADAR</strong>.
              </p>
            </div>
            <div className="pika-card warning-card">
              <h3>🚨 Estructura Básica</h3>
              <p>
                Un archivo válido `.pika` requiere definir por lo menos la función de inicio{' '}
                <code>PUEBLO_NATAL()</code>:
              </p>
              <div className="code-box-wrapper">
                <pre className="code-box">
                  {`PUEBLO_NATAL() {
  DICE_PROF_OAK("¡Hola, Mundo Pokémon!");
  RETORNA 0;
}`}
                </pre>
                <div className="code-actions">
                  <button
                    className="code-btn"
                    onClick={() =>
                      handleCopy(
                        'intro-basic',
                        'PUEBLO_NATAL() {\n  DICE_PROF_OAK("¡Hola, Mundo Pokémon!");\n  RETORNA 0;\n}'
                      )
                    }
                  >
                    {copiedId === 'intro-basic' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                  <button
                    className="code-btn load-btn"
                    onClick={() =>
                      onLoadExample(
                        'PUEBLO_NATAL() {\n  DICE_PROF_OAK("¡Hola, Mundo Pokémon!");\n  RETORNA 0;\n}'
                      )
                    }
                  >
                    ⚡ Cargar en Editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'types':
        return (
          <div className="pika-doc-content">
            <h2>🔴 Poké Balls y el Sistema de Tipos</h2>
            <p>
              En PokeCode, no declaramos tipos estándar como <code>int</code> o <code>float</code>.
              En su lugar, usamos diferentes tipos de Poké Balls según el valor que queremos
              capturar:
            </p>
            <table className="pika-table">
              <thead>
                <tr>
                  <th>Poké Ball</th>
                  <th>Tipo C</th>
                  <th>Descripción</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>PokeBall</strong>
                  </td>
                  <td>
                    <code>int</code>
                  </td>
                  <td>Números enteros de 32 bits</td>
                  <td>
                    <code>CAPTURA nivel EN PokeBall CON 5;</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>SuperBall</strong>
                  </td>
                  <td>
                    <code>float</code>
                  </td>
                  <td>Números decimales (punto flotante)</td>
                  <td>
                    <code>CAPTURA ratio EN SuperBall CON 0.75;</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>UltraBall</strong>
                  </td>
                  <td>
                    <code>const char*</code>
                  </td>
                  <td>Cadenas de texto / Strings</td>
                  <td>
                    <code>CAPTURA mote EN UltraBall CON &quot;Pikachu&quot;;</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>MasterBall</strong>
                  </td>
                  <td>
                    <code>bool</code>
                  </td>
                  <td>Valores lógicos (true/false)</td>
                  <td>
                    <code>CAPTURA esSalvaje EN MasterBall CON true;</code>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="pika-card">
              <h3>Ejemplo de Tipos Mezclados</h3>
              <div className="code-box-wrapper">
                <pre className="code-box">
                  {`PUEBLO_NATAL() {
  CAPTURA nivel EN PokeBall CON 25;
  CAPTURA ratio EN SuperBall CON 85.5;
  CAPTURA nombre EN UltraBall CON "Charizard";
  CAPTURA shiny EN MasterBall CON false;

  DICE_PROF_OAK(nombre);
  DICE_PROF_OAK(nivel);
}`}
                </pre>
                <div className="code-actions">
                  <button
                    className="code-btn"
                    onClick={() =>
                      handleCopy(
                        'types-ex',
                        'PUEBLO_NATAL() {\n  CAPTURA nivel EN PokeBall CON 25;\n  CAPTURA ratio EN SuperBall CON 85.5;\n  CAPTURA nombre EN UltraBall CON "Charizard";\n  CAPTURA shiny EN MasterBall CON false;\n\n  DICE_PROF_OAK(nombre);\n  DICE_PROF_OAK(nivel);\n}'
                      )
                    }
                  >
                    {copiedId === 'types-ex' ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                  <button
                    className="code-btn load-btn"
                    onClick={() =>
                      onLoadExample(
                        'PUEBLO_NATAL() {\n  CAPTURA nivel EN PokeBall CON 25;\n  CAPTURA ratio EN SuperBall CON 85.5;\n  CAPTURA nombre EN UltraBall CON "Charizard";\n  CAPTURA shiny EN MasterBall CON false;\n\n  DICE_PROF_OAK(nombre);\n  DICE_PROF_OAK(nivel);\n}'
                      )
                    }
                  >
                    ⚡ Cargar en Editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'variables':
        return (
          <div className="pika-doc-content">
            <h2>📝 Declaración y Asignación de Variables</h2>
            <p>
              Para declarar variables en PokeCode, usamos la palabra clave <code>CAPTURA</code>,
              indicando el nombre de la variable, el contenedor <code>EN [Ball]</code> y el valor de
              inicio con <code>CON [valor]</code>.
            </p>
            <div className="pika-card">
              <h3>Sintaxis:</h3>
              <p>
                <code>CAPTURA &lt;nombre&gt; EN &lt;TipoBall&gt; CON &lt;expresión&gt;;</code>
              </p>
              <p>Para reasignar valores más tarde, se realiza una asignación clásica:</p>
              <p>
                <code>&lt;nombre&gt; = &lt;expresión&gt;;</code>
              </p>
            </div>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`PUEBLO_NATAL() {
  CAPTURA daño EN PokeBall CON 10 + 15; // Se reduce a 25
  DICE_PROF_OAK("Daño inicial:");
  DICE_PROF_OAK(daño);

  daño = daño * 2; // Duplicar daño (50)
  DICE_PROF_OAK("Daño con Danza Espada:");
  DICE_PROF_OAK(daño);
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'var-ex',
                      'PUEBLO_NATAL() {\n  CAPTURA daño EN PokeBall CON 10 + 15;\n  DICE_PROF_OAK("Daño inicial:");\n  DICE_PROF_OAK(daño);\n\n  daño = daño * 2;\n  DICE_PROF_OAK("Daño con Danza Espada:");\n  DICE_PROF_OAK(daño);\n}'
                    )
                  }
                >
                  {copiedId === 'var-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'PUEBLO_NATAL() {\n  CAPTURA daño EN PokeBall CON 10 + 15;\n  DICE_PROF_OAK("Daño inicial:");\n  DICE_PROF_OAK(daño);\n\n  daño = daño * 2;\n  DICE_PROF_OAK("Daño con Danza Espada:");\n  DICE_PROF_OAK(daño);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'control':
        return (
          <div className="pika-doc-content">
            <h2>🔄 Estructuras de Control de Flujo</h2>
            <p>
              PokeCode implementa condicionales y bucles temáticos para controlar el comportamiento
              del programa:
            </p>

            <h3>
              1. Condicionales: <code>SI_ENTRENADOR_DESAFIA</code>
            </h3>
            <p>
              Equivale a <code>if / else</code>. Ejecuta un bloque si la condición lógica es
              verdadera.
            </p>

            <h3>
              2. Bucles: <code>MIENTRAS_TENGA_PS</code>
            </h3>
            <p>
              Equivale a <code>while</code>. Ejecuta un bloque repetidamente mientras la condición
              se cumpla.
            </p>

            <div className="pika-card warning-card">
              <h3>⚠️ Protección de Bucles Infinitos</h3>
              <p>
                El intérprete tiene un límite integrado de <strong>10,000 iteraciones</strong> para
                evitar congelamientos si entras en un bucle infinito en el navegador.
              </p>
            </div>

            <div className="code-box-wrapper">
              <pre className="code-box">
                {`PUEBLO_NATAL() {
  CAPTURA ps EN PokeBall CON 30;
  CAPTURA pocion EN PokeBall CON 20;

  // Condicional
  SI_ENTRENADOR_DESAFIA (ps < 50) {
    ps = ps + pocion;
    DICE_PROF_OAK("Usó Poción. PS recuperados:");
    DICE_PROF_OAK(ps);
  } SINO {
    DICE_PROF_OAK("PS estables, combate directo");
  }

  // Bucle
  CAPTURA turnos EN PokeBall CON 0;
  MIENTRAS_TENGA_PS (turnos < 3) {
    turnos = turnos + 1;
    DICE_PROF_OAK("Turno de combate nro:");
    DICE_PROF_OAK(turnos);
  }
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'ctrl-ex',
                      'PUEBLO_NATAL() {\n  CAPTURA ps EN PokeBall CON 30;\n  CAPTURA pocion EN PokeBall CON 20;\n\n  SI_ENTRENADOR_DESAFIA (ps < 50) {\n    ps = ps + pocion;\n    DICE_PROF_OAK("Usó Poción. PS recuperados:");\n    DICE_PROF_OAK(ps);\n  } SINO {\n    DICE_PROF_OAK("PS estables, combate directo");\n  }\n\n  CAPTURA turnos EN PokeBall CON 0;\n  MIENTRAS_TENGA_PS (turnos < 3) {\n    turnos = turnos + 1;\n    DICE_PROF_OAK("Turno de combate nro:");\n    DICE_PROF_OAK(turnos);\n  }\n}'
                    )
                  }
                >
                  {copiedId === 'ctrl-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'PUEBLO_NATAL() {\n  CAPTURA ps EN PokeBall CON 30;\n  CAPTURA pocion EN PokeBall CON 20;\n\n  SI_ENTRENADOR_DESAFIA (ps < 50) {\n    ps = ps + pocion;\n    DICE_PROF_OAK("Usó Poción. PS recuperados:");\n    DICE_PROF_OAK(ps);\n  } SINO {\n    DICE_PROF_OAK("PS estables, combate directo");\n  }\n\n  CAPTURA turnos EN PokeBall CON 0;\n  MIENTRAS_TENGA_PS (turnos < 3) {\n    turnos = turnos + 1;\n    DICE_PROF_OAK("Turno de combate nro:");\n    DICE_PROF_OAK(turnos);\n  }\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'functions':
        return (
          <div className="pika-doc-content">
            <h2>🏃 Creación de Movimientos (Funciones)</h2>
            <p>
              Puedes definir funciones secundarias en PokeCode usando la palabra clave{' '}
              <code>MOVIMIENTO</code>. Las funciones pueden tomar parámetros tipados y definir un
              tipo de retorno mediante <code>RETORNA &lt;Tipo&gt;</code>.
            </p>
            <div className="pika-card">
              <h3>Reglas Importantes:</h3>
              <ul>
                <li>
                  La función principal de ejecución obligatoria es <code>PUEBLO_NATAL()</code>.
                </li>
                <li>
                  Los nombres de parámetros se separan por comas y llevan tipo explícito, ej.{' '}
                  <code>(ps: PokeBall, mod: SuperBall)</code>.
                </li>
                <li>
                  Usa <code>RETORNA</code> dentro de la función para devolver valores.
                </li>
              </ul>
            </div>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`MOVIMIENTO calcular_critico(ataque: PokeBall) RETORNA PokeBall {
  CAPTURA multiplicador EN PokeBall CON 2;
  RETORNA ataque * multiplicador;
}

PUEBLO_NATAL() {
  CAPTURA golpe EN PokeBall CON 35;
  CAPTURA critico EN PokeBall CON calcular_critico(golpe);
  
  DICE_PROF_OAK("Daño Crítico:");
  DICE_PROF_OAK(critico);
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'func-ex',
                      'MOVIMIENTO calcular_critico(ataque: PokeBall) RETORNA PokeBall {\n  CAPTURA multiplicador EN PokeBall CON 2;\n  RETORNA ataque * multiplicador;\n}\n\nPUEBLO_NATAL() {\n  CAPTURA golpe EN PokeBall CON 35;\n  CAPTURA critico EN PokeBall CON calcular_critico(golpe);\n  \n  DICE_PROF_OAK("Daño Crítico:");\n  DICE_PROF_OAK(critico);\n}'
                    )
                  }
                >
                  {copiedId === 'func-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'MOVIMIENTO calcular_critico(ataque: PokeBall) RETORNA PokeBall {\n  CAPTURA multiplicador EN PokeBall CON 2;\n  RETORNA ataque * multiplicador;\n}\n\nPUEBLO_NATAL() {\n  CAPTURA golpe EN PokeBall CON 35;\n  CAPTURA critico EN PokeBall CON calcular_critico(golpe);\n  \n  DICE_PROF_OAK("Daño Crítico:");\n  DICE_PROF_OAK(critico);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'arrays':
        return (
          <div className="pika-doc-content">
            <h2>🛡️ Equipos (Arreglos Estáticos)</h2>
            <p>
              Un <code>EQUIPO</code> representa una estructura de datos estática (arreglo en C). Por
              lore Pokémon, su capacidad máxima está restringida estáticamente a{' '}
              <strong>6 elementos</strong>.
            </p>
            <div className="pika-card">
              <h3>Declaración de Equipos:</h3>
              <p>
                <code>EQUIPO &lt;nombre&gt; DE &lt;Tipo&gt; CAPACIDAD &lt;tamaño&gt;;</code>
              </p>
              <p>
                <em>Nota: La capacidad debe estar estrictamente entre 1 y 6.</em>
              </p>
            </div>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`PUEBLO_NATAL() {
  DICE_PROF_OAK("--- Configurando Equipo ---");
  EQUIPO team DE PokeBall CAPACIDAD 3;
  
  team[0] = 75; // PS Pikachu
  team[1] = 90; // PS Eevee
  team[2] = 120; // PS Snorlax

  DICE_PROF_OAK("PS del segundo integrante:");
  DICE_PROF_OAK(team[1]);
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'arr-ex',
                      'PUEBLO_NATAL() {\n  DICE_PROF_OAK("--- Configurando Equipo ---");\n  EQUIPO team DE PokeBall CAPACIDAD 3;\n  \n  team[0] = 75;\n  team[1] = 90;\n  team[2] = 120;\n\n  DICE_PROF_OAK("PS del segundo integrante:");\n  DICE_PROF_OAK(team[1]);\n}'
                    )
                  }
                >
                  {copiedId === 'arr-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'PUEBLO_NATAL() {\n  DICE_PROF_OAK("--- Configurando Equipo ---");\n  EQUIPO team DE PokeBall CAPACIDAD 3;\n  \n  team[0] = 75;\n  team[1] = 90;\n  team[2] = 120;\n\n  DICE_PROF_OAK("PS del segundo integrante:");\n  DICE_PROF_OAK(team[1]);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'stacks':
        return (
          <div className="pika-doc-content">
            <h2>💼 Mochila (Pilas Dinámicas)</h2>
            <p>
              Una <code>MOCHILA</code> es una estructura de datos dinâmica de tipo **LIFO** (último
              en entrar, primero en salir). Proporciona tres funciones integradas para su
              manipulación:
            </p>
            <ul>
              <li>
                <strong>`GUARDAR(mochila, valor)`</strong>: Inserta un elemento en la mochila
                (Push).
              </li>
              <li>
                <strong>`SACAR(mochila)`</strong>: Extrae y retorna el elemento superior de la
                mochila (Pop).
              </li>
              <li>
                <strong>`CANTIDAD_DE(mochila)`</strong>: Retorna cuántos elementos hay actualmente
                en la mochila (Size).
              </li>
            </ul>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`PUEBLO_NATAL() {
  MOCHILA bolsa DE PokeBall;
  
  GUARDAR(bolsa, 10);
  GUARDAR(bolsa, 50);

  DICE_PROF_OAK("Objetos guardados:");
  DICE_PROF_OAK(CANTIDAD_DE(bolsa)); // Imprime 2

  CAPTURA ultimo EN PokeBall CON SACAR(bolsa);
  DICE_PROF_OAK("Objeto extraído:");
  DICE_PROF_OAK(ultimo); // Imprime 50
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'stack-ex',
                      'PUEBLO_NATAL() {\n  MOCHILA bolsa DE PokeBall;\n  \n  GUARDAR(bolsa, 10);\n  GUARDAR(bolsa, 50);\n\n  DICE_PROF_OAK("Objetos guardados:");\n  DICE_PROF_OAK(CANTIDAD_DE(bolsa));\n\n  CAPTURA ultimo EN PokeBall CON SACAR(bolsa);\n  DICE_PROF_OAK("Objeto extraído:");\n  DICE_PROF_OAK(ultimo);\n}'
                    )
                  }
                >
                  {copiedId === 'stack-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'PUEBLO_NATAL() {\n  MOCHILA bolsa DE PokeBall;\n  \n  GUARDAR(bolsa, 10);\n  GUARDAR(bolsa, 50);\n\n  DICE_PROF_OAK("Objetos guardados:");\n  DICE_PROF_OAK(CANTIDAD_DE(bolsa));\n\n  CAPTURA ultimo EN PokeBall CON SACAR(bolsa);\n  DICE_PROF_OAK("Objeto extraído:");\n  DICE_PROF_OAK(ultimo);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'pointers':
        return (
          <div className="pika-doc-content">
            <h2>📡 Radares (Punteros de Memoria)</h2>
            <p>
              Los <code>RADAR</code> son punteros que permiten apuntar a la dirección de memoria de
              variables existentes.
            </p>
            <ul>
              <li>
                <strong>Declaración</strong>:{' '}
                <code>RADAR &lt;nombre&gt; APUNTA_A &lt;Tipo&gt;;</code>
              </li>
              <li>
                <strong>Referencia (`&` en C)</strong>: Usando la función{' '}
                <code>UBICACION_DE(variable)</code>.
              </li>
              <li>
                <strong>Desreferencia (`*` en C)</strong>: Usando la macro{' '}
                <code>MIRAR_RADAR(radar)</code> tanto para leer como para escribir el valor.
              </li>
            </ul>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`PUEBLO_NATAL() {
  CAPTURA estadistica EN PokeBall CON 80;
  RADAR radarEstats APUNTA_A PokeBall;
  
  radarEstats = UBICACION_DE(estadistica);
  
  // Cambiar valor a través de la dirección apuntada por el radar
  MIRAR_RADAR(radarEstats) = 95;
  
  DICE_PROF_OAK("Estadística indirecta modificada:");
  DICE_PROF_OAK(estadistica); // Imprimirá 95
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'ptr-ex',
                      'PUEBLO_NATAL() {\n  CAPTURA estadistica EN PokeBall CON 80;\n  RADAR radarEstats APUNTA_A PokeBall;\n  \n  radarEstats = UBICACION_DE(estadistica);\n  \n  MIRAR_RADAR(radarEstats) = 95;\n  \n  DICE_PROF_OAK("Estadística indirecta modificada:");\n  DICE_PROF_OAK(estadistica);\n}'
                    )
                  }
                >
                  {copiedId === 'ptr-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'PUEBLO_NATAL() {\n  CAPTURA estadistica EN PokeBall CON 80;\n  RADAR radarEstats APUNTA_A PokeBall;\n  \n  radarEstats = UBICACION_DE(estadistica);\n  \n  MIRAR_RADAR(radarEstats) = 95;\n  \n  DICE_PROF_OAK("Estadística indirecta modificada:");\n  DICE_PROF_OAK(estadistica);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      case 'builtins':
        return (
          <div className="pika-doc-content">
            <h2>👴 Diálogos del Profesor Oak (Built-ins)</h2>
            <p>
              El sistema provee funciones globales integradas para interactuar con la terminal y
              controlar la ejecución:
            </p>
            <ul>
              <li>
                <strong>`DICE_PROF_OAK(valor)`</strong>: Imprime una cadena, entero, decimal o
                booleano en la consola. A nivel de C, se transpila usando macros polimórficas{' '}
                <code>_Generic</code> para resolver al formato de <code>printf</code> adecuado de
                forma segura.
              </li>
              <li>
                <strong>`OAK_PREGUNTA`</strong>: Solicita entrada interactiva al usuario
                (actualmente simulado o retornado en C usando <code>scanf</code>).
              </li>
              <li>
                <strong>`DEVOLVER_A_LA_BALL`</strong>: Detiene inmediatamente la ejecución de la
                rutina actual (similar a un `exit` o `return` anticipado). Solo es legal dentro de
                funciones marcadas como `MOVIMIENTO`.
              </li>
            </ul>
            <div className="code-box-wrapper">
              <pre className="code-box">
                {`MOVIMIENTO procesar_combate(huye: MasterBall) RETORNA PokeBall {
  SI_ENTRENADOR_DESAFIA (huye) {
    DICE_PROF_OAK("Huyendo de combate...");
    DEVOLVER_A_LA_BALL;
  }
  DICE_PROF_OAK("Combatiendo...");
  RETORNA 1;
}

PUEBLO_NATAL() {
  procesar_combate(true);
}`}
              </pre>
              <div className="code-actions">
                <button
                  className="code-btn"
                  onClick={() =>
                    handleCopy(
                      'sys-ex',
                      'MOVIMIENTO procesar_combate(huye: MasterBall) RETORNA PokeBall {\n  SI_ENTRENADOR_DESAFIA (huye) {\n    DICE_PROF_OAK("Huyendo de combate...");\n    DEVOLVER_A_LA_BALL;\n  }\n  DICE_PROF_OAK("Combatiendo...");\n  RETORNA 1;\n}\n\nPUEBLO_NATAL() {\n  procesar_combate(true);\n}'
                    )
                  }
                >
                  {copiedId === 'sys-ex' ? '✅ Copiado' : '📋 Copiar'}
                </button>
                <button
                  className="code-btn load-btn"
                  onClick={() =>
                    onLoadExample(
                      'MOVIMIENTO procesar_combate(huye: MasterBall) RETORNA PokeBall {\n  SI_ENTRENADOR_DESAFIA (huye) {\n    DICE_PROF_OAK("Huyendo de combate...");\n    DEVOLVER_A_LA_BALL;\n  }\n  DICE_PROF_OAK("Combatiendo...");\n  RETORNA 1;\n}\n\nPUEBLO_NATAL() {\n  procesar_combate(true);\n}'
                    )
                  }
                >
                  ⚡ Cargar en Editor
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pikadex-layout">
      {/* Marco Exterior de la Pokédex */}
      <div className="pokedex-frame">
        {/* Luces Superiores y Sensores */}
        <div className="pokedex-top-sensors">
          <div className="sensor-large-blue">
            <div className="reflection"></div>
          </div>
          <div className="sensor-small red-blinking"></div>
          <div className="sensor-small yellow-blinking"></div>
          <div className="sensor-small green-blinking"></div>

          <button className="pokedex-close-btn" onClick={onClose}>
            ❌ Cerrar Pikadex
          </button>
        </div>

        {/* Cuerpo Principal de la Pokédex */}
        <div className="pokedex-body">
          {/* Columna Izquierda: Menú de Navegación */}
          <div className="pokedex-sidebar">
            <div className="sidebar-header">🔍 CATEGORÍAS</div>
            <ul className="sidebar-menu">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <button
                    className={`menu-item-btn ${activeSection === sec.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(sec.id)}
                  >
                    <span className="ball-icon">{sec.icon}</span>
                    <span className="item-text">{sec.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="pokedex-dpad-container">
              <div className="dpad">
                <div className="dpad-btn up"></div>
                <div className="dpad-btn down"></div>
                <div className="dpad-btn left"></div>
                <div className="dpad-btn right"></div>
                <div className="dpad-center"></div>
              </div>
              <div className="pokedex-lights">
                <div className="bar-light long-red"></div>
                <div className="bar-light long-yellow"></div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Pantalla Digital de Datos */}
          <div className="pokedex-screen-container">
            <div className="digital-screen">
              <div className="screen-inner">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
