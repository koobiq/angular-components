/**
 * @deprecated Will be removed in next major release. Use `KbqAnimationCurves` instead.
 *
 * @docs-private
 */
export enum AnimationCurves {
    StandardCurve = 'cubic-bezier(0.4,0.0,0.2,1)',
    DecelerationCurve = 'cubic-bezier(0.0,0.0,0.2,1)',
    AccelerationCurve = 'cubic-bezier(0.4,0.0,1,1)',
    SharpCurve = 'cubic-bezier(0.4,0.0,0.6,1)'
}

/**
 * Koobiq components animation curves
 *
 * @docs-private
 */
export enum KbqAnimationCurves {
    StandardCurve = 'cubic-bezier(0.4,0.0,0.2,1)',
    DecelerationCurve = 'cubic-bezier(0.0,0.0,0.2,1)',
    AccelerationCurve = 'cubic-bezier(0.4,0.0,1,1)',
    SharpCurve = 'cubic-bezier(0.4,0.0,0.6,1)'
}

/**
 * Koobiq components animation durations
 *
 * @docs-private
 */
export enum KbqAnimationDurations {
    Complex = '350ms',
    Entering = '200ms',
    Exiting = '175ms'
}
