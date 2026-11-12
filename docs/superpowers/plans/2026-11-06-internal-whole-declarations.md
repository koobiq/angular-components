# `@internal` Only for Whole Declarations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Запретить `@internal` на членах типов, перевести существующие 62 члена классов на `@docs-private` и сохранить целостность опубликованных typings.

**Architecture:** Сначала TDD-добавление ESLint-запрета и обновление правил, затем механическая миграция JSDoc без изменения runtime-кода. Сборка и API guard определяют, какие целые типы дополнительно обязаны остаться в `.d.ts`; сгенерированные снимки обновляются только для затронутых entry points.

**Tech Stack:** TypeScript, Angular, ESLint/`eslint-plugin-jsdoc`, Vitest, ng-packagr, API Extractor, Yarn 4.

**Spec:** [2026-11-06-internal-whole-declarations-design.md](../specs/2026-11-06-internal-whole-declarations-design.md)

## Global Constraints

- `@internal` разрешён только на целых declarations; для членов типов используется `@docs-private`.
- Не менять runtime-код, шаблоны, DI, видимость членов TypeScript и кооперацию классов.
- Не увеличивать baseline `any`/`unknown`; не запускать `approve-public-api-any` автоматически.
- Не редактировать вручную `tools/public_api_guard/**` и baseline-файлы.
- Новых зависимостей нет; Node соответствует `.nvmrc`, пакетный менеджер — Yarn.
- Кодовые комментарии и commit messages — на английском; ESLint в CI работает с `--max-warnings=0`.
- Не включать в коммит изменения вне перечисленных путей. Если во время выполнения появятся чужие изменения, не редактировать и не stage их; если они влияют на общий check, не утверждать их API/baseline-изменения, а сообщить пользователю.
- Каждый коммит собирать только по явно перечисленным путям; перед коммитом проверять `git diff --cached --name-only`.

## Review Focus

- Восстановленная сигнатура ссылается на целый `@internal`-тип: тип обязан остаться валидным в `.d.ts`; проверяется Task 2, Steps 4–6.
- Восстановление члена добавляет `any`/`unknown`: публичная поверхность не должна стать менее типизированной; проверяется Task 2, Step 8.
- Override с `@docs-private` не должен удалять или искажать унаследованный контракт: проверяется сборкой и просмотром `core.api.md`/`popover.api.md` в Task 2, Step 7.
- Именованный реэкспорт скрытой целой сущности может оставить dangling export: должен падать build/API Extractor, а не уйти потребителю; проверяется Task 2, Steps 4 и 6.
- AST-варианты abstract/parameter/interface/enum members и private/`#private` не должны обходить запрет или получать две diagnostics: проверяется Task 1, Steps 1–4.

---

### Task 1: ESLint-запрет и согласованные правила

**Files:**

- Modify: `tools/eslint/jsdoc.ts`
- Test: `tools/eslint/jsdoc.spec.ts`
- Modify: `tools/check-api-docs/index.ts:86-89`
- Modify: `.claude/rules/components.md:14-16`
- Add to this commit: `docs/superpowers/specs/2026-11-06-internal-whole-declarations-design.md`
- Add to this commit: `docs/superpowers/plans/2026-11-06-internal-whole-declarations.md`

**Interfaces:**

- Consumes: существующий `publishedJsDocConfig`, `extraRuleDefinitions.forbid` и helper `restrictedSyntax()` из spec.
- Produces: правило `jsdoc/forbid-internal-tag-on-member` с сообщением ``Use `@internal` only on a whole declaration; use `@docs-private` to keep a member in typings but out of the docs.`` Task 2 использует его как integration-check отсутствия старых тегов.

- [ ] **Step 1: Добавить failing-тесты на члены типов и допустимые целые сущности**

В `tools/eslint/jsdoc.spec.ts` добавить параметризованный тест `reports @internal on a member of a type`. Каждый case содержит один declaration с `/** @internal */` и ожидает ровно одно сообщение нового правила:

```ts
it.each([
    ['public method', 'export class A { /** @internal */ method(): void {} }'],
    ['protected property', 'export class A { /** @internal */ protected value = 1; }'],
    ['accessor', 'export class A { /** @internal */ get value(): number { return 1; } }'],
    ['abstract method', 'export abstract class A { /** @internal */ abstract method(): void; }'],
    [
        'parameter property',
        'export class A { constructor(/** @internal */ public value: string) {} }'
    ],
    ['interface member', 'export interface A { /** @internal */ value: string; }'],
    ['type literal member', 'export type A = { /** @internal */ method(): void };'],
    ['enum member', 'export enum A { /** @internal */ Value }']
])('reports @internal on a %s', async (_name, code) => {
    expect(await restrictedSyntax(code)).toEqual([
        expect.stringContaining('Use `@internal` only on a whole declaration')
    ]);
});
```

