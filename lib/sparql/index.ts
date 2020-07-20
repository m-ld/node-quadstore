
import _ = require('../utils/lodash');
import { Parser as SparqlParser, SparqlQuery } from 'sparqljs';
import { handleSparqlUpdate } from './update';
import { handleSparqlQuery } from './query';
import {TSEmptyOpts, TSRdfBindingStreamResult, TSRdfQuadStreamResult, TSRdfStore, TSRdfVoidResult} from '../types';

const sparqlParser = new SparqlParser();

export const parse = (query: string): SparqlQuery => {
  return sparqlParser.parse(query);
};

export const sparqlStream = async (store: TSRdfStore, query: string, opts: TSEmptyOpts): Promise<TSRdfBindingStreamResult|TSRdfQuadStreamResult|TSRdfVoidResult> => {
  const parsed: SparqlQuery = parse(query);
  switch (parsed.type) {
    case 'query':
      return await handleSparqlQuery(store, parsed, opts);
    case 'update':
      return await handleSparqlUpdate(store, parsed, opts);
    default:
      // @ts-ignore
      throw new Error(`Unsupported SPARQL type "${parsed.type}"`);
  }
};