import ObserverBuilder from './ObserverBuilder.mjs';
import ObserverOptions from './ObserverOptions.mjs';
/**
 * 🧭 `Observer` — удобная обёртка над стандартным `MutationObserver` с предустановленными параметрами и (опционально) целевым DOM-узлом.
 *
 * Класс инкапсулирует логику повторного использования конфигурации и узла, позволяя отслеживать изменения
 * в разных элементах без повторного указания одних и тех же опций.
 *
 * ---
 *
 * ### ⚙️ Назначение:
 *
 * - Повторно использовать один и тот же набор опций для нескольких элементов.
 * - Упростить вызов `.observe()` без необходимости передавать конфигурацию и узел каждый раз.
 * - Опционально задать целевой узел наблюдения в конструкторе.
 *
 * ---
 *
 * ### 📐 Сигнатура конструктора:
 *
 * ```ts
 *
 * new Observer(callback, options?, target?)
 *
 * ```
 *
 * - `callback` `{MutationCallback}` — вызывается при каждом изменении.
 * - `options` `{MutationObserverInit}` — конфигурация (например, `{ childList: true, subtree: true }`).
 * - `target` `{Node}` — DOM-узел, за которым нужно следить по умолчанию.
 *
 * ---
 *
 * ### ✅ Пример использования:
 *
 * ```js
 *
 * const observer = new Observer((mutations) => {
 *     for (const m of mutations) {
 *         console.log(m);
 *     }
 * }, {
 *     childList: true,
 *     subtree: true
 * }, document.body);
 *
 * observer.observe(); // будет использовать document.body и указанные опции
 * observer.observe(document.querySelector('#header')); // target переопределён
 *
 * ```
 *
 * ---
 *
 * ### ⚠️ Важно:
 *
 * По спецификации `MutationObserver` необходимо указать хотя бы один из следующих параметров:
 *
 * - `childList`
 * - `attributes`
 * - `characterData`
 *
 * В противном случае вызов `.observe()` приведёт к исключению: `An invalid or illegal string was specified`
 *
 * @class
 * @extends MutationObserver
 */
