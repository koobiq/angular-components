module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        type: 'name',
        name: `name/themeable-token`,
        transformer: (token) => {
            if (['plt', 'semantic'].includes(token.attributes.category)) return token.name;

            return token.name.replace(/(light|dark)-/, '');
        }
    });
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css-extended',
        transforms: [
            'attribute/cti',
            'kbq-attribute/palette',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'name/custom-kebab',
            'color/css',
            'kbq/prefix',
            'name/themeable-token'
        ]
    });
};
