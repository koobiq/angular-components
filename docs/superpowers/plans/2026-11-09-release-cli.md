# DS-2067 — Release CLI Improvements: план реализации

> **Для агентных исполнителей:** REQUIRED SUB-SKILL: использовать superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для пошагового исполнения. Шаги отмечены чекбоксами (`- [ ]`).

**Goal:** Довести `@koobiq/cli` до боевого состояния: тесты на разбор аргументов и чистую логику, автоматическая проверка форматов сборки, фиксы из ревью аргументов и контрибьюторский гайд.

**Architecture:** Точечные правки без смены сборщика. `cli.ts` рефакторится в тестируемый `createCliProgram(): Command`; логика команд остаётся в switch. Проверка сборки — отдельный Node-скрипт в конце `build:cli`. Гайд — обычный numbered-док `docs/guides/09-cli.md` (в MCP и сайт не попадает, т.к. `INTERNAL = /^\d{2}-/` фильтрует numbered-гайды).

**Tech Stack:** TypeScript (Node 24, CJS), Commander 15, Vitest (project `node`), rollup (без изменений), Node-скрипт без зависимостей.

**Spec:** `docs/superpowers/specs/2026-11-09-release-cli-design.md`

## Global Constraints

- `engines`: Node ≥24.16, npm ≥11, yarn ≥4.
- `rollup.config.js` и `tsconfig.release.json` не трогать.
- Публичная поверхность CLI (`koobiq-cli <action> [options]` и флаги `-p -d -c -t -n -w -o -r --package-name`) не меняется.
- Коммиты: scope `cli`, в subject `(#DS-2067)`; комментарии в коде и тексты коммитов — на английском.
- Гайд и все комментарии в `docs/guides` — на английском.
- Тесты запускаются `yarn run unit:cli`; линт/формат — `yarn run eslint`, `yarn run prettier`, `yarn run cspell`.

## Review Focus

1. Неизвестная/опечатанная команда не должна молча завершаться с кодом 0 — тест в Task 1.
2. Каждый флаг, на который полагаются CI соседних репозиториев, сохраняет свою короткую букву и смысл (`-n -w -o` больше не конфликтуют) — тест в Task 1.
3. Собранный пакет обязан грузиться и через `require`, и через ESM `import` на Node ≥24 — проверка в Task 5.
4. `resolve-npm-tag` должен печатать в stdout только сам тег (его ловят в `TAG=$(...)`) — тест в Task 4.
5. Гайд не должен разойтись с реальным набором команд/флагов — шаг сверки в Task 6 (grep 7 имён команд по `createCliProgram`).

---

### Task 1: Ревью аргументов + тестируемый `cli.ts`

**Files:**

- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/bin/cli`
- Test: `packages/cli/src/cli.spec.ts`

**Interfaces:**

- Produces: `export function createCliProgram(): Command` — строит программу Commander (имя, описание, 8 флагов, `arguments('<action>')`, `addHelpText('after', ...)`, action-dispatch со switch и `default` → `program.error(..., { exitCode: 1 })`); не вызывает `parse`.
- Produces: `export function runCliCommands(argv: string[] = process.argv): void` — `dotenvConfig({ quiet: true })`, затем `createCliProgram().parse(argv)`.
- Consumes: существующие 7 классов задач (`StageReleaseTask`, `StageReleaseCommitTask`, `PublishReleaseCITask`, `PublishReleaseFromDistTask`, `PublishReleaseCIGitlabTask`, `PublishReleaseCIGithubTask`, `ResolveNpmTagTask`).

- [ ] **Шаг 1: Написать падающие тесты** `packages/cli/src/cli.spec.ts`.

Вверху файла `vi.mock` все семь модулей задач так, чтобы экспортируемый класс был конструктором, записывающим полученный `options` в переменную, а `run` был `vi.fn()` (иначе `parse` валидной команды полезет в fs/сеть). Тесты:

```ts
it('should name the program koobiq-cli');
// assert createCliProgram().name() === 'koobiq-cli'

it('should list every action in --help');
// parse(['node','koobiq-cli','--help']) с exitOverride + configureOutput(запись в переменную);
// '--help' завершается выходом 0, поэтому с exitOverride это CommanderError(exitCode 0) —
// поймать его и проверить записанный stdout
// assert текст содержит 'stage-commit', 'publish-ci', 'publish-dist',
//        'publish-ci-gitlab', 'publish-ci-github', 'resolve-npm-tag', 'stage'

it('should reject an unknown action with exit code 1');
// parse(['node','koobiq-cli','frobnicate']) → expect(...).toThrow(CommanderError)
// assert error.exitCode === 1 и message содержит 'frobnicate'

