import Options from '/dist/ObserverOptions.mjs';
import Builder from '/dist/ObserverOptionsBuilder.mjs';
import Test from '/tests/TestObserverOptions.mjs';
import { describe, test, expect } from '@jest/globals';

describe('ObserverOptions', () => {
    test('по умолчанию содержит корректные значения', () => {
        Test.expect(new Options()).toEqual({
            childList: false,
            attributes: false,
            characterData: false,
            subtree: false,
            attributeOldValue: false,
            characterDataOldValue: false,
            attributeFilter: undefined,
        });
    });

    test('метод new возвращает экземпляр ObserverOptionsBuilder', () => {
        expect(Options.new()).toBeInstanceOf(Builder);
    });

    test('метод children возвращает опции для наблюдения за дочерними элементами', () => {
        Test.expect(Options.children()).toEqual({
            childList: true,
        });
    });

    test('метод descendants возвращает опции для наблюдения за потомками', () => {
        Test.expect(Options.descendants()).toEqual({
            childList: true,
            subtree: true,
        });
    });

    test('метод attributes возвращает опции для наблюдения за любыми атрибутами целевого элемента', () => {
        Test.expect(Options.attributes()).toEqual({
            attributes: true,
        });
    });

    test('метод attributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента', () => {
        Test.expect(Options.attributes(['class', 'data-state'])).toEqual({
            attributes: true,
            attributeFilter: ['class', 'data-state'],
        });
    });

    test('метод attributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента с сохранением старого значения атрибута', () => {
        Test.expect(Options.attributes(['class', 'data-state'], true)).toEqual({
            attributes: true,
            attributeFilter: ['class', 'data-state'],
            attributeOldValue: true,
        });
    });

    test('метод descendantAttributes возвращает опции для наблюдения за любыми атрибутами целевого элемента и его потомков', () => {
        Test.expect(Options.descendantAttributes()).toEqual({
            attributes: true,
            subtree: true,
        });
    });

    test('метод descendantAttributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента и его потомков', () => {
        Test.expect(
            Options.descendantAttributes(['class', 'data-state']),
        ).toEqual({
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'data-state'],
        });
    });

    test('метод descendantAttributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента и его потомков с сохранением старого значения атрибута', () => {
        Test.expect(
            Options.descendantAttributes(['class', 'data-state'], true),
        ).toEqual({
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'data-state'],
            attributeOldValue: true,
        });
    });

    test('метод text возвращает опции для наблюдения за текстом в текстовом узле', () => {
        Test.expect(Options.text()).toEqual({
            characterData: true,
        });
    });

    test('метод text возвращает опции для наблюдения за текстом в текстовом узле с сохранением старого значения', () => {
        Test.expect(Options.text(true)).toEqual({
            characterData: true,
            characterDataOldValue: true,
        });
    });

    test('метод descendantText возвращает опции для наблюдения за текстом в целевом элементе и его потомках', () => {
        Test.expect(Options.descendantText()).toEqual({
            characterData: true,
            subtree: true,
        });
    });

    test('метод descendantText возвращает опции для наблюдения за текстом в целевом элементе и его потомках с сохранением старого значения', () => {
        Test.expect(Options.descendantText(true)).toEqual({
            characterData: true,
            characterDataOldValue: true,
            subtree: true,
        });
    });

    test('метод content возвращает опции для наблюдения за содержимом внутри целевого элемента', () => {
        Test.expect(Options.content()).toEqual({
            childList: true,
            characterData: true,
            subtree: true,
        });
    });

    test('метод content возвращает опции для наблюдения за содержимом внутри целевого элемента с сохранением старого значения', () => {
        Test.expect(Options.content(true)).toEqual({
            childList: true,
            characterData: true,
            subtree: true,
            characterDataOldValue: true,
        });
    });

    test('метод all возвращает опции для наблюдения за всеми изменениями', () => {
        Test.expect(Options.all()).toEqual({
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
        });
    });

    test('метод all возвращает опции для наблюдения за всеми изменениями с сохранением старых значений', () => {
        Test.expect(Options.all(true)).toEqual({
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true,
        });
    });

    test('при передаче объекта ObserverOptions в MutationObserver без изменения опций, будет выброшена ошибка', () => {
        expect(() =>
            new MutationObserver(() => {}).observe(
                document.body,
                new Options(),
            ),
        ).toThrow(
            "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
        );
    });
});
