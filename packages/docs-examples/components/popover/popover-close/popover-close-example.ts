import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Popover close
 */
@Component({
    selector: 'popover-close-example',
    imports: [KbqInputModule, KbqButtonModule, KbqPopoverModule, KbqIconModule, KbqDropdownModule],
    templateUrl: 'popover-close-example.html',
    styleUrls: ['popover-close-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverCloseExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

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
}
