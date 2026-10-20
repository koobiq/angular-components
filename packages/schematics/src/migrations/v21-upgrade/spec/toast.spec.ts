import { runV21Upgrade } from '../testing';

const DISPATCH_SCROLL_EVENT = 'KbqToastContainerComponent.dispatchScrollEvent was removed';
const BOTH_MARGINS = 'declares both a removed and a new name';

describe('v21-upgrade: toast', () => {
    it('rewrites the stack margin properties in styles', async () => {
        const styles = [
            '.app-toasts {',
            '    --kbq-toast-stack-size-margin-top: 24px;',
            '    --kbq-toast-stack-size-margin-right:16px;',
            '}',
            '.app-offset {',
            '    top: calc(var(--kbq-toast-stack-size-margin-top) * 2);',
            '    right: var(--kbq-toast-stack-size-margin-right, 12px);',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'margins.scss': styles, 'margins.css': styles });
        const expected = [
            '.app-toasts {',
            '    --kbq-toast-stack-size-margin-vertical: 24px;',
            '    --kbq-toast-stack-size-margin-horizontal:16px;',
            '}',
            '.app-offset {',
            '    top: calc(var(--kbq-toast-stack-size-margin-vertical) * 2);',
            '    right: var(--kbq-toast-stack-size-margin-horizontal, 12px);',
            '}',
            ''
        ].join('\n');

        expect(run.read('margins.scss')).toBe(expected);
        expect(run.read('margins.css')).toBe(expected);
        expect(run.log).not.toContain(BOTH_MARGINS);
    });

    it('rewrites the stack margin properties in code and templates', async () => {
        const source = [
            '@Component({',
            '    template: `<div [style.--kbq-toast-stack-size-margin-right.px]="inset"></div>`',
            '})',
            'export class App {',
            '    constructor() {',
            "        host.style.setProperty('--kbq-toast-stack-size-margin-top', '24px');",
            '    }',
            '}',
            ''
        ].join('\n');
        const template = '<div style="--kbq-toast-stack-size-margin-top: 24px"></div>\n';
        const run = await runV21Upgrade({ 'margins.ts': source, 'margins.html': template });

        expect(run.read('margins.ts')).toBe(
            source.replace('margin-right', 'margin-horizontal').replace('margin-top', 'margin-vertical')
        );
        expect(run.read('margins.html')).toBe(template.replace('margin-top', 'margin-vertical'));
    });

    it('reports a file that declares both a removed and a new stack margin', async () => {
        const styles = [
            '.app-toasts {',
            '    --kbq-toast-stack-size-margin-vertical: 24px;',
            '    --kbq-toast-stack-size-margin-top: 16px;',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'both.scss': styles });

        expect(run.read('both.scss')).toBe(styles.replace('margin-top', 'margin-vertical'));
        expect(run.log).toContain(BOTH_MARGINS);
    });

    it('reports dispatchScrollEvent on a KbqToastContainerComponent', async () => {
        const source = [
            "import { KbqToastContainerComponent } from '@koobiq/components/toast';",
            'export class App {',
            '    readonly container = viewChild.required(KbqToastContainerComponent);',
            '    reflow() { this.container().dispatchScrollEvent(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'dispatch.ts': source });

        expect(run.read('dispatch.ts')).toBe(source);
        expect(run.log).toContain(DISPATCH_SCROLL_EVENT);
    });

    it('reports dispatchScrollEvent through a template reference to the container', async () => {
        const template = [
            '<kbq-toast-container #stack />',
            '<button (click)="stack.dispatchScrollEvent()">Reflow</button>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'dispatch.html': template });

        expect(run.read('dispatch.html')).toBe(template);
        expect(run.log).toContain(DISPATCH_SCROLL_EVENT);
    });

    it('leaves the new names, longer names and unrelated code alone', async () => {
        const styles = [
            '.app-toasts {',
            '    --kbq-toast-stack-size-margin-vertical: var(--kbq-toast-stack-size-margin-top-offset);',
            '    --app-kbq-toast-stack-size-margin-right: 0;',
            '    margin-top: $toast-stack-size-margin-top;',
            '    --kbq-toast-size-container-padding-right: 0;',
            '}',
            ''
        ].join('\n');
        const source = [
            "import { KbqToastService } from '@koobiq/components/toast';",
            'export class Scroller {',
            '    dispatchScrollEvent() {}',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'other.scss': styles, 'other.ts': source });

        expect(run.read('other.scss')).toBe(styles);
        expect(run.read('other.ts')).toBe(source);
        expect(run.log).not.toContain(DISPATCH_SCROLL_EVENT);
        expect(run.log).not.toContain(BOTH_MARGINS);
    });
});
