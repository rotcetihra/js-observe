import Options from '/dist/ObserverOptions.mjs';
import Builder from '/dist/ObserverOptionsBuilder.mjs';
import Test from '/tests/TestObserverOptions.mjs';
import { describe, test, expect } from '@jest/globals';

describe('ObserverOptionsBuilder', () => {
    describe('создаёт опции', () => {
        test('для дочерних элементов', () => {
            Test.expect(new Builder().children().build()).toEqual({
                childList: true,
            });
        });

        test('для потомков', () => {
            Test.expect(new Builder().descendants().build()).toEqual({
                childList: true,
                subtree: true,
            });
        });

        test('для любых атрибутов', () => {
            Test.expect(new Builder().attributes().build()).toEqual({
                attributes: true,
            });
        });

        test('для конкретных атрибутов', () => {
            Test.expect(
                new Builder().attributes(['class', 'id']).build(),
            ).toEqual({
                attributes: true,
                attributeFilter: ['class', 'id'],
            });
        });

        test('для любых атрибутов потомков', () => {
            Test.expect(new Builder().descendantAttributes().build()).toEqual({
                attributes: true,
                subtree: true,
            });
        });

        test('для конкретных атрибутов потомков', () => {
            Test.expect(
                new Builder().descendantAttributes(['class', 'id']).build(),
            ).toEqual({
                attributes: true,
                subtree: true,
                attributeFilter: ['class', 'id'],
            });
        });

        test('для текста в конкретном текстовом узле', () => {
            Test.expect(new Builder().text().build()).toEqual({
                characterData: true,
            });
        });

        test('для текста в любом текстовом узле внутри целевого элемента', () => {
            Test.expect(new Builder().descendantText().build()).toEqual({
                characterData: true,
                subtree: true,
            });
        });

        test('для отслеживания изменений в потомках', () => {
            Test.expect(new Builder().children().subtree().build()).toEqual({
                childList: true,
                subtree: true,
            });
        });

        test('для получения старого значения атрибута', () => {
            Test.expect(
                new Builder().attributes().useOldValue().build(),
            ).toEqual({
                attributes: true,
                attributeOldValue: true,
            });
        });

        test('для получения старого значения текста', () => {
            Test.expect(new Builder().text().useOldValue().build()).toEqual({
                characterData: true,
                characterDataOldValue: true,
            });
        });

        test('для получения старого значения текста и атрибута', () => {
            Test.expect(
                new Builder().text().attributes().useOldValue().build(),
            ).toEqual({
                attributes: true,
                characterData: true,
                attributeOldValue: true,
                characterDataOldValue: true,
            });
        });

        test('для отслеживания изменений содержимого целевого элемента', () => {
            Test.expect(new Builder().content().build()).toEqual({
                childList: true,
                characterData: true,
                subtree: true,
            });
        });

        test('для отслеживания всех изменений', () => {
            Test.expect(new Builder().all().build()).toEqual({
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true,
            });
        });
    });

    describe('выбрасывает ошибку, если', () => {
        test('не вызваны методы attributes()/text() до вызова useOldValue', () => {
            expect(() => new Builder().useOldValue()).toThrow(
                'ObserverOptionsBuilder.useOldValue() требует предварительного вызова attributes() и/или text()',
            );
        });

        test('не указан тип наблюдаемых изменений', () => {
            expect(() => new Builder().subtree().build()).toThrow(
                'ObserverOptionsBuilder.build() требует включить хотя бы один тип наблюдения: childList(), attributes() или text()',
            );
        });
    });

    test('build возвращает один и тот же объект при повторных вызовах', () => {
        const builder = new Builder().children();

        const opts1 = builder.build();
        const opts2 = builder.build();

        expect(opts1).toBe(opts2);
        expect(opts1).toBeInstanceOf(Options);
    });
});
