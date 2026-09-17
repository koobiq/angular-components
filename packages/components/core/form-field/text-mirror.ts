import { RULER_INHERITED_PROPERTIES, WRAPPING_RULER_INHERITED_PROPERTIES } from './text-ruler';

/** Layer that renders text over a text field in the field's own layout. */
export interface KbqTextMirror {
    /**
     * Shows `hint` exactly where the field would render it between `before` and `after`. Both of those stay
     * transparent: they only take the room the field's own text takes, so the field stays readable through the layer.
     *
     * Returns whether the hint is shown where it belongs: on the row the text before it ends on, and inside the part
     * of the field the user can see. A hint that is not is hidden again.
     */
    update(before: string, hint: string, after: string): boolean;
    /** Hides the layer until the next `update`. */
    hide(): void;
    /** Removes the layer. */
    destroy(): void;
}

const MIRROR_PROPERTIES = {
    position: 'absolute',
    boxSizing: 'border-box',
    margin: '0',
    borderStyle: 'solid',
    borderColor: 'transparent',
    overflow: 'hidden',
    color: 'transparent',
    background: 'transparent',
    pointerEvents: 'none'
} as const satisfies Partial<CSSStyleDeclaration>;

const MIRRORED_PROPERTIES = [
    ...RULER_INHERITED_PROPERTIES,
    ...WRAPPING_RULER_INHERITED_PROPERTIES,
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const numeric = (value: string): number => parseFloat(value) || 0;

/**
 * Creates a {@link KbqTextMirror} for `field`, hidden until its first update. The hint is wrapped in an element with
 * the `${className}__hint` class, which is what gives it a color.
 *
 * The layer is inserted right after the field so that both share one containing block, which has to be positioned —
 * `kbq-form-field` is. It copies the field's typography, wrapping, padding and border widths, and takes the field's
 * size without its scrollbar: the layer has none, and a content box wider than the field's would wrap the text
 * elsewhere.
 *
 * Only call it in the browser.
 *
 * @docs-private
 */
export const kbqCreateTextMirror = (
    field: HTMLInputElement | HTMLTextAreaElement,
    className: string
): KbqTextMirror => {
    const document = field.ownerDocument;
    const window = document.defaultView!;
    const isTextArea = field.tagName === 'TEXTAREA';
    const layer = document.createElement('div');
    // Stands where the text before the hint ends. Its zero-width space is a break opportunity: without one, the typed
    // prefix and the hint form a single word, and a word that no longer fits would drag the prefix onto the next row.
    const marker = document.createElement('span');
    const hint = document.createElement('span');

    layer.className = className;
    layer.setAttribute('aria-hidden', 'true');
    layer.hidden = true;
    marker.textContent = '\u200b';
    hint.className = `${className}__hint`;
    Object.assign(layer.style, MIRROR_PROPERTIES);

    field.after(layer);

    const sync = () => {
        const computedStyle = window.getComputedStyle(field);

        MIRRORED_PROPERTIES.forEach((property) => {
            layer.style[property] = computedStyle[property];
        });

        const horizontalBorders = numeric(computedStyle.borderLeftWidth) + numeric(computedStyle.borderRightWidth);
        const verticalBorders = numeric(computedStyle.borderTopWidth) + numeric(computedStyle.borderBottomWidth);

        layer.style.left = `${field.offsetLeft}px`;
        layer.style.top = `${field.offsetTop}px`;
        layer.style.width = `${field.clientWidth + horizontalBorders}px`;
        layer.style.height = `${field.clientHeight + verticalBorders}px`;

        if (!isTextArea) {
            // An input keeps its value on one line whatever its `white-space`, and centres that line in the content
            // box, while a block starts it at the top; a line as tall as the content box puts the text where the
            // input does.
            const contentHeight =
                field.clientHeight - numeric(computedStyle.paddingTop) - numeric(computedStyle.paddingBottom);

            layer.style.whiteSpace = 'pre';
            layer.style.lineHeight = `${contentHeight}px`;
        }

        layer.scrollTop = field.scrollTop;
        layer.scrollLeft = field.scrollLeft;
    };

    const isHintInPlace = (): boolean => {
        const hintRect = hint.getClientRects()[0];
        const markerRect = marker.getClientRects()[0];

        // Nothing is laid out, so there is no position to check the hint against.
        if (!hintRect || !markerRect) return true;

        const layerRect = layer.getBoundingClientRect();
        const left = layerRect.left + layer.clientLeft;
        const top = layerRect.top + layer.clientTop;

        return (
            Math.abs(hintRect.top - markerRect.top) < 1 &&
            hintRect.left >= left - 1 &&
            hintRect.left < left + layer.clientWidth &&
            hintRect.top >= top - 1 &&
            hintRect.top < top + layer.clientHeight
        );
    };

    // A growing textarea changes its height after the input that made it grow, when nothing else calls `update`.
    const resizeObserver = window.ResizeObserver
        ? new window.ResizeObserver(() => {
              if (!layer.hidden) sync();
          })
        : null;

    resizeObserver?.observe(field);

    return {
        update: (before, hintText, after) => {
            hint.textContent = hintText;
            layer.textContent = '';
            // The trailing zero-width space gives a last line left empty by a newline the height the field gives it,
            // so that the layer scrolls as far as the field does.
            layer.append(before, marker, hint, after, '\u200b');
            layer.hidden = false;
            // After the content: the scroll offsets are clamped to what the layer holds when they are written.
            sync();

            const inPlace = isHintInPlace();

            layer.hidden = !inPlace;

            return inPlace;
        },
        hide: () => {
            layer.hidden = true;
        },
        destroy: () => {
            resizeObserver?.disconnect();
            layer.remove();
        }
    };
};
