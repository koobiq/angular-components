import { Component, DebugElement, Provider, Type, signal } from '@angular/core';
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
                    }),
                    performance: {
                        now: () => Date.now()
                    }
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

@Component({
    selector: 'test-skeleton-disabled',
    imports: [KbqSkeleton],
    template: `
        <div [kbqSkeleton]="firstEnabled()"></div>
        <div [kbqSkeleton]="secondEnabled()"></div>
    `
})
export class TestSkeletonDisabled {
    readonly firstEnabled = signal(false);
    readonly secondEnabled = signal(false);
}

describe(KbqSkeletonModule.name, () => {
    it('should start second skeleton animation with delay', fakeAsync(() => {
        const fixture = createComponent(TestSkeleton);

        expect(getSkeletonDebugElements(fixture).length).toBe(1);
        expect(getSkeletonAnimationDelay(getSkeletonDebugElements(fixture)[0])).toBe('0ms');

        tick(200);

        expect(getSkeletonDebugElements(fixture).length).toBe(2);
        expect(getSkeletonAnimationDelay(getSkeletonDebugElements(fixture)[1])).toBe('-100ms');
    }));

    it('should add kbq-skeleton_disabled class when disabled', fakeAsync(() => {
        const fixture = createComponent(TestSkeletonDisabled);
        const [first, second] = getSkeletonDebugElements(fixture);

        expect(first.nativeElement.classList).toContain('kbq-skeleton_disabled');
        expect(second.nativeElement.classList).toContain('kbq-skeleton_disabled');

        fixture.componentInstance.firstEnabled.set(true);
        fixture.detectChanges();

        expect(first.nativeElement.classList).not.toContain('kbq-skeleton_disabled');
        expect(second.nativeElement.classList).toContain('kbq-skeleton_disabled');
    }));

    it('should sync animation when disabled changes', fakeAsync(() => {
        const fixture = createComponent(TestSkeletonDisabled);

        const [first, second] = getSkeletonDebugElements(fixture);

        expect(getSkeletonAnimationDelay(first)).toBe('');
        expect(getSkeletonAnimationDelay(second)).toBe('');

        fixture.componentInstance.secondEnabled.set(true);
        fixture.detectChanges();

        tick(150);

        fixture.componentInstance.firstEnabled.set(true);
        fixture.detectChanges();

        expect(getSkeletonAnimationDelay(first)).toBe('-150ms');
        expect(getSkeletonAnimationDelay(second)).toBe('0ms');
    }));
});
