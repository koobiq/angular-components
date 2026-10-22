import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOverflowItems, KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { EMPTY } from 'rxjs';

// jsdom has no layout: every element reports the width set in its inline style. A flex `gap` does not change
// the rects of the items in a browser either, it only moves them apart.
const stubLayout = () =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = parseFloat(this.style?.width) || 0;
        const height = parseFloat(this.style?.height) || 0;

        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height } as DOMRect;
    });

@Component({
    selector: 'triage-gap-container',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems style="width: 100px" [style.column-gap.px]="gap()">
            @for (id of ids; track id) {
                <div
                    style="width: 30px; flex-shrink: 0"
                    [kbqOverflowItem]="id"
                    [style.margin-right.px]="$last ? 0 : margin()"
                >
                    {{ id }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class GapContainer {
    readonly ids = ['A', 'B', 'C'];
    readonly gap = signal(0);
    readonly margin = signal(0);
}

const setup = async (gap: number, margin: number) => {
    vi.useFakeTimers();
    stubLayout();
    TestBed.configureTestingModule({
        imports: [GapContainer],
        providers: [{ provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }]
    });
    const fixture = TestBed.createComponent(GapContainer);

    fixture.componentInstance.gap.set(gap);
    fixture.componentInstance.margin.set(margin);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(20);
    fixture.detectChanges();

    return fixture.debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems);
};

describe('triage: KbqOverflowItems gap', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('control: 10px margins between three 30px items (110px) in a 100px container hide one', async () => {
        const directive = await setup(0, 10);

        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
    });

    it('DEFECT: a 10px gap between three 30px items (110px) in a 100px container is not counted, nothing is hidden', async () => {
        const directive = await setup(10, 0);

        expect(directive.hiddenItemIDs().size).toBe(0);
    });
});
