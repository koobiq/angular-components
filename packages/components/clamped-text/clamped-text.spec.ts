import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Injectable, signal, Type } from '@angular/core';
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
            <kbq-clamped-text (isCollapsedChange)="onCollapseChanged($event)">
                {{ text }}
            </kbq-clamped-text>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestClampedTextDefault {
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');

    readonly collapsed = signal<boolean | undefined>(undefined);

    onCollapseChanged($event: boolean): void {
        this.collapsed.set($event);
    }
}

describe('KbqClampedText', () => {
    it('should emit collapsed change on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        jest.spyOn(componentInstance, 'onCollapseChanged');

        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalled();
    });

    it('should set collapsed by default on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        const previousCollapsedState = componentInstance.collapsed();

        await fixture.whenStable();

        expect(componentInstance.collapsed()).not.toEqual(previousCollapsedState);
        expect(componentInstance.collapsed()).toBe(false);
    });
});
