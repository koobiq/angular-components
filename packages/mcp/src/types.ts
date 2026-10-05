/** Shape of everything the tools read. Kept free of MCP types so it can be unit-tested alone. */

export type MemberKind = 'input' | 'output' | 'property' | 'method' | 'enum-item';

export type ComponentMember = {
    name: string;
    kind: MemberKind;
    signature: string;
};

export type SymbolKind = 'component' | 'directive' | 'class' | 'interface' | 'enum' | 'const' | 'function' | 'type';

export type ComponentSymbol = {
    name: string;
    kind: SymbolKind;
    selector?: string;
    exportAs?: string[];
    members: ComponentMember[];
};

export type ExampleRef = {
    id: string;
    title: string;
    primaryFile: string;
    packagePath: string;
    /** Declared by `example-module.ts`; authoritative, unlike globbing the directory. */
    files: string[];
};

export type ComponentEntry = {
    id: string;
    /**
     * `null` for a documentation group that is not an entry point of its own — `validation` and
     * `forms` are documented separately but exported from `@koobiq/components/core`, and `ag-grid`
     * is an integration guide with no exports at all. Saying `null` beats inventing an import path
     * the consumer would then write into their code.
     */
    importPath: string | null;
    /** False when no API Extractor report covers this id, so `symbols` is empty by construction. */
    apiGuarded: boolean;
    symbols: ComponentSymbol[];
    examples: ExampleRef[];
    /** English headings of the component's own documentation page. */
    sections: string[];
    /**
     * The same headings in Russian, carried for search only.
     *
     * Every one of the 143 component pages exists in both languages, and the Russian headings are
     * what a Russian query spells — «Виртуальная прокрутка», «Отображение ошибок». Without them the
     * only Russian in the whole index was icon tags, so a question about a component asked in
     * Russian matched nothing at all.
     */
    sectionsRu: string[];
    /** First paragraph of the page: one sentence saying what the component is for. */
    summary?: string;
    summaryRu?: string;
};

export type GuideSection = {
    heading: string;
    /**
     * Heading level, 2 for `##` through 4 for `####`.
     *
     * Sections are stored flat, but the depth has to survive: in the migration guide
     * `#### Running the migration` appears under three different `###` headings, each tagged with
     * a different release. Flattened without depth they are indistinguishable, and a reader
     * upgrading to 19.x is offered instructions written for 21.0.0.
     */
    depth: number;
    /** Markdown, code fences kept. JSX other than `<Example>` is stripped by the parser. */
    body: string;
    /** `<Example id="…" />` referenced from this section, resolvable through `get_example`. */
    examples: string[];
};

/**
 * One guide, at the latest release that shipped it.
 *
 * Only the current text is kept, not every revision. That was measured rather than assumed: across
 * 18.0.0–20.4.0 the Russian theming guide has nine distinct texts, but seven of them share the same
 * eleven headings and the code inside them is byte-identical from 18.4.0 to 20.3.0. The revisions
 * differ in wording, not in anything an agent can act on — so keeping them cost 888 KB to serve a
 * project on 18.x prose it would have got right anyway.
 *
 * What is kept instead is `since`, so the answer can say which release the text describes and warn
 * when the project is on a different major.
 */
export type Guide = {
    /** File stem: `theming`, `search-smart`, `validation`. */
    id: string;
    title: string;
    lang: 'en' | 'ru';
    /** Release this text was read from. */
    since: string;
    /**
     * Set when the text came from the checkout's working tree rather than a tag — it may describe
     * something that ships differently or not at all. `localization` is in this state today, and
     * the choice there is between an unreleased text and silence; silence is what sent agents to
     * llms.txt in the first place.
     */
    unreleased?: true;
    /** Text before the first heading. Usually one paragraph saying what the guide is for. */
    lede: string;
    sections: GuideSection[];
};

/** One entry of the `icons-replacement` schematic's map: the 10 → 11 renaming of `@koobiq/icons`. */
export type IconRename = {
    from: string;
    to: string;
};

/**
 * Where the index came from, recorded because the answer changes with it.
 *
 * A checkout's `package.json` names the version being *developed*, which is not the version
 * published under that number: a tree 264 commits past `20.2.0` calls itself `20.3.0` while
 * carrying members that no release contains. An index built there describes code nobody can
 * install, and says `20.3.0` while doing it.
 */
export type IndexProvenance = {
    /** `package.json` of the checkout. Only a real version when `tag` is set. */
    version: string;
    commit: string | null;
    /** The tag at HEAD. Absent means this index does not describe any release. */
    tag: string | null;
    /** Files modified in the working tree when the index was built. */
    dirtyFiles: number;
};

export type ComponentIndex = {
    generatedAt: string;
    sourceVersion: string;
    provenance?: IndexProvenance;
    components: ComponentEntry[];
    /**
     * Authored in `packages/schematics`, so it is generated from the components repository even
     * though it describes icon names. A historical fact that does not change.
     */
    iconRenames: IconRename[];
};

export type Icon = {
    name: string;
    size: number | null;
    codepoint?: string;
    description?: string;
    tags: string[];
    /** Set when the tags were inherited from a sibling of another size rather than authored. */
    tagsInherited?: boolean;
};

export type DesignToken = {
    /** CSS custom property, e.g. `--kbq-background-bg`. */
    cssName: string;
    /** Dotted path in the source, e.g. `semantic.background.bg`. */
    path: string;
    value: string;
    /** Reference chain when the value points at another token. */
    references?: string[];
    /** `v1` / `v2` where the source file carries a version suffix. */
    schemaVersion?: string;
    deprecated?: boolean;
    /**
     * What the package says to do instead, verbatim from the CSS comment.
     *
     * Worth carrying rather than reducing to a flag: 1010 of the 1862 deprecated tokens in 3.20.0
     * say "`component` token will be removed - use `global` token or raw value", one names its
     * replacement outright, and only eight are a bare `true`.
     */
    deprecationNote?: string;
};

/**
 * Every source resolves to this. A source that cannot be read reports why instead of
 * returning an empty result: a confidently wrong answer costs the caller more than no answer,
 * because an agent has no way to tell the two apart.
 */
export type SourceResult<T> =
    | { ok: true; version: string; readerMajor: number; degraded?: string; data: T }
    | { ok: false; reason: string; hint: string };
