/**
 * Checks the Agent Skills in `packages/skills`: every skill meets the Agent Skills specification, its `SKILL.md` is
 * short enough to load whole, and every link of it leads to a file of the skill or to a file the documentation site
 * serves for agents, which the skills read instead of keeping a copy. Needs the manifest `yarn run docs:api-gen` writes.
 */
import { DOCS_SITE_ORIGIN, KOOBIQ_SITE_ORIGIN } from '../docs-site-origin';
import { generateLlms } from '../llms/generate';
import { findSkillProblems } from './skill-problems';
import { readSkills, SKILLS_GLOB } from './skills';

const checkSkills = async (): Promise<void> => {
    // The skills link koobiq.io: their links are checked against the files built for the same site.
    if (DOCS_SITE_ORIGIN !== KOOBIQ_SITE_ORIGIN) {
        throw new Error(
            `the skills link ${KOOBIQ_SITE_ORIGIN}: run without KOOBIQ_DOCS_ORIGIN, now ${DOCS_SITE_ORIGIN}`
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
