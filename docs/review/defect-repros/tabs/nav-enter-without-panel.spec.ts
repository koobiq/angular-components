import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ENTER, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar>
            <a href="#first" kbqTabLink [active]="true">First</a>
            <a href="#second" kbqTabLink>Second</a>
        </nav>
    `
})
class NavBarWithoutPanel {}

@Component({
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar [tabNavPanel]="panel">
            <a href="#first" kbqTabLink [active]="true">First</a>
            <a href="#second" kbqTabLink>Second</a>
        </nav>
        <div #panel="kbqTabNavPanel" kbqTabNavPanel>Panel</div>
    `
})
class NavBarWithPanel {}

/** Records clicks on the link, cancelling them so jsdom does not navigate. */
const recordClicks = (link: HTMLElement) => {
    const clicks = vi.fn((event: Event) => event.preventDefault());

    link.addEventListener('click', clicks);

    return clicks;
};

describe('triage: Enter on a link of a nav bar without tabNavPanel', () => {
    it('DEFECT: the strip cancels the default action of Enter and nothing clicks the link', () => {
        const fixture = TestBed.createComponent(NavBarWithoutPanel);

        fixture.detectChanges();

        const link: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('a')[1];
        const clicks = recordClicks(link);

        link.focus();
        expect(document.activeElement).toBe(link);

        const event = dispatchKeyboardEvent(link, 'keydown', ENTER);

        // A browser follows a focused link from the default action of Enter; cancelled, it does not.
        expect(event.defaultPrevented).toBe(true);
        expect(clicks).not.toHaveBeenCalled();
    });

    it('control: with a panel the link clicks itself on Enter', () => {
        const fixture = TestBed.createComponent(NavBarWithPanel);

        fixture.detectChanges();

        const link: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('a')[1];
        const clicks = recordClicks(link);

        link.focus();
        dispatchKeyboardEvent(link, 'keydown', ENTER);

        expect(clicks).toHaveBeenCalledTimes(1);
    });
});
