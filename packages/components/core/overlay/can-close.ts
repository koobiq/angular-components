import { Observable } from 'rxjs';

/** The way the close of an overlay-based component (sidepanel, modal) was attempted. */
export type KbqCloseReason = 'backdrop' | 'escape' | 'close' | 'programmatic';

/**
 * Guard intercepting a close attempt of an overlay-based component. Returning `true` lets the
 * close proceed; `false` keeps the component open. Async results are awaited, and repeated
 * triggers are ignored while a decision is pending.
 */
export type KbqCanClose = (reason: KbqCloseReason) => boolean | Promise<boolean> | Observable<boolean>;
