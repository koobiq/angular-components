import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqIconModule } from '@koobiq/components/icon';
import { AccordionInteractiveElementsExample } from '../../docs-examples/components/accordion';

@Component({
    selector: 'dev-app',
    imports: [KbqAccordionModule, KbqIconModule, AccordionInteractiveElementsExample],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
