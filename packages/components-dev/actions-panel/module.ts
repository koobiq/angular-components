import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActionsPanelExamplesModule } from 'packages/docs-examples/components/actions-panel';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        ActionsPanelExamplesModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelDev {}
