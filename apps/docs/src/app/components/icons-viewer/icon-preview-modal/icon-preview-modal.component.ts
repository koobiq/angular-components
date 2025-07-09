import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    Input,
    model,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW, KbqComponentColors } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon, KbqIconModule } from '@koobiq/components/icon';
import { KbqModalModule, KbqModalRef } from '@koobiq/components/modal';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsIconItem } from 'src/app/services/icon-items';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsCodeSnippetDirective } from '../../code-snippet/code-snippet';

@Component({
    standalone: true,
    imports: [
        TitleCasePipe,
        KbqIconModule,
        KbqFormFieldModule,
        KbqSelectModule,
        NgClass,
        KbqButtonModule,
        KbqModalModule,
        KbqDlModule,
        KbqToolTipModule,
        KbqBadgeModule,
        DocsCodeSnippetDirective
    ],
    selector: 'docs-icon-preview-modal-component',
    templateUrl: './icon-preview-modal.template.html',
    styleUrls: ['./icon-preview-modal.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsIconPreviewModalComponent extends DocsLocaleState implements AfterViewInit {
    @ViewChild('iconPreview') iconPreview: KbqIcon;
    @ViewChild('wordExample') wordExample: ElementRef;

    @Input() iconItem: DocsIconItem;

    svgLink: string;

    readonly themePalettes = [
        KbqComponentColors.Theme,
        KbqComponentColors.Contrast,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Success,
        KbqComponentColors.Warning
    ];

    readonly componentColors = KbqComponentColors;

    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly httpClient = inject(HttpClient);
    readonly modal = inject(KbqModalRef);
    private readonly window = inject(KBQ_WINDOW);

    readonly selectedColorTheme = model<KbqComponentColors | string>(KbqComponentColors.Contrast);
    readonly codeExampleText = computed(() => {
        const selectedColorTheme = this.selectedColorTheme();
        const color = selectedColorTheme === KbqComponentColors.Contrast ? '' : ` [color]="'${selectedColorTheme}'"`;

        return `<i kbq-icon="${this.iconItem.cssClass}"${color}></i>`;
    });

    ngAfterViewInit(): void {
        this.svgLink = `assets/SVGIcons/${this.iconItem.id}.svg`;
    }

    onTagSelect(tag: string): void {
        this.modal.close(tag);
    }

    copySVG(): void {
        this.httpClient.get(this.svgLink, { responseType: 'text' }).subscribe((data) => {
            this.clipboard.copy(data);
            this.showSuccessfullyCopiedToast();
        });
    }

    getHexColor(): string | null {
        if (!this.iconPreview) {
            return null;
        }

        const color = this.window
            .getComputedStyle(this.iconPreview.elementRef.nativeElement, null)
            .getPropertyValue('color');

        return color ? this.parseColor(color)?.toUpperCase() : '';
    }

    getUnicode(): string {
        return `&#${this.iconItem.code};`;
    }

    private showSuccessfullyCopiedToast() {
        this.toastService.show({
            style: 'success',
            title: this.isRuLocale() ? 'Скопировано' : 'Copied'
        });
    }

    private parseColor(color: string) {
        const toHex = (int: number) => {
            const hex = int.toString(16);

            return hex.length === 1 ? `0${hex}` : hex;
        };

        const arr: number[] = [];

        color.match(/[\d+\.]+/g)!.forEach((substring: string) => arr.push(parseFloat(substring)));

        return `${arr.slice(0, 3).map(toHex).join('')}`;
    }
}
