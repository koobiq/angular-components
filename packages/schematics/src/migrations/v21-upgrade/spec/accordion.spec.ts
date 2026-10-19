import { runV21Upgrade } from '../testing';

const TRIGGER_ACTION = 'The kbq-accordion-trigger__action class was removed';

describe('v21-upgrade: accordion', () => {
    it('reports the kbq-accordion-trigger__action class in a template', async () => {
        const template = [
            '<kbq-accordion-header>',
            '    <button kbq-accordion-trigger type="button">',
            '        Section',
            '        <i class="kbq-accordion-trigger__action" kbq-icon-button="kbq-bug_16"></i>',
            '    </button>',
            '</kbq-accordion-header>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'action.html': template });

        expect(run.read('action.html')).toBe(template);
        expect(run.log).toContain(TRIGGER_ACTION);
    });

    it('reports the kbq-accordion-trigger__action class in styles and code', async () => {
        const styles = '.app-accordion .kbq-accordion-trigger__action {\n    color: red;\n}\n';
        const source = "export const actions = host.querySelectorAll('.kbq-accordion-trigger__action');\n";
        const run = await runV21Upgrade({ 'action.scss': styles, 'action.ts': source });

        expect(run.read('action.scss')).toBe(styles);
        expect(run.read('action.ts')).toBe(source);
        expect(run.log).toContain(`action.scss\n  ${TRIGGER_ACTION}`);
        expect(run.log).toContain(`action.ts\n  ${TRIGGER_ACTION}`);
    });

    it('leaves the header actions and longer class names alone', async () => {
        const template = [
            '<kbq-accordion-header>',
            '    <button kbq-accordion-trigger type="button">Section</button>',
            '    <div class="kbq-accordion-header__actions app-kbq-accordion-trigger__action">',
            '        <button kbq-icon-button="kbq-bug_16" type="button" aria-label="Bug"></button>',
            '    </div>',
            '</kbq-accordion-header>',
            ''
        ].join('\n');
        const styles = '.kbq-accordion-trigger__actions,\n.kbq-accordion-trigger__action-icon {\n    gap: 0;\n}\n';
        const run = await runV21Upgrade({ 'header.html': template, 'header.scss': styles });

        expect(run.read('header.html')).toBe(template);
        expect(run.read('header.scss')).toBe(styles);
        expect(run.log).not.toContain(TRIGGER_ACTION);
    });
});
