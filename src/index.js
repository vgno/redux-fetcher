import { CALL_API } from 'redux-api-middleware';

import {
    createPendingType,
    createSuccessType,
    createFailureType,
    createDefaultBailout,
    extendAction
} from './util-action';

import { fetchSuccess, fetchFailure, fetchPending } from './util-reducer';

/**
  * creates action for data fetching
  * @param {string} [id] - identifier for the action
  * @param {string} [url] - url to fetch
  * @param {object} [options] - options to consider when creating action
  * @param {object|function} [meta] - an object with data to put in the FSA
                                      action or a function to calculate it
                                      with the following signature:
                                      (action, state, response) -> object
  * @returns {object} - redux-api-middleware compatible action
  */
export function createFetchAction(id, url, options = { force: false, method: 'GET', body: '' }, meta = {}) {
    if (!id || !url) {
        throw new Error('Must provide action identifier and url');
    }

    let metaFunction;
    if (typeof meta === 'function') {
        metaFunction = meta;
    } else {
        metaFunction = () => meta;
    }

    const actionPrefix = id.toUpperCase();

    const bailout = options.bailout || createDefaultBailout(id, options.force);
    const baseAction = {
        endpoint: url,
        bailout,
        method: options.method,
        types: [
            createPendingType(actionPrefix, url, metaFunction),
            createSuccessType(actionPrefix, url, metaFunction),
            createFailureType(actionPrefix, url, metaFunction)
        ]
    };

    const middlewareAction = {
        [CALL_API]: extendAction(baseAction, options)
    };

    return middlewareAction;
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

    return (state = {}, { type, payload, meta, error }) => {
        if (type === actionPrefix + '_FETCH_SUCCESS') {
            return fetchSuccess(payload, meta);
        }

        if (type === actionPrefix + '_FETCH_FAILURE') {
            return fetchFailure(payload, meta);
        }

        if (type === actionPrefix + '_FETCH_PENDING') {
            return fetchPending(payload, meta, error);
        }

        return state;
    };
}
