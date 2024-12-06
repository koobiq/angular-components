const { LINE_SEP } = require('./config');

const descriptionTemplate = (token) => `<div class="kbq-text-normal layout-margin-bottom-l">${token.value}</div>`;

const varTemplate = (designToken) => `<code kbq-code-snippet style="cursor: pointer">${designToken}</code>`;

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example__dimensions" style="${designToken}"></div>`;

const sizesTemplate = (designToken) => {
    const varTemplate = `var(--${designToken.name})`;
    const styles = designToken.attributes.type.includes('border-width')
        ? `border: ${varTemplate} solid black;`
        : `width: ${varTemplate}; height: ${varTemplate};`;
    return `<div class="kbq-design-token-example__dimensions" style="${styles}"></div>`;
};

const exampleTypographyTemplate = (typographyType) => {
    return `<div class="kbq-design-token-example__typography kbq-${typographyType}">${typographyType}</div>`;
};

module.exports = {
    descriptionTemplate,
    varTemplate,
    exampleTemplate,
    outputTable: (type, tokens) => {
        return (
            `| ${type} | Токен | Значение |\r\n| :--- | :---| :---|\r\n` +
            tokens
                .map(({ example, varSnippet, description }) => {
                    return `| ${example} | ${varSnippet} | ${description} |`;
                })
                .join(LINE_SEP)
        );
    },

    outputTypographyTable: (tokens) => {
        return `<table class="kbq-markdown__table">
                    <tbody class="kbq-markdown__tbody">
                                ${tokens
                                    .map(({ example, varSnippet }) => {
                                        return `<tr class="kbq-markdown__tr">
                                                <td align="left" class="kbq-markdown__td">${example}</td>
                                                <td align="left" class="kbq-markdown__td">${varSnippet}</td>
                                            </tr>`;
                                    })
                                    .join(LINE_SEP)}
                    </tbody>
             </table>`;
    },

    mapColors: (token) => ({
        varSnippet: varTemplate(`--${token.name}`),
        example: exampleTemplate(`background-color: var(--${token.name})`),
        description: descriptionTemplate(token)
    }),

    mapTypography: (token) => ({
        varSnippet: varTemplate(`.kbq-${token.attributes.type}`),
        example: exampleTypographyTemplate(token.attributes.type)
    }),

    mapGlobals: (token) => ({
        varSnippet: varTemplate(`--${token.name}`),
        example: sizesTemplate(token),
        description: descriptionTemplate(token)
    }),

    mapBorderWidth: (token) => ({
        varSnippet: varTemplate(`--${token.name}`),
        example: exampleTemplate(`border: var(--${token.name}) solid black;`),
        description: descriptionTemplate(token)
    }),

    mapBorderRadius: (token) => ({
        varSnippet: varTemplate(`--${token.name}`),
        example: exampleTemplate(`border-radius: var(--${token.name});`),
        description: descriptionTemplate(token)
    }),

    mapShadows: (token) => ({
        varSnippet: varTemplate(`--${token.name}`),
        example: exampleTemplate(`box-shadow: var(--${token.name});`),
        description: descriptionTemplate(token)
    })
};
