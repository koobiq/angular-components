import { Component, QueryList, ViewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqListItem, KbqListModule } from './index';

describe('KbqList', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqListModule]
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
    imports: [
        KbqListModule
    ],
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
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list>
            <kbq-list-item>Paprika</kbq-list-item>
        </kbq-list>
    `
})
class TestListWithOneItem extends BaseTestList {}

@Component({
    imports: [
        KbqListModule
    ],
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
    imports: [
        KbqListModule
    ],
    template: `
        <kbq-list>
            @for (item of items; track item) {
                <kbq-list-item>
                    <h3 kbq-line>{{ item.name }}</h3>
                </kbq-list-item>
            }
        </kbq-list>
    `
})
class TestListWithMultipleItems extends BaseTestList {}
