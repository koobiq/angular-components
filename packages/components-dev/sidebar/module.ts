import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

@Component({
    standalone: true,
    imports: [
        KbqSplitterModule,
        KbqButtonModule,
        KbqSidebarModule,
        JsonPipe
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    direction = Direction;
    sidebarPositions = SidebarPositions;

    leftSidebarSidebarState: boolean = false;
    leftSplitterState: boolean = false;

    rightSidebarSidebarState: boolean = false;

    onStateChanged($event): void {
        console.log('onStateChanged: ', $event);
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
