# redux-fetcher
Really simple isomorphic fetch for Redux  
Can be used in any Redux project.
Recommended method for simple isomorphic HTTP data fetching in [Roc](https://github.com/vgno/roc-web-react).

# Install
```
npm install --save redux-fetcher
```

Import
```js
import { createFetchAction, createFetchReducer } from 'redux-fetcher';
```

Create your fetch actions using `createFetchAction`.  
Create your fetch reducers using `createFetchReducer`

# Example Usage (HTTP GET)
The example illustrates requesting some data from the open weather map API.
## Define fetch identifier for this action
```js
const FETCH_WEATHER = 'weather';
```
This can be any unique string that will identify your request and its corresponding key in the state tree.
## Create action for fetching data
```js
const fetchWeather = createFetchAction(
    FETCH_WEATHER,
    'http://api.openweathermap.org/data/2.5/forecast/daily?q=Oslo&appid=2de143494c0b295cca9337e1e96b00e0'
);
```
The action `fetchWeather` can then be dispatch()'ed' directly, or if using `react-redux` through `mapDispatchToProps` and used like normal in your React components.

## Create fetch reducer for this action
The generated reducer will ensure that the state is updated according to the internal fetch actions.
```js
const fetchWeatherReducer = createFetchReducer(FETCH_WEATHER);
```
When adding your reducer to Redux using `combineReducers`, it is important that the key is equalent to the action/reducer identifier above:
```js
const myReducers = combineReducers({
    [FETCH_WEATHER]: fetchWeatherReducer
});
```

Done!  
For the rest of this section we assume
```js
const state = store.getState();
```  
After a successful dispatch of `fetchWeather` and it's following actions your data will be in `state.weather.payload` along with `state.weather.error` and `state.weather.loading`. Some useful data like `endpoint` is also set to `state.weather.meta`. These can optionally be used to give a better user experience.

### How it works
When `fetchAction` is dispatched the following will happen internally:
- It will check if the `fetch` should take place at all (See [options](#Options))
- It dispatches an action named `WEATHER_FETCH_PENDING`
- The `fetchWeatherReducer` handles `WEATHER_FETCH_PENDING` and will set the `state.weather.loading` to `true`, `state.weather.error` to `false` and `state.meta.endpoint` to the requested URL that is currently loading.
- It (through `redux-api-middleware`) performs an isomorphic `fetch` using `url`. This operation is async, and what it does depends if the fetch fails or succeeds.

#### If fetch succeeds
- It dispatches an action named `WEATHER_FETCH_SUCCESS`. The response will be stored in `state.weather.payload`. `state.weather.error` and `state.weather.loading` will always be false after reducing a success. Again `state.weather.meta` will provide `endpoint`, but also a `response` object with some basic information.

#### If fetch fails
- It dispatches an action named `WEATHER_FETCH_FAILURE`. `state.weather.payload` will contain the error `name` and `message`. `state.weather.error` will be set to `true` and `state.weather.loading` will be false after reducing an error. `state.weather.meta` will provide `endpoint`. `state.weather.meta` will also provide `response` if it was not a network error.

# Options
`fetchAction(id, url, options)`  
- `id`: string uniquely identifying your fetch operation
- `url`: string containing url to fetch
- `options`: object  
Default:
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
    - `force`: boolean, set to true if you wish to perform fetch even if you have data in your store already. Only applies if you do not override bail yourself.
    - `method`: string, HTTP method to use in fetch.
    - `body`: string, request body to use (only applies to non-GET and non-HEAD requests)
    - `headers`: object, specify custom HTTP headers to use in your request
    - `credentials`: string, `omit`, `same-origin`, `include`. Include cookies in request?
    - `bailout`: function. Is always executed before performing a request and will abort if it evaluates to true.

`fetchReducer(id)`  
- `id`: string uniquely identifying your fetch operation

## Default bail:
```js
const cached = !!state[id].payload && !force;
return state[id].loading || cached;
```
It will bail `if it is already fetching data` or `if it already has data and is not forced`.
