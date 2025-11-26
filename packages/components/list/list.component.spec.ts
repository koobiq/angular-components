import { Component, QueryList, ViewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqListItem, KbqListModule } from './index';

describe('KbqList', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqListModule],
            declarations: [
                TestListWithOneAnchorItem,
                TestListWithOneItem,
                TestListWithTwoLineItem,
                TestListWithThreeLineItem,
                TestListWithAvatar,
                TestListWithItemWithCssClass,
                TestListWithDynamicNumberOfLines,
                TestListWithMultipleItems,
                TestListWithManyLines
            ]
        }).compileComponents();
    });

    it('should add and remove focus class on focus/blur', () => {
        const fixture = TestBed.createComponent(TestListWithOneAnchorItem);

        fixture.detectChanges();
        const listItem = fixture.debugElement.query(By.directive(KbqListItem));
        const listItemEl = fixture.debugElement.query(By.css('.kbq-list-item'));

        expect(listItemEl.nativeElement.classList).not.toContain('kbq-list-item-focus');

        listItem.componentInstance.handleFocus();
        fixture.detectChanges();
        expect(listItemEl.nativeElement.classList).toContain('kbq-focused');

        listItem.componentInstance.handleBlur();
        fixture.detectChanges();
        expect(listItemEl.nativeElement.classList).not.toContain('kbq-list-item-focus');
    });

    it('should not apply any additional class to a list without lines', () => {
        const fixture = TestBed.createComponent(TestListWithOneItem);
        const listItem = fixture.debugElement.query(By.css('kbq-list-item'));

        fixture.detectChanges();
        expect(listItem.nativeElement.className).toBe('kbq-list-item');
    });

    it('should not clear custom classes provided by user', () => {
        const fixture = TestBed.createComponent(TestListWithItemWithCssClass);

        fixture.detectChanges();

        const listItems = fixture.debugElement.children[0].queryAll(By.css('kbq-list-item'));

        expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
    });

    it('should add aria roles properly', () => {
        const fixture = TestBed.createComponent(TestListWithMultipleItems);

        fixture.detectChanges();

        const list = fixture.debugElement.children[0];
        const listItem = fixture.debugElement.children[0].query(By.css('kbq-list-item'));

        expect(list.nativeElement.getAttribute('role')).toBeNull();

        expect(listItem.nativeElement.getAttribute('role')).toBeNull();
    });
});

class BaseTestList {
    items: any[] = [
        { name: 'Paprika', description: 'A seasoning' },
        { name: 'Pepper', description: 'Another seasoning' }
    ];

    showThirdLine: boolean = false;
}

@Component({
    selector: 'test-list-with-one-anchor-item',
    template: `
        <kbq-list>
            <a kbq-list-item>Paprika</a>
        </kbq-list>
    `
})
class TestListWithOneAnchorItem extends BaseTestList {
    // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
    // it doesn't get populated.
    @ViewChildren(KbqListItem) listItems: QueryList<KbqListItem>;
}

@Component({
    selector: 'test-list-with-one-item',
    template: `
        <kbq-list>
            <kbq-list-item>Paprika</kbq-list-item>
        </kbq-list>
    `
})
class TestListWithOneItem extends BaseTestList {}

@Component({
    selector: 'test-list-with-two-line-item',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    <img src="" alt="" />
                    <h3 kbq-line>{{ item.name }}</h3>
                    <p kbq-line>{{ item.description }}</p>
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithTwoLineItem extends BaseTestList {}

@Component({
    selector: 'test-list-with-three-line-item',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    <h3 kbq-line>{{ item.name }}</h3>
                    <p kbq-line>{{ item.description }}</p>
                    <p kbq-line>Some other text</p>
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithThreeLineItem extends BaseTestList {
    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'test-list-with-many-lines',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    <h3 kbq-line>Line 1</h3>
                    <p kbq-line>Line 2</p>
                    <p kbq-line>Line 3</p>
                    <p kbq-line>Line 4</p>
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithManyLines extends BaseTestList {}

@Component({
    selector: 'test-list-with-avatar',
    template: `
        <kbq-list>
            <kbq-list-item>
                <img alt="" src="" kbq-list-avatar />
                Paprika
            </kbq-list-item>
            <kbq-list-item>Pepper</kbq-list-item>
        </kbq-list>
    `
})
class TestListWithAvatar extends BaseTestList {}

@Component({
    selector: 'test-list-with-item-with-css-class',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item class="test-class">
                    <h3 kbq-line>{{ item.name }}</h3>
                    <p kbq-line>{{ item.description }}</p>
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithItemWithCssClass extends BaseTestList {}

@Component({
    selector: 'test-list-with-dynamic-number-of-lines',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    <h3 kbq-line>{{ item.name }}</h3>
                    <p kbq-line>{{ item.description }}</p>
                    @if (showThirdLine) {
                        <p kbq-line>Some other text</p>
                    }
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithDynamicNumberOfLines extends BaseTestList {}

@Component({
    selector: 'test-list-with-multiple-items',
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    {{ item.name }}
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithMultipleItems extends BaseTestList {}
