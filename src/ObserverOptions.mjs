import ObserverOptionsBuilder from './ObserverOptionsBuilder.mjs';

/**
 * 🧩 Набор опций для {@link Observer} — определяет, какие типы изменений нужно отслеживать в `DOM`.
 *
 * Используется для тонкой настройки наблюдения за мутациями элементов: добавление/удаление узлов, изменения атрибутов и текста.
 *
 * ### 🔧 Опции:
 *
 * - `childList`: отслеживает добавление и удаление дочерних элементов.
 * - `attributes`: отслеживает изменения атрибутов.
 * - `characterData`: отслеживает изменения текстового содержимого.
 * - `subtree`: включает всех потомков в область наблюдения.
 * - `attributeOldValue`, `characterDataOldValue`: позволяют получить предыдущее значение.
 * - `attributeFilter`: ограничивает наблюдение конкретными атрибутами.
 *
 * ---
 *
 * ⚠️ **Примечание:** обязательно укажите хотя бы один из следующих параметров:
 *
 * - `childList`
 * - `attributes`
 * - `characterData`
 *
 * В противном случае будет выброшено исключение:
 *
 * ```text
 *
 * An invalid or illegal string was specified
 *
 * ```
 *
 * ---
 *
 * 📚 Подробнее об опциях — см. описания полей класса.
 */
class ObserverOptions {
    /**
     * ⭐ `childList` — отслеживание добавления и удаления дочерних элементов (включая текстовые узлы) в целевом DOM-узле.
     *
     * ### 📖 Описание
     *
     * - Следит только за прямыми дочерними элементами (например, если в <div> добавили <span>).
     * - Не отслеживает изменения внутри этих дочерних элементов (например, изменение их текста или атрибутов).
     * - Для отслеживания изменений во вложенных узлах используйте опцию `subtree`.
     *
     * ###  ✅ Пример:
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
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log("Изменения:", mutation);
     *     }
     * });
     *
     * observer.observe(target, {
     *     childList: true  // Следим за добавлением и удалением элементов
     * });
     *
     * // Добавим элемент:
     * setTimeout(() => {
     *     const newElement = document.createElement('span');
     *     newElement.textContent = 'Новый элемент';
     *     target.appendChild(newElement); // вызовет срабатывание observer
     * }, 1000);
     *
     * ```
     *
     * ────────────────
     *
     * 📦 В mutation-объекте:
     *
     * - `addedNodes`: список добавленных узлов
     * - `removedNodes`: список удалённых узлов
     * - `target`: наблюдаемый узел (box)
     *
     * ────────────────
     *
     * 💡 Совет:
     *
     * Для отслеживания изменений во всех потомках используйте:
     *
     * ```js
     *
     * childList: true,
     * subtree: true
     *
     * ```
     *
     * @type {Boolean}
     */
    childList = false;

    /**
     * ⭐ `attributes` — отслеживание изменений атрибутов целевого DOM-узла.
     *
     * ### 📖 Описание
     *
     * - Следит за изменениями любых атрибутов у наблюдаемого элемента.
     * - Не отслеживает изменения атрибутов у потомков, если не указано `subtree: true`.
     * - Можно ограничить список отслеживаемых атрибутов с помощью `attributeFilter`.
     * - Для получения предыдущего значения используйте `attributeOldValue: true`.
     *
     * ### ✅ Пример:
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
     * // Пример изменения:
     * setTimeout(() => {
     *     target.setAttribute('class', 'box active'); // сработает
     * }, 1000);
     *
     * ```
     *
     * ────────────────
     *
     * 🔧 Расширенные опции:
     *
     * - `attributeOldValue: true` — возвращает предыдущее значение атрибута в `mutation.oldValue`
     * - `attributeFilter: ['class', 'style']` — следит только за указанными атрибутами
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
     * ⚠️ По умолчанию следит только за целевым элементом.
     *
     * Для отслеживания атрибутов у потомков добавьте `subtree: true`:
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
     * ────────────────
     *
     * 📦 `MutationRecord` при `attributes: true` содержит:
     *
     * - `type`: 'attributes'
     * - `target`: элемент, у которого изменился атрибут
     * - `attributeName`: название изменённого атрибута
     * - `oldValue`: старое значение (если включено)
     *
     * @type {Boolean}
     */
    attributes = false;

