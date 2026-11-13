# DS-2067 — Доработка CLI: дизайн

## Intent / зачем

`@koobiq/cli` уже несёт реальные релизные сценарии — `release:stage:commit` в этом репозитории
и `resolve-npm-tag` в CI соседних репозиториев koobiq, — но в README он всё ещё «WIP», тестов на
разбор аргументов нет, аргументы содержат баги (неизвестная команда молча выходит с кодом 0),
форматы сборки ничем не проверяются, а гайда нет. DS-2067 закрывает это четырьмя направлениями.

## Goals

1. Тесты: покрыть `cli.ts` (разбор аргументов) и непокрытую чистую логику — `create-version`,
   `publish-branches`, `output-validations`, `check-packages`, `resolve-npm-tag`.
2. Форматы сборки: добавить скрипт проверки собранного пакета (CJS, типы release-точки,
   interop `require`/`import`) в конец `build:cli`.
3. Ревью аргументов: починить найденное — имя программы, перечисление команд в `--help`,
   ошибка на неизвестную команду.
4. Гайд: контрибьюторский `docs/guides/09-cli.md` (вариант Б).

## Non-goals

- Не менять сборщик: rollup остаётся (идея замены — отдельная задача `new-tasks/cli-build-bundler.md`).
- Не добавлять ESM/dual-форматы.
- Не реструктурировать CLI в сабкоманды commander — риск сломать вызовы из CI соседних репозиториев.
- Не публиковать гайд на koobiq.io (вариант Б).

## Anti-goals (провал)

- Сломать вызовы из CI соседних репозиториев (напр. `TAG=$(koobiq-cli resolve-npm-tag --package-name ...)`).
- Проверка сборки, падающая на чистом чек-ауте (не должна зависеть от устаревшего `dist/`).
- Гайд, который дублирует `05-releasing-packages.md` или устаревает сразу.

## Constraints

- `engines`: Node ≥24.16, npm ≥11, yarn ≥4.
- `rollup.config.js` и `tsconfig.release.json` не трогаем.
- Scope коммита `cli`, в subject `(#DS-2067)`.
- Контрибьюторский гайд — на английском, в формате остальных numbered-гайдов (`NN-name.md`).

## Approaches (что рассматривали)

- Гайд: гайд сайта (`cli.{en,ru}.mdx` + structure.ts + MCP + регенерация метаданных) против
  контрибьюторского `09-cli.md` → выбрали контрибьюторский (Б): дешевле, без обвязки сайта и MCP.
- Сборка: rollup / Vite / tsc-без-бандла → оставили rollup; замену вынесли в отдельную задачу.
- Ревью аргументов: точечные фиксы против сабкоманд commander → точечные фиксы (безопасно для CI).

## Решения (how)

- `cli.ts`: вынести создание программы в экспортируемый `createCliProgram()`, добавить
  `runCliCommands(argv = process.argv)`, автозапуск только через `require.main === module`;
  `name('koobiq-cli')`, список команд в `addHelpText('after', ...)`, `default`-ветка switch →
  `program.error(..., { exitCode: 1 })`. `bin/cli` вызывает `.runCliCommands()` явно.
- Проверка сборки: `packages/cli/scripts/verify-build-output.js`, добавляется в конец `build:cli`
  (в CI попадает через `build-packages` → `build:cli`).
- Гайд: `docs/guides/09-cli.md`; ссылки из `00-contributing.md` и `05-releasing-packages.md`;
  в `README.md` убрать WIP-баннер и сослаться на гайд.

## Что оставлено сборщику

- Тексты и структура гайда, формулировки сообщений об ошибках, порядок и сценарии тестов.
