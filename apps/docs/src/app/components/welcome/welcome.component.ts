import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { DocCategory, DocumentationItems } from '../../services/documentation-items';
import { DocStates } from '../../services/doс-states';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqLinkModule,
        RouterLink,
        AsyncPipe,
        DocsRegisterHeaderDirective
    ],
    selector: 'docs-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    host: {
        class: 'docs-welcome kbq-scrollbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class DocsWelcomeComponent implements OnInit {
    docCategories: DocCategory[];
    currentTheme$: Observable<string>;

    constructor(
        private elementRef: ElementRef,
        private docStates: DocStates,
        private docItems: DocumentationItems,
        private themeService: ThemeService
    ) {
        fromEvent(elementRef.nativeElement, 'scroll')
            .pipe(debounceTime(10), takeUntilDestroyed())
            .subscribe(this.checkOverflow);
    }

    ngOnInit(): void {
        this.docCategories = this.docItems.getCategories().filter((category) => category.isPreviewed);
        this.currentTheme$ = this.themeService.current.pipe(
            map((currentTheme) => currentTheme.className.replace('kbq-', ''))
        );
        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    };
}
