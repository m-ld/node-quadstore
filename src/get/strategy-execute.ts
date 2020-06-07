import QuadStore from '../quadstore';
import {IEmptyOpts, IQSStrategy} from '../types';
import {IBaseGetOpts} from '../types/base';

const _ = require('../utils/lodash');
const AsyncIterator = require('asynciterator');

type TLevelOpts = {
  lt?: string,
  lte?: string,
  gt?: string,
  gte?: string,
  limit?: number,
  offset?: number,
};

const generateLevelOpts = (store: QuadStore, strategy: IQSStrategy, opts: IEmptyOpts) => {
  const levelOpts: TLevelOpts = {};
  if (strategy.lt.length > 0) {
    if (strategy.lte) {
      levelOpts.lte = strategy.index.name
        + store.separator
        + strategy.lt.join(store.separator)
        + store.separator
        + store.boundary;
    } else {
      levelOpts.lt = strategy.index.name
        + store.separator
        + strategy.lt.join(store.separator)
        + store.separator;
    }
  } else {
    levelOpts.lt = strategy.index.name
      + store.separator
      + store.boundary;
  }
  if (strategy.gt.length > 0) {
    if (strategy.gte) {
      levelOpts.gte = strategy.index.name
        + store.separator
        + strategy.gt.join(store.separator)
        + store.separator;
    } else {
      levelOpts.gt = strategy.index.name
        + store.separator
        + strategy.gt.join(store.separator)
        + store.boundary;
    }
  } else {
    levelOpts.gt = strategy.index.name
      + store.separator;
  }
  return levelOpts;
};

const executeApproximateSize = async (store: QuadStore, strategy: IQSStrategy, opts: IEmptyOpts) => {
  // @ts-ignore
  if (!store.db.approximateSize) {
    return Infinity;
  }
  const levelOpts = generateLevelOpts(store, strategy, opts);
  const start = levelOpts.gte || levelOpts.gt;
  const end = levelOpts.lte || levelOpts.lt;
  return new Promise((resolve, reject) => {
    // @ts-ignore
    store.db.approximateSize(start, end, (err: Error|null, size: number) => {
      err ? reject(err) : resolve(size);
    });
  });
  // TODO: handle opts.limit and opts.offset
};

module.exports.executeApproximateSize = executeApproximateSize;

const execute = async (store: QuadStore, strategy: IQSStrategy, opts: IBaseGetOpts) => {
  const levelOpts: TLevelOpts = generateLevelOpts(store, strategy, opts);
  if (opts.offset) {
    levelOpts.offset = opts.offset;
  }
  if (opts.limit) {
    levelOpts.limit = opts.limit;
  }
  // @ts-ignore
  const iterator = AsyncIterator.wrap(store.db.createValueStream(levelOpts));
  return iterator;
};

module.exports.execute = execute;
