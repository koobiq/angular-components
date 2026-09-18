import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';

/**
 * @title Navbar vertical item with an icon after the title
 */
@Component({
    selector: 'navbar-vertical-item-suffix-example',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: 'navbar-vertical-item-suffix-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalItemSuffixExample {}
