import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { installAgentSkill, isAgentSkillTarget, readPackagedSkill } from '../utils/agent-skills';
import { logMessage } from '../utils/messages';
import { Schema } from './schema';

/**
 * `ng generate @koobiq/components:agent-skills`: sets up the koobiq-angular skill of the installed version for the
 * selected coding agents. Running it again updates the skill and keeps the files the user changed.
 */
export default function agentSkills(options: Schema): Rule {
    return (_tree: Tree, context: SchematicContext) => {
        const agents = (options.agents ?? []).filter(isAgentSkillTarget);

        if (agents.length === 0) {
            context.logger.info(
                'No coding agent selected, nothing to set up. Pass --agents, e.g. --agents=claude-code,codex.'
            );

            return;
        }

        const skill = readPackagedSkill();

        if (!skill) {
            logMessage(context.logger, [
                'This build of @koobiq/components does not ship the koobiq-angular skill.',
                'See https://koobiq.io/en/main/ai-agents/overview for other ways to get it.'
            ]);

            return;
        }

        return installAgentSkill(
            { agents, instructions: options.instructions ?? true, force: options.force ?? false },
            skill
        );
    };
}
