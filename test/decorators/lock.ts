/*!
 * lock() Function Unit Tests
 *
 * Copyright (c) 2018, Mykhailo Stadnyk <mikhus@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
import { expect } from 'chai';
import { lock } from '../..';

class TestLockClass {

    @lock()
    public async dynamicLock() {
        return Math.random() * Math.random() + Math.random();
    }

    @lock()
    public static async staticLock() {
        return Math.random() * Math.random() + Math.random();
    }

    @lock()
    public static nonPromised() {
        return Math.random() * Math.random() + Math.random();
    }

    @lock()
    public static async rejected() {
        throw new Error('Rejected!');
    }

}

describe('decorators/lock()', () => {
    it('should be a function', () => {
        expect(typeof lock).to.equal('function');
    });

    it('should return decorator function', () => {
        expect(typeof lock()).to.equal('function');
    });

    it('should resolve all called with the first resolved', async  () => {
        const obj = new TestLockClass();
        const results = [...new Set(await Promise.all(
            new Array(10).fill(0).map(() => obj.dynamicLock())
        ))];
        expect(results.length).to.equal(1);
    });

    it('should work for static methods as well', async  () => {
        const results = [...new Set(await Promise.all(
            new Array(10).fill(0).map(() => TestLockClass.staticLock())
        ))];
        expect(results.length).to.equal(1);
    });

    it('should work with non-promised methods as well', async () => {
        const results = [...new Set(await Promise.all(
            new Array(10).fill(0).map(() => TestLockClass.nonPromised())
        ))];
        expect(results.length).to.equal(1);
    });

    it('should be turned off if DISABLE_LOCKS env var set', async () => {
        process.env['DISABLE_LOCKS'] = '1';
        const results = [...new Set(await Promise.all(
            new Array(10).fill(0).map(() => TestLockClass.staticLock())
        ))];
        expect(results.length).to.equal(10);
    });
});