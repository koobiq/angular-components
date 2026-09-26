import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readPackagedSkill, refreshAgentSkill } from '../../utils/agent-skills';

/**
 * Brings the koobiq-angular skill that `ng generate @koobiq/components:agent-skills` (or `ng add`) installed up to
 * the new version, together with the managed rules in AGENTS.md / CLAUDE.md. Files the user changed are kept.
 * A workspace that never installed the skill is left alone.
 */
export default function agentSkillsRefresh(): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        const skill = readPackagedSkill();

        return skill ? refreshAgentSkill(skill) : undefined;
    };
}
