# Монорепозиторий koobiq — полное ревью

_Русское зеркало [REVIEW.md](./REVIEW.md). Набор идентификаторов находок идентичен._

| | |
|---|---|
| Репозиторий | `koobiq/angular-components` |
| Ревьюируемое дерево | ветка `fix/DS-3055` @ `4200e84eb` (2 впереди / 10 позади `origin/main` @ `c33811a5e`) |
| Дата | 2026-08-30 |
| Объём | всё: `packages/**`, `apps/**`, `tools/**`, `.github/**`, `docs/**`, корневые конфиги |
| Метод | 16 параллельных ревьюеров по доменам, затем поштучная проверка находок ведущим по исходникам |
| Результат | только отчёт — ни один файл исходников не изменён |

---

## Главное

Библиотека в лучшем состоянии, чем можно ожидать при таком объёме. Все четыре автоматических гейта на
этом дереве зелёные — `eslint`, `stylelint`, `prettier`, `cspell`, — SSR-дисциплина держится почти везде,
`takeUntilDestroyed` это норма, а недавно переработанные компоненты (`accordion`, `list`, `dl`, `resizer`,
`scrollbar`, `navbar`, `app-switcher`, `breadcrumbs`, `form-field`) написаны действительно аккуратно.
**Ни одну находку ниже ни один инструмент репозитория поймать не может.**

Почти весь риск несут четыре темы.

**1. Доступность разделилась на две библиотеки.** Компоненты, которых касались в последний год, публикуют
корректные роли и локализованные имена. Старые ядровые виджеты не публикуют *ничего*: у `kbq-select`,
`kbq-tab-group`, `kbq-tree-selection`, календаря датапикера и `kbq-modal` нет ни ролей, ни атрибутов
состояния, а в двух случаях и клавиатурного пути. AGENTS.md требует, чтобы библиотека «MUST pass all AXE
checks» и «MUST follow all WCAG AA minimums»; пять виджетов сейчас не могут. Из 124 спек компонентов
только 5 делают хотя бы одну проверку `jest-axe`, и покрытый набор в точности совпадает с тем, что
оказался чистым.

**2. Часть страховок не работает.** Они есть, на них ссылаются комментарии и документация, и они ничего не
делают: у `jest-fail-on-console` инвертирован предикат, поэтому ни одна ошибка Angular не может уронить
юнит-тест; регулярка changelog отбрасывает каждый коммит с `!`, и 11 таких коммитов стоят в очереди на
релиз без записи в changelog; валидатор релизных бандлов ищет раскладку каталогов, которую `ng-packagr`
перестал выпускать два мажора назад; защита от публикации предрелиза под тегом `latest` возвращает один и
тот же массив в обеих ветках; `check-api` никогда не видит `scrollbar/deprecated`.

**3. Незаконченные миграции оставили дрейф.** 340 маркеров `// TODO: Skipped for migration because:`
показывают, где остановилась миграция на сигналы. Последствия конкретны: `KbqButtonToggleGroup` замораживает
множественность своей `SelectionModel`, пока всё производное от `multiple()` остаётся реактивным;
`kbq-select` и `kbq-tree-select` запрещают менять `multiple` в рантайме, но пропускают то же самое через
`multiline`; `writeValue` эмитит уведомления об изменении в трёх компонентах. Тот же дрейф — между почти
одинаковыми путями: адаптеры дат moment и luxon расходятся в `startOf`, а копия маскирующего движка
датапикера в таймпикере потеряла защиту `readOnly`.

**4. Английская документация отстаёт от русской.** Шесть ссылок в EN-документах ведут на 404, тогда как
их RU-аналоги на тех же номерах строк несут префикс локали; два задокументированных примера не существуют;
страница `button` описывает два значения цвета, не проходящих типизацию, и ссылается на один пример там,
где RU ссылается на восемь; обе страницы `progress-*` документируют неверное значение по умолчанию и цвета,
которым не соответствует ни одно CSS-правило. Ответ почти на каждый случай уже лежит в парном файле.

Единственная находка с формой безопасности — **CI-01**: `/approve-snapshots` делает checkout по
изменяемому имени ветки без `repository:` в джобе с `contents: write`, поэтому выполняемый код не обязан
совпадать с прочитанным ревьюером.

Сама ветка `fix/DS-3055` близка к готовности — `git merge-tree` чист против `origin/main`, и ничего в main
не трогает датапикер, — но см. **BR-01**: коммит назван исправлением дефекта, который в библиотеке остался.

---

## Оценки по доменам

| # | Домен | Находок | P0 | P1 | P2 | P3 | Вердикт |
|---|---|---|---|---|---|---|---|
| 1 | Конфиги сборки, тестов и линтеров | 17 | 0 | 1 | 3 | 13 | одна мёртвая страховка, в остальном здраво |
| 2 | CI/CD, релиз, цепочка поставки | 14 | 1 | 2 | 7 | 4 | сильная гигиена, один эксплуатируемый checkout |
| 3 | Документация и контент-пайплайн | 19 | 2 | 4 | 7 | 6 | RU почти везде впереди EN |
| 4 | Публичный API и релизная оснастка | 20 | 0 | 7 | 8 | 5 | guard честен, релизный путь — нет |
| 5 | `core`: локали, форматтеры, даты, формы | 19 | 0 | 5 | 8 | 6 | дрейф адаптеров — главный риск |
| 6 | `core`: overlay, pop-up, a11y, selection | 16 | 0 | 2 | 6 | 8 | общие механизмы множат свои дефекты |
| 7 | `filter-bar` | 16 | 0 | 1 | 8 | 7 | большой, хорошо покрыт, залипающие subject'ы |
| 8 | Дата и время | 21 | 0 | 5 | 11 | 5 | самый слабый разбор ввода в библиотеке |
| 9 | Кластер выбора | 17 | 0 | 2 | 12 | 3 | дрейф между шестью почти одинаковыми виджетами |
| 10 | Кластер оверлеев | 20 | 0 | 3 | 15 | 2 | жизненный цикл и возврат фокуса |
| 11 | Кластер форм-контролов | 22 | 0 | 6 | 12 | 4 | нарушения контракта CVA |
| 12 | Остальные ~35 компонентов | 20 | 0 | 1 | 9 | 10 | в основном чисто; одна XSS-точка |
| 13 | SCSS, токены, темизация | 12 | 0 | 0 | 2 | 10 | самый здоровый домен |
| 14 | Доступность | 23 | 5 | 15 | 2 | 1 | **худший домен с большим отрывом** |
| 15 | Качество тестов | 19 | 3 | 10 | 4 | 2 | зелёные тесты, которые не могут упасть |
| 16 | Ветка и ветки `review/*` | 12 | 0 | 3 | 6 | 3 | ребейз, потом переименовать коммит |
| 17 | Собственный проход ведущего | 8 | 0 | 1 | 3 | 4 | дрейф конфигурации |
| | **Итого** | **295** | **11** | **68** | **123** | **93** | |

Важность: **P0** блокер релиза — видимая пользователю поломка, безопасность или тест, узаконивающий дефект ·
**P1** настоящий баг или серьёзный риск · **P2** чинить: корректность и сопровождаемость · **P3** гигиена.

Каждая находка P0 и P1 перечитана ведущим в исходнике перед включением; неподтверждённое удалялось, а не
понижалось. Пометка *needs-verification* означает доказанный механизм, но пользовательский триггер которого
требует прогона.

---

## P0 — блокеры релиза

### P0-1 · CI-01 · `/approve-snapshots` выполняет код, который ревьюер не читал, и может запушить в `main`
`.github/workflows/e2e-approve-snapshots.yml:26-30`

Два дефекта в джобе с `contents: write` (строка 23), которая затем выполняет код из PR
(`npm run e2e:docker:update-snapshots` → `tools/e2e/run.js`, всё из выкачанного ref).

1. `head_ref` — **имя ветки**, а не коммит. Автор может дописать коммит между комментарием ревьюера и
   checkout'ом; экшен отдаёт `head_sha`, и он не используется. Собственная шапка файла признаёт, что гейт
   «проверяет только комментатора, а не безопасность выполняемого кода».
2. Нет `repository:`, поэтому `ref` резолвится относительно **базового** репозитория. Форк-PR с веткой
   `main` приведёт к checkout'у базового `main`, перегенерации базлайнов против него и пушу результата
   `stefanzweifel/git-auto-commit-action` (строка 51, `file_pattern: '**/*.png'`, без `branch:`) прямо в
   дефолтную ветку — по комментарию к PR.

`persist-credentials` при этом по умолчанию `true`, так что токен с правом записи лежит в `.git/config`,
пока этот PR-контролируемый скрипт выполняется на раннере (CI-09). То же отсутствие `repository:` есть в
`.github/workflows/redeploy-preview.yml:26,31-33`, где полезной нагрузкой служит ключ сервис-аккаунта Firebase.

**Правка:** резолвить head явно (`gh pr view --json headRefOid,headRepository`), делать checkout
`repository: <owner>/<name>` на `ref: <headRefOid>`, ставить `persist-credentials: false` и отказывать
форк-PR — `GITHUB_TOKEN` в форк всё равно не запушит.

### P0-2 · A11Y-SELECT-001 · `kbq-select` не публикует семантику combobox, listbox и option
`packages/components/select/select.component.ts:236-238`, `packages/components/core/option/option.ts:149-161`

Хост фокусируем и биндит только `aria-invalid`/`aria-required` — нет ни роли, ни `aria-expanded`,
`aria-haspopup`, `aria-controls`, `aria-activedescendant`. У панели в `select.html` нет `role="listbox"`.
У хоста `KbqOption` нет `role="option"`, `aria-selected`, `aria-disabled`; выбор передаётся одним лишь
классом `kbq-selected`. `getTabIndex()` (`option.ts:391`) возвращает `'0'` для **каждой** включённой опции,
поэтому Tab обходит весь список — это ни roving tabindex, ни activedescendant.

Проверено: единственные `role="listbox"` в библиотеке — `autocomplete.html:3` и
`list-selection.component.ts:189`; единственная роль в `core/option` — `optgroup.ts:17` (`role="group"`),
что без владеющего listbox является невалидным ARIA. Панель `autocomplete` поэтому объявляет `listbox` над
детьми без роли `option` — axe `aria-required-children`.

**Последствие:** пользователь скринридера слышит безымянный кликабельный элемент, никогда не узнаёт о
раскрытии, о том, какая опция активна при навигации стрелками, и что именно выбрано. То же касается
`tree-select` и `autocomplete`. Правильный образец лежит рядом: `list-selection.component.ts:187-199` и `:1332-1345`.

