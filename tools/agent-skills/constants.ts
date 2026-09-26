import { join } from 'path';

export const REPO_ROOT = join(__dirname, '../..');

/** Name of the consumer skill: its folder, the `name` in its frontmatter and the folder consumers install. */
export const SKILL_NAME = 'koobiq-angular';

/** Hand-written part of the skill, committed. `SKILL.md` carries placeholders the generator fills. */
export const SKILL_SOURCE_DIR = join(REPO_ROOT, 'packages/agent-skills', SKILL_NAME);

/** Hashes of the API reports each hand-written reference was last reviewed against. */
export const REVIEW_HASHES_PATH = join(REPO_ROOT, 'packages/agent-skills/review-hashes.json');

/** The package the skill ships in; `build:components` has to run first, it empties this directory. */
export const PACKAGE_DIST_DIR = join(REPO_ROOT, 'dist/components');

export const SKILL_DIST_DIR = join(PACKAGE_DIST_DIR, 'skills', SKILL_NAME);

/** Generated references for the installed version, read in place from `node_modules` by consumers' agents. */
export const AGENT_DOCS_DIST_DIR = join(PACKAGE_DIST_DIR, 'agent-docs');

/** What the documentation site serves from its root: the `/.well-known/agent-skills` index and archive. */
export const SITE_BUNDLE_DIR = join(REPO_ROOT, 'dist/agent-skills-site');

/** Where consumers find the generated references, relative to their workspace root. */
export const AGENT_DOCS_CONSUMER_PATH = 'node_modules/@koobiq/components/agent-docs';

export const API_REPORTS_DIR = join(REPO_ROOT, 'tools/public_api_guard/components');

export const DOCS_SITE_URL = 'https://koobiq.io';

/** The only frontmatter keys claude.ai and the Skills API accept; anything else is a hard error there. */
export const ALLOWED_FRONTMATTER_KEYS = [
    'name',
    'description',
    'license',
    'compatibility',
    'metadata',
    'allowed-tools'
];

/** Limits of the Agent Skills specification: https://agentskills.io/specification */
export const SKILL_LIMITS = {
    descriptionLength: 1024,
    skillLines: 500,
    /** Rough budget for the body, estimated as characters / 4. */
    skillTokens: 5000
};
