const { LINE_SEP, NO_HEADER, TYPOGRAPHY_TABLE_ID } = require('./config');
const { capitalize } = require('./utils');

const descriptionTemplate = (token) =>
    `<div class="kbq-design-token-example__value kbq-mono-normal">${token.value}</div>`;

const defaultVarTemplate = (token) =>
    `<div class="kbq-design-token-example__var"><code docsCodeSnippet>--${token.name}</code>${descriptionTemplate(token)}</div>`;

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example__dimensions" style="${designToken}"></div>`;

const varTypographyTemplate = (token) => `<code docsCodeSnippet>kbq-${token.attributes.type}</code>`;

const shadowsTemplate = (designToken) => `<div class="kbq-design-token-example__shadows" style="${designToken}"></div>`;

const sizesTemplate = (designToken) => {
    const varTemplate = `var(--${designToken.name})`;

    return `<div class="kbq-design-token-example__sizes" style="width: ${varTemplate};"></div>`;
};

const simpleExampleTypographyTemplate = (typographyType) => {
    const typographyTypeOutput = capitalize(typographyType, { separator: '-' });

    return `<div class="kbq-${typographyType}">${typographyTypeOutput}</div>`;
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
    simpleExampleTypographyTemplate,
    exampleTemplate,
    outputTable,
    mapColor,
    mapColors,
    outputPage,

    outputTypographyTable: (tokens) => {
        return `<table id="${TYPOGRAPHY_TABLE_ID}">
                    <thead>
                       <tr>
                            <th>Typography Example</th>
                            <th>CSS Class Name</th>
                       </tr>
                    </thead>
                    <tbody>
                        ${tokens
                            .map(({ example, varSnippet }) => {
                                return `<tr>
                                            <td>${example}</td>
                                            <td>${varSnippet}</td>
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
        example: simpleExampleTypographyTemplate(token.attributes.type)
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
