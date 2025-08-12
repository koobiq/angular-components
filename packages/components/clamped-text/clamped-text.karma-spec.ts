import { ChangeDetectionStrategy, Component, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqClampedText } from './clamped-text';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText],
    template: `
        <div class="layout-margin-bottom-l" [style.max-width.px]="maxWidth()" [style.width.px]="maxWidth()">
            <kbq-clamped-text (isCollapsedChange)="collapsed.set($event)">
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
    readonly collapsed = signal<boolean | undefined>(undefined);
    readonly maxWidth = signal(500);
    readonly clampedText = viewChild(KbqClampedText);
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');

    onCollapsedChange(_$event) {
        console.log('onCollapsedChange');
    }
}

describe('KbqClampedText', () => {
    describe('with default parameters', () => {
        it('should emit collapsed change on state change', async () => {
            const fixture = createComponent(TestClampedTextDefault);
            const { debugElement, componentInstance } = fixture;
            const textContainer: HTMLDivElement | undefined = debugElement.query(
                By.css('.kbq-clamped-text__content')
            ).nativeElement;

            textContainer?.dispatchEvent(new Event('resize'));
            componentInstance.maxWidth.set(200);
            fixture.detectChanges();

            await fixture.whenStable();

            expect(componentInstance.collapsed()).not.toBeUndefined();
            expect(componentInstance.collapsed()).toBeTrue();
        });
    });

    xdescribe('when collapsed state set from outside', () => {});
});
