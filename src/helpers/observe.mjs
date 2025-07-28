import Observer from '../Observer.mjs';

/**
 * 🚀 Упрощённая функция-обёртка `observe()` для быстрого запуска наблюдения за DOM-изменениями.
 *
 * Создаёт новый экземпляр {@link Observer}, сразу запускает его и не сохраняет ссылку на наблюдатель.
 * Подходит для одноразовых или "fire-and-forget" сценариев, когда не нужно отключать наблюдение вручную.
 *
 * ---
 *
 * ### 📌 Назначение:
 *
 * - Быстро начать отслеживание изменений без ручного создания {@link Observer}.
 * - Идеально для коротких наблюдений, отладочных задач или разовых эффектов.
 *
 * ---
 *
 * ### ✅ Пример:
 *
 * ```js
 *
 * observe(document.body, { childList: true, subtree: true }, (mutations) => {
 *     console.log('Изменения в DOM:', mutations);
 * });
 *
 * ```
 *
 * ---
 *
 * ### ⚠️ Важно:
 *
 * - Невозможно отключить наблюдение, т.к. объект {@link Observer} не сохраняется.
 * - Обязательно указать хотя бы один из параметров: `childList`, `attributes` или `characterData`.
 *
 * ---
 *
 * @param {Node} target - DOM-узел, за которым нужно наблюдать.
 * @param {ObserverOptions} options - Параметры наблюдения (`childList`, `attributes`, `characterData`, и др.).
 * @param {MutationCallback} callback - Функция, вызываемая при обнаружении изменений.
 *
 * @returns {void}
 * @function observe
 */
export default function observe(target, options, callback) {
    new Observer(callback, options, target).observe();
}
