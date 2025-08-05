import { describe, test, expect, jest } from '@jest/globals';
import observer from '../../dist/helpers/observer.mjs';
import ObserverBuilder from '../../dist/ObserverBuilder.mjs';
import Observer from '../../dist/Observer.mjs';

describe('observer()', () => {
    test('возвращает экземпляр ObserverBuilder', () => {
        const builder = observer();

        expect(builder).toBeInstanceOf(ObserverBuilder);
    });

    test('позволяет собрать Observer через fluent-интерфейс', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        const built = observer()
            .for(target)
            .options((b) => b.children())
            .call(callback)
            .build();

        expect(built).toBeInstanceOf(Observer);
        expect(() => built.observe()).not.toThrow();
    });

    test('работает с .with вместо .options', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        const built = observer()
            .for(target)
            .with({ childList: true })
            .call(callback)
            .build();

        expect(built).toBeInstanceOf(Observer);
        expect(() => built.observe()).not.toThrow();
    });

    test('работает без указания .for — target можно передать в observe', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        const built = observer()
            .with({ childList: true })
            .call(callback)
            .build();

        expect(() => built.observe(target)).not.toThrow();
    });

    test('выбрасывает ошибку, если не указан .call', () => {
        const builder = observer().with({ childList: true });

        expect(() => builder.build()).toThrow(
            'Пропущен вызов обязательного метода ObserverBuilder.call().',
        );
    });
});
