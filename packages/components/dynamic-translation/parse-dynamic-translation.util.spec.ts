import { TemplateRef } from '@angular/core';

import { TranslationSlotTypes } from '../types';

import { parseDynamicTranslation } from './parse-dynamic-translation.util';

describe('parse-dynamic-translation.util.ts', () => {
    describe('parseDynamicTranslation', () => {
        it('должен возвращать текст без слотов как один элемент', () => {
            const text = 'Просто текст без слотов';
            const slotTemplates = {};

            const result = parseDynamicTranslation(text, slotTemplates);

            expect(result).toEqual([{ type: TranslationSlotTypes.Text, text, template: null }]);
        });

        it('должен корректно разбирать один слот', () => {
            const text = 'До слота [[name:test name]] после слота';
            const slotTemplates = { name: '<span>{{ $implicit }}</span>' as unknown as TemplateRef<unknown> };

            const result = parseDynamicTranslation(text, slotTemplates);

            expect(result).toEqual([
                { type: TranslationSlotTypes.Text, text: 'До слота ', template: null },
                {
                    type: TranslationSlotTypes.Slot,
                    template: '<span>{{ $implicit }}</span>',
                    context: { $implicit: 'test name' }
                },
                { type: TranslationSlotTypes.Text, text: ' после слота', template: null }
            ]);
        });

        it('должен корректно разбирать несколько слотов', () => {
            const text = '[[name:Петя]] и [[city:Вася]]';
            const slotTemplates = {
                name: '<b>{{ $implicit }}</b>' as unknown as TemplateRef<unknown>,
                city: '<i>{{ $implicit }}</i>' as unknown as TemplateRef<unknown>
            };

            const result = parseDynamicTranslation(text, slotTemplates);

            expect(result).toEqual([
                { type: TranslationSlotTypes.Slot, template: '<b>{{ $implicit }}</b>', context: { $implicit: 'Петя' } },
                { type: TranslationSlotTypes.Text, text: ' и ', template: null },
                {
                    type: TranslationSlotTypes.Slot,
                    template: '<i>{{ $implicit }}</i>',
                    context: { $implicit: 'Вася' }
                }
            ]);
        });

        it('должен корректно разбирать список значений в слоте', () => {
            const text = 'Любимый продукт во ВкуссВилл: [[options:(манго,груша,персик)]]';
            const slotTemplates = { options: '<ul>{{ $implicit }}</ul>' as unknown as TemplateRef<unknown> };

            const result = parseDynamicTranslation(text, slotTemplates);

            expect(result).toEqual([
                { type: TranslationSlotTypes.Text, text: 'Любимый продукт во ВкуссВилл: ', template: null },
                {
                    type: TranslationSlotTypes.Slot,
                    template: '<ul>{{ $implicit }}</ul>',
                    context: { $implicit: ['манго', 'груша', 'персик'] }
                }
            ]);
        });

        it('должен корректно обрабатывать текст с круглыми скобками в слоте', () => {
            const text = 'System.out.[[greeting:println("Hello World")]]';
            const slotTemplates = { greeting: '<p>{{ $implicit }}</p>' as unknown as TemplateRef<unknown> };

            const result = parseDynamicTranslation(text, slotTemplates);

            expect(result).toEqual([
                { type: TranslationSlotTypes.Text, text: 'System.out.', template: null },
                {
                    type: TranslationSlotTypes.Slot,
                    template: '<p>{{ $implicit }}</p>',
                    context: { $implicit: 'println("Hello World")' }
                }
            ]);
        });
    });
});
