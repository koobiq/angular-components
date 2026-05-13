import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';
import { KbqRiskLevelModule } from '@koobiq/components/risk-level';

@Component({
    selector: 'dev-app',
    imports: [KbqRiskLevelModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    colors = KbqBadgeColors;
}
