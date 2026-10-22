/**
 * Data for the `dl-standalone-names` migration.
 *
 * The description list review renamed its standalone components to the names the newer components use
 * and stopped documenting the NgModule:
 *
 * - `KbqDlComponent`, `KbqDtComponent` and `KbqDdComponent` are `KbqDl`, `KbqDt` and `KbqDd`; the old
 *   names stay as deprecated aliases of the same classes until 22.0.0
 * - `KbqDlModule` still works, but the documentation imports the three components directly
 *
 * Rewrites what is imported from `@koobiq/components/dl`, and `KbqDlModule` where it is an element of an
 * array - `imports`, `exports`, a `TestBed` configuration - since an array takes the three components
 * just as well. Anywhere else the module is kept and reported.
 */

/** The entry point the migration rewrites the imports of. */
export const DL_PACKAGE = '@koobiq/components/dl';

/** Each renamed class: its old name, a deprecated alias until 22.0.0, and its new one. */
export const RENAMES: Readonly<Record<string, string>> = {
    KbqDlComponent: 'KbqDl',
    KbqDtComponent: 'KbqDt',
    KbqDdComponent: 'KbqDd'
};

/** The NgModule that re-exports the three components. */
export const DL_MODULE = 'KbqDlModule';

/** What `KbqDlModule` re-exports, in the order an array lists them in its place. */
export const MODULE_COMPONENTS: readonly string[] = ['KbqDl', 'KbqDt', 'KbqDd'];

/** A `KbqDlModule` the migration leaves alone, because only an array element can take the three components. */
export const keptModuleMessage = (line: number): string =>
    `Line ${line}: KbqDlModule is kept - it is not an element of an array, so it cannot be replaced by ` +
    'KbqDl, KbqDt and KbqDd in place. It still works, but is no longer documented: import the three ' +
    'components where they are used.';

export const SUMMARY: readonly string[] = [
    '  KbqDlComponent, KbqDtComponent and KbqDdComponent were renamed to KbqDl, KbqDt and KbqDd. The old names are',
    '  deprecated aliases of the same classes and will be removed in 22.0.0.',
    '  KbqDlModule is no longer documented: where it is an element of an array, it is replaced by KbqDl, KbqDt and KbqDd.'
];
