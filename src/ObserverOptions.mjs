import ObserverOptionsBuilder from './ObserverOptionsBuilder.mjs';

/**
 * 🧩 `ObserverOptions` — набор параметров для конфигурации {@link Observer}, определяющий, **что именно отслеживать** в DOM.
 *
 * Используется для тонкой настройки реакции на мутации: добавление или удаление узлов, изменения атрибутов и текста.
 *
 * ---
 *
 * ### 🔧 Основные опции
 *
 * - `childList` — отслеживает добавление/удаление **прямых** дочерних узлов.
 * - `attributes` — отслеживает изменения **атрибутов** элементов.
 * - `characterData` — отслеживает изменения **текстового содержимого** узлов (например, `Text`).
 * - `subtree` — расширяет область наблюдения на **всех потомков**.
 * - `attributeOldValue` — сохраняет **старое значение атрибута** при изменении.
 * - `characterDataOldValue` — сохраняет **старое текстовое значение**.
 * - `attributeFilter` — ограничивает список **атрибутов**, за которыми ведётся наблюдение.
 *
 * ---
 *
 * ### ⚠️ Обязательные условия
 *
 * Вы **должны указать хотя бы один** из следующих параметров, иначе произойдёт ошибка:
 *
 * - `childList`
 * - `attributes`
 * - `characterData`
 *
 * > В противном случае `MutationObserver` выбросит исключение:
 * > `An invalid or illegal string was specified`
 *
 * ---
 *
 * ### 📘 Дополнительно
 *
 * Подробные описания каждой опции — см. в комментариях к соответствующим полям класса.
 */
class ObserverOptions {
    /**
     * 🧩 `childList` — включает отслеживание добавления и удаления **прямых** дочерних узлов у целевого DOM-элемента.
     *
     * ---
     *
     * ### 📌 Особенности
     *
     * - Отслеживает **только изменения на первом уровне** (например, `<div> → <span>`).
     * - Не фиксирует изменения **внутри** этих узлов (текст, атрибуты и т.п.).
     * - Для наблюдения за потомками любого уровня — используйте `subtree: true`.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```html
     *
     * <div id="box">
     *     <p>Привет</p>
     * </div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById('box');
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Изменения:', mutation);
     *     }
     * });
     *
     * observer.observe(target, {
     *     childList: true
     * });
     *
     * // Пример мутации:
     * const span = document.createElement('span');
     * span.textContent = 'Новый элемент';
     * target.appendChild(span); // вызовет мутацию
     *
     * ```
     *
     * ---
     *
     * ### 🌳 Наблюдение во вложенных узлах
     *
     * Чтобы отслеживать вставки/удаления в **любых потомках**, добавьте `subtree: true`:
     *
     * ```js
     *
     * observer.observe(target, {
     *     childList: true,
     *     subtree: true
     * });
     *
     * ```
     *
     * ---
     *
     * @type {boolean}
     */
    childList = false;

    /**
     * 🏷️ `attributes` — включает отслеживание изменений атрибутов у указанного DOM-элемента.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Следит за **любым изменением атрибутов** на наблюдаемом элементе.
     * - **Не отслеживает** атрибуты у потомков — если не указан `subtree: true`.
     * - Используйте вместе с `attributeFilter` и `attributeOldValue` для точного контроля.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```html
     *
     * <div id="myDiv" class="box"></div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById('myDiv');
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Атрибут изменён:', mutation.attributeName);
     *     }
     * });
     *
     * observer.observe(target, {
     *     attributes: true
     * });
     *
     * // Мутация:
     * target.setAttribute('class', 'box active');
     *
     * ```
     *
     * ---
     *
     * ### 🛠️ Расширенные настройки
     *
     * ```js
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ['class', 'style']
     * });
     *
     * ```
     *
     * - `attributeOldValue: true` — добавляет `mutation.oldValue`.
     * - `attributeFilter: [...]` — отслеживает только указанные атрибуты.
     *
     * ---
     *
     * ### 🌳 Отслеживание в потомках
     *
     * По умолчанию изменения отслеживаются **только на самом элементе**.
     * Чтобы реагировать на изменения атрибутов у вложенных узлов, укажите `subtree: true`:
     *
     * ```js
     *
     * observer.observe(parentElement, {
     *     attributes: true,
     *     subtree: true
     * });
     *
     * ```
     *
     * ---
     *
     * @type {boolean}
     */
    attributes = false;

