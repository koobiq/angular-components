const { capitalize } = require('./utils');

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
    simpleMapTypography
};
