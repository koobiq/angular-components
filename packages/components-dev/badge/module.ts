import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [KbqBadgeModule, KbqIconModule, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqBadgeColors;
}
