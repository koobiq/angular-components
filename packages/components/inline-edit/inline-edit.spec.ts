import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, DebugElement, Directive, model, Provider, signal, TemplateRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ESCAPE, TAB } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { kbqDisableLegacyValidationDirectiveProvider, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';
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
    focusContainer: '.kbq-inline-edit__focus_container',
    terminalButtons: '.kbq-inline-edit__action-buttons',
    menuMask: '.kbq-inline-edit__menu-mask',
    menu: '.kbq-inline-edit__menu',
    overlay: '.cdk-overlay-pane',
    selectPanel: '.kbq-select__panel'
};

const simulateKeyboardFocus = <T>(fixture: ComponentFixture<T>, debugElement: DebugElement): void => {
    dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
    debugElement.nativeElement.focus();
    fixture.detectChanges();
};

const getInlineEditDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqInlineEdit));
};

const getInlineEditFocusContainerDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css(componentCssClasses.focusContainer));
};

const getMaskDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css(componentCssClasses.menuMask));
};

const getOverlayElement = (): HTMLElement | null => {
    return document.querySelector(componentCssClasses.overlay);
};

describe('KbqInlineEdit', () => {
    it('should setup with default parameters', () => {
        const { debugElement } = setup(TestComponent);

        expect(
            Object.keys(getInlineEditDebugElement(debugElement).classes).filter(
                (className) => !className.startsWith('ng-tns')
            )
        ).toMatchSnapshot();
    });

    it('should add css class when label provided', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;

        componentInstance.toggleLabelVisibility();
        fixture.detectChanges();

        expect(
            Object.keys(getInlineEditDebugElement(debugElement).classes).filter(
                (className) => !className.startsWith('ng-tns')
            )
        ).toMatchSnapshot();
    });

    it('should toggle mode on click / space / enter', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'onModeChange');

        const resetToInitialMode = () => {
            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
        };

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

            resetToInitialMode();
        });
    });

    it('should add css class on keyboard focus', () => {
        const fixture = setup(TestComponent);
        const { debugElement } = fixture;
        const focusContainer: DebugElement = getInlineEditFocusContainerDebugElement(debugElement);

        simulateKeyboardFocus(fixture, focusContainer);

        expect(focusContainer.classes['cdk-keyboard-focused']).toBeTruthy();
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

    it('should emit saved event on save button click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const saveButtonHTMLElement = document.querySelector(
            `${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`
        )!.firstElementChild as HTMLButtonElement | null;

        saveButtonHTMLElement?.click();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should emit saved event on ENTER keydown event', async () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();

        dispatchEvent(overlayElement!, createKeyboardEvent('keydown', ENTER, undefined, 'Enter'));
        await fixture.whenStable();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should emit canceled event on cancel terminal button click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const cancelButtonHTMLElement = document.querySelector(
            `${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`
        )!.lastElementChild as HTMLButtonElement | null;

        cancelButtonHTMLElement?.click();

        expect(componentInstance.cancel).toHaveBeenCalled();
    });

    it('should emit canceled event on ESCAPE keydown event', () => {
        const fixture = setup(TestWithTextareaControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();

        dispatchEvent(overlayElement!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));

        expect(componentInstance.cancel).toHaveBeenCalled();
    });

    it('should return previous value for control canceled event', async () => {
        const initialValue = 'TEST';
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.value = initialValue;
        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const cancelButtonHTMLElement = document.querySelector(
            `${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`
        )!.lastElementChild as HTMLButtonElement | null;

        const control = getOverlayElement()!.querySelector('input');

        control!.value = initialValue + ' UPDATED';
        control!.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        await fixture.whenStable();

        cancelButtonHTMLElement?.click();

        expect(componentInstance.cancel).toHaveBeenCalled();
        expect(componentInstance.value).toEqual(initialValue);
    });

    it('should emit saved event on CMD/CTRL + ENTER keydown event for TEXTAREA', async () => {
        let event: KeyboardEvent;
        const fixture = setup(TestWithTextareaControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();
        const target = overlayElement!.querySelector('.kbq-textarea');

        event = createKeyboardEvent('keydown', ENTER, target!, 'Enter');

        dispatchEvent(overlayElement!, event);

        expect(spyFn).not.toHaveBeenCalled();

        event = createKeyboardEvent('keydown', ENTER, target!, 'Enter');
        Object.defineProperties(event, {
            metaKey: { get: () => true },
            ctrlKey: { get: () => true }
        });
        dispatchEvent(overlayElement!, event);
        await fixture.whenStable();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should not toggle mode on menu click', () => {
        const fixture = setup(TestWithMenu);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const maskDebugElement = getMaskDebugElement(inlineEditDebugElement);
        const spyFn = jest.spyOn(componentInstance, 'onModeChange');

        maskDebugElement.query(By.css(componentCssClasses.menu)).nativeElement.click();

        expect(spyFn).not.toHaveBeenCalled();
    });

    it('should prevent close if control invalid', () => {
        const fixture = setup(TestWithValidatedControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();
        const target: HTMLTextAreaElement | null = overlayElement!.querySelector('.kbq-textarea');

        fixture.detectChanges();

        target?.focus();
        componentInstance.control.markAsTouched();
        componentInstance.control.updateValueAndValidity();
        fixture.detectChanges();

        const saveButtonHTMLElement = document.querySelector(
            `${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`
        )!.firstElementChild as HTMLButtonElement | null;

        saveButtonHTMLElement?.click();

        expect(spyFn).not.toHaveBeenCalled();
    });

    it('should open select panel on mode toggle', async () => {
        const fixture = setup(TestWithSelect);
        const { debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        await fixture.whenStable();

        expect(document.querySelector(componentCssClasses.selectPanel)).toBeTruthy();
    });
});

@Directive({
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

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [(ngModel)]="value" />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestComponent extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
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

    cancel = jest.fn();
}
@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInlineEditModule,
        KbqTextareaModule,
        KbqDropdownModule,
        KbqIconModule
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
        >
            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item>TEST</button>
            </kbq-dropdown>
            <i
                kbqInlineEditMenu
                kbq-icon-button="kbq-ellipsis-vertical_16"
                [kbqDropdownTriggerFor]="dropdown"
                [color]="'contrast-fade'"
            ></i>
            <div kbqInlineEditViewMode>
                @let viewValue = displayValue();
                @if (viewValue) {
                    <span>{{ viewValue }}</span>
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithMenu extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel() {}
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInlineEditModule,
        KbqTextareaModule
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

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithTextareaControl extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel = jest.fn();
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInlineEditModule,
        KbqTextareaModule,
        ReactiveFormsModule
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

            <div kbqInlineEditViewMode>
                @if (displayValue()) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [formControl]="control"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class TestWithValidatedControl extends BaseTestComponent {
    control = new FormControl('', Validators.required);
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.control.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.control.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel() {}
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInlineEditModule,
        KbqOptionModule,
        KbqSelectModule
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

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select placeholder="Placeholder" [(ngModel)]="selected">
                    <kbq-cleaner #kbqSelectCleaner />
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithSelect extends BaseTestComponent {
    value = '';
    readonly placeholder = 'Placeholder';
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly currentMode = signal('view');
    readonly displayValue = signal(this.value);
    readonly selected = model(this.options[0]);

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

    cancel = jest.fn();
}
