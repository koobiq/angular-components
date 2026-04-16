import { OverlayContainer } from '@angular/cdk/overlay';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import {
    KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING,
    KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH,
    KbqAppSwitcherApp,
    KbqAppSwitcherComponent,
    KbqAppSwitcherSite,
    KbqAppSwitcherTrigger,
    defaultGroupBy
} from './app-switcher';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherModule } from './app-switcher.module';
import { KbqAppSwitcherListItem } from './kbq-app-switcher-list-item';

const APP_1: KbqAppSwitcherApp = { id: 1, name: 'App One', type: 'TypeA', link: '/1', icon: '<svg></svg>' };
const APP_2: KbqAppSwitcherApp = { id: 2, name: 'App Two', type: 'TypeA', link: '/2' };
const APP_3: KbqAppSwitcherApp = { id: 3, name: 'App Three', type: 'TypeA', link: '/3' };
const APP_4: KbqAppSwitcherApp = { id: 4, name: 'App Four', type: 'TypeA', link: '/4' };
const APP_UNTYPED: KbqAppSwitcherApp = { id: 5, name: 'Standalone', link: '/5' };

const SITE_A: KbqAppSwitcherSite = { id: 'siteA', name: 'Site A', apps: [APP_1, APP_2, APP_UNTYPED] };
const SITE_B: KbqAppSwitcherSite = { id: 'siteB', name: 'Site B', status: 'Test', apps: [APP_3, APP_4] };

const BIG_SITE: KbqAppSwitcherSite = {
    id: 'big',
    name: 'Big Site',
    apps: Array.from({ length: 8 }, (_, i) => ({ id: i, name: `App ${i}`, link: `/app/${i}` }))
};

