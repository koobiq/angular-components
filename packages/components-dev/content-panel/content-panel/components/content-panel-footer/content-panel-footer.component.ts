import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
    selector: 'ic-content-panel-footer',
    templateUrl: './content-panel-footer.component.html',
    styleUrl: './content-panel-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelFooterComponent {
    @HostBinding('class.ic-sidepanel__footer_shadow')
    isShadowRequired = false;
}
