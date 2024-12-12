import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    numberAttribute,
    Provider,
    Renderer2,
    SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import hljs from 'highlight.js';
import { KbqCodeBlockFile } from './types';

/**
 * Fallback language for code block if language is not supported/specified.
 *
 * List of supported languages:
 * @link https://highlightjs.readthedocs.io/en/stable/supported-languages.html
 */
export const KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE = new InjectionToken<string>(
    'KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE',
    { factory: () => 'plaintext' }
);

/** Utility provider for `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE`. */
export const kbqCodeBlockFallbackFileLanguageProvider = (language: string): Provider => ({
    provide: KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE,
    useValue: language
});

/** Directive which applies syntax highlighting to the code block content. */
@Directive({
    standalone: true,
    selector: 'code[kbqCodeBlockHighlight]',
    host: {
        class: 'hljs'
    }
})
export class KbqCodeBlockHighlight {
    private readonly nativeElement = inject(ElementRef).nativeElement;
    private readonly document = inject<Document>(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly fallbackFileLanguage = inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE);

    /** The code file. */
    @Input({ required: true })
    set file({ language, content }: KbqCodeBlockFile) {
        const window = this.getWindow();

        if (!window) return;

        if (!language || !hljs.getLanguage(language)) {
            console.warn(`[KbqCodeBlock] Unknown language: "${language}". Setting to "${this.fallbackFileLanguage}".`);
            language = this.fallbackFileLanguage;
        }

        const {
            value: highlightedHTML,
            language: highlightedLanguage,
            illegal,
            relevance
        } = hljs.highlight(content, {
            language: language!
        });

        if (illegal) {
            console.warn('[KbqCodeBlock] Content contains illegal characters.');
        }

        if (relevance === 0) {
            console.warn('[KbqCodeBlock] Content does not match the specified programming language.');
        }

        const safeHTML = this.domSanitizer.sanitize(SecurityContext.HTML, highlightedHTML);
        const highlightedHTMLWithLineNumbers = window['hljs'].lineNumbersValue(safeHTML, {
            startFrom: this.startFrom,
            singleLine: this.singleLine
        });

        this.renderer.setAttribute(this.nativeElement, 'data-language', highlightedLanguage!);
        this.renderer.setProperty(this.nativeElement, 'innerHTML', highlightedHTMLWithLineNumbers);
    }

    /** The starting line number. */
    @Input({ transform: numberAttribute }) startFrom: number = 1;

    /** Whether to display line numbers for single line code block. */
    @Input({ transform: booleanAttribute }) singleLine: boolean = false;

    constructor() {
        this.initLineNumbersPlugin();
    }

    /** Use defaultView of injected document if available or fallback to global window reference */
    private getWindow(): Window {
        return this.document?.defaultView || window;
    }

    /**
     * Initialize the HighlightJS line numbers plugin. This method is called once when
     * the component is constructed.
     */
    private initLineNumbersPlugin(): void {
        const window = this.getWindow();

        if (!window) return;

        window['hljs'] = hljs;
        this.highlightJSLineNumbersPlugin(this.document, window);
    }

