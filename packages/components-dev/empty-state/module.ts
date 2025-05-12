import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { EmptyStateExamplesModule } from '../../docs-examples/components/empty-state';

@Component({
    standalone: true,
    imports: [FormsModule, KbqEmptyStateModule, KbqButtonModule, KbqIconModule, EmptyStateExamplesModule],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}
