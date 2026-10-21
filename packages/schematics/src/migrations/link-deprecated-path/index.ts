import { deprecatedPathMigration } from '../../utils/deprecated-path-migration';

/**
 * `@koobiq/components/link` now resolves to the `KbqLink` component, which renders the text, the slots
 * and the external icon itself - the directive it used to export (`KbqLink`, `KbqLinkModule`) moved to
 * `@koobiq/components/link/deprecated`. This rewrites the import specifier only; the API itself is
 * unchanged at its new path.
 */
export default deprecatedPathMigration('link');
