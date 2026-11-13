import { NgOptimizedImage } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    type OnInit,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, fromEvent } from 'rxjs';
import { KbqThemeService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { DocsDocStates } from 'src/app/services/doc-states';
import { DocsLocaleState } from 'src/app/services/locale';
import { docsGetCategories } from '../../structure';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    selector: 'docs-welcome',
    imports: [
        KbqIconModule,
        RouterLink,
        NgOptimizedImage,
        DocsRegisterHeaderDirective
    ],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-welcome'
    },
    hostDirectives: [KbqScrollbarViewport]
})
export class DocsWelcomeComponent extends DocsLocaleState implements OnInit {
    private readonly themeService = inject(KbqThemeService);

    protected readonly structureCategories = docsGetCategories().filter((category) => category.isPreviewed);
    readonly currentTheme = computed(() => this.themeService.colorScheme());

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly docStates = inject(DocsDocStates);

    constructor() {
        super();

        fromEvent(this.elementRef.nativeElement, 'scroll')
            .pipe(debounceTime(10), takeUntilDestroyed())
            .subscribe(this.checkOverflow);
    }

    ngOnInit(): void {
        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    checkOverflow = () => {
        this.docStates.viewerTopOverflown.next(this.elementRef.nativeElement.scrollTop > 0);
    };
}
