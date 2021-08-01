import { Node } from 'acorn';
import * as walk from 'acorn-walk';
import Debug from "debug";

const debug = Debug('walk:definitions');

const walkOptions = {
    ...walk.base,
    FieldDefinition: () => { }
};

export default function walkDefinitions(ast: Node) {
    const functions: Array<{ name: string, loc: { line: number, column: number } }> = [];

    walk.simple(ast, {
        // without var/let/const:
        //   fn = function()
        AssignmentExpression(node: any) {
            if (node.left.type === "Identifier" && (["FunctionExpression", "ArrowFunctionExpression"].includes(node.right.type))) {
                debug('AssignmentExpression', node);

                if (node.right.async) {
                    functions.push({ name: node.left.name, loc: node.left.loc.start });
                }
            }
        },
        // with var/let/const
        //   const fn = async function() {
        VariableDeclaration(node: any) {
            node.declarations.forEach(function (declaration: any) {
                if (declaration.init && (["FunctionExpression", "ArrowFunctionExpression"].includes(declaration.init.type))) {
                    debug('VariableDeclaration', declaration)

                    if (declaration.init.async) {
                        functions.push({ name: declaration.id.name, loc: declaration.id.loc.start });
                    }
                }
            });
        },
        // with function keyword
        //   function asd() {
        //   module.exports = function asd() {
        Function(node: any) {
            if (node.id) {
                debug('Function', node);

                if (node.async) {
                    functions.push({ name: node.id.name, loc: node.id.loc.start });
                }
            }
        },
        // as methods in classes
        MethodDefinition(node: any) {
            if (node.value.type === 'FunctionExpression') {
                debug('MethodDefinition', node);

                if (node.value.async) {
                    functions.push({ name: node.key.name, loc: node.key.loc.start });
                }
            }
        }
    }, walkOptions);

    return functions;
};