import { AgentSkillTarget } from '../utils/agent-skills';

export interface Schema {
    /** Coding agents to set the skill up for. */
    agents?: AgentSkillTarget[];

    /** Whether to add the managed block of rules to `AGENTS.md`. Defaults to true. */
    instructions?: boolean;

    /** Whether to replace skill files the user changed. Defaults to false. */
    force?: boolean;
}
