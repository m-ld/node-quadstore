import {Literal} from 'rdf-js';
import {
  blankNodeWriter, defaultGraphWriter,
  genericLiteralWriter,
  langStringLiteralWriter,
  namedNodeWriter,
  numericLiteralWriter,
  stringLiteralWriter
} from './terms';
import * as xsd from './xsd';
import {encode} from './fpstring';
import {Pattern, TermName} from '../types';
import {copyBufferIntoBuffer, copyBuffer} from './utils';

const patternLiteralWriter = {
  writtenKeyBytes: 0,
  writeToPattern(key: Buffer, keyOffset: number, separator: Buffer, term: Literal) {
    if (term.language) {
      langStringLiteralWriter.writeToPattern(key, keyOffset, term, separator);
      this.writtenKeyBytes = langStringLiteralWriter.writtenKeyBytes;
    } else if (term.datatype) {
      switch (term.datatype.value) {
        case xsd.string:
          stringLiteralWriter.writeToPattern(key, keyOffset, term);
          this.writtenKeyBytes = stringLiteralWriter.writtenKeyBytes;
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
          numericLiteralWriter.writeToPattern(key, keyOffset, term, separator, Buffer.from(encode(term.value)), true);
          this.writtenKeyBytes = numericLiteralWriter.writtenKeyBytes;
          break;
        case xsd.dateTime:
          numericLiteralWriter.writeToPattern(key, keyOffset, term, separator, Buffer.from(new Date(term.value).valueOf().toString()), true);
          this.writtenKeyBytes = numericLiteralWriter.writtenKeyBytes;
          break;
        default:
          genericLiteralWriter.writeToPattern(key, keyOffset, term, separator);
          this.writtenKeyBytes = genericLiteralWriter.writtenKeyBytes;
      }
    } else {
      stringLiteralWriter.writeToPattern(key, keyOffset, term);
      this.writtenKeyBytes = stringLiteralWriter.writtenKeyBytes;
    }
  }
};

export const writePattern = (
  pattern: Pattern,
  gt: Buffer, gtFrom: number,
  lt: Buffer, ltFrom: number,
  separator: Buffer, boundary: Buffer,
  termNames: TermName[],
): ({ gt: Buffer, gte: boolean, lt: Buffer, lte: boolean }|false) => {
  let gte = true;
  let lte = true;
  let didRangeOrLiteral = false;
  let remaining = Object.entries(pattern).filter(([termName, term]) => term).length;
  if (remaining === 0) {
    copyBufferIntoBuffer(boundary, lt, ltFrom);
    ltFrom += boundary.byteLength;
    return { gt: copyBuffer(gt, 0, gtFrom), lt: copyBuffer(lt, 0, ltFrom), gte, lte };
  }
  for (let t = 0; t < termNames.length && remaining > 0; t += 1) {
    const term = pattern[termNames[t]];
    if (!term) {
      return false;
    }
    if (didRangeOrLiteral) {
      return false;
    }
    switch (term.termType) {
      case 'Range':
        didRangeOrLiteral = true;
        if (term.gt) {
          patternLiteralWriter.writeToPattern(gt, gtFrom, separator, term.gt);
          gtFrom += patternLiteralWriter.writtenKeyBytes;
          gte = false;
        } else if (term.gte) {
          patternLiteralWriter.writeToPattern(gt, gtFrom, separator, term.gte);
          gtFrom += patternLiteralWriter.writtenKeyBytes;
          gte = true;
        }
        if (term.lt) {
          patternLiteralWriter.writeToPattern(lt, ltFrom, separator, term.lt);
          ltFrom += patternLiteralWriter.writtenKeyBytes;
          lte = false;
        } else if (term.lte) {
          patternLiteralWriter.writeToPattern(lt, ltFrom, separator, term.lte);
          ltFrom += patternLiteralWriter.writtenKeyBytes;
          lte = true;
        }
        break;
      case 'Literal':
        didRangeOrLiteral = true;
        patternLiteralWriter.writeToPattern(gt, gtFrom, separator, term);
        gtFrom += patternLiteralWriter.writtenKeyBytes;
        gte = true;
        patternLiteralWriter.writeToPattern(lt, ltFrom, separator, term);
        ltFrom += patternLiteralWriter.writtenKeyBytes;
        lte = true;
        break;
      case 'NamedNode':
        namedNodeWriter.writeToPattern(gt, gtFrom, term);
        gtFrom += namedNodeWriter.writtenKeyBytes;
        gte = true;
        namedNodeWriter.writeToPattern(lt, ltFrom, term);
        ltFrom += namedNodeWriter.writtenKeyBytes;
        lte = true;
        break;
      case 'BlankNode':
        blankNodeWriter.writeToPattern(gt, gtFrom, term);
        gtFrom += blankNodeWriter.writtenKeyBytes;
        gte = true;
        blankNodeWriter.writeToPattern(lt, ltFrom, term);
        ltFrom += blankNodeWriter.writtenKeyBytes;
        lte = true;
        break;
      case 'DefaultGraph':
        defaultGraphWriter.writeToPattern(gt, gtFrom, term);
        gtFrom += defaultGraphWriter.writtenKeyBytes;
        gte = true;
        defaultGraphWriter.writeToPattern(lt, ltFrom, term);
        ltFrom += defaultGraphWriter.writtenKeyBytes;
        lte = true;
        break;
    }
    remaining -= 1;
    if (remaining > 0 && t < termNames.length - 1) {
      copyBufferIntoBuffer(separator, gt, gtFrom);
      gtFrom += separator.byteLength;
      copyBufferIntoBuffer(separator, lt, ltFrom);
      ltFrom += separator.byteLength;
    }
  }

  if (lte) {
    if (didRangeOrLiteral) {
      copyBufferIntoBuffer(boundary, lt, ltFrom);
      ltFrom += boundary.byteLength;
    } else {
      copyBufferIntoBuffer(separator, lt, ltFrom);
      ltFrom += separator.byteLength;
      copyBufferIntoBuffer(boundary, lt, ltFrom);
      ltFrom += boundary.byteLength;
    }
  } else {
    copyBufferIntoBuffer(separator, lt, ltFrom);
    ltFrom += separator.byteLength;
  }
  if (gte) {
    if (!didRangeOrLiteral) {
      copyBufferIntoBuffer(separator, gt, gtFrom);
      gtFrom += separator.byteLength;
    }
  } else {
    if (didRangeOrLiteral) {
      copyBufferIntoBuffer(boundary, gt, gtFrom);
      gtFrom += boundary.byteLength;
    } else {
      copyBufferIntoBuffer(separator, gt, gtFrom);
      gtFrom += separator.byteLength;
      copyBufferIntoBuffer(boundary, gt, gtFrom);
      gtFrom += boundary.byteLength;
    }
  }
  return { gt: copyBuffer(gt, 0, gtFrom), lt: copyBuffer(lt, 0, ltFrom), gte, lte };
};
