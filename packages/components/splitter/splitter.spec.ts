import { Component, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchMouseEvent } from '@koobiq/components/core';
import {
    Direction,
    KbqGutterDirective,
    KbqGutterGhostDirective,
    KbqSplitterAreaDirective,
    KbqSplitterComponent,
    KbqSplitterModule
} from './index';

// Mirrors the directive defaults in splitter.component.ts (KbqGutterDirective._size, KbqSplitterComponent._gutterSize).
const EXPECTED_GUTTER_SIZE = 6;

function createTestComponent<T>(component: Type<T>) {
    TestBed.resetTestingModule()
        .configureTestingModule({ imports: [KbqSplitterModule, component] })
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
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
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
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
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
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter (gutterPositionChange)="gutterPositionChange()">
            <div #areaA kbq-splitter-area (sizeChange)="areaASizeChange($event)">first</div>
            <div #areaB kbq-splitter-area (sizeChange)="areaBSizeChange($event)">second</div>
        </kbq-splitter>
    `
})
class KbqSplitterEvents {
    gutterPositionChange = jest.fn();
    areaASizeChange = jest.fn().mockImplementation((size: number) => size);
    areaBSizeChange = jest.fn().mockImplementation((size: number) => size);
    readonly areaA = viewChild.required('areaA', { read: KbqSplitterAreaDirective });
    readonly areaB = viewChild.required('areaB', { read: KbqSplitterAreaDirective });
}

@Component({
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter style="width: 500px;" [direction]="direction" [useGhost]="true">
            <div #areaA kbq-splitter-area style="flex: 1">first</div>
            <div #areaB kbq-splitter-area style="min-width: 50px">second</div>
        </kbq-splitter>
    `
})
class KbqSplitterGhost {
    direction: Direction = Direction.Horizontal;
    readonly areaA = viewChild.required('areaA', { read: KbqSplitterAreaDirective });
    readonly areaB = viewChild.required('areaB', { read: KbqSplitterAreaDirective });
}

