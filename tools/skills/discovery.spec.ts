import { createHash } from 'crypto';
import { renderAgentSkills } from './discovery';
import type { Skill } from './skill-problems';

const skillMd = (name: string, description: string): string =>
    ['---', `name: ${name}`, `description: ${description}`, '---', '', `# ${name}`, ''].join('\n');

const skill = (name: string, description: string): Skill => ({
    name,
    files: new Map([['SKILL.md', skillMd(name, description)]])
});

describe(renderAgentSkills.name, () => {
    it('serves every SKILL.md next to an index that links it by path and pins its bytes', () => {
        const files = renderAgentSkills([skill('koobiq-angular', 'Builds UI with Koobiq.')]);
        const text = skillMd('koobiq-angular', 'Builds UI with Koobiq.');

        expect([...files.keys()]).toEqual(['koobiq-angular/SKILL.md', 'index.json']);
        expect(files.get('koobiq-angular/SKILL.md')).toBe(text);
        expect(JSON.parse(files.get('index.json')!)).toEqual({
            $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
            skills: [
                {
                    name: 'koobiq-angular',
                    type: 'skill-md',
                    description: 'Builds UI with Koobiq.',
                    url: '/.well-known/agent-skills/koobiq-angular/SKILL.md',
                    digest: `sha256:${createHash('sha256').update(text).digest('hex')}`
                }
            ]
        });
    });

    it('refuses a skill of more files than SKILL.md, which the index would have to list as an archive', () => {
        const withReference: Skill = {
            name: 'koobiq-angular',
            files: new Map([
                ['SKILL.md', skillMd('koobiq-angular', 'Builds UI with Koobiq.')],
                ['references/select.md', '# Select']
            ])
        };

        expect(() => renderAgentSkills([withReference])).toThrow(/SKILL\.md alone/);
    });

    it('refuses two skills of one name, which the index cannot tell apart', () => {
        expect(() => renderAgentSkills([skill('koobiq', 'One.'), skill('koobiq', 'Two.')])).toThrow(/two skills/);
    });
});
