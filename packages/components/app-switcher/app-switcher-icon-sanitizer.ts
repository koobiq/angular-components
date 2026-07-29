import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * SVG elements allowed inside `KbqAppSwitcherApp.icon`/`KbqAppSwitcherSite.icon`.
 *
 * Everything else is dropped, which is what neutralises the dangerous markup: `script` (inline JS),
 * `foreignObject` (re-opens an HTML parsing context inside the SVG), `style` (CSS-based exfiltration and
 * the classic mXSS vector), `a` (navigation) and every HTML element such as `img` or `iframe`.
 * Keys are lower-cased because SVG tag names are case-sensitive (`clipPath`, `linearGradient`, …).
 */
const ALLOWED_ELEMENTS: ReadonlySet<string> = new Set([
    'circle',
    'clippath',
    'defs',
    'desc',
    'ellipse',
    'feblend',
    'fecolormatrix',
    'fecomposite',
    'fedropshadow',
    'feflood',
    'fegaussianblur',
    'femerge',
    'femergenode',
    'feoffset',
    'filter',
    'g',
    'lineargradient',
    'line',
    'marker',
    'mask',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialgradient',
    'rect',
    'stop',
    'svg',
    'symbol',
    'text',
    'textpath',
    'title',
    'tspan',
    'use'
]);

/**
 * Attributes allowed on the elements above — geometry, presentation and a few a11y hooks.
 * Anything absent from this list is removed, which covers every `on*` event handler.
 */
const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set([
    'aria-hidden',
    'aria-label',
    'baseline-shift',
    'class',
    'clip-path',
    'clip-rule',
    'color',
    'cx',
    'cy',
    'd',
    'display',
    'dominant-baseline',
    'dx',
    'dy',
    'fill',
    'fill-opacity',
    'fill-rule',
    'filter',
    'filterunits',
    'flood-color',
    'flood-opacity',
    'focusable',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'fx',
    'fy',
    'gradienttransform',
    'gradientunits',
    'height',
    'href',
    'id',
    'in',
    'in2',
    'letter-spacing',
    'marker-end',
    'marker-mid',
    'marker-start',
    'markerheight',
    'markerwidth',
    'mask',
    'maskunits',
    'mode',
    'offset',
    'opacity',
    'orient',
    'overflow',
    'pathlength',
    'patterncontentunits',
    'patternunits',
    'points',
    'preserveaspectratio',
    'primitiveunits',
    'r',
    'refx',
    'refy',
    'result',
    'role',
    'rx',
    'ry',
    'shape-rendering',
    'spreadmethod',
    'stddeviation',
    'stop-color',
    'stop-opacity',
    'stroke',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-opacity',
    'stroke-width',
    'style',
    'text-anchor',
    'transform',
    'type',
    'values',
    'vector-effect',
    'viewbox',
    'visibility',
    'width',
    'x',
    'x1',
    'x2',
    'xlink:href',
    'xmlns',
    'xmlns:xlink',
    'y',
    'y1',
    'y2'
]);

/** Attributes carrying a URL: only same-document fragment references (`#gradient-1`) survive. */
const URL_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'xlink:href']);

/** Inline styles that can load or execute something are dropped rather than parsed. */
const UNSAFE_STYLE_VALUE = /url\s*\(|expression\s*\(|javascript\s*:/i;

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
 * Turns the caller-supplied inline SVG of an app-switcher icon into markup that is safe to hand to
 * `[innerHtml]`.
 *
 * Angular's own HTML sanitizer cannot be used here: its allow-list contains no SVG elements at all, so it
 * would strip every icon. Instead the markup is parsed inert (inside a `<template>`, where no request is
 * issued and no script runs), filtered against a strict SVG allow-list, and only then marked as trusted.
 */
@Injectable({ providedIn: 'root' })
export class KbqAppSwitcherIconSanitizer {
    private readonly document = inject(DOCUMENT);
    private readonly domSanitizer = inject(DomSanitizer);

    /**
     * Sanitizes inline SVG markup and wraps it as `SafeHtml`. Returns `null` for empty input, so callers can
     * use the result directly as the `@if` condition of the icon element.
     */
    sanitize(icon: string | null | undefined): SafeHtml | null {
        if (!icon) return null;

        const sanitized = this.filter(icon);

        if (!sanitized) return null;

        // Second pass: `[innerHtml]` re-parses our serialized output, and mutation-XSS works by making that
        // second parse differ from the first. Benign markup is already normalised by pass one, so a
        // difference here means the input was crafted to change shape on re-parse - drop it entirely.
        if (this.filter(sanitized) !== sanitized) return null;

        return this.domSanitizer.bypassSecurityTrustHtml(sanitized);
    }

    /** Parses the markup inertly, strips everything outside the allow-lists and serializes it back. */
    private filter(markup: string): string {
        const template = this.document.createElement('template');

        template.innerHTML = markup;

        this.sanitizeChildren(template.content);

        return template.innerHTML;
    }

    private sanitizeChildren(node: Node): void {
        // Snapshot the list: removing a node while iterating a live NodeList skips its sibling.
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === ELEMENT_NODE) {
                const element = child as Element;

                if (ALLOWED_ELEMENTS.has(element.localName.toLowerCase())) {
                    this.sanitizeAttributes(element);
                    this.sanitizeChildren(element);

                    continue;
                }
            } else if (child.nodeType === TEXT_NODE) {
                continue;
            }

            // Disallowed elements, comments and CDATA sections (a known mXSS carrier) all go.
            child.parentNode?.removeChild(child);
        }
    }

    private sanitizeAttributes(element: Element): void {
        for (const { name, value } of Array.from(element.attributes)) {
            const attribute = name.toLowerCase();
            const allowed =
                ALLOWED_ATTRIBUTES.has(attribute) &&
                (!URL_ATTRIBUTES.has(attribute) || value.trim().startsWith('#')) &&
                (attribute !== 'style' || !UNSAFE_STYLE_VALUE.test(value));

            if (!allowed) {
                element.removeAttribute(name);
            }
        }
    }
}
