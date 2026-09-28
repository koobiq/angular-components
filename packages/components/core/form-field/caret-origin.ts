import { KbqCaretRect } from './caret-rect';

/**
 * Overlay origin that stays on the caret: a virtual origin for `FlexibleConnectedPositionStrategy.setOrigin()` whose
 * `x`, `y`, `width` and `height` are measured again whenever the strategy reads them.
 *
 * A plain rectangle is a snapshot, and every repositioning the caret itself does not cause — a scrolled page, a resized
 * window, the field moving within its layout — would place the overlay at coordinates the caret has left. Reads made
 * within one task share one measurement, so positioning the overlay measures the caret once.
 *
 * `measure` returns the rectangle to anchor to, including a fallback for when the caret cannot be located.
 */
export const kbqCreateCaretOrigin = (measure: () => KbqCaretRect): Readonly<KbqCaretRect> => {
    let measured: KbqCaretRect | null = null;

    const read = (): KbqCaretRect => {
        if (!measured) {
            measured = measure();
            queueMicrotask(() => (measured = null));
        }

        return measured;
    };

    return {
        get x() {
            return read().x;
        },
        get y() {
            return read().y;
        },
        get width() {
            return read().width;
        },
        get height() {
            return read().height;
        }
    };
};
