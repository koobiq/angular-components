# Ревью кода — `packages/components/list`

> **Метод:** мультиагентное ревью по 9 направлениям (Angular-стандарты, архитектура,
> корректность, доступность, TypeScript, стили, тесты, API/доки, holistic). Каждая находка
> состязательно перепроверена против реального исходника.
> **Итог:** поднято 72 находки → **42 подтверждено**, 30 отклонено как ложные срабатывания.
> **Охват:** `KbqList`, `KbqListItem`, `KbqListSelection`, `KbqListOption`, `KbqListOptionCaption`,
> их шаблоны, SCSS/тема/токены, модуль, Jest-спеки, Playwright e2e и доки.

---

## Вердикт

Компонент функционально богатый и в целом рабочий: роуминг-`FocusKeyManager`, режимы
single / keyboard / checkbox, type-ahead, select-all, shift-range выбор и `ControlValueAccessor`.
Но есть **один критичный кластер (доступность)** и **несколько конкретных багов CVA**, плюс
широкая эрозия типов и долги незавершённой миграции на сигналы.

Для зрячего пользователя с мышью/клавиатурой это полноценный listbox; для пользователя
скринридера — невидимка.

| Severity | Кол-во | Область |
|---|---|---|
| High | 4 | a11y-роли / состояние выбора |
| Medium | 6 | баги CVA, SCSS-токены, vacuous-тест |
| Low / Info | 32 | типы, миграция, тесты, housekeeping |

Эталон корректных паттернов — соседний компонент `select`.

---

## Тема 1 — Доступность: selection-list невидим для assistive technology (P0)

`KbqListSelection` реализует полноценную модель взаимодействия listbox, но **не выдаёт никакой
ARIA-семантики**. Правки — небольшие добавления host-биндингов, но их нужно **вносить вместе**:
роуминг-фокус уже корректен, но ничего не озвучивает, пока на элементах нет ролей.

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| У контейнера нет `role="listbox"` / `aria-multiselectable` | High | `list-selection.component.ts:116-124` (host) | Добавить `role: 'listbox'`, `[attr.aria-multiselectable]: 'multiple'`; проброс `aria-label`/`aria-labelledby` |
| У опции нет `role="option"` / `aria-selected` | High | `list-selection.component.ts:690-703` (host) | Добавить `role: 'option'`, `[attr.aria-selected]: 'selected'` (true/false на **каждой** опции) |
| Состояние pseudo-checkbox не имеет доступного эквивалента | High | `list-option.html:1-5` | По документации pseudo-checkbox невидим для SR; пометить `aria-hidden`, состояние нести через `aria-selected` |
| Disabled через инертный `[attr.disabled]` на кастомных элементах вместо `aria-disabled` | Low–Med | `list-selection.component.ts:119, 698` | Заменить на `[attr.aria-disabled]='disabled \|\| null'`; класс `.kbq-disabled` для стилей оставить |
| Роуминг DOM-фокуса корректен, но бесполезен без ролей | Info | `list-selection.component.ts:303-313, 911-925` | Отдельной правки нет; зависит от фиксов ролей выше |

Нарушение WCAG 1.3.1 / 4.1.2 и почти наверняка падение AXE, чего прямо требует AGENTS.md.
Существующий тест, утверждающий `role === null` (`list.component.spec.ts:57`), нужно обновить.

---

## Тема 2 — Баги корректности ControlValueAccessor (P0)

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| `setDisabledState` не выключает сам список | Medium | `list-selection.component.ts:428-432` | `this.disabled = isDisabled; this.changeDetectorRef.markForCheck();` — убрать мутацию по опциям; геттер `option.disabled` каскадирует. Как в `select.component.ts` |
| `getOptionByValue` игнорирует `compareWith`, использует `===` | Medium | `list-selection.component.ts:606-608` | `this.options.find((o) => this.compareWith()(o.value, value))`; согласовать с `KbqListOption.ngOnInit` (816) |
| `selectActiveOptions` может разыменовать `options[-1]` | Medium | `list-selection.component.ts:382-406` | `previousActiveItemIndex` стартует с `-1`; при shift+click без предшествующей навигации `options[fromIndex].selected` бросает `TypeError`. Проверять диапазон до чтения; охранник `toIndex === fromIndex` стоит *после* разыменования |

