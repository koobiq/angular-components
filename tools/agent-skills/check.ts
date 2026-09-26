import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { dirname, join, relative } from 'path';
import { exportedNames, parseApiReport, selectorNames } from './api-report';
import {
    AGENT_DOCS_DIST_DIR,
    REPO_ROOT,
    REVIEW_HASHES_PATH,
    SKILL_DIST_DIR,
    SKILL_NAME,
    SKILL_SOURCE_DIR
} from './constants';
import { parseTokenNames } from './content';
import { COVERS_COMMENT } from './generate';
import { checkFacts, checkLinks, checkSkillFile, KnownFacts, Problem } from './rules';
import { collectSkillItems, getApiReportPaths, getEntryPoints } from './sources';

type ReviewHashes = Record<string, Record<string, string>>;

const relativePath = (path: string): string => relative(REPO_ROOT, path);

const listFiles = (directory: string): string[] =>
    readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);

        return statSync(path).isDirectory() ? listFiles(path) : [path];
    });

export const collectFacts = (): KnownFacts => {
    const facts: KnownFacts = {
        exports: new Set(),
        elements: new Set(),
        attributes: new Set(),
        bindings: new Set(),
        sourceNames: new Set(),
        tokens: new Set(),
        entryPoints: new Set(getEntryPoints())
    };

    for (const path of getApiReportPaths().values()) {
        const api = parseApiReport(readFileSync(path, 'utf-8'));
        const { elements, attributes } = selectorNames(api);

        exportedNames(api).forEach((name) => facts.exports.add(name));
        elements.forEach((name) => facts.elements.add(name));
        attributes.forEach((name) => facts.attributes.add(name));

        for (const directive of api.directives) {
            [...directive.inputs, ...directive.outputs].forEach(({ name }) => facts.bindings.add(name));
            directive.exportAs.forEach((name) => facts.bindings.add(name));
        }
    }

    const stylesheets = [
        ...globSync('packages/components/**/*.scss', { cwd: REPO_ROOT, absolute: true }),
        ...globSync('node_modules/@koobiq/design-tokens/web/**/*.css', { cwd: REPO_ROOT, absolute: true })
    ];

    for (const path of stylesheets)
        parseTokenNames(readFileSync(path, 'utf-8')).forEach((name) => facts.tokens.add(name));

    const sources = [
        ...globSync('packages/components/**/*.ts', {
            cwd: REPO_ROOT,
            absolute: true,
            ignore: ['**/*.spec.ts', '**/e2e.ts', '**/*.playwright-spec.ts']
        }),
        ...globSync('node_modules/@koobiq/ag-grid-angular-theme/**/*.d.ts', { cwd: REPO_ROOT, absolute: true })
    ];

    for (const path of sources) {
        for (const [name] of readFileSync(path, 'utf-8').matchAll(/\bkbq[A-Z][A-Za-z0-9]*\b/g)) {
            facts.sourceNames.add(name);
        }
    }

    return facts;
};

/**
 * Hash of what a reference can go stale against: the exported names, the selectors and the names of the inputs and
 * outputs. A changed type or a new JSDoc leaves it as is, so the gate asks for a review only when the shape changes.
 */
const hashApiSurface = (report: string): string => {
    const api = parseApiReport(report);
    const surface = {
        exports: exportedNames(api).sort(),
        directives: api.directives
            .map(({ className, selector, exportAs, inputs, outputs }) => ({
                className,
                selector,
                exportAs,
                inputs: inputs.map(({ name }) => name).sort(),
                outputs: outputs.map(({ name }) => name).sort()
            }))
            .sort((a, b) => a.className.localeCompare(b.className)),
        deprecated: [
            ...api.directives.filter(({ deprecated }) => deprecated).map(({ className }) => className),
            ...[...api.enums, ...api.functions, ...api.constants, ...api.services, ...api.classes]
                .filter(({ deprecated }) => deprecated)
                .map(({ name }) => name)
        ].sort()
    };

    return createHash('sha256').update(JSON.stringify(surface)).digest('hex').slice(0, 16);
};

/**
 * Hashes of the API reports each hand-written reference relies on, keyed by the reference. A reference declares the
 * documented items it covers on its first line: `<!-- covers: select, autocomplete -->`.
 */
const computeReviewHashes = (problems: Problem[]): ReviewHashes => {
    const apiReports = new Map(collectSkillItems().map(({ item, apiReport }) => [item.id as string, apiReport]));
    const hashes: ReviewHashes = {};

    for (const path of listFiles(SKILL_SOURCE_DIR).filter((file) => file.endsWith('.md'))) {
        const file = relative(SKILL_SOURCE_DIR, path);
        const covers = readFileSync(path, 'utf-8').match(COVERS_COMMENT)?.[1];

        if (covers === undefined) {
            if (file !== 'SKILL.md') {
                problems.push({ file: relativePath(path), message: 'has no "<!-- covers: ... -->" first line' });
            }

            continue;
        }

        hashes[file] = {};

        for (const id of covers
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)) {
            const apiReport = apiReports.get(id);

            if (!apiReport) {
                problems.push({ file: relativePath(path), message: `covers "${id}", which has no API report` });
                continue;
            }

            hashes[file][id] = hashApiSurface(readFileSync(join(REPO_ROOT, apiReport), 'utf-8'));
        }
    }

    return hashes;
};