describe('KbqAppSwitcher', () => {
    let testScheduler: TestScheduler;

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule],
            providers: [
                { provide: AsyncScheduler, useValue: testScheduler },
                ...providers
            ]
        });
        const fixture = TestBed.createComponent<T>(component);

        fixture.autoDetectChanges();

        return fixture;
    };

    const getTrigger = (fixture: ComponentFixture<any>): KbqAppSwitcherTrigger =>
        fixture.debugElement.query(By.directive(KbqAppSwitcherTrigger)).injector.get(KbqAppSwitcherTrigger);

    describe('defaultGroupBy', () => {
        it('pushes app without type to untyped array', () => {
            const groups: Record<string, KbqAppSwitcherApp> = {};
            const untyped: KbqAppSwitcherApp[] = [];

            defaultGroupBy(APP_UNTYPED, groups, untyped);

            expect(untyped).toContain(APP_UNTYPED);
            expect(Object.keys(groups)).toHaveLength(0);
        });

        it('creates a new group entry for the first app of a given type', () => {
            const groups: Record<string, KbqAppSwitcherApp> = {};
            const untyped: KbqAppSwitcherApp[] = [];

            defaultGroupBy(APP_1, groups, untyped);

            expect(groups['TypeA']).toBeDefined();
            expect(groups['TypeA'].name).toBe('TypeA');
            expect(groups['TypeA'].aliases).toEqual([APP_1]);
            expect(groups['TypeA'].icon).toBe(APP_1.icon);
        });

        it('appends second app with the same type to existing group aliases', () => {
            const groups: Record<string, KbqAppSwitcherApp> = {};
            const untyped: KbqAppSwitcherApp[] = [];

            defaultGroupBy(APP_1, groups, untyped);
            defaultGroupBy(APP_2, groups, untyped);

            expect(groups['TypeA'].aliases).toHaveLength(2);
            expect(groups['TypeA'].aliases).toContain(APP_2);
        });

        it('creates separate groups for different types', () => {
            const appB: KbqAppSwitcherApp = { id: 10, name: 'B App', type: 'TypeB', link: '/b' };
            const groups: Record<string, KbqAppSwitcherApp> = {};
            const untyped: KbqAppSwitcherApp[] = [];

            defaultGroupBy(APP_1, groups, untyped);
            defaultGroupBy(appB, groups, untyped);

            expect(groups['TypeA']).toBeDefined();
            expect(groups['TypeB']).toBeDefined();
        });
    });

    describe('KbqAppSwitcherTrigger', () => {
        let fixture: ComponentFixture<AppSwitcherSingleSite>;
        let trigger: KbqAppSwitcherTrigger;
        let overlayContainer: OverlayContainer;

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(AppSwitcherSingleSite);
            trigger = getTrigger(fixture);
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        describe('withSearch getter', () => {
            it(`returns false when total apps count is <= ${KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH}`, () => {
                // SITE_A has 3 apps
                expect(trigger.withSearch).toBe(false);
            });

            it(`returns true when total apps count is > ${KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH}`, () => {
                trigger.originalSites = [BIG_SITE];
                expect(trigger.withSearch).toBe(true);
            });
        });

        describe('appsCount getter', () => {
            it('returns total count of apps across all sites', () => {
                expect(trigger.appsCount).toBe(SITE_A.apps.length);
            });

            it('returns 0 when originalSites is empty', () => {
                trigger.originalSites = [];
                expect(trigger.appsCount).toBe(0);
            });

            it('sums apps across multiple sites', () => {
                trigger.originalSites = [SITE_A, SITE_B];
                expect(trigger.appsCount).toBe(SITE_A.apps.length + SITE_B.apps.length);
            });
        });

        describe('sitesMode getter', () => {
            it('returns false when there is a single site', () => {
                expect(trigger.sitesMode).toBe(false);
            });

            it('returns true when there are multiple sites', () => {
                trigger.originalSites = [SITE_A, SITE_B];
                expect(trigger.sitesMode).toBe(true);
            });
        });

        describe('currentApps getter', () => {
            it('returns _parsedApps in single-site mode', () => {
                expect(trigger.sitesMode).toBe(false);
                expect(trigger.currentApps).toBeDefined();
                expect(Array.isArray(trigger.currentApps)).toBe(true);
            });

            it('returns selectedSite.apps in multi-site mode', () => {
                trigger.originalSites = [SITE_A, SITE_B];
                trigger.selectedSite = SITE_A;
                expect(trigger.sitesMode).toBe(true);
                expect(trigger.currentApps).toEqual(trigger.selectedSite.apps);
            });
        });

        describe('hasClickTrigger getter', () => {
            it('returns true when trigger string contains click (default)', () => {
                expect(trigger.hasClickTrigger).toBe(true);
            });

            it('returns false when trigger string does not contain click', () => {
                trigger.trigger = 'keydown';
                expect(trigger.hasClickTrigger).toBe(false);
            });
        });

        describe('sites setter', () => {
            it('sets originalSites to the provided value', () => {
                trigger.sites = [SITE_A];
                expect(trigger.originalSites).toEqual([SITE_A]);
            });

            it('computes _parsedApps for a single site', () => {
                trigger.sites = [SITE_A];
                expect(trigger.apps).toBeDefined();
                expect(Array.isArray(trigger.apps)).toBe(true);
            });

            it('creates _parsedSites for multiple sites', () => {
                trigger.sites = [SITE_A, SITE_B];
                expect(trigger.sites).toBeDefined();
                expect(trigger.sites).toHaveLength(2);
            });

            it('each parsed site has apps processed through grouping', () => {
                trigger.sites = [SITE_A, SITE_B];
                trigger.sites.forEach((site) => {
                    expect(Array.isArray(site.apps)).toBe(true);
                });
            });
        });

        describe('apps setter (deprecated)', () => {
            it('sets originalApps and processes _parsedApps', () => {
                const apps = [APP_1, APP_2, APP_UNTYPED];

                trigger.apps = apps;
                expect(trigger.originalApps).toEqual(apps);
                expect(Array.isArray(trigger.apps)).toBe(true);
            });
        });

        describe('groupBy setter', () => {
            it('throws when assigned a non-function', () => {
                expect(() => {
                    trigger.groupBy = 'not a function' as any;
                }).toThrow('The argument must be a function');
            });

            it('accepts a valid function', () => {
                const customFn = (app: KbqAppSwitcherApp, _groups: any, untyped: KbqAppSwitcherApp[]) =>
                    untyped.push(app);

                expect(() => {
                    trigger.groupBy = customFn;
                }).not.toThrow();
            });
        });

        describe('selectedSite setter', () => {
            it('finds the site in originalSites by id and creates a parsed version', () => {
                trigger.originalSites = [SITE_A, SITE_B];
                trigger.selectedSite = SITE_A;

                expect(trigger.selectedSite).toBeDefined();
                expect(trigger.selectedSite.id).toBe(SITE_A.id);
                expect(trigger.selectedSite.name).toBe(SITE_A.name);
            });

            it('processes site apps through grouping', () => {
                trigger.originalSites = [SITE_A, SITE_B];
                trigger.selectedSite = SITE_A;

                expect(Array.isArray(trigger.selectedSite.apps)).toBe(true);
            });
        });

        describe('disabled input', () => {
            it('sets _disabled to true', () => {
                trigger.disabled = true;
                expect(trigger.disabled).toBe(true);
            });

            it('calls hide() when set to true', () => {
                const hideSpy = jest.spyOn(trigger, 'hide');

                trigger.disabled = true;
                expect(hideSpy).toHaveBeenCalled();
            });

            it('sets _disabled to false without calling hide()', () => {
                trigger.disabled = true;
                const hideSpy = jest.spyOn(trigger, 'hide');

                trigger.disabled = false;
                expect(trigger.disabled).toBe(false);
                expect(hideSpy).not.toHaveBeenCalled();
            });
        });

        describe('makeGroupsForApps — grouping logic', () => {
            it('keeps apps without type ungrouped', () => {
                trigger.apps = [APP_UNTYPED];
                const result = trigger.apps;

                // No aliases on untyped apps
                expect(result.every((app) => !app.aliases)).toBe(true);
            });

            it(`forms a group with aliases when more than ${KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING} apps share a type`, () => {
                const typedApps: KbqAppSwitcherApp[] = Array.from({ length: 4 }, (_, i) => ({
                    id: 100 + i,
                    name: `Typed ${i}`,
                    type: 'SameType',
                    link: `/t/${i}`
                }));

                trigger.apps = typedApps;
                const grouped = trigger.apps.find((a) => a.aliases);

                expect(grouped).toBeDefined();
                expect(grouped!.aliases!.length).toBe(4);
            });

            it(`flattens groups with ${KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING} or fewer same-type apps`, () => {
                // 3 apps of same type (≤ KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING=3)
                const typedApps: KbqAppSwitcherApp[] = [APP_1, APP_2, APP_3];

                trigger.apps = typedApps;
                // Should be flattened — no aliases
                const hasGroup = trigger.apps.some((a) => a.aliases && a.aliases.length > 0);

                expect(hasGroup).toBe(false);
            });

            it('takes the icon from the first app in the group', () => {
                const appWithIcon: KbqAppSwitcherApp = {
                    id: 200,
                    name: 'Icon App',
                    type: 'IconType',
                    icon: '<svg>icon</svg>',
                    link: '/icon'
                };
                const otherApps: KbqAppSwitcherApp[] = Array.from({ length: 3 }, (_, i) => ({
                    id: 201 + i,
                    name: `Other ${i}`,
                    type: 'IconType',
                    link: `/other/${i}`
                }));

                trigger.apps = [appWithIcon, ...otherApps];
                const group = trigger.apps.find((a) => a.aliases);

                expect(group).toBeDefined();
                expect(group!.icon).toBe(appWithIcon.icon);
            });
        });
    });

    describe('KbqAppSwitcherComponent', () => {
        let fixture: ComponentFixture<AppSwitcherMultiSite>;
        let trigger: KbqAppSwitcherTrigger;
        let popup: KbqAppSwitcherComponent;
        let overlayContainer: OverlayContainer;

        beforeEach(fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(AppSwitcherMultiSite);
            trigger = getTrigger(fixture);

            trigger.show();
            tick();
            fixture.detectChanges();

            popup = trigger['instance'] as KbqAppSwitcherComponent;
        }));

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        describe('updateTrapFocus', () => {
            it('sets isTrapFocus to true', () => {
                popup.updateTrapFocus(true);
                expect(popup.isTrapFocus).toBe(true);
            });

            it('sets isTrapFocus to false', () => {
                popup.updateTrapFocus(true);
                popup.updateTrapFocus(false);
                expect(popup.isTrapFocus).toBe(false);
            });
        });

        describe('escapeHandler', () => {
            it('calls hide(0)', () => {
                const hideSpy = jest.spyOn(popup, 'hide');

                popup.escapeHandler();
                expect(hideSpy).toHaveBeenCalledWith(0);
            });
        });

        describe('selectAppInSite', () => {
            it('updates trigger.selectedApp', () => {
                popup.selectAppInSite(SITE_A, APP_1);
                expect(trigger.selectedApp).toBe(APP_1);
            });

            it('updates trigger.selectedSite with the given site', () => {
                popup.selectAppInSite(SITE_A, APP_1);
                expect(trigger.selectedSite.id).toBe(SITE_A.id);
            });

            it('emits selectedAppChange with the selected app', () => {
                const spy = jest.fn();

                trigger.selectedAppChange.subscribe(spy);
                popup.selectAppInSite(SITE_A, APP_1);
                expect(spy).toHaveBeenCalledWith(APP_1);
            });

            it('emits selectedSiteChange with the selected site', () => {
                const spy = jest.fn();

                trigger.selectedSiteChange.subscribe(spy);
                popup.selectAppInSite(SITE_A, APP_1);
                expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: SITE_A.id }));
            });
        });

        describe('filterSites via searchControl', () => {
            it('filteredSites contains all sites when query is empty', fakeAsync(() => {
                popup.searchControl.setValue('');
                tick();
                // filterSites with empty query returns structuredClone of originalSites
                expect(popup.filteredSites).toHaveLength(trigger.originalSites.length);
            }));

            it('filters apps by name case-insensitively', fakeAsync(() => {
                popup.searchControl.setValue('app one');
                tick();
                const matchingApps = popup.filteredSites.flatMap((s) => s.apps);

                expect(matchingApps.every((a) => a.name.toLowerCase().includes('app one'))).toBe(true);
            }));

            it('removes sites with no matching apps', fakeAsync(() => {
                popup.searchControl.setValue('App One');
                tick();
                // Only SITE_A has 'App One', SITE_B should be filtered out
                expect(popup.filteredSites.every((s) => s.apps.length > 0)).toBe(true);
                const siteIds = popup.filteredSites.map((s) => s.id);

                expect(siteIds).toContain(SITE_A.id);
                expect(siteIds).not.toContain(SITE_B.id);
            }));

            it('does not mutate originalSites', fakeAsync(() => {
                const originalAppsCount = trigger.originalSites[0].apps.length;

                popup.searchControl.setValue('App One');
                tick();
                expect(trigger.originalSites[0].apps).toHaveLength(originalAppsCount);
            }));
        });
    });

    describe('KbqAppSwitcherListItem', () => {
        let fixture: ComponentFixture<ListItemHost>;
        let overlayContainer: OverlayContainer;

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(ListItemHost, [
                { provide: IMAGE_LOADER, useValue: (config: ImageLoaderConfig) => config.src }]);
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        const getListItem = () =>
            fixture.debugElement.query(By.directive(KbqAppSwitcherListItem)).injector.get(KbqAppSwitcherListItem);

        it('displays app.name', () => {
            fixture.componentInstance.app = { ...APP_1, name: 'My App' };
            fixture.detectChanges();
            const nameEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__name'));

            expect(nameEl.nativeElement.textContent.trim()).toBe('My App');
        });

        it('displays app.caption when set', () => {
            fixture.componentInstance.app = { ...APP_1, caption: 'A caption' };
            fixture.detectChanges();
            const captionEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__caption'));

            expect(captionEl).toBeTruthy();
            expect(captionEl.nativeElement.textContent.trim()).toBe('A caption');
        });

        it('does not render caption element when app.caption is absent', () => {
            fixture.componentInstance.app = { ...APP_1, caption: undefined };
            fixture.detectChanges();
            const captionEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__caption'));

            expect(captionEl).toBeFalsy();
        });

        it('renders icon span for app.icon (inline SVG)', () => {
            fixture.componentInstance.app = { ...APP_1, icon: '<svg></svg>', iconSrc: undefined };
            fixture.detectChanges();
            const iconSpan = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__icon'));

            expect(iconSpan).toBeTruthy();
        });

        it('renders img span for app.iconSrc', () => {
            fixture.componentInstance.app = { ...APP_1, icon: undefined, iconSrc: '/icon.png' };
            fixture.detectChanges();
            const imgEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__icon img'));

            expect(imgEl).toBeTruthy();
        });

        it('renders no icon element when neither icon nor iconSrc is set', () => {
            fixture.componentInstance.app = { ...APP_1, icon: undefined, iconSrc: undefined };
            fixture.detectChanges();
            const iconSpan = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__icon'));

            expect(iconSpan).toBeFalsy();
        });

        it('renders toggle element when toggle=true', () => {
            fixture.componentInstance.toggle = true;
            fixture.componentInstance.app = { ...APP_1, aliases: [] };
            fixture.detectChanges();
            const toggleEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__toggle'));

            expect(toggleEl).toBeTruthy();
        });

        it('does not render toggle element when toggle=false', () => {
            fixture.componentInstance.toggle = false;
            fixture.detectChanges();
            const toggleEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__toggle'));

            expect(toggleEl).toBeFalsy();
        });

        it('toggle element has kbq-expanded class when collapsed=false', () => {
            fixture.componentInstance.toggle = true;
            fixture.componentInstance.collapsed = false;
            fixture.componentInstance.app = { ...APP_1, aliases: [] };
            fixture.detectChanges();
            const toggleEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__toggle'));

            expect(toggleEl.nativeElement.classList).toContain('kbq-expanded');
        });

        it('toggle element lacks kbq-expanded class when collapsed=true', () => {
            fixture.componentInstance.toggle = true;
            fixture.componentInstance.collapsed = true;
            fixture.componentInstance.app = { ...APP_1, aliases: [] };
            fixture.detectChanges();
            const toggleEl = fixture.debugElement.query(By.css('.kbq-app-switcher-list-item__toggle'));

            expect(toggleEl.nativeElement.classList).not.toContain('kbq-expanded');
        });

        it('clickHandler with toggle=true toggles collapsed state', () => {
            fixture.componentInstance.toggle = true;
            fixture.componentInstance.app = { ...APP_1, aliases: [] };
            fixture.detectChanges();

            const listItem = getListItem();

            expect(listItem.collapsed).toBe(false);

            listItem.clickHandler(new MouseEvent('click'));
            expect(listItem.collapsed).toBe(true);

            listItem.clickHandler(new MouseEvent('click'));
            expect(listItem.collapsed).toBe(false);
        });

        it('clickHandler with toggle=true stops event propagation', () => {
            fixture.componentInstance.toggle = true;
            fixture.componentInstance.app = { ...APP_1, aliases: [] };
            fixture.detectChanges();

            const event = new MouseEvent('click', { bubbles: true });
            const stopSpy = jest.spyOn(event, 'stopPropagation');
            const preventSpy = jest.spyOn(event, 'preventDefault');

            getListItem().clickHandler(event);

            expect(stopSpy).toHaveBeenCalled();
            expect(preventSpy).toHaveBeenCalled();
        });

        it('clickHandler with toggle=false does not change collapsed state', () => {
            fixture.componentInstance.toggle = false;
            fixture.detectChanges();

            const listItem = getListItem();

            expect(listItem.collapsed).toBe(false);
            listItem.clickHandler(new MouseEvent('click'));
            expect(listItem.collapsed).toBe(false);
        });
    });

    describe('KbqAppSwitcherDropdownSite', () => {
        let fixture: ComponentFixture<DropdownSiteHost>;
        let overlayContainer: OverlayContainer;

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(DropdownSiteHost);
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        it('displays site.name', () => {
            fixture.componentInstance.site = { ...SITE_A, name: 'My Site' };
            fixture.detectChanges();
            const nameEl = fixture.debugElement.query(By.css('.kbq-app-switcher-dropdown-site__name'));

            expect(nameEl.nativeElement.textContent.trim()).toBe('My Site');
        });

        it('renders kbq-badge when site.status is set', () => {
            fixture.componentInstance.site = { ...SITE_A, status: 'Active' };
            fixture.detectChanges();
            const badge = fixture.debugElement.query(By.css('kbq-badge'));

            expect(badge).toBeTruthy();
        });

        it('does not render kbq-badge when site.status is absent', () => {
            fixture.componentInstance.site = { ...SITE_A, status: undefined };
            fixture.detectChanges();
            const badge = fixture.debugElement.query(By.css('kbq-badge'));

            expect(badge).toBeFalsy();
        });
    });

    describe('Integration — single-site popup', () => {
        let fixture: ComponentFixture<AppSwitcherSingleSite>;
        let trigger: KbqAppSwitcherTrigger;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(AppSwitcherSingleSite);
            trigger = getTrigger(fixture);
        }));

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        it('popup opens and kbq-app-switcher element is present in overlay', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const switcher = overlayContainerElement.querySelector('.kbq-app-switcher');

            expect(switcher).toBeTruthy();
        }));

        it('app names from the site are rendered in the popup', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const text = overlayContainerElement.textContent || '';

            SITE_A.apps.forEach((app) => {
                expect(text).toContain(app.name);
            });
        }));

        it('does not render sites container in single-site mode', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const sitesContainer = overlayContainerElement.querySelector('.kbq-app-switcher__sites-container');

            expect(sitesContainer).toBeFalsy();
        }));

        it('does not render search input when apps count <= 7', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const searchContainer = overlayContainerElement.querySelector('.kbq-app-switcher__search-container');

            expect(searchContainer).toBeFalsy();
        }));
    });

    describe('Integration — multi-site popup', () => {
        let fixture: ComponentFixture<AppSwitcherMultiSite>;
        let trigger: KbqAppSwitcherTrigger;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(AppSwitcherMultiSite);
            trigger = getTrigger(fixture);
        }));

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        it('renders sites container when multiple sites are provided', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const sitesContainer = overlayContainerElement.querySelector('.kbq-app-switcher__sites-container');

            expect(sitesContainer).toBeTruthy();
        }));

        it('shows selected site name in the group header', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const headerText = overlayContainerElement.querySelector(
                '.kbq-app-switcher-group-header__text'
            )?.textContent;

            expect(headerText?.trim()).toBe(SITE_A.name);
        }));
    });

    describe('Integration — search', () => {
        let fixture: ComponentFixture<AppSwitcherWithSearch>;
        let trigger: KbqAppSwitcherTrigger;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(act).toEqual(exp));
            fixture = createComponent(AppSwitcherWithSearch);
            trigger = getTrigger(fixture);
        }));

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        it('renders search input when apps count > 7', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const searchContainer = overlayContainerElement.querySelector('.kbq-app-switcher__search-container');

            expect(searchContainer).toBeTruthy();
        }));

        it('shows empty state message when no apps match the search query', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const popup = trigger['instance'] as KbqAppSwitcherComponent;

            popup.searchControl.setValue('xyznotfound');
            tick();
            fixture.detectChanges();

            const emptyResult = overlayContainerElement.querySelector('.kbq-app-switcher__empty-search-result');

            expect(emptyResult).toBeTruthy();
        }));

        it('shows search results container when query is not empty', fakeAsync(() => {
            trigger.show();
            tick();
            fixture.detectChanges();

            const popup = trigger['instance'] as KbqAppSwitcherComponent;

            popup.searchControl.setValue('App 1');
            tick();
            fixture.detectChanges();

            const searchResult = overlayContainerElement.querySelector('.kbq-app-switcher__search-result');

            expect(searchResult).toBeTruthy();
        }));
    });
});

