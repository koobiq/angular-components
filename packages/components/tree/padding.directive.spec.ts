import { Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { FlatTreeControl } from './control/flat-tree-control';
import { KbqTreeFlatDataSource, KbqTreeFlattener } from './data-source/flat-data-source';
import { KbqTreeModule } from './tree.module';

interface Node {
    name: string;
    children?: Node[];
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

/**
 * root
 *   child
 *     grandchild
 */
const DATA: Node[] = [{ name: 'root', children: [{ name: 'child', children: [{ name: 'grandchild' }] }] }];

abstract class TreeParams {
    treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );

    treeFlattener = new KbqTreeFlattener<Node, FlatNode>(
        (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );

    dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

    indent: number | string = 12;

    constructor() {
        this.dataSource.data = DATA;
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [kbqTreeNodePaddingIndent]="indent">
                <kbq-tree-node-toggle />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithToggle extends TreeParams {}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [kbqTreeNodePaddingIndent]="indent">
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithoutToggle extends TreeParams {}

describe('KbqTreeNodePadding', () => {
    /** Width the directive reserves for a toggle a row does not render itself. */
    const iconWidth = 24;
    /** The first level gives up two pixels to the focus outline the option draws around itself. */
    const firstLevelBorder = 2;

    const configure = (providers: any[] = []) =>
        TestBed.configureTestingModule({ imports: [KbqTreeModule], providers }).compileComponents();

    const paddings = (
        fixture: ComponentFixture<unknown>,
        property: 'paddingLeft' | 'paddingRight' = 'paddingLeft'
    ): string[] =>
        Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.kbq-tree-option')).map(
            (node) => node.style[property]
        );

    const render = <T extends TreeParams>(type: new (...args: any[]) => T, indent?: number | string) => {
        const fixture = TestBed.createComponent(type);

        if (indent !== undefined) {
            fixture.componentInstance.indent = indent;
        }

        fixture.detectChanges();
        fixture.componentInstance.treeControl.expandAll();
        fixture.detectChanges();

        return fixture;
    };

    describe('with a toggle in the default place', () => {
        beforeEach(() => configure());

        it('should indent every level by the default indent', () => {
            expect(paddings(render(TreeWithToggle))).toEqual([
                `${12 - firstLevelBorder}px`,
                `${12 + 12}px`,
                `${2 * 12 + 12}px`
            ]);
        });

        it('should honour a custom numeric indent', () => {
            expect(paddings(render(TreeWithToggle, 28))).toEqual([
                `${28 - firstLevelBorder}px`,
                `${28 + 28}px`,
                `${2 * 28 + 28}px`
            ]);
        });

        it('should honour the units of a string indent', () => {
            expect(paddings(render(TreeWithToggle, '10em'))).toEqual([
                `${10 - firstLevelBorder}em`,
                `${10 + 10}em`,
                `${2 * 10 + 10}em`
            ]);
        });

        it('should re-apply the padding when the indent changes', () => {
            const fixture = render(TreeWithToggle);

            fixture.componentInstance.indent = 40;
            fixture.detectChanges();

            expect(paddings(fixture)).toEqual([
                `${40 - firstLevelBorder}px`,
                `${40 + 40}px`,
                `${2 * 40 + 40}px`
            ]);
        });
    });

    describe('without a toggle', () => {
        beforeEach(() => configure());

        it('should reserve the toggle width so the labels still line up', () => {
            expect(paddings(render(TreeWithoutToggle))).toEqual([
                `${iconWidth + 12 - firstLevelBorder}px`,
                `${iconWidth + 12 + 12}px`,
                `${iconWidth + 2 * 12 + 12}px`
            ]);
        });
    });

    describe('in a right-to-left layout', () => {
        beforeEach(() => configure([{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }]));

        it('should indent from the right instead', () => {
            const fixture = render(TreeWithToggle);

            expect(paddings(fixture, 'paddingRight')).toEqual([
                `${12 - firstLevelBorder}px`,
                `${12 + 12}px`,
                `${2 * 12 + 12}px`
            ]);
            expect(paddings(fixture, 'paddingLeft')).toEqual(['', '', '']);
        });
    });
});
