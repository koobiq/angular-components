# Localized Docs Examples (DS-4922) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Roll the docs-examples localization mechanism out so every example re-renders when the footer's "examples language" picker changes, translating `ru-RU` and falling back to English, with the chosen language carried in `?examples-lang=`.

**Architecture:** Each component's `l10n.ts` is self-contained: its own copy of `injectLocalizedText<T>()`, its own `ExampleText` + `injectExampleText()`. The docs app's `DocsLanguagePreferences` reads `?examples-lang` on startup and writes it back when the picker changes.

**Tech Stack:** Angular (zoneless, signals), the koobiq `KbqLocaleService`, the docs `DocsNavbarProperty`/`DocsLocaleService` plumbing, Vitest.

**Spec:** [docs/superpowers/specs/2026-11-09-localized-examples-design.md](../specs/2026-11-09-localized-examples-design.md)

## Global Constraints

- Relative imports in examples may cross folders within the component's entry point (`../l10n`); the generator `tools/example-module/resolve-local-imports.ts` records them in `localImportFiles`, and StackBlitz normalizes `..`.
- A shared file across components is not buildable: each component folder is its own ng-packagr secondary entry point, so each `l10n.ts` keeps its own copy of `injectLocalizedText`.
- Locale ids: `ru-RU` (library default), `en-US`, `es-LA`, `pt-BR`, `tk-TM`. Only `ru-RU` + English `default` are translated.
- After adding/renaming any example file or a relative import, run `yarn run build:docs-examples-module` to regenerate `example-module.ts` and `loader/index.ts`.
- Code comments and commits are in English; docs and translations are Russian/English.

## Review Focus

1. A query param naming an unknown locale (`?examples-lang=zz-ZZ`) must be ignored, not crash or activate a bogus locale — pin in Task 3.
2. Changing the examples language must re-render live examples (the `computed` reads the locale signal) — pin in Task 1's spec.
3. The refactor must keep every existing example compiling in StackBlitz (`../l10n` ends up in `localImportFiles`) — verify by regenerating the module and asserting the import is listed in Task 2.
4. Storage blocked (`SecurityError`) must not blank the app even now that query params are read — existing `preferences.spec.ts` test still passes in Task 3.
5. `l10n.ts` must not appear as a source tab (they are `localImportFiles`, not `files`) — asserted by the generator output in Task 2.

---

### Task 1: ~~Shared `i18n.ts` helper~~ — dropped

A shared helper file imported via a relative path (`../i18n`) is not buildable: each component folder of `docs-examples` is its own ng-packagr secondary entry point, and a relative import crossing that boundary fails `yarn run build:docs-examples` with `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`. A separate `@koobiq/docs-examples/components/i18n` entry point with an alias import builds fine (verified), but the alias is unresolvable for the StackBlitz writer and the MCP indexer without special cases, so each `l10n.ts` keeps its own copy of the helper (approach 1 in the design doc). The commit that added the shared helper (`bc845af4f`) is reverted.

---

### Task 2: Rename existing `localized-data.ts` files (per-component helper stays)

**Files:**

- Rename (4): `packages/docs-examples/components/{navbar,app-switcher,filter-bar,notification-center}/localized-data.ts` → `l10n.ts`
- Modify: the imports in every example `.ts` of those 4 components (`'../localized-data'` → `'../l10n'`)

**Interfaces:**

- Produces: unchanged per-component exports — `injectExampleText()` (navbar, app-switcher, notification-center) and `injectLocalizedPeriods()` (filter-bar). Each `l10n.ts` keeps its own copy of `injectLocalizedText`.

- [ ] **Step 1: Rename the 4 files**

Run: `git mv packages/docs-examples/components/navbar/localized-data.ts packages/docs-examples/components/navbar/l10n.ts` (repeat for `app-switcher`, `filter-bar`, `notification-center`).

- [ ] **Step 2: Rewire the imports in the examples**

Change `from '../localized-data'` → `from '../l10n'` in the examples of the 4 components (both `injectExampleText` and `injectLocalizedPeriods` / `injectLocalizedText` imports).

- [ ] **Step 3: Regenerate the module and loader**

Run: `yarn run build:docs-examples-module`

- [ ] **Step 4: Assert the shared file is recorded**

Verify in `packages/docs-examples/example-module.ts` that the examples of the 4 components list `"../l10n.ts"` in their `localImportFiles`.

