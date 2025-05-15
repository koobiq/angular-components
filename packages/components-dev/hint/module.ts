import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    imports: [KbqFormFieldModule, KbqIconModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    colors = KbqComponentColors;
}
