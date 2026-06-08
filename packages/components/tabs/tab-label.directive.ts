import { CdkPortal } from '@angular/cdk/portal';
import { booleanAttribute, Directive, InjectionToken, input } from '@angular/core';

export const KBQ_TAB_LABEL = new InjectionToken<KbqTabLabel>('KbqTabLabel');

/** Used to flag tab labels for use with the portal directive */
@Directive({
    selector: '[kbq-tab-label], [kbqTabLabel]',
    providers: [{ provide: KBQ_TAB_LABEL, useExisting: KbqTabLabel }]
})
export class KbqTabLabel extends CdkPortal {
    /** Whether the tab contains only an icon without a label. */
    readonly iconOnly = input(false, { transform: booleanAttribute });
}
