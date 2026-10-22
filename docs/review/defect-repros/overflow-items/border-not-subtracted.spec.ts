import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOverflowItems, KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { EMPTY } from 'rxjs';

// jsdom has no layout: every element reports the width set in its inline style, as a browser would for
// `box-sizing: border-box` (the border-box rect includes the borders).
const stubLayout = () =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = parseFloat(this.style?.width) || 0;
        const height = parseFloat(this.style?.height) || 0;

        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height } as DOMRect;
    });

@Component({
    selector: 'triage-bordered-container',
    imports: [KbqOverflowItemsModule],
    template: `
        <div
            kbqOverflowItems
            style="box-sizing: border-box; width: 102px"
            [style.border]="border()"
            [style.padding]="padding()"
        >
            @for (id of ids; track id) {
                <div style="width: 34px; flex-shrink: 0" [kbqOverflowItem]="id">{{ id }}</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class BorderedContainer {
    readonly ids = ['A', 'B', 'C'];
    readonly border = signal('1px solid black');
    readonly padding = signal('0px');
}

const setup = async (border: string, padding: string) => {
    vi.useFakeTimers();
    stubLayout();
    TestBed.configureTestingModule({
        imports: [BorderedContainer],
        providers: [{ provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }]
    });
    const fixture = TestBed.createComponent(BorderedContainer);

    fixture.componentInstance.border.set(border);
    fixture.componentInstance.padding.set(padding);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(20);
    fixture.detectChanges();

    return fixture.debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems);
};

describe('triage: KbqOverflowItems border', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('control: 1px of padding on each side is subtracted, so 102px of items in a 100px content box hide one', async () => {
        const directive = await setup('0px none', '0px 1px');

        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
    });

    it('DEFECT: a 1px border on each side is not subtracted, so 102px of items in a 100px content box are all left visible', async () => {
        const directive = await setup('1px solid black', '0px');

        expect(directive.hiddenItemIDs().size).toBe(0);
    });
});
