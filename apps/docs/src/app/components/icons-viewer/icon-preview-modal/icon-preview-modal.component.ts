import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT, NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    model,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW, KbqComponentColors } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon, KbqIconModule } from '@koobiq/components/icon';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef } from '@koobiq/components/modal';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsIconItem } from 'src/app/services/icon-items';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsCodeSnippetDirective } from '../../code-snippet/code-snippet';

export type DocsIconPreviewModalData = {
    iconItem: DocsIconItem;
};

@Component({
    selector: 'docs-icon-preview-modal-component',
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
    templateUrl: './icon-preview-modal.template.html',
    styleUrls: ['./icon-preview-modal.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsIconPreviewModalComponent extends DocsLocaleState {
    private readonly icon = viewChild.required('iconPreview', { read: KbqIcon });

    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly httpClient = inject(HttpClient);
    protected readonly modal = inject(KbqModalRef);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);
    private readonly data = inject<DocsIconPreviewModalData>(KBQ_MODAL_DATA);

    protected readonly iconItem: DocsIconItem = this.data.iconItem;
    protected readonly svgLink = `assets/SVGIcons/${this.iconItem.id}.svg`;
    protected readonly unicode = `&#${this.iconItem.code};`;
    protected readonly componentColors = KbqComponentColors;
    protected readonly themePalettes = [
        KbqComponentColors.Theme,
        KbqComponentColors.Contrast,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Success,
        KbqComponentColors.Warning
    ];

    protected readonly color = model<KbqComponentColors | string>(KbqComponentColors.Contrast);
    protected readonly iconExample = computed(
        () => `<i kbq-icon="${this.iconItem.cssClass}" color="${this.color()}"></i>`
    );

    protected onTagSelect(tag: string): void {
        this.modal.close(tag);
    }

    protected copySVG(): void {
        this.httpClient.get(this.svgLink, { responseType: 'text' }).subscribe((data) => {
            if (this.clipboard.copy(this.setSvgFillColor(data, this.getComputedIconColor() || 'currentColor'))) {
                this.toastService.show({
                    style: 'success',
                    title: this.isRuLocale() ? 'Скопировано' : 'Copied'
                });
            }
        });
    }

    protected downloadSVG(): void {
        this.httpClient.get(this.svgLink, { responseType: 'text' }).subscribe((data) => {
            const svg = this.setSvgFillColor(data, this.getComputedIconColor() || 'currentColor');
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const anchor = this.document.createElement('a');

            anchor.href = url;
            anchor.download = `${this.iconItem.id}.svg`;
            anchor.click();

            URL.revokeObjectURL(url);
        });
    }

    protected getHexColor(): string | null {
        const oklch = this.getComputedIconColor();

        if (!oklch || !oklch.startsWith('oklch')) return null;

        return this.oklchToHex(oklch);
    }

    private setSvgFillColor(svg: string, color: string): string {
        const parser = new DOMParser();
        const document = parser.parseFromString(svg, 'image/svg+xml');

        document.querySelector('svg')?.setAttribute('fill', color);

        return new XMLSerializer().serializeToString(document.documentElement);
    }

    private getComputedIconColor(): string | null {
        const icon = this.icon();

        if (!icon || typeof this.window.getComputedStyle !== 'function') return null;

        return this.window.getComputedStyle(icon.elementRef.nativeElement).getPropertyValue('color');
    }

    private oklchToHex(color: string): string | null {
        const canvas = this.document.createElement('canvas');

        canvas.width = canvas.height = 1;

        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);

        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        return `#${[r, g, b]
            .map((v) => v.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()}`;
    }
}
