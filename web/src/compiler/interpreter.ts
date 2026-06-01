import type {
  ProgramNode,
  FunctionDeclNode,
  StatementNode,
  ExprNode,
  LValueNode,
  SourceLocation,
} from './ast';

export type RuntimeValue = number | string | boolean | null | RuntimeArray | RuntimeRadar;

export interface RuntimeArray {
  kind: 'array';
  elements: RuntimeValue[];
  capacity?: number;
  typeName?: string;
}

export interface RuntimeRadar {
  kind: 'radar';
  targetType: string;
  value: RuntimeValue;
}

export interface ExecutionResult {
  entryFunction: string;
  output: string[];
  returnValue: RuntimeValue;
}

type RuntimeEnv = {
  values: Map<string, RuntimeValue>;
  parent?: RuntimeEnv;
};

export class InterpreterError extends Error {
  loc?: SourceLocation;

  constructor(message: string, loc?: SourceLocation) {
    super(message);
    this.name = 'InterpreterError';
    this.loc = loc;
  }
}

class ReturnSignal {
  constructor(public value: RuntimeValue) {}
}

function createEnv(parent?: RuntimeEnv): RuntimeEnv {
  return { values: new Map<string, RuntimeValue>(), parent };
}

function lookupEnv(env: RuntimeEnv, name: string): RuntimeEnv | undefined {
  let current: RuntimeEnv | undefined = env;
  while (current) {
    if (current.values.has(name)) return current;
    current = current.parent;
  }
  return undefined;
}

function getValue(env: RuntimeEnv, name: string, loc?: SourceLocation): RuntimeValue {
  const owner = lookupEnv(env, name);
  if (!owner) {
    throw new InterpreterError(`Undefined variable '${name}'`, loc);
  }
  return owner.values.get(name) ?? null;
}

function setValue(env: RuntimeEnv, name: string, value: RuntimeValue, loc?: SourceLocation) {
  const owner = lookupEnv(env, name);
  if (!owner) {
    throw new InterpreterError(`Undefined variable '${name}'`, loc);
  }
  owner.values.set(name, value);
}

function isArrayValue(value: RuntimeValue): value is RuntimeArray {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'array';
}

function isRadarValue(value: RuntimeValue): value is RuntimeRadar {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'radar';
}

function toNumber(value: RuntimeValue, loc?: SourceLocation): number {
  if (typeof value === 'number') return value;
  throw new InterpreterError(`Expected numeric value, got ${formatValue(value)}`, loc);
}

function truthy(value: RuntimeValue): boolean {
  if (value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (isArrayValue(value)) return value.elements.length > 0;
  return true;
}

function formatValue(value: RuntimeValue): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (isArrayValue(value)) return `[${value.elements.map(formatValue).join(', ')}]`;
  if (isRadarValue(value)) return `RADAR(${formatValue(value.value)})`;
  return 'unknown';
}

