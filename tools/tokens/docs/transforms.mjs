/**
 * The transform group the docs data is generated through.
 *
 * Mirrors `kbq/css` from `@koobiq/tokens-builder`, minus what these files do not need. Two hooks
 * the v3 group used are gone in v4 and are not replaced:
 *
 *   - `kbq/prefix` — the prefix is a platform option now (`prefix: 'kbq'` in sdConfig), applied by
 *     `name/custom-kebab`.
 *
 * `color/css` is deliberately absent, for the reason the builder's own group spells out: with DTCG
 * types in the sources its filter starts firing, and it would rewrite `transparent` and
 * `#00000000` into `rgba(0, 0, 0, 0)` for no gain.
 */
export default (StyleDictionary) => {
    /**
     * Drops a `light` / `dark` segment the builder leaves behind.
     *
     * `name/custom-kebab` only strips the theme when it is the token's *category* — the first path
     * segment, as in `light.background.bg`. Shadows are authored the other way round
     * (`shadow.light.card`), so the theme sits in the middle and survives, giving
     * `--kbq-shadow-light-card` where the package ships `--kbq-shadow-card`.
     *
     * Whether to strip is decided from `token.path`, not from the name. Two different tokens read
     * the same once flattened, and matching on the name alone gets both of them wrong:
     *
     *   - `plt.darkBlue.1` → `--kbq-plt-dark-blue-1`, where `-dark-` is part of the family name.
     *     A name-only match collapses every dark ramp onto its light twin.
     *   - `states.background.highlight-current`, where `light-` sits inside a word. That is exactly
     *     what the pre-v4 transform matched, and why `--kbq-states-background-highcurrent` exists.
     *
     * Only a path segment that *is* `light` or `dark` counts, which neither of those has.
     */
    StyleDictionary.registerTransform({
        name: 'name/without-theme-segment',
        type: 'name',
        transform: (token) => {
            const theme = token.path.find((segment) => segment === 'light' || segment === 'dark');

            return theme ? token.name.replace(`-${theme}-`, '-') : token.name;
        }
    });

    StyleDictionary.registerTransformGroup({
        name: 'kbq/css-extended',
        transforms: [
            'attribute/cti',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'shadow/css/shorthand',
            'name/custom-kebab',
            'name/without-theme-segment'
        ]
    });
};
