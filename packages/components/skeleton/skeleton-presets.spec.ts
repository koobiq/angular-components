import { Component, Directive, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    KBQ_SKELETON_PRESETS_CONFIGURATION,
    KbqSkeletonAccordion,
    KbqSkeletonBadge,
    KbqSkeletonButton,
    KbqSkeletonCheckable,
    KbqSkeletonCheckableControl,
    KbqSkeletonDl,
    KbqSkeletonFormField,
    KbqSkeletonFormFieldControl,
    KbqSkeletonGroup,
    KbqSkeletonGroupPreset,
    KbqSkeletonIcon,
    KbqSkeletonLink,
    KbqSkeletonPresetsConfiguration,
    kbqSkeletonPresetsConfigurationProvider,
    KbqSkeletonTable,
    KbqSkeletonTabs,
    KbqSkeletonTag,
    KbqSkeletonTree,
    KbqSkeletonTypography
} from './skeleton-presets';

@Component({
    selector: 'test-skeleton-presets',
    imports: [KbqSkeletonTypography, KbqSkeletonDl, KbqSkeletonTable, KbqSkeletonGroup],
    template: `
        <kbq-skeleton-typography [lines]="lines()" />
        <kbq-skeleton-dl [rows]="rows()" />
        <kbq-skeleton-table
            [columns]="columns()"
            [header]="header()"
            [pinnedColumns]="pinnedColumns()"
            [rows]="rows()"
            [selectable]="selectable()"
        />
        <kbq-skeleton-group [count]="count()" [preset]="groupPreset()" />
    `
})
class TestPresets {
    readonly lines = signal<number | string>(3);
    readonly rows = signal<number | string>(3);
    readonly columns = signal<number | string | readonly string[]>(3);
    readonly header = signal(true);
    readonly selectable = signal(false);
    readonly pinnedColumns = signal(0);
    readonly count = signal(3);
    readonly groupPreset = signal<KbqSkeletonGroupPreset>('tag');
}

@Component({
    selector: 'test-skeleton-preset-defaults',
    imports: [KbqSkeletonTypography, KbqSkeletonDl, KbqSkeletonTable, KbqSkeletonGroup],
    template: `
        <kbq-skeleton-typography />
        <kbq-skeleton-dl />
        <kbq-skeleton-table />
        <kbq-skeleton-group preset="badge" />
    `
})
class TestPresetDefaults {}

@Component({
    selector: 'test-skeleton-elements',
    imports: [
        KbqSkeletonButton,
        KbqSkeletonBadge,
        KbqSkeletonTag,
        KbqSkeletonIcon,
        KbqSkeletonLink
    ],
    template: `
        <kbq-skeleton-button />
        <kbq-skeleton-badge />
        <kbq-skeleton-tag />
        <kbq-skeleton-icon />
        <kbq-skeleton-link />
    `
})
class TestElements {}

@Directive({
    selector: '[testClassMap]',
    host: { '[class]': '"test-class-map"' }
})
class TestClassMap {}

@Component({
    selector: 'test-skeleton-typography',
    imports: [KbqSkeletonTypography, TestClassMap],
    template: `
        <kbq-skeleton-typography testClassMap [level]="level()" />
    `
})
class TestTypography {
    readonly level = signal('text-normal');
}

@Component({
    selector: 'test-skeleton-component-preset-defaults',
    imports: [KbqSkeletonAccordion, KbqSkeletonCheckable, KbqSkeletonTabs, KbqSkeletonTree],
    template: `
        <kbq-skeleton-accordion />
        <kbq-skeleton-checkable />
        <kbq-skeleton-tabs />
        <kbq-skeleton-tree />
    `
})
class TestComponentPresetDefaults {}

@Component({
    selector: 'test-skeleton-component-presets',
    imports: [KbqSkeletonAccordion, KbqSkeletonCheckable, KbqSkeletonTabs, KbqSkeletonTree],
    template: `
        <kbq-skeleton-accordion [rows]="rows()" />
        <kbq-skeleton-checkable [control]="control()" [hint]="hint()" [label]="label()" [rows]="rows()" />
        <kbq-skeleton-tabs [contentLines]="rows()" [count]="rows()" [vertical]="vertical()" />
        <kbq-skeleton-tree [children]="children()" [rows]="rows()" />
    `
})
class TestComponentPresets {
    readonly rows = signal(3);
    readonly children = signal(3);
    readonly control = signal<KbqSkeletonCheckableControl>('checkbox');
    readonly label = signal(true);
    readonly hint = signal(false);
    readonly vertical = signal(false);
}

