import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqSkeletonModule } from './module';
import { KbqSkeleton } from './skeleton';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [
            {
                provide: KBQ_WINDOW,
                useValue: {
                    getComputedStyle: (_: Element) => ({
                        getPropertyValue: (prop: string) =>
                            prop === '--kbq-skeleton-animation-duration' ? `1200ms` : ''
                    })
                }
            },
            ...providers
        ]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getSkeletonDebugElements = (fixture: ComponentFixture<unknown>): DebugElement[] =>
    fixture.debugElement.queryAll(By.directive(KbqSkeleton));

const getSkeletonAnimationDelay = (debugElement: DebugElement): string =>
    debugElement.nativeElement.style.getPropertyValue('--kbq-skeleton-animation-delay');

@Component({
    selector: 'test-skeleton',
    imports: [KbqSkeleton],
    template: `
        <kbq-skeleton />
        @defer (on timer(100ms)) {
            <kbq-skeleton />
        }
    `
})
export class TestSkeleton {}

describe(KbqSkeletonModule.name, () => {
    it('should start second skeleton animation with delay', fakeAsync(() => {
        const fixture = createComponent(TestSkeleton);

        expect(getSkeletonDebugElements(fixture).length).toBe(1);
        expect(getSkeletonAnimationDelay(getSkeletonDebugElements(fixture)[0])).toBe('0ms');

        tick(200);

        expect(getSkeletonDebugElements(fixture).length).toBe(2);
        expect(getSkeletonAnimationDelay(getSkeletonDebugElements(fixture)[1])).toBe('-100ms');
    }));
});
