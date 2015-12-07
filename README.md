# redux-fetcher
Really simple isomorphic fetch for Redux  
Can be used in any Redux project.
Recommended method for simple isomorphic HTTP data fetching in [Roc](https://github.com/vgno/roc-web-react).

# Install
```
npm install redux-fetcher
```

Import
```js
import { createFetchAction, createFetchReducer } from 'redux-fetcher';
```

Create your fetch actions using `createFetchAction`.  
Create your fetch reducers using `createFetchReducer`

# Example Usage (HTTP GET)

## Create action for fetching data
The action can be dispatch()'ed' directly, or through `mapDispatchToProps` like normal for use within your React components if using `react-redux`
```js
const url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=Oslo&appid=2de143494c0b295cca9337e1e96b00e0';
const fetchWeather = createFetchAction('weather', url);
```


## Create fetch reducer for this action
This should be added to your Redux like any other reducer.
```js
const fetchWeatherReducer = createFetchReducer('weather');
```

Done!  
After a successful dispatch of `fetchWeather` your data will be in `store.weather.payload` along with `store.weather.error` and `store.weather.loading`. These can be used to give a better user experience.

Note that the identifier `weather` matches with action identifier. This is how redux-fetcher connects your action with the reducer and store location. Use any name you like, just avoid duplicate names across fetches.

### How it works
When `fetchAction` is dispatched the following will happen internally:
- It will check if the `fetch` should take place at all (See [options](#Options))
- It dispatches an action named `WEATHER_FETCH_PENDING`
- The `weatherFetchReducer` handles `WEATHER_FETCH_PENDING` and will set the `store.weather.loading` to `true`, `store.weather.error` to `false` and `store.weather.payload.endpoint` to the requested URL that is currently loading.
- It (through `redux-api-middleware`) performs an isomorphic `fetch` using `url`. This operation is async, and what it does depends if the fetch fails or succeeds.

#### If fetch succeeds
- It dispatches an action named `WEATHER_FETCH_SUCCESS`. The response will be stored as a string in `store.weather.payload`. `store.weather.error` and `store.weather.loading` will always be false after reducing.

#### If fetch fails
- It dispatches an action named `WEATHER_FETCH_FAILURE`. `store.weather.payload` will be `undefined`. `store.weather.error` will be set to a string describing the error suitable for logging and `store.weather.loading` will be false after reducing.

# Options
`fetchAction(name, url, options)`  
- `name`: string uniquely identifying your fetch operation
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
    - `force`: boolean, set to true if you wish to perform fetch even if you have data in your store already. Only applies if you do not override bail.
    - `method`: string, HTTP method to use in fetch.
    - `body`: string, request body to use (only applies to non-GET and non-HEAD requests)
    - `headers`: object, specify custom HTTP headers to use in your request
    - `credentials`: string, `omit`, `same-origin`, `include`. Include cookies in request?
    - `bailout`: function. Is always executed before performing a request and will abort if it evaluates to true.

`fetchReducer(name)`  
- name: string uniquely identifying your fetch operation

## Default bail:
```js
return store[storeNode].loading || (store[storeNode].payload && !force);
```
It will bail `if it is already fetching data` or `if it already has data and is not forced`.
