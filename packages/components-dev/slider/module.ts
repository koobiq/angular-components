import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SliderExamplesModule } from 'packages/docs-examples/components/slider';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-app',
    imports: [SliderExamplesModule, DevThemeToggle],
    template: `
        <dev-theme-toggle />
        <main style="max-width: 640px; margin: 40px auto; padding: 24px">
            <h1>Slider</h1>
            <h2>Overview</h2>
            <slider-overview-example />
            <h2>Scan settings</h2>
            <slider-settings-example />
            <h2>States</h2>
            <slider-states-example />
            <h2>Marks</h2>
            <slider-marks-example />
            <h2>Range</h2>
            <slider-range-example />
            <h2>Vertical</h2>
            <slider-vertical-example />
            <h2>Fill</h2>
            <slider-fill-example />
            <h2>Map zoom</h2>
            <slider-commit-example />
            <h2>Tooltip</h2>
            <slider-tooltip-example />
            <h2>Alignment</h2>
            <slider-alignment-example />
            <h2>Labels</h2>
            <slider-labels-example />
            <h2>Forms</h2>
            <slider-forms-example />
            <h2>Input slider</h2>
            <slider-input-example />
            <h2>Custom styles</h2>
            <slider-custom-example />
        </main>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
