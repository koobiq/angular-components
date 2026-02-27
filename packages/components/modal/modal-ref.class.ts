import { Observable } from 'rxjs';
import { KbqModalComponent } from './modal.component';

/**
 * API class that public to users to handle the modal instance.
 * KbqModalRef is aim to avoid accessing to the modal instance directly by users.
 */
export abstract class KbqModalRef<C = any, R = unknown> {
    abstract afterOpen: Observable<void>;
    abstract beforeClose: Observable<R | undefined>;
    abstract afterClose: Observable<R | undefined>;

    abstract open(): void;

    abstract close(result?: R): void;

    abstract destroy(result?: R): void;

    /**
     * Trigger the kbqOnOk/kbqOnCancel by manual
     */
    abstract triggerOk(): void;

    abstract triggerCancel(): void;

    // /**
    //  * Return the ComponentRef of kbqContent when specify kbqContent as a Component
    //  * Note: this method may return undefined if the Component has not ready yet.
    //    (it only available after Modal's ngOnInit)
    //  */
    // abstract getContentComponentRef(): ComponentRef<{}>;

    /**
     * Return the component instance of kbqContent when specify kbqContent as a Component
     * Note: this method may return undefined if the Component has not ready yet.
     * (it only available after Modal's ngOnInit)
     */
    abstract getContentComponent(): C;

    /**
     * Get the dom element of this Modal
     */
    abstract getElement(): HTMLElement;

    /**
     * Get the instance of the Modal itself
     */
    abstract getInstance(): KbqModalComponent;

    /**
     * Call markForCheck for change detector
     */
    abstract markForCheck();
}
