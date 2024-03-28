import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { AnimationCurves } from '@koobiq/components/core';

import { KbqSidepanelPosition } from './sidepanel-config';


export enum KbqSidepanelAnimationState {
    Void = 'void',
    Visible = 'visible',
    Hidden = 'hidden'
}

// TODO Find a way to use dynamic keys and avoid error "Expression form not supported."
// tslint:disable-next-line
export const kbqSidepanelTransformAnimation: Record<KbqSidepanelPosition, { in: string; out: string }> = {
    right: { in: 'translateX(100%)', out: 'translateX(0%)' },
    left: { in: 'translateX(-100%)', out: 'translateX(0%)' },
    top: { in: 'translateY(-100%)', out: 'translateY(0%)' },
    bottom: { in: 'translateY(100%)', out: 'translateY(0%)' }
};

export const kbqSidepanelAnimations: { readonly sidepanelState: AnimationTriggerMetadata } = {
    sidepanelState: trigger('state', [
        state(
            'hidden',
            style({ transform: '{{transformIn}}' }),
            { params: { transformIn: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].in }}
        ),
        state(
            'visible',
            style({ transform: '{{transformOut}}' }),
            { params: { transformOut: kbqSidepanelTransformAnimation[KbqSidepanelPosition.Right].out }}
        ),
        transition(
            'visible => void, visible => hidden',
            animate(`200ms ${AnimationCurves.AccelerationCurve}`)
        ),
        transition(
            'void => visible',
            animate(`200ms ${AnimationCurves.DecelerationCurve}`)
        )
    ])
};
