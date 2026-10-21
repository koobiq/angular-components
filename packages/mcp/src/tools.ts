import { describeContext, indexSkew, type Catalog } from './catalog.js';
import { compoundParts } from './glossary.js';
import { normalize, rarity, score, terms } from './matching.js';
import { search, type HitKind } from './search.js';
import { compare } from './semver.js';
import type { ResolvedSymbol } from './sources/components.js';
import { findSection, guideCaveat, guideIds, pickGuide, sectionPath } from './sources/guides.js';
import { changesFor, migrationSections, summarise } from './sources/history.js';
import { describeRename, resolveRename } from './sources/icon-renames.js';
import { parseChoices, parseKeywords } from './sources/which-component.js';
import type { ComponentEntry } from './types.js';

/**
 * Tool bodies, as pure functions returning the text the model will read.
 *
 * Kept free of MCP types so they can be asserted on directly, and written to be terse: every
 * character here lands in a context window. Where a source could not be read the answer says so
 * and points at the documentation, because an agent cannot tell a wrong name from a right one.
 */

const DOCS = 'https://koobiq.io/en';

const PREFIX = /^@koobiq\/components\//;

const findComponent = (catalog: Catalog, id: string): ComponentEntry | undefined =>
    catalog.index.components.find((entry) => entry.id === id.replace(PREFIX, ''));

/**
 * Directory the installed package lays an entry point out under, which is not always its id.
 *
 * `scrollbar-deprecated` is documented and API-reported under that name but published as
 * `scrollbar/deprecated`. The id is what a caller passes and what search returns; the import path
 * is what the typings on disk are arranged by.
 */
const entryPointOf = (component: ComponentEntry | undefined, id: string): string =>
    component?.importPath?.replace(PREFIX, '') ?? id;

/**
 * How many bindings one origin has to contribute before its group is folded down to names.
 *
 * Five, taken from the distribution rather than chosen by feel: measured over 20.3.1 an origin
 * contributes 1, 2 or 3 bindings — an inherited `color` or `tabIndex`, the input most callers came
 * for — and then the sizes jump to 6, 7, 20, 21 and 28, which are whole other components. The
 * threshold sits in that gap. `KbqNavbarBrand` declares two inputs of its own and borrows the
 * tooltip trigger's entire surface; printed in full, for it and `KbqNavbarItem` both, those were
 * two thirds of the answer for `navbar`.
 *
 * Folded to names rather than to a count, because a count costs a round trip to act on while the
 * names are what a template writes. Types come back with `include: ["inherited"]`.
 */
const FOLD_FROM = 5;

type Binding = { alias: string; name: string; from?: string; viaHostDirective?: string };

const originOf = (entry: Binding): string | undefined => entry.viaHostDirective ?? entry.from;

/**
 * Which origins contribute enough bindings to be worth folding, and how they reach the element.
 *
 * Counted over inputs and outputs together, so an origin folds whole: the tooltip trigger reaches
 * `KbqNavbarBrand` with eleven inputs and two outputs, and folding the inputs while printing the
 * outputs in full would describe one borrowed API in two different shapes.
 *
 * The two mechanisms have to stay apart in the answer. `from` is an entry point, so it can be read
 * with `get_component`; a host directive is named by its class, which `get_component` does not
 * take — and the library moves bindings between the two, with the tooltip arriving on the navbar
 * through `extends` in 20.3.1 and as a host directive in 20.4.0.
 */
const foldedOrigins = (symbol: ResolvedSymbol): Map<string, 'entry-point' | 'host-directive'> => {
    const counted = new Map<string, { count: number; kind: 'entry-point' | 'host-directive' }>();

    for (const entry of [...symbol.inputs, ...symbol.outputs]) {
        const origin = originOf(entry);

        if (!origin) continue;

        const kind = entry.viaHostDirective ? 'host-directive' : 'entry-point';

        counted.set(origin, { count: (counted.get(origin)?.count ?? 0) + 1, kind });
    }

    return new Map(
        [...counted].filter(([, entry]) => entry.count >= FOLD_FROM).map(([origin, entry]) => [origin, entry.kind])
    );
};

/**
 * One symbol of the installed package.
 *
 * Inputs lead and are written as a template writes them. `KbqAutocompleteTrigger.connectedTo` is
 * bound as `kbqAutocompleteConnectedTo`; 230 inputs in 20.3.1 differ between the property name and
 * the attribute, and naming the property is advice that compiles to nothing.
 */
