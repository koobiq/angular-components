/** @docs-private */
export interface IClickPosition {
    x: number;
    y: number;
}

/** @docs-private */
export class ModalUtil {
    private lastPosition: IClickPosition;

    constructor(private document?: Document) {
        this.lastPosition = { x: -1, y: -1 };
        this.listenDocumentClick();
    }

    getLastClickPosition(): IClickPosition {
        return this.lastPosition;
    }

    listenDocumentClick(): void {
        this.document?.addEventListener('click', (event: MouseEvent) => {
            this.lastPosition = { x: event.clientX, y: event.clientY };
        });
    }
}

/** @docs-private */
export const modalUtilObject = new ModalUtil(
    // For SSR compatibility
    // eslint-disable-next-line no-restricted-globals
    typeof document === 'undefined' ? undefined : document
);
