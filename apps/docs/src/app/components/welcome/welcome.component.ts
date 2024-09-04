import { Component, DestroyRef, ElementRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '@koobiq/components/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
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
export class WelcomeComponent implements OnInit {
    docCategories: DocCategory[];
    currentTheme$: Observable<string>;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private elementRef: ElementRef,
        private docStates: DocStates,
        private docItems: DocumentationItems,
        private themeService: ThemeService
    ) {
        fromEvent(elementRef.nativeElement, 'scroll')
            .pipe(debounceTime(10), takeUntilDestroyed(this.destroyRef))
            .subscribe(this.checkOverflow);
    }

    ngOnInit(): void {
        this.docCategories = this.docItems.getCategories().filter((category) => category.isPreviewed);
        this.currentTheme$ = this.themeService.current.pipe(
            map((currentTheme) => currentTheme.className.replace('theme-', ''))
        );
        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    };
}
