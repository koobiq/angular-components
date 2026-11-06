import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

describe('KbqBadge triage: whitespace-only text nodes', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DefaultWhitespaceLeadingIcon, PreservedWhitespaceLeadingIcon, PreservedWhitespaceTrailingIcon]
        });
    });

    it('control: without preserved whitespace a leading icon gets the left icon class', () => {
        const fixture = TestBed.createComponent(DefaultWhitespaceLeadingIcon);

        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        expect(icon.classList.contains('kbq-icon_left')).toBe(true);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(true);
    });

    it('DEFECT: with preserveWhitespaces a leading icon on its own line gets no left icon class', () => {
        const fixture = TestBed.createComponent(PreservedWhitespaceLeadingIcon);

        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        // The first child node is the whitespace-only text node in front of the icon.
        expect(host.firstChild?.nodeType).toBe(Node.TEXT_NODE);
        expect(host.firstChild?.textContent?.trim()).toBe('');
        expect(icon.classList.contains('kbq-icon_left')).toBe(false);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(false);
    });

    it('DEFECT: with preserveWhitespaces a trailing icon on its own line gets no right icon class', () => {
        const fixture = TestBed.createComponent(PreservedWhitespaceTrailingIcon);

        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        expect(host.lastChild?.nodeType).toBe(Node.TEXT_NODE);
        expect(host.lastChild?.textContent?.trim()).toBe('');
        expect(icon.classList.contains('kbq-icon_right')).toBe(false);
        expect(host.classList.contains('kbq-badge-icon_right')).toBe(false);
    });
});

@Component({
    selector: 'default-whitespace-leading-icon',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            <i kbq-icon="kbq-circle-question_16"></i>
            Normal
        </kbq-badge>
    `
})
class DefaultWhitespaceLeadingIcon {}

@Component({
    selector: 'preserved-whitespace-leading-icon',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            <i kbq-icon="kbq-circle-question_16"></i>
            Normal
        </kbq-badge>
    `,
    preserveWhitespaces: true
})
class PreservedWhitespaceLeadingIcon {}

@Component({
    selector: 'preserved-whitespace-trailing-icon',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            Normal
            <i kbq-icon="kbq-circle-question_16"></i>
        </kbq-badge>
    `,
    preserveWhitespaces: true
})
class PreservedWhitespaceTrailingIcon {}