function resolveTarget(
  lvalue: LValueNode,
  env: RuntimeEnv,
  context: ExecutionContext,
  loc?: SourceLocation
): { read: () => RuntimeValue; write: (value: RuntimeValue) => void } {
  switch (lvalue.type) {
    case 'IdentifierLValue': {
      const owner = lookupEnv(env, lvalue.name);
      if (!owner) {
        throw new InterpreterError(`Undefined variable '${lvalue.name}'`, lvalue.loc ?? loc);
      }
      return {
        read: () => owner.values.get(lvalue.name) ?? null,
        write: (value) => {
          owner.values.set(lvalue.name, value);
        },
      };
    }
    case 'IndexLValue': {
      return {
        read: () => {
          const target = getValue(env, lvalue.name, lvalue.loc ?? loc);
          if (!isArrayValue(target)) {
            throw new InterpreterError(
              `Variable '${lvalue.name}' is not indexable`,
              lvalue.loc ?? loc
            );
          }
          const index = toNumber(evaluateExpr(lvalue.index, env, context), lvalue.index.loc);
          const slot = target.elements[index];
          return slot ?? null;
        },
        write: (value) => {
          const target = getValue(env, lvalue.name, lvalue.loc ?? loc);
          if (!isArrayValue(target)) {
            throw new InterpreterError(
              `Variable '${lvalue.name}' is not indexable`,
              lvalue.loc ?? loc
            );
          }
          const index = toNumber(evaluateExpr(lvalue.index, env, context), lvalue.index.loc);
          if (index < 0 || index >= target.elements.length) {
            throw new InterpreterError(
              `Index ${index} out of bounds for '${lvalue.name}'`,
              lvalue.loc ?? loc
            );
          }
          target.elements[index] = value;
        },
      };
    }
    case 'SpecialLValue': {
      return {
        read: () => {
          const reference = evaluateExpr(lvalue.arg, env, context);
          if (lvalue.kind === 'MIRAR_RADAR') {
            if (!isRadarValue(reference)) {
              throw new InterpreterError('MIRAR_RADAR expects a radar value', lvalue.loc ?? loc);
            }
            const ref = reference as any;
            if (ref.targetVar && ref.targetEnv) {
              return getValue(ref.targetEnv, ref.targetVar, lvalue.loc ?? loc);
            }
            return reference.value;
          }
          return reference;
        },
        write: (value) => {
          if (lvalue.kind === 'MIRAR_RADAR') {
            const reference = evaluateExpr(lvalue.arg, env, context);
            if (!isRadarValue(reference)) {
              throw new InterpreterError('MIRAR_RADAR expects a radar value', lvalue.loc ?? loc);
            }
            reference.value = value;
            const ref = reference as any;
            if (ref.targetVar && ref.targetEnv) {
              setValue(ref.targetEnv, ref.targetVar, value, lvalue.loc ?? loc);
            }
            return;
          }

          if (lvalue.arg.type === 'Identifier') {
            setValue(env, lvalue.arg.name, value, lvalue.loc ?? loc);
            return;
          }

          throw new InterpreterError(
            'DEVOLVER_A_LA_BALL expects an identifier reference',
            lvalue.loc ?? loc
          );
        },
      };
    }
  }
}

type ExecutionContext = {
  program: ProgramNode;
  functions: Map<string, FunctionDeclNode>;
  output: string[];
};

function evaluateCall(
  name: string,
  args: ExprNode[],
  env: RuntimeEnv,
  context: ExecutionContext,
  loc?: SourceLocation
): RuntimeValue {
  const evaluatedArgs = args.map((arg) => evaluateExpr(arg, env, context));

  switch (name) {
    case 'MIRAR_RADAR': {
      const radar = evaluatedArgs[0];
      if (!isRadarValue(radar)) {
        throw new InterpreterError('MIRAR_RADAR expects a radar value', loc);
      }
      return radar.value;
    }
    case 'DEVOLVER_A_LA_BALL':
      return evaluatedArgs[0] ?? null;
    case 'DICE_PROF_OAK': {
      const val = evaluatedArgs[0];
      const str = typeof val === 'string' ? val : formatValue(val);
      context.output.push(str);
      return null;
    }
    case 'OAK_PREGUNTA': {
      return 25;
    }
    case 'UBICACION_DE': {
      const arg = args[0];
      let targetVar: string | undefined = undefined;
      if (arg.type === 'Identifier') {
        targetVar = arg.name;
      } else if (arg.type === 'LValueExpr' && arg.lvalue.type === 'IdentifierLValue') {
        targetVar = arg.lvalue.name;
      }
      return {
        kind: 'radar',
        targetType: 'PokeBall',
        value: evaluatedArgs[0] ?? null,
        targetVar,
        targetEnv: env,
      } as any;
    }
    default: {
      const fn = context.functions.get(name);
      if (!fn) {
        throw new InterpreterError(`Unknown function '${name}'`, loc);
      }

      const callEnv = createEnv();
      fn.params.forEach((param, index) => {
        callEnv.values.set(param.name, evaluatedArgs[index] ?? null);
      });

      const signal = executeStatements(fn.body, callEnv, context);
      return signal instanceof ReturnSignal ? signal.value : null;
    }
  }
}

function evaluateExpr(expr: ExprNode, env: RuntimeEnv, context: ExecutionContext): RuntimeValue {
  switch (expr.type) {
    case 'Literal':
      return expr.value;
    case 'Identifier':
      return getValue(env, expr.name, expr.loc);
    case 'LValueExpr':
      return resolveTarget(expr.lvalue, env, context, expr.loc).read();
    case 'CallExpr':
      return evaluateCall(expr.name, expr.args, env, context, expr.loc);
    case 'BinOp': {
      const left = evaluateExpr(expr.left, env, context);
      const right = evaluateExpr(expr.right, env, context);

      switch (expr.op) {
        case '+':
          return typeof left === 'string' || typeof right === 'string'
            ? `${String(left)}${String(right)}`
            : toNumber(left, expr.loc) + toNumber(right, expr.loc);
        case '-':
          return toNumber(left, expr.loc) - toNumber(right, expr.loc);
        case '*':
          return toNumber(left, expr.loc) * toNumber(right, expr.loc);
        case '/':
          return toNumber(left, expr.loc) / toNumber(right, expr.loc);
        case '<':
          return toNumber(left, expr.loc) < toNumber(right, expr.loc);
        case '>':
          return toNumber(left, expr.loc) > toNumber(right, expr.loc);
        case '<=':
          return toNumber(left, expr.loc) <= toNumber(right, expr.loc);
        case '>=':
          return toNumber(left, expr.loc) >= toNumber(right, expr.loc);
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '[]':
          throw new InterpreterError('Indexing is handled as an lvalue', expr.loc);
      }
    }
  }
}

