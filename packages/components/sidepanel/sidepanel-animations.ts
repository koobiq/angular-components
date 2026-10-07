import { KbqSidepanelPosition } from './sidepanel-config';

/** @internal */
export enum KbqSidepanelAnimationState {
    Void = 'void',
    Visible = 'visible',
    Hidden = 'hidden',
    Lower = 'lower',
    BottomPanel = 'bottom-panel',
    BecomingNormal = 'becoming-normal'
}

/**
 * A state transition of the sidepanel container: started, or ended — finished, or interrupted by the next one.
 * @internal
 */
export interface KbqSidepanelAnimationEvent {
    phaseName: 'start' | 'done';
    toState: KbqSidepanelAnimationState;
}

/** @internal */
export const kbqSidepanelTransformAnimation: Record<
    KbqSidepanelPosition,
    { in: string; out: string; lower: string; bottomPanel: string; becomingNormal: string }
> = {
    right: {
        in: 'translateX(100%)',
        out: 'translateX(0)',
        lower: 'scale(0.95) translateX(calc(-1 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        bottomPanel: 'scale(0.9) translateX(calc(-2 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        becomingNormal: 'translateX(0) scale(1)'
    },
    left: {
        in: 'translateX(-100%) scale(1)',
        out: 'translateX(0%) scale(1)',
        lower: 'scale(0.95) translateX(var(--kbq-sidepanel-size-panel-lower-offset))',
        bottomPanel: 'scale(0.9) translateX(calc(2 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        becomingNormal: 'translateX(0%) scale(1)'
    },
    top: {
        in: 'translateY(-100%)',
        out: 'translateY(0%)',
        lower: 'scale(0.95) translateY(var(--kbq-sidepanel-size-panel-lower-offset))',
        bottomPanel: 'scale(0.9) translateY(calc(2 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        becomingNormal: 'translateY(0%) scale(1)'
    },
    bottom: {
        in: 'translateY(100%)',
        out: 'translateY(0%)',
        lower: 'scale(0.95) translateY(calc(-1 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        bottomPanel: 'scale(0.9) translateY(calc(-2 * var(--kbq-sidepanel-size-panel-lower-offset)))',
        becomingNormal: 'translateY(0%) scale(1)'
    }
};
