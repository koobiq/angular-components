export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        type: 'name',
        name: 'name/themeable-token',
        // `name/custom-kebab` drops the theme only where it is the leading path segment, which
        // covers the colours (`light.background.bg`) but not the shadows (`shadow.light.card`).
        // The theme has to be a whole segment: matching `light-` anywhere also finds it inside a
        // word, turning `states-background-highlight-current` into `states-background-highcurrent`.
        transform: (token) => {
            if (['plt', 'semantic'].includes(token.attributes.category)) return token.name;

            return token.name.replace(/(^|-)(?:light|dark)-/, '$1');
        }
    });

    StyleDictionary.registerTransformGroup({
        name: 'kbq/css-extended',
        // `kbq/css` without `shadow/css/shorthand` and `kbq-attribute/comment`: the docs data is
        // a list of variable names, so neither the rendered value nor its comment is read.
        // `kbq-attribute/palette` and `kbq/prefix` went away in @koobiq/tokens-builder v4 —
        // nothing here used the `palette` attribute, and the prefix now comes from the platform.
        transforms: [
            'attribute/cti',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'name/custom-kebab',
            'name/themeable-token'
        ]
    });
};
