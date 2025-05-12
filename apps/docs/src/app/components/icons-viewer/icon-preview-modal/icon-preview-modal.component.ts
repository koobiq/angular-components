import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon, KbqIconModule } from '@koobiq/components/icon';
import { KbqModalModule, KbqModalRef } from '@koobiq/components/modal';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { IconItem } from 'src/app/services/icon-items';
import { DocsLocaleState } from 'src/app/services/locale';

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
        KbqBadgeModule
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

    @Input() iconItem: IconItem;

    SVGLink: string;

    readonly themePalettes = [
        KbqComponentColors.Theme,
        KbqComponentColors.Contrast,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Success,
        KbqComponentColors.Warning
    ];

    selectedColorTheme: KbqComponentColors | string = KbqComponentColors.Contrast;

    readonly componentColors = KbqComponentColors;

    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly httpClient = inject(HttpClient);
    readonly modal = inject(KbqModalRef);

    ngAfterViewInit(): void {
        this.SVGLink = `assets/SVGIcons/${this.iconItem.id}.svg`;
    }

    onTagSelect(tag: string): void {
        this.modal.close(tag);
    }

    copyCodeExample(): void {
        this.clipboard.copy(this.getCodeExampleText());
        this.showSuccessfullyCopiedToast();
    }

    copyWordExample(): void {
        this.clipboard.copy(this.wordExample.nativeElement.innerText);
        this.showSuccessfullyCopiedToast();
    }

    copySVG(): void {
        this.httpClient.get(this.SVGLink, { responseType: 'text' }).subscribe((data) => {
            this.clipboard.copy(data);
            this.showSuccessfullyCopiedToast();
        });
    }

    getHexColor(): string | null {
        if (!this.iconPreview) {
            return null;
        }

        const color = window
            .getComputedStyle(this.iconPreview.elementRef.nativeElement, null)
            .getPropertyValue('color');

        return color ? this.parseColor(color)?.toUpperCase() : '';
    }

    getCodeExampleText(): string {
        const color =
            this.selectedColorTheme === KbqComponentColors.Contrast ? '' : ` [color]="'${this.selectedColorTheme}'"`;

        return `<i kbq-icon="${this.iconItem.cssClass}"${color}></i>`;
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
