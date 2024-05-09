import { Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { DocStates } from '../doс-states';


@Component({
    selector: 'docs-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    host: {
        class: 'docs-welcome kbq-scrollbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class WelcomeComponent implements OnDestroy {
    readonly destroyed = new Subject<void>();

    constructor(
        private elementRef: ElementRef,
        private docStates: DocStates
    ) {
        fromEvent(elementRef.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroyed),
                // tslint:disable-next-line:no-magic-numbers
                debounceTime(10)
            )
            .subscribe(this.checkOverflow);
    }

    ngOnDestroy(): void {
        this.destroyed.next();
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    }
}