const describeLive = (
    symbol: ResolvedSymbol,
    members: string[] | undefined,
    include: Set<'methods' | 'internals' | 'inherited'>
): string[] => {
    const head = [
        `${symbol.name} — ${symbol.kind}`,
        symbol.selector ? `selector: ${symbol.selector}` : null,
        symbol.exportAs.length > 0 ? `exportAs: ${symbol.exportAs.join(', ')}` : null
    ]
        .filter(Boolean)
        .join('  ');

    const only = (name: string): boolean => !members?.length || members.includes(name);
    const lines: string[] = [];

    const origin = (entry: { from?: string; viaHostDirective?: string }): string =>
        entry.viaHostDirective
            ? `  (via ${entry.viaHostDirective})`
            : entry.from
              ? `  (inherited from ${entry.from})`
              : '';

    // A named member is always printed in full, inherited or not: the caller said which one.
    const folded =
        include.has('inherited') || members?.length
            ? new Map<string, 'entry-point' | 'host-directive'>()
            : foldedOrigins(symbol);

    const whole = (entry: Binding): boolean => {
        const from = originOf(entry);

        return from === undefined || !folded.has(from);
    };

    // What an input or output line already said, by every name it answers to — so a member sharing
    // that name further down is not printed a second time. `KbqSelect.multiple` is both the alias of
    // the signal input `multipleInput` and the name of a plain public getter kept for the
    // boolean-only reading of it; the input line already named it.
    const printed = new Set<string>();

    for (const input of symbol.inputs) {
        if ((!only(input.alias) && !only(input.name)) || !whole(input)) continue;

        printed.add(input.alias).add(input.name);

        const flags = [input.required ? 'required' : null, input.isSignal ? 'signal' : null].filter(Boolean).join(', ');

        lines.push(
            `  [input]  ${input.alias}: ${input.type ?? 'unknown'}${flags ? `  (${flags})` : ''}${origin(input)}` +
                // Worth a line when the property is a genuinely different word — `connectedTo` bound
                // as `kbqAutocompleteConnectedTo` — not when it is the alias itself plus the `Input`
                // suffix every signal input's backing field carries. `multipleInput` for `multiple`
                // says nothing the alias has not already said, once for the eye and once for a grep.
                (input.name !== input.alias && !input.name.startsWith(input.alias) ? `  — property ${input.name}` : '')
        );
    }

    for (const output of symbol.outputs) {
        if ((!only(output.alias) && !only(output.name)) || !whole(output)) continue;

        printed.add(output.alias).add(output.name);

        lines.push(`  [output] ${output.alias}: ${output.type ?? 'unknown'}${origin(output)}`);
    }

    for (const [from, kind] of folded) {
        const names = [...symbol.inputs, ...symbol.outputs]
            .filter((entry) => originOf(entry) === from)
            .map((entry) => entry.alias);

        lines.push(
            kind === 'host-directive'
                ? `  +${names.length} via host directive ${from}: ${names.join(', ')}`
                : `  +${names.length} inherited from ${from}: ${names.join(', ')}`,
            `           types via include: ["inherited"]` + (kind === 'entry-point' ? `, or get_component ${from}` : '')
        );
    }

    const methods = symbol.members.filter(
        (member) =>
            member.visibility === 'public' &&
            !member.internal &&
            !member.lifecycle &&
            member.kind === 'method' &&
            only(member.name)
    );

    // A member matching a name the caller asked for is shown even without `include`, the same
    // principle as the inherited-origin fold above: naming it is the ask. Without `include`,
    // "asked for" stops at public, undocumented-as-internal members — `internals` is still what
    // reaches compiler plumbing and private state by name.
    const namedRequest = Boolean(members?.length);

    if (include.has('methods') || namedRequest) {
        for (const member of methods) if (!printed.has(member.name)) lines.push(`  [method] ${member.signature}`);
    }

    if (include.has('internals') || namedRequest) {
        for (const member of symbol.members) {
            if (methods.includes(member) || !only(member.name) || printed.has(member.name)) continue;
            if (!include.has('internals') && (member.internal || member.visibility !== 'public')) continue;

            lines.push(`  [${member.lifecycle ? 'lifecycle' : member.kind}] ${member.signature}`);
        }
    }

    if (symbol.kind === 'enum') {
        for (const member of symbol.members) if (only(member.name)) lines.push(`  ${member.signature}`);
    }

    if (lines.length === 0) return [head];

    const hidden =
        methods.length > 0 && !include.has('methods') && !namedRequest
            ? `  (+${methods.length} methods — include: ["methods"])`
            : '';

    return [head + hidden, ...lines];
};

export const toolSearch = (catalog: Catalog, args: { query: string; kinds?: HitKind[]; limit?: number }): string => {
    const hits = search(catalog, args.query, { kinds: args.kinds, limit: args.limit });

    if (hits.length === 0) return [`No match for "${args.query}".`, `Context: ${describeContext(catalog)}`].join('\n');

    return [
        ...hits.map((hit) => `[${hit.kind}] ${hit.label} → ref "${hit.ref}"\n    ${hit.detail}`),
        '',
        `Context: ${describeContext(catalog)}`
    ].join('\n');
};

