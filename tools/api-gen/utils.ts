import { globSync } from 'glob';

/**
 * glob v9 removed the GlobSync class, stopped sorting results, treats a backslash as an
 * escape rather than a separator, and returns native separators. `windowsPathsNoEscape` makes
 * joined patterns work on Windows, `posix` keeps the paths identical on Windows and Linux, and
 * the sort keeps the generated documentation stable.
 */
const findFiles = (pattern: string): string[] => globSync(pattern, { windowsPathsNoEscape: true, posix: true }).sort();

export const src = (path: string | string[]): string[] => {
    let res: string[];

    if (Array.isArray(path)) {
        res = path.reduce((result: string[], curPath) => {
            result.push(...findFiles(curPath));

            return result;
        }, []);
    } else {
        res = findFiles(path);
    }

    return res;
};
