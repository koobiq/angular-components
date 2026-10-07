/**
 * Just enough version arithmetic for release lists.
 *
 * Koobiq tags are plain `major.minor.patch` with no prerelease or build metadata, so a real semver
 * dependency would be carrying a parser for syntax that never appears. Anything unparseable sorts
 * as `0.0.0` rather than throwing: a stray tag should not take down an index build.
 */

export const parts = (version: string): [number, number, number] => {
    const numbers = version.split('.').map((part) => Number.parseInt(part, 10) || 0);

    return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0];
};

export const compare = (a: string, b: string): number => {
    const left = parts(a);
    const right = parts(b);

    for (let i = 0; i < 3; i++) {
        const difference = (left[i] ?? 0) - (right[i] ?? 0);

        if (difference !== 0) return difference;
    }

    return 0;
};

export const lte = (a: string, b: string): boolean => compare(a, b) <= 0;

export const isRelease = (tag: string): boolean => /^\d+\.\d+\.\d+$/.test(tag);

export const sortReleases = (tags: string[]): string[] => [...tags].sort(compare);
