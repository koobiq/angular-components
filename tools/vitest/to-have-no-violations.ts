import type { Result, RunOptions } from 'axe-core';
import type { MatcherState } from 'vitest';

let axeCore: Promise<typeof import('axe-core')> | undefined;

// Loaded by the first check rather than by the setup: most spec files run none, and every file evaluates the setup in
// a context of its own.
const loadAxe = (): Promise<typeof import('axe-core')> =>
    (axeCore ??= import('axe-core').then(({ default: axe }) => {
        // jsdom renders nothing, so the rules that need rendering could only report what it failed to compute: it
        // computes no colors, and `label-content-name-mismatch` tells an icon ligature from text by drawing it on a
        // canvas, which jsdom does not implement.
        const unrenderable = [
            ...axe.getRules(['cat.color']).map(({ ruleId }) => ruleId),
            'label-content-name-mismatch'
        ];

        axe.configure({ rules: unrenderable.map((id) => ({ id, enabled: false })) });

        return axe;
    }));

const indent = (text: string): string => text.replace(/^/gm, '  ');

const describeViolation = ({ id, impact, help, helpUrl, nodes }: Result): string => {
    const occurrences = nodes.map(({ target, html, failureSummary }) =>
        indent(`at ${target.join(', ')}\n${indent(html)}\n${indent(failureSummary ?? '')}`)
    );

    return `${id} (${impact}): ${help}\n${indent(helpUrl)}\n${occurrences.join('\n')}`;
};

/**
 * Runs axe-core on an element of the document and fails on any violation it reports. The run is asynchronous, so
 * the assertion has to be awaited: `await expect(fixture.nativeElement).toHaveNoViolations()`.
 */
export async function toHaveNoViolations(this: MatcherState, element: Element, options: RunOptions = {}) {
    // axe-core looks the context up in the document, where a detached element is not found.
    if (!(element instanceof Element) || !element.isConnected) {
        throw new TypeError(
            `toHaveNoViolations() checks an element attached to the document, got ${this.utils.stringify(element)}.`
        );
    }

    const axe = await loadAxe();
    const { violations } = await axe.run(element, options);
    const hint = this.utils.matcherHint('toHaveNoViolations', 'element', '', { isNot: this.isNot });

    return {
        pass: violations.length === 0,
        message: () =>
            this.isNot
                ? `${hint}\n\nExpected accessibility violations, found none.`
                : `${hint}\n\n${violations.map(describeViolation).join('\n\n')}`
    };
}
