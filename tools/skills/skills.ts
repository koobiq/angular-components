import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { posix } from 'path';
import type { Skill } from './skill-problems';

/** Every skill is a directory with a `SKILL.md`, grouped by the library it serves: `angular/koobiq-angular`. */
export const SKILLS_GLOB = 'packages/skills/*/*/SKILL.md';

/** The skills of `packages/skills` with their files. */
export const readSkills = (): Skill[] =>
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
