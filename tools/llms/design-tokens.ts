import { docsData as borderRadius } from '../../apps/docs/src/app/components/design-tokens-viewers/data/border-radius';
import { docsData as colors } from '../../apps/docs/src/app/components/design-tokens-viewers/data/colors';
import { docsData as palette } from '../../apps/docs/src/app/components/design-tokens-viewers/data/palette';
import { docsData as semantic } from '../../apps/docs/src/app/components/design-tokens-viewers/data/semantic';
import { docsData as shadows } from '../../apps/docs/src/app/components/design-tokens-viewers/data/shadows';
import { docsData as sizes } from '../../apps/docs/src/app/components/design-tokens-viewers/data/sizes';
import { docsData as typography } from '../../apps/docs/src/app/components/design-tokens-viewers/data/typography';
import { DOCS_TRANSLATIONS } from '../../apps/docs/src/app/services/i18n';

/**
 * A group of tokens under the heading the design tokens page gives it; `No-header` groups have none. A group holds
 * its tokens either directly or in sections of its own, such as the states of Colors.
 */
type TokenGroup = { type: string; tokens?: string[]; sections?: TokenGroup[] };

const NO_HEADER = 'No-header';

const INTRODUCTION =
    'The global design tokens of Koobiq: CSS custom properties that the light and the dark theme define. Style with them instead of hard-coded values, for example `color: var(--kbq-foreground-contrast)`. Colors lists the themed colors; the two palettes list the color scales behind them.';

const TYPOGRAPHY_INTRODUCTION = 'CSS classes of the text styles, for example `<p class="kbq-text-normal">`:';

const renderNames = (names: string[]): string => names.map((name) => `\`${name}\``).join(', ');

const renderGroups = (groups: TokenGroup[], depth: number): string =>
    groups
        .map(({ type, tokens, sections }) => {
            const content = sections ? renderGroups(sections, depth + 1) : renderNames(tokens ?? []);

            return type === NO_HEADER ? content : `${'#'.repeat(depth)} ${type}\n\n${content}`;
        })
        .join('\n\n');

/** The design tokens page as Markdown: its tabs are sections of the given depth, titled as the page titles them. */
export const renderDesignTokens = (depth: number): string => {
    const section = '#'.repeat(depth);
    const sections: [string, string][] = [
        [DOCS_TRANSLATIONS.tokensTabColors.en, renderGroups(colors, depth + 1)],
        [
            DOCS_TRANSLATIONS.tokensTabTypography.en,
            `${TYPOGRAPHY_INTRODUCTION}\n\n${renderNames(typography.map((name) => `kbq-${name}`))}`
        ],
        [DOCS_TRANSLATIONS.tokensTabShadows.en, renderGroups(shadows, depth + 1)],
        [DOCS_TRANSLATIONS.tokensTabBorderRadius.en, renderGroups(borderRadius, depth + 1)],
        [DOCS_TRANSLATIONS.tokensTabSizes.en, renderGroups(sizes, depth + 1)],
        [DOCS_TRANSLATIONS.tokensTabPalette.en, renderGroups(palette, depth + 1)],
        [DOCS_TRANSLATIONS.tokensTabSemantic.en, renderGroups(semantic, depth + 1)]
    ];

    return [INTRODUCTION, ...sections.map(([title, body]) => `${section} ${title}\n\n${body}`)].join('\n\n');
};
