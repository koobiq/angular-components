import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { DocStates } from '../doс-states';
import { DocCategory, DocumentationItems } from '../documentation-items';
import { KbqTheme, ThemeService } from '@koobiq/components/core';


@Component({
    selector: 'docs-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    host: {
        class: 'docs-welcome kbq-scrollbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class WelcomeComponent implements OnInit, OnDestroy {
    readonly destroyed = new Subject<void>();
    docCategories: DocCategory[];
    currentTheme$: BehaviorSubject<KbqTheme>;

    constructor(
        private elementRef: ElementRef,
        private docStates: DocStates,
        private docItems: DocumentationItems,
        private themeService: ThemeService,
    ) {
        fromEvent(elementRef.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroyed),
                // tslint:disable-next-line:no-magic-numbers
                debounceTime(10)
            )
            .subscribe(this.checkOverflow);
    }

    ngOnInit(): void {
        this.docCategories = this.docItems.getCategories().filter(category => category.isPreviewed);
        this.currentTheme$ = this.themeService.current;
    }

    ngOnDestroy(): void {
        this.destroyed.next();
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    }
}