    /**
     * ⭐ `characterData` — отслеживание изменений текстового содержимого (data) внутри текстовых узлов или узлов типа [CharacterData](https://developer.mozilla.org/en-US/docs/Web/API/CharacterData) (например, [Text](https://developer.mozilla.org/en-US/docs/Web/API/Text), [Comment](https://developer.mozilla.org/en-US/docs/Web/API/Comment), [CDATASection](https://developer.mozilla.org/en-US/docs/Web/API/CDATASection)).
     *
     * ### 📖 Описание
     *
     * - Работает только на текстовых узлах, а не на элементах.
     * - Если применить `observe()` к элементу (например, `<div>`), а не к его текстовому узлу — ничего не произойдёт.
     * - Для получения предыдущего значения текста используйте `characterDataOldValue: true`.
     *
     * ### ✅ Пример:
     *
     * ```html
     *
     * <div id="box">Привет</div>
     *
     * ```
     *
     * ```js
     *
     * const textNode = document.getElementById("box").firstChild;
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log("Текст изменён!");
     *         console.log("Старое значение:", mutation.oldValue);
     *         console.log("Новое значение:", mutation.target.data);
     *     }
     * });
     *
     * observer.observe(textNode, {
     *     characterData: true,
     *     characterDataOldValue: true
     * });
     *
     * // Изменим текст:
     * setTimeout(() => {
     *     textNode.data = "Здравствуйте";
     * }, 1000);
     *
     * ```
     *
     * ────────────────
     *
     * 🧠 Полезные опции:
     *
     * - `characterData: true` — включает слежку за изменениями текста
     * - `characterDataOldValue: true` — возвращает предыдущее значение текста в `oldValue`
     *
     * ────────────────
     *
     * 🔁 Комбо с `subtree`:
     *
     * Если нужно следить за текстом внутри вложенных элементов, ищите все Text-узлы или используйте `subtree: true` при наблюдении за текстовым узлом в глубине.
     * Однако, если наблюдать за элементом с `subtree: true`, изменения текста не будут отслеживаться — нужно следить именно за текстовыми узлами.
     *
     * ────────────────
     *
     * 🚫 Не работает:
     *
     * ```js
     *
     * observer.observe(document.getElementById("box"), {
     *     characterData: true
     * });
     * // Это не сработает, потому что наблюдаемый узел — элемент (DIV), а не текстовый узел.
     *
     * ```
     *
     * ✅ Работает:
     *
     * ```js
     *
     * observer.observe(document.getElementById("box").firstChild, {
     *     characterData: true
     * });
     *
     * ```
     *
     * @type {Boolean}
     */
    characterData = false;

    /**
     * ⭐ `subtree` — отслеживание изменений не только в целевом элементе, но и во всех его потомках на любом уровне вложенности.
     *
     * ### 📖 Описание
     *
     * - Если `subtree: true`, {@link Observer} будет реагировать на изменения во всём поддереве `DOM`, начиная с целевого элемента.
     * - Работает только в связке с другими опциями (`childList`, `attributes`, `characterData`).
     * - Без этой опции отслеживаются только изменения в самом целевом узле.
     *
     * ### ✅ Пример:
     *
     * ```html
     *
     * <div id="root">
     *     <div class="child">
     *         <span>Text</span>
     *     </div>
     * </div>
     *
     * ```
     *
     * ```js
     *
     * const observer = new Observer((mutations) => {
     *     for (const m of mutations) {
     *         console.log("Изменение:", m);
     *     }
     * });
     *
     * observer.observe(document.getElementById("root"), {
     *     childList: true,
     *     attributes: true,
     *     characterData: true,
     *     subtree: true // 👈 ключевая штука!
     * });
     *
     * // Теперь любые изменения:
     * // - добавление/удаление элементов внутри .child,
     * // - изменение class у .child,
     * // - изменение текста внутри <span>,
     * // — всё будет замечено.
     *
     * ```
     *
     * ────────────────
     *
     * ⚠️ Без `subtree: true`:
     *
     * Вы увидите только изменения, которые происходят непосредственно в #root, а всё внутри будет игнорироваться.
     *
     * ────────────────
     *
     * 🧪 Пример ситуации:
     *
     * ```js
     *
     * document.querySelector('.child span').textContent = 'Changed!';
     * // Сработает ТОЛЬКО если включено subtree + characterData
     *
     * ```
     *
     * @type {Boolean}
     */
    subtree = false;