### P0-3 · A11Y-TABS-001 · `kbq-tab-group` не отрисовывает семантику табов
`packages/components/tabs/tab-group.html:10-24,46-56`

Нет `role="tablist"` у заголовка, `role="tab"`/`aria-selected`/`aria-controls` у меток,
`role="tabpanel"`/`aria-labelledby` у тела. `getTabLabelId`/`getTabContentId`
(`tab-group.component.ts:336-343`) генерируют устойчивые id, которые **никто не читает**. Навигация с
клавиатуры работает (`paginated-tab-header.ts:296-323`) — отсутствует именно семантика. Соседний
`tab-nav-bar.ts` (`:172-176,338-340`) делает всё правильно, то есть два API таб расходятся между собой.

### P0-4 · A11Y-TREE-001 · у дерева нет семантики, а раскрывашка работает только мышью
`packages/components/tree/tree-selection.component.ts:165-173`, `tree/toggle.ts:83-88`

Нет `role="tree"`, `role="treeitem"`, `aria-expanded`/`aria-level`/`aria-selected`/`aria-setsize`.
У переключателя ветки нет роли, `tabindex`, обработчика клавиш и доступного имени — узлы-ветки можно
раскрыть только мышью (**WCAG 2.1.1, уровень A**). Его `[attr.disabled]` на не-форменном элементе не
действует, поэтому о недоступности не сообщается и вспомогательным технологиям.

### P0-5 · A11Y-DATEPICKER-001 / DT-05 · календарь полностью недоступен с клавиатуры
`packages/components/datepicker/calendar-body.html:12-30`, `calendar-header.html:12,32,64,76,89`

Каждая ячейка дня — `<td [tabindex]="-1" (click)>` без роли, `aria-selected`, `aria-disabled`,
`aria-current` и без имени, кроме голого числа. Оба селекта заголовка и все три кнопки навигации тоже
`tabindex="-1"`. Обработчика `keydown` нет нигде в `calendar*.ts` и `month-view.component.ts`, фокус в
панель не переводится, а `datepicker-input.directive.ts:730` закрывает панель по Tab. У
`datepicker-content.html` нет ни `role="dialog"`, ни ловушки фокуса.

Пользователь клавиатуры может открыть панель по `Alt+ArrowDown` и после этого не может ни дойти до даты,
ни выбрать её. Два «a11y»-теста (`calendar.spec.ts:307-328`) отправляют `ENTER` в `.kbq-calendar__body` и
проверяют, что `selected` равен `undefined` — они проходят **потому что обработчика нет**, то есть дыра
замаскирована, а не покрыта.

### P0-6 · A11Y-MODAL-001 · у `kbq-modal` нет роли диалога, `aria-modal` и доступного имени
`packages/components/modal/modal.component.html:30`

`cdkTrapFocus` применён, но `grep -rn "role" packages/components/modal` (без спек) не находит **ничего** —
проверено. Открытие модального окна ничего не объявляет, виртуальный курсор не ограничен, у диалога нет
имени. Та же дыра у `sidepanel` и `popover`.

### P0-7 · TST-01 · `try/catch` проглатывает единственную проверку
`packages/components/modal/modal.spec.ts:543`

```ts
try { fixture.componentInstance.modalService.open({ kbqComponent: CustomModalComponent }); }
catch (error) { expect(error.message.includes('NullInjectorError')).toBeTruthy(); }
```

Если `open()` перестанет бросать — а это ровно та регрессия, которую тест сторожит — `catch` не выполнится,
не выполнится ни одного `expect`, и тест будет зелёным. Он узаконивает сломанное состояние.
**Правка:** `expect(() => …).toThrow(/NullInjectorError/)`.

### P0-8 · TST-02 · весь DOM-контракт `progress-bar` неопровергаем
`packages/components/progress-bar/progress-bar.component.spec.ts:47,58,65`

`DebugElement.query` возвращает `null`, если ничего не нашлось, а `expect(null).toBeDefined()` проходит.
Все три теста — determinate, indeterminate и значение по умолчанию — прошли бы, если бы `@switch`
отрисовал противоположную ветку или вообще ничего. Это единственное юнит-покрытие того `@switch`.
Та же форма в `progress-bar:83`, `progress-spinner:115`, `loader-overlay:44,59`, `tree-select:3198,3305`
(TST-08/09/10).

### P0-9 · TST-03 · все проверки внутри незащищённого `subscribe`
`packages/components/select/select.component.spec.ts:6289-6326`

Все три `expect` живут внутри `options.changes.pipe(take(1)).subscribe(…)`, и ничто не подтверждает, что
колбэк вызвался. Если `options.changes` перестанет эмитить, тест пройдёт, не проверив ничего. Название
обещает **сортировку** тегов; тело проверяет только набор выбранных значений, порядок — нигде.

### P0-10 · DOC-01 · шесть ссылок в английской документации ведут на страницу 404
`docs/guides/theming.en.md:17,55,92,186`, `packages/components/sidepanel/sidepanel.en.md:5`,
`packages/components/tooltip/tooltip.en.md:89`

Все шесть — абсолютные ссылки без сегмента локали: `](/main/installation)`, `](/components/core)`,
`](/main/design-tokens/colors)` ×2, `](/components/modal)`, `](/components/popover)`. `routes.ts:14-21`
пропускает `:lang` через `canMatchLocaleRoutes`, а `main`/`components` локалями не являются, поэтому каждая
проваливается в редирект `**` → 404 (`:185`). `docs-marked-renderer.ts:115` пропускает не-`guides/` ссылки
без изменений, так что префикс никто не добавляет.

**Проверено:** RU-аналоги несут `/ru/…` на *тех же номерах строк* во всех шести файлах — это пропуск только
в EN, а не соглашение. **Правка:** добавить `/en` во все шесть.

### P0-11 · DOC-02 · два задокументированных примера рендерятся как пустые места
`packages/components/tags/tag.en.md:23` (`tag-with-remove-button`),
`packages/components/loader-overlay/loader-overlay.en.md:70` (`loader-overlay-on-background`)

Проверено: ни одного из ключей нет в `packages/docs-examples/example-module.ts` (ноль совпадений), каталогов
тоже нет. `docs-live-example-viewer.ts:137` пишет ошибку в консоль и выходит, поэтому каждая секция
отрисовывается как заголовок и текст без содержимого. Это единственные 2 висячие ссылки из 576.

**Правка:** `loader-overlay.en.md:70` → `loader-overlay-card` (RU-файл уже использует его на той же строке);
для `tag.en.md:23` — либо сослаться на существующий `tag-removable`, либо убрать секцию: в RU её нет вовсе (DOC-11).

---

## P1 — настоящие баги и серьёзные риски

### Релиз, API и инструменты

**CFG-001** · `tools/jest/setup.ts:13-18` · `jest-fail-on-console` отключён по всему репозиторию. Предикат —
`!(message === 'Error: Could not parse CSS stylesheet')`, а библиотека глушит сообщение при **истинном**
возврате (`node_modules/jest-fail-on-console/index.js:63-67`, проверено). То есть глушится всё, кроме одной
точной строки, а уронить тест может только то сообщение, которое комментарий велит игнорировать. Ошибки
`NG0…`, `ExpressionChangedAfterItHasBeenChecked`, необработанные ошибки RxJS и предупреждения зоны не могут
уронить ни один набор в `units.yml`.

**API-008** · `packages/cli/src/release/changelog.ts:49` · changelog теряет каждое ломающее изменение.
В кастомной `headerPattern` нет места для `!` из conventional commits; проверено запуском —
`feat(components)!: …`, `feat!: …` и `fix(a,b)!: …` не парсятся. Единственный `!`-коммит в диапазоне
`20.1.0..20.2.0` (`06dfe64aa`, DS-3244) отсутствует в `CHANGELOG.md` (проверено: ноль совпадений).
**С тега `20.2.0` в очереди ещё 11 таких коммитов**, включая `feat(file-upload)!`, `feat(list,tree,core)!`
и `fix(form-field)!`.

**API-009** · `changelog-writer-options.ts:84-96` против `:168-174` · `breakingChanges` и `deprecations`
собираются и выкладываются в `context.packageGroups`, а функция `template` рендерит только `group.commits`.
В conventional-changelog-writer 9 template — это **весь** рендерер, поэтому старый `footer.hbs` не
вызывается. Последний заголовок `#### BREAKING CHANGES` в `CHANGELOG.md` — на строке 726 (18.22.0).

**API-010 / CI-02** · `publish.yml:5-6,51`; `publish-release-ci.ts:61`; `publish-release-from-dist.ts:52` ·
предрелизный тег публикуется в npm под `latest`. Фильтр `'*.*.*'` ловит `20.3.0-rc.0`, `-t latest` зашит и
проходит через `publish-release-github-ci.ts:57` → `npm publish --tag latest`. Единственная защита,
`getDistTagChoicesForVersion` (`npm-dist-tag-prompt.ts:35-44`), возвращает одинаковый массив
`[LATEST, NEXT, LTS]` в обеих ветках под `// TODO: for refactoring` — проверено. `docs-stable.yml:5-6`
(`tags: 20.*.*`) ловит тот же тег, поэтому RC заодно уедет на `koobiq.io` и запустит краулер Algolia.

**API-011** · `packages/cli/src/release/base-release-task.ts:89-93,98-102` · обе релизные проверки
закомментированы, остались два пустых `if`. Дальше `stage-release.ts:123` выполняет `git add -A`, поэтому
любой посторонний изменённый файл попадает в коммит с бампом версии, а в `stage-release-commit` — и в
подписанный тег, который пушится и публикуется.

**API-001** · `tools/api-extractor/config.json` · `scrollbar/deprecated` — настоящая вторичная точка входа с
закоммиченным снапшотом и записью в baseline, но её нет в списке `components`, поэтому `approve-api` и
`check-api` её не трогают. Любое будущее изменение уедет без охраны.

**API-002** · `packages/components/scrollbar/index.ts:1` · точка входа — `export * from './scrollbar'`
вместо `'./public-api'`, поэтому `public-api.ts` мёртв и **`KbqScrollbarModule` не экспортируется** из
`@koobiq/components/scrollbar`. Снапшот честно фиксирует дыру. Потребители на NgModule не могут
импортировать модуль.

**API-003** · `tools/api-extractor/api-extractor.ts:16-21`, `docs/PUBLIC_API.md:15` · документированная
команда `yarn run approve-api <component>` разбивает строку по `/`, получает `component === undefined`,
проходит по двум пустым массивам и **завершается с кодом 0, ничего не сделав**. Тот, кто следует
документации, уверен, что API одобрен, и коммитит устаревший снапшот. Рабочая форма — `approve-api components/button`.