@Component({
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter style="width: 500px;" [direction]="direction" [useGhost]="true">
            @if (isFirstRendered) {
                <div #areaA id="areaA" kbq-splitter-area style="flex: 1">first</div>
            }
            <div #areaB id="areaB" kbq-splitter-area style="min-width: 50px">second</div>
        </kbq-splitter>
    `
})
class DynamicData {
    direction: Direction = Direction.Horizontal;
    isFirstRendered = true;
    readonly areaA = viewChild('areaA', { read: KbqSplitterAreaDirective });
    readonly areaB = viewChild.required('areaB', { read: KbqSplitterAreaDirective });
}

describe('KbqSplitter', () => {
    describe('direction', () => {
        it('should default to horizontal direction', () => {
            const fixture = createTestComponent(KbqSplitterDefaultDirection);

            fixture.detectChanges();

            const areas = fixture.debugElement.queryAll(By.directive(KbqSplitterAreaDirective));
            const expectedAreasCount = 3;
            const expectedGuttersCount = expectedAreasCount - 1;

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, EXPECTED_GUTTER_SIZE);

            expect(areas.length).toBe(expectedAreasCount);
        });

        it('should lay out gutters horizontally', () => {
            const fixture = createTestComponent(KbqSplitterDirection);
            const expectedGuttersCount = 2;

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, EXPECTED_GUTTER_SIZE);
        });

        it('should lay out gutters vertically', () => {
            const fixture = createTestComponent(KbqSplitterDirection);
            const expectedGuttersCount = 2;

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Vertical, expectedGuttersCount, EXPECTED_GUTTER_SIZE);
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
                fixture.componentInstance.areaA().getSize()
            );
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledWith(
                fixture.componentInstance.areaB().getSize()
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

        it('should toggle ghost visibility class on mousedown / mouseup', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const gutter = fixture.debugElement.query(By.directive(KbqGutterDirective));
            const ghost = fixture.debugElement.query(By.directive(KbqGutterGhostDirective));

            expect(ghost.nativeElement.classList.contains('kbq-gutter-ghost_visible')).toBe(false);

            gutter.nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            expect(ghost.nativeElement.classList.contains('kbq-gutter-ghost_visible')).toBe(true);

            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(ghost.nativeElement.classList.contains('kbq-gutter-ghost_visible')).toBe(false);
        }));

        it('should toggle the dragged class on the gutter', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const gutter = fixture.debugElement.query(By.directive(KbqGutterDirective));

            expect(gutter.nativeElement.classList.contains('kbq-gutter_dragged')).toBe(false);

            gutter.nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            expect(gutter.nativeElement.classList.contains('kbq-gutter_dragged')).toBe(true);

            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(gutter.nativeElement.classList.contains('kbq-gutter_dragged')).toBe(false);
        }));

        it('should not resize areas while ghost is being dragged', fakeAsync(() => {
            const fixture = createTestComponent(KbqSplitterGhost);

            fixture.detectChanges();

            tick();

            const areaAInitialSize = fixture.componentInstance.areaA().getSize();
            const areaBInitialSize = fixture.componentInstance.areaB().getSize();
            const mouseOffset = 10;

            const gutters = fixture.debugElement.queryAll(By.directive(KbqGutterDirective));

            gutters[0].nativeElement.dispatchEvent(new MouseEvent('mousedown', { screenX: 0, screenY: 0 }));

            fixture.detectChanges();

            document.dispatchEvent(new MouseEvent('mousemove', { screenX: mouseOffset, screenY: 0 }));

            fixture.detectChanges();

            expect(fixture.componentInstance.areaA().getSize()).toBe(areaAInitialSize);
            expect(fixture.componentInstance.areaB().getSize()).toBe(areaBInitialSize);
        }));
    });

    describe('dynamic data', () => {
        it('should re-order remaining areas when an area is removed', fakeAsync(() => {
            const update = () => {
                fixture.detectChanges();
                tick();
            };

            const fixture = createTestComponent(DynamicData);
            const componentInstance = fixture.componentInstance;

            update();

            const orderOf = (ref: 'areaA' | 'areaB'): number =>
                +fixture.debugElement.query(By.css(`[kbq-splitter-area]#${ref}`)).nativeElement.style.order;

            expect(componentInstance.areaA()).toBeTruthy();
            expect(orderOf('areaA')).toBe(0);

            const areaBInitialOrder = orderOf('areaB');

            componentInstance.isFirstRendered = false;
            update();

            expect(componentInstance.areaA()).toBeFalsy();
            expect(orderOf('areaB')).not.toEqual(areaBInitialOrder);
        }));
    });
    describe('gutterSize', () => {
        it('should fall back to the default for a non-positive size', () => {
            const fixture = createTestComponent(KbqSplitterGutterSize);

            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, 2, EXPECTED_GUTTER_SIZE);

            fixture.componentInstance.gutterSize = 12;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, 2, 12);
        });
    });

    describe('valueless attributes', () => {
        it('should treat disabled, hideGutters and useGhost as true', () => {
            const fixture = createTestComponent(KbqSplitterValuelessAttributes);

            fixture.detectChanges();

            const splitter = fixture.debugElement.query(By.directive(KbqSplitterComponent))
                .componentInstance as KbqSplitterComponent;
            const gutter = fixture.debugElement.query(By.directive(KbqGutterDirective));

            expect(splitter.disabled()).toBe(true);
            expect(splitter.hideGutters()).toBe(true);
            expect(splitter.useGhost()).toBe(true);
            expect(gutter.nativeElement.style.display).toBe('none');
            expect(fixture.debugElement.query(By.directive(KbqGutterGhostDirective))).not.toBeNull();
        });
    });

    describe('reactive layout', () => {
        it('should re-apply the gutter layout when the direction changes after init', () => {
            const fixture = createTestComponent(KbqSplitterDirection);

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, 2, EXPECTED_GUTTER_SIZE);

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Vertical, 2, EXPECTED_GUTTER_SIZE);
        });
    });
});

@Component({
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter [gutterSize]="gutterSize">
            <div kbq-splitter-area>first</div>
            <div kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
class KbqSplitterGutterSize {
    gutterSize = 0;
}

@Component({
    selector: 'kbq-demo-splitter',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter disabled hideGutters useGhost>
            <div kbq-splitter-area>first</div>
            <div kbq-splitter-area>second</div>
        </kbq-splitter>
    `
})
class KbqSplitterValuelessAttributes {}
