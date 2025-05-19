import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { ButtonFillAndStyleOnlyIconExample } from '../../docs-examples/components/button';

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule, KbqToolTipModule, ButtonFillAndStyleOnlyIconExample],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}
