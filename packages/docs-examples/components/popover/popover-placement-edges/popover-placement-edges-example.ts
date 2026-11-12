import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Popover placement edges
 */
@Component({
    selector: 'popover-placement-edges-example',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqInputModule,
        KbqToggleModule
    ],
    templateUrl: 'popover-placement-edges-example.html',
    styles: `
        .popover-placement-edges-example {
            display: flex;
            column-gap: 16px;
        }

        .popover-placement-edges-example__column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
        }

        .popover-placement-edges-example__column button {
            width: 100%;
        }

        .popover-placement-edges-example__column button + button {
            margin-top: 52px;
        }

        .popover-placement-edges-example__column.middle button + button {
            margin-top: 136px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverPlacementEdgesExample extends BaseLocalizedExample<ExampleTranslation> {
    placements = PopUpPlacements;
    activePopover: KbqPopoverTrigger;
    protected arrowCentered = false;

    constructor() {
        super(TRANSLATIONS);
    }
}
