import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Directive, ElementRef, Input, Renderer2, inject } from '@angular/core';
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
    private option = inject(KbqTreeOption);
    private dir = inject(Directionality, { optional: true });
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this.setLevelInput(value);
    }

    private _level: number;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTreeNodePaddingIndent')
    get indent(): number | string {
        return this._indent;
    }

    set indent(indent: number | string) {
        this.setIndentInput(indent);
    }

    private _indent: number = 12;

    get leftPadding(): number {
        return (this.withIcon ? 0 : this.iconWidth) + this._indent;
    }

    get leftPaddingForFirstLevel(): number {
        const border = 2;

        return (this.withIcon ? 0 : this.iconWidth) + this._indent - border;
    }

    /** CSS units used for the indentation value. */
    indentUnits = 'px';

    withIcon: boolean;
    iconWidth: number = 24;

    constructor() {
        this.dir?.change?.pipe(takeUntilDestroyed()).subscribe(() => this.setPadding());
    }

    ngAfterViewInit(): void {
        this.withIcon = this.option.isToggleInDefaultPlace;
        this.setPadding();
    }

    paddingIndent(): string | null {
        const treeControl = this.tree.treeControl;
        const nodeLevel = this.treeNode.data && treeControl.getLevel ? treeControl.getLevel(this.treeNode.data) : 0;

        const level = this.level || nodeLevel;

        return level > 0 ? `${level * this._indent + this.leftPadding}px` : `${this.leftPaddingForFirstLevel}px`;
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

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    private setIndentInput(indent: number | string) {
        let value = indent;
        let units = 'px';

        if (typeof indent === 'string') {
            const parts = indent.split(cssUnitPattern);

            value = parts[0];
            units = parts[1] || units;
        }

        this.indentUnits = units;
        this._indent = coerceNumberProperty(value);
        this.setPadding();
    }

    private setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir?.value === 'rtl' ? 'paddingRight' : 'paddingLeft';

        this.renderer.setStyle(this.element.nativeElement, paddingProp, padding);
    }
}