    /**
     * This method is not intended for editing.
     * Changes may lead to unpredictable behavior.
     * Source code: https://github.com/wcoder/highlightjs-line-numbers.js/blob/v2.9.0/src/highlightjs-line-numbers.js
     */
    private highlightJSLineNumbersPlugin(d: Document, w: Window): void {
        'use strict';

        if (!w) return;

        const TABLE_NAME = 'hljs-ln',
            LINE_NAME = 'hljs-ln-line',
            CODE_BLOCK_NAME = 'hljs-ln-code',
            NUMBERS_BLOCK_NAME = 'hljs-ln-numbers',
            NUMBER_LINE_NAME = 'hljs-ln-n',
            DATA_ATTR_NAME = 'data-line-number',
            BREAK_LINE_REGEXP = /\r\n|\r|\n/g;

        if (w['hljs']) {
            w['hljs'].initLineNumbersOnLoad = initLineNumbersOnLoad;
            w['hljs'].lineNumbersBlock = lineNumbersBlock;
            w['hljs'].lineNumbersBlockSync = lineNumbersBlockSync;
            w['hljs'].lineNumbersValue = lineNumbersValue;

            addStyles();
        } else {
            console.error('highlight.js not detected!');
        }

        function isHljsLnCodeDescendant(domElt) {
            let curElt = domElt;
            while (curElt) {
                if (curElt.className && curElt.className.indexOf('hljs-ln-code') !== -1) {
                    return true;
                }
                curElt = curElt.parentNode;
            }
            return false;
        }

        function getHljsLnTable(hljsLnDomElt) {
            let curElt = hljsLnDomElt;
            while (curElt.nodeName !== 'TABLE') {
                curElt = curElt.parentNode;
            }
            return curElt;
        }

        // Function to workaround a copy issue with Microsoft Edge.
        // Due to hljs-ln wrapping the lines of code inside a <table> element,
        // itself wrapped inside a <pre> element, window.getSelection().toString()
        // does not contain any line breaks. So we need to get them back using the
        // rendered code in the DOM as reference.
        function edgeGetSelectedCodeLines(selection) {
            // current selected text without line breaks
            const selectionText = selection.toString();

            // get the <td> element wrapping the first line of selected code
            let tdAnchor = selection.anchorNode;
            while (tdAnchor.nodeName !== 'TD') {
                tdAnchor = tdAnchor.parentNode;
            }

            // get the <td> element wrapping the last line of selected code
            let tdFocus = selection.focusNode;
            while (tdFocus.nodeName !== 'TD') {
                tdFocus = tdFocus.parentNode;
            }

            // extract line numbers
            let firstLineNumber = parseInt(tdAnchor.dataset.lineNumber);
            let lastLineNumber = parseInt(tdFocus.dataset.lineNumber);

            // multi-lines copied case
            if (firstLineNumber != lastLineNumber) {
                let firstLineText = tdAnchor.textContent;
                let lastLineText = tdFocus.textContent;

                // if the selection was made backward, swap values
                if (firstLineNumber > lastLineNumber) {
                    let tmp = firstLineNumber;
                    firstLineNumber = lastLineNumber;
                    lastLineNumber = tmp;
                    tmp = firstLineText;
                    firstLineText = lastLineText;
                    lastLineText = tmp;
                }

                // discard not copied characters in first line
                while (selectionText.indexOf(firstLineText) !== 0) {
                    firstLineText = firstLineText.slice(1);
                }

                // discard not copied characters in last line
                while (selectionText.lastIndexOf(lastLineText) === -1) {
                    lastLineText = lastLineText.slice(0, -1);
                }

                // reconstruct and return the real copied text
                let selectedText = firstLineText;
                const hljsLnTable = getHljsLnTable(tdAnchor);
                for (let i = firstLineNumber + 1; i < lastLineNumber; ++i) {
                    const codeLineSel = format('.{0}[{1}="{2}"]', [CODE_BLOCK_NAME, DATA_ATTR_NAME, i]);
                    const codeLineElt = hljsLnTable.querySelector(codeLineSel);
                    selectedText += '\n' + codeLineElt.textContent;
                }
                selectedText += '\n' + lastLineText;
                return selectedText;
                // single copied line case
            } else {
                return selectionText;
            }
        }

        // ensure consistent code copy/paste behavior across all browsers
        // (see https://github.com/wcoder/highlightjs-line-numbers.js/issues/51)
        d.addEventListener('copy', function (e) {
            // get current selection
            const selection = w.getSelection()!;
            // override behavior when one wants to copy line of codes
            if (isHljsLnCodeDescendant(selection.anchorNode)) {
                let selectionText;
                // workaround an issue with Microsoft Edge as copied line breaks
                // are removed otherwise from the selection string
                if (w.navigator.userAgent.indexOf('Edge') !== -1) {
                    selectionText = edgeGetSelectedCodeLines(selection);
                } else {
                    // other browsers can directly use the selection string
                    selectionText = selection.toString();
                }
                e.clipboardData!.setData('text/plain', selectionText);
                e.preventDefault();
            }
        });

        function addStyles() {
            const css = d.createElement('style');
            css.type = 'text/css';
            css.innerHTML = format(
                '.{0}{border-collapse:collapse}' + '.{0} td{padding:0}' + '.{1}:before{content:attr({2})}',
                [
                    TABLE_NAME,
                    NUMBER_LINE_NAME,
                    DATA_ATTR_NAME
                ]
            );
            d.getElementsByTagName('head')[0].appendChild(css);
        }

        function initLineNumbersOnLoad(options) {
            if (d.readyState === 'interactive' || d.readyState === 'complete') {
                documentReady(options);
            } else {
                w.addEventListener('DOMContentLoaded', function () {
                    documentReady(options);
                });
            }
        }

        function documentReady(options) {
            try {
                const blocks = d.querySelectorAll('code.hljs,code.nohighlight');

                for (const i in blocks) {
                    if (blocks.hasOwnProperty(i)) {
                        if (!isPluginDisabledForBlock(blocks[i])) {
                            lineNumbersBlock(blocks[i], options);
                        }
                    }
                }
            } catch (e) {
                console.error('LineNumbers error: ', e);
            }
        }

        function isPluginDisabledForBlock(element) {
            return element.classList.contains('nohljsln');
        }

        function lineNumbersBlock(element, options) {
            if (typeof element !== 'object') return;

            async(function () {
                element.innerHTML = lineNumbersInternal(element, options);
            });
        }

        function lineNumbersBlockSync(element, options) {
            if (typeof element !== 'object') return;

            element.innerHTML = lineNumbersInternal(element, options);
        }

        function lineNumbersValue(value, options) {
            if (typeof value !== 'string') return;

            const element = d.createElement('code');
            element.innerHTML = value;

            return lineNumbersInternal(element, options);
        }

        function lineNumbersInternal(element, options) {
            const internalOptions = mapOptions(element, options);

            duplicateMultilineNodes(element);

            return addLineNumbersBlockFor(element.innerHTML, internalOptions);
        }

        function addLineNumbersBlockFor(inputHtml, options) {
            const lines = getLines(inputHtml);

            // if last line contains only carriage return remove it
            if (lines[lines.length - 1].trim() === '') {
                lines.pop();
            }

            if (lines.length > 1 || options.singleLine) {
                let html = '';

                for (let i = 0, l = lines.length; i < l; i++) {
                    html += format(
                        '<tr>' +
                            '<td class="{0} {1}" {3}="{5}">' +
                            '<div class="{2}" {3}="{5}"></div>' +
                            '</td>' +
                            '<td class="{0} {4}" {3}="{5}">' +
                            '{6}' +
                            '</td>' +
                            '</tr>',
                        [
                            LINE_NAME,
                            NUMBERS_BLOCK_NAME,
                            NUMBER_LINE_NAME,
                            DATA_ATTR_NAME,
                            CODE_BLOCK_NAME,
                            i + options.startFrom,
                            lines[i].length > 0 ? lines[i] : ' '
                        ]
                    );
                }

                return format('<table class="{0}">{1}</table>', [TABLE_NAME, html]);
            }

            return inputHtml;
        }

        /**
         * @param {HTMLElement} element Code block.
         * @param {Object} options External API options.
         * @returns {Object} Internal API options.
         */
        function mapOptions(element, options) {
            options = options || {};
            return {
                singleLine: getSingleLineOption(options),
                startFrom: getStartFromOption(element, options)
            };
        }

        function getSingleLineOption(options) {
            const defaultValue = false;
            if (options.singleLine) {
                return options.singleLine;
            }
            return defaultValue;
        }

        function getStartFromOption(element, options) {
            const defaultValue = 1;
            let startFrom = defaultValue;

            if (isFinite(options.startFrom)) {
                startFrom = options.startFrom;
            }

            // can be overridden because local option is priority
            const value = getAttribute(element, 'data-ln-start-from');
            if (value !== null) {
                startFrom = toNumber(value, defaultValue);
            }

            return startFrom;
        }

        /**
         * Recursive method for fix multi-line elements implementation in highlight.js
         * Doing deep passage on child nodes.
         * @param {HTMLElement} element
         */
        function duplicateMultilineNodes(element) {
            const nodes = element.childNodes;
            for (const node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    const child = nodes[node];
                    if (getLinesCount(child.textContent) > 0) {
                        if (child.childNodes.length > 0) {
                            duplicateMultilineNodes(child);
                        } else {
                            duplicateMultilineNode(child.parentNode);
                        }
                    }
                }
            }
        }