/**
 * Inputs and outputs, from the `.d.ts` the project's own compiler reads.
 *
 * What gets shown is tiered, because the whole surface is mostly noise: `KbqButton` has 24 members
 * of which 4 are bindable. The split is mechanical, not a guess — Angular's own declaration says
 * which members are inputs, the rest is sorted by what it is named and how it is declared.
 *
 *   default     inputs, outputs, selector, exportAs — a large borrowed group folded to its names
 *   inherited   the types of those too
 *   methods     public methods that are not lifecycle hooks
 *   internals   compiler plumbing, private state, `ngAcceptInputType_*`
 */
export const toolGetComponent = (
    catalog: Catalog,
    args: {
        id: string;
        symbols?: string[];
        members?: string[];
        include?: ('methods' | 'internals' | 'inherited')[];
    }
): string => {
    const asked = args.id.replace(PREFIX, '');
    const component = findComponent(catalog, asked);
    const live = catalog.api();

    if (!component && !live?.entryPoints.includes(asked)) {
        const known = catalog.index.components.map((entry) => entry.id);
        const near = known.filter((id) => id.includes(asked) || asked.includes(id)).slice(0, 5);

        return [
            `Unknown entry point "${args.id}".`,
            near.length > 0 ? `Closest: ${near.join(', ')}` : `Call list_components for all ${known.length} of them.`
        ].join('\n');
    }

    const id = component?.id ?? asked;
    const entryPoint = entryPointOf(component, id);
    const symbols = live?.read(entryPoint) ?? [];

    if (!live) {
        const installed = catalog.project.packages.get('@koobiq/components');

        return [
            // Two different problems, told apart: the package missing entirely (nothing to read) and
            // the package present but in a layout this reader does not understand (a future ng-packagr
            // change, most likely) — the second used to read exactly like the first, which hid a broken
            // reader behind the same quiet fallback as an uninstalled project.
            ...(installed ? [
                      `@koobiq/components@${installed.version} is installed at ${installed.root}, but its typings could not be read.`,
                      `Expected a "types" entry in its package.json "exports", or, on an older layout, "<entry point>/index.d.ts" — this reader may not know this version's layout yet.`,
                      `The answer below comes from the index bundled with this server, which describes @koobiq/components@${catalog.index.sourceVersion}, not the version actually installed.`
                  ] : [`@koobiq/components is not installed in this project, so its API cannot be read.`]),
            `Only the examples and documentation topics bundled with this server are available.`,
            component?.examples.length
                ? `Examples (get_example): ${component.examples.map((it) => it.id).join(', ')}`
                : '',
            `Docs: ${DOCS}/components/${id}`
        ]
            .filter(Boolean)
            .join('\n');
    }

    const wanted = args.symbols?.length
        ? symbols.filter((symbol) => args.symbols!.includes(symbol.name))
        : symbols.filter((symbol) => symbol.kind === 'component' || symbol.kind === 'directive');

    const targeted = Boolean(args.symbols?.length || args.members?.length);
    const include = new Set(args.include ?? []);

    const lines: string[] = [];

    if (symbols.length === 0 && component && !component.importPath) {
        lines.push(
            `"${id}" is a documentation group, not an entry point: it has no exports of its own.`,
            `Its examples are below; anything it uses is exported from another entry point.`,
            ''
        );
    } else {
        lines.push(`import { ... } from '@koobiq/components/${entryPoint}';`, '');
    }

    // A directive with nothing bindable is not written by hand — `KbqButtonCssStyler` shares the
    // `[kbq-button]` selector with the component and exists to put classes on the host. Naming all
    // of them on one line keeps the fact without spending a block on each.
    const bindable = wanted.filter(
        (symbol) => symbol.inputs.length > 0 || symbol.outputs.length > 0 || Boolean(args.symbols?.length)
    );

    const passive = wanted.filter((symbol) => !bindable.includes(symbol));

    for (const symbol of bindable) lines.push(...describeLive(symbol, args.members, include), '');

    if (passive.length > 0) {
        lines.push(
            `Applied by selector, nothing to bind: ${passive.map((symbol) => `${symbol.name} ${symbol.selector ?? ''}`.trim()).join(', ')}`,
            ''
        );
    }

    if (!targeted) {
        const rest = symbols.filter((symbol) => !wanted.includes(symbol));
        const byKind = new Map<string, string[]>();

        for (const symbol of rest) byKind.set(symbol.kind, [...(byKind.get(symbol.kind) ?? []), symbol.name]);

        if (byKind.size > 0) {
            lines.push('Also exported (pass via `symbols` to expand):');

            for (const [kind, names] of [...byKind].sort((a, b) => a[0].localeCompare(b[0]))) {
                lines.push(`  ${kind}: ${names.sort().join(', ')}`);
            }

            lines.push('');
        }

        if (component?.examples.length) {
            lines.push(`Examples (get_example): ${component.examples.map((it) => it.id).join(', ')}`, '');
        }

        if (component?.sections.length) lines.push(`Documented topics: ${component.sections.join(' \u00b7 ')}`, '');

        lines.push(`Docs: ${DOCS}/components/${id}`);

        // The API above is read from this project and cannot be stale. The examples and topics are
        // not: they ship with this server, from whichever release it was built against.
        const skew = indexSkew(catalog);

        if (skew && (component?.examples.length || component?.sections.length)) {
            lines.push(`VERSION MISMATCH, examples and topics only: ${skew}`);
        }
    } else {
        lines.push(
            `${symbols.length} symbols in this entry point not shown — call without \`symbols\`/\`members\` for the inventory.`
        );
    }

    lines.push(`Context: @koobiq/components@${live.version} (resolved in this project)`);

    return lines.join('\n');
};

