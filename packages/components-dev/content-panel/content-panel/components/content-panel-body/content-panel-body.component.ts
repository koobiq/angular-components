import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
    selector: 'ic-content-panel-body',
    templateUrl: './content-panel-body.component.html',
    styleUrl: './content-panel-body.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelBodyComponent {
    @Output()
    contentBottomOverflow = new EventEmitter<boolean>();

    @Output()
    contentTopOverflow = new EventEmitter<boolean>();
}
