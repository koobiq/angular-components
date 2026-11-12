import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Popover content
 */
@Component({
    selector: 'popover-content-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqInputModule,
        KbqIconModule,
        KbqPopoverModule
    ],
    templateUrl: 'popover-content-example.html',
    styleUrls: ['popover-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverContentExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly members = computed<Record<string, string>[]>(() => [
        { name: 'Alex Unipraise', role: this.t().editor },
        { name: 'Serge Vox', role: this.t().editor },
        { name: 'Rick Brick', role: this.t().viewer },
        { name: 'Viber Curly', role: this.t().viewer },
        { name: 'Jackie Ckang', role: this.t().viewer },
        { name: 'Robert Skinner', role: this.t().viewer },
        { name: 'Woodie Hoodie', role: this.t().viewer },
        { name: 'Alex Buckmaster', role: this.t().viewer },
        { name: 'Chris Glasser', role: this.t().viewer },
        { name: 'Corina McCoy', role: this.t().viewer }
    ]);
    protected readonly componentColors = KbqComponentColors;

    constructor() {
        super(TRANSLATIONS);
    }
}
