import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    inject,
    input,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTreeBase, KbqTreeNode } from './tree-base';

/** @docs-private */
@Directive()
export class KbqTreeNodeToggleBaseDirective<T> {
    private tree = inject<KbqTreeBase<T>>(KbqTreeBase);
    private treeNode = inject<KbqTreeNode<T>>(KbqTreeNode);

    readonly node = input<T>(undefined!);

    /** Whether toggling expands or collapses the whole subtree instead of the node alone. */
    readonly recursive = input(false, { alias: 'kbqTreeNodeToggleRecursive', transform: booleanAttribute });

    /**
     * Backing input of `disabled`. Bind through the `disabled` attribute; read the `disabled` getter,
     * which also reports the toggle disabled while a filter is active.
     * @docs-private
     */
    readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

    /** Set while a filter is active: filtering already decides what is expanded. */
    private readonly filterDisabled = signal(false);

    private readonly disabledState = computed(() => this.disabledInput() || this.filterDisabled());

    get disabled(): boolean {
        return this.disabledState();
    }

    get iconState(): boolean {
        return this.tree.treeControl.isExpanded(this.node());
    }

    constructor() {
        this.tree.treeControl.filterValue
            .pipe(takeUntilDestroyed())
            .subscribe((value) => this.filterDisabled.set(!!value?.length));
    }

    toggle(event: Event): void {
        if (this.disabled) return;

        if (this.recursive()) {
            this.tree.treeControl.toggleDescendants(this.treeNode.data);
        } else {
            this.tree.treeControl.toggle(this.treeNode.data);
        }

        event.stopPropagation();
    }
}

@Component({
    selector: 'kbq-tree-node-toggle',
    imports: [KbqIcon],
    template: `
        <ng-content>
            <i kbq-icon="kbq-chevron-down-s_16" [color]="'contrast-fade'"></i>
        </ng-content>
    `,
    styleUrls: ['./toggle.scss', './tree-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree-node-toggle',
        // The expanded state is announced on the owning `treeitem` through `aria-expanded`, and the
        // Left/Right arrow keys drive it, so exposing the chevron as a second control would only add
        // a duplicate stop for assistive tech.
        'aria-hidden': 'true',
        '[class.kbq-expanded]': 'iconState',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    },
    exportAs: 'kbqTreeNodeToggle'
})
export class KbqTreeNodeToggleComponent<T> extends KbqTreeNodeToggleBaseDirective<T> {}

// No ARIA on this host: the directive is routinely applied to the `kbq-tree-option` element itself,
// where the option already owns `role`, `aria-disabled` and the rest of the treeitem semantics.
@Directive({
    selector: '[kbq-tree-node-toggle], [kbqTreeNodeToggle]',
    host: {
        '[attr.disabled]': 'disabled || null',
        '(click)': 'toggle($event)'
    },
    exportAs: 'kbqTreeNodeToggle'
})
export class KbqTreeNodeToggleDirective<T> extends KbqTreeNodeToggleBaseDirective<T> {}
