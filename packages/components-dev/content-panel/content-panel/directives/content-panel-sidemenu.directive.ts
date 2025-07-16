import { Directive } from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Directive({
    selector: '[icContentPanelSidemenu], ic-content-panel-sidemenu, [ic-content-panel-sidemenu]',
    host: {
        class: 'ic-content-panel__sidemenu ic-border-right'
    }
})
/**
 * @class ContentPanelSidemenuDirective - Боковое меню ContentPanel
 */
export class ContentPanelSidemenuDirective {}
