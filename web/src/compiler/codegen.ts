import type { IRProgram, IRFunction, IRStatement, IRExpr, IRLValue } from './ir';

function mapType(typeName: string): string {
  switch (typeName) {
    case 'PokeBall':
    case 'int':
      return 'int';
    case 'SuperBall':
    case 'float':
      return 'float';
    case 'UltraBall':
    case 'string':
      return 'const char*';
    case 'MasterBall':
    case 'bool':
      return 'bool';
    default:
      return 'int';
  }
}

function getMochilaSuffix(typeName: string): string {
  switch (typeName) {
    case 'PokeBall':
    case 'int':
      return 'int';
    case 'SuperBall':
    case 'float':
      return 'float';
    case 'UltraBall':
    case 'string':
      return 'string';
    case 'MasterBall':
    case 'bool':
      return 'bool';
    default:
      return 'int';
  }
}

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
      return `(${left} ${expr.op} ${right})`;
    }
    case 'IRCallExpr': {
      if (expr.name === 'MIRAR_RADAR') {
        return `(*(${compileExpr(expr.args[0])}))`;
      }
      if (expr.name === 'DEVOLVER_A_LA_BALL') {
        return compileExpr(expr.args[0]);
      }
      if (expr.name === 'UBICACION_DE') {
        const arg = expr.args[0];
        if (arg.type === 'IRLValueExpr' && arg.target.type === 'IRVarTarget') {
          return `(&(${arg.target.name}))`;
        }
        if (arg.type === 'IRIdentifier') {
          return `(&(${arg.name}))`;
        }
        return `(&(${compileExpr(arg)}))`;
      }
      if (expr.name === 'OAK_PREGUNTA') {
        return `OAK_PREGUNTA(${compileExpr(expr.args[0])})`;
      }
      const args = expr.args.map(compileExpr).join(', ');
      return `${expr.name}(${args})`;
    }
    case 'IRLValueExpr':
      return compileLValue(expr.target);
    case 'IRMochilaPop': {
      // We need the type of the elements to call the right pop helper.
      // But since IR doesn't carry element type, we can infer it or use a default.
      // For pop, we can detect/default to int, or we can look it up if we want.
      // A common way is to check the mochilaName. To be safe, we can output pop based on the prefix of the variable or compile statically.
      // Let's assume the name suffix or type suffix, or we can use a generic pop if C supported it.
      // Since C does not support it without type, we can look up the type name from a simple heuristic or generate a generic macro.
      // Wait, we can define a macro or look at the type. How does C11 _Generic help?
      // _Generic does NOT help with LHS or struct fields unless we pass the struct type.
      // We can pass the struct pointer itself to a generic pop macro!
      // #define SACAR(m) _Generic(&(m), Mochila_int*: mochila_int_pop(&(m)), Mochila_float*: mochila_float_pop(&(m)), ...)
      // Yes! That is incredibly beautiful! A _Generic macro for SACAR(m)!
      return `SACAR(${expr.mochilaName})`;
    }
    case 'IRMochilaLength':
      return `(${expr.mochilaName}.size)`;
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
        return `(*(${compileExpr(target.arg)}))`;
      }
      return compileExpr(target.arg);
  }
}

