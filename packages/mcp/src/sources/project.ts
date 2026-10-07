import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, parse as parsePath } from 'node:path';

/**
 * Where the server reads its data from.
 *
 * The server is spawned by the client inside the consumer's project, so the project root is
 * discovered from `cwd` rather than configured. Each Koobiq package is then resolved
 * independently: `peerDependencies` of `@koobiq/components` allow `@koobiq/icons` `^11 || ^12`,
 * so there is no single "Koobiq version" to resolve.
 */

export type PackageRef = {
    name: string;
    version: string;
    root: string;
    major: number;
};

/**
 * Which Koobiq line the project is on.
 *
 * `unknown` when no Koobiq package resolved at all, which is the state of a project about to
 * install one — that case still deserves the installation guide, so it is not an error.
 */
export type Framework = 'angular' | 'react' | 'unknown';

export type ProjectContext = {
    projectRoot: string | null;
    framework: Framework;
    packages: Map<string, PackageRef>;
};

const ANGULAR_PACKAGES = ['@koobiq/components', '@koobiq/icons', '@koobiq/design-tokens'] as const;

/**
 * Enough to recognise a React project. Nothing is indexed for it yet, so the only use of this is to
 * refuse: a server that answers a React question with `<kbq-button>` costs more than one that says
 * it does not know. `@koobiq/icons` and `@koobiq/design-tokens` are shared between the two lines,
 * so neither of them can tell the frameworks apart — only these can.
 */
const REACT_PACKAGES = ['@koobiq/react-components', '@koobiq/react-core', '@koobiq/react-primitives'] as const;

const KOOBIQ_PACKAGES = [...ANGULAR_PACKAGES, ...REACT_PACKAGES] as const;

/** Nearest ancestor of `from` that holds a package.json. */
export const findProjectRoot = (from: string): string | null => {
    let current = from;
    const { root } = parsePath(current);

    while (true) {
        if (existsSync(join(current, 'package.json'))) return current;
        if (current === root) return null;
        current = dirname(current);
    }
};

/**
 * Reads a dependency's own package.json from the project's `node_modules`.
 *
 * Deliberately not `require.resolve`: a package whose `exports` omit `./package.json` cannot be
 * resolved that way, and several published packages do omit it.
 */
const readPackage = (projectRoot: string, name: string): PackageRef | null => {
    const packageRoot = join(projectRoot, 'node_modules', ...name.split('/'));
    const manifestPath = join(packageRoot, 'package.json');

    if (!existsSync(manifestPath)) return null;

    try {
        const { version } = JSON.parse(readFileSync(manifestPath, 'utf-8')) as { version?: string };

        if (typeof version !== 'string') return null;

        return { name, version, root: packageRoot, major: Number(version.split('.')[0]) };
    } catch {
        return null;
    }
};

/** Angular wins a tie: a repository holding both is an Angular project trying React, not vice versa. */
const detectFramework = (packages: Map<string, PackageRef>): Framework => {
    if (packages.has('@koobiq/components')) return 'angular';
    if (REACT_PACKAGES.some((name) => packages.has(name))) return 'react';

    return 'unknown';
};

/**
 * A package root handed over directly, bypassing the walk through `node_modules`.
 *
 * `KOOBIQ_COMPONENTS_ROOT=/path/to/package`. Two layouts need it and neither is exotic: this
 * library's own monorepo builds `@koobiq/components` into `dist/components` and never installs it,
 * so there is nothing in `node_modules` to find; and Yarn PnP has no `node_modules` at all.
 */
const OVERRIDES: Record<string, string> = {
    '@koobiq/components': 'KOOBIQ_COMPONENTS_ROOT',
    '@koobiq/icons': 'KOOBIQ_ICONS_ROOT',
    '@koobiq/design-tokens': 'KOOBIQ_TOKENS_ROOT'
};

const readOverride = (name: string): PackageRef | null => {
    const root = OVERRIDES[name] ? process.env[OVERRIDES[name]] : undefined;

    if (!root || !existsSync(join(root, 'package.json'))) return null;

    try {
        const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as { version?: string };

        if (typeof version !== 'string') return null;

        return { name, version, root, major: Number(version.split('.')[0]) };
    } catch {
        return null;
    }
};

export const resolveProject = (cwd: string = process.cwd()): ProjectContext => {
    const projectRoot = findProjectRoot(cwd);
    const packages = new Map<string, PackageRef>();

    for (const name of KOOBIQ_PACKAGES) {
        const found = readOverride(name) ?? (projectRoot ? readPackage(projectRoot, name) : null);

        if (found) packages.set(name, found);
    }

    return { projectRoot, framework: detectFramework(packages), packages };
};
