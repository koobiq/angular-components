import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLink, kbqLinkOptionsProvider } from '@koobiq/components/link';

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/">Scan report</a>
    `
})
class TextLink {}

describe('triage: kbqLinkOptionsProvider with an undefined size', () => {
    it('DEFECT: { size: undefined } overrides the normal default and leaves the link without a size class', () => {
        TestBed.configureTestingModule({ providers: [kbqLinkOptionsProvider({ size: undefined })] });

        const fixture = TestBed.createComponent(TextLink);

        fixture.detectChanges();

        const link: HTMLElement = fixture.nativeElement.querySelector('[kbqLink]');
        const sizeClasses = Array.from(link.classList).filter((name) => name.startsWith('kbq-link_size_'));

        expect(sizeClasses).toEqual([]);
        expect(link.classList).toContain('kbq-link');
    });
});
