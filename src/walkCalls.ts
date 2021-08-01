import { Node } from 'acorn'
import * as walk from 'acorn-walk'
import Debug from 'debug'

const debug = Debug('walk:calls')

const walkOptions = {
  ...walk.base,
  FieldDefinition: () => { }
}

export default function walkCalls (ast: Node): Array<{ name: string, loc: { line: number, column: number } }> {
  const functions: Array<{ name: string, loc: { line: number, column: number } }> = []

  walk.ancestor(ast, {
    CallExpression (expression: any, ancestors: any) {
      if (!['MemberExpression', 'Identifier'].includes(expression.callee.type)) {
        return
      }

      const functionName: string = expression.callee.type === 'MemberExpression'
        ? expression.callee.property.name
        : expression.callee.name

      const awaited = ancestors.some((a: any) => a.type === 'AwaitExpression')

      if (awaited === false) {
        debug('CallExpression', expression.loc.start)

        functions.push({ name: functionName, loc: expression.loc.start })
      }
    }
  }, walkOptions)

  return functions
};
