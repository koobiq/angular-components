import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule, KbqLocaleServiceModule, KbqNormalizeWhitespace } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-app',
    imports: [
        KbqLocaleServiceModule,
        KbqButtonModule,
        KbqFormattersModule,
        KbqInputModule,
        FormsModule,
        DevLocaleSelector,
        KbqNormalizeWhitespace
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    value = 1000.123;
}
