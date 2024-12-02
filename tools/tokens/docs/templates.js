const { LINE_SEP } = require('./config');

const descriptionTemplate = (name, description = '') =>
    `<h5 class="kbq-text-big-strong layout-margin-bottom-l">${name}</h5> <p class="kbq-text-normal">${description}</p>`;

const varTemplate = (designToken) => `<code class="kbq-markdown__code">${designToken}</code>`;

const exampleTemplate = (designToken) =>
    `<div class="kbq-design-token-example kbq-design-token-example__colors" style="${designToken}"></div>`;

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
        example: exampleTemplate(`var(--${token.name})`),
        description: descriptionTemplate(token.name, token.description)
    })
};
