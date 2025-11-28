import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule, KbqLocaleServiceModule, KbqNormalizeWhitespace } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-app',
    imports: [
        KbqLocaleServiceModule,
        KbqButtonModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqFormFieldModule,
        FormsModule,
        DevLocaleSelector,
        KbqNormalizeWhitespace
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value = 1000.123;
}