declare class Observer extends MutationObserver {
    /**
     * ⚙️ Конфигурация для {@link Observer}.
     *
     * Содержит параметры, указывающие, какие типы изменений в DOM необходимо отслеживать:
     *
     * - `childList`: отслеживание добавления/удаления узлов.
     * - `attributes`: отслеживание изменений атрибутов.
     * - `characterData`: отслеживание изменений текста.
     * - `subtree`, `attributeOldValue`, `characterDataOldValue`, `attributeFilter` и др.
     *
     * Значение передаётся в метод `.observe()` при вызове.
     *
     * @readonly
     * @type {ObserverOptions | MutationObserverInit | undefined}
     * @protected
     */
    protected readonly _options?: ObserverOptions | MutationObserverInit;
    /**
     * 🎯 Целевой DOM-узел для наблюдения по умолчанию.
     *
     * Используется в методе `observe()`, если не был явно передан `target`.
     * Позволяет задать основной элемент для отслеживания прямо при создании экземпляра {@link Observer},
     * избавляя от необходимости указывать его каждый раз.
     *
     * ---
     *
     * ### Применение:
     *
     * Если `observe()` вызывается без аргументов, будет использован `#target`.
     *
     * ---
     *
     * ### Пример:
     *
     * ```js
     *
     * const observer = new Observer(callback, options, document.body);
     *
     * observer.observe(); // будет использован document.body
     *
     * ```
     *
     * @readonly
     * @type {Node | undefined}
     * @protected
     */
    protected readonly _target?: Node;
    /**
     * 📞 Callback-функция, вызываемая при каждом изменении DOM.
     *
     * Передаётся в конструктор и используется как основной обработчик мутаций.
     * Сигнатура: `(mutations: MutationRecord[], observer: MutationObserver) => void`
     *
     * ---
     *
     * ### Пример:
     * ```js
     * const observer = new Observer((mutations) => {
     *     mutations.forEach(m => console.log(m));
     * });
     * ```
     *
     * ---
     *
     * @readonly
     * @type {MutationCallback}
     * @protected
     */
    protected readonly _callback: MutationCallback;
    /**
     *
     * @param {MutationCallback} callback
     * @param {ObserverOptions | MutationObserverInit | undefined} options
     * @param {Node | undefined} target
     */
    constructor(callback: MutationCallback, options?: ObserverOptions | MutationObserverInit, target?: Node);
    /**
     * 🛰️ Запускает отслеживание изменений в DOM-узле.
     *
     * Обёртка над `MutationObserver.observe()`, использующая параметры и целевой узел,
     * заданные в конструкторе, либо переопределяемые вручную при вызове.
     *
     * ────────────────
     *
     * 📝 **Что можно отслеживать:**
     *
     * - ➕➖ добавление/удаление дочерних элементов (`childList`)
     * - 🏷️ изменения атрибутов (`attributes`)
     * - 📝✏️ изменения текстового содержимого (`characterData`)
     * - 🌳 изменения во вложенных узлах (`subtree`)
     *
     * ────────────────
     *
     * ⚠️ **Важно:**
     *
     * По спецификации `MutationObserver`, обязательно должна быть указана хотя бы одна из опций:
     *
     * - `childList`
     * - `attributes`
     * - `characterData`
     *
     * Иначе будет выброшено исключение: `"An invalid or illegal string was specified"`
     *
     * ────────────────
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log(mutation);
     *     }
     * }, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     subtree: true
     * },
     * document.getElementById('app'));
     *
     * observer.observe();
     *
     * // или переопределить target и options вручную:
     * observer.observe(document.querySelector('#header'), { childList: true });
     *
     * ```
     *
     * @param {Node|undefined} [target] - DOM-узел, за которым будет вестись наблюдение.
     * @param {ObserverOptions|MutationObserverInit|undefined} [options] - Объект параметров наблюдения.
     * @throws {TypeError} Если `target` не является допустимым DOM-узлом.
     * @throws {SyntaxError} Если не указана ни одна из обязательных опций (`childList`, `attributes`, `characterData`).
     * @returns {void}
     */
    observe(target?: Node, options?: ObserverOptions | MutationObserverInit): void;
    /**
     * 🔌 Отключает наблюдение за всеми ранее отслеживаемыми DOM-узлами.
     *
     * Обёртка над стандартным методом `MutationObserver.disconnect()`.
     *
     * Прекращает получение уведомлений обо всех изменениях, за которыми следил данный {@link Observer}.
     *
     * ---
     *
     * ### 🧹 Когда использовать:
     *
     * - Когда наблюдение больше не требуется.
     * - Чтобы освободить ресурсы и предотвратить утечки памяти.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new Observer(callback, { childList: true }, document.body);
     * observer.observe();
     *
     * // Через некоторое время...
     * observer.disconnect(); // Отключение отслеживания
     *
     * ```
     *
     * ---
     *
     * @returns {void}
     */
    disconnect(): void;
    /**
     * 📦 Получает все накопленные, но ещё не обработанные записи об изменениях.
     *
     * Метод возвращает массив объектов `MutationRecord`, которые были зафиксированы,
     * но ещё не переданы в `callback` наблюдателя (например, если изменения произошли,
     * но `callback` ещё не был вызван из-за задержки обработки очереди событий).
     *
     * ---
     *
     * ### 🧠 Когда использовать:
     *
     * - Когда нужно немедленно получить список изменений без ожидания вызова колбэка.
     * - В ситуациях с ручным управлением или синхронной обработкой изменений.
     *
     * ---
     *
     * ### 📝 Примечание:
     *
     * Метод **не очищает очередь изменений** в `MutationObserver`. Он **забирает** накопленные записи и очищает её.
     * Повторный вызов вернёт пустой массив, если не произошло новых изменений.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new Observer(() => {}, { childList: true }, document.body);
     * observer.observe();
     *
     * // Изменение DOM
     * document.body.appendChild(document.createElement('div'));
     *
     * const records = observer.takeRecords();
     * console.log(records); // Выведет массив с MutationRecord
     *
     * ```
     *
     * ---
     *
     * @returns {MutationRecord[]}
     */
    takeRecords(): MutationRecord[];
    /**
     * 🆕 `Observer.new()` — удобный способ создания {@link Observer} с помощью билдера {@link ObserverBuilder}.
     *
     * ---
     *
     * ### 📖 Назначение:
     *
     * Предоставляет fluent-интерфейс для создания {@link Observer} с пошаговой конфигурацией:
     *
     * - целевого DOM-узла (`for(...)`)
     * - параметров наблюдения (`with(...)` или `options(builder => ...)`)
     * - колбэка (`call(...)`)
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = Observer
     *     .new()
     *     .for(document.body)
     *     .options((builder) =>
     *         builder
     *             .descendants()
     *             .attributes(['data-id'])
     *             .text()
     *             .useOldValue()
     *     )
     *     .call((mutations) => {
     *         console.log('Mutations:', mutations);
     *     })
     *     .build();
     *
     * observer.observe();
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverBuilder}
     */
    static new(): ObserverBuilder;
}
export default Observer;
