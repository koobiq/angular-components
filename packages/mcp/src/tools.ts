import { describeContext, indexSkew, type Catalog } from './catalog.js';
import { compoundParts } from './glossary.js';
import { normalize, rarity, score, terms } from './matching.js';
import { search, type HitKind } from './search.js';
import { compare } from './semver.js';
import type { ResolvedSymbol } from './sources/components.js';
import { findSection, guideCaveat, guideIds, pickGuide } from './sources/guides.js';
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

const findComponent = (catalog: Catalog, id: string): ComponentEntry | undefined =>
    catalog.index.components.find((entry) => entry.id === id.replace(/^@koobiq\/components\//, ''));

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
    include: Set<'methods' | 'internals'>
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

    for (const input of symbol.inputs) {
        if (!only(input.alias) && !only(input.name)) continue;

        const flags = [input.required ? 'required' : null, input.isSignal ? 'signal' : null].filter(Boolean).join(', ');

        lines.push(
            `  [input]  ${input.alias}: ${input.type ?? 'unknown'}${flags ? `  (${flags})` : ''}${origin(input)}` +
                (input.name !== input.alias ? `  — property ${input.name}` : '')
        );
    }

    for (const output of symbol.outputs) {
        if (!only(output.alias) && !only(output.name)) continue;

        lines.push(`  [output] ${output.alias}: ${output.type ?? 'unknown'}${origin(output)}`);
    }

    const methods = symbol.members.filter(
        (member) =>
            member.visibility === 'public' &&
            !member.internal &&
            !member.lifecycle &&
            member.kind === 'method' &&
            only(member.name)
    );

    if (include.has('methods')) for (const member of methods) lines.push(`  [method] ${member.signature}`);

    if (include.has('internals')) {
        for (const member of symbol.members) {
            if (methods.includes(member) || !only(member.name)) continue;

            lines.push(`  [${member.lifecycle ? 'lifecycle' : member.kind}] ${member.signature}`);
        }
    }

    if (symbol.kind === 'enum') {
        for (const member of symbol.members) if (only(member.name)) lines.push(`  ${member.signature}`);
    }

    if (lines.length === 0) return [head];

    const hidden =
        methods.length > 0 && !include.has('methods') ? `  (+${methods.length} methods — include: ["methods"])` : '';

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
 *   default     inputs, outputs, selector, exportAs
 *   methods     public methods that are not lifecycle hooks
 *   internals   compiler plumbing, private state, `ngAcceptInputType_*`
 */
export const toolGetComponent = (
    catalog: Catalog,
    args: { id: string; symbols?: string[]; members?: string[]; include?: ('methods' | 'internals')[] }
): string => {
    const component = findComponent(catalog, args.id);
    const live = catalog.api();

    if (!component && !live?.entryPoints.includes(args.id)) {
        const known = catalog.index.components.map((entry) => entry.id);
        const near = known.filter((id) => id.includes(args.id) || args.id.includes(id)).slice(0, 5);

        return [
            `Unknown entry point "${args.id}".`,
            near.length > 0 ? `Closest: ${near.join(', ')}` : `Run search first; ${known.length} entry points exist.`
        ].join('\n');
    }

    const id = component?.id ?? args.id;
    const symbols = live?.read(id) ?? [];

    if (!live) {
        return [
            `@koobiq/components is not installed in this project, so its API cannot be read.`,
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
        lines.push(`import { ... } from '@koobiq/components/${id}';`, '');
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

    if (!args.section) {
        return [
            ...provenance,
            '',
            guide.lede.slice(0, 600),
            '',
            'Sections:',
            ...guide.sections.map((section) => `  ${section.heading}`),
            '',
            `Call again with section to read one.`
        ].join('\n');
    }

    const section = findSection(guide, args.section);

    if (!section) {
        return [
            `No section "${args.section}" in ${guide.title}.`,
            `Sections: ${guide.sections.map((entry) => entry.heading).join(' | ')}`
        ].join('\n');
    }

    // A guide may name an example that has since been renamed or deleted. Saying so costs one line
    // and saves a `get_example` call that can only fail.
    const available = catalog.examples();
    const live = section.examples.filter((id) => available[id]);
    const gone = section.examples.filter((id) => !available[id]);

    return [
        ...provenance,
        `Section: ${section.heading}`,
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

    const covered = `History covers ${versions.sort(compare)[0]} to ${versions.sort(compare).at(-1)}.`;

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