    /**
     * 🧬 `characterData` — включает отслеживание изменений текстового содержимого в узлах типа [CharacterData](https://developer.mozilla.org/en-US/docs/Web/API/CharacterData):
     * [`Text`](https://developer.mozilla.org/en-US/docs/Web/API/Text), [`Comment`](https://developer.mozilla.org/en-US/docs/Web/API/Comment), [`CDATASection`](https://developer.mozilla.org/en-US/docs/Web/API/CDATASection).
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Работает **только** с узлами `CharacterData`, а не с элементами (`Element`).
     * - Позволяет реагировать на изменение `.data` внутри текстовых, комментариев и CDATA-узлов.
     * - Полезно при необходимости отслеживать редактирование текста, включая изменения через JS или пользовательский ввод.
     *
     * ---
     *
     * ### 🧪 Пример
     *
     * ```html
     *
     * <div id="box">Привет</div>
     *
     * ```
     *
     * ```js
     *
     * const textNode = document.getElementById('box').firstChild;
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Текст изменён!');
     *         console.log('Старое значение:', mutation.oldValue);
     *         console.log('Новое значение:', mutation.target.data);
     *     }
     * });
     *
     * observer.observe(textNode, {
     *     characterData: true,
     *     characterDataOldValue: true
     * });
     *
     * // Изменим текст:
     * textNode.data = 'Здравствуйте';
     *
     * ```
     *
     * ---
     *
     * ### 🛠️ Дополнительные параметры
     *
     * - `characterDataOldValue: true` — включает сохранение предыдущего значения текста в `mutation.oldValue`.
     * - `subtree: true` — позволяет отслеживать изменения текстовых узлов внутри вложенных элементов (но только если явно указывать `characterData: true`).
     *
     * ---
     *
     * ### ⚠️ Важно
     *
     * - Изменения **элементов** не отслеживаются — нужно явно передавать текстовые узлы.
     *
     * ❌ **Не сработает**:
     *
     * ```js
     *
     * observer.observe(document.getElementById('box'), {
     *     characterData: true
     * });
     *
     * ```
     *
     * ✅ **Работает**:
     *
     * ```js
     *
     * observer.observe(document.getElementById('box').firstChild, {
     *     characterData: true
     * });
     *
     * ```
     *
     * ---
     *
     * @type {boolean}
     */
    characterData = false;

    /**
     * 🌲 `subtree` — включает **все вложенные узлы** в область наблюдения, а не только сам целевой элемент.
     *
     * ---
     *
     * ### 📌 **Важно**
     *
     * - Расширяет зону наблюдения на **всё дерево потомков** узла, к которому применяется `observe()`.
     * - Работает **в паре** с другими опциями (`attributes`, `childList`, `characterData`), расширяя их действие на потомков.
     *
     * ---
     *
     * ### ✅ **Пример**: отслеживание атрибутов во всех вложенных элементах
     *
     * ```html
     *
     * <div id="root">
     *     <section>
     *         <button class="primary">Кнопка</button>
     *     </section>
     * </div>
     *
     * ```
     *
     * ```js
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Изменение в поддереве:', mutation);
     *     }
     * });
     *
     * observer.observe(document.getElementById('root'), {
     *     attributes: true,
     *     subtree: true
     * });
     *
     * // Изменим атрибут у вложенного элемента:
     * document.querySelector('button').setAttribute('class', 'secondary'); // сработает
     *
     * ```
     *
     * ---
     *
     * ### 🔁 Использование с опциями
     *
     * - `childList: true, subtree: true` — следит за добавлением/удалением **во всех уровнях вложенности**
     * - `characterData: true, subtree: true` — следит за **всеми** текстовыми узлами в дереве
     * - `attributes: true, subtree: true` — следит за **всеми** атрибутами в дереве
     *
     * @type {boolean}
     */
    subtree = false;

    /**
     * ♻️ `attributeOldValue` — включает **предыдущее значение** атрибута в объекте мутации (`MutationRecord`).
     *
     * ---
     *
     * ### 📌 **Важно**
     *
     * - Работает **только с `attributes: true`**.
     * - Возвращает старое значение изменённого атрибута в поле `oldValue`.
     * - По умолчанию `oldValue` — `null`, даже если атрибут изменился.
     *
     * ---
     *
     * ### ✅ **Пример**
     *
     * ```html
     *
     * <div id="box" class="a"></div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById('box');
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Атрибут:', mutation.attributeName);
     *         console.log('Было:', mutation.oldValue);
     *         console.log('Стало:', target.getAttribute(mutation.attributeName));
     *     }
     * });
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true
     * });
     *
     * // Изменим атрибут:
     * target.setAttribute('class', 'b');
     *
     * ```
     *
     * @type {boolean}
     */
    attributeOldValue = false;

