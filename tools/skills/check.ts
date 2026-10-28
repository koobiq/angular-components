/**
 * Checks the Agent Skills in `packages/skills`: every skill meets the Agent Skills specification, its `SKILL.md` is
 * short enough to load whole, and every link of it leads to a file of the skill or to a file the documentation site
 * serves for agents, which the skills read instead of keeping a copy. Needs the manifest `yarn run docs:api-gen` writes.
 */
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { posix } from 'path';
import { generateLlms } from '../llms/generate';
import { KOOBIQ_SITE_ORIGIN, LLMS_SITE_ORIGIN } from '../llms/sources';
import { findSkillProblems, Skill } from './skill-problems';

/** Every skill is a directory with a `SKILL.md`, grouped by the library it serves: `angular/koobiq-angular`. */
const SKILLS_GLOB = 'packages/skills/*/*/SKILL.md';

const readSkills = (): Skill[] =>
    globSync(SKILLS_GLOB, { posix: true })
        .sort()
        .map((skillMd) => {
            const directory = posix.dirname(skillMd);

            return {
                name: posix.basename(directory),
                files: new Map(
                    globSync('**/*', { cwd: directory, nodir: true, posix: true })
                        .sort()
                        // A checkout with Windows line endings holds the same skill.
                        .map((path): [string, string] => [
                            path,
                            readFileSync(posix.join(directory, path), 'utf-8').replace(/\r\n/g, '\n')
                        ])
                )
            };
        });

const checkSkills = async (): Promise<void> => {
    // The skills link koobiq.io: their links are checked against the files built for the same site.
    if (LLMS_SITE_ORIGIN !== KOOBIQ_SITE_ORIGIN) {
        throw new Error(
            `the skills link ${KOOBIQ_SITE_ORIGIN}: run without KOOBIQ_DOCS_ORIGIN, now ${LLMS_SITE_ORIGIN}`
        );
    }

    const served = new Set((await generateLlms()).files.keys());
    const skills = readSkills();
    const errors = skills.flatMap((skill) => findSkillProblems(skill, served));

    if (!skills.length) errors.push(`no skills match ${SKILLS_GLOB}`);

    if (errors.length) {
        for (const error of errors) console.error(`❌ ${error}`);

        process.exitCode = 1;
    } else {
        console.info(`✅ ${skills.map(({ name }) => name).join(', ')}: valid, and every link leads somewhere`);
    }
};

checkSkills().catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
});
