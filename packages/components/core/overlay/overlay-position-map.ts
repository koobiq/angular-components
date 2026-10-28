import { ConnectionPositionPair, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

/** @internal */
export const POSITION_MAP = {
    top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
    },
    topCenter: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
    },
    topLeft: {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    topRight: {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom'
    },
    right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center'
    },
    rightTop: {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top'
    },
    rightBottom: {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
    },
    bottomCenter: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
    },
    bottomLeft: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
    },
    bottomRight: {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
    },
    left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center'
    },
    leftTop: {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top'
    },
    leftBottom: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'bottom'
    }
} satisfies Record<string, ConnectionPositionPair>;

/** @internal */
export const EXTENDED_OVERLAY_POSITIONS = [
    POSITION_MAP.top,
    POSITION_MAP.topLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.right,
    POSITION_MAP.rightTop,
    POSITION_MAP.rightBottom,
    POSITION_MAP.bottom,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.left,
    POSITION_MAP.leftTop,
    POSITION_MAP.leftBottom
];

const TOP_POSITION_PRIORITY = [
    POSITION_MAP.top,
    POSITION_MAP.bottom,
    POSITION_MAP.right,
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight
];

const BOTTOM_POSITION_PRIORITY = [
    POSITION_MAP.bottom,
    POSITION_MAP.top,
    POSITION_MAP.topLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom
];

const RIGHT_POSITION_PRIORITY = [
    POSITION_MAP.right,
    POSITION_MAP.left,
    POSITION_MAP.leftTop,
    POSITION_MAP.leftBottom,
    POSITION_MAP.top,
    POSITION_MAP.bottom
];

const LEFT_POSITION_PRIORITY = [
    POSITION_MAP.left,
    POSITION_MAP.right,
    POSITION_MAP.rightTop,
    POSITION_MAP.rightBottom,
    POSITION_MAP.top,
    POSITION_MAP.bottom
];

const RIGHT_TOP_POSITION_PRIORITY = [
    POSITION_MAP.rightTop,
    POSITION_MAP.leftTop,
    POSITION_MAP.left,
    POSITION_MAP.leftBottom,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomLeft
];

const RIGHT_BOTTOM_POSITION_PRIORITY = [
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom,
    POSITION_MAP.left,
    POSITION_MAP.leftTop,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomLeft
];

const LEFT_TOP_POSITION_PRIORITY = [
    POSITION_MAP.leftTop,
    POSITION_MAP.rightTop,
    POSITION_MAP.right,
    POSITION_MAP.rightBottom,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomRight
];

const LEFT_BOTTOM_POSITION_PRIORITY = [
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom,
    POSITION_MAP.right,
    POSITION_MAP.rightTop,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomRight
];

const TOP_LEFT_POSITION_PRIORITY = [
    POSITION_MAP.topLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottom,
    POSITION_MAP.bottomRight,
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom
];

const TOP_RIGHT_POSITION_PRIORITY = [
    POSITION_MAP.topRight,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.bottom,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom
];

const BOTTOM_RIGHT_POSITION_PRIORITY = [
    POSITION_MAP.bottomRight,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.top,
    POSITION_MAP.topLeft,
    POSITION_MAP.leftTop,
    POSITION_MAP.rightTop
];

const BOTTOM_LEFT_POSITION_PRIORITY = [
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.topLeft,
    POSITION_MAP.top,
    POSITION_MAP.topRight,
    POSITION_MAP.rightTop,
    POSITION_MAP.leftTop
];

/** @internal */
export const POSITION_PRIORITY_STRATEGY = {
    top: TOP_POSITION_PRIORITY,
    topLeft: TOP_LEFT_POSITION_PRIORITY,
    topRight: TOP_RIGHT_POSITION_PRIORITY,
    bottom: BOTTOM_POSITION_PRIORITY,
    bottomLeft: BOTTOM_LEFT_POSITION_PRIORITY,
    bottomRight: BOTTOM_RIGHT_POSITION_PRIORITY,
    left: LEFT_POSITION_PRIORITY,
    leftTop: LEFT_TOP_POSITION_PRIORITY,
    leftBottom: LEFT_BOTTOM_POSITION_PRIORITY,
    right: RIGHT_POSITION_PRIORITY,
    rightTop: RIGHT_TOP_POSITION_PRIORITY,
    rightBottom: RIGHT_BOTTOM_POSITION_PRIORITY
};

export const POSITION_TO_CSS_MAP: { [key: string]: string } = {
    top: 'top',
    topLeft: 'top-left',
    topRight: 'top-right',
    right: 'right',
    rightTop: 'right-top',
    rightBottom: 'right-bottom',
    left: 'left',
    leftTop: 'left-top',
    leftBottom: 'left-bottom',
    bottom: 'bottom',
    bottomLeft: 'bottom-left',
    bottomRight: 'bottom-right'
};

export const KBQ_CUSTOM_SCROLL_STRATEGY_PROVIDER = <T>(
    token: InjectionToken<T>,
    factory: (overlay: Overlay) => () => ScrollStrategy
) => ({
    provide: token,
    deps: [Overlay],
    useFactory: factory
});
