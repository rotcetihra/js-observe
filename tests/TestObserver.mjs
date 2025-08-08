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
    ) {
        const test = new TestObserver(options, target, dom);

        await test.setup();

        return test;
    }

    static async setupObserver(
        options,
        target = '#root',
        dom = '<div id="root"><p id="child">child</p>root</div>',
    ) {
        const test = new TestObserver(options, target, dom);

        await test.setupObserver();

        return test;
    }

    async setup() {
        document.body.innerHTML = this.dom;

        await this.awaitMutation();

        this.observerCallback = jest.fn();

        this.observer = new Observer(
            this.observerCallback,
            this.options,
            this.target(),
        );

        this.observer.observe();

        this.nativeCallback = jest.fn();

        this.native = new MutationObserver(this.nativeCallback);

        this.native.observe(this.target(), this.options);
    }

    teardown() {
        this.observer.disconnect();
        this.native.disconnect();
    }

    teardownObserver() {
        this.observer.disconnect();
    }

    async setupObserver() {
        document.body.innerHTML = this.dom;

        await this.awaitMutation();

        this.observerCallback = jest.fn();

        this.observer = new Observer(
            this.observerCallback,
            this.options,
            this.target(),
        );

        this.observer.observe();
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

        expect(this.observerCallback.mock.calls[0][0][0]).toMatchObject(object);
        expect(this.nativeCallback.mock.calls[0][0][0]).toMatchObject(object);
    }

    expectToMatchObject(object) {
        expect(this.observerCallback).toHaveBeenCalled();

        expect(this.observerCallback.mock.calls[0][0][0]).toMatchObject(object);
    }

    expectBothNotToHaveBeenCalled() {
        expect(this.observerCallback).not.toHaveBeenCalled();
        expect(this.nativeCallback).not.toHaveBeenCalled();
    }

    expectNotToHaveBeenCalled() {
        expect(this.observerCallback).not.toHaveBeenCalled();
    }
}

export default TestObserver;
