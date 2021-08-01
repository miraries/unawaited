import util from 'util';
import globSync, { IOptions } from "glob";
import Debug from "debug";

const debug = Debug('glob');

const glob = util.promisify(globSync);

/**
 * A simple wrapper for concating results of multiple glob patterns
 */
export default async function mergeGlob(pattern: Array<string>, options?: IOptions) {
    if (!Array.isArray(pattern)) {
        pattern = [pattern];
    };

    debug('globbing pattern', pattern);

    const lists = await Promise.all(
        pattern.map(p => glob(p, options))
    );

    debug('file lists', lists);

    return lists.flat();
};