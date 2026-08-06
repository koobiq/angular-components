import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { map } from 'rxjs/operators';
import { DocsDocStates } from 'src/app/services/doc-states';
import { DocsLocaleState } from 'src/app/services/locale';
import { docsGetCategories, DocsStructureCategory } from '../../structure';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    selector: 'docs-welcome',
    imports: [
        KbqIconModule,
        KbqLinkModule,
        RouterLink,
        NgOptimizedImage,
        DocsRegisterHeaderDirective
    ],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-welcome'
    },
    hostDirectives: [KbqScrollbar]
})
export class DocsWelcomeComponent extends DocsLocaleState implements OnInit {
    private readonly themeService = inject(ThemeService);

    protected structureCategories: DocsStructureCategory[];
    readonly currentTheme = toSignal(
        this.themeService.current.pipe(map((theme) => theme?.className.replace('kbq-', '') ?? 'light')),
        { initialValue: 'light' }
    );

    private readonly docStates = inject(DocsDocStates);
    private readonly scrollbar = inject(KbqScrollbar, { self: true });

    constructor() {
        super();

        this.scrollbar.initialized.subscribe(() => this.docStates.registerHeaderScrollContainer(this.scrollbar));
    }

    ngOnInit(): void {
        this.structureCategories = docsGetCategories().filter((category) => category.isPreviewed);
    }
}
