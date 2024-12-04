const { LINE_SEP } = require('./config');

const descriptionTemplate = (name, description = '') => {
    if (description) {
        return `<div class="kbq-text-big-strong layout-margin-bottom-l">${name}</div> <div class="kbq-text-normal">${description}</div>`;
    }

    return `<div class="kbq-text-big-strong layout-margin-bottom-l">${name}</div>`;
};

const varTemplate = (designToken) => '```' + `--${designToken}` + '```';

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example__dimensions" style="${designToken}"></div>`;

const varTypographyTemplate = (name) => `class="kbq-${name}"`;

const exampleTypographyTemplate = (typographyType) => {
    return `<div class="kbq-${typographyType}">${typographyType}</div>`;
};

module.exports = {
    descriptionTemplate,
    varTemplate,
    exampleTemplate,
    outputTable: (tokens) => {
        return (
            '| Example | Description | Var |\r\n| :--- | :---| :---|\r\n' +
            tokens
                .map(({ example, varSnippet, description }) => {
                    return `| ${example} | ${description} | ${varSnippet} |`;
                })
                .join(LINE_SEP)
        );
    },

    mapToken: (token) => ({
        varSnippet: varTemplate(token.name),
        example: exampleTemplate(`background-color: var(--${token.name})`),
        description: descriptionTemplate(token.name, token.description)
    }),

    mapTypography: (token) => ({
        varSnippet: varTypographyTemplate(token.attributes.type),
        example: exampleTypographyTemplate(token.attributes.type),
        description: descriptionTemplate(token.attributes.type, token.description)
    }),

    mapGlobals: (token) => ({
        varSnippet: varTemplate(token.name),
        example: exampleTemplate(`width: var(--${token.name}); height: var(--${token.name});`),
        description: descriptionTemplate(token.name, token.description)
    }),

    mapBorderWidth: (token) => ({
        varSnippet: varTemplate(token.name),
        example: exampleTemplate(`border: var(--${token.name}) solid black;`),
        description: descriptionTemplate(token.name, token.description)
    }),

    mapBorderRadius: (token) => ({
        varSnippet: varTemplate(token.name),
        example: exampleTemplate(`border-radius: var(--${token.name});`),
        description: descriptionTemplate(token.name, token.description)
    }),

    mapShadows: (token) => ({
        varSnippet: varTemplate(token.name),
        example: exampleTemplate(`box-shadow: var(--${token.name});`),
        description: descriptionTemplate(token.name, token.description)
    })
};
