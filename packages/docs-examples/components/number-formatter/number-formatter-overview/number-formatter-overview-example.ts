import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    KbqNormalizeWhitespace
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Number-formatter
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'number-formatter-overview-example',
    templateUrl: 'number-formatter-overview-example.html',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqNormalizeWhitespace
    ],
    styles: `
        :host {
            .light-text-secondary {
                color: var(--kbq-foreground-contrast-secondary);
            }

            .row-border {
                padding: var(--kbq-size-s);
                border-bottom: 1px solid var(--kbq-line-contrast-less);
            }
        }
    `
})
export class NumberFormatterOverviewExample {
    protected localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE);
    protected changeDetectorRef = inject(ChangeDetectorRef);

    value = 1000.123;

    constructor() {
        this.localeService.changes
            .pipe(distinctUntilChanged(), delay(0))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
