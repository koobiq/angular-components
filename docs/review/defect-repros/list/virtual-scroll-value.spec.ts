import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqListModule, KbqListOption } from '@koobiq/components/list';

// The shape of the `list-virtual-scroll` docs example: checkbox mode, a form control, a virtual scroller.
@Component({
    imports: [KbqListModule, ScrollingModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection style="height: 64px" multiple aria-label="Items" [formControl]="control">
            <cdk-virtual-scroll-viewport style="height: 100%" itemSize="32">
                <kbq-list-option *cdkVirtualFor="let item of items" [value]="item">{{ item }}</kbq-list-option>
            </cdk-virtual-scroll-viewport>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly viewport = viewChild.required(CdkVirtualScrollViewport);
    readonly items = Array.from({ length: 20 }, (_, index) => `Item ${index}`);
    readonly control = new FormControl<string[]>([]);
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    // The viewport measures and attaches its scroll strategy on a microtask, and audits its first
    // scroll tick on an animation frame: give both a moment of real time.
    for (let i = 0; i < 3; i++) {
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve, 20));
    }

    fixture.detectChanges();
    await fixture.whenStable();
};

const getOptions = (fixture: ComponentFixture<unknown>): KbqListOption[] =>
    fixture.debugElement.queryAll(By.directive(KbqListOption)).map(({ componentInstance }) => componentInstance);

const getOption = (fixture: ComponentFixture<unknown>, value: string) =>
    getOptions(fixture).find((option) => option.value === value);

const click = async (fixture: ComponentFixture<unknown>, value: string) => {
    getOption(fixture, value)!
        .getHostElement()
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
};

describe('triage: KbqListSelection value under virtual scroll', () => {
    it('DEFECT: a user change drops a form value whose option is not rendered', async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.control.setValue(['Item 15']);
        await settle(fixture);

        const rendered = getOptions(fixture).map((option) => option.value);

        expect(rendered.length).toBeGreaterThan(0);
        expect(rendered).toContain('Item 1');
        expect(rendered).not.toContain('Item 15');

        await click(fixture, 'Item 1');

        // 'Item 15' was selected in the form value and nobody deselected it.
        expect(fixture.componentInstance.control.value).toEqual(['Item 1']);
    });

    it('DEFECT: selecting, scrolling away and selecting again keeps only the option in view', async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);
        const { control, viewport } = fixture.componentInstance;

        await settle(fixture);

        await click(fixture, 'Item 1');

        expect(control.value).toEqual(['Item 1']);

        // Stands in for scrolling: render items 12..18 instead of the first ones.
        viewport().setRenderedRange({ start: 12, end: 19 });
        await settle(fixture);

        expect(getOption(fixture, 'Item 1')).toBeUndefined();
        expect(getOption(fixture, 'Item 15')).toBeDefined();

        await click(fixture, 'Item 15');

        expect(control.value).toEqual(['Item 15']);

        // Back to the top: the first selection is gone from the list as well.
        viewport().setRenderedRange({ start: 0, end: 7 });
        await settle(fixture);

        expect(getOption(fixture, 'Item 1')!.selected).toBe(false);
        expect(control.value).toEqual(['Item 15']);
    });
});
