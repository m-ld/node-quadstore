
'use strict';

const _ = require('../dist/lib/utils');
const should = require('should');
const dataFactory = require('@rdfjs/data-model');

module.exports = () => {

  describe('QuadStore.prototype.del()', () => {

    it('should delete a quad correctly', async function () {
      const store = this.store;
      const quads = [
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
      ]
      await store.multiPut(quads);
      const { items: quadsBefore } = await store.get({});
      should(quadsBefore).be.equalToQuadArray(quads, store);
      await store.del(quadsBefore[0]);
      const { items: quadsAfter } = await store.get({});
      should(quadsAfter).be.equalToQuadArray([quads[1]], store);
    });

  });

};
