import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, inject, Injectable, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchEvent } from '@koobiq/cdk/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { KbqClampedText } from './clamped-text';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

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

const dispatchResize = (target: Node) => {
    return dispatchEvent(target, new Event('resize'));
};

@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText],
    template: `
        <div class="layout-margin-bottom-l" [style.max-width.px]="maxWidth()" [style.width.px]="maxWidth()">
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
    providers: [
        { provide: SharedResizeObserver, useClass: MockResizeObserver }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestClampedTextDefault {
    readonly collapsed = signal<boolean | undefined>(undefined);
    readonly maxWidth = signal(1000);
    readonly clampedText = viewChild(KbqClampedText);
    readonly resizeObserver = inject(SharedResizeObserver);
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');

    onCollapseChanged($event) {
        console.log($event);
    }
}

describe('KbqClampedText', () => {
    it('should emit collapsed change on state change', async () => {
        const fixture = createComponent(TestClampedTextDefault);
        const { debugElement, componentInstance } = fixture;
        const textContainer: HTMLDivElement | undefined = debugElement.query(
            By.css('.kbq-clamped-text__content')
        ).nativeElement;

        spyOn(componentInstance, 'onCollapseChanged');

        componentInstance.maxWidth.set(200);
        fixture.detectChanges();
        (componentInstance.resizeObserver as unknown as MockResizeObserver).changes.next([]);
        dispatchResize(textContainer!);

        await fixture.whenStable();

        expect(componentInstance.onCollapseChanged).toHaveBeenCalled();
    });
});
