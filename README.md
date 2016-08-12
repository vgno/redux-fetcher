# redux-fetcher
![stability stable](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![redux-fetcher](https://img.shields.io/npm/v/redux-fetcher.svg)](https://www.npmjs.com/package/redux-fetcher)
[![Build Status](https://travis-ci.org/vgno/redux-fetcher.svg)](https://travis-ci.org/vgno/redux-fetcher)
[![Code Climate](https://codeclimate.com/github/vgno/redux-fetcher/badges/gpa.svg)](https://codeclimate.com/github/vgno/redux-fetcher)
[![Coverage Status](https://coveralls.io/repos/vgno/redux-fetcher/badge.svg?branch=master&service=github)](https://coveralls.io/github/vgno/redux-fetcher?branch=master)
[![Dependency status](https://david-dm.org/vgno/redux-fetcher.svg)](https://david-dm.org/vgno/redux-fetcher.svg)

Really simple isomorphic fetch for Redux. Can be used in any Redux project that uses [redux-api-middleware](https://github.com/vgno/redux-api-middleware).

Recommended method for simple isomorphic HTTP data fetching in [Roc](https://github.com/rocjs/roc-package-web-app-react).

# Install
```
npm install --save redux-fetcher
```

Import
```js
import { createFetchAction, createFetchReducer } from 'redux-fetcher';
```

Create your fetch actions using `createFetchAction`.  
Create your fetch reducers using `createFetchReducer`.

# Example Usage (HTTP GET)
The example illustrates requesting some data from the open Github API.
## Define fetch identifier for this action
```js
const FETCH_REPOS = 'repos';
```
This can be any unique string that will identify your request and its corresponding key in the state tree.
## Create action for fetching data
```js
const fetchRepos = createFetchAction(
    FETCH_REPOS,
    'https://api.github.com/users/rocjs/repos'
);
```
The action `fetchRepos` can then be used with `dispatch()` directly, or if using `react-redux` through `mapDispatchToProps` and used like normal in your React components.

## Create fetch reducer for this action
The generated reducer will ensure that the state is updated according to the internal fetch actions.
```js
const fetchReposReducer = createFetchReducer(FETCH_REPOS);
```
When adding your reducer to Redux using `combineReducers`, it is important that the key is equivalent to the action/reducer identifier above:
```js
const myReducers = combineReducers({
    [FETCH_REPOS]: fetchReposReducer
});
```

Done!

For the rest of this section we assume
```js
const state = store.getState();
```  
After a successful dispatch of `fetchRepos` and its following actions your data will be in `state.repos.payload` along with `state.repos.error` and `state.repos.loading`. Some useful data like `endpoint` is also set to `state.repos.meta`. These can optionally be used to give a better user experience.

You can also [pass in your own metadata](#defining-your-own-custom-metadata).

### How it works
When `fetchAction` is dispatched the following will happen internally:
- It will check if the `fetch` should take place at all (See [options](#Options))
- It dispatches an action named `REPOS_FETCH_PENDING`
- The `fetchReposReducer` handles `REPOS_FETCH_PENDING` and will set the `state.repos.loading` to `true`, `state.repos.error` to `false` and `state.repos.meta.endpoint` to the requested URL that is currently loading.
- It (through `redux-api-middleware`) performs an isomorphic `fetch` using the `url`. This operation is async, and what it does depends if the fetch fails or succeeds.

#### If fetch succeeds
- It dispatches an action named `REPOS_FETCH_SUCCESS`. The response will be stored in `state.repos.payload`. `state.repos.error` and `state.repos.loading` will always be false after reducing a success. Again `state.repos.meta` will provide `endpoint`, but also a `response` object with some basic information.

#### If fetch fails
- It dispatches an action named `REPOS_FETCH_FAILURE`. `state.repos.payload` will contain the error `name` and `message`. `state.repos.error` will be set to `true` and `state.repos.loading` will be false after reducing an error. `state.repos.meta` will provide `endpoint` and `response`.

Note: In case of a network-error, `redux-api-middleware` will dispatch another `PENDING` type action, but with `error` set to `true`. See https://github.com/agraboso/redux-api-middleware/pull/26. This is likely to change in `redux-api-middleware` 3.x.x.

## API
`fetchAction(id, url, options, meta)`  
- `id`: string uniquely identifying your fetch operation
- `url`: string containing url to fetch
- `options`: object  
Default options:
```js
{
    force: false,
    method: 'GET',
    body: '',
    headers: undefined,
    credentials: undefined,
    bailout: undefined
}
```
```
    - `force`: boolean, set to true if you wish to perform fetch even if you have data in your store already. Only applies if you do not override bail yourself.
    - `method`: string, HTTP method to use in fetch.
    - `body`: string, request body to use (only applies to non-GET and non-HEAD requests)
    - `headers`: object, specify custom HTTP headers to use in your request
    - `credentials`: string, `omit`, `same-origin`, `include`. Include cookies in request?
    - `bailout`: function. Is always executed before performing a request and will abort if it evaluates to true.

    Your custom options passed will be shallow-merged with the default.
```
- `meta`: object or function(action, state, res) that returns object  
The provided meta will be shallow-merged with the default metadata.  

`fetchReducer(id)`  
- `id`: string uniquely identifying your fetch operation

## Default bail:
```js
const cached = !!state[id].payload && !force;
return state[id].loading || cached;
```
It will bail `if it is already fetching data` or `if it already has data and is not forced`.

## Defining your own custom metadata
As mentioned in the API overview above we can enhance our resulting `meta` with additional data.

### Examples
`createFetchAction(FETH_REPOS, 'https://api.github.com/users/rocjs/repos', {}, { importantData: 'xyz'} );`  
or  
`createFetchAction(FETH_REPOS, 'https://api.github.com/users/rocjs/repos', {}, () => { importantData: 'xyz'} );`

This will result in the default metadata also containing `importantData: 'xyz'`
