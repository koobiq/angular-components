module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        type: 'name',
        name: `name/themeable-token`,
        transformer: (token) => token.name.replace(/(light|dark)-/, '')
    });
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css-extended',
        transforms: [
            'attribute/cti',
            'kbq-attribute/palette',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'name/cti/kebab',
            'color/css',
            'kbq/prefix',
            'name/themeable-token'
        ]
    });
};
