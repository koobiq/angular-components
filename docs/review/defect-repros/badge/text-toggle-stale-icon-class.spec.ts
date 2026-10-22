import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

describe('KbqBadge triage: icon classes when text is toggled', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ToggledTextBadge] });
    });

    it('control: a badge rendered with the text from the start gets the left icon class', () => {
        const fixture = TestBed.createComponent(ToggledTextBadge);

        fixture.componentInstance.showText.set(true);
        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        expect(icon.classList.contains('kbq-icon_left')).toBe(true);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(true);
    });

    it('DEFECT: text added after the first render leaves the leading icon without the left icon class', async () => {
        const fixture = TestBed.createComponent(ToggledTextBadge);

        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        expect(icon.classList.contains('kbq-icon_left')).toBe(false);

        fixture.componentInstance.showText.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.querySelector('span')?.textContent).toBe('Normal');
        expect(icon.classList.contains('kbq-icon_left')).toBe(false);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(false);
    });

    it('DEFECT: text removed after the first render leaves the left icon classes on an icon-only badge', async () => {
        const fixture = TestBed.createComponent(ToggledTextBadge);

        fixture.componentInstance.showText.set(true);
        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const icon = host.querySelector('[kbq-icon]')!;

        expect(icon.classList.contains('kbq-icon_left')).toBe(true);

        fixture.componentInstance.showText.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.querySelector('span')).toBeNull();
        expect(icon.classList.contains('kbq-icon_left')).toBe(true);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(true);
    });
});

@Component({
    selector: 'toggled-text-badge',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            <i kbq-icon="kbq-circle-question_16"></i>
            @if (showText()) {
                <span>Normal</span>
            }
        </kbq-badge>
    `
})
class ToggledTextBadge {
    readonly showText = signal(false);
}