    /**
     * ⭐ `attributeOldValue` — позволяет получить старое значение атрибута, который изменился, в свойстве `mutation.oldValue`.
     *
     * ### 📖 Описание
     *
     * - Без этой опции `oldValue` будет `null`.
     * - Работает только если указано `attributes: true`.
     * - Можно использовать вместе с `attributeFilter` для отслеживания только нужных атрибутов.
     *
     * ### ✅ Пример:
     *
     * ```html
     *
     * <div id="myDiv" class="box"></div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById("myDiv");
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log("Атрибут изменён:", mutation.attributeName);
     *         console.log("Старое значение:", mutation.oldValue);
     *         console.log("Новое значение:", target.getAttribute(mutation.attributeName));
     *     }
     * });
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ["class"] // можно опустить, если нужно следить за всеми
     * });
     *
     * // Пример изменения:
     * setTimeout(() => {
     *     target.setAttribute("class", "box active");
     * }, 1000);
     *
     * ```
     *
     * ────────────────
     *
     * 📦 `MutationRecord` при `attributeOldValue: true` содержит:
     *
     * - `type`: "attributes"
     * - `attributeName`: название изменившегося атрибута ("class")
     * - `oldValue`: старое значение атрибута ("box")
     * - `target`: ссылка на элемент, где произошло изменение
     *
     * ────────────────
     *
     * 🔁 Пример использования `attributeFilter`:
     *
     * ```js
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ["style", "data-state"]
     * });
     *
     * ```
     *
     * 📌 Это помогает не следить за всем подряд и улучшает производительность.
     *
     * @type {Boolean}
     */
    attributeOldValue = false;

    /**
     * ⭐ `characterDataOldValue` — позволяет получить старое текстовое значение (`oldValue`) при изменении текстового узла.
     *
     * ### 📖 Описание
     *
     * - Работает только если указано `characterData: true`.
     * - Важно: `observe()` должен быть вызван именно на текстовом узле, а не на элементе.
     * - Без этой опции `oldValue` будет `null`.
     *
     * ### ✅ Пример:
     *
     * ```html
     *
     * <div id="message">Hello</div>
     *
     * ```
     *
     * ```js
     *
     * const textNode = document.getElementById("message").firstChild;
     *
     * const observer = new Observer((mutations) => {
     *     for (const m of mutations) {
     *         console.log("Текст изменён!");
     *         console.log("Старое значение:", m.oldValue);
     *         console.log("Новое значение:", m.target.data);
     *     }
     * });
     *
     * observer.observe(textNode, {
     *     characterData: true,
     *     characterDataOldValue: true
     * });
     *
     * // Изменение текста
     * setTimeout(() => {
     *     textNode.data = "Привет";
     * }, 1000);
     *
     * ```
     *
     * ────────────────
     *
     * 📦 `MutationRecord` будет содержать:
     *
     * - `type`: "characterData"
     * - `oldValue`: "Hello"
     * - `target.data`: "Привет" (новое значение)
     * - `target.nodeType`: 3 (текстовый узел)
     *
     * ────────────────
     *
     * ⚠️ Частая ошибка:
     *
     * ```js
     *
     * observer.observe(document.getElementById("message"), {
     *     characterData: true,
     *     characterDataOldValue: true
     * });
     * // ❌ Это не сработает — наблюдаемый узел должен быть текстовым, а не элементом.
     *
     * ```
     *
     * ✅ Нужно: использовать `.firstChild`, `.childNodes[i]` или рекурсивный поиск текстовых узлов.
     *
     * ────────────────
     *
     * 🔁 Совместно с `subtree`:
     *
     * Если нужно следить за изменением текста глубоко внутри вложенных элементов, добавьте `subtree: true`.
     * `Observer` сработает только если изменится текст в узле, находящемся внутри наблюдаемого дерева.
     *
     * @type {Boolean}
     */
    characterDataOldValue = false;

