import { CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createMouseEvent } from '@koobiq/components/core';
import { KbqListModule, KbqListOption, KbqListSelection, KbqListSelectionDroppedEvent } from '@koobiq/components/list';

@Component({
    imports: [KbqListModule],
    template: `
        <kbq-list-selection
            id="source-list"
            [connectedTo]="'target-list'"
            [draggable]="true"
            (dropped)="dropped = $event"
        >
            <kbq-list-option [value]="'source 0'">source 0</kbq-list-option>
            <kbq-list-option [value]="'source 1'">source 1</kbq-list-option>
            <kbq-list-option [value]="'source 2'">source 2</kbq-list-option>
        </kbq-list-selection>
        <kbq-list-selection id="target-list" [draggable]="true" (dropped)="dropped = $event">
            <kbq-list-option [value]="'target 0'">target 0</kbq-list-option>
            <kbq-list-option [value]="'target 1'">target 1</kbq-list-option>
            <kbq-list-option [value]="'target 2'">target 2</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    dropped: KbqListSelectionDroppedEvent | null = null;
}

describe('triage: lists connected by id', () => {
    it('DEFECT: the target list is shown as forbidden, and a drop at its top reports the source index', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const [sourceDebug, targetDebug] = fixture.debugElement.queryAll(By.directive(KbqListSelection));
        const source = sourceDebug.componentInstance as KbqListSelection;
        const sourceDropList = sourceDebug.injector.get(CdkDropList);
        const targetDropList = targetDebug.injector.get(CdkDropList);

        // CDK resolves the id to the target, so the drag can enter it and be dropped there.
        expect(sourceDropList.connectedTo).toEqual(['target-list']);
        expect(targetDropList.id).toBe('target-list');

        // jsdom performs no layout: the source sits at x 0..100, the target at x 200..300, options 20px tall.
        vi.spyOn(sourceDebug.nativeElement as HTMLElement, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            bottom: 60,
            left: 0,
            right: 100
        } as DOMRect);
        vi.spyOn(targetDebug.nativeElement as HTMLElement, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            bottom: 60,
            left: 200,
            right: 300
        } as DOMRect);
        [sourceDebug, targetDebug].forEach((list, listIndex) =>
            list.queryAll(By.directive(KbqListOption)).forEach(({ componentInstance }, index) => {
                vi.spyOn(
                    (componentInstance as KbqListOption).getHostElement(),
                    'getBoundingClientRect'
                ).mockReturnValue({
                    top: index * 20,
                    bottom: (index + 1) * 20,
                    left: listIndex * 200,
                    right: listIndex * 200 + 100
                } as DOMRect);
            })
        );

        const dragged = sourceDebug.queryAll(By.directive(KbqListOption))[1].componentInstance as KbqListOption;

        // Pointer above the first option of the target list, i.e. into the gap at index 0.
        source.onOptionDragMoved(dragged, { x: 250, y: 5 });
        fixture.detectChanges();

        expect(dragged.getHostElement().classList).toContain('kbq-list-option_drop-forbidden');

        // What `CdkDropList` emits when the option is released over the target list.
        targetDropList.dropped.emit({
            previousIndex: 1,
            currentIndex: 0,
            item: { data: { option: dragged } } as any,
            container: targetDropList,
            previousContainer: sourceDropList,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 250, y: 5 },
            event: createMouseEvent('mouseup')
        });
        fixture.detectChanges();

        expect(fixture.componentInstance.dropped!.container).toBe(targetDebug.componentInstance);
        expect(fixture.componentInstance.dropped!.previousIndex).toBe(1);
        // The pointer was at the top of the target list, yet the source index is reported.
        expect(fixture.componentInstance.dropped!.currentIndex).toBe(1);
    });
});
