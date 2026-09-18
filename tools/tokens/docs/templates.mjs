import { CUSTOM_HEADER, NO_HEADER } from './config.mjs';
import { capitalize } from './utils.mjs';

export const simpleMapToken = ({ name }) => `--${name}`;

export const simpleMapTypography = (token) => token.attributes.type;

export const simpleMapColors = ([type, tokens]) => {
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

export const getTokensOverviewData = ({ allTokens }) =>
    `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify([simpleMapColors([NO_HEADER, allTokens])])};\n`;
