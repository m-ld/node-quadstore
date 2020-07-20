
import * as select from './select';
import {TSEmptyOpts, TSRdfBindingStreamResult, TSRdfQuadStreamResult, TSRdfStore} from '../types';
import {Query} from 'sparqljs';

export const handleSparqlQuery = async (store: TSRdfStore, parsed: Query, opts: TSEmptyOpts): Promise<TSRdfBindingStreamResult> => {
  switch (parsed.queryType) {
    case 'SELECT':
      return await select.handleSparqlSelect(store, parsed, opts);
    default:
      throw new Error(`Unsupported SPARQL query type "${parsed.queryType}"`);
  }
};