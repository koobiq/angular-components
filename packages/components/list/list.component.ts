// todo пока не делаем, перенесено из материала, но у нас в доках таких простых списков нет.
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KbqLine, KbqLineSetter } from '@koobiq/components/core';

@Component({
    selector: 'kbq-list',
    host: { class: 'kbq-list' },
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqList {}

@Component({
    selector: 'kbq-list-item, a[kbq-list-item]',
    host: {
        class: 'kbq-list-item',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()'
    },
    templateUrl: './list-item.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqListItem implements AfterContentInit {
    @ContentChildren(KbqLine) lines: QueryList<KbqLine>;

    constructor(private elementRef: ElementRef) {}

    ngAfterContentInit() {
        // tslint:disable-next-line:no-unused-expression
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
