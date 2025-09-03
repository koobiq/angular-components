import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, DebugElement, Directive, Provider, signal, TemplateRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TAB } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqInlineEdit } from './inline-edit';
import { KbqInlineEditModule } from './module';

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const componentCssClasses = {
    panel: '.kbq-inline-edit__panel',
    terminalButtons: '.kbq-inline-edit__action-buttons'
};

const simulateKeyboardFocus = <T>(fixture: ComponentFixture<T>, debugElement: DebugElement): void => {
    dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
    debugElement.nativeElement.focus();
    fixture.detectChanges();
};

const getInlineEditDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqInlineEdit));
};

describe('KbqInlineEdit', () => {
    it('should setup with default parameters', () => {
        const { debugElement } = setup(TestComponent);

        expect(getInlineEditDebugElement(debugElement).classes).toMatchSnapshot();
    });

    it('should add css class when label provided', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;

        componentInstance.toggleLabelVisibility();
        fixture.detectChanges();

        expect(getInlineEditDebugElement(debugElement).classes).toMatchSnapshot();
    });

    it('should toggle mode on click / space / enter', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'onModeChange');

        [
            () => inlineEditDebugElement.nativeElement.click(),
            () =>
                dispatchEvent(
                    inlineEditDebugElement.nativeElement,
                    createKeyboardEvent('keydown', ENTER, undefined, 'Enter')
                ),
            () =>
                dispatchEvent(
                    inlineEditDebugElement.nativeElement,
                    createKeyboardEvent('keydown', SPACE, undefined, 'Space')
                )
        ].forEach((event, index) => {
            event();
            fixture.detectChanges();

            expect(spyFn).toHaveBeenNthCalledWith(index * 2 + 1, 'edit');

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
        });
    });

    it('should add css class on keyboard focus', () => {
        const fixture = setup(TestComponent);
        const { debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        simulateKeyboardFocus(fixture, inlineEditDebugElement);

        expect(inlineEditDebugElement.classes['cdk-keyboard-focused']).toBeTruthy();
    });

    it('should have terminal buttons when provided', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        expect(
            document.querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)
        ).toBeTruthy();
    });

    it('should emit saved event on overlay outside click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();
        expect(spyFn).not.toHaveBeenCalled();

        document.body.click();
        fixture.detectChanges();
        expect(spyFn).toHaveBeenCalled();
    });

    it('should toggle menu visibility on hover / keyboard focus', () => {});
    it('should not toggle mode on menu click', () => {});
    it('should overlay have the same width', () => {});

    it('should emit saved event on save button click', () => {});
    it('should emit saved event on ENTER keydown event', () => {});
    it('should emit saved event on CMD/CTRL + ENTER keydown event for TEXTAREA', () => {});
    it('should emit canceled event on cancel terminal button click', () => {});
    it('should emit canceled event on escape keydown event', () => {});
    it('should return previous value for control canceled event', () => {});

    it('should prevent close if control invalid', () => {});
});

@Directive({
    standalone: true,
    selector: 'name'
})
export class BaseTestComponent {
    readonly showActions = signal<boolean | undefined>(undefined);
    readonly showTooltipOnError = signal(undefined);
    readonly validationTooltip = signal<string | TemplateRef<any> | undefined>(undefined);
    readonly disabled = signal(undefined);
    readonly editModeWidth = signal(undefined);
    readonly tooltipPlacement = signal<PopUpPlacements | undefined>(undefined);
}

@Component({
    standalone: true,
    selector: 'name',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqInlineEditModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            [showTooltipOnError]="showTooltipOnError()"
            [validationTooltip]="validationTooltip()"
            [disabled]="disabled()"
            [editModeWidth]="editModeWidth()"
            [tooltipPlacement]="tooltipPlacement()"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            @if (showLabel()) {
                <kbq-label>Label</kbq-label>
            }

            <ng-container *kbqInlineEditViewMode>
                <div>
                    @if (displayValue().length) {
                        {{ displayValue() }}
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <input kbqInput [placeholder]="placeholder" [(ngModel)]="value" />
                </kbq-form-field>
            </ng-container>
        </kbq-inline-edit>
    `
})
export class TestComponent extends BaseTestComponent {
    value = '';
    currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    toggleLabelVisibility() {
        this.showLabel.update((state) => !state);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel() {}
}
