import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    KBQ_LOCALE_SERVICE,
    KbqBaseFileUploadLocaleConfig,
    KbqMultipleFileUploadLocaleConfig
} from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { of, skip } from 'rxjs';

const localeData = {
    'en-US': {
        single: {
            captionText: 'Drop file here or [[browseLink:secure upload]]',
            browseLink: 'secure upload'
        } satisfies Partial<KbqBaseFileUploadLocaleConfig>,

        multiple: {
            captionText: 'Drop reports here or [[browseLink:secure upload]]',
            captionTextWhenSelected: 'Add more evidence or [[browseLink:secure upload]]',
            captionTextForCompactSize: 'Attach logs or [[browseLink:secure upload]]',
            browseLink: 'secure upload',
            title: 'Submit security files'
        } satisfies Partial<KbqMultipleFileUploadLocaleConfig>
    },

    'es-LA': {
        single: {
            captionText: 'Arrastra archivo aquí o [[browseLink:subida segura]]',
            browseLink: 'subida segura'
        } satisfies Partial<KbqBaseFileUploadLocaleConfig>,

        multiple: {
            captionText: 'Arrastra reportes aquí o [[browseLink:subida segura]]',
            captionTextWhenSelected: 'Agrega evidencia o [[browseLink:subida segura]]',
            captionTextForCompactSize: 'Adjunta logs o [[browseLink:subida segura]]',
            browseLink: 'subida segura',
            title: 'Enviar archivos de seguridad'
        } satisfies Partial<KbqMultipleFileUploadLocaleConfig>
    },

    'pt-BR': {
        single: {
            captionText: 'Arraste arquivo aqui ou [[browseLink:upload seguro]]',
            browseLink: 'upload seguro'
        } satisfies Partial<KbqBaseFileUploadLocaleConfig>,

        multiple: {
            captionText: 'Arraste relatórios aqui ou [[browseLink:upload seguro]]',
            captionTextWhenSelected: 'Adicione evidências ou [[browseLink:upload seguro]]',
            captionTextForCompactSize: 'Anexe logs ou [[browseLink:upload seguro]]',
            browseLink: 'upload seguro',
            title: 'Enviar arquivos de segurança'
        } satisfies Partial<KbqMultipleFileUploadLocaleConfig>
    },

    'ru-RU': {
        single: {
            captionText: 'Перетащите файл сюда или [[browseLink:безопасная загрузка]]',
            browseLink: 'безопасная загрузка'
        } satisfies Partial<KbqBaseFileUploadLocaleConfig>,

        multiple: {
            captionText: 'Перетащите отчёты сюда или [[browseLink:безопасная загрузка]]',
            captionTextWhenSelected: 'Добавьте доказательства или [[browseLink:безопасная загрузка]]',
            captionTextForCompactSize: 'Прикрепите логи или [[browseLink:безопасная загрузка]]',
            browseLink: 'безопасная загрузка',
            title: 'Загрузка файлов безопасности'
        } satisfies Partial<KbqMultipleFileUploadLocaleConfig>
    },

    'tk-TM': {
        single: {
            captionText: 'Faýly şu ýere taşlaň ýa-da [[browseLink:howpsuz ýükleme]]',
            browseLink: 'howpsuz ýükleme'
        } satisfies Partial<KbqBaseFileUploadLocaleConfig>,

        multiple: {
            captionText: 'Hasabatlary şu ýere taşlaň ýa-da [[browseLink:howpsuz ýükleme]]',
            captionTextWhenSelected: 'Has köp subutnamalary goşuň ýa-da [[browseLink:howpsuz ýükleme]]',
            captionTextForCompactSize: 'Loglary goşuň ýa-da [[browseLink:howpsuz ýükleme]]',
            browseLink: 'howpsuz ýükleme',
            title: 'Howpsuzlyk faýllaryny iber'
        } satisfies Partial<KbqMultipleFileUploadLocaleConfig>
    }
};

/**
 * @title File-upload custom text via input example
 */
@Component({
    selector: 'file-upload-custom-text-via-input-example',
    imports: [
        KbqFileUploadModule,
        KbqIconModule
    ],
    template: `
        <kbq-file-upload multiple [localeConfig]="multipleLocaleConfig()">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>

        <kbq-file-upload [localeConfig]="singleLocaleConfig()">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-l'
    }
})
export class FileUploadCustomTextViaInputExample {
    private readonly exampleDefaultLocale = 'en-US';
    protected readonly localeId = toSignal(
        inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes.pipe(skip(1)) ?? of(this.exampleDefaultLocale),
        { initialValue: this.exampleDefaultLocale }
    );
    protected readonly multipleLocaleConfig = computed(() => {
        const selectedLocaleData = localeData[this.localeId()] ?? localeData[this.exampleDefaultLocale];

        return selectedLocaleData.multiple;
    });

    protected readonly singleLocaleConfig = computed(() => {
        const selectedLocaleData = localeData[this.localeId()] ?? localeData[this.exampleDefaultLocale];

        return selectedLocaleData.single;
    });
}
