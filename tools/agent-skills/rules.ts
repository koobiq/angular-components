import { ALLOWED_FRONTMATTER_KEYS, SKILL_LIMITS } from './constants';

/** Names and paths the hand-written text of the skill may mention, collected from the sources. */
export interface KnownFacts {
    /** Every name the entry points export. */
    exports: Set<string>;
    /** Element names the selectors match, e.g. `kbq-form-field`. */
    elements: Set<string>;
    /** Attribute names the selectors match, e.g. `kbqInput`, `kbq-button`. */
    attributes: Set<string>;
    /** Input and output names and `exportAs` names templates bind. */
    bindings: Set<string>;
    /**
     * Other `kbq*` names the library code uses, such as validation error keys (`kbqDatepickerMin`), and the names of
     * the Koobiq packages the documentation pairs with it (`kbqAgGridTheme` of `@koobiq/ag-grid-angular-theme`).
     */
    sourceNames: Set<string>;
    /** CSS custom properties the library and `@koobiq/design-tokens` define. */
    tokens: Set<string>;
    /** Entry points without the package name, e.g. `button`, `scrollbar/deprecated`. */
    entryPoints: Set<string>;
}

export interface Problem {
    file: string;
    message: string;
}

/** Folders of the package a path such as `node_modules/@koobiq/components/agent-docs` refers to; not entry points. */
const PACKAGE_FOLDERS = new Set(['agent-docs', 'skills', 'schematics', 'prebuilt-themes', 'package', 'fesm2022']);

const lineOf = (text: string, index: number): number => text.slice(0, index).split('\n').length;

/**
 * Checks that every Koobiq name the hand-written text mentions exists in the sources: an agent copies names from
 * the skill verbatim, so a renamed class, selector, token or entry point has to fail the build, not the consumer.
 */
export const checkFacts = (file: string, text: string, facts: KnownFacts): Problem[] => {
    const problems: Problem[] = [];
    const report = (index: number, message: string) =>
        problems.push({ file: `${file}:${lineOf(text, index)}`, message });

    for (const match of text.matchAll(/\b(?:Kbq[A-Z][A-Za-z0-9]*|KBQ_[A-Z0-9_]+)\b/g)) {
        if (!facts.exports.has(match[0])) report(match.index, `\`${match[0]}\` is not exported by any entry point`);
    }

    for (const match of text.matchAll(/\bkbq[A-Z][A-Za-z0-9]*\b/g)) {
        const name = match[0];

        const known = [facts.exports, facts.attributes, facts.bindings, facts.sourceNames].some((set) => set.has(name));

        if (!known) report(match.index, `\`${name}\` does not exist in the library or its companion packages`);
    }

    for (const match of text.matchAll(/<(kbq-[a-z0-9-]+)/g)) {
        if (!facts.elements.has(match[1])) report(match.index, `<${match[1]}> is not a selector of any component`);
    }

    for (const match of text.matchAll(/--kbq-[a-z0-9-]+/g)) {
        const name = match[0];
        const next = text[match.index + name.length] ?? '';
        // `--kbq-<name>-*` and `--kbq-badge-*` describe a family of tokens: some token has to start with it.
        const isPrefix = name.endsWith('-') || next === '*' || next === '<' || next === '{';
        const known = isPrefix ? [...facts.tokens].some((token) => token.startsWith(name)) : facts.tokens.has(name);

        if (!known) report(match.index, `\`${name}${isPrefix ? '*' : ''}\` is not a defined design token`);
    }

    for (const match of text.matchAll(/@koobiq\/components\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/g)) {
        const [, first, second] = match;

        if (PACKAGE_FOLDERS.has(first)) continue;
        if (second && facts.entryPoints.has(`${first}/${second}`)) continue;

        if (!facts.entryPoints.has(first)) report(match.index, `\`@koobiq/components/${first}\` is not an entry point`);
    }

    return problems;
};

export interface Frontmatter {
    keys: string[];
    values: Record<string, string>;
}

/** Top-level keys of the YAML frontmatter and their scalar values; nested maps such as `metadata` stay unparsed. */
export const parseFrontmatter = (text: string): Frontmatter | null => {
    const block = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];

    if (block === undefined) return null;

    const keys: string[] = [];
    const values: Record<string, string> = {};

    for (const line of block.split('\n')) {
        const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

        if (!match) continue;

        keys.push(match[1]);
        values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }

    return { keys, values };
};

/** The rules of the Agent Skills specification that claude.ai, the Skills API and other agents enforce. */
export const checkSkillFile = (file: string, text: string, expectedName: string): Problem[] => {
    const problems: Problem[] = [];
    const report = (message: string) => problems.push({ file, message });
    const frontmatter = parseFrontmatter(text);

    if (!frontmatter) return [{ file, message: 'has no YAML frontmatter' }];

    for (const key of frontmatter.keys) {
        if (!ALLOWED_FRONTMATTER_KEYS.includes(key)) {
            report(`frontmatter key "${key}" is not in the specification; claude.ai and the Skills API reject it`);
        }
    }

    if (frontmatter.values.name !== expectedName) report(`name must be "${expectedName}", the name of its folder`);

    const description = frontmatter.values.description ?? '';

    if (!description) report('description is empty');

    if (description.length > SKILL_LIMITS.descriptionLength) {
        report(`description is ${description.length} characters, the limit is ${SKILL_LIMITS.descriptionLength}`);
    }

    const lines = text.split('\n').length;

    if (lines > SKILL_LIMITS.skillLines) report(`is ${lines} lines long, the limit is ${SKILL_LIMITS.skillLines}`);

    const tokens = Math.round(text.length / 4);

    if (tokens > SKILL_LIMITS.skillTokens) {
        report(
            `is about ${tokens} tokens long, the budget is ${SKILL_LIMITS.skillTokens}; move detail into references`
        );
    }

    if (text.includes('{{')) report('still has an unfilled {{placeholder}}');

    return problems;
};

/** Relative Markdown links have to resolve inside the skill: the skill is copied as a folder. */
export const checkLinks = (file: string, text: string, exists: (target: string) => boolean): Problem[] =>
    [...text.matchAll(/\]\(([^)\s]+)\)/g)]
        .map(([, target]) => target)
        .filter((target) => !/^[a-z]+:/i.test(target) && !target.startsWith('#'))
        .filter((target) => !exists(target))
        .map((target) => ({ file, message: `links to ${target}, which is not part of the skill` }));
