import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

/**
 * Keeps dropdowns and tooltips visible over the sheets of the phone layout. A modal `<dialog>` sits in the top
 * layer, above anything in `body`, so while one is open the overlay container moves into it, the way
 * `FullscreenOverlayContainer` follows the fullscreen element.
 */
@Injectable()
export class DocsNextOverlayContainer extends OverlayContainer {
    override getContainerElement(): HTMLElement {
        const container = super.getContainerElement();
        const dialogs = this._document.querySelectorAll<HTMLDialogElement>('dialog[open]');
        const host = dialogs.length ? dialogs[dialogs.length - 1] : this._document.body;

        if (container.parentElement !== host) host.appendChild(container);

        return container;
    }
}
