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

export interface KbqCodeFile {
    filename: string;
    content: string;
    language: string;

    link?: string;
}
