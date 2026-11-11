import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-header example: a cube-building rhyme and the demo labels. */
export interface ExampleText {
    intro: string;
    dtYellow: string;
    ddSand: string;
    dtGreen: string;
    ddForest: string;
    dtMany: string;
    ddMany: string;
    dtFloor: string;
    ddBadge: string;
    dtStacked: string;
    ddAlive: string;
    dtAdults: string;
    ddDream: string;
    close: string;
    popoverTitle: string;
    onlyHeader: string;
    onlyFooter: string;
    plain: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        intro: 'Жёлтые кубики — это песок, кубик зелёный — весенний лесок, синие кубики — это река. Кубиков много — река широка. Кубик на кубик — растут этажи: учатся строить UI малыши.',
        dtYellow: 'Желтые кубики',
        ddSand: 'Песок',
        dtGreen: 'Кубик Зеленый',
        ddForest: 'Весенний лесок',
        dtMany: 'Кубиков много',
        ddMany: 'Река широка Кубик на кубик Растут этажи',
        dtFloor: 'Кубик на кубик',
        ddBadge: 'Растут этажи',
        dtStacked: 'Кубики вместе сложились',
        ddAlive: 'И сайт оживает',
        dtAdults: 'Взрослые мир создают',
        ddDream: 'О котором мечтают',
        close: 'Закрыть',
        popoverTitle: 'Заголовок поповера',
        onlyHeader: 'Только с шапкой',
        onlyFooter: 'Только с футером',
        plain: 'Без хедера и футера'
    },
    default: {
        intro: 'Yellow cubes are sand, a green cube is a spring forest, blue cubes are a river. Many cubes — a wide river. Cube on cube — the floors grow: little ones learn to build UI.',
        dtYellow: 'Yellow cubes',
        ddSand: 'Sand',
        dtGreen: 'Green cube',
        ddForest: 'Spring forest',
        dtMany: 'Many cubes',
        ddMany: 'Wide river, cube on cube, floors grow',
        dtFloor: 'Cube on cube',
        ddBadge: 'Floors grow',
        dtStacked: 'Cubes stacked together',
        ddAlive: 'And the site comes alive',
        dtAdults: 'Adults create the world',
        ddDream: 'That children dream of',
        close: 'Close',
        popoverTitle: 'Popover title',
        onlyHeader: 'Header only',
        onlyFooter: 'Footer only',
        plain: 'No header or footer'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
