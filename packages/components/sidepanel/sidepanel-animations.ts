import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { KbqAnimationCurves, KbqAnimationDurations } from '@koobiq/components/core';
import { KbqSidepanelPosition } from './sidepanel-config';

export enum KbqSidepanelAnimationState {
    Void = 'void',
    Visible = 'visible',
    Hidden = 'hidden',
    Lower = 'lower',
    BottomPanel = 'bottom-panel',
    BecomingNormal = 'becoming-normal'
}

// TODO Find a way to use dynamic keys and avoid error "Expression form not supported."
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

export const kbqSidepanelAnimations: { readonly sidepanelState: AnimationTriggerMetadata } = {
    sidepanelState: trigger('state', [
        state(KbqSidepanelAnimationState.Void, style({ opacity: 0 })),
        state(KbqSidepanelAnimationState.Hidden, style({ transform: '{{transformIn}}' }), {
            params: { transformIn: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].in }
        }),
        state(KbqSidepanelAnimationState.Visible, style({ transform: '{{transformOut}}', opacity: 1 }), {
            params: { transformOut: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].out }
        }),
        state(KbqSidepanelAnimationState.Lower, style({ transform: '{{lower}}', opacity: 1 }), {
            params: { lower: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].lower }
        }),
        state(KbqSidepanelAnimationState.BottomPanel, style({ transform: '{{bottomPanel}}', opacity: 0 }), {
            params: { bottomPanel: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].bottomPanel }
        }),
        state(KbqSidepanelAnimationState.BecomingNormal, style({ transform: '{{becomingNormal}}', opacity: 1 }), {
            params: { becomingNormal: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].becomingNormal }
        }),
        transition('* <=> *', animate(`${KbqAnimationDurations.Long} ${KbqAnimationCurves.EaseInOutQuad}`))
    ])
};
