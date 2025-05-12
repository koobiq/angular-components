import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    imports: [KbqAccordionModule, KbqIconModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
