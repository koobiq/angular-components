import { expand } from './glossary.js';

/**
 * How a query is turned into terms and scored against a value.
 *
 * Shared by `search` and `which_component_when` on purpose. Two matchers over the same vocabulary
 * drift: one learns that Russian inflects and the other does not, and the difference shows up as
 * one tool finding what the other cannot.
 */

/** Share of the best hit's score a result must reach to be worth showing at all. */
export const FLOOR = 0.2;

/** Values are keyed on hyphens: `trash_16` and `Trash 16` both become `trash-16`. */
export const normalize = (value: string): string => value.toLowerCase().replace(/[_\s]+/g, '-');

/**
 * A query splits on whitespace and punctuation; a hyphen or underscore inside a word does not
 * split it, so `kbq-alert` stays one token while `внешняя ссылка` becomes two.
 *
 * Normalising the query the same way as a value is what broke this before: spaces became hyphens
 * and the hyphen was not a separator, so every multi-word query collapsed into one unmatchable
 * token. It only ever looked right because the queries being tested — `background error`,
 * `validation on submit` — happened to spell hyphenated identifiers.
 */
export const terms = (query: string): string[] =>
    query
        .toLowerCase()
        .split(/[^\p{L}\p{N}_-]+/u)
        .map((term) => term.replace(/^[-_]+|[-_]+$/g, '').replace(/_/g, '-'))
        .filter((term) => term.length > 1);

/**
 * Two words that differ only in their ending.
 *
 * Russian inflects: a person types «иконка корзины» and the icon is tagged «корзина». Neither
 * contains the other, so every substring test misses, and the query returns nothing at all. A
 * stemmer for one language is more machinery than this earns — allowing the last couple of
 * characters to differ covers the cases that actually come up.
 *
 * The allowance grows with the word, because the endings do: `корзина`/`корзины` differ by one
 * letter, while `редактировать`/`редактирование` differ by four and are plainly the same request.
 * A flat limit of two either misses the second pair or lets through the first kind of mistake.
 *
 * The floor is what keeps it honest: `список` and `списать` share four characters and must not
 * match, so at least five have to agree whatever the length.
 */
const sharesStem = (a: string, b: string): boolean => {
    const shortest = Math.min(a.length, b.length);

    if (shortest < 6) return false;

    let common = 0;

    while (common < shortest && a[common] === b[common]) common++;

    return common >= 5 && common >= shortest - Math.max(2, Math.floor(shortest / 4));
};

/** 0 when nothing matches. Exact name beats prefix beats substring; keyword hits score lowest. */
const scoreWord = (term: string, name: string, keywords: string[]): number => {
    if (name === term) return 10;
    if (name.startsWith(term)) return 6;
    if (name.includes(term)) return 4;
    if (keywords.some((keyword) => keyword === term)) return 3.5;
    if (keywords.some((keyword) => keyword.includes(term))) return 1.5;
    if (sharesStem(term, name)) return 3;
    if (keywords.some((keyword) => sharesStem(term, keyword))) return 1.2;

    return 0;
};

/**
 * The best a term can do, counting the English words it might stand for.
 *
 * Discounted, because a translation is a guess about intent while the word itself is not: `shadow`
 * reached through «тень» must never outrank a result that actually says «тень».
 */
const scoreOne = (term: string, name: string, keywords: string[]): number => {
    const [self, ...translations] = expand(term);

    let best = scoreWord(self!, name, keywords);

    for (const word of translations) best = Math.max(best, scoreWord(word, name, keywords) * 0.8);

    return best;
};

/**
 * Partial matches are kept, ranked strictly below complete ones.
 *
 * A missing term used to zero the whole hit. That reads as precision and behaves as silence: of
 * thirteen questions a person would plausibly ask, five returned nothing — «всплывающая подсказка»
 * found no tooltip, «тень для оверлея» found no shadow token — because one word of the phrase
 * appears nowhere in the index. Silence is the worst answer available, since an agent cannot tell
 * it from "no such thing exists".
 *
 * Coverage multiplies the average rather than gating it, so a hit matching every term keeps exactly
 * the score it had before and a hit matching one term of three lands near a ninth of it.
 */
export const score = (
    query: string[],
    name: string,
    keywords: string[],
    /** Per-term multiplier; see `rarity`. Absent means every term counts the same. */
    weights?: Map<string, number>
): number => {
    let total = 0;
    let matched = 0;

    for (const term of query) {
        const hit = scoreOne(term, name, keywords);

        if (hit > 0) {
            matched++;
            total += hit * (weights?.get(term) ?? 1);
        }
    }

    if (matched === 0) return 0;

    return (total / query.length) * (matched / query.length);
};

/**
 * How much a term says, measured against the collection it is being matched in.
 *
 * "free-form values the user types" has two words that narrow it — `free-form` appears in one row
 * of the guide — and two that do not: `user` and `types` are in a dozen. Counting all four equally
 * ties the row that answers the question against one that merely shares its filler, and the tie
 * then falls to whichever was written first.
 *
 * Deliberately gentle. A term present everywhere still counts for something, because a question
 * made entirely of common words still has to be answered.
 */
export const rarity = (query: string[], documents: string[]): Map<string, number> => {
    const weights = new Map<string, number>();

    for (const term of query) {
        const seen = documents.filter((document) => document.includes(term)).length;

        weights.set(term, 1 + Math.log((documents.length + 1) / (seen + 1)) / 3);
    }

    return weights;
};