    /**
     * ♻️ `characterDataOldValue` — включает **предыдущее значение текстового содержимого** при отслеживании изменений в текстовых узлах.
     *
     * ---
     *
     * ### 📌 **Важно**
     *
     * - Работает **только с `characterData: true`**.
     * - Возвращает старое значение текстового узла в поле `oldValue`.
     * - Без этой опции `oldValue` всегда будет `null`.
     *
     * ---
     *
     * ### ✅ **Пример**
     *
     * ```html
     *
     * <div id="box">Привет</div>
     *
     * ```
     *
     * ```js
     *
     * const textNode = document.getElementById('box').firstChild;
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Старое значение:', mutation.oldValue);
     *         console.log('Новое значение:', mutation.target.data);
     *     }
     * });
     *
     * observer.observe(textNode, {
     *     characterData: true,
     *     characterDataOldValue: true
     * });
     *
     * // Изменение:
     * textNode.data = 'Здравствуйте';
     *
     * ```
     *
     * @type {boolean}
     */
    characterDataOldValue = false;

    /**
     * 🎯 `attributeFilter` — список атрибутов, изменения которых должен отслеживать `Observer`.
     *
     * ---
     *
     * ### 📌 Что делает
     *
     * - Ограничивает отслеживание **только указанными атрибутами**.
     * - Позволяет избежать лишних срабатываний и повысить производительность.
     * - Работает **только с `attributes: true`**.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```html
     *
     * <div id="box" class="red" data-state="open" title="подсказка"></div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById("box");
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const m of mutations) {
     *         console.log("Изменён атрибут:", m.attributeName);
     *         console.log("Было:", m.oldValue);
     *     }
     * });
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ["class", "data-state"] // Только эти два
     * });
     *
     * // Сработает:
     * target.setAttribute("class", "green");
     *
     * // Не сработает:
     * target.setAttribute("title", "новая подсказка");
     *
     * ```
     *
     * ---
     *
     * ### 💡 Зачем использовать
     *
     * - 📉 Снижает нагрузку, особенно при большом числе атрибутов
     * - 🎯 Позволяет следить только за значимыми изменениями (`class`, `style`, `data-*`)
     *
     * ---
     *
     * ⚠️ Без `attributeFilter` будут отслеживаться **все атрибуты**.
     *
     * ---
     *
     * @type {string[]}
     */
    attributeFilter;

    /**
     * 🏗️ `new()` — создаёт экземпляр билдера опций {@link ObserverOptionsBuilder} для удобной конфигурации {@link Observer}.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Позволяет **пошагово настраивать** параметры наблюдателя через fluent-интерфейс.
     * - Альтернатива ручному созданию `ObserverOptions` — делает код **чище и читаемее**.
     * - Возвращает билдер, содержащий методы:
     *   `.children()`, `.attributes()`, `.text()`, `.subtree()`, `.useOldValue()`, и др.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const options = ObserverOptions
     *     .new()
     *     .children()
     *     .subtree()
     *     .build();
     *
     * const observer = new Observer(callback);
     * observer.observe(target, options);
     *
     * ```
     *
     * ---
     *
     * ### 💡 Преимущества
     *
     * - 🧱 Явная и наглядная конфигурация
     * - 🌱 Удобно для настройки по умолчанию и расширения
     * - 🚫 Минимизирует ошибки, связанные с ручным созданием объекта конфигурации
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} Экземпляр билдера опций
     */
    static new() {
        return new ObserverOptionsBuilder();
    }

    /**
     * 👶 `children()` — создаёт {@link ObserverOptions} с включённым флагом `childList: true`.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Быстрый способ создать конфигурацию для отслеживания **изменений в прямых дочерних элементах** (добавление/удаление узлов).
     * - Используется, если нужно реагировать на изменения структуры DOM-дерева на первом уровне вложенности.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     * observer.observe(target, ObserverOptions.children());
     *
     * ```
     *
     * ---
     *
     * Равнозначно:
     *
     * ```js
     *
     * {
     *     childList: true
     * }
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptions} Конфигурация с `childList: true`
     */
    static children() {
        return ObserverOptions.new().children().build();
    }

