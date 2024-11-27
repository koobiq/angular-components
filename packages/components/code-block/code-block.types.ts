import { InjectionToken } from '@angular/core';
import { ruRULocaleData } from '@koobiq/components/core';

export const KBQ_CODE_BLOCK_CONFIGURATION = new InjectionToken<any>('KbqCodeBlockConfiguration');

export const KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION = ruRULocaleData.codeBlock;

export interface KbqCodeBlockConfiguration {
    softWrapOnTooltip: string;
    softWrapOffTooltip: string;

    downloadTooltip: string;

    copiedTooltip: string;
    copyTooltip: string;

    viewAllText: string;
    viewLessText: string;

    openExternalSystemTooltip: string;
}

/** Code block file type. */
export type KbqCodeBlockFile = {
    filename: string;
    content: string;
    /**
     * File language
     *
     * @link https://highlightjs.readthedocs.io/en/stable/supported-languages.html
     */
    language: string;

    link?: string;
};

/** @deprecated Will be removed in next major release, use `KbqCodeBlockFile` instead. */
export type KbqCodeFile = KbqCodeBlockFile;
