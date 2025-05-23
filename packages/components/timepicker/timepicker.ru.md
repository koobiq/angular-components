Поле с временем (таймпикер) — это специальное поле ввода, которое позволяет вводить только время.

### Когда использовать

Используйте, когда нужно указать время.

<!-- example(timepicker-validation-symbols) -->

### Структура компонента

Состоит из поля ввода, маски и иконки (опционально).

<div style="margin-top: 15px;">
<img src="./assets/images/timepicker/timepicker-structure.jpg" alt="timepicker structure" width="338"/>
</div>

#### Вариации

Маска ввода бывает в двух вариациях, с разными форматами времени:

<!-- example(timepicker-variations) -->

### Описание работы

Время можно вводить двумя способами: с помощью клавиш цифр и с помощью клавиш стрелок на клавиатуре. Ввод времени допустим только в 24-часовом формате.

При вводе значений, в зависимости то того, в каком месте (часы, минуты или секунды) установлен фокус, поле в этом месте выполняет проверку на допустимые значения: часы 0–23, минуты и секунды 0–59.

После ввода двух цифр (часы или минуты) подставляется двоеточие, каретка перескакивает в следующую часть маски (в минуты или в секунды). После ввода двух цифр секунд каретка не меняет своего положения, двоеточие не подставляется.

#### Ввод с помощью стрелок

Клавиши ↑ ↓ увеличивают или уменьшают выделенную единицу времени на 1. Увеличение (уменьшение) затрагивает только выделенную единицу (например, в часах за 23 следует 0, и наоборот).

Подробнее про ввод см. в разделе <a target="_self" href="#%D1%84%D0%BE%D0%BA%D1%83%D1%81-%D0%B8-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0-%D1%81-%D0%BA%D0%BB%D0%B0%D0%B2%D0%B8%D0%B0%D1%82%D1%83%D1%80%D0%BE%D0%B9">Фокус и работа с клавиатурой</a>.

#### Состояние по умолчанию

В большинстве случаев поле пустое, показана только маска ввода. В других случаях, когда указание времени неважно для пользователя, но важно для системы, будет полезным поле предзаполнить текущим временем (под текущим понимается время открытия страницы, оно не меняется динамически).

### Валидация

#### Проверка во время ввода

##### Ввод букв и символов

Срабатывает [валидация во время ввода значений](/ru/other/validation/overview#во-время-ввода-значения):

- при вводе букв в любую часть маски;
- при вводе первого символа, кроме цифр.

<!-- example(timepicker-validation-symbols) -->

##### Ввод символов и цифр

Если после ввода двух цифр (в часы или минуты) вводится любой символ кроме цифр и букв, поле игнорирует этот ввод.

Если после ввода одной цифры (в часы или минуты) вводится любой символ кроме цифр и букв, поле воспринимает этот символ как разделитель и преобразует его в двоеточие, а перед введенной цифрой подставляется ноль.

Если ввести значения больше 23 для часов и больше 59 для минут и секунд, они преобразуются в 23 для часов и 59 для минут и секунд.

<!-- example(timepicker-validation-symbols) -->

#### Проверка скопированных значений

При копировании значений из буфера или вставке их с помощью drag-and-drop срабатывает валидация во время ввода значений. Если в скопированном значении содержались символы кроме цифр и букв, к ним применяются правила из раздела выше «Ввод символов и цифр».

<!-- example(timepicker-validation-symbols) -->

### Фокус и работа с клавиатурой

| <div style="min-width: 170px;">Клавиша</div>                                                                                                 | Действие                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Tab</span> \ <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span> | Перевести фокус в поле с временем (из него)                                                                                                                                               |
| <span class="docs-hot-key-button">↓</span> <span class="docs-hot-key-button">↑</span>                                                        | Каретка установлена на любой единице (часы, минуты или секунды) времени → уменьшение или увеличение значения на 1                                                                         |
| <span class="docs-hot-key-button">→</span>                                                                                                   | Перенести каретку на следующий символ. Если каретка установлена за последней единицей времени (минут или секунд, в зависимости от вариации), поместить каретку перед первой цифрой часа   |
| <span class="docs-hot-key-button">←</span>                                                                                                   | Перенести каретку на предыдущий символ. Если каретка установлена перед первой цифрой часа, переместить каретку за последнюю единицу времени (минут или секунд, в зависимости от вариации) |
| <span class="docs-hot-key-button">PgUp</span> \ <span class="docs-hot-key-button">Home</span>                                                | Поместить каретку перед первой цифрой часа                                                                                                                                                |
| <span class="docs-hot-key-button">PgDn</span> \ <span class="docs-hot-key-button">End</span>                                                 | Перенести каретку за последнюю единицу времени (минут или секунд, в зависимости от вариации)                                                                                              |
| <span class="docs-hot-key-button">Space</span>                                                                                               | — Если в любой части маски → ничего не происходит                                                                                                                                         |
|                                                                                                                                              | — Если после ввода двух цифр (часов или минут) → переход к следующей части маски (минутам или секундам);                                                                                  |
|                                                                                                                                              | — Если после ввода одной цифры (в часы или в минуты) → поле воспринимает эту клавишу как разделитель, подставляется двоеточие, а перед введенной цифрой подставляется ноль                |

### Дизайн и анимация

Поле с временем имеет фиксированную ширину, которая строится по формуле _левый отступ + маска + правый отступ_.

Ширина маски для каждого языка будет своя, после ввода времени ширина не меняется, даже если введенное значение будет меньше ширины маски.

Левый отступ разный, в зависимости от вариации (с иконкой или без). Правый отступ всегда 16px.

<div style="margin-top: 15px;">
<img src="./assets/images/timepicker/timepicker-design.jpg" alt="timepicker" width="262"/>
</div>

### Дополнительно

#### Использование Datepicker и Timepicker вместе

Это пример совместного использования [Datepicker](/ru/components/datepicker) и Timepicker для выбора определенной даты и времени. Этот подход удобен в тех случаях, когда требуется задать точное время события или дедлайна.

<div style="margin-top: 15px;">
    <img src="./assets/images/timepicker/timepicker-with-datepicker.png" alt="Using timepicker with datepicker" width="100%"/>
</div>

Пользователь может выбрать дату через Datepicker, а затем указать конкретное время через Timepicker.

<!-- Example from DS-2491 -->
