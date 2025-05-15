import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqSelectModule } from '@koobiq/components/select';

@Component({
    standalone: true,
    imports: [KbqFormFieldModule, KbqSelectModule, FormsModule],
    selector: 'dev-locale-selector',
    template: `
        @if (localeService) {
            <kbq-form-field>
                <kbq-select [(ngModel)]="locale">
                    @for (option of localeService.locales.items; track option.id) {
                        <kbq-option [value]="option.id">{{ option.name }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        } @else {
            <div>No provider for KBQ_LOCALE_SERVICE</div>
        }
    `,
    exportAs: 'devLocaleSelector',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevLocaleSelector {
    readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    readonly locale = model(this.localeService!.id);

    constructor() {
        toObservable(this.locale)
            .pipe(takeUntilDestroyed())
            .subscribe((locale) => {
                this.localeService?.setLocale(locale);
            });
    }
}