@Component({
    selector: 'test-skeleton-tabs-content',
    imports: [KbqSkeletonTabs, KbqSkeletonDl],
    template: `
        <kbq-skeleton-tabs>
            <kbq-skeleton-dl />
        </kbq-skeleton-tabs>
    `
})
class TestTabsContent {}

@Component({
    selector: 'test-skeleton-nested-configuration',
    imports: [KbqSkeletonTypography, KbqSkeletonDl, KbqSkeletonTable],
    template: `
        <kbq-skeleton-typography />
        <kbq-skeleton-dl />
        <kbq-skeleton-table />
    `,
    providers: [kbqSkeletonPresetsConfigurationProvider({ dlRows: 2 })]
})
class TestNestedConfiguration {}

@Component({
    selector: 'test-skeleton-form-field',
    imports: [KbqSkeletonFormField],
    template: `
        <kbq-skeleton-form-field
            [contentClass]="contentClass()"
            [control]="control()"
            [hint]="hint()"
            [horizontal]="horizontal()"
            [label]="label()"
            [labelClass]="labelClass()"
        />
    `
})
class TestFormField {
    readonly horizontal = signal(false);
    readonly control = signal<KbqSkeletonFormFieldControl>('input');
    readonly hint = signal(false);
    readonly label = signal(true);
    readonly labelClass = signal<string | undefined>(undefined);
    readonly contentClass = signal<string | undefined>(undefined);
}

