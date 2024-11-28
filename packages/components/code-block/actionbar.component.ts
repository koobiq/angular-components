import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { filter } from 'rxjs/operators';
import {
    KBQ_CODE_BLOCK_CONFIGURATION,
    KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION,
    KbqCodeBlockConfiguration,
    KbqCodeBlockFile
} from './code-block.types';

@Component({
    selector: 'kbq-actionbar-block',
    templateUrl: './actionbar.component.html',
    styleUrls: ['./actionbar.component.scss'],
    host: {
        class: 'kbq-code-block-actionbar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqActionBarComponent implements AfterViewInit {
    @ViewChild('copyTooltip') copyTooltip: KbqTooltipTrigger;

    @Input() codeFiles: KbqCodeBlockFile[];
    @Input() selectedTabIndex = 0;
    @Input() multiLine: boolean;
    @Input() softWrap: boolean;
    @Input() canLoad: boolean;

    @Output() toggleSoftWrap = new EventEmitter<void>();
    @Output() downloadCode = new EventEmitter<void>();
    @Output() copyCode = new EventEmitter<void>();
    @Output() openExternalSystem = new EventEmitter<void>();

    copyTooltipText: string;
    /**
     * @docs-private
     */
    config: KbqCodeBlockConfiguration;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(KBQ_CODE_BLOCK_CONFIGURATION) protected configuration?: KbqCodeBlockConfiguration,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) protected localeService?: KbqLocaleService
    ) {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

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

    private updateLocaleParams = () => {
        this.config = this.configuration || this.localeService?.getParams('codeBlock');

        this.copyTooltipText = this.config.copyTooltip;

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.config = KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION;
    }
}
