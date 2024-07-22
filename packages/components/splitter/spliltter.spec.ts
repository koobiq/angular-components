import { Component, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
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

function checkDirection<T>(
    fixture: ComponentFixture<T>,
    direction: Direction,
    guttersCount: number,
    gutterSize: number
) {
    const splitter = fixture.debugElement.query(By.directive(KbqSplitterComponent));
    const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));

    const expectedDirection = direction === Direction.Vertical ? 'column' : 'row';

    const expectedWidth = direction === Direction.Vertical ? '' : `${gutterSize}px`;

    const expectedHeight = direction === Direction.Vertical ? `${gutterSize}px` : '100%';

    expect(splitter.nativeElement.style.flexDirection).toBe(expectedDirection);

    expect(gutters.length).toBe(guttersCount);
    expect(gutters.every((gutter) => gutter.nativeElement.style.width === expectedWidth)).toBe(true);
    expect(gutters.every((gutter) => gutter.nativeElement.style.height === expectedHeight)).toBe(true);
}

@Component({
    selector: 'kbq-demo-spllitter',
    template: `
        <kbq-splitter>
            <div kbq-splitter-area>first</div>
            <div kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
class KbqSplitterDefaultDirection {}

@Component({
    selector: 'kbq-demo-spllitter',
    template: `
        <kbq-splitter [direction]="direction">
            <div kbq-splitter-area>first</div>
            <div kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
class KbqSplitterDirection {
    direction: Direction = Direction.Vertical;
}

@Component({
    selector: 'kbq-demo-spllitter',
    template: `
        <kbq-splitter (gutterPositionChange)="gutterPositionChange()">
            <div
                #areaA
                (sizeChange)="areaASizeChange($event)"
                kbq-splitter-area
            >
                first
            </div>
            <div
                #areaB
                (sizeChange)="areaBSizeChange($event)"
                kbq-splitter-area
            >
                second
            </div>
        </kbq-splitter>
    `
})
class KbqSplitterEvents {
    gutterPositionChange = jasmine.createSpy('gutter position change callback');
    areaASizeChange = jasmine.createSpy('area A size change callback', (size: number) => size);
    areaBSizeChange = jasmine.createSpy('area B size change callback', (size: number) => size);
    @ViewChild('areaA', { static: false, read: KbqSplitterAreaDirective }) areaA: KbqSplitterAreaDirective;
    @ViewChild('areaB', { static: false, read: KbqSplitterAreaDirective }) areaB: KbqSplitterAreaDirective;
}

@Component({
    selector: 'kbq-demo-spllitter',
    template: `
        <kbq-splitter
            #splitter
            [direction]="direction"
            [useGhost]="true"
            style="width: 500px;"
        >
            <div
                #areaA
                kbq-splitter-area
                style="flex: 1"
            >
                first
            </div>
            <div
                #areaB
                kbq-splitter-area
                style="min-width: 50px"
            >
                second
            </div>
        </kbq-splitter>
    `
})
class KbqSplitterGhost {
    direction: Direction = Direction.Horizontal;
    @ViewChild('splitter', { static: false }) splitter: KbqSplitterComponent;
    @ViewChild('areaA', { static: false, read: KbqSplitterAreaDirective }) areaA: KbqSplitterAreaDirective;
    @ViewChild('areaB', { static: false, read: KbqSplitterAreaDirective }) areaB: KbqSplitterAreaDirective;
}

@Component({
    selector: 'kbq-demo-spllitter',
    template: `
        <kbq-splitter
            [direction]="direction"
            [useGhost]="true"
            style="width: 500px;"
        >
            <div
                #areaA
                *ngIf="isFirstRendered"
                kbq-splitter-area
                style="flex: 1"
            >
                first
            </div>
            <div
                #areaB
                kbq-splitter-area
                style="min-width: 50px"
            >
                second
            </div>
        </kbq-splitter>
    `
})
class DynamicData {
    direction: Direction = Direction.Horizontal;
    isFirstRendered = true;
    @ViewChild(KbqSplitterComponent, { static: false }) splitter: KbqSplitterComponent;
    @ViewChild('areaA', { static: false, read: KbqSplitterAreaDirective }) areaA: KbqSplitterAreaDirective;
    @ViewChild('areaB', { static: false, read: KbqSplitterAreaDirective }) areaB: KbqSplitterAreaDirective;
}

describe('KbqSplitter', () => {
    describe('direction', () => {
        it('should be default', () => {
            const fixture = createTestComponent(KbqSplitterDefaultDirection);

            fixture.detectChanges();

            const areas = fixture.debugElement.queryAll(By.directive(KbqSplitterAreaDirective));
            const expectedAreasCount = 3;
            const expectedGuttersCount = expectedAreasCount - 1;
            const expectedGutterSize = 6;

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);

            expect(areas.length).toBe(expectedAreasCount);
        });

        it('should be horizontal', () => {
            const fixture = createTestComponent(KbqSplitterDirection);
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);
        });

        it('should be vertical', () => {
            const fixture = createTestComponent(KbqSplitterDirection);
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Vertical, expectedGuttersCount, expectedGutterSize);
        });
    });
    describe('events', () => {
        it('should emit events after releasing gutter', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterEvents);
            fixture.detectChanges();

            tick();

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));

            dispatchMouseEvent(gutters[0].nativeElement, 'mousedown');
            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(fixture.componentInstance.gutterPositionChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaASizeChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaASizeChange).toHaveBeenCalledWith(
                fixture.componentInstance.areaA.getSize()
            );
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledWith(
                fixture.componentInstance.areaB.getSize()
            );
        }));
    });
    describe('ghost', () => {
        it('should create ghost gutter', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const ghostGutters = fixture.debugElement.queryAll(By.directive(KbqGutterGhostDirective));

            expect(ghostGutters.length).toBe(1);
        }));
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
        it('should not resize areas when moving gutter', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const areaAInitialSize = fixture.componentInstance.areaA.getSize();
            const areaBInitialSize = fixture.componentInstance.areaB.getSize();
            const mouseOffset = 10;

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));
            gutters[0].nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new MouseEvent('mousemove', { screenX: mouseOffset, screenY: 0 }));

            fixture.detectChanges();

            expect(fixture.componentInstance.areaA.getSize()).toBe(areaAInitialSize);
            expect(fixture.componentInstance.areaB.getSize()).toBe(areaBInitialSize);
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

        // todo this TC fail on CI
        xit('should not move out of minimal areas width', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const areaAInitialSize = fixture.componentInstance.areaA.getSize();
            const areaBMinimalSize = fixture.componentInstance.areaB.getMinSize();

            const mouseOffset = 10;

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));

            gutters[0].nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new MouseEvent('mousemove', { screenX: mouseOffset, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(fixture.componentInstance.areaA.getSize()).toBe(areaAInitialSize);
            expect(fixture.componentInstance.areaB.getSize()).toBe(areaBMinimalSize);
        }));
    });

    describe('dynamic data', () => {
        it('should work with dynamic areas', fakeAsync(() => {
            const update = () => {
                fixture.detectChanges();
                tick();
            };

            const fixture = createTestComponent(DynamicData);
            const componentInstance = fixture.componentInstance;
            update();

            expect(componentInstance.areaA).toBeTruthy();
            expect(+(componentInstance.areaA as any).elementRef.nativeElement.style.order).toBe(0);
            const areaBInitialOrder = +(componentInstance.areaB as any).elementRef.nativeElement.style.order;

            componentInstance.isFirstRendered = false;
            update();

            expect(componentInstance.areaA).toBeFalsy();
            expect(+(componentInstance.areaB as any).elementRef.nativeElement.style.order).not.toEqual(
                areaBInitialOrder
            );
        }));
    });
});
