import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Accordion header
 */
@Component({
    selector: 'accordion-header-example',
    imports: [KbqAccordionModule, KbqBadgeModule, KbqCheckboxModule, KbqIcon, KbqIconButton],
    templateUrl: 'accordion-header-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionHeaderExample {
    icon: boolean = false;
    caption: boolean = false;
    leftBadge: boolean = false;
    rightBadge: boolean = false;
    actions: boolean = false;
}
