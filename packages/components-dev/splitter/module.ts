import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqSplitterModule, KbqIconModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    guttersVisibility = true;

    DIRECTION = Direction;

    toggleVisibility() {
        this.guttersVisibility = !this.guttersVisibility;
    }
}
