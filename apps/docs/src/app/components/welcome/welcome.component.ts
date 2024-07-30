import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '@koobiq/components/core';
import { Observable, Subject, fromEvent } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { DocCategory, DocumentationItems } from '../documentation-items';
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
export class WelcomeComponent implements OnInit, OnDestroy {
    readonly destroyed = new Subject<void>();
    docCategories: DocCategory[];
    currentTheme$: Observable<string>;

    constructor(
        private elementRef: ElementRef,
        private docStates: DocStates,
        private docItems: DocumentationItems,
        private themeService: ThemeService
    ) {
        fromEvent(elementRef.nativeElement, 'scroll')
            .pipe(debounceTime(10), takeUntil(this.destroyed))
            .subscribe(this.checkOverflow);
    }

    ngOnInit(): void {
        this.docCategories = this.docItems.getCategories().filter((category) => category.isPreviewed);
        this.currentTheme$ = this.themeService.current.pipe(
            map((currentTheme) => currentTheme.className.replace('theme-', ''))
        );
        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.destroyed.next();
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    };
}
