import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqTreeNode, KbqTreeOption } from '@koobiq/components/tree';

import { Directionality } from '@angular/cdk/bidi';
import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqTreeBase } from '@koobiq/components/tree';

@Component({
    standalone: true,
    selector: 'kbq-app-switcher-tree-option',
    exportAs: 'kbqAppSwitcherTreeOption',
    templateUrl: './app-switcher-tree-option.html',
    styleUrls: ['./app-switcher-tree-option.scss'],
    host: {
        class: 'kbq-app-switcher-tree-option',
        '[class.kbq-tree-option]': 'null'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: KbqTreeNode, useExisting: KbqAppSwitcherTreeOption },
        { provide: KbqTreeOption, useExisting: KbqAppSwitcherTreeOption }
    ]
})
export class KbqAppSwitcherTreeOption extends KbqTreeOption {}

@Directive({
    standalone: true,
    selector: '[kbqAppSwitcherTreeNodePadding]',
    exportAs: 'kbqAppSwitcherTreeNodePadding'
})
export class KbqAppSwitcherTreeNodePadding implements AfterViewInit {
    renderer = inject(Renderer2);
    nativeElement = inject(ElementRef).nativeElement;

    tree = inject(KbqTreeBase);
    treeNode = inject(KbqTreeNode);
    dir = inject(Directionality, { optional: true });

    private indent: number = 24;

    get leftPaddingForFirstLevel(): number {
        return 0;
    }

    /** CSS units used for the indentation value. */
    indentUnits = 'px';

    constructor() {
        this.dir?.change?.pipe(takeUntilDestroyed()).subscribe(() => this.setPadding());
    }

    ngAfterViewInit(): void {
        this.setPadding();
        this.addLevelClass();
    }

    paddingIndent(): string | null {
        const nodeLevel =
            this.treeNode.data && this.tree.treeControl.getLevel
                ? this.tree.treeControl.getLevel(this.treeNode.data)
                : 0;

        return nodeLevel > 0
            ? `${nodeLevel * this.indent}${this.indentUnits}`
            : `${this.leftPaddingForFirstLevel}${this.indentUnits}`;
    }

    private setPadding() {
        const padding = this.paddingIndent();
        const paddingProp = this.dir?.value === 'rtl' ? 'marginRight' : 'marginLeft';

        this.renderer.setStyle(this.nativeElement, paddingProp, padding);
    }

    private addLevelClass() {
        const nodeLevel =
            this.treeNode.data && this.tree.treeControl.getLevel
                ? this.tree.treeControl.getLevel(this.treeNode.data)
                : 0;

        const className = nodeLevel > 0 ? 'kbq-app-switcher-tree-option_nested' : 'kbq-app-switcher-tree-option_root';

        this.renderer.addClass(this.nativeElement, className);
    }
}