- [ ] **Step 5: Build the examples package**

Run: `yarn run build:docs-examples`
Expected: builds without errors.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-examples/components packages/docs-examples/example-module.ts packages/docs-examples/loader/index.ts
git commit -m "docs(examples): rename localized-data to l10n (#DS-4922)"
```

---

### Task 3: Persist the examples language in `?examples-lang=`

**Files:**

- Modify: `apps/docs/src/app/constants/locale.ts` (add the param name constant)
- Modify: `apps/docs/src/app/services/preferences.ts`
- Modify: `apps/docs/src/app/services/preferences.spec.ts`

**Interfaces:**

- Consumes: `Router` (root), `Location`, `KBQ_LOCALE_SERVICE`, `DocsLocaleService`.
- Produces: `DOCS_EXAMPLES_LANG_PARAM = 'examples-lang'`.

- [ ] **Step 1: Write the failing tests** in `apps/docs/src/app/services/preferences.spec.ts`

Extend `configure()` to also provide a `Router` mock (as in `locale.spec.ts`):

```ts
import { DefaultUrlSerializer, Router } from '@angular/router';

let router: { navigate: Mock; parseUrl: (url: string) => ReturnType<DefaultUrlSerializer['parse']> };

// inside configure(), after the existing providers:
const serializer = new DefaultUrlSerializer();
router = { navigate: vi.fn(), parseUrl: (url: string) => serializer.parse(url) };
// add: { provide: Router, useValue: router }
```

Add these tests:

```ts
it('prefers the examples language from the query param', () => {
    configure('/examples/select-overview?examples-lang=ru-RU');
    const preferences = create();
    expect(setExamplesLocale).toHaveBeenLastCalledWith('ru-RU');
    expect(preferences.examplesLanguageSwitch.currentValue.id).toBe('ru-RU');
});

it('ignores an unknown examples language in the query param', () => {
    configure('/examples/select-overview?examples-lang=zz-ZZ');
    const preferences = create();
    expect(preferences.examplesLanguageSwitch.currentValue.id).toBe(
        TestBed.inject(KBQ_LOCALE_SERVICE).locales.items[0].id
    );
});

it('writes the examples language to the query param when it changes', () => {
    configure('/examples/select-overview');
    const preferences = create();
    const ruIndex = preferences.examplesLanguageSwitch.data.findIndex(({ id }) => id === 'ru-RU');

    preferences.examplesLanguageSwitch.setValue(ruIndex);

    expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { 'examples-lang': 'ru-RU' },
        queryParamsHandling: 'merge'
    });
});
```

- [ ] **Step 2: Run the spec to see it fail**

Run: `npx vitest run apps/docs/src/app/services/preferences.spec.ts`
Expected: FAIL — `Router` not provided / the param is ignored and not written.

- [ ] **Step 3: Add the constant** in `apps/docs/src/app/constants/locale.ts`

```ts
export const DOCS_EXAMPLES_LANG_PARAM = 'examples-lang';
```

- [ ] **Step 4: Read the param on startup** in `apps/docs/src/app/services/preferences.ts`

Inject `Router` next to `Location`. After `examplesLanguageSwitch` is created, before the subscriptions, apply the query param:

```ts
const queryLocale = this.getExamplesLocaleFromQuery();
const queryIndex = queryLocale ? this.examplesLanguageSwitch.data.findIndex(({ id }) => id === queryLocale) : -1;

if (queryIndex >= 0) {
    this.examplesLanguageSwitch.setValue(queryIndex);
}
```

Add the private helper:

```ts
private getExamplesLocaleFromQuery(): string | null {
    const value = this.router.parseUrl(this.location.path()).queryParams[DOCS_EXAMPLES_LANG_PARAM];

    return typeof value === 'string' && this.localeService.locales.items.some(({ id }) => id === value) ? value : null;
}
```

- [ ] **Step 5: Write the param on change** in the same file

Add a second subscription (after the existing `examplesLanguageSwitch.changes` subscription):

```ts
this.examplesLanguageSwitch.changes.pipe(distinctUntilKeyChanged('value'), skip(1)).subscribe(({ value: { id } }) => {
    this.router.navigate([], {
        queryParams: { [DOCS_EXAMPLES_LANG_PARAM]: id },
        queryParamsHandling: 'merge'
    });
});
```

Add `skip` to the `rxjs` import.

- [ ] **Step 6: Run the spec to see it pass**

Run: `npx vitest run apps/docs/src/app/services/preferences.spec.ts`
Expected: PASS (existing tests still pass, including the storage-blocked one).

- [ ] **Step 7: Type-check the specs**

Run: `yarn run check-spec-types`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/src/app/constants/locale.ts apps/docs/src/app/services/preferences.ts apps/docs/src/app/services/preferences.spec.ts
git commit -m "docs: persist the examples language in the URL query (#DS-4922)"
```