function compileStmt(stmt: IRStatement, indent = '  '): string {
  switch (stmt.type) {
    case 'IRDeclare': {
      const cType = mapType(stmt.typeName);
      if (stmt.kind === 'CAPTURE') {
        return `${indent}${cType} ${stmt.name} = ${stmt.value ? compileExpr(stmt.value) : '0'};`;
      }
      if (stmt.kind === 'EQUIPO') {
        return `${indent}${cType} ${stmt.name}[${
          stmt.value ? compileExpr(stmt.value) : '0'
        }] = {0};`;
      }
      if (stmt.kind === 'MOCHILA') {
        const suffix = getMochilaSuffix(stmt.typeName);
        return `${indent}Mochila_${suffix} ${stmt.name} = { NULL, 0, 0 };`;
      }
      if (stmt.kind === 'RADAR') {
        return `${indent}${cType}* ${stmt.name} = NULL;`;
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
      return `${indent}return ${stmt.value ? compileExpr(stmt.value) : '0'};`;
    case 'IRMochilaPush': {
      return `${indent}GUARDAR(${stmt.name}, ${compileExpr(stmt.value)});`;
    }
  }
}

function compileFunc(fn: IRFunction): string {
  const isMain = fn.name === 'PUEBLO_NATAL';
  const cRetType = isMain ? 'int' : fn.returnType ? mapType(fn.returnType) : 'void';
  const funcName = isMain ? 'main' : fn.name;

  const params = isMain
    ? 'void'
    : fn.params.map((p) => `${mapType(p.typeName)} ${p.name}`).join(', ');

  let body = fn.body.map((s) => compileStmt(s, '    ')).join('\n');
  if (isMain && !body.includes('return ')) {
    body += '\n    return 0;';
  }

  return `${cRetType} ${funcName}(${params}) {\n${body}\n}`;
}

export function compileIRToC(program: IRProgram): string {
  const functionsCode = program.functions.map(compileFunc).join('\n\n');

  return `/* ⚡ PIKA COMPILER GENERATED C CODE ⚡ */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

/* --- Mochila Structs and Helpers --- */
typedef struct {
    int* data;
    int size;
    int capacity;
} Mochila_int;

typedef struct {
    float* data;
    int size;
    int capacity;
} Mochila_float;

typedef struct {
    const char** data;
    int size;
    int capacity;
} Mochila_string;

typedef struct {
    bool* data;
    int size;
    int capacity;
} Mochila_bool;

static inline void mochila_int_push(Mochila_int* m, int val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(int));
    }
    m->data[m->size++] = val;
}
static inline int mochila_int_pop(Mochila_int* m) {
    if (m->size == 0) return 0;
    return m->data[--m->size];
}

static inline void mochila_float_push(Mochila_float* m, float val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(float));
    }
    m->data[m->size++] = val;
}
static inline float mochila_float_pop(Mochila_float* m) {
    if (m->size == 0) return 0.0f;
    return m->data[--m->size];
}

static inline void mochila_string_push(Mochila_string* m, const char* val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(const char*));
    }
    m->data[m->size++] = val;
}
static inline const char* mochila_string_pop(Mochila_string* m) {
    if (m->size == 0) return "";
    return m->data[--m->size];
}

static inline void mochila_bool_push(Mochila_bool* m, bool val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(bool));
    }
    m->data[m->size++] = val;
}
static inline bool mochila_bool_pop(Mochila_bool* m) {
    if (m->size == 0) return false;
    return m->data[--m->size];
}

/* Generic GUARDAR/Push macro */
#define GUARDAR(m, val) _Generic(&(m), \
    Mochila_int*: mochila_int_push, \
    Mochila_float*: mochila_float_push, \
    Mochila_string*: mochila_string_push, \
    Mochila_bool*: mochila_bool_push \
)(&(m), val)

/* Generic SACAR/Pop macro */
#define SACAR(m) _Generic(&(m), \
    Mochila_int*: mochila_int_pop, \
    Mochila_float*: mochila_float_pop, \
    Mochila_string*: mochila_string_pop, \
    Mochila_bool*: mochila_bool_pop \
)(&(m))

/* --- Builtin I/O Helpers --- */
static inline void print_int(int x) { printf("%d\\n", x); }
static inline void print_float(float x) { printf("%f\\n", x); }
static inline void print_string(const char* x) { printf("%s\\n", x); }
static inline void print_bool(bool x) { printf("%s\\n", x ? "true" : "false"); }
static inline void print_ptr(void* x) { printf("%p\\n", x); }

#define DICE_PROF_OAK(X) _Generic((X), \
    int: print_int, \
    float: print_float, \
    const char*: print_string, \
    char*: print_string, \
    bool: print_bool, \
    default: print_ptr \
)(X)

static inline int OAK_PREGUNTA(const char* prompt) {
    printf("%s ", prompt);
    int val;
    if (scanf("%d", &val) != 1) val = 0;
    return val;
}

/* --- Compiled Functions --- */
${functionsCode}
`;
}