**CI-03** · `package.json:21,60` · набор Angular внутренне неудовлетворим.
`@angular/animations@20.3.27` объявляет `peerDependencies: {"@angular/core": "20.3.27"}` (проверено в
установленном манифесте), тогда как core резолвится в `20.3.29`; у `@angular/platform-browser-dynamic@20.3.27`
четыре таких неудовлетворённых точных peer'а. Линкер node-modules у yarn понижает это до предупреждения,
npm выдал бы `ERESOLVE`. `@angular/cdk@20.2.14` **безвреден** (диапазон с кареткой). Ни `check-peer-deps`
(только публикуемые манифесты), ни `check-npm-resolution` (упакованный `dist/` против фикстур) на корневое
дерево не смотрят.

### Документация

**DOC-03** · `packages/components/button/button.en.md:28` · страница описывает три цвета кнопки — `theme`,
`secondary`, `error`. Проверено по `button.component.ts:71`: `KbqButtonColor` это
`Theme | ThemeFade | Contrast | ContrastFade`. `secondary` вообще нет в `KbqComponentColors`, а `error`
исключён из `KbqButtonColor` — **два из трёх задокументированных значений не проходят типизацию**, а два
настоящих не описаны.

**DOC-04** · `packages/components/button/button.en.md` · английская страница устарела относительно русской.
Проверено: EN ссылается на **1** пример, RU — на **8** (`button-fill-and-style`, `…-only-icon`,
`button-content`, `button-hug-content`, `button-fixed-content`, `button-fill-content`,
`button-loading-state` — все есть в `example-module.ts`). Ось заливки и стиля, основной визуальный API
кнопки, по-английски не описана вовсе; `button.en.md:33` до сих пор отправляет к `class="kbq-progress"`, а
`:16` встраивает скриншот устаревшего дизайна. По `git log` файл трогали только чоркой Prettier.

**DOC-05** · `progress-bar.en.md:46-61`, `progress-spinner.en.md:46-61` · три ошибки в одном блоке:
задокументированное значение по умолчанию `primary` неверно (оба конструктора ставят
`KbqComponentColors.Theme`); документированные значения дают классы `kbq-primary`/`kbq-secondary`/`kbq-error`,
а `_progress-bar-theme.scss:4` определяет ровно одно цветовое правило (`.kbq-theme`), тогда как
`_progress-spinner-theme.scss` — только `.kbq-contrast`/`.kbq-contrast-fade`, поэтому каждый пример из
документации даёт компонент, *потерявший* тему; и `ThemePalette` — легаси-перечисление. RU-файлы блок
опускают и по факту корректны.

**DOC-06** · `docs/guides/versioning.en.md` · RU-гайд публикует частоту релизов и 12-месячную политику
поддержки (Active 6 месяцев / LTS 6 месяцев, таблицей) на `:48` и `:56`. По-английски нет ни того, ни
другого — информации о жизненном цикле поддержки на EN-сайте не существует. В списке MAJOR у EN один пункт
дословно повторён как первый и третий.

### Код компонентов

**CORE-B-01 / SEL-01** · `packages/components/core/option/option.ts:405` +
`core/a11y/key-manager/list-key-manager.ts:215` · **выделение диапазона мышью в `kbq-select` недостижимо.**
`onMouseenter` вызывает `keyManager.setActiveItem(this)`, а `setActiveItem` безусловно ставит
`previousActiveItemIndex = _activeItemIndex` — это и есть якорь диапазона для shift-клика. Реальный клик
всегда сначала наводит указатель на цель, поэтому к моменту чтения якоря в `setSelectedOptionsByClick` он
уже равен кликнутому индексу, `fromIndex === toIndex`, и код уходит в ветку одиночного переключения
(`select.component.ts:1671-1684`). Проверено от начала до конца. `KbqTreeSelection` от этого защищается
(`tree-selection.component.ts:794`: `if (!shiftKey && !ctrlKey)`), а `KbqListSelection` вообще не вызывает
`setActiveItem` — при том что комментарий в select утверждает, что он «Mirrors `KbqTreeSelection`». Спеки
проходят, потому что `.click()` в jsdom не порождает `mouseenter`.

**SEL-02** · `packages/components/select/select.component.ts:1682,1702` · запасная ветка shift-клика
вызывает `selectionModel.toggle(option)`, который меняет модель первым; затем `onSelect` читает
`wasSelected = selectionModel.isSelected(option)` **после** изменения (`:2163`), поэтому проверка на `:2187`
всегда ложна и `propagateChanges()` не вызывается. Проверено по цепочке
`selectionModel.changed → option.select() → optionSelectionChanges → onSelect`. Опция подсвечивается,
триггер обновляется, а форм-контрол, `selectionChange`, `valueChange` и `onChange` ничего не узнают.

**FB-01** · `packages/components/filter-bar/pipes/pipe-select.ts:39` и 8 соседних файлов ·
`providers: [{ provide: KbqBasePipe, useExisting: this }]`. Внутри аргумента декоратора `this` — это область
модуля. В AOT-сборке это работает только потому, что ngtsc переиздаёт литерал внутри
`static { this.ɵcmp = … }`; **тот же литерал переиздаётся на уровне модуля** внутри
`ɵɵngDeclareClassMetadata` — проверено в
`dist/components/fesm2022/koobiq-components-filter-bar.mjs:751` — где `this === undefined`. Любой JIT-путь
даёт `{useExisting: undefined}` и `NG0201`. Все 8 спек пайпов обходят это через `overrideComponent`, так что
поставляемый провайдер не проверяет ни один тест.

**OVL-01** · `packages/components/modal/modal.component.ts:472` · `kbqCloseByESC` компонентом не читается.
Хостовый `onKeyDown` закрывает по Escape безусловно и вызывает `close()` напрямую, а не
`handleCloseResult('cancel', …)` — проверено; инпут встречается только на `:173` и в `modal.service.ts:41`.
Поэтому `[kbqCloseByESC]="false"` не работает, а `kbqOnCancel`, возвращающий `false` ради защиты
несохранённых данных, на пути Escape обходится.

**OVL-02** · `packages/components/modal/modal.component.ts:389` · модалка, уничтоженная открытой, блокирует
страницу. `ngOnDestroy` только освобождает оверлей: `body { overflow: hidden }` снимается лишь в ветке
закрытия, а `KbqModalControlService.removeOpenModal` вызывается только из `afterClose`. Уход с маршрута,
содержащего `<kbq-modal [kbqVisible]="true">`, оставляет страницу **навсегда** без прокрутки, потому что
устаревшая ссылка держит `openModals.length > 0`.

**OVL-03** · `packages/components/popover/popover.component.ts:462` · каждый popover подписывается на
корневой `ScrollDispatcher` без отписки — проверено, и соседняя подписка шестью строками выше использует
`takeUntilDestroyed`. `closeOnScroll === null` — значение по умолчанию, то есть это касается каждого
`[kbqPopover]`. Любой уничтоженный триггер остаётся зарегистрированным навсегда и на каждое событие
прокрутки во всём приложении выполняет `getBoundingClientRect()` на отсоединённом узле.

**SWP-01** · `packages/components/markdown/markdown.component.ts:99` · **точка XSS.**
`sanitizer.bypassSecurityTrustHtml(markdownService.parseToHtml(...))` с биндингом через `[innerHtml]`.
`KbqMarkdownService.parseToHtml` документирован как *не* санитизирующий (`markdown.service.ts:12`), а
`marked` пропускает сырой HTML. `<kbq-markdown [markdownText]="commentFromApi">` выполнит
`<img src=x onerror=…>`. Соседний `code-block-highlight.ts:179` делает это правильно.

**FRM-001** · `single-file-upload.component.ts:113,293` и `multiple-file-upload.component.ts:121,312` ·
`writeValue` присваивает через сеттер, который вызывает `cvaOnChange` — проверено. Любой программный
`setValue`/`reset` помечает контрол грязным и переэмитит `ngModelChange`; `control.reset()` оставляет
значение множественного варианта равным `[]` вместо `null`.

**FRM-002** · `single-file-upload.component.ts:250` · `dropzoneService.filesDropped.subscribe(...)` находится
**внутри** `effect`, поэтому каждое изменение `[fullScreenDropZone]` добавляет новую подписку, и ни одна не
снимается; один брошенный файл вызывает `onFileDropped` N раз. Множественный вариант делает правильно —
подписка вне эффекта.

**FRM-003** · `packages/components/file-upload/dropzone.ts:103` · `ngOnDestroy` вызывает `close()`, но не
`stop()`, а `stop()` — единственное, что запускает `dropAbort` (проверено). Четыре слушателя перетаскивания
на `document.body` переживают уничтожение компонента, и `open()` потом строит портал через инжектор
уничтоженного компонента.

**FRM-004** · `packages/components/inline-edit/inline-edit.ts:378-392` · `initialValue` захватывается
**после** `if (!formFieldRef) return;`. С `[getValueHandler]`/`[setValueHandler]` и без проецируемого
form-field — то есть в поставляемом примере `inline-edit-custom-handler` — Escape вызывает
`setValue(undefined)` и уничтожает значение вместо восстановления.

**FRM-005** · `packages/components/toggle/toggle.component.ts:122` · у `@Input() disabled` нет
`transform: booleanAttribute`, в отличие от чекбокса, радио, button-toggle и кнопки (проверено рядом).
`<kbq-toggle disabled>` даёт `''`, ложное везде, поэтому переключатель рисуется активным и срабатывает по
клику. Тот же класс бага в `file-picker.ts:26` для `<kbq-file-upload disabled>` (FRM-013).

**FRM-006** · `packages/components/file-upload/primitives/file-picker.ts:141-157` · `remove()` возвращает
**оставленные** элементы, а не удалённый: `isRemoved = currentItem !== item` — это предикат *сохранения*, а
заполняемый массив назван `removed`. `remove(file2)` на `[f1,f2,f3]` вернёт `[f1,f3]`. Поведение
зафиксировано тестом `file-picker.spec.ts:467`. JSDoc к тому же обещает событие, которое не эмитится.

**CORE-A-001 / CORE-A-002** · `packages/angular-moment-adapter/adapter/moment-date-adapter.ts:85-87` ·
`startOf` усекает в **исходной** зоне и только потом переклеивает ярлык, тогда как близнец на luxon сперва
конвертирует и несёт явный комментарий, зачем (`date-adapter.ts:102-108`) — проверено рядом. При
`KBQ_DATE_TIMEZONE='Asia/Kolkata'` и входе в 22:00 UTC moment вернёт *предыдущий* календарный день. Поскольку
`super.startOf` — это моментовский `date.startOf(unit)`, работающий на месте, он вдобавок **мутирует
переданный `Moment`** до клонирования в `applyTimezone` — собственный комментарий класса на `:172`
документирует эту опасность, и у `deserialize` есть тест «не должен мутировать», а у `startOf` нет.

