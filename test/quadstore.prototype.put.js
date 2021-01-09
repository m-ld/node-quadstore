
const should = require('./should');
const { ArrayIterator } = require('asynciterator');
const { streamToArray } = require('../dist/lib/utils');
const { Scope } = require('../dist/lib/scope');
const { LevelIterator } = require('../dist/lib/get/leveliterator');

module.exports = () => {

  describe('Quadstore.prototype.put()', () => {

    it('should store a single quad', async function () {
      const { dataFactory, store } = this;
      const newQuad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.namedNode('ex://o'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(newQuad);
      const {items: foundQuads} = await store.get({});
      should(foundQuads).be.equalToQuadArray([newQuad], store);
    });

    it('should store multiple quads', async function () {
      const { dataFactory, store } = this;
      const newQuads = [
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
      await store.put(newQuads[0]);
      await store.put(newQuads[1]);
      const {items: foundQuads} = await store.get({});
      should(foundQuads).be.equalToQuadArray(newQuads, store);
    });

    it('should not duplicate quads', async function () {
      const { dataFactory, store } = this;
      const newQuads = [
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
      await store.put(newQuads[0]);
      await store.put(newQuads[1]);
      await store.put(newQuads[1]);
      const {items: foundQuads} = await store.get({});
      should(foundQuads).be.equalToQuadArray(newQuads, store);
    });

  });

  describe('Quadstore.prototype.put() with scope', () => {

    it('Should transform blank node labels', async function () {
      const {dataFactory, store} = this;
      const scope = await store.initScope();
      const quadA = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quadA, { scope });
      const { items: [quadB] } = await store.get({});
      should(quadB.subject.equals(quadA.subject)).be.true();
      should(quadB.predicate.equals(quadA.predicate)).be.true();
      should(quadB.object.equals(quadA.object)).be.false();
      should(quadB.graph.equals(quadA.graph)).be.true();
    });

    it('Should maintain mappings across different invocations', async function () {
      const {dataFactory, store} = this;
      const scope = await store.initScope();
      const quadA = dataFactory.quad(
        dataFactory.namedNode('ex://s1'),
        dataFactory.namedNode('ex://p1'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g1'),
      );
      const quadB = dataFactory.quad(
        dataFactory.namedNode('ex://s2'),
        dataFactory.namedNode('ex://p2'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g2'),
      );
      await store.put(quadA, { scope });
      await store.put(quadB, { scope });
      const { items } = await store.get({});
      should(items).have.length(2);
      should(items[1].object.equals(items[0].object));
      should(items[1].object.equals(quadA.object)).be.false();
    });

    it('Should persist scope mappings', async function () {
      const {dataFactory, store} = this;
      const scope = await store.initScope();
      const quad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quad, { scope });
      const levelOpts = Scope.getLevelIteratorOpts(true, true, scope.id);
      const entries = await streamToArray(new LevelIterator(
        store.db.iterator(levelOpts),
        (key, value) => value.toString('utf8'),
      ));
      should(entries).be.an.Array();
      should(entries).have.length(1);
      const { originalLabel, randomLabel } = JSON.parse(entries[0]);
      should(originalLabel).equal('bo');
    });

  });

  describe('Quadstore.prototype.multiPut() with scope', () => {
    it('Should transform blank node labels', async function () {
      const {dataFactory, store} = this;
      const scope = await store.initScope();
      const quadsA = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.blankNode('bo'),
          dataFactory.namedNode('ex://g'),
        ),
      ];
      await store.multiPut(quadsA, { scope });
      const { items: quadsB } = await store.get({});
      should(quadsB).have.length(1);
      should(quadsB[0].subject.equals(quadsA[0].subject)).be.true();
      should(quadsB[0].predicate.equals(quadsA[0].predicate)).be.true();
      should(quadsB[0].object.equals(quadsA[0].object)).be.false();
      should(quadsB[0].graph.equals(quadsA[0].graph)).be.true();
    });
  });

  describe('Quadstore.prototype.putStream() with scope', () => {
    it('Should transform blank node labels', async function () {
      const {dataFactory, store} = this;
      const scope = await store.initScope();
      const quadsA = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.blankNode('bo'),
          dataFactory.namedNode('ex://g'),
        ),
      ];
      await store.putStream(new ArrayIterator(quadsA), { scope });
      const { items: quadsB } = await store.get({});
      should(quadsB).have.length(1);
      should(quadsB[0].subject.equals(quadsA[0].subject)).be.true();
      should(quadsB[0].predicate.equals(quadsA[0].predicate)).be.true();
      should(quadsB[0].object.equals(quadsA[0].object)).be.false();
      should(quadsB[0].graph.equals(quadsA[0].graph)).be.true();
    });
  });


};
