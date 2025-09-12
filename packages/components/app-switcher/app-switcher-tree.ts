import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import {
    KBQ_TREE_OPTION_PARENT_COMPONENT,
    KbqTreeBase,
    KbqTreeModule,
    KbqTreeSelection
} from '@koobiq/components/tree';

@Component({
    standalone: true,
    selector: 'kbq-app-switcher-tree',
    template: '<ng-container kbqTreeNodeOutlet />',
    preserveWhitespaces: false,
    styleUrls: ['./app-switcher-tree.scss'],
    host: {
        class: 'kbq-app-switcher-tree',
        '[class.kbq-tree-selection]': 'null'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        KbqHighlightModule,
        KbqTreeModule,
        FormsModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KbqAppSwitcherTree),
            multi: true
        },
        { provide: KBQ_TREE_OPTION_PARENT_COMPONENT, useExisting: KbqAppSwitcherTree },
        { provide: KbqTreeBase, useExisting: KbqAppSwitcherTree }
    ]
})
export class KbqAppSwitcherTree extends KbqTreeSelection {}