Добавить тест `accepts @internal on whole declarations and @docs-private on members`: целые class/interface/enum/type/function/const с `@internal` и public/protected method/property с `@docs-private` возвращают `[]` из `restrictedSyntax()`.

Расширить существующий private-member тест случаями `/** @internal */ private value = 1` и `/** @internal */ #value = 1`: для каждого остаётся ровно одно сообщение `A private member is not in the docs anyway`, без сообщения нового правила.

- [ ] **Step 2: Запустить spec и подтвердить причину падения**

Run:

```bash
npx vitest run --project node tools/eslint/jsdoc.spec.ts
```

Expected: FAIL только потому, что member-cases с `@internal` пока возвращают `[]`; допустимые целые сущности не должны быть причиной падения.

- [ ] **Step 3: Реализовать `internal-tag-on-member` в `tools/eslint/jsdoc.ts`**

Добавить в `extraRuleDefinitions.forbid` правило `internal-tag-on-member` и зарегистрировать `'jsdoc/forbid-internal-tag-on-member': 1`. Использовать comment selector `JsdocBlock:has(JsdocTag[tag="internal"])` и следующий context, чтобы private/`#private` остались зоной существующего правила:

```text
:matches(PropertyDefinition, MethodDefinition, AccessorProperty, TSAbstractPropertyDefinition, TSAbstractMethodDefinition, TSAbstractAccessorProperty, TSParameterProperty, TSPropertySignature, TSMethodSignature, TSIndexSignature, TSCallSignatureDeclaration, TSConstructSignatureDeclaration, TSEnumMember):not([accessibility="private"]):not([key.type="PrivateIdentifier"])
```

Description правила: `Disallows @internal on a member of a class, interface, type literal or enum.` Message использовать ровно из Interfaces. Autofix не добавлять.

- [ ] **Step 4: Подтвердить зелёный targeted spec**

Run:

```bash
npx vitest run --project node tools/eslint/jsdoc.spec.ts
```

Expected: PASS всех cases, включая отсутствие двойных diagnostics для private/`#private` и отсутствие сообщений на целых declarations.

- [ ] **Step 5: Привести правила и подсказку check-api-docs к новой границе**

В `.claude/rules/components.md` зафиксировать:

- `@internal` удаляет только целую внутреннюю сущность и не ставится на члены типов;
- `@docs-private` — единственный hiding-tag для членов, которые обязаны остаться в typings;
- сохранить существующие ограничения entry points, `implements`, structural typing, named re-exports и breaking changes.

В `tools/check-api-docs/index.ts` изменить подсказку так, чтобы `@internal` предлагался только `for a whole declaration`; вариант `@docs-private` оставить для членов. Не менять логику подсчёта.

- [ ] **Step 6: Проверить formatting и lint изменённых инструментов**

Run:

```bash
npx prettier --check tools/eslint/jsdoc.ts tools/eslint/jsdoc.spec.ts tools/check-api-docs/index.ts .claude/rules/components.md docs/superpowers/specs/2026-11-06-internal-whole-declarations-design.md docs/superpowers/plans/2026-11-06-internal-whole-declarations.md
npx eslint tools/eslint/jsdoc.ts tools/eslint/jsdoc.spec.ts tools/check-api-docs/index.ts --max-warnings=0
```

Expected: обе команды PASS. Если Prettier указывает формат, применить `npx prettier --write` только к этим же путям и повторить проверку.

- [ ] **Step 7: Зафиксировать правило и тесты**

```bash
git add tools/eslint/jsdoc.ts tools/eslint/jsdoc.spec.ts tools/check-api-docs/index.ts .claude/rules/components.md docs/superpowers/specs/2026-11-06-internal-whole-declarations-design.md docs/superpowers/plans/2026-11-06-internal-whole-declarations.md
git diff --cached --name-only
git commit -m "feat(components): restrict internal tags to whole declarations"
```

Expected: в staged-списке только шесть перечисленных файлов; чужих `flat-tree-control*` нет.

### Task 2: Миграция существующих членов и опубликованных typings

**Files:**