    /**
     * 🌿 `descendants()` — возвращает преднастроенные {@link ObserverOptions}
     * для наблюдения за **всеми потомками** узла.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Комбинация `childList: true` и `subtree: true`.
     * - Удобно, если нужно отслеживать изменения в DOM не только на верхнем уровне,
     *   но и глубже (вложенные элементы).
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     * observer.observe(target, ObserverOptions.descendants());
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Эквивалентно
     *
     * ```js
     *
     * {
     *     childList: true,
     *     subtree: true
     * }
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptions} Готовый объект опций
     */
    static descendants() {
        return ObserverOptions.new().descendants().build();
    }

    /**
     * 🧬 `attributes()` — возвращает преднастроенные {@link ObserverOptions} для отслеживания **изменений атрибутов**.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Включает флаг `attributes: true` для наблюдения за изменениями атрибутов DOM-элемента.
     * - Поддерживает фильтрацию по атрибутам и отслеживание старых значений.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     * observer.observe(target, ObserverOptions.attributes(['class', 'style'], true));
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Эквивалентно
     *
     * ```js
     *
     * {
     *     attributes: true,
     *     attributeFilter: ['class', 'style'],
     *     attributeOldValue: true
     * }
     *
     * ```
     *
     * ---
     *
     * @param {string[] | null} [filter=null] — Массив атрибутов, которые нужно отслеживать (например, `['class', 'data-id']`).
     * Оставьте `null`, чтобы следить за **всеми** атрибутами.
     * @param {boolean} [useOldValue=false] — Если `true`, в `MutationRecord.oldValue` будет возвращаться предыдущее значение атрибута.
     * @returns {ObserverOptions} Готовый объект опций для `.observe()`
     */
    static attributes(filter = null, useOldValue = false) {
        const builder = ObserverOptions.new().attributes(filter);

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }

    /**
     * 🧬 `descendantAttributes()` — возвращает {@link ObserverOptions} для отслеживания **атрибутов всех потомков** DOM-элемента.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Включает флаги `attributes: true` и `subtree: true` для наблюдения за **изменениями атрибутов во всём дереве**.
     * - Позволяет фильтровать по атрибутам и получать старые значения.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     * observer.observe(target, ObserverOptions.descendantAttributes(['data-state'], true));
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Эквивалентно
     *
     * ```js
     *
     * {
     *     attributes: true,
     *     subtree: true,
     *     attributeFilter: ['data-state'],
     *     attributeOldValue: true
     * }
     *
     * ```
     *
     * ---
     *
     * @param {string[] | null} [filter=null] — Список атрибутов, за которыми нужно следить
     * (например, `['class', 'data-visible']`).
     * Укажите `null`, чтобы отслеживать **все** атрибуты.
     * @param {boolean} [useOldValue=false] — Если `true`, в `MutationRecord.oldValue` будет возвращено предыдущее значение атрибута.
     * @returns {ObserverOptions} Готовый набор опций для `observe()`
     */
    static descendantAttributes(filter = null, useOldValue = false) {
        const builder = ObserverOptions.new().descendantAttributes(filter);

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }

    /**
     * ✏️ `text()` — возвращает {@link ObserverOptions} для отслеживания изменений текстовых узлов (`characterData`).
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Отслеживает изменения текстового содержимого в узлах типа `Text`, `Comment`, `CDATASection`.
     * - Наблюдает только за **конкретным текстовым узлом**, не за элементами (`Element`).
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     *
     * const textNode = document.getElementById("box").firstChild;
     *
     * observer.observe(textNode, ObserverOptions.text(true));
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Эквивалентно
     *
     * ```js
     *
     * {
     *     characterData: true,
     *     characterDataOldValue: true
     * }
     *
     * ```
     *
     * ---
     *
     * ⚠️ Наблюдение работает только при указании **текстового узла** как цели.
     * Наблюдение за элементами с `characterData: true` эффекта не даст.
     *
     * ---
     *
     * @param {boolean} [useOldValue=false] — Если `true`, в `MutationRecord.oldValue` будет сохранено старое значение текста.
     * @returns {ObserverOptions} Готовый набор опций для `observe()`
     */
    static text(useOldValue = false) {
        const builder = ObserverOptions.new().text();

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }

    /**
     * ✏️ `descendantText()` — возвращает {@link ObserverOptions} для отслеживания изменений текстовых узлов (`characterData`) во всём поддереве.
     *
     * ---
     *
     * ### 📌 Назначение
     *
     * - Следит за изменениями **всех текстовых узлов**, находящихся внутри заданного элемента и его потомков.
     * - Учитывает `subtree: true`, чтобы охватить вложенные текстовые узлы.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer(callback);
     *
     * const root = document.getElementById("container");
     *
     * observer.observe(root, ObserverOptions.descendantText(true));
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Эквивалентно
     *
     * ```js
     *
     * {
     *     characterData: true,
     *     characterDataOldValue: true,
     *     subtree: true
     * }
     *
     * ```
     *
     * ---
     *
     * ⚠️ Важно: наблюдение работает **только** при изменении текстовых узлов.
     * Элементы (например, `div`, `span`) не отслеживаются с `characterData`.
     *
     * ---
     *
     * @param {boolean} [useOldValue=false] — если `true`, в `MutationRecord.oldValue` будет сохранено предыдущее значение текста.
     * @returns {ObserverOptions} Готовый набор опций для `observe()` с учётом вложенных текстовых узлов
     */
    static descendantText(useOldValue = false) {
        const builder = ObserverOptions.new().descendantText();

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }

    /**
     * 📦 Создаёт конфигурацию для **наблюдения за содержимым** DOM-узла.
     *
     * Удобное сокращение, которое включает наблюдение за:
     *
     * - 👶 дочерними элементами (`childList`)
     * - ✏️ текстовыми узлами (`characterData`)
     * - 🌳 вложенными элементами (`subtree`)
     *
     * ---
     *
     * ### 🔍 Что делает:
     *
     * Вызов `ObserverOptions.content()` возвращает преднастроенные опции, эквивалентные:
     *
     * ```js
     *
     * new ObserverOptionsBuilder()
     *     .content()
     *     .build()
     *
     * // То же самое, что:
     * // .children().text().subtree()
     *
     * ```
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = ObserverOptions.content(true); // с сохранением старых значений текста
     *
     * const observer = new Observer(callback);
     * observer.observe(document.querySelector('#editor'), options);
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Подходит для:
     *
     * - `contenteditable`-областей
     * - Редакторов и текстовых блоков
     * - Интерфейсов, где содержимое может меняться динамически
     *
     * ---
     *
     * @param {boolean} [useOldValue=false] — если `true`, включает сохранение старых значений текста (`characterDataOldValue: true`).
     * @returns {ObserverOptions} Готовый объект настроек для `MutationObserver`.
     */
    static content(useOldValue = false) {
        const builder = ObserverOptions.new().content();

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }

    /**
     * 🧿 Создаёт конфигурацию для **полного наблюдения** за изменениями в DOM.
     *
     * Включает **все основные флаги**, чтобы отслеживать:
     *
     * - 👶 Добавление и удаление элементов (`childList`)
     * - 🏷️ Изменения атрибутов (`attributes`)
     * - ✏️ Изменения текстовых узлов (`characterData`)
     * - 🌳 Изменения на всех уровнях вложенности (`subtree`)
     *
     * ---
     *
     * ### ⏪ useOldValue (по умолчанию `false`)
     *
     * Если указано `true`, включает сохранение старых значений:
     *
     * - `attributeOldValue: true` — для атрибутов
     * - `characterDataOldValue: true` — для текстовых узлов
     *
     * ---
     *
     * ### 🔧 Эквивалент:
     *
     * ```js
     *
     * ObserverOptions.new().all()
     *     .useOldValue() // если передан true
     *     .build();
     *
     * ```
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = ObserverOptions.all(true); // со старыми значениями
     * const observer = new Observer(console.log);
     *
     * observer.observe(document.body, options);
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Полезно для:
     *
     * - Инструментов отладки
     * - Полной реактивности
     * - Отслеживания любых DOM-изменений
     *
     * ---
     *
     * ⚠️ Может повлиять на производительность — используйте при необходимости "всё включено".
     *
     * @param {boolean} [useOldValue=false] Включить ли сохранение старых значений атрибутов и текста.
     * @returns {ObserverOptions} Готовый набор параметров для `MutationObserver`.
     */
    static all(useOldValue = false) {
        const builder = ObserverOptions.new().all();

        if (useOldValue) {
            builder.useOldValue();
        }

        return builder.build();
    }
}

export default ObserverOptions;