@Component({
    selector: 'app-switcher-simple',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher>AppSwitcher Trigger</button>
    `
})
export class AppSwitcherSimple {}

@Component({
    selector: 'app-switcher-single-site',
    imports: [KbqAppSwitcherModule],
    template: `
        <button
            kbqAppSwitcher
            [sites]="sites"
            [selectedSite]="sites[0]"
            [selectedApp]="sites[0].apps[0]"
            (selectedAppChange)="onAppChange($event)"
            (selectedSiteChange)="onSiteChange($event)"
        >
            Trigger
        </button>
    `
})
class AppSwitcherSingleSite {
    sites: KbqAppSwitcherSite[] = [{ ...SITE_A, apps: [...SITE_A.apps] }];
    onAppChange = jest.fn();
    onSiteChange = jest.fn();
}

@Component({
    selector: 'app-switcher-multi-site',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="sites" [selectedSite]="sites[0]" [selectedApp]="sites[0].apps[0]">
            Trigger
        </button>
    `
})
class AppSwitcherMultiSite {
    sites: KbqAppSwitcherSite[] = [
        { ...SITE_A, apps: [...SITE_A.apps] },
        { ...SITE_B, apps: [...SITE_B.apps] }
    ];
}

@Component({
    selector: 'app-switcher-with-search',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="[bigSite]" [selectedSite]="bigSite">Trigger</button>
    `
})
class AppSwitcherWithSearch {
    bigSite: KbqAppSwitcherSite = { ...BIG_SITE, apps: [...BIG_SITE.apps] };
}

@Component({
    selector: 'list-item-host',
    imports: [KbqAppSwitcherListItem],
    template: `
        <div kbq-app-switcher-list-item [app]="app" [toggle]="toggle" [collapsed]="collapsed"></div>
    `
})
class ListItemHost {
    app: KbqAppSwitcherApp = { ...APP_1 };
    toggle = false;
    collapsed = false;
}

@Component({
    selector: 'dropdown-site-host',
    imports: [KbqAppSwitcherDropdownSite],
    template: `
        <div [kbq-app-switcher-dropdown-site]="site"></div>
    `
})
class DropdownSiteHost {
    site: KbqAppSwitcherSite = { ...SITE_A };
}