    /**
     * ⭐ `attributeFilter` — ограничивает наблюдение только указанными атрибутами.
     *
     * ### 📖 Описание
     *
     * - `Observer` будет срабатывать только если изменился атрибут из этого списка.
     * - Позволяет повысить производительность и сфокусировать наблюдение только на важных изменениях.
     * - Используется только вместе с `attributes: true`.
     *
     * ### ✅ Пример:
     *
     * ```html
     *
     * <div id="box" class="red" data-state="open" title="tooltip"></div>
     *
     * ```
     *
     * ```js
     *
     * const target = document.getElementById("box");
     *
     * const observer = new Observer((mutations) => {
     *     for (const m of mutations) {
     *         console.log("Изменился атрибут:", m.attributeName);
     *         console.log("Старое значение:", m.oldValue);
     *     }
     * });
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ["class", "data-state"]  // 👈 Только эти!
     * });
     *
     * // Это сработает:
     * target.setAttribute("class", "green");
     *
     * // Это НЕ вызовет observer:
     * target.setAttribute("title", "new tooltip");
     *
     * ```
     *
     * ────────────────
     *
     * 📦 Что вернёт MutationRecord:
     *
     * - `type`: "attributes"
     * - `attributeName`: "class" или "data-state"
     * - `oldValue`: предыдущее значение указанного атрибута
     *
     * ────────────────
     *
     * 🧠 Зачем использовать `attributeFilter`:
     *
     * - 📉 Улучшает производительность при большом количестве атрибутов.
     * - 🎯 Фокусирует наблюдение только на нужных изменениях.
     * - 🔍 Удобно, если важны, например, только `class`, `style`, `data-*`, но не `id`, `title` и т.п.
     *
     * 🚫 Без `attributeFilter` {@link Observer} будет срабатывать на любое изменение любого атрибута.
     *
     * ✅ Рекомендуемая связка:
     *
     * ```js
     *
     * observer.observe(target, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     attributeFilter: ["class", "style", "data-state"]
     * });
     *
     * ```
     *
     * @type {Array<string>}
     */
    attributeFilter = [];

    /**
     * 🏗️ `new()` — создаёт экземпляр билдера опций {@link ObserverOptionsBuilder}.
     *
     * ### 📖 Описание
     *
     * - Предоставляет удобный и безопасный способ пошаговой настройки параметров {@link Observer}.
     * - Используется вместо прямого создания {@link ObserverOptions}, если вы хотите настраивать параметры через цепочку методов.
     * - Возвращает {@link ObserverOptionsBuilder}, в котором доступны методы: `.withChildList()`, `.withAttributes()`, `.build()` и т.д.
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = ObserverOptions
     *     .new()
     *     .withChildList()
     *     .withSubtree()
     *     .build();
     *
     * const observer = new MutationObserver(callback);
     * observer.observe(target, options);
     *
     * ```
     *
     * 💡 Удобно использовать для более читаемой и масштабируемой конфигурации.
     *
     * @returns {ObserverOptionsBuilder}
     */
    static new() {
        return new ObserverOptionsBuilder();
    }
}

export default ObserverOptions;
