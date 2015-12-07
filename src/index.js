import { CALL_API } from 'redux-api-middleware';

import { createPendingType, createDefaultBailout, overrideOptions } from './util-action';
import { fetchSuccess, fetchFailure, fetchPending } from './util-reducer';

/**
  * creates action for data fetching
  * @param {string} [id] - identifier for the action
  * @param {string} [url] - url to fetch
  * @param {object} [options] - options to consider when creating action
  * @returns {object} - redux-api-middleware compatible action
  */
export function createFetchAction(id, url, options = { force: false, method: 'GET', body: '' }) {
    if (!id || !url) {
        throw new Error('Must provide action identifier and url');
    }

    const actionPrefix = id.toUpperCase();
    const storeNode = id.toLowerCase();

    const bailout = options.bailout || createDefaultBailout(storeNode, options.force);
    const overridenOptions = overrideOptions({
        endpoint: url,
        bailout,
        method: options.method,
        types: [
            createPendingType(actionPrefix, url),
            actionPrefix + '_FETCH_SUCCESS',
            actionPrefix + '_FETCH_FAILURE'
        ]
    }, options);

    return {
        [CALL_API]: overridenOptions
    };
}

/**
  * creates reducer for data fetching
  * @param {string} [id] - identifier that the corresponding action uses
  * @returns {object} - redux-api-middleware compatible action
  */
export function createFetchReducer(id) {
    if (!id) {
        throw new Error('Must provide action identifier for reducer');
    }

    const actionPrefix = id.toUpperCase();

    return (state = {}, { type, payload }) => {
        if (type === actionPrefix + '_FETCH_SUCCESS') {
            return fetchSuccess(payload);
        }

        if (type === actionPrefix + '_FETCH_FAILURE') {
            return fetchFailure(payload);
        }

        if (type === actionPrefix + '_FETCH_PENDING') {
            return fetchPending(payload);
        }

        return state;
    };
}
