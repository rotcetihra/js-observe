import { jest } from '@jest/globals';
import Observer from '/dist/Observer.mjs';
import { expect } from '@jest/globals';

class TestObserver {
    dom;
    observer;
    native;
    observerCallback;
    nativeCallback;
    options;
    target;

    constructor(
        options,
        target = '#root',
        dom = '<div id="root"><p id="child">child</p>root</div>',
    ) {
        this.options = options;

        if (typeof target === 'string') {
            this.target = () => document.querySelector(target);
        } else if (typeof target === 'function') {
            this.target = target;
        } else {
            throw new Error();
        }

        this.dom = dom;
    }

    static async setup(
        options,
        target = '#root',
        dom = '<div id="root"><p id="child">child</p>root</div>',
        notObserve = false,
    ) {
        if (options === undefined) {
            notObserve = true;
        }

        if (typeof options === 'boolean') {
            notObserve = options;
            options = undefined;
        }

        if (typeof target === 'boolean') {
            notObserve = target;
            target = '#root';
        }

        if (typeof dom === 'boolean') {
            notObserve = dom;
            dom = '<div id="root"><p id="child">child</p>root</div>';
        }

        const test = new TestObserver(options, target, dom);

        await test.setup(notObserve);

        return test;
    }

    static async setupObserver(
        options,
        target = '#root',
        dom = '<div id="root"><p id="child">child</p>root</div>',
        notObserve = false,
    ) {
        if (options === undefined) {
            notObserve = true;
        }

        if (typeof options === 'boolean') {
            notObserve = options;
            options = undefined;
        }

        if (typeof target === 'boolean') {
            notObserve = target;
            target = '#root';
        }

        if (typeof dom === 'boolean') {
            notObserve = dom;
            dom = '<div id="root"><p id="child">child</p>root</div>';
        }

        const test = new TestObserver(options, target, dom);

        await test.setupObserver(notObserve);

        return test;
    }

    async setup(notObserve = false) {
        document.body.innerHTML = this.dom;

        await this.awaitMutation();

        this.observerCallback = jest.fn();

        this.observer = new Observer(
            this.observerCallback,
            this.options,
            this.target(),
        );

        if (!notObserve) {
            this.observer.observe();
        }

        this.nativeCallback = jest.fn();

        this.native = new MutationObserver(this.nativeCallback);

        if (!notObserve) {
            this.native.observe(this.target(), this.options);
        }
    }

    teardown() {
        this.observer.disconnect();
        this.native.disconnect();
    }

    teardownObserver() {
        this.observer.disconnect();
    }

    async setupObserver(notObserve = false) {
        document.body.innerHTML = this.dom;

        await this.awaitMutation();

        this.observerCallback = jest.fn();

        this.observer = new Observer(
            this.observerCallback,
            this.options,
            this.target(),
        );

        if (!notObserve) {
            this.observer.observe();
        }
    }

    teardownObserver() {
        this.observer.disconnect();
    }

    async awaitMutation() {
        return new Promise((resolve) => queueMicrotask(resolve));
    }

    async removeChild(child = '#child') {
        this.target().removeChild(document.querySelector(child));

        await this.awaitMutation();
    }

    el(target) {
        return this.target().querySelector(target);
    }

    child(child = '#child') {
        return this.el(child);
    }

    expectBothToHaveBeenCalledTimes(times) {
        expect(this.observerCallback).toHaveBeenCalledTimes(times);
        expect(this.nativeCallback).toHaveBeenCalledTimes(times);
    }

    expectToHaveBeenCalledTimes(times) {
        expect(this.observerCallback).toHaveBeenCalledTimes(times);
    }

    expectBothToMatchObject(object) {
        expect(this.observerCallback).toHaveBeenCalled();
        expect(this.nativeCallback).toHaveBeenCalled();

        for (const p in object) {
            const v = object[p];

            expect(this.observerCallback.mock.calls[0][0][0][p]).toBe(v);
            expect(this.nativeCallback.mock.calls[0][0][0][p]).toBe(v);
        }
    }

    expectToMatchObject(object) {
        expect(this.observerCallback).toHaveBeenCalled();

        for (const p in object) {
            const v = object[p];

            expect(this.observerCallback.mock.calls[0][0][0][p]).toBe(v);
        }
    }

    expectBothNotToHaveBeenCalled() {
        expect(this.observerCallback).not.toHaveBeenCalled();
        expect(this.nativeCallback).not.toHaveBeenCalled();
    }

    expectNotToHaveBeenCalled() {
        expect(this.observerCallback).not.toHaveBeenCalled();
    }

    callbackMockClear() {
        this.observerCallback.mockClear();
        this.nativeCallback.mockClear();
    }

    callbackObserverMockClear() {
        this.observerCallback.mockClear();
    }
}

export default TestObserver;
