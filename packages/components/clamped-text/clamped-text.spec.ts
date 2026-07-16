import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Injectable, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { KbqClampedText } from './clamped-text';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    selector: 'clamped-text-overview-example',
    imports: [KbqClampedText],
    template: `
        <div style="max-width: 1000px; width: 1000px; overflow: auto; min-width: 150px;">
            <kbq-clamped-text [isCollapsed]="isCollapsed()" (isCollapsedChange)="onCollapseChanged($event)">
                {{ text }}
            </kbq-clamped-text>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestClampedTextDefault {
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');

    readonly isCollapsed = signal<boolean | undefined>(undefined);
    readonly collapsed = signal<boolean | undefined>(undefined);

    onCollapseChanged($event: boolean): void {
        this.collapsed.set($event);
    }
}

@Component({
    selector: 'test-clamped-text-with-initial-state',
    imports: [KbqClampedText],
    template: `
        <kbq-clamped-text #clamped [isCollapsed]="isCollapsed()">
            {{ text }}
        </kbq-clamped-text>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestClampedTextWithInitialState {
    readonly clampedText = viewChild.required<KbqClampedText>('clamped');
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');
    readonly isCollapsed = signal<boolean | undefined>(false);
}

describe('KbqClampedText', () => {
    it('should emit collapsed change on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        jest.spyOn(componentInstance, 'onCollapseChanged');

        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalled();
    });

    it('should default to expanded state on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        const previousCollapsedState = componentInstance.collapsed();

        await fixture.whenStable();

        expect(componentInstance.collapsed()).not.toEqual(previousCollapsedState);
        expect(componentInstance.collapsed()).toBe(false);
    });

    it('should set isToggleCollapsed from isCollapsed=false on ngOnInit', async () => {
        const fixture = createComponent(TestClampedTextWithInitialState);

        await fixture.whenStable();

        const comp = fixture.componentInstance.clampedText();

        expect(comp.isToggleCollapsed()).toBe(false);
    });

    it('should not collapse when isCollapsed=false and resize observer fires with visible toggle', async () => {
        const fixture = createComponent(TestClampedTextWithInitialState);
        const mockResizeObserver = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

        await fixture.whenStable();

        const comp = fixture.componentInstance.clampedText();

        // Simulate text long enough to need clamping (hasToggle=true)
        comp.hasToggle.set(true);
        mockResizeObserver.changes.next([]);

        await fixture.whenStable();

        expect(comp.collapsedState()).toBe(false);
    });

    it('should emit isCollapsedChange when isCollapsed input changes', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        await fixture.whenStable();

        jest.spyOn(componentInstance, 'onCollapseChanged');

        componentInstance.isCollapsed.set(true);
        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalledWith(true);

        componentInstance.isCollapsed.set(false);
        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalledWith(false);
    });
});
