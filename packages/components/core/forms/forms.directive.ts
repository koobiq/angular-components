import { AfterContentInit, Directive, ElementRef, contentChildren, inject } from '@angular/core';

@Directive({
    selector: '.kbq-form__row, .kbq-form__fieldset, .kbq-form__legend',
    host: {
        '[class.kbq-form-row_margin]': 'margin'
    },
    exportAs: 'kbqFormElement'
})
export class KbqFormElement implements AfterContentInit {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    margin = false;

    isRow = false;
    isFieldSet = false;
    hasLegend = false;
    isHorizontal = false;

    readonly elements = contentChildren(KbqFormElement);

    ngAfterContentInit(): void {
        const classList = this.element.nativeElement.classList;

        this.isRow = classList.contains('kbq-form__row');
        this.isHorizontal = classList.contains('kbq-horizontal');

        this.isFieldSet = classList.contains('kbq-form__fieldset');

        if (this.isFieldSet && this.element.nativeElement.firstElementChild) {
            this.hasLegend = this.element.nativeElement.firstElementChild.classList.contains('kbq-form__legend');
        }
    }
}

@Directive({
    selector: '.kbq-form-vertical, .kbq-form-horizontal',
    host: {
        class: 'kbq-form'
    },
    exportAs: 'kbqForm'
})
export class KbqForm implements AfterContentInit {
    readonly elements = contentChildren(KbqFormElement);

    ngAfterContentInit(): void {
        this.handleElements(this.elements());
    }

    handleElements(elements: readonly KbqFormElement[]): void {
        elements.forEach((element, index) => {
            const nextElement: KbqFormElement | undefined = elements[index + 1];

            if (element.isFieldSet && !element.isHorizontal) {
                this.handleElements(element.elements());
            }

            element.margin = !!(nextElement && !nextElement.hasLegend);
        });
    }
}
