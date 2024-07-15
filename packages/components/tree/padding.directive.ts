import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';
import { TreeSizeIndentLevel } from '@koobiq/design-tokens';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KbqTreeBase, KbqTreeNode } from './tree-base';
import { KbqTreeOption } from './tree-option.component';

/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;

@Directive({
    selector: '[kbqTreeNodePadding]',
    exportAs: 'kbqTreeNodePadding',
})
export class KbqTreeNodePadding<T> implements OnDestroy, AfterViewInit {
    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this.setLevelInput(value);
    }

    private _level: number;

    @Input('kbqTreeNodePaddingIndent')
    get indent(): number | string {
        return this._indent;
    }

    set indent(indent: number | string) {
        this.setIndentInput(indent);
    }

    private _indent: number = parseInt(TreeSizeIndentLevel);

    get leftPadding(): number {
        return (this.withIcon ? 0 : this.iconWidth) + this.baseLeftPadding;
    }

    /** CSS units used for the indentation value. */
    indentUnits = 'px';

    baseLeftPadding: number = 8;

    withIcon: boolean;
    iconWidth: number = 24;

    private destroyed = new Subject<void>();

    constructor(
        protected treeNode: KbqTreeNode<T>,
        protected tree: KbqTreeBase<T>,
        private renderer: Renderer2,
        private element: ElementRef<HTMLElement>,
        private option: KbqTreeOption,
        @Optional() private dir: Directionality,
    ) {
        this.dir?.change?.pipe(takeUntil(this.destroyed)).subscribe(() => this.setPadding());
    }

    ngAfterViewInit(): void {
        this.withIcon = this.option.isToggleInDefaultPlace;
        this.setPadding();
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }

    paddingIndent(): string | null {
        const nodeLevel =
            this.treeNode.data && this.tree.treeControl.getLevel
                ? this.tree.treeControl.getLevel(this.treeNode.data)
                : 0;

        const level = this.level || nodeLevel;

        return level > 0 ? `${level * this._indent + this.leftPadding}px` : `${this.leftPadding}px`;
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
