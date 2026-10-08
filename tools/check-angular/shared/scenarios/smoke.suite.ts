import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { SmokeScenario } from './smoke';

export function defineSmokeSuite(config: CheckConfig): void {
    describe(`smoke (${config.name})`, () => {
        it('runs the configured change detection', async () => {
            await renderScenario(SmokeScenario, config);

            const zoned = config.name !== 'zoneless';

            expect(typeof (globalThis as { Zone?: unknown }).Zone).toBe(zoned ? 'function' : 'undefined');
            expect(TestBed.inject(NgZone).constructor.name.includes('Noop')).toBe(!zoned);
        });

        it('renders a Koobiq component and re-renders it after a click', async () => {
            const fixture = await renderScenario(SmokeScenario, config);
            const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

            expect(button.classList).toContain('kbq-button');
            expect(button.textContent?.trim()).toBe('Clicked 0');

            button.click();
            await fixture.whenStable();

            expect(button.textContent?.trim()).toBe('Clicked 1');
        });
    });
}