**Влияние:** disabled-контрол формы остаётся в табе и обрабатывает клавиатуру; предвыбор
объектных значений из reactive form / ngModel молча не выбирает ничего; shift+click без
предшествующей навигации с клавиатуры бросает `TypeError`.

---

## Тема 3 — Эрозия типизации value и контракта формы (P1)

Тип значения модели неизвестен потребителю; `any`-creep маскирует баг `compareWith` на уровне типов.

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| `option.value` типизирован `any` насквозь | Low | `list-selection.component.ts:744-755` | Параметризовать `KbqListOption<T = unknown>` с `value: T` |
| Непоследовательная типизация value (`string[]` vs `any` vs не-массив) | Low | `:231, 409-415, 418, 635` | Зафиксировать дженерик `T[]` или один конкретный тип насквозь |
| `_value: string[] \| null`, но плумбинг обрабатывает объекты | Low | `:231, 611` | Типизировать как `unknown[] \| null` / `T[]` под реальные объектные значения |
| Провайдер value-accessor + `compareWith` слабо типизированы | Low | `:71, 210` | Провайдер как `Provider`; `compareWith` против `T` |
| `tabIndex` геттер/сеттер типизирован `any` | Low | `:179-186` | `get tabIndex(): number` / `set tabIndex(value: number)` |
| Сеттер `showCheckbox` — `any`; у `_showCheckbox` нет `\| undefined` | Low | `:784-788` | `private _showCheckbox: boolean \| undefined`; параметр сеттера `BooleanInput`/`unknown` |
| `KBQ_SELECTION_LIST_VALUE_ACCESSOR` типизирован `any` | Info | `:71` | Аннотировать как `Provider` из `@angular/core` |

---

## Тема 4 — Незавершённая миграция на сигналы / стандарты (P2)

