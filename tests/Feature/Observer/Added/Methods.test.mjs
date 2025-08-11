import { describe, test, expect } from '@jest/globals';
import Options from '/dist/ObserverOptions.mjs';
import Test from '/tests/TestObserver.mjs';
import Observer from '/dist/Observer.mjs';

describe('Observer', () => {
    describe('конструктор', () => {
        test('сохраняет callback, options и target', () => {
            const cb = () => {};
            const options = { childList: true };
            const target = document.createElement('div');
            const obs = new Observer(cb, options, target);

            expect(obs._callback).toBe(cb);
            expect(obs._options).toBe(options);
            expect(obs._target).toBe(target);
        });

        test('options и target могут быть не заданы', () => {
            const cb = () => {};
            const obs = new Observer(cb);
            expect(obs._options).toBeUndefined();
            expect(obs._target).toBeUndefined();
        });

        test('можно создать с только options', () => {
            const cb = () => {};
            const options = { childList: true };
            const obs = new Observer(cb, options);
            expect(obs._options).toBe(options);
            expect(obs._target).toBeUndefined();
        });

        test('можно создать с только target', () => {
            const cb = () => {};
            const target = document.createElement('div');
            const obs = new Observer(cb, undefined, target);

            expect(obs._options).toBeUndefined();
            expect(obs._target).toBe(target);
        });

        test('выбрасывает ошибку, если callback не является функцией', () => {
            expect(() => new Observer()).toThrow();
            expect(() => new Observer(null)).toThrow(
                "Failed to construct 'MutationObserver': parameter 1 is not a function",
            );
            expect(() => new Observer(123)).toThrow(
                "Failed to construct 'MutationObserver': parameter 1 is not a function",
            );
            expect(() => new Observer({})).toThrow(
                "Failed to construct 'MutationObserver': parameter 1 is not a function",
            );
        });

        test('корректно принимает только функцию в качестве callback', () => {
            const cb = () => {};
            expect(() => new Observer(cb)).not.toThrow();
        });
    });

    describe('метод observe()', () => {
        test('выбрасывает ошибку, если не указан target', async () => {
            const t = await Test.setupObserver(Options.children(), true);

            // Удаляем target вручную для проверки
            t.observer._target = undefined;

            expect(() => t.observer.observe()).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.",
            );

            t.teardownObserver();
        });

        test('выбрасывает ошибку, если не заданы параметры наблюдения', async () => {
            const t = await Test.setupObserver();

            expect(() => t.observer.observe(t.target())).toThrow(
                "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
            );

            t.teardownObserver();
        });

        test('выбрасывает ошибку, если опции невалидны (MutationObserver сам выбросит)', async () => {
            const t = await Test.setupObserver({}, true);

            expect(() => t.observer.observe(t.target())).toThrow(
                "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
            );

            t.teardownObserver();
        });

        test('не выбрасывает ошибку при валидных параметрах', async () => {
            const t = await Test.setupObserver(Options.children(), true);

            expect(() => t.observer.observe()).not.toThrow();

            t.teardownObserver();
        });

        test('observe(target, options) переопределяет параметры конструктора', async () => {
            const t = await Test.setupObserver({ childList: true }, true);

            // Передаём новые параметры, отличные от конструктора
            expect(() =>
                t.observer.observe(t.target(), { attributes: true }),
            ).not.toThrow();

            // Проверяем, что срабатывает именно на изменение атрибута, а не childList
            t.observer.disconnect();
            t.observer.observe(t.target(), { attributes: true });

            t.target().setAttribute('data-x', '1');
            await t.awaitMutation();

            t.expectToHaveBeenCalledTimes(1);
            t.expectToMatchObject({
                type: 'attributes',
                target: t.target(),
            });

            t.teardownObserver();
        });

        test('observe(target) использует параметры из конструктора', async () => {
            const t = await Test.setupObserver({ attributes: true }, true);

            expect(() => t.observer.observe(t.target())).not.toThrow();

            t.target().setAttribute('data-x', '2');
            await t.awaitMutation();

            t.expectToHaveBeenCalledTimes(1);
            t.expectToMatchObject({
                type: 'attributes',
                target: t.target(),
            });

            t.teardownObserver();
        });

        test('observe(options) использует target из конструктора', async () => {
            const t = await Test.setupObserver();

            expect(() =>
                t.observer.observe(undefined, { attributes: true }),
            ).not.toThrow();

            t.target().setAttribute('data-x', '3');
            await t.awaitMutation();

            t.expectToHaveBeenCalledTimes(1);
            t.expectToMatchObject({
                type: 'attributes',
                target: t.target(),
            });

            t.observer.disconnect();
            t.teardownObserver();
        });

        test('выбрасывает ошибку, если target не является DOM-узлом', async () => {
            const observer = new Observer(() => {});

            expect(() => observer.observe(123)).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'",
            );
            expect(() => observer.observe(null)).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'",
            );
            expect(() => observer.observe('div')).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'",
            );
        });

        test('выбрасывает ошибку, если options не является объектом', async () => {
            const t = await Test.setupObserver(Options.children(), true);

            expect(() => t.observer.observe(t.target(), 123)).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 2 is not an object.",
            );
            expect(() => t.observer.observe(t.target(), null)).toThrow(
                "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
            );
            expect(() => t.observer.observe(t.target(), 'options')).toThrow(
                "Failed to execute 'observe' on 'MutationObserver': parameter 2 is not an object.",
            );

            t.teardownObserver();
        });
    });
});
