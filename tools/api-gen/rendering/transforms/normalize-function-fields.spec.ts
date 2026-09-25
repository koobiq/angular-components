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
});