export const toolGetExample = (catalog: Catalog, args: { id: string; files?: string[] }): string => {
    const sources = catalog.examples()[args.id];

    if (!sources) {
        const ids = catalog.index.components.flatMap((entry) => entry.examples.map((it) => it.id));
        const near = ids.filter((id) => id.includes(args.id)).slice(0, 8);

        return [
            `Unknown example "${args.id}".`,
            near.length > 0 ? `Closest: ${near.join(', ')}` : 'Run search with kinds ["example"] first.'
        ].join('\n');
    }

    const names = Object.keys(sources).sort();
    const wanted = args.files?.length ? names.filter((name) => args.files!.includes(name)) : names;

    if (wanted.length === 0) return `Example "${args.id}" has files: ${names.join(', ')}`;

    return wanted
        .map((name) => `--- ${name} ---\n${sources[name]!.trimEnd()}`)
        .concat(`Context: index built from @koobiq/components@${catalog.index.sourceVersion}`)
        .join('\n\n');
};

export const toolGetIcon = (catalog: Catalog, args: { name: string }): string => {
    if (!catalog.icons.ok) {
        return [`Icons unavailable: ${catalog.icons.reason}`, catalog.icons.hint].join('\n');
    }

    const probe = args.name.replace(/^kbq-/, '').toLowerCase();
    const icons = catalog.icons.data;
    const exact = icons.filter((icon) => icon.name.toLowerCase() === probe);
    const found = exact.length > 0 ? exact : icons.filter((icon) => icon.name.toLowerCase().startsWith(probe));

    if (found.length === 0) {
        const hint = resolveRename(probe, catalog.index.iconRenames, new Set(icons.map((icon) => icon.name)));

        if (hint) {
            return [
                describeRename(hint, catalog.icons.version),
                '',
                toolGetIcon(catalog, { name: hint.use })
            ].join('\n');
        }

        return [
            `No icon named "${args.name}" in @koobiq/icons@${catalog.icons.version}.`,
            `Search by meaning instead — the index carries English and Russian tags.`,
            `Docs: ${DOCS}/icons`
        ].join('\n');
    }

    const lines = found.slice(0, 6).flatMap((icon) => {
        const attribute = `kbq-${icon.name}`;

        return [
            `${attribute}${icon.size ? `  (${icon.size}px)` : ''}`,
            icon.description ? `  ${icon.description}` : null,
            `  tags: ${icon.tags.join(', ') || 'none'}${icon.tagsInherited ? ' (inherited from another size)' : ''}`,
            `  <i kbq-icon="${attribute}" aria-hidden="true"></i>`,
            `  <i kbq-icon-item="${attribute}" aria-hidden="true"></i>   when it needs the item background`,
            ''
        ].filter((line): line is string => line !== null);
    });

    lines.push(`Import KbqIconModule from '@koobiq/components/icon'.`);
    lines.push(`Context: @koobiq/icons@${catalog.icons.version} (resolved in this project)`);

    if (catalog.icons.degraded) lines.push(`Degraded: ${catalog.icons.degraded}`);

    return lines.join('\n');
};

