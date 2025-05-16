import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, KbqSidebarPositions } from '@koobiq/components/sidebar';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

@Component({
    standalone: true,
    imports: [
        KbqSplitterModule,
        KbqButtonModule,
        KbqSidebarModule
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly direction = Direction;
    readonly sidebarPositions = KbqSidebarPositions;

    leftSidebarSidebarState: boolean = false;
    leftSplitterState: boolean = false;
    rightSidebarSidebarState: boolean = false;

    onStateChanged(event: boolean): void {
        console.log('onStateChanged: ', event);
    }

    toggleLeftSidebar() {
        this.leftSidebarSidebarState = !this.leftSidebarSidebarState;
    }

    toggleRightSidebar() {
        this.rightSidebarSidebarState = !this.rightSidebarSidebarState;
    }

    toggleLeftSplitterState() {
        this.leftSplitterState = !this.leftSplitterState;
    }
}