- Modify: `packages/components/accordion/accordion-content.directive.ts`
- Modify: `packages/components/accordion/accordion-header.ts`
- Modify: `packages/components/accordion/accordion-trigger.directive.ts`
- Modify: `packages/components/button-toggle/button-toggle.component.ts`
- Modify: `packages/components/checkbox/checkbox.ts`
- Modify: `packages/components/core/option/action.ts`
- Modify: `packages/components/core/option/option.ts`
- Modify: `packages/components/core/overlay/overlay-layer.ts`
- Modify: `packages/components/core/overlay/shadow-dom-overlay-container.ts`
- Modify: `packages/components/core/pop-up/pop-up-trigger.ts`
- Modify: `packages/components/datepicker/datepicker-toggle.component.ts`
- Modify: `packages/components/divider/divider.component.ts`
- Modify: `packages/components/dropdown/dropdown-item.component.ts`
- Modify: `packages/components/dropdown/dropdown.component.ts`
- Modify: `packages/components/filter-bar/pipes/tree-select-pipe-base.ts`
- Modify: `packages/components/flag/flag.ts`
- Modify: `packages/components/icon/icon-registry.ts`
- Modify: `packages/components/icon/icon.component.ts`
- Modify: `packages/components/list/list-selection.component.ts`
- Modify: `packages/components/modal/modal.component.ts`
- Modify: `packages/components/navbar/navbar-item.component.ts`
- Modify: `packages/components/notification-center/notification-center.service.ts`
- Modify: `packages/components/popover/popover.component.ts`
- Modify: `packages/components/radio/radio.component.ts`
- Modify: `packages/components/search-expandable/search-expandable.ts`
- Modify: `packages/components/select/select.component.ts`
- Modify: `packages/components/sidepanel/sidepanel-container.component.ts`
- Modify: `packages/components/sidepanel/sidepanel-animations.ts`
- Modify: `packages/components/tags/tag.component.ts`
- Modify: `packages/components/toggle/toggle.component.ts`
- Modify: `packages/components/tree-select/tree-select.component.ts`
- Modify only when required by a restored signature: another whole declaration currently marked `@internal`
- Generate for the 22 affected entry points only: `tools/public_api_guard/components/{accordion,button-toggle,checkbox,core,datepicker,divider,dropdown,filter-bar,flag,icon,list,modal,navbar,notification-center,popover,radio,search-expandable,select,sidepanel,tags,toggle,tree-select}.api.md`

**Interfaces:**

- Consumes: `jsdoc/forbid-internal-tag-on-member` из Task 1.
- Produces: каждый из 62 текущих class members остаётся в `.d.ts` с `@docs-private`; целые типы, необходимые их сигнатурам, также остаются в `.d.ts`. Runtime API и поведение не меняются.

- [ ] **Step 1: Подтвердить failing integration-check до миграции**

Run:

```bash
npx eslint packages/components --max-warnings=0
```

Expected: exit 1 ровно из-за 62 существующих `jsdoc/forbid-internal-tag-on-member`; других новых нарушений нет.

- [ ] **Step 2: Заменить теги у всех 62 членов классов**

В 30 исходных файлах из Files заменить `@internal` на `@docs-private` только в JSDoc членов классов. Сохранить описания, расположение тега последним и formatting. Не менять modifiers, signatures или тела.

В `packages/components/sidepanel/sidepanel-animations.ts` дополнительно перевести целые `KbqSidepanelAnimationState` и `KbqSidepanelAnimationEvent` на `@docs-private`: они нужны восстановленным `animationState`, `animationStateChanged` и `setAnimationState()`. Оставить `kbqSidepanelTransformAnimation` с `@internal`.

- [ ] **Step 3: Подтвердить отсутствие запрещённых member-тегов**

Run:

```bash
npx eslint packages/components --max-warnings=0
```

Expected: PASS; это одновременно проверяет, что у всех 62 членов заменён тег и не пропущены члены других поддерживаемых AST-форм.

- [ ] **Step 4: Собрать components**

Run:

```bash
yarn run build:components
```

Expected: PASS. Если сборка называет ещё целый `@internal`-тип, необходимый восстановленной сигнатуре, перевести только этот тип на `@docs-private` и повторить build. Не конвертировать независимые внутренние сущности.

- [ ] **Step 5: Проверить опубликованные typings**

Run:

```bash
yarn run check-typings
```

Expected: PASS с `skipLibCheck: false`. Для каждой diagnostics о missing/stripped type применить то же правило из Step 4, повторить build и этот check. Не обходить ошибку через `skipLibCheck` или удаление члена.

- [ ] **Step 6: Сгенерировать API-снимки только затронутых entry points**

Run последовательно:

