import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createSearchPredicate, tokenizeSearchQuery } from '@koobiq/components/core';
import {
    KbqTimezoneModule,
    KbqTimezoneOption,
    KbqTimezoneZone,
    offsetFormatter,
    resolveZoneOffset
} from '@koobiq/components/timezone';

const zone: KbqTimezoneZone = {
    id: 'America/Sao_Paulo',
    offset: '-03:00:00',
    city: 'Brasilia',
    countryCode: 'br',
    countryName: 'Brazil',
    cities: 'Rio de Janeiro, São Paulo'
};

@Component({
    imports: [KbqTimezoneModule],
    template: `
        <kbq-timezone-option [timezone]="zone" [highlightText]="tokens()" [foldDiacritics]="true" />
    `
})
class FoldedSearchHost {
    readonly zone = zone;
    readonly tokens = signal<string[]>([]);
}

describe('triage: foldDiacritics narrows the city list without folding', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [FoldedSearchHost] }));

    function render(query: string) {
        const fixture = TestBed.createComponent(FoldedSearchHost);

        fixture.componentInstance.tokens.set(tokenizeSearchQuery(query));
        fixture.detectChanges();

        const cities: HTMLElement = fixture.debugElement.query(By.css('.kbq-timezone-option__cities')).nativeElement;
        const option: KbqTimezoneOption = fixture.debugElement.query(By.directive(KbqTimezoneOption)).componentInstance;

        return { cities, option };
    }

    it('DEFECT: a zone found through a folded city shows an empty city list', () => {
        // The option is found the way the search example finds it: the predicate folds diacritics.
        const predicate = createSearchPredicate('sao');

        expect(predicate([offsetFormatter(resolveZoneOffset(zone)), zone.city, zone.cities])).toBe(true);

        const { cities, option } = render('sao');

        // ...but the city that matched is filtered out of the option, so nothing in it shows why it matched.
        expect(cities.textContent!.trim()).toBe('');
        expect(cities.querySelector('mark')).toBeNull();
        expect(option.tooltipViewValue).not.toContain('São Paulo');
    });

    it('CONTROL: the same city found without diacritics in the query is kept and marked', () => {
        const { cities, option } = render('paulo');

        expect(cities.textContent!.trim()).toBe('São Paulo');
        expect(cities.querySelector('mark')?.textContent).toBe('Paulo');
        expect(option.tooltipViewValue).toContain('São Paulo');
    });
});
