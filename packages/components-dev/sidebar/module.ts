/* tslint:disable:no-console */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';
import { KbqButtonModule } from '../../components/button';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DemoComponent {
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

@NgModule({
    declarations: [
        DemoComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqSplitterModule,
        KbqButtonModule,
        KbqSidebarModule,
    ],
    bootstrap: [
        DemoComponent,
    ],
})
export class DemoModule {}
