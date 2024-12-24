import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    imports: [KbqIconModule, KbqLinkModule],
    selector: 'docs-copy-button',
    templateUrl: './copy-button.html',
    styleUrls: ['./copy-button.scss'],
    host: {
        class: 'docs-copy-button'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsCopyButtonComponent {
    @Input() contentToCopy: string;

    @Input() successLabelText = 'Скопировано';
    @Input() successLabelDisplayDelay = 1000;

    isLabelSuccessVisible = false;

    constructor(
        private clipboard: Clipboard,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    copyContent(): void {
        if (!this.contentToCopy) {
            return;
        }

        this.clipboard.copy(this.contentToCopy);
        this.isLabelSuccessVisible = true;

        setTimeout(() => {
            this.isLabelSuccessVisible = false;
            this.changeDetectorRef.markForCheck();
        }, this.successLabelDisplayDelay);
    }
}
