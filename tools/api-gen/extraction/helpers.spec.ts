import { ClassEntry, DocEntry, EntryType, MemberTags, MemberType, PropertyEntry } from '../rendering/entities';
import { ClassEntryMetadata } from '../types';
import { entryHandler, updateEntries } from './helpers';

/** A directive entry carrying the given inputs, as Angular's extractor reports one. */
const directive = (name: string, inputs: { name: string; inputAlias?: string }[]): ClassEntry =>
    ({
        name,
        entryType: EntryType.Directive,
        members: inputs.map(({ name: member, inputAlias }): PropertyEntry => ({
            name: member,
            inputAlias,
            memberType: MemberType.Property,
            memberTags: [MemberTags.Input],
            type: 'string',
            description: '',
            jsdocTags: []
        }))
    }) as unknown as ClassEntry;

const metadata = (hostDirectives: ClassEntryMetadata['hostDirectives']): Record<string, ClassEntryMetadata> => ({
    KbqHost: { decorators: ['Component'], baseClass: null, hostDirectives }
});

/** The member names `updateEntries` leaves on the host. */
const memberNames = (entries: DocEntry[]): string[] =>
    ((entries[0] as ClassEntry).members ?? []).map(({ name }) => name);

describe('host directive inputs', () => {
    const host = directive('KbqHost', [{ name: 'ownInput' }]);

    it('surfaces a forwarded input on the host', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { forwarded: 'forwarded' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'forwarded' }, { name: 'notForwarded' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'forwarded']);
    });

    it('surfaces it under the name the host exposes it as', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { inner: 'outer' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'inner' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'outer']);
    });

    // Angular matches a forwarded input by its public name, which is the alias when the input has one.
    it('matches a forwarded input by its alias', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { public: 'public' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'internal', inputAlias: 'public' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'public']);
    });

    it('leaves the host alone when the directive surfaces nothing', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: {} }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'notForwarded' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput']);
    });

    // The directive can be in another package, or not documented at all.
    it('leaves the host alone when the directive was not extracted', () => {
        const entries = updateEntries([host], metadata([{ name: 'Missing', inputs: { forwarded: 'forwarded' } }]), {});

        expect(memberNames(entries)).toEqual(['ownInput']);
    });

    it('keeps the host own input when both declare the same name', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { ownInput: 'ownInput' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'ownInput' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput']);
    });
});

describe('reading hostDirectives from source', () => {
    it('reads the directive and the inputs it forwards', () => {
        expect(entryHandler('packages/components/accordion/accordion.ts').KbqAccordion.hostDirectives).toEqual([
            { name: 'KbqStateSaving', inputs: { useStateSaving: 'useStateSaving', stateSavingKey: 'stateSavingKey' } }
        ]);
    });

    it('reads a directive applied without forwarding anything', () => {
        expect(
            entryHandler('packages/components/toggle/toggle.component.ts').KbqToggleComponent.hostDirectives
        ).toEqual([{ name: 'KbqCheckable', inputs: {} }]);
    });

    it('reports none for a component that applies no host directive', () => {
        expect(entryHandler('packages/components/accordion/accordion-item.ts').KbqAccordionItem.hostDirectives).toEqual(
            []
        );
    });
});
