import { DocsNextLocale } from '../data/site';
import { DocsNextContentBlock } from '../services/content';

const SECTIONS: Record<DocsNextLocale, { component: string[]; page: string[]; text: string[] }> = {
    ru: {
        component: ['Когда использовать', 'Варианты', 'Размеры', 'Состояния', 'Поведение', 'Доступность'],
        page: ['Основное', 'Как использовать', 'Подготовка', 'Настройка', 'Подробности'],
        text: [
            'Текст временный, его заменит настоящая статья. Сейчас страница показывает структуру и оформление.',
            'Начните с базовой настройки, затем переходите к деталям. Большинству проектов хватает значений по умолчанию.',
            'Здесь описаны редкие случаи, ограничения и ответы на частые вопросы.'
        ]
    },
    en: {
        component: ['When to use', 'Variants', 'Sizes', 'States', 'Behavior', 'Accessibility'],
        page: ['Overview', 'How to use', 'Preparation', 'Configuration', 'Details'],
        text: [
            'This text is temporary and the real article replaces it. For now the page shows the structure and the look.',
            'Start with the basic setup, then go into the details. Most projects are fine with the defaults.',
            'Rare cases, limitations and answers to common questions go here.'
        ]
    }
};

/**
 * Article of a page that has no text in the prototype yet, with headings of two levels so the table of contents has
 * something to show. A component article follows the order of the prototype in the spec: example, when to use,
 * variants, behavior, accessibility (spec/components/subsection-overview.md).
 */
export const docsNextPlaceholderArticle = (locale: DocsNextLocale, isComponent: boolean): DocsNextContentBlock[] => {
    const { component, page, text } = SECTIONS[locale];
    const headings = isComponent ? component : page;
    const nested = [2, 3];
    const html = headings
        .map((heading, index) => {
            const tag = nested.includes(index) ? 'h3' : 'h2';
            const id = heading.toLowerCase().replace(/\s/g, '-');

            return `<${tag} class="kbq-markdown__${tag}" id="${id}">${heading}</${tag}><p class="kbq-markdown__p">${text[index % text.length]}</p>`;
        })
        .join('');
    const lead = `<p class="kbq-markdown__p">${locale === 'ru' ? 'Короткое описание страницы, до 150 знаков.' : 'A short description of the page, up to 150 characters.'}</p>`;

    return isComponent
        ? [
              { kind: 'html', html: lead },
              { kind: 'example', id: 'overview', title: locale === 'ru' ? 'Пример' : 'Example', files: [] },
              { kind: 'html', html }
          ]
        : [{ kind: 'html', html: lead + html }];
};

/**
 * Takes the first paragraph of an article out as its description, shown under the title (spec/page-description.md).
 */
export const docsNextSplitLead = (
    blocks: DocsNextContentBlock[]
): { lead: string | null; blocks: DocsNextContentBlock[] } => {
    const [first, ...rest] = blocks;
    const match = first?.kind === 'html' ? /^<p[^>]*>([\s\S]*?)<\/p>/.exec(first.html) : null;

    if (!match || first.kind !== 'html') return { lead: null, blocks };

    const remainder = first.html.slice(match[0].length);

    return { lead: match[1], blocks: remainder ? [{ kind: 'html', html: remainder }, ...rest] : rest };
};
