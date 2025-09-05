import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';

@Component({
    standalone: true,
    selector: 'kbq-app-switcher-tree',
    templateUrl: './app-switcher-tree.html',
    preserveWhitespaces: false,
    styleUrls: ['./app-switcher-tree.scss'],
    host: {
        class: 'kbq-app-switcher'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqAppSwitcherAnimations.state]
})
export class KbqAppSwitcherTree {}
