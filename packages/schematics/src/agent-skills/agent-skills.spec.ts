import { logging } from '@angular-devkit/core';
import { callRule, Rule, SchematicContext } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';
import {
    AGENT_RULES_END,
    AGENT_RULES_START,
    INSTALL_MANIFEST,
    installAgentSkill,
    InstallAgentSkillOptions,
    PackagedSkill,
    readPackagedSkill,
    refreshAgentSkill
} from '../utils/agent-skills';
import { createTestApp } from '../utils/testing';

const skill = (version: string, files: Record<string, string>): PackagedSkill => ({
    version,
    files: Object.entries(files).map(([path, content]) => ({ path, content }))
});

const V1 = skill('21.0.0', {
    'SKILL.md': '---\nname: koobiq-angular\n---\n\n# Koobiq 21.0.0\n',
    'references/forms.md': 'forms v1\n',
    'references/old.md': 'removed in v2\n'
});

const V2 = skill('21.1.0', {
    'SKILL.md': '---\nname: koobiq-angular\n---\n\n# Koobiq 21.1.0\n',
    'references/forms.md': 'forms v2\n'
});

const read = (tree: UnitTestTree, path: string): string => tree.readText(path);

describe('agent-skills', () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;
    let warnings: string[];

    // `SchematicTestRunner.callRule` hands the rule a context whose logger drops everything; the rules only need one
    // that records what they report.
    const run = async (rule: Rule, tree: UnitTestTree): Promise<UnitTestTree> => {
        const logger = new logging.Logger('agent-skills');

        logger.subscribe(({ level, message }) => level === 'warn' && warnings.push(message));

        return (await lastValueFrom(callRule(rule, tree, { logger } as unknown as SchematicContext))) as UnitTestTree;
    };

    const install = (options: Partial<InstallAgentSkillOptions>, packaged = V1, tree = appTree) =>
        run(
            installAgentSkill({ agents: ['claude-code'], instructions: true, force: false, ...options }, packaged),
            tree
        );

    const refresh = (packaged: PackagedSkill, tree: UnitTestTree) => run(refreshAgentSkill(packaged), tree);

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', join(__dirname, '../collection.json'));
        appTree = await createTestApp(runner);
        warnings = [];
        runner.logger.subscribe(({ level, message }) => level === 'warn' && warnings.push(message));
    });

    it('should copy the skill into .claude/skills for Claude Code and record what it installed', async () => {
        const tree = await install({ agents: ['claude-code'] });

        expect(read(tree, '/.claude/skills/koobiq-angular/SKILL.md')).toBe(V1.files[0].content);
        expect(read(tree, '/.claude/skills/koobiq-angular/references/forms.md')).toBe('forms v1\n');
        expect(JSON.parse(read(tree, `/.claude/skills/koobiq-angular/${INSTALL_MANIFEST}`))).toEqual({
            version: '21.0.0',
            files: expect.objectContaining({
                'SKILL.md': expect.any(String),
                'references/forms.md': expect.any(String)
            })
        });
        expect(tree.exists('/.agents/skills/koobiq-angular/SKILL.md')).toBe(false);
    });

    it('should write one shared .agents/skills copy for the agents that read that folder', async () => {
        const tree = await install({ agents: ['codex', 'cursor', 'copilot'] });

        expect(tree.exists('/.agents/skills/koobiq-angular/SKILL.md')).toBe(true);
        expect(tree.exists('/.claude/skills/koobiq-angular/SKILL.md')).toBe(false);
    });

    it('should create AGENTS.md with the managed block when the workspace has none', async () => {
        const tree = await install({});
        const agentsMd = read(tree, '/AGENTS.md');

        expect(agentsMd.startsWith(AGENT_RULES_START)).toBe(true);
        expect(agentsMd.trimEnd().endsWith(AGENT_RULES_END)).toBe(true);
        expect(agentsMd).toContain('@koobiq/components 21.0.0');
        expect(agentsMd).toContain('koobiq-angular');
    });

    it('should append the block to an existing AGENTS.md and later replace only the text between the markers', async () => {
        appTree.create('/AGENTS.md', '# Team rules\n\nUse pnpm.\n');

        const installed = await install({});
        const updated = await install({}, V2, installed);
        const agentsMd = read(updated, '/AGENTS.md');

        expect(agentsMd.startsWith('# Team rules\n\nUse pnpm.\n\n')).toBe(true);
        expect(agentsMd).toContain('@koobiq/components 21.1.0');
        expect(agentsMd).not.toContain('@koobiq/components 21.0.0');
        expect(agentsMd.split(AGENT_RULES_START)).toHaveLength(2);
    });

    it('should leave a block with a missing end marker alone and say so', async () => {
        appTree.create('/AGENTS.md', `# Team rules\n\n${AGENT_RULES_START}\nedited by hand\n`);

        const tree = await install({});

        expect(read(tree, '/AGENTS.md')).toBe(`# Team rules\n\n${AGENT_RULES_START}\nedited by hand\n`);
        expect(warnings.join('\n')).toContain('missing or misplaced marker');
    });

    it('should not write any rules when instructions are off', async () => {
        const tree = await install({ instructions: false });

        expect(tree.exists('/AGENTS.md')).toBe(false);
        expect(tree.exists('/.claude/skills/koobiq-angular/SKILL.md')).toBe(true);
    });

    it('should add the block to a CLAUDE.md that does not import AGENTS.md', async () => {
        appTree.create('/CLAUDE.md', '# Project\n');

        const tree = await install({ agents: ['claude-code'] });

        expect(read(tree, '/CLAUDE.md')).toContain(AGENT_RULES_START);
    });

    it('should leave a CLAUDE.md that imports AGENTS.md untouched', async () => {
        appTree.create('/CLAUDE.md', '@AGENTS.md\n');

        const tree = await install({ agents: ['claude-code'] });

        expect(read(tree, '/CLAUDE.md')).toBe('@AGENTS.md\n');
        expect(read(tree, '/AGENTS.md')).toContain(AGENT_RULES_START);
    });

    it('should not touch CLAUDE.md when Claude Code is not selected', async () => {
        appTree.create('/CLAUDE.md', '# Project\n');

        const tree = await install({ agents: ['codex'] });

        expect(read(tree, '/CLAUDE.md')).toBe('# Project\n');
    });

    it('should change nothing when run twice with the same version', async () => {
        // Binary files such as favicon.ico are compared too, so as bytes rather than text.
        const contents = (tree: UnitTestTree) => tree.files.map((path) => [path, tree.read(path)?.toString('base64')]);
        const first = await install({});
        const snapshot = contents(first);
        const second = await install({}, V1, first);

        expect(contents(second)).toEqual(snapshot);
    });

    it('should update untouched files, delete dropped ones and keep the files the user changed', async () => {
        const installed = await install({});

        installed.overwrite('/.claude/skills/koobiq-angular/references/forms.md', 'forms v1 with our notes\n');

        const updated = await install({}, V2, installed);

        expect(read(updated, '/.claude/skills/koobiq-angular/SKILL.md')).toBe(V2.files[0].content);
        expect(read(updated, '/.claude/skills/koobiq-angular/references/forms.md')).toBe('forms v1 with our notes\n');
        expect(updated.exists('/.claude/skills/koobiq-angular/references/old.md')).toBe(false);
        expect(warnings.join('\n')).toContain('/.claude/skills/koobiq-angular/references/forms.md');

        // Still recognized as changed by the user on the next run.
        const again = await install({}, V2, updated);

        expect(read(again, '/.claude/skills/koobiq-angular/references/forms.md')).toBe('forms v1 with our notes\n');
    });

    it('should replace the files the user changed with --force', async () => {
        const installed = await install({});

        installed.overwrite('/.claude/skills/koobiq-angular/references/forms.md', 'forms v1 with our notes\n');

        const updated = await install({ force: true }, V2, installed);

        expect(read(updated, '/.claude/skills/koobiq-angular/references/forms.md')).toBe('forms v2\n');
    });

    it('should keep a file of the same name that it did not install', async () => {
        appTree.create('/.claude/skills/koobiq-angular/SKILL.md', 'written by the team\n');

        const tree = await install({});

        expect(read(tree, '/.claude/skills/koobiq-angular/SKILL.md')).toBe('written by the team\n');
        expect(warnings.join('\n')).toContain('Kept your changes');
    });

    describe('refresh', () => {
        it('should update every installed copy and the managed block', async () => {
            const installed = await install({ agents: ['claude-code', 'codex'] });
            const refreshed = await refresh(V2, installed);

            expect(read(refreshed, '/.claude/skills/koobiq-angular/SKILL.md')).toBe(V2.files[0].content);
            expect(read(refreshed, '/.agents/skills/koobiq-angular/SKILL.md')).toBe(V2.files[0].content);
            expect(read(refreshed, '/AGENTS.md')).toContain('@koobiq/components 21.1.0');
        });

        it('should not install anything in a workspace that never had the skill', async () => {
            const before = appTree.files.slice().sort();
            const refreshed = await refresh(V2, appTree);

            expect(refreshed.files.slice().sort()).toEqual(before);
        });
    });

    describe('schematic', () => {
        it('should do nothing without agents', async () => {
            const tree = await runner.runSchematic('agent-skills', { agents: [] }, appTree);

            expect(tree.exists('/AGENTS.md')).toBe(false);
        });

        it('should tell the user when the package was built without the skill', async () => {
            // In this suite the schematic runs from the sources, where no skill has been generated next to it.
            const tree = await runner.runSchematic('agent-skills', { agents: ['claude-code'] }, appTree);

            expect(tree.exists('/.claude/skills/koobiq-angular/SKILL.md')).toBe(false);
            expect(warnings.join('\n')).toContain('does not ship the koobiq-angular skill');
        });
    });

    describe('readPackagedSkill', () => {
        let packageRoot: string;

        beforeEach(() => {
            packageRoot = mkdtempSync(join(tmpdir(), 'kbq-agent-skills-'));
            writeFileSync(join(packageRoot, 'package.json'), JSON.stringify({ version: '21.0.0' }));
        });

        afterEach(() => rmSync(packageRoot, { recursive: true, force: true }));

        it('should read the skill and the version of the package', () => {
            mkdirSync(join(packageRoot, 'skills/koobiq-angular/references'), { recursive: true });
            writeFileSync(join(packageRoot, 'skills/koobiq-angular/SKILL.md'), '# Koobiq\n');
            writeFileSync(join(packageRoot, 'skills/koobiq-angular/references/forms.md'), 'forms\n');

            expect(readPackagedSkill(packageRoot)).toEqual({
                version: '21.0.0',
                files: expect.arrayContaining([
                    { path: 'SKILL.md', content: '# Koobiq\n' },
                    { path: 'references/forms.md', content: 'forms\n' }
                ])
            });
        });

        it('should return null for a package built without the skill', () => {
            expect(readPackagedSkill(packageRoot)).toBeNull();
        });
    });
});
