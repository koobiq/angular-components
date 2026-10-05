/**
 * Russian words for things the data only names in English.
 *
 * Not a translation layer and not a substitute for one. Two sources carry no Russian at all and
 * never will: design tokens are `--kbq-shadow-outline`, and entry points are `tree-select`. A
 * question like «тень для оверлея» therefore matches nothing, however good the ranking is —
 * there is no Russian anywhere for it to match.
 *
 * Icon tags are different: they are authored, bilingual, and incomplete. Nothing in 11.7.1 is
 * tagged «корзина», though that is what a Russian speaker calls the trash icon — its tags are
 * `удалить`, `убрать`, `мусор`. Entries here paper over that, but the real fix is upstream, in the
 * tags themselves; see TODO.md.
 *
 * Deliberately short. Every entry is a guess about what someone meant, and a long list of guesses
 * is how a search starts confidently answering the wrong question.
 */
const GLOSSARY: Record<string, string[]> = {
    // Token categories
    тень: ['shadow'],
    фон: ['background', 'bg'],
    граница: ['border'],
    обводка: ['outline', 'border'],
    текст: ['foreground', 'text'],
    цвет: ['color'],
    отступ: ['padding', 'margin', 'spacing'],
    размер: ['size'],
    скругление: ['radius'],
    радиус: ['radius'],
    шрифт: ['font', 'typography'],
    прозрачность: ['opacity', 'alpha'],

    // States and intents
    ошибка: ['error'],
    предупреждение: ['warning'],
    успех: ['success'],
    отключено: ['disabled'],
    наведение: ['hover'],
    фокус: ['focus'],

    // Verbs, because component names are English: «редактировать значение на месте» has to reach
    // `inline-edit`, and no amount of ranking gets there from a Russian verb on its own.
    редактировать: ['edit'],
    редактирование: ['edit'],
    изменить: ['edit', 'change'],
    сохранить: ['save'],
    подтвердить: ['confirm', 'acknowledge'],
    удалить: ['delete', 'remove', 'trash'],
    выбрать: ['select', 'pick'],
    выбор: ['select'],
    добавить: ['add'],
    искать: ['search'],
    фильтровать: ['filter'],

    // Things on a page
    оверлей: ['overlay'],
    кнопка: ['button'],
    ссылка: ['link'],
    поле: ['field', 'input'],
    список: ['list'],
    таблица: ['table'],
    вкладка: ['tabs'],
    модальное: ['modal'],
    окно: ['modal'],
    подсказка: ['tooltip', 'popover'],
    уведомление: ['toast', 'notification'],
    панель: ['panel', 'sidebar'],
    иконка: ['icon'],
    значок: ['icon', 'badge'],
    дерево: ['tree'],
    флажок: ['checkbox'],
    переключатель: ['toggle', 'radio'],
    загрузка: ['loader', 'progress', 'upload'],
    корзина: ['trash', 'delete'],
    поиск: ['search'],
    фильтр: ['filter'],
    меню: ['dropdown', 'menu'],
    выпадающий: ['dropdown', 'select']
};

const KEYS = Object.keys(GLOSSARY);

/**
 * `оверлея` has to find `оверлей`, so lookup tolerates a different ending.
 *
 * The same rule the search itself uses for inflection, applied to a list of forty words rather
 * than to the whole index — scanning it is cheaper than keeping declension tables.
 */
const lookup = (term: string): string[] | undefined => {
    const exact = GLOSSARY[term];

    if (exact) return exact;
    if (term.length < 6) return undefined;

    for (const key of KEYS) {
        const shortest = Math.min(key.length, term.length);

        if (shortest < 6) continue;

        let common = 0;

        while (common < shortest && key[common] === term[common]) common++;

        if (common >= 5 && common >= shortest - 2) return GLOSSARY[key];
    }

    return undefined;
};

/** The term itself first, so an exact match always outranks anything reached through here. */
export const expand = (term: string): string[] => [term, ...(lookup(term) ?? [])];

/**
 * A compound word's parts, for matching prose rather than identifiers.
 *
 * Used only where the text being searched is a sentence. In an identifier a hyphen belongs to the
 * name — `kbq-alert`, `tree-select`, `trash_16` — and splitting it yields `kbq`, which is the
 * prefix of every symbol in the library and matches all 1420 of them equally. In a description of
 * a task the hyphen joins two ordinary words, and `multi-select` has to reach `select`.
 */
export const compoundParts = (term: string): string[] =>
    term.includes('-') ? term.split('-').filter((part) => part.length > 3) : [];
