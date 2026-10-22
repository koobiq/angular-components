import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'test-app',
    imports: [KbqProgressSpinnerModule],
    template: `
        <kbq-progress-spinner class="compact-44" [value]="44" />
        <kbq-progress-spinner class="compact-91" [value]="91" />
        <kbq-progress-spinner class="big-44" size="big" [value]="44" />
    `
})
class TestApp {}

/**
 * The view box is 100 x 100, so its normalized diagonal is 100 user units and every percentage of `r`,
 * `stroke-dasharray` and `stroke-dashoffset` reads as user units. The dash is `stroke-dasharray: 295%`
 * (progress-spinner.scss:23; jsdom loads no component styles, so it is restated here), so the visible arc is
 * `295 - offset` units long.
 */
const DASH = 295;

const drawnFraction = (host: HTMLElement): number => {
    const circle = host.querySelector<SVGCircleElement>('.kbq-progress-spinner__circle')!;
    const radius = parseFloat(circle.getAttribute('r')!);
    const offset = parseFloat(circle.style.strokeDashoffset);

    return Math.min(1, (DASH - offset) / (2 * Math.PI * radius));
};

describe('KbqProgressSpinner triage: compact arc length', () => {
    it('DEFECT: a compact spinner at 44% draws about 48.6% of its circle, and a full one at 91%', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const compact44: HTMLElement = fixture.nativeElement.querySelector('.compact-44');
        const compact91: HTMLElement = fixture.nativeElement.querySelector('.compact-91');
        const big44: HTMLElement = fixture.nativeElement.querySelector('.big-44');

        expect(compact44.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 100 100');

        expect(compact44.querySelector('circle')!.getAttribute('r')).toBe('42.5%');
        expect(parseFloat(compact44.querySelector('circle')!.style.strokeDashoffset)).toBeCloseTo(165.2, 5);

        expect(drawnFraction(compact44)).toBeCloseTo(0.486, 3);
        expect(drawnFraction(compact91)).toBe(1);
        // The big circle (r = 47%, circumference 295.3) is the one the constant was computed for.
        expect(drawnFraction(big44)).toBeCloseTo(0.44, 2);
    });
});
