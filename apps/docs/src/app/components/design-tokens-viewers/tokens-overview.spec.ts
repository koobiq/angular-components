import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { BehaviorSubject, map, of } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsStructureTokensTab } from '../../structure';
import { DocsTokensOverview } from './tokens-overview';

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru)),
            isSupportedLocale: (value: string) => value === DocsLocale.Ru || value === DocsLocale.En
        }
    };
};

type TokensOverviewInternals = { calculateViewData(): unknown };

describe('DocsTokensOverview token value caching (PERF-02)', () => {
    const setup = (getPropertyValue: jest.Mock) => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [DocsTokensOverview],
            providers: [
                provideDocsLocale(DocsLocale.En),
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { url: of([{ path: DocsStructureTokensTab.Colors }]) } },
                { provide: KBQ_WINDOW, useValue: { getComputedStyle: () => ({ getPropertyValue }) } }
            ]
        });

        // Blank the template so only DocsTokensOverview is created — the child viewers need a fuller
        // ActivatedRoute (parent.url) that is irrelevant to calculateViewData, which reads no view.
        TestBed.overrideComponent(DocsTokensOverview, { set: { template: '' } });

        return TestBed.createComponent(DocsTokensOverview).componentInstance as unknown as TokensOverviewInternals;
    };

    it('reads each token via getComputedStyle only once per theme', () => {
        const getPropertyValue = jest.fn((token: string) => `value-of-${token}`);
        const component = setup(getPropertyValue);

        const first = component.calculateViewData();
        const readsAfterFirstPass = getPropertyValue.mock.calls.length;

        // A real token set must have been read on the first pass.
        expect(readsAfterFirstPass).toBeGreaterThan(0);

        const second = component.calculateViewData();

        // The second pass is served entirely from the per-theme cache — no additional reads...
        expect(getPropertyValue.mock.calls.length).toBe(readsAfterFirstPass);
        // ...and produces byte-identical view data (the optimization is behavior-preserving).
        expect(second).toEqual(first);
    });
});
