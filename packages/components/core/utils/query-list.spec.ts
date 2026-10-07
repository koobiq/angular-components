import {
    AfterContentChecked,
    AfterContentInit,
    Component,
    contentChildren,
    Directive,
    input,
    QueryList,
    signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { kbqQueryListFrom } from './query-list';

@Directive({ selector: '[testItem]' })
class TestItem {
    readonly value = input<number>();
}

@Component({
    selector: 'test-owner',
    template: '<ng-content />'
})
class TestOwner implements AfterContentInit {
    private readonly itemsQuery = contentChildren(TestItem);
    private readonly itemsList = kbqQueryListFrom(this.itemsQuery);

    get items(): QueryList<TestItem> {
        return this.itemsList();
    }

    lengthOnContentInit = -1;
    readonly emitted: (number | undefined)[][] = [];

    ngAfterContentInit(): void {
        this.lengthOnContentInit = this.items.length;
        this.items.changes.subscribe((items: QueryList<TestItem>) =>
            this.emitted.push(items.map((item) => item.value()))
        );
    }
}

@Component({
    imports: [TestOwner, TestItem],
    template: `
        @if (shown()) {
            <test-owner>
                @for (item of items(); track item) {
                    <span testItem [value]="item"></span>
                }
            </test-owner>
        }
    `
})
class TestApp {
    readonly shown = signal(true);
    readonly items = signal([1, 2]);
}

describe('kbqQueryListFrom', () => {
    const create = async () => {
        const fixture = TestBed.createComponent(TestApp);

        await fixture.whenStable();

        return fixture;
    };

    const owner = (fixture: ReturnType<typeof TestBed.createComponent<TestApp>>): TestOwner =>
        fixture.debugElement.children[0].componentInstance;

    it('is filled by the time ngAfterContentInit runs', async () => {
        const fixture = await create();

        expect(owner(fixture).lengthOnContentInit).toBe(2);
        expect(
            owner(fixture)
                .items.toArray()
                .every((item) => item instanceof TestItem)
        ).toBe(true);
    });

    it('emits changes once the new items are bound, while nothing reads the list', async () => {
        const fixture = await create();

        fixture.componentInstance.items.set([1, 2, 3]);
        await fixture.whenStable();

        expect(owner(fixture).emitted).toEqual([[1, 2, 3]]);
    });

    it('does not emit changes when the results stay the same', async () => {
        const fixture = await create();

        fixture.componentInstance.items.set([1, 2]);
        await fixture.whenStable();

        expect(owner(fixture).emitted).toEqual([]);
    });

    it('completes changes when its owner is destroyed', async () => {
        const fixture = await create();
        const complete = vi.fn();

        owner(fixture).items.changes.subscribe({ complete });
        fixture.componentInstance.shown.set(false);
        await fixture.whenStable();

        expect(complete).toHaveBeenCalled();
    });
});

@Component({
    selector: 'test-hook-owner',
    template: '<ng-content />',
    host: { '[attr.data-count]': 'count' }
})
class TestHookOwner implements AfterContentInit, AfterContentChecked {
    private readonly itemsQuery = contentChildren(TestItem);
    private readonly itemsList = kbqQueryListFrom(this.itemsQuery);

    // A plain field, written by a subscriber to `changes` and read by a host binding.
    protected count = 0;

    ngAfterContentInit(): void {
        this.count = this.itemsList().length;
        this.itemsList().changes.subscribe((items: QueryList<TestItem>) => (this.count = items.length));
    }

    ngAfterContentChecked(): void {
        this.itemsList();
    }
}

@Component({
    imports: [TestHookOwner, TestItem],
    template: `
        <test-hook-owner>
            @for (item of items(); track item) {
                <span testItem [value]="item"></span>
            }
        </test-hook-owner>
    `
})
class TestHookApp {
    readonly items = signal([1, 2]);
}

describe('kbqQueryListFrom synced from ngAfterContentChecked', () => {
    it('emits changes before the host bindings of its owner are checked', async () => {
        const fixture = TestBed.createComponent(TestHookApp);
        const host: HTMLElement = fixture.nativeElement.querySelector('test-hook-owner');

        await fixture.whenStable();
        fixture.componentInstance.items.set([1, 2, 3]);
        await fixture.whenStable();

        expect(host.getAttribute('data-count')).toBe('3');
    });
});
