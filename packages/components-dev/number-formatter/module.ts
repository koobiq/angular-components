import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule, KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    standalone: true,
    imports: [
        KbqLocaleServiceModule,
        KbqButtonModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqFormFieldModule,
        FormsModule,
        KbqIconModule,
        DevLocaleSelector
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value = 1000.123;
}
