import { AfterContentInit, Directive, Inject, OnDestroy, Optional } from '@angular/core';
import { END, ESCAPE, HOME, SPACE } from '@koobiq/cdk/keycodes';
import { Subscription } from 'rxjs';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '../form-field';

@Directive({
    selector: 'kbq-select-trigger, [kbq-select-trigger]',
    standalone: true
})
export class KbqSelectTrigger {}

@Directive({
    selector: 'kbq-select-matcher, [kbq-select-matcher]',
    standalone: true
})
export class KbqSelectMatcher {}

@Directive({
    selector: 'kbq-select-footer, [kbq-select-footer]',
    host: { class: 'kbq-select__footer' },
    standalone: true
})
export class KbqSelectFooter {}

@Directive({
    selector: '[kbqSelectSearch]',
    exportAs: 'kbqSelectSearch',
    standalone: true,
    host: {
        '(keydown)': 'handleKeydown($event)'
    }
})
export class KbqSelectSearch implements AfterContentInit, OnDestroy {
    searchChangesSubscription: Subscription = new Subscription();

    isSearchChanged: boolean = false;

    get ngControl() {
        return this.formField.control.ngControl;
    }

    constructor(@Optional() @Inject(KBQ_FORM_FIELD_REF) protected formField: KbqFormFieldRef) {
        formField.canCleanerClearByEsc = false;
    }

    setPlaceholder(value: string): void {
        this.formField.control.placeholder = value;
    }

    hasPlaceholder(): boolean {
        return !!this.formField?.control.placeholder;
    }

    focus(): void {
        this.formField.focusViaKeyboard();
    }

    reset(): void {
        this.ngControl.reset();
    }

    value() {
        return this.formField.control.value;
    }

    ngAfterContentInit(): void {
        if (this.formField.control.controlType !== 'input') {
            throw Error('KbqSelectSearch does not work without kbqInput');
        }

        if (!this.ngControl) {
            throw Error('KbqSelectSearch does not work without ngControl');
        }

        Promise.resolve().then(() => {
            this.searchChangesSubscription = this.ngControl.valueChanges!.subscribe(() => {
                this.isSearchChanged = true;
            });
        });
    }

    ngOnDestroy(): void {
        this.searchChangesSubscription.unsubscribe();
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.keyCode === ESCAPE) {
            if (this.value()) {
                this.reset();
                event.stopPropagation();
            }
        }

        if ([SPACE, HOME, END].includes(event.keyCode)) {
            event.stopPropagation();
        }
    }
}

@Directive({
    selector: '[kbq-select-search-empty-result]',
    exportAs: 'kbqSelectSearchEmptyResult',
    standalone: true
})
export class KbqSelectSearchEmptyResult {}
