Сайдпанель — это окно, которое выезжает из-за границы экрана и располагается поверх основного контента страницы.

### Когда использовать

Сайдпанель похожа на [модальное окно](/ru/components/modal). Она хорошо подходит, когда нужно показать большое количество данных.

### Структура компонента

- Заголовок (шапка)
- Кнопка «Закрыть» (крестик)
- Тело. Может содержать текст, элементы управления и поля ввода
- Футер с терминальными кнопками

### Описание работы

По умолчанию сайдпанель показывается справа, но в зависимости от контекста может показываться и слева тоже.

#### Модальный режим (с блокировкой страницы)

Сайдпанель при появлении выезжает из-за границы экрана, затемняя остальную часть экрана (это позволяет понять, что действия на затемненной части недоступны). При закрытии (а также при нажатии на затемнение) заезжает обратно.

<!-- example(sidepanel-modal-mode) -->

#### Немодальный режим (без блокировки страницы)

Сайдпанель при появлении выезжает из-за границы экрана, при этом основной экран не затемняется и со всеми элементами на нем можно взаимодействовать.

<!-- example(sidepanel-normal-mode) -->

#### Друг над другом

Из сайдпанели можно открыть другую сайдпанель. Немодальные сайдпанели накладываются друг на друга со сдвигом. Вне зависимости от того, сколько сайдпанелей открыто, показывается только один сдвиг, чтобы не создавать визуальный шум.

Использовать этот режим нужно тогда, когда вы хотите сделать переходы внутри сайдпанели.

Клик на вертикальную область, оставшуюся от нижней панели, закрывает одну верхнюю.

<!-- example(sidepanel-overlayed) -->

##### Отличия режимов

| Модальный                                                  | Немодальный                                                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Лучше не использовать для просмотра                        | Лучше использовать для просмотра                                                                            |
| Для редактирования используется как обычное модальное окно | Используется только для редактирования составных частей большого объекта, без явного сохранения этих частей |
| Кнопки всегда должны быть                                  | Кнопки могут быть, а могут не быть                                                                          |

#### Фокус и работа с клавиатурой

При открытой сайдпанели фокус перемещается только по элементам внутри окна, включая крестик и кнопки в футере, и не выходит за его пределы.

##### Фокус при открытой сайдпанели

Когда открывается сайдпанель, фокус перемещается к элементу внутри сайдпанели. Расположение фокуса зависит от характера и размера содержимого:

- Фокус устанавливается на первый доступный элемент внутри тела сайдпанели, если нет особых предписаний
- Если в сайдпанели есть форма, то нужно ставить фокус в первое поле ввода
- Если сайдпанель содержит важное необратимое действие, то лучше поставить фокус на другое, менее деструктивное
- Если в сайдпанели есть только терминальные кнопки, то будет полезно поставить фокус на кнопку, которую пользователь вероятнее всего нажмет («OK» или «Отмена», в зависимости от ситуации)
- Если внутри модального окна много контента, есть прокрутка, то установка фокуса на первый доступный элемент может автоматически промотать содержимое окна и убрать его начальные части из поля зрения. В этому случае надо добавить статическому элементу, расположенному в начале контента (заголовку, первому абзацу), атрибут `tabindex=-1` и установить фокус на нем.

##### Фокус после закрытия сайдпанели

Когда сайдпанель закрывается, по умолчанию фокус возвращается на элемент, который ее вызвал (хотя маловероятно, что пользователь захочет сразу же открыть ту же сайдпанель). Если триггерный элемент больше не существует, то фокус возвращается на другой элемент, подходящий логике взаимодействия.

В некоторых ситуациях фокус может специально возвращаться на другой элемент, не тот, который изначально открыл сайдпанель. Например, если задача, выполненная в сайдпанели, напрямую связана с последующим этапом рабочего процесса. Предположим, в таблице есть панель инструментов с кнопкой «Добавить строки». Кнопка открывает сайдпанель, где запрашиваются количество и формат новых строк. После закрытия сайдпанели фокус помещается в первую ячейку первой новой строки.

##### Управление с клавиатуры

| <div style="min-width: 100px;">Клавиша</div>                                               | Действие                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">↵</span> | Выполняется основное действие сайдпанели                                                                                                      |
| <span class="docs-hot-key-button">Esc</span>                                               | Закрыть сайдпанель:<br>1. Если в сайдпанели не было изменения данных<br>2. Если у элемента в фокусе нет собственного обработчика этой клавиши |
| <span class="docs-hot-key-button">↵</span>                                                 | Отправка формы по нажатию Enter в любом текстовом инпуте                                                                                      |

### Дизайн и анимация

#### Размер

Панель занимает всю высоту окна браузера. Горизонтального скролла не бывает, содержимое панели должно умещаться по ширине.

| Предустановка | Ширина             |
| ------------- | ------------------ |
| Small         | 400                |
| Medium        | 640 (по умолчанию) |
| Large         | 960                |

<!-- example(sidepanel-sizes) -->

Ширину выбирают дизайнер и аналитик в зависимости от задачи. Кроме фиксированной ширины, может быть задана ширина в процентах от общей ширины экрана, с заданными минимальной и максимальной шириной в пикселях. Проценты позволят сайдпанели тянуться и выглядеть пропорционально, а лимиты не дадут чрезмерно увеличиться или уменьшиться. В отдельных случаях можно установить просто фиксированную ширину в пикселях.

При выборе размера сайдпанели обратите внимания на эти моменты:

- Размер содержимого. Слишком большая или недостаточная ширина панели выглядят плохо.
- Сетка страницы. Хорошо, когда сайдпанель на странице смотрится пропорционально и соответствует каким-то другим блокам. Удачные пропорции для сайдпанели: 1/4, 1/3, 1/2, 2/3, 3/4 основного окна.
- Сценарии использования. Если немодальная панель используется для просмотра какого-то объекта из списка, то лучше, чтобы она не закрывала список целиком: сохранится возможность быстрого переключения между объектами. Если немодальная панель используется для организации параллельных рабочих областей, проверьте, что области не мешают друг другу и основному сценарию работы.
- Унификация. Продукт будет выглядеть аккуратней и целостней, если в нем не будет большого количества сайдпанелей разной ширины. Лучше, если размер будет один, максимум два.
