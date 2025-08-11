import { describe, test, expect } from '@jest/globals';
import Options from '/dist/ObserverOptions.mjs';
import Test from '/tests/TestObserver.mjs';

describe('Observer', () => {
    describe('свойство isObserving', () => {
        test('по умолчанию равно false', async () => {
            const t = await Test.setupObserver(Options.children(), true);

            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('становится true после вызова observe()', async () => {
            const t = await Test.setupObserver(Options.children(), true);

            t.observer.observe();

            expect(t.observer.isObserving).toBe(true);

            t.teardownObserver();
        });

        test('становится false после disconnect()', async () => {
            const t = await Test.setupObserver(Options.children());

            t.observer.disconnect();

            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('после повторного observe() снова становится true', async () => {
            const t = await Test.setupObserver(Options.children());

            t.observer.disconnect();
            t.observer.observe();

            expect(t.observer.isObserving).toBe(true);

            t.teardownObserver();
        });

        test('не меняется при повторном disconnect()', async () => {
            const t = await Test.setupObserver(Options.children());

            t.observer.disconnect();
            t.observer.disconnect();

            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });
    });
});
