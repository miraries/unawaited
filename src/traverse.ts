import mergeGlob from './mergeGlob'
import parseFile from './parse'
import walkCalls from './walkCalls'
import walkDefinitions from './walkDefinitions'
import Debug from 'debug'
import { Node } from 'acorn'

const debug = Debug('traverse')

export const parseFiles = async function (fileList: string[]): Promise<Array<{ file: string, ast: Node }>> {
  return await Promise.all(fileList.map(parseFile))
}

export default async function traverse (globs: string[]): Promise<TraverseResults> {
  const fileList = await mergeGlob(globs)

  debug('fileList', fileList)

  // probably not the best idea to store all files and asts in memory
  // however, alternative means having to parse them twice
  const parsedFiles = await parseFiles(fileList)

  debug('parsedFiles', parsedFiles)

  const syncFunctionCalls = parsedFiles
    .map(p => walkCalls(p.ast).map(call => ({ ...call, file: p.file })))
    .flat()

  const asyncFunctionDefinitions = parsedFiles
    .map(p => walkDefinitions(p.ast).map(call => ({ ...call, file: p.file })))
    .flat()

  const unawaitedCalls = syncFunctionCalls
    .flatMap(calledFn => {
      const definition = asyncFunctionDefinitions.find(f => f.name === calledFn.name)

      return (definition != null) ? [{ call: calledFn, definition }] : []
    })

  debug('syncFunctionCalls', syncFunctionCalls)
  debug('asyncFunctionDefinitions', asyncFunctionDefinitions)
  debug('unawaitedCalls', unawaitedCalls)

  return unawaitedCalls
};
