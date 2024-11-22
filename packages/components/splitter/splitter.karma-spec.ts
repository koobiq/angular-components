import { Component, Type, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    Direction,
    KbqGutterDirective,
    KbqGutterGhostDirective,
    KbqSplitterAreaDirective,
    KbqSplitterComponent,
    KbqSplitterModule
} from './index';

function createTestComponent<T>(component: Type<T>) {
    TestBed.resetTestingModule()
        .configureTestingModule({
            imports: [KbqSplitterModule],
            declarations: [component],
            providers: []
        })
        .compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    selector: 'kbq-demo-splitter',
    template: `
        <kbq-splitter #splitter [direction]="direction" [useGhost]="true" style="width: 500px;">
            <div #areaA kbq-splitter-area style="flex: 1">first</div>
            <div #areaB kbq-splitter-area style="min-width: 50px">second</div>
        </kbq-splitter>
    `
})
class KbqSplitterGhost {
    direction: Direction = Direction.Horizontal;
    @ViewChild('splitter', { static: false }) splitter: KbqSplitterComponent;
    @ViewChild('areaA', { static: false, read: KbqSplitterAreaDirective }) areaA: KbqSplitterAreaDirective;
    @ViewChild('areaB', { static: false, read: KbqSplitterAreaDirective }) areaB: KbqSplitterAreaDirective;
}

describe('KbqSplitter', () => {
    describe('ghost', () => {
        it('should display ghost gutter after mousedown and hide after mouseup', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));
            const ghostGutters = fixture.debugElement.queryAll(By.directive(KbqGutterGhostDirective));

            const elementStyleBeforeMouseDown = getComputedStyle(ghostGutters[0].nativeElement).display;

            gutters[0].nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            const elementStyleAfterMouseDown = getComputedStyle(ghostGutters[0].nativeElement).display;

            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            const elementStyleAfterMouseUp = getComputedStyle(ghostGutters[0].nativeElement).display;

            expect(elementStyleBeforeMouseDown === 'none').toBeTrue();
            expect(elementStyleAfterMouseDown === 'none').toBeFalse();
            expect(elementStyleAfterMouseUp === 'none').toBeTrue();
        }));

        it('should resize areas after releasing gutter', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const areaAInitialSize: number = fixture.componentInstance.areaA.getSize();
            const areaBInitialSize: number = fixture.componentInstance.areaB.getSize();
            const mouseOffset = -10;

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));
            gutters[0].nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new MouseEvent('mousemove', { screenX: mouseOffset, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(fixture.componentInstance.areaA.getSize()).toBe(areaAInitialSize + mouseOffset);
            expect(fixture.componentInstance.areaB.getSize()).toBe(areaBInitialSize - mouseOffset);
        }));
    });
});
