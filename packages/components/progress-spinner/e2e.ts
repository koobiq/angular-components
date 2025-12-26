import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'e2e-progress-spinner-states',
    imports: [KbqProgressSpinnerModule],
    template: `
        <kbq-progress-spinner mode="determinate" [value]="44" />
        <kbq-progress-spinner mode="determinate" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>

        <kbq-progress-spinner mode="indeterminate" [value]="44" />
        <kbq-progress-spinner mode="indeterminate" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>

        <kbq-progress-spinner mode="determinate" size="compact" [value]="44" />
        <kbq-progress-spinner mode="determinate" size="compact" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>

        <kbq-progress-spinner mode="indeterminate" size="compact" [value]="44" />
        <kbq-progress-spinner mode="indeterminate" size="compact" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>

        <kbq-progress-spinner mode="determinate" size="big" [value]="44" />
        <kbq-progress-spinner mode="determinate" size="big" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>

        <kbq-progress-spinner mode="indeterminate" size="big" [value]="44" />
        <kbq-progress-spinner mode="indeterminate" size="big" [value]="44">
            <div kbq-progress-spinner-text>Text</div>
            <div kbq-progress-spinner-caption>Caption</div>
        </kbq-progress-spinner>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eProgressSpinnerStates'
    }
})
export class E2eProgressSpinnerStates {}