it('should map every flag into the task config');
// parse(['node','koobiq-cli','stage','-p','/proj','-d','/dist','-c','scope','-t','next',
//        '-n','-w','-o','owner','-r','repo'])
// assert мок StageReleaseTask получил options с
//   projectDir:'/proj', distDir:'/dist', changelogScope:'scope', tagName:'next',
//   withoutReferences:true, withoutNotification:true, repoOwner:'owner', repoName:'repo'

it('should keep the -n, -w and -o short flags distinct');
// тот же parse, что выше; assert без исключения конфликта флагов и что все три значения разошлись
//   по своим полям (withoutReferences / withoutNotification / repoOwner)

it('should fall back to the env vars for the defaults');
// до вызова задать process.env: RELEASE_PROJECT, RELEASE_DIST, CHANGELOG_SCOPE, REPO_OWNER, REPO_NAME
// parse(['node','koobiq-cli','stage']) → assert мок получил эти значения в projectDir/distDir/...
```

- [ ] **Шаг 2: Запустить и убедиться, что падают.**

Run: `npx vitest run --project node packages/cli/src/cli.spec.ts`
Expected: FAIL (нет `createCliProgram`, программа не называется, unknown action не бросает).

- [ ] **Шаг 3: Реализовать `createCliProgram` и `runCliCommands` в `packages/cli/src/cli.ts`.**

Вынести `ROOT_DIR`/`DIST_DIR` внутрь функции (считать в момент вызова, чтобы тесты меняли `process.env`). Добавить `program.name('koobiq-cli')`, `program.description('Koobiq release management CLI')`, `addHelpText('after', COMMANDS)` со списком 7 команд (по одной строке на команду с описанием). В `default`-ветке switch — `program.error(\`error: unknown action '\${action}'.\n\n\${COMMANDS}\`, { exitCode: 1 })`. В конце файла заменить безусловный вызов на `if (require.main === module) { runCliCommands(); }`.

- [ ] **Шаг 4: Обновить `packages/cli/bin/cli`** — `require('../dist/cli.js')` → `require('../dist/cli.js').runCliCommands();`.

- [ ] **Шаг 5: Запустить тесты и убедиться, что проходят.**

Run: `yarn run unit:cli`
Expected: PASS (включая новый spec).

- [ ] **Шаг 6: Commit.**

```bash
git add packages/cli/src/cli.ts packages/cli/bin/cli packages/cli/src/cli.spec.ts
git commit -m "fix(cli): name the program, list actions in help and error on unknown action (#DS-2067)"
```

---

### Task 2: Юнит-тесты version-name

**Files:**

- Test: `packages/cli/src/release/version-name/create-version.spec.ts`
- Test: `packages/cli/src/release/version-name/publish-branches.spec.ts`

**Interfaces:**

- Consumes: `createNewVersion(version: Version, releaseType: ReleaseType): Version` из `create-version.ts`; `parseVersionName` из `parse-version.ts`; `getSemverVersionType`, `getAllowedPublishBranches` из `publish-branches.ts`.

- [ ] **Шаг 1: Написать тесты.**

`create-version.spec.ts` (строить вход через `parseVersionName('1.2.3')!`):

```ts
it('should create a patch version'); // 1.2.3 + 'patch' → format() === '1.2.4'
it('should create a minor version'); // 1.2.3 + 'minor' → '1.3.0'
it('should create a major version'); // 1.2.3 + 'major' → '2.0.0'
it('should bump the prerelease number'); // 1.2.3-rc.1 + 'bump-prerelease' → '1.2.3-rc.2'
it('should drop the prerelease label on a normal release'); // 1.2.3-rc.1 + 'patch' → '1.2.4'
it('should make a stable release from a prerelease'); // 1.2.3-rc.1 + 'stable-release' → '1.2.3'
```

`publish-branches.spec.ts`:

```ts
it('should classify a version as major/minor/patch'); // 1.0.0→'major', 1.2.0→'minor', 1.2.3→'patch'
it('should publish a major only from master'); // getAllowedPublishBranches(1.0.0) → ['master']
it('should publish a minor from its line branch'); // getAllowedPublishBranches(1.2.0) → ['1.2.x']
it('should publish a patch from its line branch'); // getAllowedPublishBranches(1.2.3) → ['1.2.x']
```

- [ ] **Шаг 2: Запустить и убедиться, что падают.**

Run: `npx vitest run --project node packages/cli/src/release/version-name`
Expected: FAIL (файлов нет).

- [ ] **Шаг 3: Запустить и убедиться, что проходят.**

Run: `yarn run unit:cli`
Expected: PASS.

- [ ] **Шаг 4: Commit.**

```bash
git add packages/cli/src/release/version-name
git commit -m "test(cli): cover version creation and publish-branch selection (#DS-2067)"
```

---

### Task 3: Юнит-тесты release-output

**Files:**

- Test: `packages/cli/src/release/release-output/output-validations.spec.ts`
- Test: `packages/cli/src/release/release-output/check-packages.spec.ts`

**Interfaces:**

- Consumes: `checkReleaseBundle`, `checkTypeDefinitionFile`, `checkKoobiqPackage` из `output-validations.ts`; `checkReleasePackage` из `check-packages.ts`.

- [ ] **Шаг 1: Написать тесты** (tmp-каталоги через `mkdtempSync`/`rmSync`, как в `extract-release-notes.spec.ts`).

`output-validations.spec.ts`:

```ts
it('should flag sourcemap references in component styles'); // bundle со строками 'styles: ["...sourceMappingURL=..."]' → 1 failure
it('should pass a bundle without sourcemap references'); // чистый bundle → []
it('should allow a type import of an existing relative path'); // .d.ts с import('./exists') при существующем файле → []
it('should flag a type import of a missing relative path'); // import('./missing') → failure
it('should flag an absolute type import path'); // import('/abs/path') → failure
it('should pass a koobiq package with prebuilt themes'); // prebuilt-themes/*.css + _theming.scss → []
it('should flag a koobiq package without prebuilt themes'); // пустой prebuilt-themes → failure
```

`check-packages.spec.ts`:

```ts
it('should accept a complete package'); // bundles/pkg.js + **/*.d.ts + LICENSE + README.md → true
it('should reject a package missing LICENSE'); // → false
it('should reject a package missing README.md'); // → false
it('should reject a package whose bundle has a sourcemap ref'); // → false
it('should run koobiq-specific checks only for the koobiq package'); // packageName 'koobiq' без _theming.scss → false
```

- [ ] **Шаг 2: Запустить и убедиться, что падают.**

Run: `npx vitest run --project node packages/cli/src/release/release-output`
Expected: FAIL.

- [ ] **Шаг 3: Запустить и убедиться, что проходят.**

Run: `yarn run unit:cli`
Expected: PASS.

- [ ] **Шаг 4: Commit.**

```bash
git add packages/cli/src/release/release-output
git commit -m "test(cli): cover the release-output validations (#DS-2067)"
```

---

### Task 4: Юнит-тест `resolve-npm-tag`

**Files:**

- Test: `packages/cli/src/release/resolve-npm-tag.spec.ts`

**Interfaces:**

- Consumes: `ResolveNpmTagTask` из `resolve-npm-tag.ts`; `resolveNpmDistTag` из `npm/resolve-npm-dist-tag.ts` (мокать).

- [ ] **Шаг 1: Написать тесты.** Мокать `vi.mock('fs', { spy: true })` (как в `extract-release-notes.spec.ts`), `vi.mock('./npm/resolve-npm-dist-tag')`, и `vi.spyOn(process, 'exit').mockImplementation(...)` + шпионы на `console.error`/`console.log`.

```ts
it('should require --package-name'); // нет packageName → process.exit(1), stderr содержит '--package-name'
it('should fail on an unreadable package.json'); // readFileSync throws → exit 1
it('should fail when package.json has no version'); // '{}' → exit 1
it('should fail on an unparseable version'); // version 'not-semver' → exit 1
it('should print only the resolved tag'); // readFileSync → '{"version":"21.0.0"}', resolveNpmDistTag mock → 'v21-lts';
// assert console.log вызван ровно с 'v21-lts' и exit не вызван
```

- [ ] **Шаг 2: Запустить и убедиться, что падает.**

Run: `npx vitest run --project node packages/cli/src/release/resolve-npm-tag.spec.ts`
Expected: FAIL.

- [ ] **Шаг 3: Запустить и убедиться, что проходит.**

Run: `yarn run unit:cli`
Expected: PASS.

- [ ] **Шаг 4: Commit.**

```bash
git add packages/cli/src/release/resolve-npm-tag.spec.ts
git commit -m "test(cli): cover the resolve-npm-tag command (#DS-2067)"
```

---

### Task 5: Проверка форматов сборки

**Files:**

- Create: `packages/cli/scripts/verify-build-output.js`
- Modify: `package.json` (скрипт `build:cli`)

**Interfaces:**

- Produces: скрипт без аргументов, exit 0 при успехе / exit 1 с понятным сообщением при нарушении.

- [ ] **Шаг 1: Написать `verify-build-output.js`** (plain Node CJS, только `fs`/`path`/`url`). Проверяет финальную раскладку `dist/cli/`:
    - `bin/cli` существует, начинается с `#!/usr/bin/env node` и содержит `require('../dist/cli.js')`;
    - `dist/cli.js` существует, не пуст (порог размера > 100 КБ), содержит `"use strict"` и `require(` (CJS);
    - `dist/release/index.js` и `dist/release/index.d.ts` существуют (точка входа + типы);
    - `package.json` в `dist/cli/` имеет `version` равный версии корневого `package.json` (не `{{VERSION}}`);
    - `require()` точки `dist/cli/dist/release/index.js` возвращает функции `extractReleaseNotes`, `parseTag`, `resolveChangelogPath`;
    - динамический `import()` той же точки (file URL) даёт namespace с теми же тремя экспортами (ESM-interop CJS-сборки).

- [ ] **Шаг 2: Добавить вызов в `package.json`.** В `build:cli` после `node ./packages/cli/scripts/copy-meta-to-dist.js` добавить ` && node ./packages/cli/scripts/verify-build-output.js`.

- [ ] **Шаг 3: Проверить на реальной сборке.**

Run: `yarn run build:cli`
Expected: exit 0, в конце `CLI build output OK`.

- [ ] **Шаг 4: Убедиться, что скрипт ловит регрессию.**

Временно удалить `dist/cli/dist/release/index.d.ts`, перезапустить только `node ./packages/cli/scripts/verify-build-output.js`, ожидать exit 1; затем вернуть файл и пересобрать.

- [ ] **Шаг 5: Commit.**

```bash
git add packages/cli/scripts/verify-build-output.js package.json
git commit -m "chore(cli): verify the built package layout and module formats (#DS-2067)"
```

---

### Task 6: Гайд по CLI

**Files:**

- Create: `docs/guides/09-cli.md`
- Modify: `docs/guides/00-contributing.md` (пункт списка + link-ref)
- Modify: `docs/guides/05-releasing-packages.md` (ссылка на гайд)
- Modify: `packages/cli/README.md` (убрать WIP-баннер)

**Interfaces:**

- Consumes: финальный список команд/флагов из `createCliProgram()` (Task 1).

- [ ] **Шаг 1: Написать `docs/guides/09-cli.md`** (на английском): что такое `@koobiq/cli` и для кого (maintainer-only), установка, таблица 7 команд с примерами, таблица флагов + env-эквиваленты (`RELEASE_PROJECT`, `RELEASE_DIST`, `CHANGELOG_SCOPE`, `REPO_OWNER`, `REPO_NAME`), секция про `@koobiq/cli/release` (`extractReleaseNotes`, `parseTag`, `resolveChangelogPath`). Каноничный справочник по пакету — `packages/cli/README.md`, гайд на него ссылается; ссылка на `05-releasing-packages.md` — за полным workflow.

- [ ] **Шаг 2: Сверить с реальным CLI.** После `yarn run build:cli` выполнить `node dist/cli/bin/cli --help` и `grep` — все 7 команд гайда должны совпадать с именами `case` в `createCliProgram()`.

- [ ] **Шаг 3: Связать документы.** В `00-contributing.md` добавить пункт `Release CLI` → `./09-cli.md` и link-ref; в `05-releasing-packages.md` после первого упоминания `release:stage:commit` добавить ссылку на гайд; в `README.md` только убрать строку `🚧 WIP...`. Ссылочное направление — гайд → README, а не наоборот.

- [ ] **Шаг 4: Проверка.**

Run: `yarn run cspell` и `yarn run prettier` (Markdown-части)
Expected: без ошибок в новых/изменённых файлах.

- [ ] **Шаг 5: Commit.**

```bash
git add docs/guides/09-cli.md docs/guides/00-contributing.md docs/guides/05-releasing-packages.md packages/cli/README.md
git commit -m "docs(cli): add the release CLI guide (#DS-2067)"
```

---

### Task 7: Финальная проверка

- [ ] **Шаг 1: Полный прогон.**

```bash
yarn run build:cli
yarn run unit:cli
yarn run eslint
yarn run prettier
yarn run cspell
yarn run check-mcp-data
```

Expected: всё зелёное; `check-mcp-data` не задет (numbered-гайд `09-cli.md` фильтруется `INTERNAL = /^\d{2}-/`).

- [ ] **Шаг 2: Итоговый коммит-ревью и PR.** PR title: `feat(cli): harden the release CLI — tests, build checks, argument review and guide (#DS-2067)`. Заполнить PR template (summary, notable changes, что ревьюеру смотреть).