function executeStatement(
  stmt: StatementNode,
  env: RuntimeEnv,
  context: ExecutionContext
): ReturnSignal | undefined {
  switch (stmt.type) {
    case 'CaptureDecl': {
      env.values.set(stmt.name, evaluateExpr(stmt.value, env, context));
      return undefined;
    }
    case 'EquipoDecl': {
      const capacity = Math.max(
        0,
        Math.trunc(toNumber(evaluateExpr(stmt.capacity, env, context), stmt.capacity.loc))
      );
      env.values.set(stmt.name, {
        kind: 'array',
        elements: new Array<RuntimeValue>(capacity).fill(null),
        capacity,
        typeName: stmt.typeName,
      });
      return undefined;
    }
    case 'MochilaDecl': {
      env.values.set(stmt.name, {
        kind: 'array',
        elements: [],
        typeName: stmt.typeName,
      });
      return undefined;
    }
    case 'RadarDecl': {
      env.values.set(stmt.name, {
        kind: 'radar',
        targetType: stmt.typeName,
        value: null,
      });
      return undefined;
    }
    case 'AssignmentStmt': {
      const target = resolveTarget(stmt.lvalue, env, context, stmt.loc);
      target.write(evaluateExpr(stmt.value, env, context));
      return undefined;
    }
    case 'CallStmt':
      evaluateCall(stmt.name, stmt.args, env, context, stmt.loc);
      return undefined;
    case 'IfStmt': {
      const branch = truthy(evaluateExpr(stmt.test, env, context))
        ? stmt.consequent
        : stmt.alternate;
      if (!branch) return undefined;
      const result = executeStatements(branch, env, context);
      if (result instanceof ReturnSignal) return result;
      return undefined;
    }
    case 'WhileStmt': {
      let guard = 0;
      while (truthy(evaluateExpr(stmt.test, env, context))) {
        const result = executeStatements(stmt.body, env, context);
        if (result instanceof ReturnSignal) return result;
        guard += 1;
        if (guard > 10_000) {
          throw new InterpreterError('Possible infinite loop detected', stmt.loc);
        }
      }
      return undefined;
    }
    case 'ReturnStmt':
      return new ReturnSignal(stmt.value ? evaluateExpr(stmt.value, env, context) : null);
  }
}

function executeStatements(
  statements: StatementNode[],
  env: RuntimeEnv,
  context: ExecutionContext
): ReturnSignal | undefined {
  for (const stmt of statements) {
    const result = executeStatement(stmt, env, context);
    if (result instanceof ReturnSignal) {
      return result;
    }
  }
  return undefined;
}

export function executeProgram(program: ProgramNode): ExecutionResult {
  const functions = new Map(program.functions.map((fn) => [fn.name, fn] as const));
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const p = require('path');
    const logPath = p.join(__dirname, '..', '..', 'tmp', 'interpreter.log');
    fs.mkdirSync(p.dirname(logPath), { recursive: true });
    fs.appendFileSync(
      logPath,
      `[executeProgram] functions=${JSON.stringify(program.functions.map((f: any) => f.name))}\n`
    );
  } catch (e) {
    // ignore
  }
  const rootFunction = functions.get('PUEBLO_NATAL') ?? program.functions[0];

  if (!rootFunction) {
    return {
      entryFunction: '',
      output: ['No hay funciones para ejecutar.'],
      returnValue: null,
    };
  }

  const context: ExecutionContext = {
    program,
    functions,
    output: [],
  };

  const env = createEnv();
  const signal = executeStatements(rootFunction.body, env, context);

  return {
    entryFunction: rootFunction.name,
    output: context.output,
    returnValue: signal instanceof ReturnSignal ? signal.value : null,
  };
}
