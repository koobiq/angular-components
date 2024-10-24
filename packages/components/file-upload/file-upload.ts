import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface KbqFile extends File {
    /* used when directory dropped */
    fullPath: string;
}

export interface KbqFileItem {
    file: File;
    hasError?: boolean;
    loading?: BehaviorSubject<boolean>;
    progress?: BehaviorSubject<number>;
}

export interface KbqInputFile {
    disabled: boolean;
    accept?: string[];
    onFileSelectedViaClick(event: Event): void;
    onFileDropped(files: FileList | KbqFile[]): void;
}

export interface KbqInputFileLabel {
    /* Text for description, used with `browseLink` */
    captionText: string;
    /* Text for link with which the file(s) can be selected to download */
    browseLink: string;
    /* Header for multiple file-upload in default size */
    title?: string | undefined;
}

/**
 * @deprecated use FormControl for validation
 */
export type KbqFileValidatorFn = (file: File) => string | null;

/* Object for labels customization inside file upload component */
export const KBQ_FILE_UPLOAD_CONFIGURATION = new InjectionToken<KbqInputFileLabel>('KbqFileUploadConfiguration');

export const isCorrectExtension = (file: File, accept?: string[]): boolean => {
    if (!accept?.length) return true;

    const { name, type } = file;
    const fileExt: string = name.split('.').pop() || '';

    for (const acceptedExtensionOrMimeType of accept) {
        const typeAsRegExp = new RegExp(acceptedExtensionOrMimeType);
        if (typeAsRegExp.test(fileExt) || typeAsRegExp.test(type)) {
            return true;
        }
    }

    return false;
};
