import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectExampleText } from './l10n';

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
    protected readonly text = injectExampleText();

    readonly members = computed<Record<string, string>[]>(() => [
        { name: 'Alex Unipraise', role: this.text().editor },
        { name: 'Serge Vox', role: this.text().editor },
        { name: 'Rick Brick', role: this.text().viewer },
        { name: 'Viber Curly', role: this.text().viewer },
        { name: 'Jackie Ckang', role: this.text().viewer },
        { name: 'Robert Skinner', role: this.text().viewer },
        { name: 'Woodie Hoodie', role: this.text().viewer },
        { name: 'Alex Buckmaster', role: this.text().viewer },
        { name: 'Chris Glasser', role: this.text().viewer },
        { name: 'Corina McCoy', role: this.text().viewer }
    ]);
    protected readonly componentColors = KbqComponentColors;
}
