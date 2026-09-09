import { InjectionToken, Provider } from '@angular/core';
import {
    KbqDeepPartial,
    KbqFileUploadLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    ruRULocaleData
} from '@koobiq/components/core';

/** Localization configuration provider for the labels the file upload components render themselves. */
export const KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION = new InjectionToken<KbqFileUploadLocaleConfiguration>(
    'KbqFileUploadLocaleConfiguration',
    { factory: () => ruRULocaleData.fileUpload }
);

/**
 * Utility provider. Only the labels you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION
 */
export const kbqFileUploadLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqFileUploadLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('fileUpload', configuration);
