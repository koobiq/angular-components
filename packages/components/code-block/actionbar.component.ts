import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { filter } from 'rxjs/operators';
import { KbqCodeBlockConfiguration, KbqCodeFile } from './code-block.types';

@Component({
    selector: 'kbq-actionbar-block',
    templateUrl: './actionbar.component.html',
    styleUrls: ['./actionbar.component.scss'],
    host: {
        class: 'kbq-code-block-actionbar',
        '[class.kbq-code-block-actionbar_less-contrast]': 'lessContrast',
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbqActionBarComponent implements AfterViewInit {
    @ViewChild('copyTooltip') copyTooltip: KbqTooltipTrigger;

    @Input() config: KbqCodeBlockConfiguration;
    @Input() codeFiles: KbqCodeFile[];
    @Input() lessContrast: boolean;
    @Input() selectedTabIndex = 0;
    @Input() multiLine: boolean;
    @Input() softWrap: boolean;

    @Output() toggleSoftWrap = new EventEmitter<void>();
    @Output() downloadCode = new EventEmitter<void>();
    @Output() copyCode = new EventEmitter<void>();
    @Output() openExternalSystem = new EventEmitter<void>();

    copyTooltipText: string;

    ngAfterViewInit(): void {
        this.copyTooltipText = this.config.copyTooltip;

        this.copyTooltip.visibleChange.pipe(filter((state) => !state)).subscribe(() => {
            if (this.copyTooltipText === this.config.copiedTooltip) {
                this.copyTooltipText = this.config.copyTooltip;
            }
        });
    }

    onCopy() {
        this.copyCode.emit();

        setTimeout(() => {
            this.copyTooltipText = this.config.copiedTooltip;
            this.copyTooltip.show();
        });
    }
}
