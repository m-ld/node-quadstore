
import {BlankNode, DataFactory, DefaultGraph, Literal, NamedNode} from 'rdf-js';
import {copyBufferIntoBuffer, sliceBuffer} from './utils';

export const namedNodeWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: NamedNode) {
    const encodedValue = Buffer.from(node.value);
    copyBufferIntoBuffer(encodedValue, key, keyOffset);
    this.writtenKeyBytes = encodedValue.byteLength;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
      this.writtenValueBytes = 2;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: NamedNode) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node);
  },
};

export const namedNodeReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory): NamedNode {
    const valueLen = value.readUInt16LE(valueOffset);
    this.readValueBytes = 2;
    this.readKeyBytes = valueLen;
    return factory.namedNode(sliceBuffer(key, keyOffset, valueLen).toString());
  },
};

export const blankNodeWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: BlankNode) {
    const encodedValue = Buffer.from(node.value);
    copyBufferIntoBuffer(encodedValue, key, keyOffset);
    this.writtenKeyBytes = encodedValue.byteLength;
    if (value) {
      this.writtenValueBytes = 2;
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: BlankNode) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node);
  },
};

export const blankNodeReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory): BlankNode {
    const valueLen = value.readUInt16LE(valueOffset);
    this.readValueBytes = 2;
    this.readKeyBytes = valueLen;
    return factory.blankNode(sliceBuffer(key, keyOffset, valueLen).toString());
  },
};

export const genericLiteralWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  _currentKeyOffset: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: Literal, separator: Buffer) {
    const encodedValue = Buffer.from(node.value);
    const encodedDatatypeValue = Buffer.from(node.datatype.value);
    this._currentKeyOffset = keyOffset;
    copyBufferIntoBuffer(encodedDatatypeValue, key, this._currentKeyOffset);
    this._currentKeyOffset += encodedDatatypeValue.byteLength;
    copyBufferIntoBuffer(separator, key, this._currentKeyOffset);
    this._currentKeyOffset += separator.byteLength;
    copyBufferIntoBuffer(encodedValue, key, this._currentKeyOffset);
    this._currentKeyOffset += encodedValue.byteLength;
    this.writtenKeyBytes = this._currentKeyOffset - keyOffset;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, <number>valueOffset);
      value.writeUInt16LE(encodedDatatypeValue.byteLength, <number>valueOffset + 2);
      this.writtenValueBytes = 4;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: Literal, separator: Buffer) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node, separator);
  },
};

export const genericLiteralReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory, separator: Buffer): Literal {
    const valueLen = value.readUInt16LE(valueOffset);
    const datatypeValueLen = value.readUInt16LE(valueOffset + 2);
    this.readValueBytes = 4;
    this.readKeyBytes = valueLen + separator.byteLength + datatypeValueLen;
    return factory.literal(
      sliceBuffer(key, keyOffset + datatypeValueLen + separator.byteLength, valueLen).toString(),
      factory.namedNode(sliceBuffer(key, keyOffset, datatypeValueLen).toString()),
    );
  },
}

export const stringLiteralWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: Literal) {
    const encodedValue = Buffer.from(node.value);
    copyBufferIntoBuffer(encodedValue, key, keyOffset);
    this.writtenKeyBytes = encodedValue.byteLength;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
      this.writtenValueBytes = 2;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: Literal) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node);
  },
};

export const stringLiteralReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory): Literal {
    const valueLen = value.readUInt16LE(valueOffset);
    this.readValueBytes = 2;
    this.readKeyBytes = valueLen;
    return factory.literal(sliceBuffer(key, keyOffset, valueLen).toString());
  },
};

export const langStringLiteralWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  _currentKeyOffset: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: Literal, separator: Buffer) {
    const encodedValue = Buffer.from(node.value);
    const encodedLangCode = Buffer.from(node.language);
    this._currentKeyOffset = keyOffset;
    copyBufferIntoBuffer(encodedLangCode, key, this._currentKeyOffset);
    this._currentKeyOffset += encodedLangCode.byteLength;
    copyBufferIntoBuffer(separator, key, this._currentKeyOffset);
    this._currentKeyOffset += separator.byteLength;
    copyBufferIntoBuffer(encodedValue, key, this._currentKeyOffset);
    this._currentKeyOffset += encodedValue.byteLength;
    this.writtenKeyBytes = this._currentKeyOffset - keyOffset;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
      value.writeUInt16LE(encodedLangCode.byteLength, <number>valueOffset + 2);
      this.writtenValueBytes = 4;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: Literal, separator: Buffer) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node, separator);
  },
};

