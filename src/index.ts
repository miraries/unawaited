#!/usr/bin/env node

import _ from 'lodash'
import fs from 'fs/promises'
import chalk from 'chalk'
import figlet from 'figlet'
import { program } from 'commander'
import traverse from './traverse'

program
  .version('1.0.0')
  .description('Check for unawaited async function calls')
  .requiredOption('-g, --glob <patterns...>', 'Glob patterns to search for files. Only JS files supported.')
  .option('-q, --quiet', 'Supress output.')
  .option('-i, --ignorePath <ignoreFilePath>', 'Path to file to use for ignoring problems.')
  .parse(process.argv)
  .showHelpAfterError()

const options = program.opts()

const print = (...args: any[]): void => options.quiet === true ? undefined : console.log(...args)

print(
  chalk.magenta(
    figlet.textSync('unawaited', { horizontalLayout: 'full' })
  )
)

if (process.argv.slice(2).length === 0) {
  program.outputHelp()
}

const getIgnoredLines = async function (): Promise<string[]> {
  if (options.ignorePath?.length <= 1) {
    return []
  }

  const text = await fs.readFile(options.ignorePath, 'utf-8')

  return text.split(/\r?\n/).map(line => line.trim()).filter(str => str.length)
}

const printResults = function (results: TraverseResults, ignoredLines: string[] = []): boolean {
  const formatCall = (fn: TraverseResult['call']): string => `${fn.file}:${fn.loc.line}:${fn.loc.column}`
  const formatDefinition = (fn: TraverseResult['definition']): string => `${fn.name} at ${fn.file}:${fn.loc.line}:${fn.loc.column}`

  const lineReferences = results.map(res => ({
    call: formatCall(res.call),
    definition: formatDefinition(res.definition)
  }))

  const grouped = _.groupBy(lineReferences, 'definition')

  let ignoredCount = 0

  for (const [key, val] of Object.entries(grouped)) {
    if (ignoredLines.some(line => key.includes(line))) {
      ignoredCount++

      continue
    }

    if (val.length > 1) {
      print('Function', chalk.blue.italic(key), 'called at')

      val.forEach(v => print('  - ' + chalk.yellow(v.call)))
    } else {
      print('Function', chalk.blue.italic(key), 'called at', chalk.yellow(val[0].call))
    }
  }

  if (ignoredCount > 0) {
    print(chalk.bgYellow.bold(`Ignored ${ignoredCount} problem(s).`))
  }

  const shouldError = Object.keys(grouped).length !== ignoredCount

  return shouldError
};

/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
  const ignoredLines = await getIgnoredLines()

  const results = await traverse(options.glob)

  if (results.length === 0) {
    print(chalk.bgGreen('All good!'))

    return
  }

  print(chalk.bgRed.bold(`${results.length} problems found!`))
  print(chalk.underline('List of functions defined as async, but are not awaited when called'))

  const shouldError = printResults(results, ignoredLines)
  process.exit(shouldError ? 1 : 0)
})()
