import type { IRProgram, IRFunction, IRStatement, IRExpr, IRLValue } from './ir';

function compileExpr(expr: IRExpr): string {
  switch (expr.type) {
    case 'IRLiteral':
      if (expr.valueType === 'string') {
        return JSON.stringify(expr.value);
      }
      return String(expr.value);
    case 'IRIdentifier':
      return expr.name;
    case 'IRBinary': {
      const left = compileExpr(expr.left);
      const right = compileExpr(expr.right);
      let op = expr.op;
      if (op === '==') op = '===';
      if (op === '!=') op = '!==';
      return `(${left} ${op} ${right})`;
    }
    case 'IRCallExpr': {
      if (expr.name === 'MIRAR_RADAR') {
        return `(${compileExpr(expr.args[0])}).value`;
      }
      if (expr.name === 'DEVOLVER_A_LA_BALL') {
        return compileExpr(expr.args[0]);
      }
      if (expr.name === 'UBICACION_DE') {
        const arg = expr.args[0];
        let name = 'null';
        if (arg.type === 'IRLValueExpr' && arg.target.type === 'IRVarTarget') {
          name = arg.target.name;
        } else if (arg.type === 'IRIdentifier') {
          name = arg.name;
        }
        if (name !== 'null') {
          return `{ kind: "radar", get value() { return ${name}; }, set value(v) { ${name} = v; } }`;
        }
        return `{ kind: "radar", value: ${compileExpr(arg)} }`;
      }
      const args = expr.args.map(compileExpr).join(', ');
      return `${expr.name}(${args})`;
    }
    case 'IRLValueExpr':
      return compileLValue(expr.target);
    case 'IRMochilaPop':
      return `${expr.mochilaName}.pop()`;
    case 'IRMochilaLength':
      return `${expr.mochilaName}.length`;
  }
}

function compileLValue(target: IRLValue): string {
  switch (target.type) {
    case 'IRVarTarget':
      return target.name;
    case 'IRIndexTarget':
      return `${target.name}[${compileExpr(target.index)}]`;
    case 'IRSpecialTarget':
      if (target.kind === 'MIRAR_RADAR') {
        return `(${compileExpr(target.arg)}).value`;
      }
      return compileExpr(target.arg);
  }
}

function compileStmt(stmt: IRStatement, indent = '  '): string {
  switch (stmt.type) {
    case 'IRDeclare': {
      if (stmt.kind === 'CAPTURE') {
        return `${indent}let ${stmt.name} = ${stmt.value ? compileExpr(stmt.value) : 'null'};`;
      }
      if (stmt.kind === 'EQUIPO') {
        return `${indent}let ${stmt.name} = new Array(${
          stmt.value ? compileExpr(stmt.value) : '0'
        }).fill(null);`;
      }
      if (stmt.kind === 'MOCHILA') {
        return `${indent}let ${stmt.name} = [];`;
      }
      if (stmt.kind === 'RADAR') {
        return `${indent}let ${stmt.name} = { value: null };`;
      }
      return '';
    }
    case 'IRAssign': {
      const lhs = compileLValue(stmt.target);
      const rhs = compileExpr(stmt.value);
      return `${indent}${lhs} = ${rhs};`;
    }
    case 'IRCall': {
      if (stmt.name === 'DICE_PROF_OAK') {
        return `${indent}DICE_PROF_OAK(${compileExpr(stmt.args[0])});`;
      }
      const args = stmt.args.map(compileExpr).join(', ');
      return `${indent}${stmt.name}(${args});`;
    }
    case 'IRIf': {
      const test = compileExpr(stmt.test);
      const cons = stmt.consequent.map((s) => compileStmt(s, indent + '  ')).join('\n');
      let code = `${indent}if (${test}) {\n${cons}\n${indent}}`;
      if (stmt.alternate && stmt.alternate.length > 0) {
        const alt = stmt.alternate.map((s) => compileStmt(s, indent + '  ')).join('\n');
        code += ` else {\n${alt}\n${indent}}`;
      }
      return code;
    }
    case 'IRWhile': {
      const test = compileExpr(stmt.test);
      const body = stmt.body.map((s) => compileStmt(s, indent + '  ')).join('\n');
      return `${indent}while (${test}) {\n${body}\n${indent}}`;
    }
    case 'IRReturn':
      return `${indent}return ${stmt.value ? compileExpr(stmt.value) : 'null'};`;
    case 'IRMochilaPush':
      return `${indent}${stmt.name}.push(${compileExpr(stmt.value)});`;
  }
}

function compileFunc(fn: IRFunction): string {
  const params = fn.params.map((p) => p.name).join(', ');
  const body = fn.body.map((s) => compileStmt(s, '    ')).join('\n');
  return `  function ${fn.name}(${params}) {\n${body}\n  }`;
}

export function compileIRToJS(program: IRProgram): string {
  const functionsCode = program.functions.map(compileFunc).join('\n\n');
  const mainFunc = program.functions.find((f) => f.name === 'PUEBLO_NATAL') ?? program.functions[0];
  const mainName = mainFunc ? mainFunc.name : 'PUEBLO_NATAL';

  return `function runCompiledProgram() {
  const _output = [];
  function DICE_PROF_OAK(val) {
    if (typeof val === 'object' && val !== null && 'kind' in val && val.kind === 'radar') {
      _output.push("RADAR(" + String(val.value) + ")");
    } else {
      _output.push(String(val));
    }
  }
  function OAK_PREGUNTA(prompt) {
    return 25;
  }
  function MIRAR_RADAR(radar) {
    return radar.value;
  }
  function DEVOLVER_A_LA_BALL(val) {
    return val;
  }
  function UBICACION_DE(val) {
    return { kind: "radar", value: val };
  }

${functionsCode}

  const result = ${mainName}();
  return { returnValue: result, output: _output };
}`;
}
