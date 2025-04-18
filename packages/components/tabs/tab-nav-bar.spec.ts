import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { KbqTabLink, KbqTabNavBar } from './tab-nav-bar';
import { KbqTabsModule } from './tabs.module';

describe(KbqTabNavBar.name, () => {
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
        <nav kbqTabNavBar>
            @for (tab of tabs; track tab; let index = $index) {
                <a [active]="activeIndex === index" [disabled]="disabled" (click)="activeIndex = index" kbqTabLink>
                    Tab link {{ label }}
                </a>
            }
        </nav>
    `
})
class SimpleTabNavBarTestApp {
    @ViewChild(KbqTabNavBar, { static: false }) tabNavBar: KbqTabNavBar;
    @ViewChildren(KbqTabLink) tabLinks: QueryList<KbqTabLink>;

    label = '';
    disabled = false;
    tabs = [0, 1, 2];

    activeIndex = 0;
}

@Component({
    template: `
        <nav kbqTabNavBar>
            @if (!isDestroyed) {
                <a kbqTabLink>Link</a>
            }
        </nav>
    `
})
class TabLinkWithNgIf {
    isDestroyed = false;
}

@Component({
    template: `
        <nav kbqTabNavBar>
            <a [tabIndex]="tabIndex" kbqTabLink>TabIndex Link</a>
        </nav>
    `
})
class TabLinkWithTabIndexBinding {
    tabIndex = 0;
}
