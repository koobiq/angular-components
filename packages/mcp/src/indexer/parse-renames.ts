import type { IconRename } from '../types.js';

/**
 * Reads the icon rename map from
 * `packages/schematics/src/migrations/icons-replacement/data.ts`.
 *
 * The repository already authored this map for its `icons-replacement` schematic, so it is taken
 * from there rather than computed by diffing two published tarballs: the schematic is what the team
 * maintains, and a second derivation would be a second thing to keep in step.
 *
 * Checked against the published packages: all 86 `from` names exist in `@koobiq/icons` 10.10.3 and
 * none in 11.7.1, all 86 `to` names exist in 11.7.1 and 12.3.0 and none in 10.10.3 — a clean
 * partition, so the map describes exactly the 10 → 11 transition. Of the 87 names that disappear
 * across that boundary the map covers 86; the odd one out, `node-tree`, was not renamed but
 * normalised — it was the catalog's only sizeless key and became `node-tree_16` / `node-tree_24`.
 */

const ENTRY = /\{\s*from:\s*'([^']+)'\s*,\s*to:\s*'([^']+)'\s*\}/g;

export const parseIconRenames = (source: string): IconRename[] =>
    [...source.matchAll(ENTRY)].map(([, from, to]) => ({ from: from!, to: to! }));
