import { describe, test, expect, jest } from '@jest/globals';
import observe from '../../dist/helpers/observe.mjs';

describe('observe()', () => {
    test('запускает наблюдение и вызывает callback при мутации', async () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        observe(target, { childList: true }, callback);

        const newChild = document.createElement('span');
        target.appendChild(newChild);

        await Promise.resolve();

        expect(callback).toHaveBeenCalled();
    });

    test('вызывает callback с массивом мутаций', async () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        observe(target, { childList: true }, callback);

        target.appendChild(document.createElement('p'));

        await Promise.resolve();

        const mutations = callback.mock.calls[0][0];
        expect(Array.isArray(mutations)).toBe(true);
        expect(mutations[0].type).toBe('childList');
    });

    test('не выбрасывает ошибок при валидных параметрах', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        expect(() => {
            observe(target, { childList: true }, callback);
        }).not.toThrow();
    });

    test('ничего не делает при пустом options (MutationObserver сам выбросит)', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        expect(() => {
            observe(target, {}, callback);
        }).toThrow(
            "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
        );
    });
});
