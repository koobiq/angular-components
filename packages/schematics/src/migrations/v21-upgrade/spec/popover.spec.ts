import { runV21Upgrade } from '../testing';

const INVALID_POSITION_ERROR = '`getKbqPopoverInvalidPositionError` was removed';
const HIDE_IF_NOT_IN_VIEW_PORT = '`KbqPopoverTrigger.hideIfNotInViewPort` was removed';
const HOST_DIRECTIVE_INPUTS = 'A `hostDirectives` entry of `KbqPopoverTrigger` exposes an unprefixed input';

describe('v21-upgrade: popover', () => {
    it.each([
        ['hideIfNotInViewPort', 'kbqPopoverHideIfNotInViewPort'],
        ['defaultPaddings', 'kbqPopoverDefaultPaddings'],
        ['container', 'kbqPopoverContainer'],
        ['hasBackdrop', 'kbqPopoverHasBackdrop'],
        ['hasCloseButton', 'kbqPopoverHasCloseButton'],
        ['closeOnScroll', 'kbqPopoverCloseOnScroll'],
        ['backdropClass', 'kbqPopoverBackdropClass']
    ])('renames the [%s] binding of a popover trigger to [%s]', async (name, replacement) => {
        const run = await runV21Upgrade({
            'binding.html': `<button kbqPopover kbqPopoverContent="Text" [${name}]="value">Open</button>\n`
        });

        expect(run.read('binding.html')).toBe(
            `<button kbqPopover kbqPopoverContent="Text" [${replacement}]="value">Open</button>\n`
        );
    });

    it('renames static and bare attributes wherever the trigger stands in the tag', async () => {
        const template = [
            '<button',
            '    hasCloseButton',
            '    backdropClass="app-backdrop"',
            '    (click)="count > 0 && reset()"',
            '    kbqPopover',
            '    [kbqPopoverContent]="\'a > b\'"',
            '    hasBackdrop',
            '>',
            '    Open',
            '</button>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'attributes.html': template });

        expect(run.read('attributes.html')).toBe(
            [
                '<button',
                '    kbqPopoverHasCloseButton',
                '    kbqPopoverBackdropClass="app-backdrop"',
                '    (click)="count > 0 && reset()"',
                '    kbqPopover',
                '    [kbqPopoverContent]="\'a > b\'"',
                '    kbqPopoverHasBackdrop',
                '>',
                '    Open',
                '</button>',
                ''
            ].join('\n')
        );
    });

    it('renames the inputs of a popover confirm trigger in an inline template', async () => {
        const source = [
            "import { Component } from '@angular/core';",
            '@Component({',
            "    selector: 'app-delete',",
            '    template: `<button kbqPopoverConfirm [closeOnScroll]="true" (confirm)="delete()">Delete</button>`',
            '})',
            'export class Delete {}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'delete.ts': source });

        expect(run.read('delete.ts')).toBe(source.replace('[closeOnScroll]', '[kbqPopoverCloseOnScroll]'));
    });

    it('reports getKbqPopoverInvalidPositionError', async () => {
        const source = [
            "import { getKbqPopoverInvalidPositionError } from '@koobiq/components/popover';",
            "export const error = getKbqPopoverInvalidPositionError('middle');",
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'error.ts': source });

        expect(run.read('error.ts')).toBe(source);
        expect(run.log).toContain(INVALID_POSITION_ERROR);
    });

    it('reports a hideIfNotInViewPort read through the exportAs reference', async () => {
        const template = [
            '<button #popover="kbqPopover" kbqPopover kbqPopoverContent="Text">Open</button>',
            '@if (popover.hideIfNotInViewPort()) { <span>hides</span> }',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'member.html': template });

        expect(run.read('member.html')).toBe(template);
        expect(run.log).toContain(HIDE_IF_NOT_IN_VIEW_PORT);
    });

    it('reports a host directive that exposes an unprefixed input', async () => {
        const source = [
            "import { Directive } from '@angular/core';",
            "import { KbqPopoverTrigger } from '@koobiq/components/popover';",
            '@Directive({',
            "    selector: '[appHint]',",
            "    hostDirectives: [{ directive: KbqPopoverTrigger, inputs: ['kbqPopoverContent', 'hasBackdrop'] }]",
            '})',
            'export class Hint {}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'hint.ts': source });

        expect(run.read('hint.ts')).toBe(source);
        expect(run.log).toContain(HOST_DIRECTIVE_INPUTS);
    });

    it('leaves inputs of the same names on other elements and code without the trigger alone', async () => {
        const template = [
            '<kbq-dropdown #menu="kbqDropdown" [hasBackdrop]="true" backdropClass="app-backdrop">',
            '    <button kbq-dropdown-item>Item</button>',
            '</kbq-dropdown>',
            '<app-drawer hasBackdrop [container]="host" [closeOnScroll]="true" kbqTooltip="Not a kbqPopover" />',
            '<button kbqPopover kbqPopoverContent="Text" [kbqPopoverHasBackdrop]="true" #container>Open</button>',
            ''
        ].join('\n');
        const source = [
            "import { Directive } from '@angular/core';",
            "import { KbqPopoverTrigger } from '@koobiq/components/popover';",
            '@Directive({',
            "    selector: '[appHint]',",
            "    hostDirectives: [{ directive: KbqPopoverTrigger, inputs: ['kbqPopoverHasBackdrop: hasBackdrop'] }]",
            '})',
            'export class Hint {',
            '    readonly options = { hasBackdrop: true, closeOnScroll: false };',
            '}',
            ''
        ].join('\n');
        const scroller = [
            'export class Scroller {',
            '    hideIfNotInViewPort() { return true; }',
            '    check() { return this.hideIfNotInViewPort(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({
            'unrelated.html': template,
            'unrelated.ts': source,
            'scroller.ts': scroller
        });

        expect(run.read('unrelated.html')).toBe(template);
        expect(run.read('unrelated.ts')).toBe(source);
        expect(run.read('scroller.ts')).toBe(scroller);
        expect(run.log).not.toContain(INVALID_POSITION_ERROR);
        expect(run.log).not.toContain(HIDE_IF_NOT_IN_VIEW_PORT);
        expect(run.log).not.toContain(HOST_DIRECTIVE_INPUTS);
    });
});
