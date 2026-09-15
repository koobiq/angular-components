import { deprecatedPathMigration } from '../../utils/deprecated-path-migration';

/**
 * `@koobiq/components/splitter` now resolves to the rewritten splitter — the `flex-basis` based
 * component it used to export (`KbqSplitterComponent`, `KbqSplitterAreaDirective`,
 * `KbqGutterDirective`, `KbqGutterGhostDirective`, `KbqSplitterModule`, `Direction`) moved to
 * `@koobiq/components/splitter/deprecated`. This rewrites the import specifier only; the API itself
 * is unchanged at its new path.
 */
export default deprecatedPathMigration('splitter');
