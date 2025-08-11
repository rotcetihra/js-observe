import { describe, test, expect } from '@jest/globals';
import Options from '/dist/ObserverOptions.mjs';
import Test from '/tests/TestObserver.mjs';
import Observer from '/dist/Observer.mjs';

describe('Observer', () => {
    describe('поведение методов соответствует MutationObserver', () => {
        describe('конструктор', () => {
            test('создаёт экземпляр без ошибок', () => {
                const cb = () => {};

                expect(() => new Observer(cb)).not.toThrow();
                expect(() => new MutationObserver(cb)).not.toThrow();
                expect(new Observer(cb)).toBeInstanceOf(Observer);
            });
        });

        describe('метод observe()', () => {
            test('принимает первым параметром целевой узел, а вторым опции', async () => {
                const t = await Test.setup();

                t.observer.observe(t.target(), Options.children());
                t.native.observe(t.target(), Options.children());

                await t.removeChild();

                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.target(),
                });

                t.teardown();
            });

            test('можно следить за несколькими целевыми узлами', async () => {
                const t = await Test.setup(Options.children());

                document.body.appendChild(document.createElement('div'));

                await t.awaitMutation();

                t.observer.observe(document.body.lastChild, Options.children());
                t.native.observe(document.body.lastChild, Options.children());

                document.body.lastChild.appendChild(
                    document.createElement('span'),
                );

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: document.body.lastChild,
                });

                t.callbackMockClear();

                await t.removeChild();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.target(),
                });

                t.teardown();
            });

            test('повторный вызов не вызывает ошибок', async () => {
                const t = await Test.setup(Options.children());

                expect(() => t.observer.observe()).not.toThrow();
                expect(() => t.observer.observe()).not.toThrow();
                expect(() =>
                    t.native.observe(document.body, Options.children()),
                ).not.toThrow();
                expect(() =>
                    t.native.observe(document.body, Options.children()),
                ).not.toThrow();

                t.teardown();
            });
        });

        describe('метод disconnect()', () => {
            test('повторный вызов не вызывает ошибок', async () => {
                const t = await Test.setup(Options.children());

                expect(() => t.observer.disconnect()).not.toThrow();
                expect(() => t.observer.disconnect()).not.toThrow();
                expect(() => t.native.disconnect()).not.toThrow();
                expect(() => t.native.disconnect()).not.toThrow();

                t.teardown();
            });
        });

        describe('метод takeRecords()', () => {
            test('возвращает массив MutationRecord', async () => {
                const t = await Test.setup(Options.children());

                t.target().appendChild(document.createElement('span'));

                const observerRecords = t.observer.takeRecords();
                const nativeRecords = t.native.takeRecords();

                expect(Array.isArray(observerRecords)).toBe(true);
                expect(observerRecords[0]).toHaveProperty('type');

                expect(Array.isArray(nativeRecords)).toBe(true);
                expect(nativeRecords[0]).toHaveProperty('type');

                t.teardown();
            });

            test('takeRecords очищает очередь изменений', async () => {
                const t = await Test.setup(Options.children());

                t.target().appendChild(document.createElement('span'));

                t.observer.takeRecords();
                t.native.takeRecords();

                expect(t.observer.takeRecords().length).toBe(0);
                expect(t.native.takeRecords().length).toBe(0);

                t.teardown();
            });

            test('takeRecords возвращает пустой массив, если изменений не было', async () => {
                const t = await Test.setup(Options.children());

                const observerRecords = t.observer.takeRecords();
                const nativeRecords = t.native.takeRecords();

                expect(Array.isArray(observerRecords)).toBe(true);
                expect(observerRecords.length).toBe(0);

                expect(Array.isArray(nativeRecords)).toBe(true);
                expect(nativeRecords.length).toBe(0);

                t.teardown();
            });
        });
    });
});
