import { posix } from 'path';
import { LLMS_TXT } from '../llms/llms-txt';
import { findMarkdownProblems } from '../llms/markdown-problems';
import { MAX_FILE_LENGTH } from '../llms/site-files';

/** The files of a skill, by their path inside its directory. */
export interface Skill {
    name: string;
    files: Map<string, string>;
}

/** The fields the Agent Skills specification defines: claude.ai and the Skills API reject a skill with any other. */
const FRONTMATTER_FIELDS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_COMPATIBILITY_LENGTH = 500;

/** The specification asks to keep `SKILL.md` under 500 lines and 5,000 tokens: an agent loads it whole. */
const MAX_SKILL_LINES = 500;
const MAX_SKILL_LENGTH = 20_000;

export interface Frontmatter {
    fields: Map<string, string | Map<string, string>>;
    /** Lines YAML may read otherwise than this check does, which it therefore refuses. */
    problems: string[];
    body: string;
}

const FIELD = /^(\s*)([\w-]+):(?:\s+(.*))?$/;

/**
 * A value YAML reads as written: quoted, with a single quote doubled inside single quotes and escaped inside double
 * ones, or plain with no indicator ahead of it and no `: ` or ` #` inside it.
 */
const QUOTED = /^(?:'(?:[^']|'')*'|"(?:[^"\\]|\\.)*")$/;
const PLAIN = /^(?![-?:,[\]{}#&*!|>'"%@`])(?!.*(?::\s|:$|\s#)).*$/;

/**
 * The frontmatter of a `SKILL.md`: its fields, `metadata` as a map of its own, and the text after it; `null` when the
 * file does not open with one. Reads the subset of YAML a field per line, quoted or plain, one level of maps deep and
 * indented with spaces, and reports any other line instead of guessing: a block scalar, `: ` or ` #` in a plain
 * value, a key twice, a tab, a map inside a map.
 */
export const parseFrontmatter = (text: string): Frontmatter | null => {
    const match = /^---\n([\s\S]*?)\n---\n/.exec(text);

    if (!match) return null;

    const fields = new Map<string, string | Map<string, string>>();
    const problems: string[] = [];
    let nested: Map<string, string> | null = null;
    let nestedIndent: number | null = null;
    const read = (key: string, value: string): string => {
        if (QUOTED.test(value))
            return value.startsWith("'") ? value.slice(1, -1).replace(/''/g, "'") : value.slice(1, -1);

        if (!PLAIN.test(value)) problems.push(`"${key}" is not a string YAML reads as written: quote it, on one line`);

        return value;
    };

    for (const line of match[1].split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue;

        const field = FIELD.exec(line.trimEnd());

        if (!field || (field[1] && !nested) || field[1].includes('\t')) {
            problems.push(`a line this check cannot read: ${line.trim()}`);
            continue;
        }

        const [, indent, key, value] = field;
        const map = indent ? nested! : fields;

        if (map.has(key)) problems.push(`"${key}" is set twice`);

        if (indent) {
            nestedIndent ??= indent.length;

            if (value === undefined || indent.length !== nestedIndent) {
                problems.push(`a map inside a map, which holds strings only: ${line.trim()}`);
                continue;
            }

            nested!.set(key, read(key, value));
        } else if (value === undefined) {
            nested = new Map();
            nestedIndent = null;
            fields.set(key, nested);
        } else {
            nested = null;
            fields.set(key, read(key, value));
        }
    }

    return { fields, problems, body: text.slice(match[0].length) };
};

export const findFrontmatterProblems = (skillName: string, frontmatter: Frontmatter | null): string[] => {
    if (!frontmatter) return ['SKILL.md: no frontmatter'];

    const { fields } = frontmatter;
    const text = (key: string): string => {
        const value = fields.get(key);

        return typeof value === 'string' ? value : '';
    };
    const problems = [
        ...frontmatter.problems,
        ...[...fields.keys()]
            .filter((key) => !FRONTMATTER_FIELDS.has(key))
            .map((key) => `a field the specification does not define, "${key}"`)
    ];
    const name = text('name');
    const description = text('description');

    if (!NAME.test(name) || name.length > MAX_NAME_LENGTH) {
        problems.push(`"name" is not up to ${MAX_NAME_LENGTH} lowercase letters, digits and hyphens: "${name}"`);
    }

    if (name !== skillName) problems.push(`"name" is "${name}", its directory "${skillName}"`);

    if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
        problems.push(`"description" has ${description.length} characters, not 1 to ${MAX_DESCRIPTION_LENGTH}`);
    }

    if (text('compatibility').length > MAX_COMPATIBILITY_LENGTH) {
        problems.push(`"compatibility" is longer than ${MAX_COMPATIBILITY_LENGTH} characters`);
    }

    if (fields.has('metadata') && typeof fields.get('metadata') === 'string') {
        problems.push('"metadata" is not a map of strings');
    }

    return problems.map((problem) => `SKILL.md: ${problem}`);
};

/** Where a relative link of a file leads inside the skill, or what is wrong with it. */
const createRelativeLinkCheck = (from: string, files: ReadonlySet<string>) => (url: string) => {
    let path: string;

    try {
        path = decodeURI(url.split('#')[0]);
    } catch {
        return `a link with a malformed escape: ${url}`;
    }

    const target = posix.normalize(posix.join(posix.dirname(from), path));

    if (target.startsWith('..')) return `a link out of the skill: ${url}`;

    return files.has(target) ? null : `a link to a file the skill does not have: ${url}`;
};

/** A path of the site a skill names in code, such as `<site>/api/<entry-point>.md`: each `<…>` stands for a segment. */
const SITE_PATH = /`<site>\/([^`\s]+)`/g;

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The paths of the site a skill names in code that match no file the site serves. */
const findSitePathProblems = (text: string, served: ReadonlySet<string>): string[] =>
    [...text.matchAll(SITE_PATH)]
        .map(([, template]) => template)
        .filter((template) => {
            const pattern = new RegExp(
                `^${template
                    .split(/<[^>]+>/)
                    .map(escapeRegExp)
                    .join('[^/]+')}$`
            );

            return template !== LLMS_TXT && ![...served].some((path) => pattern.test(path));
        })
        .map((template) => `a path the site does not serve: <site>/${template}`);

/**
 * What would keep an agent from using a skill: a frontmatter the specification rejects, a `SKILL.md` or a file too
 * long to read whole, and every problem of `findMarkdownProblems`, with the relative links checked against the files
 * of the skill. `served` holds the files the documentation site serves: a link of a skill to the site, and a path of
 * it the skill names in code, has to lead to one of them, so that a change to their layout cannot leave the skills
 * pointing at nothing.
 */
export const findSkillProblems = ({ name, files }: Skill, served: ReadonlySet<string>): string[] => {
    const paths = new Set(files.keys());
    const problems: string[] = [];
    const skillMd = files.get('SKILL.md');

    if (!skillMd) return [`${name}: no SKILL.md`];

    const frontmatter = parseFrontmatter(skillMd);

    problems.push(...findFrontmatterProblems(name, frontmatter));

    if (skillMd.split('\n').length > MAX_SKILL_LINES || skillMd.length > MAX_SKILL_LENGTH) {
        problems.push(
            `SKILL.md: ${skillMd.split('\n').length} lines and ${skillMd.length} characters, over the ${MAX_SKILL_LINES} lines or ${MAX_SKILL_LENGTH} characters an agent loads whole`
        );
    }

    for (const [path, text] of files) {
        const markdown = path === 'SKILL.md' ? (frontmatter?.body ?? text) : text;

        if (text.length > MAX_FILE_LENGTH) {
            problems.push(`${path}: ${text.length} characters, over the ${MAX_FILE_LENGTH} an agent reads at once`);
        }

        // A script or data a skill carries is not Markdown: only its length matters.
        if (!path.endsWith('.md')) continue;

        problems.push(
            ...[
                ...findMarkdownProblems(markdown, served, createRelativeLinkCheck(path, paths)),
                ...findSitePathProblems(markdown, served)
            ].map((problem) => `${path}: ${problem}`)
        );
    }

    return problems.map((problem) => `${name}: ${problem}`);
};
