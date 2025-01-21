import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { DocsLocale } from 'src/app/constants/locale';
import { DocStates } from 'src/app/services/doc-states';
import { DocsLocaleService } from 'src/app/services/locale.service';
import { DocCategory, DocumentationItems } from '../../services/documentation-items';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqLinkModule,
        RouterLink,
        AsyncPipe,
        DocsRegisterHeaderDirective,
        AsyncPipe
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

    private readonly elementRef = inject(ElementRef);
    private readonly docStates = inject(DocStates);
    private readonly docItems = inject(DocumentationItems);
    readonly docsLocaleService = inject(DocsLocaleService);

    readonly DocsLocale = DocsLocale;

    constructor(private readonly themeService: ThemeService) {
        fromEvent(this.elementRef.nativeElement, 'scroll')
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
