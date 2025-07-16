import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
    selector: 'ic-content-panel-header',
    templateUrl: './content-panel-header.component.html',
    styleUrl: './content-panel-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelHeaderComponent {
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly KbqComponentColors = KbqComponentColors;

    @HostBinding('class.ic-sidepanel__header_shadow')
    isShadowRequired = false;

    @Input()
    hasCloseButton = false;
}
