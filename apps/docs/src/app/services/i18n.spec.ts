import { DocsLocale } from '../constants/locale';
import { DOCS_TRANSLATIONS, docsTranslate } from './i18n';

/**
 * Value-lock for the i18n dictionary. The expected map below is transcribed from the components'
 * original inline `{ ru, en }` literals / ternaries, so migrating them to `t()` / `docsTranslate()`
 * cannot silently change a user-visible string. (End-to-end template wiring for the `t()` mechanism
 * is separately proven by the render tests in `i18n.characterization.spec.ts`.)
 */
describe('DOCS_TRANSLATIONS', () => {
    it('matches the exact strings previously inlined across the docs components', () => {
        expect(DOCS_TRANSLATIONS).toMatchSnapshot();
    });

    it('resolves a key for the requested locale', () => {
        expect(docsTranslate('copy', DocsLocale.Ru)).toBe('Скопировать');
        expect(docsTranslate('copy', DocsLocale.En)).toBe('Copy');
    });
});
