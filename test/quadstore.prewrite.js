
'use strict';

const _ = require('../dist/lib/utils');
const should = require('should');

module.exports = () => {

  describe('Quadstore preWrite option', () => {

    let quads;

    beforeEach(function () {
      const { dataFactory } = this;
      quads = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
      ];
    });

    it('should pre-write kvps when putting a quad', async function () {
      const { store } = this;
      await store.put(quads[0], {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

    it('should pre-write kvps when putting quads', async function () {
      const { store } = this;
      await store.multiPut(quads, {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

    it('should pre-write kvps when deleting a quad', async function () {
      const { store } = this;
      await store.put(quads[0]);
      await store.del(quads[0], {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

    it('should pre-write kvps when deleting quads', async function () {
      const { store } = this;
      await store.multiPut(quads);
      await store.multiDel(quads, {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

    it('should pre-write kvps when patching a quad', async function () {
      const { store } = this;
      await store.put(quads[0]);
      await store.patch(quads[0], quads[1], {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

    it('should pre-write kvps when patching quads', async function () {
      const { store } = this;
      await store.multiPut([quads[0]]);
      await store.multiPatch([quads[0]], [quads[1]], {
        preWrite: batch => batch.put('key1', Buffer.from('value1'))
      });
      const value = await _.pFromCallback(cb => store.db.get('key1', cb));
      should(Buffer.from('value1').equals(value)).be.true();
    });

  });

};
