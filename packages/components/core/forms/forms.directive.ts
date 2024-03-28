import {
    AfterContentInit,
    ContentChildren,
    Directive,
    ElementRef,
    QueryList
} from '@angular/core';


@Directive({
    selector: '.kbq-form__row, .kbq-form__fieldset, .kbq-form__legend',
    exportAs: 'kbqFormElement',
    host: {
        '[class.kbq-form-row_margin]': 'margin'
    }
})
export class KbqFormElement implements AfterContentInit {
    margin = false;

    isRow = false;
    isFieldSet = false;
    hasLegend = false;
    isHorizontal = false;

    @ContentChildren(KbqFormElement) elements: QueryList<KbqFormElement>;

    constructor(private readonly element: ElementRef<HTMLElement>) {}

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
    exportAs: 'kbqForm',
    host: {
        class: 'kbq-form'
    }
})
export class KbqForm implements AfterContentInit {
    @ContentChildren(KbqFormElement) elements: QueryList<KbqFormElement>;

    ngAfterContentInit(): void {
        this.handleElements(this.elements);
    }

    handleElements(elements: QueryList<KbqFormElement>): void {
        elements.forEach((element, index) => {
            const nextElement: KbqFormElement | undefined = elements.get(index + 1);

            if (element.isFieldSet && !element.isHorizontal) {
                this.handleElements(element.elements);
            }

            element.margin = !!(nextElement && !nextElement.hasLegend);
        });
    }
}
