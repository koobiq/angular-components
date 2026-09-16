import { deprecatedPathMigration } from '../../utils/deprecated-path-migration';

/**
 * `@koobiq/components/scrollbar` now resolves to the new, dependency-free directive —
 * the `overlayscrollbars`-based component/directive it used to export moved to
 * `@koobiq/components/scrollbar/deprecated`. This rewrites the import specifier only;
 * the API itself (`options`/`events`/`defer`/`scrollbarInstance`, the `kbq-scrollbar`
 * element selector) is unchanged at its new path.
 */
export default deprecatedPathMigration('scrollbar');
