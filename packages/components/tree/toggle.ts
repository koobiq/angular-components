import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@koobiq/components/core';

import { KbqTreeBase, KbqTreeNode } from './tree-base';


/** @docs-private */
export class KbqTreeNodeToggleBase {}


/** @docs-private */
export const KbqTreeNodeToggleMixinBase:
    CanDisableCtor & typeof KbqTreeNodeToggleBase = mixinDisabled(KbqTreeNodeToggleBase);

/** @docs-private */
@Directive()
export class KbqTreeNodeToggleBaseDirective<T> extends KbqTreeNodeToggleMixinBase implements CanDisable {
    @Input() node: T;

    @Input('kbqTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: any) {
        this._recursive = coerceBooleanProperty(value);
    }

    private _recursive = false;

    get iconState(): boolean {
        return this.tree.treeControl.isExpanded(this.node);
    }

    constructor(private tree: KbqTreeBase<T>, private treeNode: KbqTreeNode<T>) {
        super();

        this.tree.treeControl.filterValue
            .subscribe((value) => this.disabled = !!value?.length);
    }

    toggle(event: Event): void {
        if (this.disabled) { return; }

        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}


@Component({
    selector: 'kbq-tree-node-toggle',
    exportAs: 'kbqTreeNodeToggle',
    template: `<i kbq-icon="mc-angle-down-S_16"></i>`,
    styleUrls: ['./toggle.scss'],
    host: {
        class: 'kbq-tree-node-toggle',
        '[class.kbq-expanded]': 'iconState',

        '[attr.disabled]': 'disabled || null',

        '(click)': 'toggle($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTreeNodeToggleComponent<T> extends KbqTreeNodeToggleBaseDirective<T> {}


@Directive({
    selector: '[kbq-tree-node-toggle], [kbqTreeNodeToggle]',
    exportAs: 'kbqTreeNodeToggle',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    }
})
export class KbqTreeNodeToggleDirective<T> extends KbqTreeNodeToggleBaseDirective<T> {}
