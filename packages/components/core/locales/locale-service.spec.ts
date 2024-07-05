import { TestBed } from '@angular/core/testing';

import { KbqLocaleService } from './locale-service';

describe('KbqLocaleService', () => {
    let service: KbqLocaleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [KbqLocaleService]
        });
        service = TestBed.inject(KbqLocaleService);
    });

    it('should change the lang attribute of the html element', () => {
        const locale = 'ru-RU';
        service.setLocale(locale);
        expect(document.documentElement.lang).toBe(locale);
    });
});
