import type { Catalog } from './catalog.js';
import { FLOOR, normalize, score, terms } from './matching.js';

/**
 * One ranked search across every source.
 *
 * Deliberately one tool rather than one per source: the tool schemas are re-sent with every model
 * request, so a second search tool costs tokens on every turn whether or not it is called, while
 * adding icons and tokens to this index costs nothing at request time.
 */

export type HitKind = 'entry-point' | 'symbol' | 'member' | 'example' | 'icon' | 'token' | 'guide';

export type Hit = {
    kind: HitKind;
    /** What to pass back to the matching `get_*` tool. */
    ref: string;
    label: string;
    detail: string;
    score: number;
};

const KIND_WEIGHT: Record<HitKind, number> = {
    // Above the API kinds on purpose. "How do I set up theming" is answered by a guide; the same
    // query against symbols returns `KbqThemeSelector` and the agent is no closer to a working page.
    guide: 1.25,
    'entry-point': 1.15,
    symbol: 1.1,
    member: 1,
    icon: 1,
    token: 1,
    example: 0.95
};

export type SearchOptions = {
    kinds?: HitKind[];
    limit?: number;
};

export const search = (catalog: Catalog, query: string, options: SearchOptions = {}): Hit[] => {
    const query_ = terms(query);
    const limit = options.limit ?? 12;
    const allow = options.kinds?.length ? new Set(options.kinds) : null;
    const hits: Hit[] = [];

    if (query_.length === 0) return hits;

    const push = (kind: HitKind, raw: number, hit: Omit<Hit, 'score' | 'kind'>): void => {
        if (raw === 0) return;
        if (allow && !allow.has(kind)) return;

        hits.push({ ...hit, kind, score: raw * KIND_WEIGHT[kind] });
    };

    const live = catalog.api();
    const cyrillic = /\p{Script=Cyrillic}/u.test(query);

    for (const component of catalog.index.components) {
        // The component's id is English and always will be — `select`, `tree-select`. What makes a
        // Russian question land is the page's own prose: its headings and its opening sentence,
        // "Селект позволяет выбрать одно или несколько значений из предопределённого списка".
        const keywords = [
            ...component.sections,
            ...component.sectionsRu,
            ...(component.summary ? terms(component.summary) : []),
            ...(component.summaryRu ? terms(component.summaryRu) : [])
        ].map(normalize);

        // Answer in the language that was asked in, when there is a choice.
        const summary = (cyrillic ? (component.summaryRu ?? component.summary) : component.summary) ?? null;

        push('entry-point', score(query_, normalize(component.id), keywords), {
            ref: component.id,
            label: component.importPath ?? `${component.id} (docs group)`,
            detail: summary ?? `${component.symbols.length} symbols, ${component.examples.length} examples`
        });

        // Symbols come from the installed package when there is one, so that a hit here names
        // something `get_component` will also show. Falling back to the bundled index keeps search
        // working for a project that has not installed `@koobiq/components` yet.
        const installed = live?.read(component.id);

        if (installed) {
            for (const symbol of installed) {
                const keywords = [symbol.selector, ...symbol.exportAs].filter(Boolean).map((it) => normalize(it!));

                push('symbol', score(query_, normalize(symbol.name), keywords), {
                    ref: `${component.id}#${symbol.name}`,
                    label: symbol.name,
                    detail: [
                        symbol.kind,
                        symbol.selector && `selector ${symbol.selector}`,
                        `@koobiq/components/${component.id}`
                    ]
                        .filter(Boolean)
                        .join(' · ')
                });

                // Indexed under the template name, which is what a query spells. `connectedTo` is
                // written `kbqAutocompleteConnectedTo`; indexing the property makes the search miss
                // exactly the queries a person types while reading a template.
                for (const input of symbol.inputs) {
                    push('member', score(query_, normalize(input.alias), [normalize(input.name)]) * 0.9, {
                        ref: `${component.id}#${symbol.name}`,
                        label: `${symbol.name}.${input.alias}`,
                        detail: `input · ${input.type ?? 'unknown'}`
                    });
                }

                for (const output of symbol.outputs) {
                    push('member', score(query_, normalize(output.alias), [normalize(output.name)]) * 0.9, {
                        ref: `${component.id}#${symbol.name}`,
                        label: `${symbol.name}.${output.alias}`,
                        detail: `output · ${output.type ?? 'unknown'}`
                    });
                }

                for (const member of symbol.members) {
                    if (member.internal || member.lifecycle || member.visibility !== 'public') continue;
                    if (member.kind !== 'method' && symbol.kind !== 'enum') continue;

                    push('member', score(query_, normalize(member.name), []) * 0.75, {
                        ref: `${component.id}#${symbol.name}`,
                        label: `${symbol.name}.${member.name}`,
                        detail: `${member.kind} · ${member.signature}`
                    });
                }
            }
        } else {
            for (const symbol of component.symbols) {
                const keywords = [symbol.selector, ...(symbol.exportAs ?? [])]
                    .filter(Boolean)
                    .map((it) => normalize(it!));

                push('symbol', score(query_, normalize(symbol.name), keywords), {
                    ref: `${component.id}#${symbol.name}`,
                    label: symbol.name,
                    detail: [
                        symbol.kind,
                        symbol.selector && `selector ${symbol.selector}`,
                        component.importPath ?? component.id
                    ]
                        .filter(Boolean)
                        .join(' · ')
                });

                for (const member of symbol.members) {
                    push('member', score(query_, normalize(member.name), []) * 0.9, {
                        ref: `${component.id}#${symbol.name}`,
                        label: `${symbol.name}.${member.name}`,
                        detail: `${member.kind} · ${member.signature}`
                    });
                }
            }
        }

        for (const example of component.examples) {
            push('example', score(query_, normalize(example.id), terms(example.title)), {
                ref: example.id,
                label: example.id,
                detail: example.title
            });
        }
    }

    // Both languages are indexed. The component index carries English headings only, so before
    // this the only Russian a query could land on was an icon tag — "темизация" found nothing,
    // which is how the server came to know less about theming than the public llms.txt.
    for (const guide of catalog.guides()) {
        const headings = guide.sections.map((section) => section.heading);

        push('guide', score(query_, normalize(guide.id), [...terms(guide.title), ...headings.flatMap(terms)]), {
            ref: guide.id,
            label: `${guide.title} (${guide.lang})`,
            detail: `${headings.length} sections · shipped in ${guide.since}`
        });

        for (const section of guide.sections) {
            push('guide', score(query_, normalize(section.heading), terms(guide.id)) * 0.95, {
                ref: `${guide.id}#${section.heading}`,
                label: `${guide.title} › ${section.heading}`,
                detail: `guide section (${guide.lang})`
            });
        }
    }

    if (catalog.icons.ok) {
        for (const icon of catalog.icons.data) {
            push('icon', score(query_, normalize(icon.name), icon.tags.map(normalize)), {
                ref: icon.name,
                label: icon.name,
                detail: [icon.size ? `${icon.size}px` : null, icon.tagsInherited ? 'tags inherited' : null]
                    .filter(Boolean)
                    .join(' · ')
            });
        }
    }

    if (catalog.tokens.ok) {
        for (const token of catalog.tokens.data) {
            push('token', score(query_, normalize(token.cssName.replace(/^--kbq-/, '')), terms(token.path)), {
                ref: token.cssName,
                label: token.cssName,
                detail: [token.value, token.deprecated ? 'DEPRECATED' : null].filter(Boolean).join(' · ')
            });
        }
    }

    const ranked = hits.sort(
        (a, b) => b.score - a.score || a.label.length - b.label.length || a.label.localeCompare(b.label)
    );

    // Partial matching lets far more through, most of it worthless. The cut is relative to the best
    // hit rather than absolute, because scores are not comparable between a one-word query and a
    // four-word one: what matters is whether a result is in the same class as the winner.
    const best = ranked[0]?.score ?? 0;

    return ranked.filter((hit) => hit.score >= best * FLOOR).slice(0, limit);
};