export const langStringLiteralReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory, separator: Buffer): Literal {
    const valueLen = value.readUInt16LE(valueOffset);
    const langCodeLen = value.readUInt16LE(valueOffset + 2);
    this.readValueBytes = 4;
    this.readKeyBytes = valueLen + separator.byteLength + langCodeLen;
    return factory.literal(
      sliceBuffer(key, keyOffset + langCodeLen + separator.byteLength, valueLen).toString(),
      sliceBuffer(key, keyOffset, langCodeLen).toString(),
    );
  },
}

export const numericLiteralWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  _currentKeyOffset: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: Literal, separator: Buffer, encodedNumericValue: Buffer, rangeMode: boolean) {
    const encodedValue = Buffer.from(node.value);
    const encodedDatatypeValue = Buffer.from(node.datatype.value);
    this._currentKeyOffset = keyOffset;
    copyBufferIntoBuffer(encodedNumericValue, key, this._currentKeyOffset);
    this._currentKeyOffset += encodedNumericValue.byteLength;
    if (!rangeMode) {
      copyBufferIntoBuffer(separator, key, this._currentKeyOffset);
      this._currentKeyOffset += separator.byteLength;
      copyBufferIntoBuffer(encodedDatatypeValue, key, this._currentKeyOffset);
      this._currentKeyOffset += encodedDatatypeValue.byteLength;
      copyBufferIntoBuffer(separator, key, this._currentKeyOffset);
      this._currentKeyOffset += separator.byteLength;
      copyBufferIntoBuffer(encodedValue, key, this._currentKeyOffset);
      this._currentKeyOffset += encodedValue.byteLength;
    }
    this.writtenKeyBytes = this._currentKeyOffset - keyOffset;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
      value.writeUInt16LE(encodedDatatypeValue.byteLength, <number>valueOffset + 2);
      value.writeUInt16LE(encodedNumericValue.byteLength, <number>valueOffset + 4);
      this.writtenValueBytes = 6;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: Literal, separator: Buffer, encodedNumericValue: Buffer, rangeMode: boolean) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node, separator, encodedNumericValue, rangeMode);
  },
};

export const numericLiteralReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory, separator: Buffer): Literal {
    const valueLen = value.readUInt16LE(valueOffset);
    const datatypeValueLen = value.readUInt16LE(valueOffset + 2);
    const numericValueLen = value.readUInt16LE(valueOffset + 4);
    this.readValueBytes = 6;
    this.readKeyBytes = valueLen + separator.byteLength + datatypeValueLen + separator.byteLength + numericValueLen;
    return factory.literal(
      sliceBuffer(key, keyOffset + numericValueLen + separator.byteLength + datatypeValueLen + separator.byteLength, valueLen).toString(),
      factory.namedNode(sliceBuffer(key, keyOffset + numericValueLen + separator.byteLength, datatypeValueLen).toString()),
    );
  },
}

export const defaultGraphWriter = {
  writtenKeyBytes: 0,
  writtenValueBytes: 0,
  writeToQuad(key: Buffer, keyOffset: number, value: Buffer|undefined, valueOffset: number|undefined, node: DefaultGraph) {
    const encodedValue = Buffer.from('dg');
    copyBufferIntoBuffer(encodedValue, key, keyOffset);
    this.writtenKeyBytes = encodedValue.byteLength;
    if (value) {
      value.writeUInt16LE(encodedValue.byteLength, valueOffset);
      this.writtenValueBytes = 2;
    }
  },
  writeToPattern(key: Buffer, keyOffset: number, node: DefaultGraph) {
    this.writeToQuad(key, keyOffset, undefined, undefined, node);
  },
};

export const defaultGraphReader = {
  readKeyBytes: 0,
  readValueBytes: 0,
  readFromQuad(key: Buffer, keyOffset: number, value: Buffer, valueOffset: number, factory: DataFactory): DefaultGraph {
    const valueLen = value.readUInt16LE(valueOffset);
    this.readValueBytes = 2;
    this.readKeyBytes = valueLen;
    return factory.defaultGraph();
  },
};
