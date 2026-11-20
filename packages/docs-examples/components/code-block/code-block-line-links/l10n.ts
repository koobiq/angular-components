import type { Translations } from '@koobiq/docs-examples/i18n';

interface ExampleTranslation {
    lineNumbers: string;
    filled: string;
    tabs: string;
    keyboardHint: string;
    hint: string;
    descriptionTitle: string;
    baseline: string;
    taskChangesTitle: string;
    changes: { title: string; description: string }[];
    otherChangesTitle: string;
    otherChanges: { title: string; description: string }[];
    linkExamples: string;
    singleLineLink: string;
    rangeLink: string;
    useCasesTitle: string;
    useCases: string;
    comparisonTitle: string;
    comparisonIntro: string;
    comparisonSource: string;
    comparisonCaption: string;
    comparisonColumns: { feature: string; current: string };
    comparison: { feature: string; current: string; pullRequest: string }[];
    scopeTitle: string;
    scope: string;
    identityRequirement: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        lineNumbers: 'Номера строк',
        filled: 'Серый фон',
        tabs: 'Табы',
        keyboardHint: 'Tab переводит фокус с вкладок на кнопки шапки, затем в область кода. Стрелки прокручивают код. Enter включает навигацию по строкам: ↑ и ↓ перемещают фокус, Shift расширяет выбор, Enter копирует ссылку. Esc возвращает к прокрутке.',
        hint: 'Нажмите на строку, чтобы выбрать ее. Удерживайте Shift, чтобы выбрать диапазон. Парящая кнопка копирует ссылку на строку или выбранный диапазон.',
        descriptionTitle: 'Доработки исходного блока кода',
        baseline: 'В исходной версии этой ветки (09197e13e) уже были вкладки файлов, подсветка синтаксиса, номера строк, перенос длинных строк, сворачивание, скачивание и копирование документа целиком. В этом прототипе добавлены работа с отдельными фрагментами кода и ссылки на них.',
        taskChangesTitle: 'В рамках задачи: выделение и копирование ссылок',
        changes: [
            {
                title: 'Авторская подсветка.',
                description: 'Автор задает диапазоны строк через highlightedLines и фрагменты текста через highlightedRanges. Фрагмент может занимать часть строки или несколько строк; подсветка синтаксиса сохраняется.'
            },
            {
                title: 'Выбор читателя.',
                description: 'Нажатие в строке выбирает ее, Shift с нажатием выбирает диапазон. Новый выбор заменяет предыдущий и сохраняется отдельно от авторской подсветки. Номера строк для выбора не требуются.'
            },
            {
                title: 'Ссылки на код.',
                description: 'Кнопка слева копирует ссылку на строку или выбранный диапазон. Копирование вне диапазона переносит выбор на новую строку. При открытии ссылки компонент выбирает нужный документ, восстанавливает выбор и прокручивает к нему.'
            },
            {
                title: 'Подтверждение копирования.',
                description: 'После успешного копирования link_16 сменяется на check_16 за 250 мс, а подсказка показывает «Скопировано». Через две секунды или при уходе со строки возвращается ссылка. Кнопка в шапке по-прежнему копирует весь текущий документ.'
            },
            {
                title: 'Подсказки без повторного открытия.',
                description: 'Кнопки строк образуют одну группу. Открытая подсказка перемещается между ними без повторной анимации. Сначала она располагается снаружи слева, затем сверху или снизу по левому краю иконки, если места не хватает.'
            },
            {
                title: 'Клавиатура и прокрутка.',
                description: 'Tab последовательно переводит фокус с вкладок на кнопки шапки и в область кода. Стрелки прокручивают код; Enter включает навигацию по строкам, Esc возвращает к прокрутке. В режиме строк доступны выбор диапазона и копирование ссылки. Клавиатурный отклик мгновенный.'
            },
            {
                title: 'Сохранение ориентира подсветки.',
                description: 'Синяя полоса авторской подсветки остается у левого края блока при горизонтальной прокрутке.'
            }
        ],
        otherChangesTitle: 'Остальные доработки блока и примера',
        otherChanges: [
            {
                title: 'Высота и сворачивание.',
                description: 'Добавлен viewportMaxHeight для ограничения прокручиваемой области; в примере это 320 пикселей. Отдельно добавлен collapsedLineCount для сворачивания по числу строк: такой блок переносит длинные строки и обходится без внутренних полос прокрутки.'
            },
            {
                title: 'Колонка номеров при прокрутке.',
                description: 'Номера строк закреплены и закрывают проходящий под ними текст; рядом используется плавная маска. Без номеров нет постоянной левой колонки и маски.'
            },
            {
                title: 'Компоновка демонстрации.',
                description: 'В пример добавлены три документа с переключением вкладок. На странице разработки пример выровнен по центру и ограничен шириной 608 пикселей, чтобы показывать смену положения подсказки при сужении окна. В настройках примера оставлены вкладки, серый фон и номера строк.'
            }
        ],
        linkExamples: 'Примеры адресов в этом документе:',
        singleLineLink: 'строка 7',
        rangeLink: 'строки 6–11',
        useCasesTitle: 'Сценарии использования',
        useCases: 'Блок подходит для документации API, разбора ошибок, обсуждения изменений и отчетов об уязвимостях. Автор заранее отмечает место, на которое нужно обратить внимание, а читатель делится ссылкой на строки, которые обсуждает. В примере показаны три документа; адрес однозначно определяет документ и диапазон строк.',
        comparisonTitle: 'Отличия от PR #2418',
        comparisonIntro: 'Оба решения добавляют авторские отметки и выбор строк. Текущий прототип развивает взаимодействие читателя с кодом и копирование ссылок внутри компонента. В PR #2418 также реализованы поиск отметок по тексту и интеграция исходников примеров с документацией сайта.',
        comparisonSource: 'Сравнение по исходному коду:',
        comparisonCaption: 'Срез PR #2418 на коммите 5eba581',
        comparisonColumns: { feature: 'Возможность', current: 'Этот прототип' },
        comparison: [
            {
                feature: 'Выбор строк',
                current: 'Нажатие в строке, в том числе без номеров. Повторное нажатие сохраняет выбор строки',
                pullRequest: 'Нажатие в колонке номеров при включенных lineNumbers и canSelectLines. Повторное нажатие на единственную выбранную строку снимает выбор'
            },
            {
                feature: 'Авторские отметки и выбор',
                current: 'highlightedLines и highlightedRanges задает автор; выбор читателя хранится отдельно внутри компонента',
                pullRequest: 'Выбор заменяет markedLines активного файла и передается через filesChange. markedText при этом сохраняется'
            },
            {
                feature: 'Задание подсветки',
                current: 'Диапазоны строк и координаты начала и конца фрагментов: строка и смещение в ней',
                pullRequest: 'markedLines принимает номера, диапазоны, строки и RegExp. markedText ищет строки и RegExp, включая захваченные группы'
            },
            {
                feature: 'Адрес и копирование ссылки',
                current: 'Сам компонент копирует #request-example-L6-L11 и восстанавливает выбор. Нажатие на строку само по себе адрес не меняет',
                pullRequest: 'Оболочка примеров сайта записывает выбор в ?example=…&file=ts&lines=6-11. Отдельной кнопки копирования ссылки на строку в компоненте нет'
            },
            {
                feature: 'Клавиатурный выбор строк',
                current: 'Отдельный режим с входом через Enter, перемещением фокуса, выбором диапазона и копированием ссылки',
                pullRequest: 'Выбор реализован обработчиками мыши в колонке номеров; отдельного режима навигации по строкам нет'
            },
            {
                feature: 'Интеграция с документацией',
                current: 'Демонстрационный пример и ссылки по id файла. Разметка Example marks и маршрутизация по параметрам example/file/lines не добавлены',
                pullRequest: 'Example marks отмечает код, о котором раздел. Сборка проверяет наличие фрагментов; ссылка раскрывает исходники нужного примера и прокручивает к строкам'
            }
        ],
        scopeTitle: 'Границы реализации',
        scope: 'Выбор строк, создание и восстановление ссылок, работа с клавиатурой и подтверждение копирования реализованы в компоненте. Синяя авторская подсветка, серый выбор, иконка без фона в левом поле и закрепленная синяя полоса оформлены стилями этого примера. Это локальный прототип отдельного варианта отображения.',
        identityRequirement: 'Для интерактивных строк файлу нужен стабильный id, уникальный среди файлов всех блоков на странице. Ссылки адресуют строки по их номерам; изменение исходного текста может изменить место, на которое ведет прежний адрес.'
    },
    default: {
        lineNumbers: 'Line numbers',
        filled: 'Gray background',
        tabs: 'Tabs',
        keyboardHint: 'Tab moves from tabs to header buttons, then to the code viewport. Arrow keys scroll the code. Enter enables line navigation: ↑ and ↓ move focus, Shift extends the selection, and Enter copies a link. Escape returns to scrolling.',
        hint: 'Click a line to select it. Hold Shift to select a range. The floating button copies a link to a line or the selected range.',
        descriptionTitle: 'Changes to the original code block',
        baseline: 'The starting revision of this branch (09197e13e) already supported file tabs, syntax highlighting, line numbers, word wrap, collapsing, downloading and copying an entire document. This prototype adds interaction with individual code fragments and links to them.',
        taskChangesTitle: 'Task scope: highlighting and copying links',
        changes: [
            {
                title: 'Author highlights.',
                description: 'The author supplies line ranges through highlightedLines and text ranges through highlightedRanges. A text range can cover part of a line or span multiple lines while preserving syntax highlighting.'
            },
            {
                title: 'Reader selection.',
                description: 'Clicking a line selects it; Shift-click selects a range. A new selection replaces the previous one and is stored separately from author highlights. Line numbers are not required.'
            },
            {
                title: 'Code links.',
                description: 'The button on the left copies a link to a line or the selected range. Copying outside the range moves the selection to that line. Opening a link selects the document, restores the selection and scrolls to it.'
            },
            {
                title: 'Copy confirmation.',
                description: 'After a successful copy, link_16 changes to check_16 over 250 ms and the tooltip reads “Copied”. The link returns after two seconds or when the pointer leaves the line. The header button still copies the entire current document.'
            },
            {
                title: 'Grouped tooltips.',
                description: 'Line buttons form one group. An open tooltip moves between them without repeating its entrance animation. It prefers the outside left position, then the top or bottom aligned with the icon’s left edge when space is limited.'
            },
            {
                title: 'Keyboard interaction and scrolling.',
                description: 'Tab moves from file tabs to header buttons and then to the code viewport. Arrow keys scroll; Enter enables line navigation and Escape returns to scrolling. Line navigation supports range selection and copying links. Keyboard feedback is immediate.'
            },
            {
                title: 'Keeping highlights in view.',
                description: 'The blue author highlight marker stays at the left edge of the block during horizontal scrolling.'
            }
        ],
        otherChangesTitle: 'Other component and example changes',
        otherChanges: [
            {
                title: 'Height and collapsing.',
                description: 'viewportMaxHeight limits a scrollable viewport; this example uses 320 pixels. collapsedLineCount separately supports collapsing by line count: these blocks wrap long lines and have no internal scrollbars.'
            },
            {
                title: 'Line numbers during scrolling.',
                description: 'Pinned line numbers cover the text passing underneath them, with a fade mask at the edge. Without numbers there is no permanent left column or mask.'
            },
            {
                title: 'Demo layout.',
                description: 'The example contains three documents with file tabs. On the development page it is centered and limited to 608 pixels so resizing the window demonstrates tooltip placement changes. Its remaining controls toggle tabs, a gray background and line numbers.'
            }
        ],
        linkExamples: 'Example links in this document:',
        singleLineLink: 'line 7',
        rangeLink: 'lines 6–11',
        useCasesTitle: 'Use cases',
        useCases: 'The block supports API documentation, debugging discussions, change reviews and vulnerability reports. Authors highlight relevant code in advance, while readers share links to the lines they discuss. This example contains three documents; a link identifies both the document and its line range.',
        comparisonTitle: 'Differences from PR #2418',
        comparisonIntro: 'Both implementations add author highlights and line selection. This prototype develops reader interaction and copying links within the component. PR #2418 also implements text-based highlight matching and integration of example sources with the documentation site.',
        comparisonSource: 'Source comparison:',
        comparisonCaption: 'PR #2418 at commit 5eba581',
        comparisonColumns: { feature: 'Capability', current: 'This prototype' },
        comparison: [
            {
                feature: 'Line selection',
                current: 'Click anywhere in a line, including with numbers hidden. Clicking the selected line keeps it selected',
                pullRequest: 'Click the number column with lineNumbers and canSelectLines enabled. Clicking the only selected line again clears it'
            },
            {
                feature: 'Author highlights and selection',
                current: 'Authors provide highlightedLines and highlightedRanges; reader selection is separate component state',
                pullRequest: 'Selection replaces markedLines in the active file and is emitted through filesChange. markedText is preserved'
            },
            {
                feature: 'Specifying highlights',
                current: 'Line ranges and explicit start/end coordinates: a line number and an offset within the line',
                pullRequest: 'markedLines accepts numbers, ranges, strings and RegExp. markedText matches strings and RegExp, including capture groups'
            },
            {
                feature: 'URLs and copying links',
                current: 'The component copies #request-example-L6-L11 and restores selection. Selecting a line alone does not change the URL',
                pullRequest: 'The docs example viewer writes selection to ?example=…&file=ts&lines=6-11. The component has no separate line-link copy button'
            },
            {
                feature: 'Keyboard line selection',
                current: 'A dedicated mode entered with Enter supports focus movement, range selection and copying links',
                pullRequest: 'Selection uses mouse handlers on the number column; there is no dedicated line-navigation mode'
            },
            {
                feature: 'Documentation integration',
                current: 'A live example and links using file ids. Example marks and routing with example/file/lines query parameters are not implemented',
                pullRequest: 'Example marks highlights code relevant to a section. The build checks that fragments exist; links reveal example sources and scroll to the specified lines'
            }
        ],
        scopeTitle: 'Implementation scope',
        scope: 'Line selection, creating and restoring links, keyboard interaction and copy confirmation live in the component. Blue author highlights, gray selection, a bare icon in the left gutter and the pinned blue marker are styles of this example. This is a local prototype of a specific presentation.',
        identityRequirement: 'Interactive lines require a stable file id that is unique across every file in every code block on the page. Links address line numbers; editing the source can change what an existing URL points to.'
    }
};
