import { Component, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { KbqNavbar, KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarDemoComponent {
    popUpPlacements = PopUpPlacements;

    @ViewChild('verticalNavbar', { static: false }) navbar: KbqNavbar;

    readonly minNavbarWidth: number = 940;

    get collapsedNavbarWidth(): number {
        return this._collapsedNavbarWidth;
    }

    set collapsedNavbarWidth(value: number) {
        if (value < this.minNavbarWidth) {
            return;
        }

        this._collapsedNavbarWidth = value;
    }

    componentModal: KbqModalRef;

    private _collapsedNavbarWidth: number = 1280;

    constructor(private modalService: KbqModalService) {}

    collapsedNavbarWidthChange() {
        this.navbar.updateExpandedStateForItems();
    }

    onItemClick(event: MouseEvent) {
        alert(`innerText: ${(<HTMLElement>event.target).innerText}`);
    }

    openModal() {
        this.componentModal = this.modalService.confirm({
            kbqMaskClosable: true,
            kbqContent: 'content',
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });
    }
}

@NgModule({
    declarations: [NavbarDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqNavbarModule,
        KbqIconModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqPopoverModule,
        KbqToolTipModule,
        KbqModalModule,
        KbqBadgeModule,
        KbqDividerModule
    ],
    bootstrap: [NavbarDemoComponent]
})
export class DemoModule {}
