/**
 * Publishes the Agent Skills of `packages/skills` on the documentation site with their discovery index, version 0.2.0
 * of https://github.com/cloudflare/agent-skills-discovery-rfc: `/.well-known/agent-skills/index.json` lists every skill
 * with its description and the SHA-256 of its `SKILL.md`, which lies next to it, so that `npx skills add <site>` and the
 * agents that look there find them. Writes into `dist/docs-agent-skills`, which the site serves at that path.
 */
import { createHash } from 'crypto';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { parseFrontmatter, type Skill } from './skill-problems';
import { readSkills } from './skills';

export const AGENT_SKILLS_OUTPUT_DIR = join('dist', 'docs-agent-skills');

/** Where the site serves the output, which the index links by its path alone to stay on the host it is read from. */
const AGENT_SKILLS_PATH = '/.well-known/agent-skills';

const DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

const SKILL_MD = 'SKILL.md';

interface AgentSkillsIndexEntry {
    name: string;
    type: 'skill-md';
    description: string;
    url: string;
    digest: string;
}

/** The files the site serves under `/.well-known/agent-skills`, by their path there: the index and every `SKILL.md`. */
export const renderAgentSkills = (skills: Skill[]): Map<string, string> => {
    const files = new Map<string, string>();
    const entries = skills.map(({ name, files: skillFiles }): AgentSkillsIndexEntry => {
        const skillMd = skillFiles.get(SKILL_MD);

        // The index lists a skill of more files as an archive of them, which nothing builds yet.
        if (skillMd === undefined || skillFiles.size !== 1) {
            throw new Error(`${name}: the index lists a skill of ${SKILL_MD} alone, not ${[...skillFiles.keys()]}`);
        }

        const description = parseFrontmatter(skillMd)?.fields.get('description');

        if (typeof description !== 'string') throw new Error(`${name}: no description in the frontmatter`);

        if (files.has(`${name}/${SKILL_MD}`)) throw new Error(`${name}: two skills of this name`);

        files.set(`${name}/${SKILL_MD}`, skillMd);

        return {
            name,
            type: 'skill-md',
            description,
            url: `${AGENT_SKILLS_PATH}/${name}/${SKILL_MD}`,
            digest: `sha256:${createHash('sha256').update(skillMd, 'utf-8').digest('hex')}`
        };
    });

    files.set('index.json', `${JSON.stringify({ $schema: DISCOVERY_SCHEMA, skills: entries }, null, 4)}\n`);

    return files;
};

const writeAgentSkills = (): void => {
    const files = renderAgentSkills(readSkills());

    rmSync(AGENT_SKILLS_OUTPUT_DIR, { recursive: true, force: true });

    for (const [path, content] of files) {
        mkdirSync(dirname(join(AGENT_SKILLS_OUTPUT_DIR, path)), { recursive: true });
        writeFileSync(join(AGENT_SKILLS_OUTPUT_DIR, path), content);
    }

    console.info(`✅ ${files.size - 1} skills and their index in ${AGENT_SKILLS_OUTPUT_DIR}`);
};

if (require.main === module) {
    try {
        writeAgentSkills();
    } catch (error) {
        console.error(`❌ ${error instanceof Error ? error.message : error}`);
        process.exitCode = 1;
    }
}