```bash
for entry_point in accordion button-toggle checkbox core datepicker divider dropdown filter-bar flag icon list modal navbar notification-center popover radio search-expandable select sidepanel tags toggle tree-select; do
    yarn run approve-api "components/$entry_point" || exit 1
done
```

Expected: API Extractor успешно обновляет только 22 перечисленных `.api.md`; `tree.api.md` и снимки остальных entry points не перезаписываются. Если Step 4/5 выявил зависимость в другом entry point, добавить его явно после просмотра.

- [ ] **Step 7: Просмотреть API diff**

Run:

```bash
git diff -- tools/public_api_guard/components
```

Expected: восстановлены именно members с заменённым тегом и необходимые типовые зависимости; нет `tree`-изменений, случайных сущностей или удаления унаследованных контрактов. Отдельно проверить `core.api.md`, `popover.api.md` и `sidepanel.api.md`.

- [ ] **Step 8: Проверить ratchet `any`/`unknown`**

Run:

```bash
yarn run check-public-api-any
```

Expected: PASS без роста. При росте сузить новый публичный тип существующим точным типом без runtime-изменений, затем повторить Steps 4–8. Не запускать `approve-public-api-any` для утверждения роста. При shrink или влиянии чужого `tree` остановиться и сообщить пользователю, не записывая глобальный baseline.

- [ ] **Step 9: Проверить документационный manifest**

Run:

```bash
yarn run docs:api-gen
yarn run check-api-docs
```

Expected: PASS; члены с `@docs-private` не появились на API-вкладке, baseline не изменился. Не запускать `approve-api-docs` вместо разбора расхождения.

- [ ] **Step 10: Запустить полные покрывающие проверки**

Run независимые проверки последовательно, без параллельных тяжёлых процессов:

```bash
yarn run unit:tools
yarn run eslint
yarn run prettier
yarn run check-api
```

Expected: все команды PASS без warnings. `check-api` не должен показывать неутверждённые изменения в 22 entry points. Если единственное расхождение вызвано чужим `tree`, не утверждать его; зафиксировать это как внешний blocker и показать пользователю.

- [ ] **Step 11: Проверить состав diff перед коммитом**

Run:

```bash
git diff --check
git status --short
```

Expected: нет whitespace-ошибок, логов или случайных generated-файлов. Чужие `flat-tree-control.ts` и `flat-tree-control.spec.ts` остаются без изменений и не будут staged.

- [ ] **Step 12: Зафиксировать миграцию и API-снимки**

Добавить ровно 31 исходный файл из Files (30 member-файлов плюс `sidepanel-animations.ts`) и 22 golden file; любые дополнительные зависимости из Steps 4–6 перечислить явно после review. Не использовать `git add packages/components` или `git add -A`.

```bash
git add \
    packages/components/accordion/{accordion-content.directive,accordion-header,accordion-trigger.directive}.ts \
    packages/components/button-toggle/button-toggle.component.ts \
    packages/components/checkbox/checkbox.ts \
    packages/components/core/option/{action,option}.ts \
    packages/components/core/overlay/{overlay-layer,shadow-dom-overlay-container}.ts \
    packages/components/core/pop-up/pop-up-trigger.ts \
    packages/components/datepicker/datepicker-toggle.component.ts \
    packages/components/divider/divider.component.ts \
    packages/components/dropdown/{dropdown-item,dropdown}.component.ts \
    packages/components/filter-bar/pipes/tree-select-pipe-base.ts \
    packages/components/flag/flag.ts \
    packages/components/icon/{icon-registry,icon.component}.ts \
    packages/components/list/list-selection.component.ts \
    packages/components/modal/modal.component.ts \
    packages/components/navbar/navbar-item.component.ts \
    packages/components/notification-center/notification-center.service.ts \
    packages/components/popover/popover.component.ts \
    packages/components/radio/radio.component.ts \
    packages/components/search-expandable/search-expandable.ts \
    packages/components/select/select.component.ts \
    packages/components/sidepanel/{sidepanel-container.component,sidepanel-animations}.ts \
    packages/components/tags/tag.component.ts \
    packages/components/toggle/toggle.component.ts \
    packages/components/tree-select/tree-select.component.ts
git add tools/public_api_guard/components/{accordion,button-toggle,checkbox,core,datepicker,divider,dropdown,filter-bar,flag,icon,list,modal,navbar,notification-center,popover,radio,search-expandable,select,sidepanel,tags,toggle,tree-select}.api.md
git diff --cached --name-only
git commit -m "feat(components): keep class members in published typings"
```

Expected: staged diff содержит только миграцию, необходимые зависимости и соответствующие снимки; чужих `tree`-файлов нет.
