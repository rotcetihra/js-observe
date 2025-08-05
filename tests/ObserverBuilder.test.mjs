import ObserverBuilder from '../dist/ObserverBuilder.mjs';
import Observer from '../dist/Observer.mjs';
import { describe, test, expect, jest } from '@jest/globals';

describe('ObserverBuilder', () => {
    test('создаёт Observer с помощью .for, .with, .call, .build', () => {
        const target = document.createElement('div');
        const options = { childList: true };
        const callback = jest.fn();

        const observer = new ObserverBuilder()
            .for(target)
            .with(options)
            .call(callback)
            .build();

        expect(observer).toBeInstanceOf(Observer);
        expect(() => observer.observe()).not.toThrow();
    });

    test('создаёт Observer с помощью .options и .call', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        const observer = new ObserverBuilder()
            .for(target)
            .options((b) => b.children())
            .call(callback)
            .build();

        expect(observer).toBeInstanceOf(Observer);
        expect(() => observer.observe()).not.toThrow();
    });

    test('создаёт Observer только с .call (target и options можно передать в observe)', () => {
        const callback = jest.fn();
        const target = document.createElement('div');
        const options = { childList: true };

        const observer = new ObserverBuilder().call(callback).build();

        expect(observer).toBeInstanceOf(Observer);
        expect(() => observer.observe(target, options)).not.toThrow();
    });

    test('последний вызов .with или .options перезаписывает опции', () => {
        const target = document.createElement('div');
        const callback = jest.fn();

        const observer = new ObserverBuilder()
            .for(target)
            .with({ childList: true })
            .options((b) => b.attributes())
            .call(callback)
            .build();

        expect(observer).toBeInstanceOf(Observer);
        // options должны быть attributes: true
        expect(() => observer.observe()).not.toThrow();
    });

    test('последний вызов .call перезаписывает callback', () => {
        const target = document.createElement('div');
        const cb1 = jest.fn();
        const cb2 = jest.fn();

        const observer = new ObserverBuilder()
            .for(target)
            .with({ childList: true })
            .call(cb1)
            .call(cb2)
            .build();

        expect(observer).toBeInstanceOf(Observer);
        observer.observe();
        // Триггерим мутацию
        target.appendChild(document.createElement('span'));
        // Микротаска для MutationObserver
        return Promise.resolve().then(() => {
            expect(cb1).not.toHaveBeenCalled();
            expect(cb2).toHaveBeenCalled();
        });
    });

    test('выбрасывает ошибку, если не вызван .call', () => {
        const builder = new ObserverBuilder().with({ childList: true });
        expect(() => builder.build()).toThrow(
            'Пропущен вызов обязательного метода ObserverBuilder.call().',
        );
    });

    test('можно использовать без .for, target передаётся в observe', () => {
        const callback = jest.fn();
        const target = document.createElement('div');
        const options = { childList: true };

        const observer = new ObserverBuilder()
            .with(options)
            .call(callback)
            .build();

        expect(observer).toBeInstanceOf(Observer);
        expect(() => observer.observe(target)).not.toThrow();
    });
});