**CORE-A-003** · `packages/components/core/formatters/number/formatter.ts:135-139` · при
`useDefineForClassFields: false` неприсвоенные поля `ParsedDigitsInfo` не являются собственными свойствами,
поэтому `result.maximumFractionDigits` равен `undefined`, `4 > undefined` ложно, и ограничение не
срабатывает. Спред на `:190-193` оставляет умолчание `maximumFractionDigits: 3` рядом с
`minimumFractionDigits: 4` → `Intl.NumberFormat` бросает `RangeError`, который перевыбрасывается как
`InvalidPipeArgument` и обрывает отрисовку всего представления. `{{ 1.23456 | kbqNumber: '1.4' }}` —
форма, разрешённая документированной грамматикой; собственный `DecimalPipe` Angular вернул бы `1,2346`.

**CORE-A-004** · `packages/components/core/locales/formatters.ts:168` · у tk-TM `groupSeparator` для
округления равен `''`, а `formatter.ts:356-360` склеивает строковый нулевой дробный остаток с ним, поэтому
`10000` рисуется как **`100 M`** — каждое значение tk-TM ≥ 1000 ошибается на порядок.

**CORE-A-005** · `packages/components/core/forms/validators.ts:196` ·
`new RegExp(\`${acceptedExtensionOrMimeType}$\`)` — проверено. `accept: ['image/*']` компилируется в
«`image`, за которым ноль или больше слэшей, в конце», что не совпадает ни с именем файла, ни с MIME-типом,
поэтому **любой accept с подстановочным MIME отбраковывает 100% файлов**; `.txt` трактует `.` как
подстановку и принимает файл с именем `mytxt`.

**DT-01** · `packages/components/datepicker/datepicker-input.directive.ts:1091` · `getDefaultValue()`
заполняет `month` из 0-based `adapter.getMonth()`, а `createDateTime` (`:1537`) вычитает единицу ещё раз —
проверено. В локалях «год-первым» (`en-US`, `zh-CN`, `fa-IR`) ввод голого года даёт не тот месяц, а в январе
бросает `Invalid month index "-1"` из `setTimeout`.

**DT-02** · `datepicker-input.directive.ts:1065-1073` · день ограничивается по году, который уже стоит в
поле и который директива сама подставила из `today()`. Ввод `29.02.2024` в `ru-RU` даёт **`28.02.2024`** без
ошибки; вставка той же строки работает. Ввод и вставка расходятся.

**DT-03** · `packages/components/time-range/time-range-editor.ts:263` ·
`toDate: this.form.controls.toTime.value` — контрол `toDate` не читается вообще (проверено). Эмитируемый
`endDateTime` берёт дату из устаревшей даты таймпикера, поэтому потребитель получает не тот диапазон,
который показан в интерфейсе, а `rangeValidator` (читающий настоящий `toDate`) держит кнопку Apply активной.

**DT-04** · `packages/components/time-range/constants.ts:50` · валидатор диапазона использует
день-гранулярный `compareDate` там, где редактор рисует `HH:mm:ss`. Один и тот же день, с `18:00` по
`09:00` проходит валидацию — принимается любой перевёрнутый диапазон короче 24 часов.

### Доступность (P1)

| ID | Место | Дефект |
|---|---|---|
| A11Y-ICONBTN-001 | `icon/icon-button.component.ts:32-42` | `tabindex="0"` без `role="button"` и без обработчика Enter/Space — таб-стоп, который при активации ничего не делает |
| A11Y-ICONBTN-002 | `toast:100`, `file-upload:36,62`, `search-expandable:33` | иконочные кнопки без доступного имени; `button.component.ts:288-309` предупреждает в dev-режиме ровно об этом |
| A11Y-BTNGROUP-001 | `button/button-group.ts:154-157` | `aria-orientation` на `role="group"` — axe `aria-allowed-attr`; в `button-toggle` это уже исправлено, здесь нет |
| A11Y-TOAST-001 | `toast/toast-container.component.ts:27-29` | нет `aria-live` и `role="status"` — проверено, ролей ноль; тосты не объявляются никогда |
| A11Y-TOOLTIP-001 | `tooltip/tooltip.component.ts:158-163` | нет `role="tooltip"` и `aria-describedby` — проверено, ролей ноль; каждый тултип невидим для скринридера, включая те, что служат единственной подписью иконочных кнопок |
| A11Y-PROGRESS-001 / SWP-06 | `progress-bar:32`, `progress-spinner:38` | нет `role="progressbar"` и `aria-value*` — проверено, ролей ноль |
| A11Y-TAGS-001 | `tags/tag-list.component.ts:81`, `tag.component.ts:219,753` | нет ролей listbox/option; у кнопки удаления нет роли, имени и она вне таб-порядка |
| A11Y-SPLITTER-001 | `splitter/splitter.component.ts:63-69` | разделитель только на `(mousedown)` — ни `role="separator"`, ни `tabindex`, ни клавиш. `dl.component.ts:66-83` делает ту же работу правильно |
| A11Y-CLAMPED-001 | `clamped-text/clamped-text.ts:53` | `role="button"` на span, которому директива-триггер не даёт `tabindex`, поэтому её обработчики Enter/Space недостижимы |
| A11Y-CLAMPED-002 | `clamped-text.ts:73`, `clamped-list.ts:11` | `aria-expanded` на хосте без роли (`generic`) |
| A11Y-TOGGLE-001 | `toggle/toggle.component.html:4-7` | `aria-checked="mixed"` на `role="switch"` запрещён ARIA 1.2; NVDA откатывается к «не отмечено» |
| A11Y-FORMFIELD-001 | `form-field/form-field.html:2` | `<label for>` не связывается с кастомными элементами `kbq-select`/`kbq-tag-list`, а `aria-labelledby` не проставляется — видимая подпись не называет ничего |
| A11Y-CHECKBOX-001 | `checkbox/checkbox.ts:60` | JSDoc велит передать `[aria-label]`; такого инпута нет, и на внутренний `<input>` ничего не проксируется. То же отсутствие у `radio` |
| A11Y-BREADCRUMBS-001 | `breadcrumbs/breadcrumbs.ts:176` | `'[attr.aria-label]': "'breadcrumb'"` — единственная захардкоженная ARIA-строка в библиотеке; компонент уже инжектит a11y-локаль на `:183` |
| A11Y-DATEPICKER-002 | `datepicker/datepicker-toggle.component.ts:48-55` | у переключателя `aria-expanded`/`aria-disabled` на хосте без роли, нет `tabindex`, клавиш и имени |

### Качество тестов (P1)

