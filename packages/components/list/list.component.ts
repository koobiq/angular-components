// todo пока не делаем, перенесено из материала, но у нас в доках таких простых списков нет.
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    QueryList,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { KbqLine, KbqLineSetter } from '@koobiq/components/core';

@Component({
    selector: 'kbq-list',
    template: '<ng-content />',
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-list' }
})
export class KbqList {}

@Component({
    selector: 'kbq-list-item, a[kbq-list-item]',
    templateUrl: './list-item.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-item',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()'
    },
    preserveWhitespaces: false
})
export class KbqListItem implements AfterContentInit {
    private elementRef = inject(ElementRef);

    @ContentChildren(KbqLine) lines: QueryList<KbqLine>;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}

    ngAfterContentInit() {
        new KbqLineSetter(this.lines, this.elementRef);
    }

    handleFocus() {
        this.elementRef.nativeElement.classList.add('kbq-focused');
    }

    handleBlur() {
        this.elementRef.nativeElement.classList.remove('kbq-focused');
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}
