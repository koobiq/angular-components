import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { KbqTabLink, KbqTabNav, KbqTabsModule } from '../index';

describe('KbqTabNavBar', () => {
    const dir: Direction = 'ltr';
    let dirChange: Subject<Direction>;

    beforeEach(() => {
        dirChange = new Subject();
        TestBed.configureTestingModule({
            imports: [KbqTabsModule],
            declarations: [
                SimpleTabNavBarTestApp,
                TabLinkWithNgIf,
                TabLinkWithTabIndexBinding
            ],
            providers: [
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: dirChange.asObservable()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;
        let component: SimpleTabNavBarTestApp;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should change active index on click', () => {
            // select the second link
            let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];
            tabLink.nativeElement.click();
            expect(component.activeIndex).toBe(1);

            // select the third link
            tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
            tabLink.nativeElement.click();
            expect(component.activeIndex).toBe(2);
        });

        it('should add the active class if active', () => {
            const tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
            const tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            tabLink1.nativeElement.click();
            fixture.detectChanges();
            expect(tabLinkElements[0].classList.contains('kbq-selected')).toBeTruthy();
            expect(tabLinkElements[1].classList.contains('kbq-selected')).toBeFalsy();

            tabLink2.nativeElement.click();
            fixture.detectChanges();
            expect(tabLinkElements[0].classList.contains('kbq-selected')).toBeFalsy();
            expect(tabLinkElements[1].classList.contains('kbq-selected')).toBeTruthy();
        });

        it('should add the disabled class if disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(tabLinkElements.every((tabLinkEl) => !tabLinkEl.hasAttribute('disabled'))).toBe(true);

            component.disabled = true;
            fixture.detectChanges();

            expect(tabLinkElements.every((tabLinkEl) => tabLinkEl.hasAttribute('disabled'))).toBe(true);
        });

        it('should update the tabindex if links are disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(tabLinkElements.every((tabLink) => tabLink.tabIndex === 0)).toBe(true);

            component.disabled = true;
            fixture.detectChanges();

            expect(tabLinkElements.every((tabLink) => tabLink.tabIndex === -1)).toBe(true);
        });

        xit('should make disabled links unclickable', () => {
            const tabLinkElement: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;

            expect(getComputedStyle(tabLinkElement).pointerEvents).not.toBe('none');

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(getComputedStyle(tabLinkElement).pointerEvents).toBe('none');
        });
    });

    it('should support binding to the tabIndex', () => {
        const fixture = TestBed.createComponent(TabLinkWithTabIndexBinding);
        const component = fixture.componentInstance;
        fixture.detectChanges();

        const tabLink = fixture.debugElement.query(By.directive(KbqTabLink)).injector.get<KbqTabLink>(KbqTabLink);

        expect(tabLink.tabIndex).toBe(0);

        component.tabIndex = 3;
        fixture.detectChanges();

        expect(tabLink.tabIndex).toBe(3);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <nav kbq-tab-nav-bar>
            <a
                *ngFor="let tab of tabs; let index = index"
                [active]="activeIndex === index"
                [disabled]="disabled"
                (click)="activeIndex = index"
                kbq-tab-link
            >
                Tab link {{ label }}
            </a>
        </nav>
    `
})
class SimpleTabNavBarTestApp {
    @ViewChild(KbqTabNav, { static: false }) tabNavBar: KbqTabNav;
    @ViewChildren(KbqTabLink) tabLinks: QueryList<KbqTabLink>;

    label = '';
    disabled = false;
    tabs = [0, 1, 2];

    activeIndex = 0;
}

@Component({
    template: `
        <nav kbq-tab-nav-bar>
            <a
                *ngIf="!isDestroyed"
                kbq-tab-link
            >
                Link
            </a>
        </nav>
    `
})
class TabLinkWithNgIf {
    isDestroyed = false;
}

@Component({
    template: `
        <nav kbq-tab-nav-bar>
            <a
                [tabIndex]="tabIndex"
                kbq-tab-link
            >
                TabIndex Link
            </a>
        </nav>
    `
})
class TabLinkWithTabIndexBinding {
    tabIndex = 0;
}
