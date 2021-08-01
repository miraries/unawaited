# unawaited

Check for floating ("unawaited") promises without Typescript*.

```js
// someFile.js
const getWeather = async function() {...}

const weather = getWeather();
                ^ ^ ^
                missing await

$ unawaited -g "someFile.js"

1 problem(s) found!

Function getWeather at someFile.js:1:6 called at someFile.js:3:16
```

## Install

```
$ npm install --global unawaited
```

## Usage

```
$ unawaited --help

  Usage: unawaited [options]
  
  Check for unawaited async function calls
  
  Options:
    -V, --version                      output the version number
    -g, --glob <patterns...>           Glob patterns to search for files. Only JS files supported.
    -q, --quiet                        Supress output.
    -i, --ignorePath <ignoreFilePath>  Path to file to use for ignoring problems.
    -h, --help                         display help for command

  Examples
    $ unawaited -g "src/**/*.js"
    $ unawaited -g "src/**/*.js" "index.js" -i .unawaitedignore
```

## Ignore false positives

Provide path to a file with `--ignorePath` which contains parts of strings to ignore function declarations.

Eg. to ignore all warnings in `src/someFile.js`, and for calls to function `fooBar` at `src/otherFile.js`:

```
src/someFile.js
fooBar at src/otherFile.js
```

## Notes

\* There are many limitations to this method. All files matched with glob are parsed through acorn and following is matched:

- non-awaited function calls
- async function declarations

and their difference is printed - so keep the number of files small (also because no concurrency limit in reading them is implemented). Eg. if you include node_modules expect 🔥.

This also means same function names from different files aren't handled nicely, and functions imported from node_modules are not handled.

In summary, this a hack to add functionality to what [eslint-plugin-no-floating-promise](https://github.com/SebastienGllmt/eslint-plugin-no-floating-promise) does through ESLint.
If you want to properly handle this, use Typescript with [@typescript-eslint/no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-floating-promises.md) (like this project does).

## Related

- [eslint-plugin-no-floating-promise](https://github.com/SebastienGllmt/eslint-plugin-no-floating-promise)