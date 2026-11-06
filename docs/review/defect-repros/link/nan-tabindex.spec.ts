import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ENTER, SPACE } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink [tabIndex]="tabIndex()" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class BoundTabIndexPseudoLink {
    readonly tabIndex = signal<unknown>(0);
    clicks = 0;
}

describe('triage: KbqLink tabIndex without a numeric value', () => {
    it.each([null, undefined, 'abc'])(
        'DEFECT: [tabIndex]=%s renders tabindex="NaN" and drops the role and the keyboard of a pseudo link',
        (value) => {
            const fixture = TestBed.createComponent(BoundTabIndexPseudoLink);

            fixture.componentInstance.tabIndex.set(value);
            fixture.detectChanges();

            const link: HTMLElement = fixture.nativeElement.querySelector('[kbqLink]');

            expect(link.getAttribute('tabindex')).toBe('NaN');
            expect(link.hasAttribute('role')).toBe(false);

            const enter = dispatchKeyboardEvent(link, 'keydown', ENTER, undefined, 'Enter');
            const space = dispatchKeyboardEvent(link, 'keydown', SPACE, undefined, ' ');

            expect(enter.defaultPrevented).toBe(false);
            expect(space.defaultPrevented).toBe(false);
            expect(fixture.componentInstance.clicks).toBe(0);
        }
    );

    it('control: the same pseudo link with [tabIndex]="0" is a button activated by Enter and Space', () => {
        const fixture = TestBed.createComponent(BoundTabIndexPseudoLink);

        fixture.detectChanges();

        const link: HTMLElement = fixture.nativeElement.querySelector('[kbqLink]');

        dispatchKeyboardEvent(link, 'keydown', ENTER, undefined, 'Enter');
        dispatchKeyboardEvent(link, 'keydown', SPACE, undefined, ' ');

        expect(link.getAttribute('tabindex')).toBe('0');
        expect(link.getAttribute('role')).toBe('button');
        expect(fixture.componentInstance.clicks).toBe(2);
    });
});
