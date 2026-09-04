import { kbqStructuralStateSavingKey } from './state-saving-key';

describe('kbqStructuralStateSavingKey', () => {
    /** Renders `html` into the document and returns the element marked `data-host`. */
    const host = (html: string): Element => {
        document.body.innerHTML = html;

        return document.querySelector('[data-host]')!;
    };

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('builds a path from the host up to the body', () => {
        expect(
            kbqStructuralStateSavingKey(
                host('<app-root><main><kbq-accordion data-host></kbq-accordion></main></app-root>')
            )
        ).toBe('app-root/main/kbq-accordion');
    });

    it('omits the index of the first element of its tag', () => {
        expect(
            kbqStructuralStateSavingKey(
                host('<kbq-accordion data-host></kbq-accordion><kbq-accordion></kbq-accordion>')
            )
        ).toBe('kbq-accordion');
    });

    it('suffixes a repeated tag with its index', () => {
        expect(
            kbqStructuralStateSavingKey(
                host('<kbq-accordion></kbq-accordion><kbq-accordion data-host></kbq-accordion>')
            )
        ).toBe('kbq-accordion:1');
    });

    // `nth-of-type`, not `nth-child`: a conditionally rendered sibling of another tag must not shift the
    // index and strand everything persisted under the old one.
    it('counts only siblings of the same tag', () => {
        expect(kbqStructuralStateSavingKey(host('<div></div><p></p><kbq-accordion data-host></kbq-accordion>'))).toBe(
            'kbq-accordion'
        );
    });

    // The anchor is what lets an author restructure the page above a component without moving its key.
    it('anchors the path on an ancestor id', () => {
        expect(
            kbqStructuralStateSavingKey(
                host(
                    '<app-root><section id="settings"><div><kbq-accordion data-host></kbq-accordion></div></section></app-root>'
                )
            )
        ).toBe('#settings/div/kbq-accordion');
    });

    it('anchors on the host own id', () => {
        expect(
            kbqStructuralStateSavingKey(host('<app-root><kbq-accordion id="faq" data-host></kbq-accordion></app-root>'))
        ).toBe('#faq');
    });

    // A generated id carries an instantiation counter, so it is exactly as unstable as the key this
    // resolver replaces.
    it('does not anchor on a generated id', () => {
        expect(
            kbqStructuralStateSavingKey(
                host('<kbq-form-field id="kbq-form-field-7"><kbq-accordion data-host></kbq-accordion></kbq-form-field>')
            )
        ).toBe('kbq-form-field/kbq-accordion');
    });

    it('crosses a shadow boundary', () => {
        document.body.innerHTML = '<micro-frontend></micro-frontend>';

        const shadowRoot = document.querySelector('micro-frontend')!.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = '<kbq-accordion></kbq-accordion>';

        expect(kbqStructuralStateSavingKey(shadowRoot.querySelector('kbq-accordion'))).toBe(
            'micro-frontend/kbq-accordion'
        );
    });

    // The position of a host outside the document is not something the next load can reproduce, so it
    // gets no key at all rather than an unreliable one.
    it('returns an empty key for a detached host', () => {
        expect(kbqStructuralStateSavingKey(document.createElement('kbq-accordion'))).toBe('');
    });

    it('returns an empty key without a host', () => {
        expect(kbqStructuralStateSavingKey(null)).toBe('');
    });
});