| ID | Место | Дефект |
|---|---|---|
| TST-04 | `core/forms/forms.spec.ts:80` | единственный сьют файла помечен `xdescribe` — у `KbqFormsModule` нет ни одной живой проверки нигде |
| TST-05 | `tabs/tab-group.spec.ts:39` | «should default to the first tab» проверяет индекс **1**, который хост выставил явно |
| TST-06 | 7 файлов, **21 место** (проверено grep'ом) | `expect(spy).not.toHaveBeenCalled()` сразу после `jest.spyOn` — тавтология |
| TST-07 | `actions-panel/e2e.playwright-spec.ts:30` | `.click()` без `await` перед `toHaveScreenshot`; базлайн зафиксировал гонку |
| TST-08 | `progress-bar:83`, `progress-spinner:115` | `expect(getAttribute('id')).toBeDefined()` принимает `null` |
| TST-09 | `loader-overlay/…spec.ts:44,59` | `toBeDefined()` на результате `query()` в тесте, весь смысл которого — присутствие элемента |
| TST-10 | `tree-select/…spec.ts:3198,3305` | проверки поля поиска и сообщения о пустом результате не могут упасть |
| TST-11 | `toast/toast.spec.ts` | пауза автозакрытия при наведении и фокусе (`toast.service.ts:52`) не покрыта вовсе |
| TST-12 | `notification-center/…spec.ts` | `popoverMode`, `popoverHeight`, `disabled`, `placement`, `unreadItemsCounter` — весь набор инпутов триггера — не покрыт |
| TST-13 | `sidepanel/sidepanel.spec.ts` | `trapFocus`, `size`, `beforeClosed()`, `sidepanelResult` не покрыты (ноль совпадений grep по каждому) |

### Ветка (P1)

**BR-01** · `datepicker-input.directive.ts:1085-1097` · коммит `fix(datepicker): min/max validation for
keyboard input` не содержит библиотечной правки того дефекта, который называет. `getDefaultValue()` всё ещё
берёт время набранной даты из `adapter.today()`, а `compareDateTime` сравнивает до миллисекунд, поэтому
`[max]`, привязанный к полуночной дате, по-прежнему бракует собственный последний день. Фактически
поставлены две меньшие, но настоящие правки — защита от падения на инпуте без форм-контрола и корректная
обработка невалидных `min`/`max` — плюс документирование ловушки. **Правка:** переименовать коммит либо
нормализовать границу в сеттере `max`.

**BR-08** · `packages/schematics/src/{collection,migrations}.json` · 9 из 10 веток `origin/review/*`
конфликтуют с `origin/main` **и друг с другом** по одним и тем же двум файлам, каждая дописывая в тот же
участок JSON. Семь дополнительно правят `core.api.md` и `baseline.json`. Вливать нужно по одной с ручным
разрешением; `review/search-expandable` — единственная чистая и без миграции, с неё естественно начать.

**BR-09** · `origin/review/title` · её базовый коммит вытеснен `a31749c30`, уже влитым в `main` (та же тема,
другой patch-id, 29 строк расхождения). `review/tooltip` наследует конфликт, потому что тоже несёт
`title.directive.ts`.

---

## P2 — стоит починить

Развёрнутые формулировки правок — в [REVIEW.md](./REVIEW.md); здесь тот же набор ID с местом и сутью.

<details>
<summary>Конфигурация, CI и инструменты (18)</summary>

| ID | Место | Дефект |
|---|---|---|
| CFG-002 | `.lintstagedrc.js:2-4` | `*`, `*.{css,scss}` и `*.{js,ts,html}` **пишут** в один и тот же файл параллельно — дословно антипример из README самого lint-staged |
| CFG-003 | `playwright.config.ts:99-103` | `reducedMotion: 'reduce'` во всех снимках, поэтому все 234 базлайна фиксируют ветку `animation: none` восьми таблиц стилей (проверено) — сломанная анимация по умолчанию невидима |
| CFG-004 | `tools/builders/packager/build.ts:143-156` | пути от `cwd`, мутирует **отслеживаемый** `core/version.ts` без восстановления, игнорирует `options.versionPlaceholder`, неидемпотентен |
| CI-04 | `build.yml:3-4` | только `on: pull_request` — единственный воркфлоу, собирающий все пакеты и документацию, не может сообщить о сломанном `main` |
| CI-05 | корневой `package.json` (нет `workspaces`) | у `@koobiq/cli` 10 рантайм-зависимостей, невидимых обоим аудитам; `dotenv` собирается и тестируется на `^16.6.1`, публикуется как `^17.4.2` (проверено) |
| CI-06 | `publish.yml:31,95` | грамматика тега проверяется в **последующей** джобе, когда npm уже получил пакеты; соответствие тега и `package.json` не проверяется вовсе |
| CI-07 | `publish.yml:35`; `npm-client.ts:37` | `id-token: write` выдан «для provenance», но `--provenance` не передаётся — все релизы `@koobiq/*` без аттестации |
| CI-08 | `e2e-approve-snapshots.yml:51-59` | пуш под `GITHUB_TOKEN` не перезапускает `e2e.yml`, поэтому «✅ Snapshots updated» соседствует с устаревшей проверкой |
| CI-09 | `e2e-approve-snapshots.yml:28`, `redeploy-preview.yml:31` | `persist-credentials` оставляет токен с правом записи в `.git/config`, пока на раннере выполняется PR-код |
| CI-10 | `package.json:154-166` | 11 недокументированных `resolutions`, несущих состояние безопасности, вне Dependabot и вне собственной дисциплины репозитория |
| API-005 | `migrations/css-selectors/index.ts:26,31` | `\b…\b` считает `-` границей, поэтому `\bkbq-body\b` правит внутри `kbq-body-large`; шаблон подставляется без экранирования и применяется к `.ts` |
| API-006 | `packages/components/package.json:41`; `ng-add/index.ts:68-70` | `overlayscrollbars` всё ещё обязательный peer, хотя после переделки скроллбара его не импортирует ничто вне `scrollbar/deprecated/` |
| API-012 | `npm-dist-tag-prompt.ts:35-44` | документированная защита от предрелиза имеет одинаковые ветки, а сама функция не вызывается |
| API-013 | `packages/cli/src/cli.ts:26-42` | `repoUrl` не имеет ни флага, ни fallback'а из окружения, поэтому `git ls-remote undefined` тихо падает и проверка на коллизию удалённого тега не срабатывает |
| API-014 / CI-14 | `npm/npm-client.ts:43-46` | `npmPublish` — единственная функция без `env: npmClientEnvironment`, ради которого и написана шапка файла |
| API-015 | `release-output/check-packages.ts:8` | glob `+(esm5\|esm2015\|bundles)/*.js` под ng-packagr 20 не находит ничего, поэтому валидатор бандлов ни разу не выполнялся и рапортует успех |
| API-016 | `version-name/publish-branches.ts:10` | мажорные релизы разрешены только с `master`; дефолтная ветка репозитория — `main`, то есть стейджинг мажора заблокирован |
| API-017 | `package.json:201` | лишний `p` в `--project p packages/cli/tsconfig.lib.json` — `release:publish:dist` не запускается |

</details>

<details>
<summary>Документация и контент-пайплайн (7)</summary>

| ID | Место | Дефект |
|---|---|---|
| DOC-07 | EN-документы `file-upload`, `toast`, `tree-select` | четыре секции есть в RU и отсутствуют в EN, хотя все четыре ключа примеров лежат в `example-module.ts`; в `examples.file-upload.en.md:24` ещё и H2 там, где у соседей H3 |
| DOC-08 | `tools/generate-{sitemap,prerender-routes,llms-txt}.ts` | все три ловят ошибку через `console.info` и не ставят код возврата, поэтому провал генерации — **зелёный** шаг, и в релиз уезжает прошлый артефакт |
| DOC-09 | `.nvmrc` против `package.json:18` | *(то же, что LEAD-3)* — и `setup-node/action.yml:9` использует `node-version-file: .nvmrc`, то есть **CI тоже работает на версии ниже заявленной** |
| DOC-10 | `README.md:21` | таблица на первой странице называет moment-адаптер `@angular/angular-moment-adapter`; публикуется он как `@koobiq/angular-moment-adapter` |
| DOC-11 | `packages/components/tags/tag.ru.md` | секция «Remove Button» есть только в EN — и та сломана (DOC-02); решать вместе |
| DOC-12 | `apps/docs/src/app/structure.ts` (Alert) | `alert-dynamic` — реальный задокументированный пример, недостижимый ни по одному маршруту из-за `hasExamples: false`. Из 64 файлов `examples.*.md` остальные 33 недостижимых — намеренные заглушки |
| DOC-13 | `docs-examples/components/icon/icon-button-custom size/` | **пробел** в имени каталога, который подставляется в URL загрузки исходника и в StackBlitz; пример живой. `tree-select-with-multiline-matcher-overview/` тоже расходится с ключом |

</details>

<details>
<summary>core, выбор, оверлеи, формы, filter-bar, дата/время, стили (98)</summary>

| ID | Место | Дефект |
|---|---|---|
| CORE-A-006 | `formatters/date/formatter.pipe.ts:141` | относительные пайпы кешируют без `today()` в ключе — «сегодня» остаётся после полуночи |
| CORE-A-007 | `formatters/number/formatter.ts:94` | `supportedLanguages` жёстко перечисляет 4 идентификатора, поэтому tk-TM и любая локаль потребителя пропускают таблицу интервалов округления |
| CORE-A-008 | `angular-luxon-adapter/adapter/date-adapter.ts:72` | fallback на данные локали Angular недостижим (`localeData` всегда содержит 7 ключей), поэтому неизвестный `LOCALE_ID` роняет конструктор адаптера |
| CORE-A-009 | `moment-date-adapter.ts:66` | `localeChanges` — `Subject<void>` там, где luxon и абстрактный класс ядра объявляют `BehaviorSubject<string>` |
| CORE-A-010 | `core/forms/validators.ts:193` | `isCorrectExtension` падает на голом `File`, который соседний `maxFileSize` принимает |
| CORE-A-011 | `core/forms/validators.ts:80` | пример в JSDoc `minLowercase()` не компилируется и документирует несуществующее значение по умолчанию |
| CORE-A-012 | `formatters/number/formatter.ts:200,269,319,353` | нечистые пайпы пересоздают `Intl.NumberFormat` на каждый биндинг каждый тик; соседние пайпы дат решают это кешем |
| CORE-A-013 | `core/forms/forms.directive.ts:47` | `elements()` — сигнальный запрос, прочитанный один раз в `ngAfterContentInit`; добавленные позже строки не пересчитывают отступы |
| CORE-B-03 | `core/pop-up/pop-up-trigger.ts:387` | `visibleChange` подписан с `destroyRef` **триггера**, тогда как `instance` пересоздаётся на каждое открытие, а `KbqPopUp.ngOnDestroy` этот эмиттер не завершает (проверено) |
| CORE-B-04 | `core/pop-up/pop-up-trigger.ts:298,447` | освобождённый `OverlayRef` сохраняется и возвращается из `createOverlay()`; у `show()` нет защиты от уничтоженного состояния |
| CORE-B-05 / OVL-11 | `core/pop-up/pop-up-trigger.ts:543,641,668` | слушатели снимаются с `getNativeElement()`, который мог измениться через `setExternalNativeElement` — исходный хост остаётся с ними навсегда |
| CORE-B-06 | `core/overlay/auto-hide-scroll-strategy.ts:85,145` | пустой `ancestorScrollContainers` делает `.some()` ложным, стратегия вырождается в «никогда не прятать», а fallback на вьюпорт недостижим |
| CORE-B-07 | `core/select/common.ts:117-127` | подписка из `Promise.resolve()` может быть создана после того, как `ngOnDestroy` уже отписал заглушку |
| CORE-B-08 | `core/services/theme.service.ts:274` | незащищённый `matchMedia` в `providedIn: 'root'` сервисе ломает SSR и prerender; все спеки его подменяют *(needs-verification)* |
| SEL-03 | `select.component.ts:2070` | поиск при виртуальном скролле по-прежнему зовёт `this.compareWith` напрямую — третье место, пропущенное в `1895e72c9`; бросающий компаратор теперь теряет весь выбор |
| SEL-04 | `select.component.ts:1801` | у `scrolledToBottom` нет допуска на субпиксель; в `notification-center.ts:303` такая константа уже есть с объяснением |
| SEL-05 | `tree-select.component.ts:1288,1294` | удаление тега сравнивает через `===` вместо `treeControl.compareValues`, поэтому с объектными значениями эмитится событие удаления, ничего не удалившее |
| SEL-06 | `autocomplete-trigger.directive.ts:283` | утечка подписки `keyManager.change`; все соседи используют `takeUntilDestroyed` |
| SEL-07 | `tree/toggle.ts:56` | один вечный подписчик `filterValue` на каждый отрисованный узел, на `BehaviorSubject`, принадлежащем потребителю |
| SEL-08 | `tags/tag-list.component.ts:571` | `registerInput` подписывается на `statusChanges` потребителя без снятия и без дерегистрации |
| SEL-09 | `core/option/option.ts:353` | shift-клик по опции автокомплита падает: `KbqAutocomplete` предоставляет `KBQ_OPTION_PARENT_COMPONENT`, не реализуя `setSelectedOptionsByClick` |
| SEL-10 | `list-selection.component.ts:1041` | перетаскивание в список, связанный по `id`, отдаёт `currentIndex = previousIndex`, то есть **исходный** индекс |
| SEL-11 | `select.component.ts:2202` | компаратор сортировки по умолчанию — `a.value - b.value` (NaN для строк и объектов → порядок вставки), тогда как tree-select сортирует по порядку в панели |
| SEL-12 | `select:1112`, `tree-select:869` | `multiline` питает `multiSelection`, но, в отличие от `multiple`, не защищён и не пересоздаёт модель |
| SEL-13 | `tree-select.component.ts:869` | select молча заменяет `SelectionModel` дерева на модель противоположной множественности вместо того, чтобы бросить ошибку |
| SEL-14 | `list-selection.component.ts:826` | у перетаскивания нет клавиатурного эквивалента — WCAG 2.1.1, что признано в `list.en.md:196` |
| SEL-15 | `tree-select.component.ts:886` | ручной вызов `tree.ngAfterContentInit()` вместе с вызовом Angular создаёт второй key-manager; select подписан на первый *(needs-verification)* |
| OVL-04 | `notification-center.ts:534` | утечка вложенной подписки на closing-actions → `null.setStickPosition()` на каждую прокрутку после уничтожения триггера |
| OVL-05 | `dropdown-trigger.directive.ts:200,336` | одно поле `closeSubscription` хранит два разных жизненных цикла; подписка на закрытие панели теряется после первого открытия |
| OVL-06 | `_dropdown-theme.scss:31` | правило безопасной зоны подменю вложено без `&` и компилируется в «панель внутри пункта» — фича из `ef6d0515b` визуально мертва |
| OVL-07 | `core/pop-up/pop-up-trigger.ts:574` | `focus()` — голый нативный вызов, поэтому Escape из popover возвращает фокус без клавиатурного кольца (WCAG 2.4.7); `KbqDropdownTrigger` правильно использует `focusVia` |
| OVL-08 | `modal.component.ts:384` | автофокус модалки — голый `focus()` на первую `<button>` в DOM-порядке, то есть на крестик в шапке |
| OVL-09 | `notification-center.ts:241` | `switcher().focus()` вместо доступного `focusViaKeyboard()` |
| OVL-10 | `popover.component.ts:115` | `focusFirstTabbableElement()` выполняется независимо от `isTrapFocus`; popover по фокусу закрывает сам себя, а по наведению — крадёт фокус *(needs-verification)* |
| OVL-12 | `sidepanel.service.ts:171` | `[...sidepanels.reverse()]` мутирует живой массив порядка наложения до копирования |
| OVL-13 | `sidepanel-ref.ts:128` | защита «уже закрыто» проверяет `Subject.closed`, который `complete()` никогда не выставляет |
| OVL-14 | `modal.component.ts:399` | `focusMonitor.monitor` останавливается только через `take(1)`, который может не сработать; на destroy `stopMonitoring` нет |
| OVL-15 | `modal-control.service.ts:108` | неотслеживаемая подписка на `beforeClose` в корневом сервисе, замыкающая возможно уничтоженные модалки |
| OVL-16 | `toast.service.ts:195` | `toTop()` переставляет хост оверлея при каждом показе, сбивая фокус внутри тоста и возобновляя его TTL *(needs-verification)* |
| OVL-17 | `toast-container.component.ts:56` | перекомпоновка сообщается в **глобальный** `ScrollDispatcher`, поэтому появление тоста по-прежнему закрывает тултипы со стратегией close *(needs-verification)* |
| OVL-18 | `core/pop-up/pop-up-trigger.ts:403` | `stickToWindow` переприменяется только на ресайз, но не после того, как стратегия позиционирования перепишет панель при прокрутке *(needs-verification)* |
| FRM-007 | `textarea.component.ts:235-237` | подписка на `animationDone` таб-группы без снятия и повторный вызов `ngOnInit()` на уничтоженной директиве |
| FRM-008 | `checkbox.ts:342-346` | `onTouched` срабатывает на **фокус**, поэтому чекбокс с `requiredTrue` показывает ошибку сразу при переходе табом; радио делает правильно |
| FRM-009 | `toggle.component.ts:210-212` | `focusMonitor.monitor(...)` вызывается без подписки — контрол никогда не помечается touched на blur |
| FRM-010 | `button-toggle.component.ts:124,240` | `writeValue` эмитит `valueChange`, причём N+1 раз на один программный `setValue` |
| FRM-011 | `button-toggle.component.ts:223` | множественность `SelectionModel` заморожена в `ngOnInit`, тогда как `currentValue`, `role` и `ariaOrientation` продолжают читать `multiple()` |
| FRM-012 | `button-toggle.component.ts:494` | обычный `@Input value` читается внутри `computed` группы и потому не является реактивной зависимостью |
| FRM-013 | `file-picker.ts:26` | у `disabled` нет `booleanAttribute` — `<kbq-file-upload disabled>` не отключается |
| FRM-014 | `checkbox.ts:75` | `'[attr.disabled]': 'disabled'` рисует `disabled="false"`; все остальные контролы библиотеки защищаются через `\|\| null` |
| FRM-015 | `inline-edit.ts:495-505` | путь с fallback-таймаутом оставляет на `window` слушатель `scrollend`, который позже обнуляет дескриптор чужого запроса |
| FRM-016 | `inline-edit.ts:542-543` | `markAllAsTouched()` вызывается на **каждый** keydown, поэтому ошибки появляются с первого набранного символа |
| FRM-017 | `file-drop.ts:26-44` | `accept` применяется только к скрытому `<input>`; перетащенные файлы проходят мимо него молча |
| FRM-018 | `cleaner.ts:127` | очиститель рисуется и съедает клик, но ничего не очищает, если у контрола нет `NgControl` *(needs-verification)* |
| FB-02 | `filters.ts:91,135` | `viewChild<KbqDropdownTrigger>('filterActionsButton')` резолвится в `KbqButton`, поэтому половина `filterActionsOpened` мертва |
| FB-03 | `filter-bar.ts:126`, `filter-reset.ts:34` | `onResetFilter` — `BehaviorSubject`, залипший в `true`; созданные позже пайпы с `openOnReset` открываются сами |
| FB-04 | `filter-bar.ts:133`, `pipe-add.ts:100` | `openPipe` залипает на последнем id; пересозданный пайп с тем же id открывается сам |
| FB-05 | `filters.ts:195-211` | `saveChanges()` снимает `changed` до подтверждения хостом, а `filterSavedUnsuccessfully()` ничего не восстанавливает — неудачное сохранение выглядит успешным |
| FB-06 | `filter-save-popover.ts:256-275` | `filterSavedUnsuccessfully()` при закрытом поповере читает пустой `viewChild.required` → NG0951 из таймера, а сообщение об ошибке живёт только внутри закрытого поповера |
| FB-07 | `filter-save-popover.ts:299-304` | `subscribe(this.close)` передаёт эмитированное `false` как `restoreFocus`, поэтому Escape и клик по подложке роняют фокус на `<body>` (WCAG 2.4.3) |
| FB-08 | `filters.ts:74`, `filter-save-popover.ts:117` | проецируемый ребёнок инжектит конкретный `KbqFilterBar`, хотя `KBQ_FILTER_BAR_HOST` существует и используется всеми соседями — нарушение AGENTS.md плюс цикл модулей |
| FB-09 | `filter-save-popover.ts:279-306` | повторное открытие во время анимации закрытия удваивает подписки и молча не открывает поповер *(needs-verification)* |
| DT-06 | `datepicker-input.directive.ts:875` | результат `String.replace` отбрасывается — нормализация разделителей при вставке не происходит |
| DT-07 | `datepicker-input.directive.ts:733`, `timepicker.directive.ts:592` | ни у одной директивы нет хостового слушателя `(input)`, поэтому Backspace, Delete, Ctrl+X, Ctrl+Z и правки перетаскиванием не перепарсиваются до blur |
| DT-08 | `datepicker-input.directive.ts:1472`, `timepicker.directive.ts:1054` | подписка на `control.valueChanges` не снимается и пишет **сырое** значение в `_value`, минуя `deserialize` |
| DT-09 | `timepicker.directive.ts:975-977` | оба граничных случая 12-часового формата дают час 24, и `set()` в luxon переносит его на следующий день — `12:30 pm` становится 00:30 следующих суток |
| DT-10 | `timepicker.directive.ts:580-624` | нет защиты `readOnly`; стрелки меняют значение read-only таймпикера. Датапикер защищается на `:711` |
| DT-11 | `calendar-header.component.ts:233-239` | min и max в одном году попадают во взаимоисключающие ветки, поэтому месяцы после `maxDate` остаются доступными и отскакивают после выбора |
| DT-12 | `calendar-header.component.ts:73,92` | `if (!value) return;` означает, что границы можно поднять, но нельзя снять — заголовок расходится с сеткой |
| DT-13 | `calendar-header.component.ts:196-218` | активный год вне жёсткого окна 1900–2099 показывает не тот год и блокирует навигацию |
| DT-14 | `month-view.component.ts:211-212` | день-гранулярный `shouldEnableDate` включает день `maxDate`, выбор которого затем не проходит миллисекундный `maxValidator` |
| DT-15 | `timezone/timezone.utils.ts:91-93` | компаратор сортировки возвращает **абсолютное смещение**, а не разность — он не антисимметричен; все зоны с нулевым смещением равны всем |
| DT-16 | `timezone/timezone.utils.ts:106-110` | регулярка с флагом `g`, переиспользуемая в `.filter()`, теряет каждое второе совпадение, а неэкранированный шаблон падает на `*`, `(`, `[` |
| SWP-02 | `code-block/code-block-highlight.ts:194-200` | установка плагина на каждый экземпляр добавляет слушатель `copy` на `document` и узел `<style>` на каждый блок кода, никогда их не снимая, и затирает `window.hljs` |
| SWP-03 | `splitter/splitter.component.ts:608` | область подписывается на `output()` родителя без снятия; удалённые области продолжают эмитить с отсоединённых узлов |
| SWP-04 | `table/table.component.ts:33` | селектор `KbqTableCellContent` — `kbq-table td`, тогда как таблица это `table[kbq-table]`, а элемента `<kbq-table>` нет нигде (проверено) — директива и её CSS не выполнялись ни разу |
| SWP-05 | `progress-bar.component.ts:34` + `.html:3` | один и тот же сгенерированный id привязан и к хосту, и к внутренней дорожке (проверено) — дубликат id в DOM |
| SWP-07 | `scrollbar/deprecated/scrollbar.component.ts:61` | `mergeEvents()` создаёт новый объект на каждый вызов в шаблоне, а принимающий сеттер перерегистрирует все слушатели при смене идентичности |
| SWP-08 | `markdown/markdown.values.ts:2-23` | голые префиксы тегов без границы: `<a` совпадает с `<abbr`, порождая стилизованную ссылку с мусорным атрибутом |
| SWP-09 | `empty-state.component.ts:89-93` | `errorColor` читается один раз в `ngAfterContentInit`; переключение не перекрашивает проецируемую иконку |
| SWP-10 | `dynamic-translation.ts:172-174` | замена слотов выполняется один раз в `afterNextRender`; изменение `[slots]`/`[text]` оставляет пустые плейсхолдеры |
| SCSS-001 | `badge/_badge-theme.scss:18` | `border: transparent` — **сокращённая** запись, поэтому у залитых бейджей пропадают `border-style` и `border-width`, и они на 2px уже контурных |
| SCSS-002 | `code-block/code-block-tokens.scss:18-119` | 102 токена `--kbq-code-block-font-hljs-*` не имеют потребителя; `.hljs-title.class_` никогда не получает вес 500 |
| LEAD-1 | `notification-center.service.ts:268` | `setIds` присваивает `new Date().getTime().toString()` внутри `forEach`, поэтому при пакетной загрузке **все** элементы без id получают одинаковый id, а обработчик прочтения тоста (`:150`) помечает не тот элемент |
| LEAD-2 | `tsconfig.json` | только `strictNullChecks` и `strictFunctionTypes` — ни `strict`, ни `noImplicitAny`, ни `strictPropertyInitialization`, при требовании AGENTS.md «strict type checking». `moduleResolution: "Node"` — легаси |
| LEAD-3 | `.nvmrc` против `package.json:18` | закреплённый Node `24.11.1` **ниже** заявленного `engines.node: ">=24.16"`; замаскировано `engine-strict=false` |
| LEAD-4 | `package.json:48` | `xlsx` ставится с `https://cdn.sheetjs.com/...` как рантайм-зависимость публикуемой библиотеки — вне `yarn npm audit` и Dependabot, и каждая установка у потребителя зависит от этого CDN |

</details>

## P3 — гигиена

<details>
<summary>93 находки</summary>

**Конфигурация** — CFG-005 неякорный `'dist'` в `modulePathIgnorePatterns` скрывает от резолвера Jest 4
настоящих исходника (проверено); CFG-006 нет `testPathIgnorePatterns`, поэтому голый `npx jest` заходит в
`.claude/`, `tmp/`, `coverage/`; CFG-007 `transformIgnorePatterns` теряет разрешение пресета для
`@angular/common/locales`; CFG-008 мёртвый алиас `@koobiq/cli` на несуществующий `packages/cli/index.ts`
(проверено), который заодно сажает битый `moduleNameMapper` в Jest; CFG-009 SSR-правило линта не применяется
к публикуемому `components-experimental`; CFG-010 голый `// eslint-disable-next-line no-restricted-globals`
разрешён (используется в 6 файлах), потому что `eslint-comments/require-description` выключен, а локальный
`const window = inject(KBQ_WINDOW)` обходит правило затенением; CFG-011 билдер
`@koobiq/builders:typescript` не используется, имеет недостижимую ветку ошибки и незакавыченный,
непортируемый вызов `tsc`; CFG-012 «Packaging done!» печатается после провалившейся сборки ng-packagr;
CFG-013 нет ни списка `files`, ни `.npmignore` — чистота содержимого пакета держится только на масках
активов `**/*.scss`; CFG-014 `CSS.supports`, зашитый в `false`, и пустышка `ResizeObserver` делают
продуктовые ветки недостижимыми в тестах; CFG-015 `core/testing` является публичным рантайм-API
`@koobiq/components/core` (CDK держит аналог в отдельной точке входа); CFG-016 cspell покрывает только
`**/*.md`; CFG-017 кэш сборки Angular отключён на весь воркспейс, а `budgets` нет **нигде**, включая
публикуемый бандл документации.

**CI** — CI-11 `npmAuditExcludePackages` упоминается в двух воркфлоу и печатается в еженедельный issue, но в
`.yarnrc.yml` его нет; CI-12 гейты слэш-команд используют `contains`, а `e2e.yml:75` содержит саму команду
текстом, поэтому цитирующий ответ запускает пуш с правом записи; CI-13 ни у одного PR-воркфлоу нет
`concurrency` — вытесненные 60-минутные прогоны e2e продолжаются, а preview-деплои гонятся за один канал;
CI-14 `docs-stable.yml` зашивает мажор в фильтр тегов, `docs-next.yml` единственный с `read-all`, у второго
шага `pr-notify.yml` нет защиты первого, и у пяти воркфлоу нет `timeout-minutes`.

**API и схематики** — API-004 ратчет `any` сканирует один жёстко заданный каталог (сейчас 547 = 547 точно);
API-007 `deprecated-icons/schema.json` дублирует `$id` из `new-icons-pack`; API-018 `extract-release-notes`
ищет версию подстрокой, поэтому `20.3.0` может подхватить секцию `20.3.0-rc.1`; API-019 две CI-задачи
публикации пропускают `checkReleaseConfiguration()`; API-020 `concat(undefined)` печатает голое `undefined`
под ошибками уровня пакета.

**core** — CORE-A-014 опциональность `KBQ_DATE_LOCALE` расходится между адаптерами, а `!` маскирует null;
CORE-A-015 токен опций luxon несёт имя и JSDoc от moment-токена, поэтому ошибки DI указывают не на тот
пакет; CORE-A-016 `Intl.NumberFormat.call(this, …)`; CORE-A-017 JSDoc `getFormattedSizeParts` неверен и по
аргументу, и по результату; CORE-A-018 25 спек используют форму `useClass: KbqLocaleService`, которую и
гайд, и регрессионный тест называют сломанной; CORE-A-019 `createDate` расходится между адаптерами на
полуночном переходе DST *(needs-verification)*; CORE-B-09 `setActiveInWrapMode` предполагает `|delta| === 1`,
поэтому постраничная навигация при `withWrap()` попадает куда угодно; CORE-B-10 сообщение «window is not
available» у `KBQ_WINDOW` недостижимо, потому что вычисление голого `window` бросает раньше (проверено);
CORE-B-11 `isMac()` читает сырой `navigator` под подавлением линта; CORE-B-12 конструктор
`KbqColorDirective` вызывает собственный сеттер `@Input` до того, как подклассы выставят `defaultColor`, —
шесть компонентов обходят это двойным присваиванием; CORE-B-13 `optional: true` в паре с `!` и последующим
использованием без проверки превращает подготовленное сообщение об ошибке в невнятный `TypeError`;
CORE-B-14 девять вызовов `Renderer2.setStyle` получают `overlayRef?.overlayElement`, что в Angular 20
бросает на null; CORE-B-15 кеш ширины скроллбара проверяет истинность, поэтому настоящий `0`
перезамеряется вечно (принудительный reflow на macOS и на сервере); CORE-B-16 у `ListKeyManager` нет
`destroy()`, а `activeItem` может вернуть `undefined` вопреки типу `T | null`.

**Компоненты** — SEL-16 автокомплит теряет Home/End/PageUp/PageDown; SEL-17 tree-select восстанавливает
прокрутку не на том элементе; OVL-19 `KbqModalTitle`/`Body`/`Footer` и `KbqDropdownTrigger` инжектят классы
хостов вместо существующих узких токенов (AGENTS.md); OVL-20 мёртвые остатки миграции — пустой
`viewChildren('autoFocusedButton')` и `isTrapFocus` в notification-center, не привязанный ни к чему; FB-10
`onChangeFilter` — публичный output, который не может эмититься, и два JSDoc отправляют к нему потребителей;
FB-13 изменения инпута `kbqPipe` игнорируются после первой отрисовки; FB-14 захардкоженные `Ctrl + ` и `⌘`
вне конфигурации локали; FB-15 незащищённый `this.values.filter` в двух пайпах *(needs-verification)*;
FRM-019 `startWith()` без аргументов — пустышка, поэтому первичная проверка надёжности пароля не выполняется;
FRM-020 правило с `:has()` перебивает сброс отступа префикса, удваивая отступ у мультиселекта с префиксом;
FRM-021 `selectionStart = null` бросает для `type="number"` *(needs-verification)*; FRM-022 локальная зона
перетаскивания подсвечивается в отключённом состоянии; DT-17 двузначный год `00` превращается в 2001;
DT-18 ввод разделителя локали трактуется как некорректный ввод; DT-19 нижняя граница календаря по умолчанию
— **февраль** 1900, поэтому январь 1900 недостижим; DT-20 правки стрелками ограничиваются `minDate`/`maxDate`
вопреки разделению, которое документирует эта же ветка; DT-21 копия маскирующего движка датапикера в
таймпикере потеряла защиту `readOnly` и обработку букв при вставке; SWP-11 имена слотов подставляются в
регулярку без экранирования; SWP-12 `renderer.addClass` на `parentElement`, который может быть null;
SWP-13 пять компонентов без `OnPush` (`accordion-content`, `accordion-trigger`, `kbq-dt`, `kbq-dd`,
`navbar-brand` — проверено); SWP-14 подписка с `delay(0)` без `takeUntilDestroyed`; SWP-15 `setTimeout` без
`clearTimeout` в `ellipsis-center` и `clamped-text`; SWP-16 `destroyRef.onDestroy` регистрируется внутри
перезапускающегося колбэка, накапливая устаревшие замыкания; SWP-17 CSS-значение `<time>` разбирается как
голое число миллисекунд, поэтому `1.2s` тихо ломает волну скелетона, а пустое значение пишет `NaNms`;
SWP-18 `detectChanges()` внутри собственного эффекта компонента; SWP-19 таймер запасного закрытия
actions-panel не сбрасывается при отсоединении оверлея; SWP-20 глобальный шорткат `[`/`]` у сайдбара
срабатывает внутри `contenteditable`.

**SCSS** — SCSS-003 мёртвый `--kbq-autocomplete-size-panel-padding`, к тому же неверно описывающий
поставляемое значение; SCSS-004 два по-настоящему неопределённых токена отступов чекбокса без fallback
(IACVT → 0); SCSS-005 неопределённый `--kbq-tree-size-toggle-padding` с `FIXME` на месте, схлопывающий
область нажатия раскрывашки; SCSS-006 `border-style: solid` без ширины на внутреннем круге радио,
залатанный избыточным `!important`, который блокирует переопределение; SCSS-007 `kbq-palette` определена
в `_theming.scss` дважды, вторая молча затеняет первую, из-за чего `kbq-contrast` недостижима;
SCSS-008 девять пометок `@deprecated … unused` на функциях, которые вызывают оба публичных конструктора
темы; SCSS-009 три токена, отсутствующих выше по цепочке и отслеживаемых только комментариями в коде;
SCSS-010 86 токенов со значением-литералом `null`, из-за которых `color: inherit` перебивает тему
highlight.js у потребителя; SCSS-011 шесть публично реэкспортируемых миксинов без единого вызова;
SCSS-012 избыточная маска активов в `ng-package.json` без списка исключений.

**Документация** — DOC-14 уровни заголовков расходятся между локалями в одинаковых позициях
(`accordion:57`, `breadcrumbs:84`, `tooltip:81`, `icon-button`, `popover`, `date-formatter.ru.md:182`), а
`anchors.component.ts:229` выводит вложенность якорей из класса заголовка, поэтому дерево якорей отличается
по локалям; DOC-15 `examples.validation.ru.md` рисует три секции жирным текстом там, где EN использует
`###`, и якорей не появляется; DOC-16 `tools/region-parser/` — мёртвый код: ноль ссылок снаружи и ноль
маркеров `docregion` во всех 580 примерах; DOC-17 оба файла `examples.search-expandable.{en,ru}.md`
**нулевого размера** и при этом подаются в задачу сборки контента; DOC-18 шесть примеров собираются и не
упоминаются ни в одном `.md`, включая канонические `inline-edit-overview` и `link-overview`; DOC-19 в 742
файлах `docs-examples` есть кириллические литералы, поэтому английские страницы примеров показывают русский
текст — системно, отмечено один раз.

**Доступность** — A11Y-TABS-002 стрелки пагинации табов недостижимы с клавиатуры; A11Y-RADIO-001
`role="radiogroup"` без доступного имени; A11Y-BREADCRUMBS-002 селектор в форме элемента ставит
`aria-label` на `generic` *(needs-verification)*.

**Тесты** — TST-14 27 постоянно отключённых тестов в 11 файлах, 9 из них в `tag-list.component.spec.ts`, ни
один не связан с задачей; TST-15 в `sidebar.spec.ts` есть `xit` с закомментированной проверкой,
неутверждаемый `jest.fn()` и мёртвый флаг `showContainer`; TST-16 25 Playwright-спек не проверяют ничего,
кроме пары скриншотов; TST-17 `dispatchMouseEvent(el, 'touchstart')` там, где двумя строками ниже лежит
`dispatchTouchEvent`; TST-18 `describe(KbqUsernamePipe.name)` оборачивает `KbqUsernameCustomPipe`;
TST-19 базлайны `actions-panel` без ведущего нуля (`1-light.png`), и у одного состояния нет тёмной пары.

**Собственный проход ведущего** — в `tools/api-extractor/config.json` `button-toggle` перечислен дважды
(65 записей, 64 уникальных — проверено; в остальном покрытие полное); `tsconfig.json:93` отображает
`@koobiq/components/vertical-navbar` на несуществующий каталог, и его никто не импортирует;
`stripInternal: false` означает, что единственный `@internal`-член библиотеки
(`core/overlay/shadow-dom-overlay-container.ts:54`) входит в охраняемую публичную поверхность
(`core.api.md:4163`) — аннотация в этом репозитории не действует; `.firebaserc` объявляет хостинг-таргет
`v16`, которого нет в `firebase.json`; `.opencode/` отсутствует и в `.gitignore`, и в игнорах ESLint, в
отличие от `.ai` и `.claude`; `jest.config.js:23` задаёт глобальный `testTimeout: 2000`, тесный для
компонентных тестов Angular; в рабочем дереве лежат 9 мусорных `.log` в корне, включая файл с именем
`C:UsersAdminAppDataLocalTempcheck-api.log` (все игнорируются, ни один не отслеживается — проверено).

</details>

---

## Проверено и чисто

Записано, чтобы это не перепроверяли заново:

- **Автоматические гейты.** `yarn run eslint`, `stylelint`, `prettier` и `cspell` проходят на этом дереве —
  всё найденное выше лежит за пределами того, что ловят инструменты.
- **Жёсткие запреты AGENTS.md.** Ноль `ngClass`, `ngStyle`, `@HostBinding`, `@HostListener` и
  `standalone: true` в `packages/components`. Семь совпадений `*ngIf` — внутри **комментариев** миграции;
  четыре вызова `new Date(` настоящие, но ограничены `core/common-behaviors/read-state.ts`,
  `core/datetime/timezone.ts` и `notification-center.service.ts` (см. LEAD-1).
- **SSR.** Единственный «голый» браузерный глобал в библиотеке — `breadcrumbs/utils.ts:37,44`, и он под
  явным подавлением линта. `scrollbar/scrollbar.ts` оказался ложным срабатыванием: он затеняет `window`
  инжектом `KBQ_WINDOW`. Всё остальное идёт через `KBQ_WINDOW`/`DOCUMENT`;
  `accordion/accordion-state-store.ts` — образцовая реализация.
- **Секреты.** Секретоподобных строк в отслеживаемых файлах нет. Все 12 сторонних GitHub Actions запинены
  по SHA. Каждый `${{ github.event.* }}`, доходящий до `run:`, проходит через `env:` — sink для инъекции отсутствует.
- **Содержимое публикуемого пакета.** `e2e.ts`, `*.spec.ts`, `*.playwright-spec.ts` и 234 базлайна PNG
  **не** уезжают: в `ng-package.json` активы это только `**/*.scss`, `tsconfig.lib.json` ставит `types: []`,
  и в `dist/components` их нет. (Исключение получается побочно, а не гарантируется — CFG-013.)
- **Достоверность API-guard.** 63 из 64 компонентов побайтово совпадают со снапшотами; ратчет `any` точен
  (547 = 547) и не может тихо сползти вверх. Вывод точки входа через `.replace()` в `api-extractor.ts`
  прогнан по всем 65 записям — **0** расхождений; `button-toggle` и `split-button` в порядке.
- **Схематики.** Все 18 записей `migrations.json` имеют каталог и разрешимую фабрику; шесть лишних каталогов
  — это generate-схематики `collection.json` по замыслу; у всех 24 есть спека, схема и README; диапазоны
  версий сходятся с тегом `20.2.0`.
- **SCSS.** Из 901 используемой `--kbq-*` по-настоящему мертвы **4** (SCSS-004, SCSS-005); остальные
  резолвятся в `@koobiq/design-tokens`, ставятся из TypeScript в рантайме или являются документированными
  точками расширения. Асимметрии светлой и тёмной темы нет. Ровно два захардкоженных цвета, оба намеренные.
  Удвоения альфы ни на одном из 16 мест с `-1px` нет.
- **Соответствие документации и API.** Все `[input]`/`(output)`, описанные для `select`, `datepicker`,
  `filter-bar`, `tree`, `list`, `form-field` и `tags`, резолвятся по снапшотам — неверны только `button` и
  две страницы `progress-*`. Все 151 упомянутый идентификатор `Kbq*` резолвится.
- **Prerender-маршруты синхронны.** Независимо выведено из `structure.ts`: 86 элементов, 195 путей на
  локаль → `1 + 2×195 + 1 = 392`, ровно столько строк и закоммичено. `seo-descriptions.ts` тоже сходится по
  87 идентификаторам без сирот в обе стороны. 580 каталогов примеров ↔ 580 ключей модуля, расхождения имён
  только два (DOC-13).
- **`empty-state-actions2` намеренный**, а не забытая копия: ссылка есть в обеих локалях, пара с
  `empty-state-actions` сделана, чтобы противопоставить два действия трём. Не удалять.
- **Базлайны скриншотов.** Все 234 сходятся со своими литералами `toHaveScreenshot` — ни сирот, ни
  пропусков. Стенд тултипа не обрезается.
- **Не-находки по жизненному циклу.** `nested-tree-control.ts`, `flat-data-source.ts` и
  `tree-option.component.ts` используют `take(1)` и не текут; `QueryList.changes` завершается при
  уничтожении представления; отсутствие `ngOnDestroy` у `KbqAutoHideScrollStrategy` не течь, потому что CDK
  вызывает `disable()`; `sidepanel-ref` и `actions-panel-ref` не текут. `modal-control.service.ts` течёт
  (OVL-02, OVL-15).
- **Удачные решения.** `playwright.docs.config.ts` правильно спредит базовый конфиг вместо вложения;
  `resolveWorkers()` закрывает дыру с `NaN` («зелёный набор, который ничего не проверил»); Dockerfile для
  e2e запинен по digest и проверяет шрифты и браузеры; решение о `--latest` через `sort -V` корректно; все
  три подавленных advisory в `.yarnrc.yml` до сих пор законны (сверено с `yarn.lock`).
- **Ветка.** `git merge-tree` показывает `fix/DS-3055` чистой против `origin/main`; ничего в main не трогает
  `packages/components/datepicker`. Ни AI-подписей, ни `debugger`, ни сфокусированных тестов не добавлено ни
  на этой ветке, ни на одной из `review/*`. Правка спеки на `datepicker.spec.ts:1149` исправляет тест,
  который проходил по неверной причине: `DateTime.local(2009, 11, 31)` — это 31 ноября, то есть *невалидная* дата.

---

## Рекомендуемый порядок работ

1. **CI-01** — единственная находка с формой безопасности. Один воркфлоу, четыре строки.
2. **CFG-001** — вернуть `jest-fail-on-console` раньше всего остального: он вскроет падения, которые набор
   до сих пор скрывал.
3. **API-008 / API-009** — changelog молча теряет 11 стоящих в очереди ломающих изменений; чинить до релиза.
4. **TST-01 · TST-02 · TST-03**, затем 21 место с `expect(spy).not.toHaveBeenCalled()` — тест, узаконивающий
   дефект, хуже отсутствующего.
5. **Пять P0 по доступности.** Сначала `kbq-select` (самый нагруженный, и рабочий образец лежит рядом в
   `list-selection`), затем календарь и раскрывашка дерева — это отказы уровня A по клавиатуре. Добавлять
   проверку `jest-axe` к каждому компоненту по мере починки.
6. **DOC-01 · DOC-02** — пять префиксов ссылок и два ключа примеров, ответ в обоих случаях лежит в парном
   RU-файле. Дальше DOC-03/04/05: EN-страницы `button` и `progress-*` выдают читателю примеры, которые не
   компилируются или ничего не рисуют.
7. **Однострочные баги корректности:** DT-03, DT-04, DT-15, SEL-03, SWP-04, SWP-05, FRM-005, FRM-006,
   API-016, API-017, LEAD-1.
8. **SWP-01** — санитизировать markdown или сделать обход явным опт-ином.
9. **BR-01** — переименовать коммит датапикера либо починить ловушку с полуночным `max` в библиотеке.
10. Остальное по важности; семейство утечек (CORE-B-03/04/05, OVL-03/04/05, SEL-06/07/08) стоит делать одним
    проходом — у них одна форма.

---

## Приложение — метод

Шестнадцать ревьюеров работали параллельно по непересекающимся доменам, каждый только на чтение, и каждый был
обязан дать `file:line`, цитату-доказательство, конкретный сценарий отказа и предлагаемую правку. Ни одному
ревьюеру не разрешалось запускать сборку, тесты или линтеры — это делал ведущий, последовательно, и все
четыре гейта проходят.

Каждая находка P0 и P1 затем перечитывалась ведущим в исходнике перед попаданием в отчёт, а случайная
выборка P2/P3 проверялась на то, что номера строк не поехали. Не выдержавшее проверку удалялось, а не
понижалось в важности — один случай стоит записать: первичный grep по репозиторию пометил
`scrollbar/scrollbar.ts` как нарушение SSR, а чтение файла показало, что он намеренно затеняет `window`
инжектом токена.

Два независимых ревьюера сошлись на одном и том же дефекте якоря shift-клика с разных сторон
(`CORE-B-01` — со стороны key-manager'а, `SEL-01` — со стороны select'а); это самое сильное одиночное
подтверждение в отчёте.

`origin/main` за время ревью дважды продвинулся (`b665e5037` → `c33811a5e`); расстояние ветки везде указано
относительно конечного состояния.
