import { FunctionEntry } from '../entities';
import { normalizeFunctionFields } from './normalize-function-fields';

describe('normalizeFunctionFields', () => {
    const describeParam = (description: string): string | undefined =>
        normalizeFunctionFields({
            params: [{ name: 'delay', description, type: 'number', isOptional: false, isRestParam: false }]
        } as Partial<FunctionEntry>).params?.[0].description;

    it('drops the hyphen TSDoc puts between a parameter and its description', () => {
        expect(describeParam('- The delay in milliseconds.')).toBe('The delay in milliseconds.');
    });

    it('keeps a description that starts with a negative number', () => {
        expect(describeParam('-1 hides it at once.')).toBe('-1 hides it at once.');
    });

    it('reads a constructor from its implementation, all the extractor gives it', () => {
        const constructor = {
            signatures: [],
            implementation: {
                params: [{ name: 'control', type: 'T', description: '', isOptional: false, isRestParam: false }],
                returnType: 'FlatTreeControl<T>'
            }
        } as unknown as Partial<FunctionEntry>;

        expect(normalizeFunctionFields(constructor).params?.map(({ name }) => name)).toEqual(['control']);
    });

    describe('params and return type', () => {
        const param = (name: string, type: string) => ({
            name,
            type,
            description: '',
            isOptional: false,
            isRestParam: false
        });

        const read = (entry: object) => {
            const { params, returnType } = normalizeFunctionFields(entry as Partial<FunctionEntry>);

            return { params: params?.map(({ name }) => name), returnType };
        };

        it('reads them from the entry itself', () => {
            expect(read({ params: [param('event', 'KeyboardEvent')], returnType: 'boolean' })).toEqual({
                params: ['event'],
                returnType: 'boolean'
            });
        });

        it('reads them from the first signature of a function the extractor returns with its overloads', () => {
            const signature = {
                params: [param('event', 'KeyboardEvent'), param('keys', 'string[]')],
                returnType: 'boolean'
            };

            expect(read({ signatures: [signature], implementation: null })).toEqual({
                params: ['event', 'keys'],
                returnType: 'boolean'
            });
        });

        it('prefers the entry itself to its signatures', () => {
            const signature = { params: [param('fromSignature', 'number')], returnType: 'boolean' };

            expect(read({ params: [param('direct', 'string')], returnType: 'void', signatures: [signature] })).toEqual({
                params: ['direct'],
                returnType: 'void'
            });
        });

        it('falls back to no params and an empty return type', () => {
            expect(read({})).toEqual({ params: [], returnType: '' });
        });
    });
});
