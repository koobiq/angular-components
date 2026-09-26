import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { logMessage } from './messages';

export const AGENT_SKILL_NAME = 'koobiq-angular';

/**
 * Where each coding agent reads project skills. Claude Code reads only its own folder; Codex, Copilot, Cursor,
 * Gemini CLI, OpenCode, Windsurf and Junie share `.agents/skills`.
 */
export const AGENT_SKILL_DIRECTORIES = {
    'claude-code': '.claude/skills',
    codex: '.agents/skills',
    copilot: '.agents/skills',
    cursor: '.agents/skills',
    gemini: '.agents/skills',
    other: '.agents/skills'
} as const;

export type AgentSkillTarget = keyof typeof AGENT_SKILL_DIRECTORIES;

export const isAgentSkillTarget = (value: string): value is AgentSkillTarget =>
    Object.prototype.hasOwnProperty.call(AGENT_SKILL_DIRECTORIES, value);

/** Written next to the installed skill: tells the files a later run may replace from the ones the user edited. */
export const INSTALL_MANIFEST = '.koobiq-skill.json';

export const AGENT_RULES_START = '<!-- koobiq:agent-rules:start -->';
export const AGENT_RULES_END = '<!-- koobiq:agent-rules:end -->';

export interface SkillFile {
    /** Path inside the skill folder, with forward slashes, e.g. `references/forms.md`. */
    path: string;
    content: string;
}

/** The skill as the installed `@koobiq/components` ships it. */
export interface PackagedSkill {
    version: string;
    files: SkillFile[];
}

interface InstallManifest {
    version: string;
    files: Record<string, string>;
}

export interface InstallAgentSkillOptions {
    agents: AgentSkillTarget[];
    /** Adds the managed block of rules to `AGENTS.md`, which agents load on every request. */
    instructions: boolean;
    /** Replaces skill files even when the user changed them. */
    force: boolean;
}

const hash = (content: string): string => createHash('sha256').update(content).digest('hex');

const listFiles = (directory: string): string[] =>
    readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);

        return statSync(path).isDirectory() ? listFiles(path) : [path];
    });

/**
 * Reads the skill shipped in the package this schematic belongs to (`<package>/skills/koobiq-angular`), so the
 * installed skill always matches the installed version. `null` when the package was built without it.
 */
export function readPackagedSkill(packageRoot = join(__dirname, '..', '..')): PackagedSkill | null {
    const skillRoot = join(packageRoot, 'skills', AGENT_SKILL_NAME);

    if (!existsSync(join(skillRoot, 'SKILL.md'))) return null;

    const { version } = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf-8'));

    return {
        version,
        files: listFiles(skillRoot).map((file) => ({
            path: relative(skillRoot, file).split('\\').join('/'),
            content: readFileSync(file, 'utf-8')
        }))
    };
}

/** The block of always-loaded rules that points agents to the skill, for `AGENTS.md` and `CLAUDE.md`. */
export function renderAgentRules(version: string): string {
    return [
        AGENT_RULES_START,
        '<!-- Managed by @koobiq/components: `ng generate @koobiq/components:agent-skills` and `ng update` replace the text between these markers. -->',
        '',
        `## Koobiq UI (@koobiq/components ${version})`,
        '',
        `- Before writing or changing UI, use the \`${AGENT_SKILL_NAME}\` skill. An agent without skill support reads \`node_modules/@koobiq/components/skills/${AGENT_SKILL_NAME}/SKILL.md\`.`,
        '- Import only from secondary entry points (`@koobiq/components/<name>`); the root entry point exports nothing.',
        '- Change the look with `--kbq-*` design tokens instead of overriding component CSS properties or hard-coding colors and sizes.',
        '- References for the installed version: `node_modules/@koobiq/components/agent-docs/`.',
        '- Build after changes. Upgrade with `ng update @koobiq/components` instead of rewriting deprecated APIs by hand.',
        AGENT_RULES_END
    ].join('\n');
}

/** Whether an instructions file already pulls `AGENTS.md` in, as Claude Code's `@AGENTS.md` import does. */
const importsAgentsMd = (text: string): boolean => /^@(?:\.\/)?AGENTS\.md\s*$/m.test(text);

type UpsertResult = 'created' | 'updated' | 'broken' | null;

/**
 * Writes the managed block into `path`: replaces the text between the markers, or appends the block. Text outside
 * the markers is never touched. Returns what it did, for the summary.
 */
function upsertAgentRules(tree: Tree, path: string, version: string, create: boolean): UpsertResult {
    const block = renderAgentRules(version);

    if (!tree.exists(path)) {
        if (!create) return null;

        tree.create(path, `${block}\n`);

        return 'created';
    }

    const text = tree.readText(path);
    const start = text.indexOf(AGENT_RULES_START);
    const end = text.indexOf(AGENT_RULES_END);

    if (start === -1 && end === -1) {
        tree.overwrite(path, `${text.trimEnd()}\n\n${block}\n`);

        return 'updated';
    }

    // A single marker, or markers in the wrong order: the user edited the block, and guessing its bounds could
    // delete their text.
    if (start === -1 || end < start) return 'broken';

    const next = `${text.slice(0, start)}${block}${text.slice(end + AGENT_RULES_END.length)}`;

    if (next === text) return null;

    tree.overwrite(path, next);

    return 'updated';
}

interface SkillWriteResult {
    kept: string[];
}

