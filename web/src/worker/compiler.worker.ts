import { cstToAst } from '../compiler/ast';
import { lowerProgramToIR, optimizeIR } from '../compiler/ir';
import { parser } from '../compiler/parser';
import { tokenizePokeCode } from '../compiler/lexer';
import { typeCheck } from '../compiler/semantics/typeChecker';
import { executeProgram } from '../compiler/interpreter';
import { compileIRToJS } from '../compiler/codegen';

type Diagnostic = {
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
};

function toDiagnostic(
  message: string,
  line = 1,
  column = 1,
  endLine?: number,
  endColumn?: number
): Diagnostic {
  return { message, line, column, endLine, endColumn };
}

function getSyntaxDiagnostic(err: any): Diagnostic {
  const token = err?.token ?? err?.previousToken;
  const line = token?.startLine ?? 1;
  const column = token?.startColumn ?? 1;
  const endLine = token?.endLine ?? line;
  const endColumn = token?.endColumn ?? column;
  return toDiagnostic(
    `Syntax error: ${err?.message ?? 'Unknown syntax error'}`,
    line,
    column,
    endLine,
    endColumn
  );
}

onmessage = (e) => {
  const code = e.data.code || '';
  const lexResult = tokenizePokeCode(code);

  if (lexResult.errors.length) {
    const diagnostics = lexResult.errors.map((err) =>
      toDiagnostic(
        `Lexical error: ${err.message}`,
        err.line ?? 1,
        err.column ?? 1,
        err.line ?? 1,
        (err.column ?? 1) + 1
      )
    );
    postMessage({
      type: 'errors',
      errors: diagnostics,
    });
    return;
  }

  parser.input = lexResult.tokens;
  const cst = parser.program();

  if (parser.errors.length) {
    const diagnostics = parser.errors.map(getSyntaxDiagnostic);
    postMessage({
      type: 'errors',
      errors: diagnostics,
    });
    return;
  }

  try {
    const ast = cstToAst(cst);
    const semErrors = typeCheck(ast);
    if (semErrors.length) {
      postMessage({
        type: 'errors',
        errors: semErrors.map((e) =>
          toDiagnostic(
            e.message,
            e.loc?.startLine ?? 1,
            e.loc?.startColumn ?? 1,
            e.loc?.endLine ?? e.loc?.startLine ?? 1,
            e.loc?.endColumn ?? (e.loc?.startColumn ?? 1) + 1
          )
        ),
      });
      return;
    }

    const ir = lowerProgramToIR(ast);
    const optimizedIr = optimizeIR(ir);
    const compiledJS = compileIRToJS(optimizedIr);

    const execution = executeProgram(ast);

    let jsExecutionError: string | null = null;
    let jsExecutionResult: any = null;
    try {
      const runFn = new Function(`${compiledJS}\nreturn runCompiledProgram();`);
      jsExecutionResult = runFn();
    } catch (err: any) {
      jsExecutionError = err?.message ?? String(err);
    }

    postMessage({
      type: 'result',
      ast,
      ir,
      optimizedIr,
      compiledJS,
      jsExecutionResult,
      jsExecutionError,
      execution,
    } as any);
  } catch (err: any) {
    postMessage({
      type: 'errors',
      errors: [toDiagnostic(`AST Translation Error: ${err?.message ?? 'Unknown error'}`)],
    });
  }
};