        /**
         * Method for fix multi-line elements implementation in highlight.js
         * @param {HTMLElement} element
         */
        function duplicateMultilineNode(element) {
            const className = element.className;

            if (!/hljs-/.test(className)) return;

            const lines = getLines(element.innerHTML);

            let result = '';

            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i].length > 0 ? lines[i] : ' ';
                result += format('<span class="{0}">{1}</span>\n', [className, lineText]);
            }

            element.innerHTML = result.trim();
        }

        function getLines(text) {
            if (text.length === 0) return [];
            return text.split(BREAK_LINE_REGEXP);
        }

        function getLinesCount(text) {
            return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
        }

        ///
        /// HELPERS
        ///

        function async(func) {
            w.setTimeout(func, 0);
        }

        /**
         * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
         * @param {string} format
         * @param {array} args
         */
        function format(format, args) {
            return format.replace(/\{(\d+)\}/g, function (m, n) {
                return args[n] !== undefined ? args[n] : m;
            });
        }

        /**
         * @param {HTMLElement} element Code block.
         * @param {String} attrName Attribute name.
         * @returns {String} Attribute value or empty.
         */
        function getAttribute(element, attrName) {
            return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null;
        }

        /**
         * @param {String} str Source string.
         * @param {Number} fallback Fallback value.
         * @returns Parsed number or fallback value.
         */
        function toNumber(str, fallback) {
            if (!str) return fallback;
            const number = Number(str);
            return isFinite(number) ? number : fallback;
        }
    }
}
