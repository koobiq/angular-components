import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    imports: [KbqIconModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqComponentColors;
}
