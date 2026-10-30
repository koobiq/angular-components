/**
 * Data for the `code-block-highlight-js-core` migration.
 *
 * A configuration without `core` used to load the full highlight.js bundle, every language of it, about 1 MB. It
 * loads the core now, which has no languages but plain text: the `import('highlight.js')` the library held made
 * every application bundle the full one, configured or not, since a bundler emits a chunk for each `import()` it
 * finds. The migration keeps the full bundle where the code block loaded it, by asking for it explicitly.
 */

export const CODE_BLOCK_PACKAGE = '@koobiq/components/code-block';
export const CONFIG_PROVIDER = 'kbqCodeBlockHighlightJsConfigProvider';
export const CONFIG_TOKEN = 'KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG';
/** The property that asks for the full bundle, which a configuration without `core` loaded. */
export const FULL_BUNDLE_CORE = "core: () => import('highlight.js')";
export const FULL_BUNDLE_PROVIDER = `${CONFIG_PROVIDER}({ ${FULL_BUNDLE_CORE} })`;

export const unreadConfigMessage = (line: number): string =>
    `Line ${line}: a highlight.js configuration the migration cannot read. If it has no \`core\`, the code block ` +
    `now loads the core, which has no languages but plain text: add \`${FULL_BUNDLE_CORE}\` to keep every ` +
    'language, or list the languages of the files in `languages`.';

export const addedRootProviderMessage = (project: string, fix: boolean): string[] => [
    `Project "${project}" renders code blocks without a highlight.js configuration in its root providers. ` +
        `${fix ? 'Added' : 'Would add'} \`${FULL_BUNDLE_PROVIDER}\` to them to keep every language. To bundle the ` +
        'core and the languages of the files only, about 1 MB less, list them instead:',
    `  ${CONFIG_PROVIDER}({ languages: { typescript: () => import('highlight.js/lib/languages/typescript') } })`
];

export const rootProviderFallback = (project: string): string[] => [
    `Could not tell whether project "${project}" provides a highlight.js configuration in its root providers: its ` +
        'bootstrap cannot be analyzed statically, or its root providers are not an array literal. If it does not, ' +
        'add one by hand, or its code blocks highlight plain text only:',
    `  ${FULL_BUNDLE_PROVIDER}`
];

export const noWorkspaceMessage = (): string[] => [
    'Could not read the workspace, so the root providers of its applications were not checked. Add ' +
        `\`${FULL_BUNDLE_PROVIDER}\` to those of an application that renders code blocks without a highlight.js ` +
        'configuration there, or its code blocks highlight plain text only.'
];

export const otherConfigsMessage = (project: string): string[] => [
    `Project "${project}" also provides a highlight.js configuration outside its root providers. If one of them ` +
        'reaches every code block, through a function the root providers call, remove the added provider, which ' +
        'overrides it.'
];

export const libraryMessage = (project: string): string[] => [
    `Library "${project}" renders code blocks without a highlight.js configuration. Without one, the code block ` +
        'now loads the core, which has no languages but plain text: the applications that use the library have ' +
        `to provide \`${FULL_BUNDLE_PROVIDER}\` or the languages of its files.`
];

export const SUMMARY = [
    'The code block loads the highlight.js core when its configuration has no `core`, rather than the full bundle:',
    'register the languages of the files in `languages`, plain text needs no entry. Specs render code blocks without',
    "the application's providers: add the configuration to the TestBed of a spec that checks highlighted markup."
];
