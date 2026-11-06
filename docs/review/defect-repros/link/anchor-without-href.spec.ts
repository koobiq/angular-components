import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ENTER, SPACE } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink (click)="clicks = clicks + 1">Scan report</a>
    `
})
class AnchorWithoutHref {
    clicks = 0;
}

describe('triage: KbqLink on an anchor without a href and without pseudo', () => {
    it('DEFECT: the anchor gets tabindex="0" but no role and no Enter or Space activation', () => {
        const fixture = TestBed.createComponent(AnchorWithoutHref);

        fixture.detectChanges();

        const link: HTMLAnchorElement = fixture.nativeElement.querySelector('[kbqLink]');

        expect(link.hasAttribute('href')).toBe(false);
        expect(link.getAttribute('tabindex')).toBe('0');
        expect(link.hasAttribute('role')).toBe(false);
        expect(link.classList).not.toContain('kbq-link_pseudo');

        const enter = dispatchKeyboardEvent(link, 'keydown', ENTER, undefined, 'Enter');
        const space = dispatchKeyboardEvent(link, 'keydown', SPACE, undefined, ' ');

        expect(enter.defaultPrevented).toBe(false);
        expect(space.defaultPrevented).toBe(false);
        expect(fixture.componentInstance.clicks).toBe(0);

        link.click();

        expect(fixture.componentInstance.clicks).toBe(1);
    });
});
