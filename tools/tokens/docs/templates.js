const { LINE_SEP, NO_HEADER } = require('./config');
const { capitalize } = require('./utils');

const descriptionTemplate = (token) =>
    `<div class="kbq-design-token-example__value kbq-mono-normal">${token.value}</div>`;

const defaultVarTemplate = (token) =>
    `<div class="kbq-design-token-example__var"><code kbq-code-snippet style="cursor: pointer">--${token.name}</code>${descriptionTemplate(token)}</div>`;

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example__dimensions" style="${designToken}"></div>`;

const varTypographyTemplate = (token) =>
    `<div class="kbq-design-token-example__var"><code kbq-code-snippet style="cursor: pointer">.kbq-${token.attributes.type}</code></div>`;

const shadowsTemplate = (designToken) => `<div class="kbq-design-token-example__shadows" style="${designToken}"></div>`;

const sizesTemplate = (designToken) => {
    const varTemplate = `var(--${designToken.name})`;
    return `<div class="kbq-design-token-example__sizes" style="width: ${varTemplate};"></div>`;
};

const exampleTypographyTemplate = (typographyType) => {
    const typographyTypeOutput = capitalize(typographyType, { separator: '-' });
    return `<div class="kbq-design-token-example__typography kbq-${typographyType}">${typographyTypeOutput}</div>`;
};

const outputTable = (tokens) => {
    return (
        `| | Токен | Значение |\r\n| :--- | :---| :---|\r\n` +
        tokens
            .map(({ example, varSnippet, description }) => {
                return `| ${example} | ${varSnippet} | ${description} |`;
            })
            .join(LINE_SEP)
    );
};

const mapColor = (token) => ({
    varSnippet: defaultVarTemplate(token),
    example: exampleTemplate(`background-color: var(--${token.name})`),
    description: descriptionTemplate(token)
});

const mapColors = ([type, tokens]) => {
    const output = {
        type: capitalize(type)
    };
    if (Array.isArray(tokens)) {
        output.tokens = tokens.map(mapColor);
        return output;
    }
    output.sections = Object.entries(tokens).map(mapColors);
    return output;
};

const outputPage = (headerLevel, pageInfo) =>
    pageInfo.map(({ type, tokens, sections }) => {
        // Create a markdown header level string (e.g., '##' for headerLevel 2).
        const markdownLevel = Array.from({ length: headerLevel }, () => '#').join('');
        if (tokens && tokens.length) {
            const header = type.toLowerCase() === NO_HEADER ? '' : `${markdownLevel} ${type}${LINE_SEP}`;
            return `${header}${outputTable(tokens)}${LINE_SEP}`;
        }
        if (sections && sections.length) {
            return `${markdownLevel} ${type}${LINE_SEP}` + outputPage(headerLevel + 1, sections).join(LINE_SEP);
        }
    });

module.exports = {
    descriptionTemplate,
    defaultVarTemplate,
    varTypographyTemplate,
    exampleTemplate,
    outputTable,
    mapColor,
    mapColors,
    outputPage,

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

    mapPalette: (token) => ({
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