Класс смешивает две идиомы для одних и тех же концепций; вычистить одним sweep'ом + `approve-api`.

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| 8 `@Input`-аксессоров с устаревшими TODO «Skipped for migration» | Info | `:142-203, 742-803` | Мигрировать простые boolean-coercion инпуты (`autoSelect`, `noUnselectLast`, `disabled`, `showCheckbox`) на `input({transform: booleanAttribute})`; заменить шаблонные TODO реальными комментариями там, где поведение производное от модели |
| `onCopy` — единственный legacy `@Output()`/`EventEmitter` | Low | `:140` | Перевести на `output()`; ветку `.observed` (652) заменить явным input-флагом или дефолтным переопределяемым хендлером |
| Анти-паттерн `on*`-префиксов публичных аутпутов (`onCopy`, `onSelectAll`) | Low | `:138, 140` | Переименовать в event-style (`copy`, `selectAll`) по образцу `selectionChange`; депрекейтить старые, если ломающее |
| Лишний `@ViewChild('kbqTitleText')` дублирует сигнальный `viewChild` | Info | `:730-731` | Свести к одному сигнальному запросу после `check-api`; типизировать дженерики `ElementRef`/`QueryList`. (Декораторные запросы триггеров 726-727 обязаны остаться декораторами по #DS-5079) |
| Template-only публичные члены должны быть `protected` | Info | `:711, 809`; `list.component.ts:45-51` | Ужать `handleFocus`/`handleBlur`/`handleClick`/`onKeydown`/`externalPseudoCheckbox`; члены, читаемые между компонентами, оставить public |
| Ручной учёт `Subscription` для focus/blur вместо `takeUntilDestroyed` | Low | `:235-237, 571-598` | Заменить на `options.changes.pipe(startWith(...), switchMap(...), takeUntilDestroyed())` |

---

## Тема 5 — Дыры в SCSS-теме и мёртвая поверхность стилей (P1 / P2)

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| Миксин темы ссылается на **23 неопределённых** поцветовых токена | Medium | `_list-theme.scss:3-23` (исп. 27-72) | `_kbq-list-item($state)` выводит 5 цветовых деклараций на состояние, но `list-tokens.scss` определяет цвета не для всех. Без fallback `var()` они дают `inherit` → **неверные цвета текста/иконок/caption** в active / selected-active / multiple-selected. Доопределить токены или `var(--token, <default>)` |
| Цвет caption для `states-hover` не определён | Low | `_list-theme.scss:21` | Caption теряет приглушённый стиль на hover/selected; определить caption-токены на каждое тематизируемое состояние |
| Все 12 токенов `--kbq-list-size-*` мёртвые | Low | `list-tokens.scss:34-45` | Определены, нигде не используются (базовый padding хардкодит `var(--kbq-size-*)`); подключить как реальные точки переопределения или удалить (у header/subheading-токенов вообще нет элемента) |
| У режима `horizontal` нет layout-CSS | Low | `list-selection.component.ts:174`; `list.scss` | Инпут переназначает Left/Right, но опции всё равно стопкой → клавиатура/визуал расходятся (focus-order WCAG). Добавить flex-row или убрать инпут до появления стилей |
| `.kbq-list-item` получает логику selected border-radius, но без selected-темы | Info | `list.scss:27-31`; `_list-theme.scss:26-79` | Ограничить `_kbq-list-item-border-radius()` + hover экшен-контейнера только `.kbq-list-option` (`KbqListItem` не выбираемый) |

---

## Тема 6 — Дыры в покрытии тестами и устаревшие проверки (P1 / P3)

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| Бессмысленные негативные проверки ссылаются на класс, который не ставится | Medium | `list.component.spec.ts:20, 28` | Проверяется `kbq-list-item-focus`; компонент ставит `kbq-focused` → обе негативные всегда истинны, `handleBlur()` не тестируется. Заменить на `kbq-focused` |
| `should add aria roles properly` лишь проверяет `role === null` | Low | `list.component.spec.ts:49-60` | Покрытия listbox/option a11y нет нигде; переименовать, добавить проверки `role`/`aria-selected`/`aria-disabled`/`aria-multiselectable` + axe |
| Режим horizontal не покрыт совсем | Low | `list-selection.component.spec.ts` | Добавить describe с `[horizontal]="true"`: навигация LEFT/RIGHT, short-circuit `updateScrollSize` |
| Клавиатурные пути для disabled-опции не покрыты | Low | `list-selection.component.spec.ts:204-216, 636-663` | Покрыт только клик; добавить SPACE/ENTER на disabled активной опции / disabled-списке |
| Ветки SSR-гарда `getHeight()` не покрыты | Low | `:460-467, 874-881` | Застабить `getClientRects` → `undefined`/`[]`, проверить `0` и отсутствие throw в `updateScrollSize` |
| Оставшийся `standalone: true` на тест-обёртке | Low | `list-selection.component.spec.ts:1338` | Убрать — нарушает правило репо, непоследовательно с остальным файлом |
| Магические keyCode `83`/`68` в typeahead-тестах | Low | `:389, 397` | Использовать именованные константы (`S`, `D`) из `@koobiq/components/core` |
| Два почти идентичных SHIFT+arrow теста дублируют сетап | Info | `:288-314, 328-354` | Рассмотреть `it.each` по направлению; убедиться, что checkbox-mode shift-тест проверяет эмиссию модели и не дублирует |

---

## Тема 7 — Производительность и прочий housekeeping (P2 / P3)

| Находка | Severity | Расположение | Фикс |
|---|---|---|---|
| `(window:resize)` форсит синхронный layout без throttle | Low | `list-selection.component.ts:123, 336-342` | Два форсированных reflow-рида + CD на каждый тик ресайза. `ResizeObserver` или `fromEvent(window,'resize').pipe(auditTime(...))` вне зоны; входить в зону только при изменении |
| Устаревший русский TODO в начале файла мислейблит `KbqList`/`KbqListItem` | Info | `list.component.ts:1` | Говорит «пока не делаем», хотя компоненты шипятся и используются в `file-upload`. Удалить или заменить английской заметкой |
| Пустая marker-директива `KbqListOptionCaption` без документации | Info | `list-selection.component.ts:664-670` | Добавить однострочный JSDoc, что это styling-хук |

---

## Приоритизированный roadmap

### P0 — обязательно (корректность + a11y)
1. **Сделать selection-list доступным listbox** — добавить `role="listbox"`/`aria-multiselectable`,
   `role="option"`/`aria-selected`, пометить pseudo-checkbox декоративным, заменить `[attr.disabled]` →
   `[attr.aria-disabled]`, обновить тест ролей. Одним PR (фокус на элементе без роли ничего не озвучивает).
2. **Починить три бага CVA** — `setDisabledState`, `getOptionByValue` через `compareWith`,
   охрана индекса в `selectActiveOptions`. Малые, локальные, эталон — `select`.

### P1 — важно
3. **Регрессионное a11y-покрытие** — закрепить P0-роли тестами Jest + axe.
4. **Типизированный контракт value** — дженерик `T`, протянуть через CVA, убрать `any`.
5. **Покрытие SCSS-токенов по состояниям** — починить 23 неопределённых токена, дающих неверные цвета.

### P2 — консистентность / перф
6. **Sweep миграции на сигналы/стандарты** — аксессор-инпуты, `onCopy`→`output()`, переименование
   аутпутов, лишний `@ViewChild`, видимость членов, рефактор подписок фокуса (+ `check-api`/`approve-api`).
7. **Horizontal mode + resize** — добавить flex-row layout (или убрать инпут) и затроттлить ресайз.

### P3 — упрочнение
8. **Добить тесты** — клавиатура для disabled, SSR-гарды `getHeight`, дедуп shift-тестов.

---

## Quick wins (тривиально, высокая отдача)

1. Починить vacuous focus/blur тест (`kbq-list-item-focus` → `kbq-focused`) — восстанавливает реальное покрытие.
2. `setDisabledState`: `this.disabled = isDisabled; markForCheck()` — одна строка, чинит реальный баг.
3. Провести `getOptionByValue` через `compareWith()` — чинит «молчаливый» предвыбор объектных значений.
4. Типизировать `onKeydown($event: KeyboardEvent)` и добавить `: void` к `blur/selectAll/deselectAll/reportValueChange/emitChangeEvent/removeOptionFromList/handleFocus/handleBlur`.
5. Типизировать `KBQ_SELECTION_LIST_VALUE_ACCESSOR` как `Provider`, `tabIndex` как `number`.
6. Заменить `.filter(Boolean)` на предикат type-guard, убрав non-null `option!`.
7. Убрать `standalone: true` из `TestListSelectionWithDynamicList`.
8. Заменить магические keyCode `83`/`68` именованными константами (`S`, `D`).
9. Удалить/перевести устаревший русский TODO в `list.component.ts:1`.
10. Добавить однострочный JSDoc к `KbqListOptionCaption`.
11. Переключить `[attr.disabled]` → `[attr.aria-disabled]` (в комплекте с P0).

---

## Приложение — заметные отклонённые ложные срабатывания (всего 30)

Этап верификации отбросил находки, фактически верные, но **не являющиеся реальными дефектами**
для этого компонента. Самые показательные:

- **«`KbqListSelection` — god-object»** — это точный порт `MatSelectionList` из Material;
  обратная ссылка option↔list присуща контракту `FocusKeyManager`. Дробление лишь умножит
  индирекцию, не убрав сеть ссылок.
- **«`event.keyCode` устарел»** — намеренная конвенция всего репо (37 файлов), зеркалит
  `@angular/cdk/keycodes`; все обрабатываемые клавиши — layout-независимые управляющие.
- **«`KbqLineSetter` течёт подпиской»** — подписанный `QueryList.changes` завершается при destroy
  компонента, снося подписчика; дословный паттерн Material, безопасен по утечкам.
- **Ряд `any`-пунктов** (`onChange`, `compareWith`, сигнатура `writeValue`) — каноническая граница
  Angular CVA — `any` by design; сужение в одном компоненте создаёт несогласованность.
- **«`Promise.resolve().then` / `setTimeout` выполняются после destroy»** — `setSelected`
  делает no-op, когда модели нет, а `markForCheck()` на уничтоженной view — задокументированный no-op.
- **«Нет обработки `forced-colors` / high-contrast»** — верно, но это library-wide (нет ни в одном
  компоненте); не дефект list'а, и `transparent`-границы сохраняются в forced-colors.
- **«`@ViewChild('kbqTitleText') textElement` — лишний дубль»** — это внешне инжектируемое свойство
  интерфейса `KbqTitleTextRef`, потребляемое `title.directive.ts`; сведение к сигналу сломает контракт
  (тот же класс, что #DS-5079).
