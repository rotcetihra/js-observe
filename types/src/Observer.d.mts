export default Observer;
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
     * @returns {ObserverBuilder} Экземпляр билдера {@link ObserverBuilder}, из которого можно собрать {@link Observer}.
     */
    static "new"(): ObserverBuilder;
    /**
     *
     * @param {MutationCallback} callback
     * @param {ObserverOptions|MutationObserverInit|null} options
     * @param {Node|null} target
     */
    constructor(callback: MutationCallback, options?: ObserverOptions | MutationObserverInit | null, target?: Node | null);
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
     * @param {Node|null} [target] - DOM-узел, за которым будет вестись наблюдение.
     * @param {ObserverOptions|MutationObserverInit|null} [options] - Объект параметров наблюдения.
     * @throws {TypeError} Если `target` не является допустимым DOM-узлом.
     * @throws {SyntaxError} Если не указана ни одна из обязательных опций (`childList`, `attributes`, `characterData`).
     */
    observe(target?: Node | null, options?: ObserverOptions | MutationObserverInit | null): void;
    #private;
}
import ObserverOptions from './ObserverOptions.mjs';
import ObserverBuilder from './ObserverBuilder.mjs';
