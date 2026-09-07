import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { AfterViewInit, computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqTreeBase, KbqTreeNode } from './tree-base';
import { KbqTreeOption } from './tree-option.component';

/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;

@Directive({
    selector: '[kbqTreeNodePadding]',
    exportAs: 'kbqTreeNodePadding'
})
export class KbqTreeNodePadding<T> implements AfterViewInit {
    protected treeNode = inject<KbqTreeNode<T>>(KbqTreeNode);
    protected tree = inject<KbqTreeBase<T>>(KbqTreeBase);
    private renderer = inject(Renderer2);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    // Optional so the directive also works on a bare `kbq-tree-node`, which has no option around it.
    private option = inject(KbqTreeOption, { optional: true });
    private dir = inject(Directionality, { optional: true });
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this.setLevelInput(value);
    }

    private _level: number;

    /** Indentation added per nesting level. Accepts a bare number (px) or a value with CSS units. */
    readonly indent = input<number | string>(12, { alias: 'kbqTreeNodePaddingIndent' });

    private readonly parsedIndent = computed(() => {
        const indent = this.indent();

        if (typeof indent !== 'string') {
            return { value: coerceNumberProperty(indent), units: 'px' };
        }

        const [value, units] = indent.split(cssUnitPattern);

        return { value: coerceNumberProperty(value), units: units || 'px' };
    });

    get leftPadding(): number {
        return (this.withIcon ? 0 : this.iconWidth) + this.parsedIndent().value;
    }

    get leftPaddingForFirstLevel(): number {
        const border = 2;

        return (this.withIcon ? 0 : this.iconWidth) + this.parsedIndent().value - border;
    }

    /** CSS units used for the indentation value. */
    get indentUnits(): string {
        return this.parsedIndent().units;
    }

    withIcon: boolean;
    /**
     * Horizontal room a toggle takes up in a row: its own 16px box plus the option's 8px `gap`. A node
     * without a toggle reserves the same amount so its content lines up with a sibling that has one —
     * which is why widening the toggle itself pushes every branch row out of line.
     */
    iconWidth: number = 24;

    constructor() {
        this.dir?.change?.pipe(takeUntilDestroyed()).subscribe(() => this.setPadding());

        // The node the padding was computed from is gone once its view is reused, and the replacement
        // can sit at a different level.
        this.treeNode.refreshed.pipe(takeUntilDestroyed()).subscribe(() => this.setPadding());

        effect(() => {
            this.parsedIndent();

            this.setPadding();
        });
    }

    ngAfterViewInit(): void {
        this.withIcon = this.option?.isToggleInDefaultPlace ?? false;
        this.setPadding();
    }

    paddingIndent(): string | null {
        const treeControl = this.tree.treeControl;
        const nodeLevel = this.treeNode.data && treeControl.getLevel ? treeControl.getLevel(this.treeNode.data) : 0;

        const level = this.level || nodeLevel;
        const { value, units } = this.parsedIndent();

        return level > 0 ? `${level * value + this.leftPadding}${units}` : `${this.leftPaddingForFirstLevel}${units}`;
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    private setLevelInput(value: number) {
        // Set to null as the fallback value so that _setPadding can fall back to the node level if the
        // consumer set the directive as `kbqTreeNodePadding=""`. We still want to take this value if
        // they set 0 explicitly.
        this._level = coerceNumberProperty(value, null)!;
        this.setPadding();
    }

    private setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir?.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this.renderer.setStyle(this.element.nativeElement, paddingProp, padding);
    }
}
