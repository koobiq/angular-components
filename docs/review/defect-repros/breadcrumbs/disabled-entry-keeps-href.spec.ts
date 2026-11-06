import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

@Component({
    imports: [KbqBreadcrumbsModule, RouterLink],
    template: `
        <kbq-breadcrumbs [disabled]="trailDisabled">
            <kbq-breadcrumb-item routerLink="/home" text="Home" [disabled]="true" />
            <kbq-breadcrumb-item routerLink="/library" text="Library" />
            <kbq-breadcrumb-item routerLink="/data" text="Data" />
        </kbq-breadcrumbs>
    `
})
class TestApp {
    trailDisabled = false;
}

function setup(trailDisabled: boolean): ComponentFixture<TestApp> {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(TestApp);

    fixture.componentInstance.trailDisabled = trailDisabled;
    fixture.detectChanges();

    return fixture;
}

function entries(fixture: ComponentFixture<TestApp>): HTMLAnchorElement[] {
    return fixture.debugElement.queryAll(By.css('a[kbq-button]')).map(({ nativeElement }) => nativeElement);
}

describe('triage: disabled default breadcrumb entries', () => {
    it('DEFECT: a disabled entry keeps its href, and only the primary click is halted', () => {
        const fixture = setup(false);
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
        const [home, , data] = entries(fixture);

        expect(home.getAttribute('aria-disabled')).toBe('true');
        expect(home.getAttribute('href')).toBe('/home');
        // The last entry always renders disabled and still links to its route.
        expect(data.getAttribute('aria-disabled')).toBe('true');
        expect(data.getAttribute('href')).toBe('/data');

        const click = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true });

        home.dispatchEvent(click);

        expect(click.defaultPrevented).toBe(true);
        expect(navigate).not.toHaveBeenCalled();

        // A middle click fires `auxclick`, not `click`; its default action opens the href in a new tab.
        const middleClick = new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true });

        home.dispatchEvent(middleClick);

        expect(middleClick.defaultPrevented).toBe(false);
    });

    it('DEFECT: every entry of a disabled trail keeps its href', () => {
        const fixture = setup(true);

        expect(
            entries(fixture).map((entry) => [entry.getAttribute('aria-disabled'), entry.getAttribute('href')])
        ).toEqual([
            ['true', '/home'],
            ['true', '/library'],
            ['true', '/data']
        ]);
    });
});
