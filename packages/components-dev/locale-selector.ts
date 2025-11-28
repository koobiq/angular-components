import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

@Component({
    selector: 'dev-locale-selector',
    imports: [KbqFormFieldModule, KbqSelectModule, FormsModule],
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'devLocaleSelector'
})
export class DevLocaleSelector {
    readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    readonly locale = model(this.localeService?.id);

    constructor() {
        toObservable(this.locale)
            .pipe(takeUntilDestroyed())
            .subscribe((locale) => {
                if (locale) this.localeService?.setLocale(locale);
            });
    }
}