export const toolGetToken = (catalog: Catalog, args: { name: string }): string => {
    if (!catalog.tokens.ok) {
        return [`Tokens unavailable: ${catalog.tokens.reason}`, catalog.tokens.hint].join('\n');
    }

    const probe = args.name.startsWith('--') ? args.name.toLowerCase() : `--kbq-${args.name.toLowerCase()}`;
    const tokens = catalog.tokens.data;
    const exact = tokens.filter((token) => token.cssName.toLowerCase() === probe);
    const found = exact.length > 0 ? exact : tokens.filter((token) => token.cssName.toLowerCase().startsWith(probe));

    if (found.length === 0) {
        return [
            `No token named "${args.name}" in @koobiq/design-tokens@${catalog.tokens.version}.`,
            `Docs: ${DOCS}/tokens`
        ].join('\n');
    }

    const lines = found.slice(0, 8).flatMap((token) => [
            `${token.cssName}${token.deprecated ? '   DEPRECATED' : ''}`,
            `  value: ${token.value}`,
            `  themes: ${token.themes.join(', ')}`,
            token.references?.length ? `  references: ${token.references.join(', ')}` : null,
            token.deprecationNote ? `  instead: ${token.deprecationNote}` : null,
            ''
        ].filter((line): line is string => line !== null));

    // No advice on how to theme is given here. 1862 of 3.20.0's 2004 tokens are deprecated, most of
    // them component-level ones the package says to replace with global tokens — so the house rule
    // that a component's look is changed by redefining its own tokens is being retired, and a line
    // repeating it would contradict what the package itself reports two lines above.
    lines.push(`Use as var(${found[0]!.cssName}).`);
    lines.push(`Context: @koobiq/design-tokens@${catalog.tokens.version} (resolved in this project)`);

    if (catalog.tokens.degraded) lines.push(`Degraded: ${catalog.tokens.degraded}`);

    return lines.join('\n');
};

/**
 * The guides, served at the version the project is on.
 *
 * Three shapes, narrowing: no id lists what exists, an id lists that guide's sections, an id with
 * a section returns the text. The middle step is what keeps this affordable — `theming` is 17 KB
 * and `migration` is 200 KB, so returning a whole guide would cost more context than the answer
 * is worth, and most questions are answered by one section.
 */
export const toolGetGuide = (catalog: Catalog, args: { id?: string; section?: string; lang?: 'en' | 'ru' }): string => {
    const guides = catalog.guides();
    const lang = args.lang ?? 'en';
    const version = catalog.project.packages.get('@koobiq/components')?.version ?? null;

    if (guides.length === 0) {
        return `No guides are bundled with this build of @koobiq/mcp. See ${DOCS}/main/installation.`;
    }

    if (!args.id) {
        const lines = guideIds(guides).flatMap((id) => {
            const guide = pickGuide(guides, id, lang);

            if (!guide) return [];

            // `migration` opens on a heading, so it has no lede; its first section names it better
            // than an empty line would.
            const first =
                guide.lede.split('\n').find((line) => line.trim().length > 0) ?? guide.sections[0]?.heading ?? '';

            return [`${id} — ${guide.title}`, `  ${first.slice(0, 160)}`];
        });

        return [...lines, '', `Call again with id to list a guide's sections.`].join('\n');
    }

    const guide = pickGuide(guides, args.id, lang);

    if (!guide) {
        return [`Unknown guide "${args.id}".`, `Available: ${guideIds(guides).join(', ')}`].join('\n');
    }

    const caveat = guideCaveat(guide, version);

    const provenance = [
        `Guide: ${guide.title} (${guide.lang})`,
        guide.unreleased ? null : `Text as shipped in ${guide.since}`,
        caveat ? `NOTE: ${caveat}` : null,
        guide.lang !== lang ? `Only the ${guide.lang} text is indexed for this guide.` : null
    ].filter((line): line is string => line !== null);

    // Listed as addresses rather than as bare headings: a repeated heading is not an address, and
    // the listing is where a caller copies one from.
    const addresses = guide.sections.map((_, index) => sectionPath(guide, index));

    if (!args.section) {
        return [
            ...provenance,
            '',
            guide.lede.slice(0, 600),
            '',
            'Sections:',
            ...addresses.map((path) => `  ${path}`),
            '',
            `Call again with section to read one. Pass the path as shown, "parent > heading" included.`
        ].join('\n');
    }

    const hit = findSection(guides, guide, args.section);

    if (hit.kind === 'ambiguous') {
        return [
            `"${args.section}" names ${hit.paths.length} sections of ${guide.title}.`,
            `Ask for one of:`,
            ...hit.paths.map((path) => `  ${path}`)
        ].join('\n');
    }

    if (hit.kind === 'missing') {
        return [`No section "${args.section}" in ${guide.title}.`, `Sections: ${addresses.join(' | ')}`].join('\n');
    }

    const { section } = hit;

    // A guide may name an example that has since been renamed or deleted. Saying so costs one line
    // and saves a `get_example` call that can only fail.
    const available = catalog.examples();
    const live = section.examples.filter((id) => available[id]);
    const gone = section.examples.filter((id) => !available[id]);

    return [
        ...provenance,
        `Section: ${hit.path}`,
        // The caller asked in one language and was answered from the other's headings. Worth a
        // line: it tells them which spelling to use next time, and that the text below is right.
        hit.viaLang ? `Addressed by its ${hit.viaLang} heading; the ${guide.lang} text is below.` : null,
        '',
        section.body,
        live.length > 0 ? `\nRunnable examples: ${live.join(', ')} — fetch with get_example.` : '',
        gone.length > 0 ? `Referenced but no longer shipped: ${gone.join(', ')}.` : ''
    ]
        .filter(Boolean)
        .join('\n');
};

