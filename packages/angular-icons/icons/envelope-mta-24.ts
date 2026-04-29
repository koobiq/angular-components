import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-envelope-mta-24,[kbqEnvelopeMta24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M7.893 16.5a.3.3 0 0 1 .278.186l1.444 3.524h.07l1.446-3.524a.3.3 0 0 1 .279-.186h1.292a.3.3 0 0 1 .3.3v5.394a.3.3 0 0 1-.3.3h-.81a.3.3 0 0 1-.3-.3V18.81h-.05l-1.44 3.645H9.2l-1.44-3.665h-.05v3.403a.3.3 0 0 1-.3.3H6.6a.3.3 0 0 1-.3-.3V16.8a.3.3 0 0 1 .3-.3zM18.401 16.5a.3.3 0 0 1 .3.3v.576a.3.3 0 0 1-.3.3h-1.517v4.518a.3.3 0 0 1-.3.3h-.828a.3.3 0 0 1-.3-.3v-4.518h-1.52a.3.3 0 0 1-.3-.3V16.8a.3.3 0 0 1 .3-.3zM21.826 16.5a.3.3 0 0 1 .284.204l1.82 5.395a.3.3 0 0 1-.285.395h-.918a.3.3 0 0 1-.287-.21l-.33-1.048h-2.07l-.328 1.047a.3.3 0 0 1-.285.211h-.919a.3.3 0 0 1-.284-.395l1.82-5.395a.3.3 0 0 1 .284-.204zm-1.44 3.634h1.379l-.667-2.124h-.047z"
                />
                <path d="M22.5 15H6.3a1.8 1.8 0 0 0-1.8 1.8V21H3.3a1.8 1.8 0 0 1-1.8-1.8V7.248L12 12.313l10.5-5.065z" />
                <path d="M20.7 3a1.8 1.8 0 0 1 1.8 1.8v.45L12 10.315 1.5 5.25V4.8A1.8 1.8 0 0 1 3.3 3z" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEnvelopeMta24 extends KbqSvgIcon {}
