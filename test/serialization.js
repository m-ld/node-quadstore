
const {DataFactory} = require('rdf-data-factory');

const {quadWriter, quadReader} = require('../dist/lib/serialization');

const factory = new DataFactory();

const separator = Buffer.from('\u0000\u0000');
const boundary = Buffer.from('\uDBFF\uDFFF');

const key = Buffer.alloc(8192 * 6);
const value = Buffer.alloc(1024);

const xsd = require('../dist/lib/serialization/xsd');

const termNames = ['subject', 'predicate', 'object', 'graph'];

module.exports = () => {

  describe('Quad serialization', () => {

    it('Should serialize and deserialize quads with named nodes', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.namedNode('http://ex.com/o'),
        factory.namedNode('http://ex.com/g'),
      );
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });

    it('Should serialize and deserialize quads in the default graph', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.namedNode('http://ex.com/o'),
        factory.defaultGraph(),
      );
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });

    it('Should serialize and deserialize quads with generic literals', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('someValue', factory.namedNode('http://ex.com/someDatatype')),
        factory.namedNode('http://ex.com/g'),
      );
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });

    it('Should serialize and deserialize quads with named nodes and language-tagged literals', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('Hello, world!', 'en'),
        factory.namedNode('http://ex.com/g'),
      );
      const termNames = ['subject', 'predicate', 'object', 'graph'];
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });

    it('Should serialize and deserialize quads with named nodes and numeric literals', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('44', factory.namedNode(xsd.decimal)),
        factory.namedNode('http://ex.com/g'),
      );
      const termNames = ['subject', 'predicate', 'object', 'graph'];
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });

    it('Should serialize and deserialize quads with named nodes and simple string literals', function () {
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('someString'),
        factory.namedNode('http://ex.com/g'),
      );
      const termNames = ['subject', 'predicate', 'object', 'graph'];
      quadWriter.write(key, 0, value, 0, separator, quad, termNames);
      const read = quadReader.read(key, 0, value, 0, separator, termNames, factory);
      should(read.equals(quad)).be.true();
    });


  });


};
