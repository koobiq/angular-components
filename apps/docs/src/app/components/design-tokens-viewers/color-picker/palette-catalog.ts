/** One step of a ramp — a single CSS variable. */
export interface DocsColorStep {
    /** Full variable name, e.g. `--kbq-plt-teal-a14`. */
    token: string;
    /** Position within the ramp, e.g. `14` or `a14`. */
    label: string;
}

/** A ramp: one hue, every step it ships. */
export interface DocsColorFamily {
    /** Stable id taken from the variable name, e.g. `teal`, `dark-slate`, `white`. */
    id: string;
    /** What the left pane shows, e.g. `Dark slate`. */
    name: string;
    /** The step the left-pane dot is painted with. */
    preview: string;
    /** Every step, solid first then alpha. Length comes from the data — ramps are not all 20. */
    steps: DocsColorStep[];
}

/** A titled section of the left pane, so the semantic families can sit above the engineering ones. */
export interface DocsColorGroup {
    title: string;
    families: DocsColorFamily[];
}

type DocsDeclarations = Map<string, Map<string, string>>;

/** `dark-slate` → `Dark slate`. */
const toTitle = (id: string): string => {
    const spaced = id.replace(/-/g, ' ');

    return spaced[0].toUpperCase() + spaced.slice(1);
};

/** Solid steps ascending, then alpha steps ascending. A scalar family sorts before both. */
const compareSteps = (a: DocsColorStep, b: DocsColorStep): number => {
    const parse = (label: string) => ({
        alpha: label.startsWith('a'),
        index: parseInt(label.replace('a', ''), 10) || 0
    });
    const first = parse(a.label);
    const second = parse(b.label);

    if (first.alpha !== second.alpha) return first.alpha ? 1 : -1;

    return first.index - second.index;
};

/**
 * Groups the `--kbq-<layer>-*` custom properties declared on `:root` into ramps.
 *
 * Alpha is not a family of its own: `--kbq-plt-blue-a14` is family `blue`, step `a14`. Reading the
 * families out of the declarations rather than off a list keeps the picker in step with whatever
 * version of the tokens is installed.
 */
export const docsBuildColorFamilies = (
    declarations: DocsDeclarations,
    layer: 'plt' | 'semantic'
): DocsColorFamily[] => {
    const steps = new Map<string, DocsColorStep[]>();
    const rampStep = new RegExp(`^--kbq-${layer}-(.+?)-(a?\\d+)$`);
    const scalar = new RegExp(`^--kbq-${layer}-([a-z-]+)$`);

    for (const [property] of declarations.get(':root') ?? []) {
        const ramp = property.match(rampStep);

        if (ramp) {
            const family = steps.get(ramp[1]) ?? [];

            family.push({ token: property, label: ramp[2] });
            steps.set(ramp[1], family);

            continue;
        }

        // `--kbq-plt-white` and `--kbq-plt-black` are single values, not ramps, but they carry an
        // alpha ramp under the same name — so they are families with one extra, unnumbered step.
        const single = property.match(scalar);

        if (single) {
            const family = steps.get(single[1]) ?? [];

            family.push({ token: property, label: '—' });
            steps.set(single[1], family);
        }
    }

    return [...steps]
        .map(([id, rampSteps]) => {
            const sorted = [...rampSteps].sort(compareSteps);
            // Mid-ramp reads as the family's colour; a scalar family only has the one.
            const preview = sorted.find(({ label }) => label === '14') ?? sorted[Math.floor(sorted.length / 2)];

            return { id, name: toTitle(id), preview: preview.token, steps: sorted };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Splits families by colour scheme.
 *
 * `white` and `black` stay in both: `--kbq-foreground-on-contrast` flips between them across
 * themes, so they are not a light-theme thing.
 */
export const docsFilterFamiliesByScheme = (
    families: DocsColorFamily[],
    scheme: 'light' | 'dark'
): DocsColorFamily[] => {
    const neutral = (id: string) => id === 'white' || id === 'black';

    return families.filter(({ id }) =>
        neutral(id) ? true : scheme === 'dark' ? id.startsWith('dark-') : !id.startsWith('dark-')
    );
};
