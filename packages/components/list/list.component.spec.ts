import { Component, QueryList, ViewChildren } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqListItem, KbqListModule } from './index';

describe('KbqList', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqListModule],
            declarations: [
                ListWithOneAnchorItem,
                ListWithOneItem,
                ListWithTwoLineItem,
                ListWithThreeLineItem,
                ListWithAvatar,
                ListWithItemWithCssClass,
                ListWithDynamicNumberOfLines,
                ListWithMultipleItems,
                ListWithManyLines,
            ],
        });

        TestBed.compileComponents();
    }));

    it('should add and remove focus class on focus/blur', () => {
        const fixture = TestBed.createComponent(ListWithOneAnchorItem);
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
        const fixture = TestBed.createComponent(ListWithOneItem);
        const listItem = fixture.debugElement.query(By.css('kbq-list-item'));
        fixture.detectChanges();
        expect(listItem.nativeElement.className).toBe('kbq-list-item');
    });

    it('should not clear custom classes provided by user', () => {
        const fixture = TestBed.createComponent(ListWithItemWithCssClass);
        fixture.detectChanges();

        const listItems = fixture.debugElement.children[0].queryAll(By.css('kbq-list-item'));
        expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
    });

    it('should add aria roles properly', () => {
        const fixture = TestBed.createComponent(ListWithMultipleItems);
        fixture.detectChanges();

        const list = fixture.debugElement.children[0];
        const listItem = fixture.debugElement.children[0].query(By.css('kbq-list-item'));
        expect(list.nativeElement.getAttribute('role')).withContext('Expect kbq-list no role').toBeNull();

        expect(listItem.nativeElement.getAttribute('role')).withContext('Expect kbq-list-item no role').toBeNull();
    });
});

class BaseTestList {
    items: any[] = [
        { name: 'Paprika', description: 'A seasoning' },
        { name: 'Pepper', description: 'Another seasoning' },
    ];

    showThirdLine: boolean = false;
}

@Component({
    template: ` <kbq-list>
        <a kbq-list-item> Paprika </a>
    </kbq-list>`,
})
class ListWithOneAnchorItem extends BaseTestList {
    // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
    // it doesn't get populated.
    @ViewChildren(KbqListItem) listItems: QueryList<KbqListItem>;
}

@Component({
    template: ` <kbq-list>
        <kbq-list-item> Paprika </kbq-list-item>
    </kbq-list>`,
})
class ListWithOneItem extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item *ngFor="let item of items">
            <img src="" />
            <h3 kbq-line>{{ item.name }}</h3>
            <p kbq-line>{{ item.description }}</p>
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithTwoLineItem extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item *ngFor="let item of items">
            <h3 kbq-line>{{ item.name }}</h3>
            <p kbq-line>{{ item.description }}</p>
            <p kbq-line>Some other text</p>
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithThreeLineItem extends BaseTestList {
    // tslint:disable-next-line:no-empty
    avoidCollisionMockTarget() {}
}

@Component({
    template: ` <kbq-list>
        <kbq-list-item *ngFor="let item of items">
            <h3 kbq-line>Line 1</h3>
            <p kbq-line>Line 2</p>
            <p kbq-line>Line 3</p>
            <p kbq-line>Line 4</p>
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithManyLines extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item>
            <img src="" kbq-list-avatar />
            Paprika
        </kbq-list-item>
        <kbq-list-item> Pepper </kbq-list-item>
    </kbq-list>`,
})
class ListWithAvatar extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item class="test-class" *ngFor="let item of items">
            <h3 kbq-line>{{ item.name }}</h3>
            <p kbq-line>{{ item.description }}</p>
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithItemWithCssClass extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item *ngFor="let item of items">
            <h3 kbq-line>{{ item.name }}</h3>
            <p kbq-line>{{ item.description }}</p>
            <p kbq-line *ngIf="showThirdLine">Some other text</p>
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithDynamicNumberOfLines extends BaseTestList {}

@Component({
    template: ` <kbq-list>
        <kbq-list-item *ngFor="let item of items">
            {{ item.name }}
        </kbq-list-item>
    </kbq-list>`,
})
class ListWithMultipleItems extends BaseTestList {}
