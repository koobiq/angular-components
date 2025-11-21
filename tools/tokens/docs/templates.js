const { LINE_SEP, TYPOGRAPHY_TABLE_ID } = require('./config');
const { capitalize } = require('./utils');

const varTypographyTemplate = (token) => `<code docsCodeSnippet>kbq-${token.attributes.type}</code>`;

const simpleExampleTypographyTemplate = (typographyType) => {
    const typographyTypeOutput = capitalize(typographyType, { separator: '-' });

    return `<div class="kbq-${typographyType}">${typographyTypeOutput}</div>`;
};

const simpleMapToken = ({ name }) => `--${name}`;

const simpleMapColors = ([type, tokens]) => {
    const output = {
        type: capitalize(type)
    };

    if (Array.isArray(tokens)) {
        output.tokens = tokens.map(simpleMapToken);

        return output;
    }

    output.sections = Object.entries(tokens).map(simpleMapColors);

    return output;
};

module.exports = {
    simpleMapToken,
    simpleMapColors,

    mapTypography: (token) => ({
        varSnippet: varTypographyTemplate(token),
        example: simpleExampleTypographyTemplate(token.attributes.type)
    }),

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
    }
};
