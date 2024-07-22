import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqModalRef } from '@koobiq/components/modal';
import { KbqToastService } from '@koobiq/components/toast';
import { IconItem } from 'src/app/components/icons-items/icon-items';

@Component({
    selector: 'icon-preview-modal-component',
    templateUrl: './icon-preview-modal.template.html',
    styleUrls: ['./icon-preview-modal.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconPreviewModalComponent implements AfterViewInit {
    @ViewChild('iconPreview') iconPreview: KbqIcon;
    @ViewChild('wordExample') wordExample: ElementRef;

    @Input() iconItem: IconItem;

    SVGLink: string;

    // tslint:disable-next-line:no-magic-numbers
    themePalettes = [
        KbqComponentColors.Theme,
        KbqComponentColors.Contrast,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Success
    ];

    selectedColorTheme: KbqComponentColors | string = KbqComponentColors.Theme;

    readonly componentColors = KbqComponentColors;

    constructor(
        public modal: KbqModalRef,
        private http: HttpClient,
        private clipboard: Clipboard,
        private toastService: KbqToastService
    ) {}

    ngAfterViewInit(): void {
        this.SVGLink = `assets/SVGIcons/${this.iconItem.cssClass}.svg`;
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
        this.http.get(this.SVGLink, { responseType: 'text' }).subscribe((data) => {
            this.clipboard.copy(data);
            this.showSuccessfullyCopiedToast();
        });
    }

    getHexColor(): string {
        if (!this.iconPreview) {
            return;
        }

        const color = window
            .getComputedStyle(this.iconPreview.elementRef.nativeElement, null)
            .getPropertyValue('color');

        return color ? this.parseColor(color)?.toUpperCase() : '';
    }

    getCodeExampleText(): string {
        return `<i kbq-icon="${this.iconItem.cssClass}"></i>`;
    }

    getUnicode(): string {
        return `&#${this.iconItem.code};`;
    }

    private showSuccessfullyCopiedToast() {
        this.toastService.show({ style: 'success', title: 'Скопировано' });
    }

    private parseColor(color: string) {
        const toHex = (int: number) => {
            const hex = int.toString(16);

            return hex.length === 1 ? `0${hex}` : hex;
        };

        const arr: number[] = [];

        color.match(/[\d+\.]+/g).forEach((substring: string) => arr.push(parseFloat(substring)));

        // tslint:disable-next-line: no-magic-numbers
        return `${arr.slice(0, 3).map(toHex).join('')}`;
    }
}
