/**
 * The hosting of the documentation site as `firebase.json` configures it, applied the way Firebase Hosting applies it:
 * the local server of the docs smoke and the specs follow the deployed site instead of a copy of its rules.
 *
 * Reads the forms of a redirect or a rewrite the configuration uses, an exact `source` path or an RE2 `regex` with
 * named groups, and throws on any other, so a new rule cannot be skipped here unnoticed.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import JSON5 from 'json5';

const CONFIG_PATH = resolve(import.meta.dirname, '..', 'firebase.json');

/**
 * @typedef {{ source?: string, regex?: string, destination: string, type?: number }} HostingRule
 * @typedef {{ target: string, redirects?: HostingRule[], rewrites?: HostingRule[] }} HostingTarget
 */

/**
 * @param {string} target
 * @param {string} [path]
 * @returns {HostingTarget}
 */
export const readHostingTarget = (target, path = CONFIG_PATH) => {
    const hosting = /** @type {HostingTarget[]} */ (JSON5.parse(readFileSync(path, 'utf8')).hosting);
    const config = hosting.find((entry) => entry.target === target);

    if (!config) throw new Error(`${path} has no hosting target "${target}"`);

    return config;
};

/**
 * The named groups of the rule that match the path, or `null`.
 *
 * @param {HostingRule} rule
 * @param {string} path
 * @returns {Record<string, string> | null}
 */
const matchRule = (rule, path) => {
    if (rule.regex !== undefined) {
        // RE2 names a group `(?P<name>...)`, JavaScript `(?<name>...)`.
        const match = new RegExp(rule.regex.replaceAll('(?P<', '(?<')).exec(path);

        return match ? { ...match.groups } : null;
    }

    if (rule.source === undefined || /[*?!{}:[\]]/.test(rule.source)) {
        throw new Error(`a hosting rule this script cannot apply: ${JSON.stringify(rule)}`);
    }

    return rule.source === path ? {} : null;
};

/**
 * Where the first redirect that matches the path sends it, with the status it answers, or `null`.
 *
 * @param {HostingTarget} hosting
 * @param {string} path
 * @returns {{ location: string, status: number } | null}
 */
export const findRedirect = (hosting, path) => {
    for (const redirect of hosting.redirects ?? []) {
        const groups = matchRule(redirect, path);

        if (!groups) continue;

        const location = redirect.destination.replace(/:([A-Za-z]\w*)/g, (_, name) => {
            if (groups[name] === undefined) throw new Error(`"${redirect.destination}" names no group ":${name}"`);

            return groups[name];
        });

        return { location, status: redirect.type ?? 301 };
    }

    return null;
};

/**
 * The destination of the first rewrite that matches the path, or `null`. Hosting reaches the rewrites only for a path
 * that is neither redirected nor a file.
 *
 * @param {HostingTarget} hosting
 * @param {string} path
 * @returns {string | null}
 */
export const findRewrite = (hosting, path) =>
    (hosting.rewrites ?? []).find((rewrite) => matchRule(rewrite, path))?.destination ?? null;
