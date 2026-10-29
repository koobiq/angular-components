import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { KbqBreadcrumbsModule, RdxRovingFocusItemDirective } from '@koobiq/components/breadcrumbs';

@Component({
    imports: [KbqBreadcrumbsModule],
    template: `
        <kbq-breadcrumbs [disabled]="trailDisabled">
            <kbq-breadcrumb-item text="Home" />
            <kbq-breadcrumb-item text="Library" [disabled]="itemDisabled" />
            <kbq-breadcrumb-item text="Data" />
        </kbq-breadcrumbs>
    `
})
class TestApp {
    trailDisabled = false;
    itemDisabled = false;
}

function setup(state: Partial<TestApp>): ComponentFixture<TestApp> {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(TestApp);

    Object.assign(fixture.componentInstance, state);
    fixture.detectChanges();

    return fixture;
}

function entries(fixture: ComponentFixture<TestApp>): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('a[kbq-button]')).map(({ nativeElement }) => nativeElement);
}

function rovingTabIndex(fixture: ComponentFixture<TestApp>, entry: HTMLElement): number {
    return fixture.debugElement
        .queryAll(By.directive(RdxRovingFocusItemDirective))
        .find(({ nativeElement }) => nativeElement === entry)!
        .injector.get(RdxRovingFocusItemDirective).tabIndex;
}

describe('triage: tabindex of breadcrumb entries after they are re-enabled', () => {
    it('control: a trail enabled from the start keeps the non-current entries at tabindex="-1"', () => {
        const fixture = setup({});
        const [home, library] = entries(fixture);

        expect(home.getAttribute('tabindex')).toBe('-1');
        expect(library.getAttribute('tabindex')).toBe('-1');
    });

    it('DEFECT: enabling a disabled trail leaves every entry at tabindex="0" while the roving focus holds -1', () => {
        const fixture = setup({ trailDisabled: true });
        const [home, library, data] = entries(fixture);

        expect(home.getAttribute('tabindex')).toBe('-1');
        expect(library.getAttribute('tabindex')).toBe('-1');

        fixture.componentInstance.trailDisabled = false;
        fixture.detectChanges();

        expect(rovingTabIndex(fixture, home)).toBe(-1);
        expect(rovingTabIndex(fixture, library)).toBe(-1);
        // KbqButton rewrote its own binding to 0; the roving binding did not change, so it never wrote back.
        expect(home.getAttribute('tabindex')).toBe('0');
        expect(library.getAttribute('tabindex')).toBe('0');
        // The last entry stays disabled, so the button binding still renders -1 there.
        expect(data.getAttribute('tabindex')).toBe('-1');
    });

    it('DEFECT: enabling a disabled item leaves its entry at tabindex="0" while the roving focus holds -1', () => {
        const fixture = setup({ itemDisabled: true });
        const library = entries(fixture)[1];

        expect(library.getAttribute('tabindex')).toBe('-1');

        fixture.componentInstance.itemDisabled = false;
        fixture.detectChanges();

        expect(rovingTabIndex(fixture, library)).toBe(-1);
        expect(library.getAttribute('tabindex')).toBe('0');
    });
});
