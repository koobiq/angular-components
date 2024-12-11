const { LINE_SEP } = require('./config');

const descriptionTemplate = (token) =>
    `<div class="kbq-design-token-example__value kbq-mono-normal">${token.value}</div>`;

const varTypographyTemplate = (token) =>
    `<div class="kbq-design-token-example__var"><code kbq-code-snippet style="cursor: pointer">.kbq-${token.attributes.type}</code></div>`;

const defaultVarTemplate = (token) =>
    `<div class="kbq-design-token-example__var"><code kbq-code-snippet style="cursor: pointer">--${token.name}</code>${descriptionTemplate(token)}</div>`;

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example__dimensions" style="${designToken}"></div>`;

const shadowsTemplate = (designToken) => `<div class="kbq-design-token-example__shadows" style="${designToken}"></div>`;

const sizesTemplate = (designToken) => {
    const varTemplate = `var(--${designToken.name})`;
    return `<div class="kbq-design-token-example__sizes" style="width: ${varTemplate};"></div>`;
};

const exampleTypographyTemplate = (typographyType) => {
    const typographyTypeOutput = typographyType
        .split('-')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
    return `<div class="kbq-design-token-example__typography kbq-${typographyType}">${typographyTypeOutput}</div>`;
};

module.exports = {
    descriptionTemplate,
    defaultVarTemplate,
    varTypographyTemplate,
    exampleTemplate,
    outputTable: (tokens) => {
        return (
            `| | Токен | Значение |\r\n| :--- | :---| :---|\r\n` +
            tokens
                .map(({ example, varSnippet, description }) => {
                    return `| ${example} | ${varSnippet} | ${description} |`;
                })
                .join(LINE_SEP)
        );
    },

    outputTypographyTable: (tokens) => {
        return `<table id="base-typography-table">
                    <tbody>
                        ${tokens
                            .map(({ example, varSnippet }) => {
                                return `<tr>
                                        <td align="left">${example}</td>
                                        <td align="left" style="vertical-align: bottom">${varSnippet}</td>
                                    </tr>`;
                            })
                            .join(LINE_SEP)}
                    </tbody>
             </table>`;
    },

    mapColors: (token) => ({
        varSnippet: defaultVarTemplate(token),
        example: exampleTemplate(`background-color: var(--${token.name})`),
        description: descriptionTemplate(token)
    }),

    mapTypography: (token) => ({
        varSnippet: varTypographyTemplate(token),
        example: exampleTypographyTemplate(token.attributes.type)
    }),

    mapGlobals: (token) => ({
        varSnippet: defaultVarTemplate(token),
        example: sizesTemplate(token),
        description: descriptionTemplate(token)
    }),

    mapBorderRadius: (token) => ({
        varSnippet: defaultVarTemplate(token),
        example: exampleTemplate(`border-radius: var(--${token.name});`),
        description: descriptionTemplate(token)
    }),

    mapShadows: (token) => ({
        varSnippet: defaultVarTemplate(token),
        example: shadowsTemplate(`box-shadow: var(--${token.name});`),
        description: descriptionTemplate(token)
    })
};
