const { capitalize } = require('./utils');
const { CUSTOM_HEADER, NO_HEADER } = require('./config');

const getTokensOverviewData = ({ allTokens }) => {
    return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify([simpleMapColors([NO_HEADER, allTokens])])};\n`;
};

const simpleMapTypography = (token) => token.attributes.type;

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
    simpleMapTypography,
    getTokensOverviewData
};