const compareReviewHashes = (current: ReviewHashes, approved: ReviewHashes): Problem[] =>
    Object.entries(current).flatMap(([file, ids]) =>
        Object.entries(ids)
            .filter(([id, value]) => approved[file]?.[id] !== value)
            .map(([id]) => ({
                file: relativePath(join(SKILL_SOURCE_DIR, file)),
                message: approved[file]?.[id]
                    ? `the API of "${id}" changed since this reference was last reviewed: re-read the reference against it, fix what is stale, then run "yarn run approve-agent-skills"`
                    : `"${id}" has not been reviewed yet: run "yarn run approve-agent-skills" once the reference is correct`
            }))
    );

/** Checks the generated package output: the skill as it ships and the references it points to. */
const checkOutput = (): Problem[] => {
    if (!existsSync(join(SKILL_DIST_DIR, 'SKILL.md'))) {
        return [{ file: relativePath(SKILL_DIST_DIR), message: 'is missing: run "yarn run build:agent-skills" first' }];
    }

    const problems: Problem[] = [];
    const skillFile = join(SKILL_DIST_DIR, 'SKILL.md');
    const skill = readFileSync(skillFile, 'utf-8');

    problems.push(...checkSkillFile(relativePath(skillFile), skill, SKILL_NAME));

    for (const path of listFiles(SKILL_DIST_DIR)) {
        const file = relative(SKILL_DIST_DIR, path);
        const depth = file.split('/').length;

        // One level of references below SKILL.md, as the specification recommends.
        if (depth > 2 || (depth === 2 && !file.startsWith('references/'))) {
            problems.push({ file: relativePath(path), message: 'references have to sit directly in references/' });
        }

        problems.push(
            ...checkLinks(relativePath(path), readFileSync(path, 'utf-8'), (target) =>
                existsSync(join(dirname(path), target))
            )
        );
    }

    for (const { docPath } of collectSkillItems()) {
        const path = join(AGENT_DOCS_DIST_DIR, docPath);

        if (!existsSync(path)) {
            problems.push({ file: relativePath(path), message: 'was not generated' });
        } else if (/<Example\s+id=/.test(readFileSync(path, 'utf-8'))) {
            problems.push({
                file: relativePath(path),
                message: 'still has an <Example> tag instead of the example code'
            });
        }
    }

    // The hand-written text sends agents to generated references by path; each of them has to exist.
    for (const path of listFiles(SKILL_SOURCE_DIR).filter((file) => file.endsWith('.md'))) {
        const text = readFileSync(path, 'utf-8');

        for (const match of text.matchAll(/agent-docs\/((?:[a-z0-9-]+\/)?[a-zA-Z0-9-]+\.md)/g)) {
            if (!existsSync(join(AGENT_DOCS_DIST_DIR, match[1]))) {
                problems.push({
                    file: `${relativePath(path)}:${text.slice(0, match.index).split('\n').length}`,
                    message: `points to agent-docs/${match[1]}, which is not generated`
                });
            }
        }
    }

    return problems;
};

export const checkAgentSkills = (approve: boolean): Problem[] => {
    const problems: Problem[] = [];
    const facts = collectFacts();

    for (const path of listFiles(SKILL_SOURCE_DIR).filter((file) => file.endsWith('.md'))) {
        problems.push(...checkFacts(relativePath(path), readFileSync(path, 'utf-8'), facts));
    }

    const current = computeReviewHashes(problems);

    if (approve) {
        writeFileSync(REVIEW_HASHES_PATH, `${JSON.stringify(current, null, 4)}\n`);
        console.info(`✅ ${relativePath(REVIEW_HASHES_PATH)} updated`);
    } else {
        const approved: ReviewHashes = existsSync(REVIEW_HASHES_PATH)
            ? JSON.parse(readFileSync(REVIEW_HASHES_PATH, 'utf-8'))
            : {};

        problems.push(...compareReviewHashes(current, approved));
    }

    problems.push(...checkOutput());

    return problems;
};

if (require.main === module) {
    const approve = process.argv.includes('--approve');
    const problems = checkAgentSkills(approve);

    if (problems.length > 0) {
        console.error(`❌ The ${SKILL_NAME} skill has ${problems.length} problem(s):`);
        problems.forEach(({ file, message }) => console.error(`  ${file}: ${message}`));
        process.exitCode = 1;
    } else {
        console.info(`✅ The ${SKILL_NAME} skill matches the sources`);
    }
}
