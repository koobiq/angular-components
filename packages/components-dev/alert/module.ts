import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    imports: [KbqAlertModule, KbqIconModule, KbqButtonModule, KbqLinkModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly colors = KbqComponentColors;
    readonly alertColors = KbqAlertColors;
    readonly alertStyles = KbqAlertStyles;
    readonly buttonStyles = KbqButtonStyles;
}
