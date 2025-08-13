import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    inject,
    Injectable,
    signal,
    Type,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { KbqClampedText } from './clamped-text';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    constructor() {
        super();
    }

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [
            ...providers,
            { provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getClampedTextToggleDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css('.kbq-clamped-text__toggle'));
};

@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText],
    template: `
        <div class="layout-margin-bottom-l" [style.max-width.px]="width()" [style.width.px]="width()">
            <kbq-clamped-text (isCollapsedChange)="onCollapseChanged($event)">
                {{ text }}
            </kbq-clamped-text>
        </div>
    `,
    styles: `
        :host {
            width: 1000px;
            max-width: 1000px;
        }

        :host > div {
            overflow: auto;
            min-width: 150px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestClampedTextDefault {
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');

    readonly collapsed = signal<boolean | undefined>(undefined);
    readonly width = signal(1000);
    readonly clampedText = viewChild(KbqClampedText);
    readonly resizeObserver = inject(SharedResizeObserver) as MockResizeObserver;

    onCollapseChanged($event) {
        console.log($event);
        this.collapsed.set($event);
    }
}

describe('KbqClampedText', () => {
    it('should emit collapsed change on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        spyOn(componentInstance, 'onCollapseChanged');

        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalled();
    });

    it('should emit collapsed change on state change', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        spyOn(componentInstance, 'onCollapseChanged');

        componentInstance.width.set(200);
        fixture.detectChanges();
        componentInstance.resizeObserver.changes.next([]);

        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalled();
    });

    it('should set collapsed by default on init', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        const previousCollapsedState = componentInstance.collapsed();

        fixture.detectChanges();

        await fixture.whenStable();
        expect(componentInstance.collapsed()).not.toEqual(previousCollapsedState);
        expect(componentInstance.collapsed()).toBeFalse();
    });

    it('should collapse by default if rows > n + 1 on resize', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { componentInstance } = fixture;

        const previousCollapsedState = componentInstance.collapsed();

        componentInstance.width.set(200);
        componentInstance.resizeObserver.changes.next([]);
        fixture.detectChanges();

        await fixture.whenStable();

        expect(componentInstance.collapsed()).not.toEqual(previousCollapsedState);
        expect(componentInstance.collapsed()).toBeTrue();
    });

    it('should toggle collapsedState on toggle click', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { debugElement, componentInstance } = fixture;

        componentInstance.width.set(200);
        componentInstance.resizeObserver.changes.next([]);
        fixture.detectChanges();

        const previousCollapsedState = componentInstance.collapsed();

        const clampedTextToggle = getClampedTextToggleDebugElement(debugElement)
            .nativeElement satisfies HTMLSpanElement;

        clampedTextToggle.click();

        await fixture.whenStable();

        expect(componentInstance.collapsed()).not.toEqual(previousCollapsedState);
    });

    it('should use toggled state of toggle button when has toggle', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { debugElement, componentInstance } = fixture;

        componentInstance.width.set(200);
        componentInstance.resizeObserver.changes.next([]);
        fixture.detectChanges();

        const clampedTextToggle = getClampedTextToggleDebugElement(debugElement)
            .nativeElement satisfies HTMLSpanElement;

        clampedTextToggle.click();

        await fixture.whenStable();

        expect(componentInstance.collapsed()).toBeFalse();

        componentInstance.width.set(1000);
        componentInstance.resizeObserver.changes.next([]);
        fixture.detectChanges();

        expect(componentInstance.collapsed()).toBeFalse();
    });
});
