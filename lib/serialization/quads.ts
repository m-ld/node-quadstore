import {Quad, TermName} from '../types';
import {
  blankNodeReader,
  blankNodeWriter, defaultGraphReader,
  defaultGraphWriter, genericLiteralReader, genericLiteralWriter, langStringLiteralReader,
  langStringLiteralWriter, namedNodeReader,
  namedNodeWriter, numericLiteralReader, numericLiteralWriter, stringLiteralReader,
  stringLiteralWriter
} from './terms';
import * as xsd from './xsd';
import {encode} from './fpstring';
import {copyBufferIntoBuffer} from './utils';
import {DataFactory} from 'rdf-js';

export const quadWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  _originalKeyOffset: 0,
  _originalValueOffset: 0,
  write(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, separator: Buffer, quad: Quad, termNames: TermName[]) {
    this._originalKeyOffset = keyOffset;
    this._originalValueOffset = valueOffset;
    for (let t = 0, term; t < termNames.length; t += 1) {
      term = quad[termNames[t]];
      switch (term.termType) {
        case 'NamedNode':
          value.writeUInt16LE(0, valueOffset);
          valueOffset += 2;
          namedNodeWriter.writeToQuad(key, keyOffset, value, valueOffset, term);
          keyOffset += namedNodeWriter.writtenKeyBytes;
          valueOffset += namedNodeWriter.writtenValueBytes;
          break;
        case 'BlankNode':
          value.writeUInt16LE(1, valueOffset);
          valueOffset += 2;
          blankNodeWriter.writeToQuad(key, keyOffset, value, valueOffset, term);
          keyOffset += blankNodeWriter.writtenKeyBytes;
          valueOffset += blankNodeWriter.writtenValueBytes;
          break;
        case 'DefaultGraph':
          value.writeUInt16LE(6, valueOffset);
          valueOffset += 2;
          defaultGraphWriter.writeToQuad(key, keyOffset, value, valueOffset, term);
          keyOffset += defaultGraphWriter.writtenKeyBytes;
          valueOffset += defaultGraphWriter.writtenValueBytes;
          break;
        case 'Literal':
          if (term.language) {
            value.writeUInt16LE(4, valueOffset);
            valueOffset += 2;
            langStringLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term, separator);
            keyOffset += langStringLiteralWriter.writtenKeyBytes;
            valueOffset += langStringLiteralWriter.writtenValueBytes;
          } else if (term.datatype) {
            switch (term.datatype.value) {
              case xsd.string:
                value.writeUInt16LE(3, valueOffset);
                valueOffset += 2;
                stringLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term);
                keyOffset += stringLiteralWriter.writtenKeyBytes;
                valueOffset += stringLiteralWriter.writtenValueBytes;
                break;
              case xsd.integer:
              case xsd.double:
              case xsd.decimal:
              case xsd.nonPositiveInteger:
              case xsd.negativeInteger:
              case xsd.long:
              case xsd.int:
              case xsd.short:
              case xsd.byte:
              case xsd.nonNegativeInteger:
              case xsd.unsignedLong:
              case xsd.unsignedInt:
              case xsd.unsignedShort:
              case xsd.unsignedByte:
              case xsd.positiveInteger:
                value.writeUInt16LE(5, valueOffset);
                valueOffset += 2;
                numericLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term, separator, Buffer.from(encode(term.value)), false);
                keyOffset += numericLiteralWriter.writtenKeyBytes;
                valueOffset += numericLiteralWriter.writtenValueBytes;
                break;
              case xsd.dateTime:
                value.writeUInt16LE(5, valueOffset);
                valueOffset += 2;
                numericLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term, separator, Buffer.from(new Date(term.value).valueOf().toString()), false);
                keyOffset += numericLiteralWriter.writtenKeyBytes;
                valueOffset += numericLiteralWriter.writtenValueBytes;
                break;
              default:
                value.writeUInt16LE(2, valueOffset);
                valueOffset += 2;
                genericLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term, separator);
                keyOffset += genericLiteralWriter.writtenKeyBytes;
                valueOffset += genericLiteralWriter.writtenValueBytes;
            }
          } else {
            value.writeUInt16LE(3, valueOffset);
            valueOffset += 2;
            stringLiteralWriter.writeToQuad(key, keyOffset, value, valueOffset, term);
            keyOffset += stringLiteralWriter.writtenKeyBytes;
            valueOffset += stringLiteralWriter.writtenValueBytes;
          }
      }
      copyBufferIntoBuffer(separator, key, keyOffset);
      keyOffset += separator.byteLength;
    }
    this.writtenKeyBytes = keyOffset - this._originalKeyOffset;
    this.writtenValueBytes = valueOffset - this._originalValueOffset;
  },
};


export const quadReader = {
  subject: null,
  predicate: null,
  object: null,
  graph: null,
  read(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, separator: Buffer, termNames: TermName[], factory: DataFactory): Quad {
    for (let t = 0, termName; t < termNames.length; t += 1) {
      termName = termNames[t];
      const encodedTermType = value.readUInt16LE(valueOffset);
      valueOffset += 2;
      switch (encodedTermType) {
        case 0:
          // @ts-ignore
          this[termName] = namedNodeReader.readFromQuad(key, keyOffset, value, valueOffset, factory);
          keyOffset += namedNodeReader.readKeyBytes;
          valueOffset += namedNodeReader.readValueBytes;
          break;
        case 1:
          // @ts-ignore
          this[termName] = blankNodeReader.readFromQuad(key, keyOffset, value, valueOffset, factory);
          keyOffset += blankNodeReader.readKeyBytes;
          valueOffset += blankNodeReader.readValueBytes;
          break;
        case 2:
          // @ts-ignore
          this[termName] = genericLiteralReader.readFromQuad(key, keyOffset, value, valueOffset, factory, separator);
          keyOffset += genericLiteralReader.readKeyBytes;
          valueOffset += genericLiteralReader.readValueBytes;
          break;
        case 3:
          // @ts-ignore
          this[termName] = stringLiteralReader.readFromQuad(key, keyOffset, value, valueOffset, factory);
          keyOffset += stringLiteralReader.readKeyBytes;
          valueOffset += stringLiteralReader.readValueBytes;
          break;
        case 4:
          // @ts-ignore
          this[termName] = langStringLiteralReader.readFromQuad(key, keyOffset, value, valueOffset, factory, separator);
          keyOffset += langStringLiteralReader.readKeyBytes;
          valueOffset += langStringLiteralReader.readValueBytes;
          break;
        case 5:
          // @ts-ignore
          this[termName] = numericLiteralReader.readFromQuad(key, keyOffset, value, valueOffset, factory, separator);
          keyOffset += numericLiteralReader.readKeyBytes;
          valueOffset += numericLiteralReader.readValueBytes;
          break;
        case 6:
          // @ts-ignore
          this[termName] = defaultGraphReader.readFromQuad(key, keyOffset, value, valueOffset, factory);
          keyOffset += defaultGraphReader.readKeyBytes;
          valueOffset += defaultGraphReader.readValueBytes;
          break;
        default: throw new Error(`Unexpected encoded term type "${encodedTermType}"`);
      }
      keyOffset += separator.byteLength;
    }
    // @ts-ignore
    return factory.quad(this.subject, this.predicate, this.object, this.graph);
  },
};
