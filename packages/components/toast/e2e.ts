import { AfterViewInit, ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastComponent } from './toast.component';
import { KbqToastModule } from './toast.module';
import { KBQ_TOAST_FACTORY } from './toast.service';
import { KbqToastStyle } from './toast.type';

@Component({
    selector: 'e2e-toast-states',
    imports: [KbqToastModule, KbqIconModule, KbqLinkModule, KbqProgressBarModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <ng-template #toastIconTemplate>
                <i kbq-icon="kbq-play_16"></i>
            </ng-template>

            <ng-template #toastTitleTemplate>
                <p>my title my title my title my title my title my title my title my title</p>
            </ng-template>

            <ng-template #toastCaptionTemplate>
                my caption my caption my caption my caption my caption my caption my caption my caption
            </ng-template>

            <ng-template #toastContentTemplate>
                <kbq-progress-bar class="layout-margin-top-m layout-margin-bottom-m" [value]="50" />
            </ng-template>

            <ng-template #toastActionsTemplate>
                <a kbq-link pseudo>Кнопка 1</a>
                <a kbq-link pseudo>Кнопка 1</a>
            </ng-template>

            <kbq-toast-container
                #toastContainer
                style="flex-direction: row; align-self: flex-start; margin-bottom: 8px;"
            />
            <kbq-toast-container #toastContainer2 style="flex-direction: row; align-self: flex-start" />
        </div>
    `,
    styleUrls: ['../toast/toast-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToastStates'
    },
    providers: [
        {
            provide: KBQ_TOAST_FACTORY,
            useFactory: () => KbqToastComponent
        }
    ]
})
export class E2eToastStates implements AfterViewInit {
    @ViewChild('toastContainer') toastContainer: KbqToastContainerComponent;
    @ViewChild('toastContainer2') toastContainer2: KbqToastContainerComponent;

    @ViewChild('toastIconTemplate') toastIconTemplate: TemplateRef<any>;
    @ViewChild('toastTitleTemplate') toastTitleTemplate: TemplateRef<any>;
    @ViewChild('toastCaptionTemplate') toastCaptionTemplate: TemplateRef<any>;
    @ViewChild('toastContentTemplate') toastContentTemplate: TemplateRef<any>;
    @ViewChild('toastActionsTemplate') toastActionsTemplate: TemplateRef<any>;

    toastFactory = inject(KBQ_TOAST_FACTORY);

    ngAfterViewInit(): void {
        this.toastContainer.createToast(
            {
                title: 'Contrast title',
                style: KbqToastStyle.Contrast,

                caption: 'Contrast caption',

                content: 'Contrast content'
            },
            this.toastFactory,
            false
        );

        this.toastContainer.createToast(
            {
                title: 'Success title',
                style: KbqToastStyle.Success,

                caption: 'Success caption',

                content: 'Success content'
            },
            this.toastFactory,
            false
        );

        this.toastContainer.createToast(
            {
                title: 'Warning title',
                style: KbqToastStyle.Warning,

                caption: 'Warning caption',

                content: 'Warning content'
            },
            this.toastFactory,
            false
        );

        this.toastContainer.createToast(
            {
                title: 'Error title',
                style: KbqToastStyle.Error,

                caption: 'Error caption',

                content: 'Error content'
            },
            this.toastFactory,
            false
        );

        this.toastContainer2.createToast(
            {
                style: KbqToastStyle.Contrast,
                title: 'Long title Long title Long title Long title Long title Long title Long title Long title',

                caption: 'Long caption Long caption Long caption Long caption Long caption Long caption Long caption',

                content: 'Long content Long content Long content Long content Long content Long content Long content'
            },
            this.toastFactory,
            false
        );

        this.toastContainer2.createToast(
            {
                style: KbqToastStyle.Contrast,
                icon: this.toastIconTemplate,
                title: this.toastTitleTemplate,

                caption: this.toastCaptionTemplate,

                content: this.toastContentTemplate,
                actions: this.toastActionsTemplate
            },
            this.toastFactory,
            false
        );
    }
}
