import fs from 'fs/promises'
import { Parser } from 'acorn-with-stage3'
import Debug from 'debug'
import { Node } from 'acorn'

const debug = Debug('parse')

export default async function parseFile (file: string): Promise<{ file: string, ast: Node }> {
  debug('Reading file', file)
  const text = await fs.readFile(file, 'utf-8')

  try {
    debug('Parsing file', file)
    const ast = Parser.parse(text, {
      ecmaVersion: 2020,
      locations: true
    })

    return { file, ast }
  } catch (err) {
    throw new Error(`Error parsing file ${file}, ${err.message as string}`)
  }
};
