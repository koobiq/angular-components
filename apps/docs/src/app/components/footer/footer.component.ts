import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsLanguagePreferences } from 'src/app/services/preferences';
import { docsKoobiqVersion } from '../../version';
import { DocsVersionPickerDirective } from '../version-picker/version-picker.directive';

@Component({
    selector: 'docs-footer',
    imports: [
        KbqIconModule,
        KbqLinkModule,
        KbqDropdownModule,
        DocsVersionPickerDirective
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-footer'
    }
})
export class DocsFooterComponent extends DocsLocaleState {
    private readonly languagePreferences = inject(DocsLanguagePreferences);

    readonly version = docsKoobiqVersion;
    readonly examplesLanguageSwitch = this.languagePreferences.examplesLanguageSwitch;
    readonly docsLanguageSwitch = this.languagePreferences.docsLanguageSwitch;

    get selectedLanguages(): string {
        if (this.docsLanguageSwitch.currentValue.value === this.examplesLanguageSwitch.currentValue.value) {
            return this.examplesLanguageSwitch.currentValue.value;
        }

        return `${this.docsLanguageSwitch.currentValue.value}, ${this.examplesLanguageSwitch.currentValue.value}`;
    }
}
