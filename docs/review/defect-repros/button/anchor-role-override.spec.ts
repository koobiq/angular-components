import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqButtonModule } from '@koobiq/components/button';

@Component({
    imports: [KbqButtonModule],
    template: `
        <a id="without-href" kbq-button role="tab">Tab</a>
        <a id="with-href" kbq-button href="/somewhere" role="menuitem">Menu item</a>
    `
})
class AnchorsWithConsumerRole {}

describe('triage: KbqButton anchor role', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [AnchorsWithConsumerRole] });
    });

    it('DEFECT: a consumer role on <a kbq-button> is replaced by "button" without href and removed with href', () => {
        const fixture = TestBed.createComponent(AnchorsWithConsumerRole);

        // The role is resolved in `ngAfterViewInit`/`ngAfterViewChecked`.
        fixture.detectChanges();
        fixture.detectChanges();

        const withoutHref: HTMLAnchorElement = fixture.nativeElement.querySelector('#without-href');
        const withHref: HTMLAnchorElement = fixture.nativeElement.querySelector('#with-href');

        expect(withoutHref.getAttribute('role')).toBe('button');
        expect(withHref.hasAttribute('role')).toBe(false);
    });
});