/**
 * What changed between two releases, and what to do about it.
 *
 * Two halves that answer different questions. `data/history.json` says *what* moved, mechanically,
 * from the API reports CI approved at each tag. The migration guide says *what to write instead*,
 * in prose, and its sections are tagged with the release they apply to. An upgrade needs both.
 *
 * The default answer is a summary, because the raw diff is not readable: 18.4.0 to 19.0.0 is 2930
 * changes across 61 entry points. Removals lead — they are what stops compiling.
 */
export const toolMigrate = (
    catalog: Catalog,
    args: { from: string; to?: string; component?: string; lang?: 'en' | 'ru' }
): string => {
    const history = catalog.history();
    const versions = Object.keys(history);

    if (versions.length === 0) return `No API history is bundled with this build of @koobiq/mcp.`;

    const installed = catalog.project.packages.get('@koobiq/components')?.version;
    const to = args.to ?? installed ?? versions.sort(compare).at(-1)!;
    const range = summarise(history, args.from, to);

    const oldest = versions.sort(compare)[0]!;
    const covered = `History covers ${oldest} to ${versions.sort(compare).at(-1)}.`;

    // The history begins where the API reports do. Asked from below that, the totals are real but
    // partial and nothing in the answer used to say which — a reader upgrading from 18.0.0 took
    // 670 removals for the whole bill when the record only starts at 18.1.0.
    const partial =
        compare(args.from, oldest) < 0
            ? `INCOMPLETE: the earliest release on record is ${oldest}, so anything removed or changed between ${args.from} and ${oldest} is not counted below.`
            : null;

    if (range.releases.length === 0) {
        return [
            `No recorded API changes between ${args.from} and ${to}.`,
            compare(args.from, to) >= 0 ? `"from" must be lower than "to".` : null,
            covered
        ]
            .filter(Boolean)
            .join('\n');
    }

    const guide = pickGuide(catalog.guides(), 'migration', args.lang ?? 'en');
    const { dated, undated } = migrationSections(guide, range);

    if (args.component) {
        const entryPoint = args.component.replace(/^@koobiq\/components\//, '');
        const changes = changesFor(history, range, entryPoint);

        if (changes.length === 0) {
            const touched = range.impact.map((entry) => entry.entryPoint);

            return [
                `${entryPoint} did not change between ${range.from} and ${to}.`,
                touched.length > 0 ? `Entry points that did: ${touched.join(', ')}` : null
            ]
                .filter(Boolean)
                .join('\n');
        }

        // Removals first regardless of release order: a reader fixing an upgrade wants the breaks.
        const order = { removed: 0, updated: 1, added: 2 } as const;
        const sorted = [...changes].sort((a, b) => order[a.change] - order[b.change] || compare(a.version, b.version));

        const shown = sorted.slice(0, 60);
        const name = (change: (typeof sorted)[number]): string =>
            change.member ? `${change.symbol}.${change.member}` : change.symbol;

        return [
            `${entryPoint}: ${range.from} → ${to}`,
            partial,
            `${changes.length} changes — ${changes.filter((change) => change.change === 'removed').length} removed, ` +
                `${changes.filter((change) => change.change === 'updated').length} updated, ` +
                `${changes.filter((change) => change.change === 'added').length} added`,
            '',
            ...shown.map((change) =>
                change.change === 'updated'
                    ? `  ${change.change.padEnd(8)} ${name(change)}  (${change.version})\n             ${change.from} → ${change.to}`
                    : `  ${change.change.padEnd(8)} ${name(change)}  (${change.version})`
            ),
            // Which kinds got cut matters: 98 removals fill the whole budget, and a reader who is
            // not told would take "no updates listed" for "nothing was updated".
            sorted.length > shown.length
                ? `\n  … ${sorted.length - shown.length} more not shown: ` +
                  (['removed', 'updated', 'added'] as const)
                      .map(
                          (kind) => [
                                  kind,
                                  sorted.slice(shown.length).filter((change) => change.change === kind).length
                              ] as const
                      )
                      .filter(([, count]) => count > 0)
                      .map(([kind, count]) => `${count} ${kind}`)
                      .join(', ')
                : '',
            dated.length > 0
                ? `\nWritten instructions: get_guide migration "${dated[0]!.heading}"` +
                  (dated.length > 1 ? ` (and ${dated.length - 1} more section(s) in range)` : '')
                : ''
        ]
            .filter(Boolean)
            .join('\n');
    }

    const worst = range.impact.filter((entry) => entry.removed > 0).slice(0, 12);
    const onlyGrew = range.impact.length - range.impact.filter((entry) => entry.removed > 0).length;

    return [
        `Upgrading @koobiq/components ${range.from} → ${to}`,
        installed && installed !== to ? `This project is on ${installed}.` : null,
        partial,
        '',
        `${range.releases.length} releases changed the API: ${range.totals.removed} removed, ` +
            `${range.totals.updated} updated, ${range.totals.added} added, across ${range.impact.length} entry points.`,
        '',
        worst.length > 0
            ? 'Entry points that LOST API — these are what stops compiling:'
            : 'Nothing was removed in this range.',
        ...worst.map(
            (entry) =>
                `  ${entry.entryPoint.padEnd(22)} ${String(entry.removed).padStart(4)} removed, ${entry.updated} updated`
        ),
        range.impact.filter((entry) => entry.removed > 0).length > worst.length
            ? `  … and ${range.impact.filter((entry) => entry.removed > 0).length - worst.length} more`
            : '',
        onlyGrew > 0 ? `\n${onlyGrew} other entry point(s) only gained API.` : '',
        dated.length > 0 ? `\nMigration guide sections for this range (get_guide migration "<heading>"):` : '',
        ...dated.map((section) => `  ${section.heading}`),
        // Not silently dropped: a heading nobody could date may still be the one that matters.
        undated.length > 0 ? `\nUndated sections, check by hand: ${undated.join(' | ')}` : '',
        '',
        `Call again with component to list one entry point's changes.`,
        covered
    ]
        .filter((line) => line !== null && line !== '')
        .join('\n');
};

/**
 * Which component answers a task, and which neighbour would be picked by mistake.
 *
 * The failure this exists to prevent is not "found nothing". It is "found the neighbour": an agent
 * reaches for `autocomplete` when asked for a multi-select, `toast` for a message that has to be
 * acknowledged, `tabs` for a form control. Each of those is a word that looks like the request.
 *
 * So the answer leads with the row from the guide, and the row carries `not` and `why not`. Naming
 * only the right component leaves the wrong one just as plausible as it was.
 */
export const toolWhichComponent = (catalog: Catalog, args: { task: string; lang?: 'en' | 'ru' }): string => {
    const lang = args.lang ?? (/\p{Script=Cyrillic}/u.test(args.task) ? 'ru' : 'en');
    const guide = pickGuide(catalog.guides(), 'which-component-when', lang);
    const choices = parseChoices(guide);

    if (choices.length === 0) {
        return [
            `The component-choice guide is not bundled with this build of @koobiq/mcp.`,
            `Fall back to search, then get_component.`
        ].join('\n');
    }

    // A task is prose, so a compound word is expanded into its parts: "multi-select" has to reach
    // the row whose answer is `select` with `multiple`.
    const query = [...new Set(terms(args.task).flatMap((term) => [term, ...compoundParts(term)]))];

    // The keyword index exists for the words a request uses that the task phrases do not: nothing
    // in the tables says "500 options", but the index routes it to the right cluster. Matched with
    // hyphens removed, because "multi-select" and "multiselect" are the same request.
    const flat = (word: string): string => normalize(word).replace(/-/g, '');
    const asked = new Set(query.flatMap((term) => [flat(term), ...term.split('-')]));

    // Entries are phrases as often as words — "500 options", "virtual scroll" — so an entry counts
    // only when every word of it was asked for. Matching on any one word would route half the
    // questions in the guide to the same cluster.
    const routed = new Set(
        parseKeywords(guide)
            .filter((route) =>
                route.words.some((entry) => {
                    const words = terms(entry);

                    return words.length > 0 && words.every((word) => asked.has(flat(word)));
                })
            )
            .map((route) => flat(route.cluster))
    );

    // Weighted against the guide's own vocabulary, so a word that narrows the question outranks
    // one that every second row happens to contain.
    const weights = rarity(
        query,
        choices.map((choice) => normalize(`${choice.task} ${choice.use}`))
    );

    const scored = choices
        .map((choice) => ({
            choice,
            // The task phrase carries the intent, the component to use is what a request often
            // spells outright, and the reason text is the weakest signal of the three.
            //
            // `instead` is deliberately not scored. It names the component that must *not* be used,
            // so matching on it ranks a row by the very word it is warning against: asking for a
            // multi-select put `radio` first, because `select` appears in that row as the mistake.
            score:
                score(query, normalize(choice.task), terms(choice.task).map(normalize), weights) * 1.3 +
                score(query, normalize(choice.use), terms(choice.use).map(normalize), weights) +
                score(query, '', terms(choice.why ?? '').map(normalize), weights) * 0.5 +
                // Small, and smaller than a direct match. The index routes "menu" to Navigation,
                // but the row that answers "a menu of actions" is `dropdown`, filed under picking
                // a value — a boost that outweighs the text put four navigation rows above it.
                (routed.has(flat(choice.cluster)) ? 0.6 : 0)
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        const routes = parseKeywords(guide);
        const clusters = [...new Set(choices.map((choice) => choice.cluster))];

        return [
            `Nothing in the component-choice guide matches "${args.task}".`,
            '',
            'Clusters it does cover:',
            ...clusters.map((cluster) => `  ${cluster}`),
            routes.length > 0 ? `\nRead one with get_guide which-component-when "<cluster>".` : ''
        ]
            .filter(Boolean)
            .join('\n');
    }

    const best = scored[0]!.score;
    const shown = scored.filter((entry) => entry.score >= best * 0.45).slice(0, 5);
    const clusters = [...new Set(shown.map((entry) => entry.choice.cluster))];

    return [
        `Task: ${args.task}`,
        '',
        ...shown.flatMap(({ choice }) => [
                `  use  ${choice.use}`,
                choice.instead ? `  not  ${choice.instead}` : null,
                choice.why ? `  why  ${choice.why}` : null,
                `       — ${choice.task} · ${choice.cluster}`,
                ''
            ].filter((line): line is string => line !== null)),
        `Read the whole cluster: ${clusters.map((cluster) => `get_guide which-component-when "${cluster}"`).join(' · ')}`,
        `Then get_component for the API of whichever you pick.`
    ].join('\n');
};

/**
 * Every documented area of the library, as one closed list.
 *
 * Exists because the alternative was observed: an agent with no way to ask reads
 * `node_modules/@koobiq/components/*` instead, and that answer is wrong in both directions. It
 * returns `fesm2022`, `prebuilt-themes` and `schematics` as if they were entry points, it misses
 * the two that are nested one level down, and it cannot know about the ten documented areas that
 * are not directories at all — `validation` and `forms` among them.
 *
 * `search` cannot stand in for this. It ranks, so it answers "here are the closest twelve", never
 * "those are all of them" — and it is the second claim that stops an agent from guessing a name.
 */
export const toolListComponents = (catalog: Catalog, args: { detail?: 'summary'; lang?: 'en' | 'ru' }): string => {
    const entries = [...catalog.index.components].sort((a, b) => a.id.localeCompare(b.id));

    if (entries.length === 0) {
        return `No component index is bundled with this build of @koobiq/mcp. See ${DOCS}/components.`;
    }

    const live = catalog.api();
    const lang = args.lang ?? 'en';
    const lines: string[] = [];

    lines.push(
        `${entries.length} documented areas of @koobiq/components — the complete list, nothing else is exported.`,
        `Import path is @koobiq/components/<id> unless listed otherwise below.`,
        ''
    );

    if (args.detail === 'summary') {
        for (const entry of entries) {
            const summary = (lang === 'ru' ? entry.summaryRu : entry.summary) ?? entry.summary;
            const first = summary?.replace(/`/g, '').split(/(?<=[.!?])\s/)[0] ?? '';

            lines.push(`${entry.id}${first ? ` — ${first.length > 110 ? `${first.slice(0, 110)}…` : first}` : ''}`);
        }
    } else {
        lines.push(entries.map((entry) => entry.id).join(', '));
    }

    lines.push('');

    const groups = entries.filter((entry) => !entry.importPath);

    if (groups.length > 0) {
        lines.push(
            `No entry point of their own — documented separately, exported from another one:`,
            `  ${groups.map((entry) => entry.id).join(', ')}`,
            ''
        );
    }

    // Spelled out rather than left to the rule above, because for these the rule produces a path
    // that does not resolve: the API report flattens the slash, so the id is `scrollbar-deprecated`.
    const renamed = entries.filter(
        (entry) => entry.importPath && entry.importPath !== `@koobiq/components/${entry.id}`
    );

    if (renamed.length > 0) {
        lines.push(
            `Published under a path that is not the id:`,
            ...renamed.map((entry) => `  ${entry.id} → ${entry.importPath}`),
            ''
        );
    }

    // The list is the index's, and the index ships with this server. Saying which of its ids the
    // installed version does not have is the one thing a bundled list can get wrong on its own.
    if (live) {
        const missing = entries.filter(
            (entry) => entry.importPath && !live.entryPoints.includes(entryPointOf(entry, entry.id))
        );

        if (missing.length > 0) {
            lines.push(
                `Documented here but absent from the installed @koobiq/components@${live.version} — do not import these:`,
                `  ${missing.map((entry) => entry.id).join(', ')}`,
                ''
            );
        }
    }

    lines.push(
        `Next: which_component_when to pick one for a task, get_component for its API, get_example for working code.`,
        `Context: ${describeContext(catalog)}`
    );

    return lines.join('\n');
};
