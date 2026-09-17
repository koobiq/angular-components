import { kbqGetTextQuery } from './text-query';

describe('kbqGetTextQuery', () => {
    describe('word before the caret', () => {
        it('should take the word the caret ends', () => {
            const value = 'Длинный текст, длинный тек';

            expect(kbqGetTextQuery(value, value.length)).toEqual({
                start: value.length - 3,
                end: value.length,
                text: 'тек',
                trigger: null
            });
        });

        it('should stop at punctuation', () => {
            expect(kbqGetTextQuery('one,two', 7)?.text).toBe('two');
        });

        it('should keep underscores and hyphens inside the word', () => {
            expect(kbqGetTextQuery('say kebab-case_word', 19)?.text).toBe('kebab-case_word');
        });

        it('should take only the part of the word before a caret placed inside it', () => {
            expect(kbqGetTextQuery('texture', 3)).toEqual({ start: 0, end: 3, text: 'tex', trigger: null });
        });

        it('should return null right after whitespace', () => {
            expect(kbqGetTextQuery('text ', 5)).toBeNull();
        });

        it('should return an empty query after whitespace when the minimum length is 0', () => {
            expect(kbqGetTextQuery('text ', 5, { minLength: 0 })).toEqual({
                start: 5,
                end: 5,
                text: '',
                trigger: null
            });
        });

        it('should return null for a word shorter than the minimum length', () => {
            expect(kbqGetTextQuery('te', 2, { minLength: 3 })).toBeNull();
            expect(kbqGetTextQuery('tex', 3, { minLength: 3 })?.text).toBe('tex');
        });
    });

    describe('triggers', () => {
        const triggers = ['/', '@'];

        it('should take the text after the trigger and start the query at the trigger', () => {
            expect(kbqGetTextQuery('hello /bol', 10, { triggers })).toEqual({
                start: 6,
                end: 10,
                text: 'bol',
                trigger: '/'
            });
        });

        it('should open on the trigger alone by default', () => {
            expect(kbqGetTextQuery('@', 1, { triggers })).toEqual({ start: 0, end: 1, text: '', trigger: '@' });
        });

        it('should require the minimum length after the trigger when it is set', () => {
            expect(kbqGetTextQuery('@', 1, { triggers, minLength: 1 })).toBeNull();
            expect(kbqGetTextQuery('@i', 2, { triggers, minLength: 1 })?.text).toBe('i');
        });

        it('should ignore a trigger inside a word', () => {
            expect(kbqGetTextQuery('mail@host', 9, { triggers })).toBeNull();
        });

        it('should accept a trigger at the start of a line', () => {
            expect(kbqGetTextQuery('first\n/cmd', 10, { triggers })?.trigger).toBe('/');
        });

        it('should end the query at whitespace after the trigger', () => {
            expect(kbqGetTextQuery('@ivan petrov', 12, { triggers })).toBeNull();
        });

        it('should take the trigger closest to the caret', () => {
            expect(kbqGetTextQuery('@ivan /cm', 9, { triggers })).toMatchObject({ trigger: '/', text: 'cm' });
        });

        it('should not fall back to the word before the caret when no trigger applies', () => {
            expect(kbqGetTextQuery('plain words', 11, { triggers })).toBeNull();
        });

        it('should support triggers longer than one character', () => {
            expect(kbqGetTextQuery('run ::deploy', 12, { triggers: ['::'] })).toEqual({
                start: 4,
                end: 12,
                text: 'deploy',
                trigger: '::'
            });
        });
    });
});