---

### Task 4: Localize the `button` examples (pilot)

**Files:**

- Create: `packages/docs-examples/components/button/l10n.ts`
- Modify: every `packages/docs-examples/components/button/**/*-example.ts` that shows text

**Interfaces:**

- Produces: a local copy of `injectLocalizedText` (copied from an existing `l10n.ts`, e.g. navbar's), `ExampleText` (shape below) and `injectExampleText(): Signal<ExampleText>`.

- [ ] **Step 1: Create `button/l10n.ts`** — self-contained: copy `injectLocalizedText` from `navbar/l10n.ts`, then:

```ts
import { Signal } from '@angular/core';

export interface ExampleText {
    button: string;
    buttonText: string;
    archive: string;
    report: string;
    snooze: string;
    add: string;
    minus: string;
    plus: string;
    more: string;
    diamond: string;
}

export const injectExampleText = (): Signal<ExampleText> =>
    injectLocalizedText<ExampleText>({
        'ru-RU': {
            button: 'Кнопка',
            buttonText: 'Текст кнопки',
            archive: 'Архив',
            report: 'Отчёт',
            snooze: 'Отложить',
            add: 'Добавить',
            minus: 'Минус',
            plus: 'Плюс',
            more: 'Ещё',
            diamond: 'Ромб'
        },
        default: {
            button: 'Button',
            buttonText: 'Button text',
            archive: 'Archive',
            report: 'Report',
            snooze: 'Snooze',
            add: 'Add',
            minus: 'Minus',
            plus: 'Plus',
            more: 'More',
            diamond: 'Diamond'
        }
    });
```

The style/slot demo labels (`Filled Contrast`, `Icon+Text`, `Slots (order-independent)`, …) are demo metadata mirroring koobiq API names; leave them in English.

- [ ] **Step 2: Rewire the button examples**

In each example that renders text, add `protected readonly text = injectExampleText();` and replace the hardcoded strings in the template with `{{ text().<key> }}` / `[attr.aria-label]="text().<key>"`. Replace `'Archive' | 'Report' | 'Snooze'` data arrays with a computed that maps over `text().archive` / `text().report` / `text().snooze`. Replace `Кнопка` with `text().button`, `Текст кнопки` with `text().buttonText`, and the `aria-label` values `Add`/`Minus`/`Plus`/`More`/`Diamond` with the matching keys.

- [ ] **Step 3: Regenerate the module**

Run: `yarn run build:docs-examples-module`

- [ ] **Step 4: Build and type-check**

Run: `yarn run build:docs-examples && yarn run check-spec-types`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-examples/components/button packages/docs-examples/example-module.ts packages/docs-examples/loader/index.ts
git commit -m "docs(examples): localize the button examples (#DS-4922)"
```

---

### Task 5: Localize the `validation` examples (pilot)

**Files:**

- Create: `packages/docs-examples/components/validation/l10n.ts`
- Modify: every `packages/docs-examples/components/validation/**/*-example.ts` (and the one `.html`) that shows text

**Interfaces:**

- Produces: a local copy of `injectLocalizedText` (copied from an existing `l10n.ts`, e.g. navbar's), `ExampleText` (shape below) and `injectExampleText(): Signal<ExampleText>`.

- [ ] **Step 1: Create `validation/l10n.ts`**

`ExampleText` keys and translations (English `default` = the string; `ru-RU` = the translation):

| key                   | ru-RU                                           | default                                            |
| --------------------- | ----------------------------------------------- | -------------------------------------------------- |
| name                  | Имя                                             | Name                                               |
| lastName              | Фамилия                                         | Last name                                          |
| surname               | Фамилия                                         | Surname                                            |
| patronymic            | Отчество                                        | Patronymic                                         |
| address               | Адрес                                           | Address                                            |
| comment               | Комментарий                                     | Comment                                            |
| email                 | Эл. почта                                       | Email                                              |
| username              | Имя пользователя                                | Username                                           |
| number                | Номер                                           | Number                                             |
| series                | Серия                                           | Series                                             |
| estimation            | Оценка                                          | Estimation                                         |
| requestReason         | Причина запроса                                 | Request reason                                     |
| folderName            | Имя папки                                       | Folder name                                        |
| confirmNewPassword    | Подтвердите новый пароль                        | Confirm new password                               |
| currentPassword       | Текущий пароль                                  | Current password                                   |
| newPassword           | Новый пароль                                    | New password                                       |
| validFrom             | Действует с                                     | Valid from                                         |
| validUntil            | Действует до                                    | Valid until                                        |
| ipv4Address           | IPv4-адрес                                      | IPv4-address                                       |
| errorAboveHint        | Сообщение об ошибке отображается над подсказкой | The error message appears above the hint           |
| errorReplacesHint     | Сообщение об ошибке заменяет подсказку          | The error message replaces the hint                |
| required              | Обязательно                                     | Required                                           |
| optional              | Необязательно                                   | Optional                                           |
| min5                  | Минимум 5 символов                              | Minimum 5 characters                               |
| min8                  | Минимум 8 символов                              | Minimum 8 characters                               |
| max20                 | Максимум 20 символов                            | Maximum 20 characters                              |
| passwordsDoNotMatch   | Пароли не совпадают                             | Passwords do not match                             |
| passwordTooSimilar    | Новый пароль слишком похож на текущий           | The new password is too similar to the current one |
| passwordMustDiffer    | Новый пароль должен отличаться от текущего      | The new password must differ from the current one  |
| periodEndBeforeStart  | Конец периода не может быть раньше его начала   | The end of the period must not precede its start   |
| hintUnderField        | Подсказка под полем                             | Hint under the field                               |
| onlyLettersAndNumbers | Только буквы и цифры                            | Only letters and numbers                           |
| onlyLatinLetters      | Только латинские буквы                          | Provide only latin letters                         |
| invalidIp             | IP-адрес не соответствует стандарту RFC         | The IP address does not comply with RFC standards  |
| checkingWithServer    | Проверка на сервере…                            | Checking with the server…                          |
| submit                | Отправить                                       | Submit                                             |
| save                  | Сохранить                                       | Save                                               |
| changePassword        | Сменить пароль                                  | Change password                                    |
| openEmptyForm         | Открыть пустую форму                            | Open empty form                                    |
| openDraft             | Открыть черновик                                | Open draft                                         |
| newTag                | Новый тег...                                    | New tag...                                         |

Expose them via `injectExampleText(): Signal<ExampleText>` using `injectLocalizedText<ExampleText>({ 'ru-RU': { … }, default: { … } })`.

- [ ] **Step 2: Rewire the validation examples**

For each example, add `protected readonly text = injectExampleText();` and replace the hardcoded `<kbq-label>`, `<kbq-error>`, `<kbq-hint>`, placeholder and button text with `{{ text().<key> }}`. `validation-message-global-with-links-example.html` is a separate template — apply the same replacements there.

- [ ] **Step 3: Regenerate the module**

Run: `yarn run build:docs-examples-module`

- [ ] **Step 4: Build and type-check**

Run: `yarn run build:docs-examples && yarn run check-spec-types`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-examples/components/validation packages/docs-examples/example-module.ts packages/docs-examples/loader/index.ts
git commit -m "docs(examples): localize the validation examples (#DS-4922)"
```

---

## Rollout backlog (after the pilots)

The remaining components follow the Task 4/5 recipe one component (or small group) at a time, each as its own commit/PR:

1. Scan the component's examples for hardcoded user-facing strings (labels, buttons, placeholders, hints, errors, list/table data).
2. Create `l10n.ts` with a local copy of `injectLocalizedText` (from an existing one, e.g. navbar's), `ExampleText` + `injectExampleText()` (ru-RU + English `default`).
3. Rewire each example to read from `text()` instead of hardcoded strings.
4. Run `yarn run build:docs-examples-module`, then `yarn run build:docs-examples && yarn run check-spec-types`.
5. Verify visually in the docs dev server that switching the footer "examples language" re-renders the example, and that "Open in StackBlitz" still compiles.