const createFixture = <T>(component: new () => T): ComponentFixture<T> => {
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const query = (fixture: ComponentFixture<unknown>, selector: string): HTMLElement =>
    fixture.nativeElement.querySelector(selector);

const count = (fixture: ComponentFixture<unknown>, selector: string): number =>
    fixture.nativeElement.querySelectorAll(selector).length;

describe('KbqSkeleton presets', () => {
    it('should show a line of text and three items of a list by default', () => {
        const fixture = createFixture(TestPresetDefaults);

        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(1);
        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(3);
        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__description')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(9);
        expect(count(fixture, 'kbq-skeleton-group > .kbq-skeleton')).toBe(3);
    });

    it('should make the element of every element preset the skeleton itself', () => {
        const fixture = createFixture(TestElements);
        const elements: HTMLElement[] = Array.from(fixture.nativeElement.children);

        expect(elements.length).toBe(5);
        elements.forEach((element) => {
            expect(element.classList).toContain('kbq-skeleton');
            expect(element.classList).toContain(element.localName);
            expect(element.hasAttribute('inert')).toBe(true);
            expect(element.children.length).toBe(0);
        });
    });

    it('should stand in for the body text by default and for any typography level on demand', () => {
        const fixture = createFixture(TestTypography);
        const typography = query(fixture, 'kbq-skeleton-typography');

        expect(typography.classList).toContain('kbq-text-normal');

        fixture.componentInstance.level.set('title');
        fixture.detectChanges();

        expect(typography.classList).toContain('kbq-title');
        expect(typography.classList).not.toContain('kbq-text-normal');
        expect(typography.classList).toContain('kbq-skeleton-typography');
    });

    it('should keep the classes another directive binds on the same element', () => {
        const typography = query(createFixture(TestTypography), 'kbq-skeleton-typography');

        expect(typography.classList).toContain('kbq-text-normal');
        expect(typography.classList).toContain('test-class-map');
    });

    it('should take the number of lines, rows and items from its inputs', () => {
        const fixture = createFixture(TestPresets);

        fixture.componentInstance.lines.set(5);
        fixture.componentInstance.rows.set(4);
        fixture.componentInstance.count.set(2);
        fixture.detectChanges();

        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(5);
        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(4);
        expect(count(fixture, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(12);
        expect(count(fixture, 'kbq-skeleton-group > .kbq-skeleton')).toBe(2);
    });

    it('should read a number from a string and show a single item for a string that is not one', () => {
        const fixture = createFixture(TestPresets);

        fixture.componentInstance.lines.set('4');
        fixture.componentInstance.rows.set('not a number');
        fixture.detectChanges();

        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(4);
        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(1);
    });

    it('should show a single item for an infinite number', () => {
        const fixture = createFixture(TestPresets);

        fixture.componentInstance.rows.set('Infinity');
        fixture.detectChanges();

        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(1);
    });

    it('should take the numbers of items from the configuration', () => {
        TestBed.configureTestingModule({
            providers: [
                kbqSkeletonPresetsConfigurationProvider({
                    typographyLines: 5,
                    dlRows: 4,
                    tableRows: 2,
                    tableColumns: 4,
                    groupCount: 1
                })
            ]
        });

        const fixture = createFixture(TestPresetDefaults);

        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(5);
        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(4);
        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(4);
        expect(count(fixture, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(8);
        expect(count(fixture, 'kbq-skeleton-group > .kbq-skeleton')).toBe(1);
    });

    it('should keep the numbers a nested configuration leaves out', () => {
        TestBed.configureTestingModule({
            providers: [kbqSkeletonPresetsConfigurationProvider({ tableRows: 4 })]
        });

        const fixture = createFixture(TestNestedConfiguration);

        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(12);
        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(1);
    });

    it('should take the keys a parent configuration lacks from the defaults', () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: KBQ_SKELETON_PRESETS_CONFIGURATION,
                    useValue: { tableRows: 4 } as KbqSkeletonPresetsConfiguration
                }
            ]
        });

        const fixture = createFixture(TestNestedConfiguration);

        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(12);
        expect(count(fixture, 'kbq-skeleton-typography > .kbq-skeleton')).toBe(1);
    });

    it('should let an input override the configuration', () => {
        TestBed.configureTestingModule({
            providers: [kbqSkeletonPresetsConfigurationProvider({ dlRows: 4 })]
        });

        const fixture = createFixture(TestPresets);

        fixture.componentInstance.rows.set(1);
        fixture.detectChanges();

        expect(count(fixture, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(1);
    });

    it('should split the table into columns of equal width', () => {
        const fixture = createFixture(TestPresets);
        const table = query(fixture, 'kbq-skeleton-table');

        fixture.componentInstance.columns.set(2);
        fixture.detectChanges();

        expect(table.style.gridTemplateColumns).toBe('minmax(0, 1fr) minmax(0, 1fr)');
        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(2);
    });

    it('should give the table columns their own widths', () => {
        const fixture = createFixture(TestPresets);

        fixture.componentInstance.columns.set(['160px', 'auto', '48px']);
        fixture.detectChanges();

        expect(query(fixture, 'kbq-skeleton-table').style.gridTemplateColumns).toBe('160px auto 48px');
        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(3);
    });

    it('should leave the header row out of the table', () => {
        const fixture = createFixture(TestPresets);

        fixture.componentInstance.header.set(false);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-table__cell_header')).toBe(0);
        expect(count(fixture, '.kbq-skeleton-table__cell')).toBe(9);
    });

    it('should repeat the element preset of a group', () => {
        const fixture = createFixture(TestPresets);
        const group = query(fixture, 'kbq-skeleton-group');

        expect(group.classList).toContain('kbq-skeleton-group_tag');
        expect(count(fixture, 'kbq-skeleton-group > kbq-skeleton-tag')).toBe(3);

        fixture.componentInstance.groupPreset.set('button');
        fixture.detectChanges();

        expect(group.classList).toContain('kbq-skeleton-group_button');
        expect(group.classList).not.toContain('kbq-skeleton-group_tag');
        expect(count(fixture, 'kbq-skeleton-group > kbq-skeleton-button')).toBe(3);
        expect(count(fixture, 'kbq-skeleton-group > kbq-skeleton-tag')).toBe(0);
    });

    it('should draw a form field as a label above an input', () => {
        const fixture = createFixture(TestFormField);
        const formField = query(fixture, 'kbq-skeleton-form-field');

        expect(count(fixture, '.kbq-skeleton-form-field__label > .kbq-skeleton')).toBe(1);
        expect(count(fixture, '.kbq-skeleton-form-field__content > .kbq-skeleton-form-field__control')).toBe(1);
        expect(count(fixture, '.kbq-skeleton-form-field__hint')).toBe(0);
        expect(formField.classList).not.toContain('kbq-skeleton-form-field_horizontal');
        expect(formField.classList).not.toContain('kbq-skeleton-form-field_textarea');
    });

    it('should put the label of a form field to the left, under a hint and around a textarea on demand', () => {
        const fixture = createFixture(TestFormField);
        const formField = query(fixture, 'kbq-skeleton-form-field');

        fixture.componentInstance.horizontal.set(true);
        fixture.componentInstance.control.set('textarea');
        fixture.componentInstance.hint.set(true);
        fixture.detectChanges();

        expect(formField.classList).toContain('kbq-skeleton-form-field_horizontal');
        expect(formField.classList).toContain('kbq-skeleton-form-field_textarea');
        expect(count(fixture, '.kbq-skeleton-form-field__content > .kbq-skeleton-form-field__hint')).toBe(1);
    });

    it('should leave the label out of a form field on demand', () => {
        const fixture = createFixture(TestFormField);

        fixture.componentInstance.label.set(false);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-form-field__label')).toBe(0);
        expect(count(fixture, '.kbq-skeleton-form-field__content > .kbq-skeleton-form-field__control')).toBe(1);
    });

    it('should give the label and the content of a form field the classes of its columns', () => {
        const fixture = createFixture(TestFormField);

        fixture.componentInstance.labelClass.set('flex-30');
        fixture.componentInstance.contentClass.set('flex-70');
        fixture.detectChanges();

        expect(query(fixture, '.kbq-skeleton-form-field__label').classList).toContain('flex-30');
        expect(query(fixture, '.kbq-skeleton-form-field__content').classList).toContain('flex-70');
    });

    it('should draw every placeholder with the skeleton', () => {
        const fixture = createFixture(TestPresetDefaults);
        const blocks = fixture.nativeElement.querySelectorAll('.kbq-skeleton');

        expect(blocks.length).toBe(1 + 6 + 12 + 3);
        blocks.forEach((block: HTMLElement) => expect(block.hasAttribute('inert')).toBe(true));
    });

    it('should show three items of a list and a single control by default', () => {
        const fixture = createFixture(TestComponentPresetDefaults);

        expect(count(fixture, 'kbq-skeleton-accordion > .kbq-skeleton-accordion__item')).toBe(3);
        expect(count(fixture, 'kbq-skeleton-checkable > .kbq-skeleton-checkable__row')).toBe(1);
        expect(count(fixture, '.kbq-skeleton-tabs__tab')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-tabs__content kbq-skeleton-typography > .kbq-skeleton')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-tree__node:not(.kbq-skeleton-tree__node_nested)')).toBe(3);
    });

    it('should take the numbers of the component presets from the configuration', () => {
        TestBed.configureTestingModule({
            providers: [
                kbqSkeletonPresetsConfigurationProvider({
                    accordionRows: 2,
                    checkableRows: 3,
                    tabsCount: 5,
                    tabsContentLines: 2,
                    treeRows: 2,
                    treeChildren: 1
                })
            ]
        });

        const fixture = createFixture(TestComponentPresetDefaults);

        expect(count(fixture, '.kbq-skeleton-accordion__item')).toBe(2);
        expect(count(fixture, 'kbq-skeleton-checkable > .kbq-skeleton-checkable__row')).toBe(3);
        expect(count(fixture, '.kbq-skeleton-tabs__tab')).toBe(5);
        expect(count(fixture, '.kbq-skeleton-tabs__content kbq-skeleton-typography > .kbq-skeleton')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-tree__node:not(.kbq-skeleton-tree__node_nested)')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-tree__node_nested')).toBe(1);
    });

    it('should stand in for a checkbox by default and for a radio button or a toggle on demand', () => {
        const fixture = createFixture(TestComponentPresets);
        const checkable = query(fixture, 'kbq-skeleton-checkable');

        expect(checkable.classList).toContain('kbq-skeleton-checkable');
        expect(checkable.classList).toContain('kbq-skeleton-checkable_checkbox');

        fixture.componentInstance.control.set('toggle');
        fixture.detectChanges();

        expect(checkable.classList).toContain('kbq-skeleton-checkable');
        expect(checkable.classList).toContain('kbq-skeleton-checkable_toggle');
        expect(checkable.classList).not.toContain('kbq-skeleton-checkable_checkbox');

        fixture.componentInstance.control.set('radio');
        fixture.detectChanges();

        expect(checkable.classList).toContain('kbq-skeleton-checkable_radio');
        expect(checkable.classList).not.toContain('kbq-skeleton-checkable_toggle');
    });

    it('should draw a checkbox with its label, add a hint or leave the text out on demand', () => {
        const fixture = createFixture(TestComponentPresets);

        fixture.componentInstance.rows.set(1);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-checkable__row > .kbq-skeleton-checkable__control')).toBe(1);
        expect(count(fixture, '.kbq-skeleton-checkable__text > .kbq-skeleton-checkable__label')).toBe(1);
        expect(count(fixture, '.kbq-skeleton-checkable__hint')).toBe(0);

        fixture.componentInstance.hint.set(true);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-checkable__text > .kbq-skeleton-checkable__hint')).toBe(1);

        fixture.componentInstance.label.set(false);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-checkable__text')).toBe(0);
        expect(count(fixture, '.kbq-skeleton-checkable__control')).toBe(1);
    });

    it('should take the numbers of items of the component presets from their inputs', () => {
        const fixture = createFixture(TestComponentPresets);

        fixture.componentInstance.rows.set(2);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-accordion__item')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-checkable__row')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-tabs__tab')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-tabs__content kbq-skeleton-typography > .kbq-skeleton')).toBe(2);
        expect(count(fixture, '.kbq-skeleton-tree__node:not(.kbq-skeleton-tree__node_nested)')).toBe(2);
    });

    it('should select the first tab and stack the tabs beside the content on demand', () => {
        const fixture = createFixture(TestComponentPresets);
        const tabs = query(fixture, 'kbq-skeleton-tabs');

        expect(count(fixture, '.kbq-skeleton-tabs__tab_selected')).toBe(1);
        expect(query(fixture, '.kbq-skeleton-tabs__tab').classList).toContain('kbq-skeleton-tabs__tab_selected');
        expect(tabs.classList).not.toContain('kbq-skeleton-tabs_vertical');

        fixture.componentInstance.vertical.set(true);
        fixture.detectChanges();

        expect(tabs.classList).toContain('kbq-skeleton-tabs_vertical');
    });

    it('should show the placeholders projected into the tabs instead of the text', () => {
        const fixture = createFixture(TestTabsContent);

        expect(count(fixture, '.kbq-skeleton-tabs__content > kbq-skeleton-dl')).toBe(1);
        expect(count(fixture, 'kbq-skeleton-typography')).toBe(0);
    });

    it('should expand the second node of the tree', () => {
        const fixture = createFixture(TestComponentPresets);
        const nodes: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.kbq-skeleton-tree__node'));

        expect(nodes.map((node) => node.classList.contains('kbq-skeleton-tree__node_nested'))).toEqual([
            false,
            false,
            true,
            true,
            true,
            false
        ]);

        fixture.componentInstance.children.set(1);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-tree__node_nested')).toBe(1);

        fixture.componentInstance.rows.set(1);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-tree__node')).toBe(1);
    });

    it('should start every row of a selectable table with a checkbox', () => {
        const fixture = createFixture(TestPresets);
        const table = query(fixture, 'kbq-skeleton-table');

        fixture.componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(count(fixture, '.kbq-skeleton-table__cell_selection')).toBe(4);
        expect(table.style.gridTemplateColumns).toBe(
            'var(--kbq-skeleton-table-selection-width) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'
        );
    });

    it('should set the pinned columns of a table apart with a line', () => {
        const fixture = createFixture(TestPresets);

        expect(count(fixture, '.kbq-skeleton-table__cell_pinned-edge')).toBe(0);

        fixture.componentInstance.selectable.set(true);
        fixture.componentInstance.pinnedColumns.set(1);
        fixture.detectChanges();

        const cells: HTMLElement[] = Array.from(query(fixture, 'kbq-skeleton-table').children) as HTMLElement[];

        expect(count(fixture, '.kbq-skeleton-table__cell_pinned-edge')).toBe(4);
        expect(cells[1].classList).toContain('kbq-skeleton-table__cell_pinned-edge');
        expect(cells[0].classList).not.toContain('kbq-skeleton-table__cell_pinned-edge');
    });

    it('should draw every placeholder of the component presets with the skeleton', () => {
        const fixture = createFixture(TestComponentPresetDefaults);
        const blocks = fixture.nativeElement.querySelectorAll('.kbq-skeleton');

        expect(blocks.length).toBe(3 * 2 + 2 + 3 + 3 + 6 * 2);
        blocks.forEach((block: HTMLElement) => expect(block.hasAttribute('inert')).toBe(true));
    });
});