/** Copies the skill into `directory`, keeping every file the user changed since the previous install. */
function writeSkill(tree: Tree, directory: string, skill: PackagedSkill, force: boolean): SkillWriteResult {
    const manifestPath = `${directory}/${INSTALL_MANIFEST}`;
    const previous: InstallManifest | null = tree.exists(manifestPath)
        ? (JSON.parse(tree.readText(manifestPath)) as InstallManifest)
        : null;
    const installed: Record<string, string> = {};
    const result: SkillWriteResult = { kept: [] };
    const isUntouched = (path: string, relativePath: string): boolean =>
        previous?.files[relativePath] === hash(tree.readText(path));

    for (const file of skill.files) {
        const path = `${directory}/${file.path}`;

        if (!tree.exists(path)) {
            tree.create(path, file.content);
        } else if (tree.readText(path) !== file.content) {
            if (!force && !isUntouched(path, file.path)) {
                result.kept.push(path);

                // Keep the hash of what was installed, so the next run still sees the file as changed by the user.
                if (previous?.files[file.path]) installed[file.path] = previous.files[file.path];

                continue;
            }

            tree.overwrite(path, file.content);
        }

        installed[file.path] = hash(file.content);
    }

    // Files a previous version shipped and this one does not.
    for (const relativePath of Object.keys(previous?.files ?? {})) {
        const path = `${directory}/${relativePath}`;

        if (relativePath in installed || !tree.exists(path)) continue;

        if (force || isUntouched(path, relativePath)) {
            tree.delete(path);
        } else {
            result.kept.push(path);
        }
    }

    const manifest = `${JSON.stringify({ version: skill.version, files: installed }, null, 4)}\n`;

    if (!tree.exists(manifestPath)) {
        tree.create(manifestPath, manifest);
    } else if (tree.readText(manifestPath) !== manifest) {
        tree.overwrite(manifestPath, manifest);
    }

    return result;
}

function reportKept(context: SchematicContext, kept: string[], version: string): void {
    if (kept.length === 0) return;

    logMessage(context.logger, [
        `Kept your changes in these files of the ${AGENT_SKILL_NAME} skill:`,
        ...kept.map((path) => `  ${path}`),
        `They were not updated to @koobiq/components ${version}. Merge the new version by hand, or run`,
        '`ng generate @koobiq/components:agent-skills --force` to replace them.'
    ]);
}

function reportBrokenRules(context: SchematicContext, files: string[]): void {
    if (files.length === 0) return;

    logMessage(context.logger, [
        `The Koobiq rules in ${files.join(', ')} have a missing or misplaced marker, so they were left as they are.`,
        `Restore both ${AGENT_RULES_START} and ${AGENT_RULES_END}, or delete the block,`,
        'and run `ng generate @koobiq/components:agent-skills` again.'
    ]);
}

/** Installs the skill for the selected agents and, optionally, the rules that point agents to it. */
export function installAgentSkill(options: InstallAgentSkillOptions, skill: PackagedSkill): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const directories = [...new Set(options.agents.map((agent) => AGENT_SKILL_DIRECTORIES[agent]))];
        const kept: string[] = [];

        for (const directory of directories) {
            kept.push(...writeSkill(tree, `/${directory}/${AGENT_SKILL_NAME}`, skill, options.force).kept);
        }

        const rulesFiles: string[] = [];
        const brokenRules: string[] = [];
        const applyRules = (path: string, create: boolean) => {
            const result = upsertAgentRules(tree, path, skill.version, create);

            if (result === 'broken') brokenRules.push(path.slice(1));
            else if (result) rulesFiles.push(path.slice(1));
        };

        if (options.instructions && directories.length > 0) {
            applyRules('/AGENTS.md', true);

            // Claude Code reads AGENTS.md only when there is no CLAUDE.md, and an existing CLAUDE.md that does not
            // import AGENTS.md would hide the rules from it.
            if (options.agents.includes('claude-code')) {
                for (const path of ['/CLAUDE.md', '/.claude/CLAUDE.md']) {
                    if (tree.exists(path) && !importsAgentsMd(tree.readText(path))) applyRules(path, false);
                }
            }
        }

        context.logger.info(
            [
                `The ${AGENT_SKILL_NAME} skill of @koobiq/components ${skill.version} is set up in ${directories.map((directory) => `${directory}/${AGENT_SKILL_NAME}`).join(', ')}.`,
                ...(rulesFiles.length ? [`Rules that point agents to it: ${rulesFiles.join(', ')}.`] : [])
            ].join('\n')
        );
        reportKept(context, kept, skill.version);
        reportBrokenRules(context, brokenRules);
    };
}

/**
 * Brings an installed skill and the managed rules up to the installed version, wherever an earlier run of the
 * schematic put them. Does nothing in a workspace that never installed the skill.
 */
export function refreshAgentSkill(skill: PackagedSkill): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const directories = [...new Set(Object.values(AGENT_SKILL_DIRECTORIES))]
            .map((directory) => `/${directory}/${AGENT_SKILL_NAME}`)
            .filter((directory) => tree.exists(`${directory}/${INSTALL_MANIFEST}`));
        const kept = directories.flatMap((directory) => writeSkill(tree, directory, skill, false).kept);
        const brokenRules = ['/AGENTS.md', '/CLAUDE.md', '/.claude/CLAUDE.md']
            .filter((path) => tree.exists(path) && tree.readText(path).includes(AGENT_RULES_START))
            .filter((path) => upsertAgentRules(tree, path, skill.version, false) === 'broken')
            .map((path) => path.slice(1));

        reportKept(context, kept, skill.version);
        reportBrokenRules(context, brokenRules);
    };
}
