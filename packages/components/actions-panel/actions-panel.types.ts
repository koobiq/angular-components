import { InjectionToken } from '@angular/core';
import type { KbqActionsPanel } from './actions-panel';

/**
 * The service that opened the panel, as its container sees it. Provided by `KbqActionsPanel` to the container it
 * creates, so that the container closes the panel without importing the service back.
 *
 * @internal
 */
export const KBQ_ACTIONS_PANEL = new InjectionToken<Pick<KbqActionsPanel, 'close'>>('KbqActionsPanel');
