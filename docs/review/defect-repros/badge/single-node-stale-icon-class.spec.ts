import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

describe('KbqBadge triage: recomputation with a single remaining node', () => {
    it('DEFECT: removing one of two adjacent icons leaves kbq-icon_right on the remaining icon', async () => {
        TestBed.configureTestingModule({ imports: [TwoIconsBadge] });

        const fixture = TestBed.createComponent(TwoIconsBadge);

        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('kbq-badge') as HTMLElement;
        const second = host.querySelector('[data-testid="second"]')!;

        expect(host.querySelector('[data-testid="first"]')!.classList.contains('kbq-icon_left')).toBe(true);
        expect(second.classList.contains('kbq-icon_right')).toBe(true);
        expect(host.classList.contains('kbq-badge-icon_right')).toBe(true);

        fixture.componentInstance.showFirst.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.querySelector('[data-testid="first"]')).toBeNull();
        // The recomputation ran: it removed the host modifier...
        expect(host.classList.contains('kbq-badge-icon_right')).toBe(false);
        expect(host.classList.contains('kbq-badge-icon_left')).toBe(false);
        // ...but left the icon modifier on the lone icon.
        expect(second.classList.contains('kbq-icon_right')).toBe(true);
    });
});

@Component({
    selector: 'two-icons-badge',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            @if (showFirst()) {
                <i data-testid="first" kbq-icon="kbq-circle-question_16"></i>
            }
            <i data-testid="second" kbq-icon="kbq-circle-question_16"></i>
        </kbq-badge>
    `
})
class TwoIconsBadge {
    readonly showFirst = signal(true);
}
