import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KBQ_LOCALE_SERVICE, KbqFormattersModule, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Number-formatter
 */
@Component({
    standalone: true,
    selector: 'number-formatter-overview-example',
    templateUrl: 'number-formatter-overview-example.html',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqFormattersModule,
        KbqInputModule
    ],
    styles: `
        :host {
            .light-text-secondary {
                color: #ccc;
            }

            .row-border {
                padding: 8px;
                border-bottom: 1px solid #ccc;
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
