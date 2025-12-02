import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTreeBase, KbqTreeNode } from './tree-base';

/** @docs-private */
@Directive()
export class KbqTreeNodeToggleBaseDirective<T> {
    @Input() node: T;

    @Input('kbqTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: any) {
        this._recursive = coerceBooleanProperty(value);
    }

    private _recursive = false;

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    get iconState(): boolean {
        return this.tree.treeControl.isExpanded(this.node);
    }

    constructor(
        private tree: KbqTreeBase<T>,
        private treeNode: KbqTreeNode<T>
    ) {
        this.tree.treeControl.filterValue.subscribe((value) => (this.disabled = !!value?.length));
    }

    toggle(event: Event): void {
        if (this.disabled) {
            return;
        }

        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}

@Component({
    selector: 'kbq-tree-node-toggle',
    imports: [
        KbqIcon
    ],
    template: `
        <ng-content>
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </ng-content>
    `,
    styleUrls: ['./toggle.scss', './tree-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTreeNodeToggle',
    host: {
        class: 'kbq-tree-node-toggle',
        '[class.kbq-expanded]': 'iconState',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    }
})
export class KbqTreeNodeToggleComponent<T> extends KbqTreeNodeToggleBaseDirective<T> {}

@Directive({
    selector: '[kbq-tree-node-toggle], [kbqTreeNodeToggle]',
    exportAs: 'kbqTreeNodeToggle',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)',
        class: 'kbq-tree-node-toggle'
    }
})
export class KbqTreeNodeToggleDirective<T> extends KbqTreeNodeToggleBaseDirective<T> {}
