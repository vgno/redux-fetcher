import chai from 'chai';
import sinonChai from 'sinon-chai';
chai.should();
chai.use(sinonChai);

describe('redux-fetcher', () => {
    describe('api', () => {
        const reduxFetcher = require('../src');

        describe('createFetchAction', () => {
            it('must be function', () => {
                reduxFetcher.createFetchAction.should.be.a('function');
            });

            it('must expect 2 arguments', () => {
                reduxFetcher.createFetchAction.length.should.be.equal(2);
            });
        });

        describe('createFetchReducer', () => {
            it('must be function', () => {
                reduxFetcher.createFetchReducer.should.be.a('function');
            });

            it('must expect 1 argument', () => {
                reduxFetcher.createFetchReducer.length.should.be.equal(1);
            });
        });
    });

    describe('behaviour', () => {
        const CALL_API = require('redux-api-middleware').CALL_API;
        const reduxFetcher = require('../src');

        describe('createFetchAction', () => {
            let validAction;

            beforeEach(() => {
                validAction = reduxFetcher.createFetchAction('data', 'http://localhost/api')[CALL_API];
            });

            afterEach(() => {
                validAction = null;
            });

            it('must throw if identifier is not provided', () => {
                (() => reduxFetcher.createFetchAction()).should.throw(Error);
            });

            it('must throw if url is not provided', () => {
                (() => reduxFetcher.createFetchAction('testid')).should.throw(Error);
            });

            it('must return a redux-api-middleware compatible action using Symbol', () => {
                validAction.should.be.a('object');
            });

            it('must return action with endpoint and method', () => {
                validAction.endpoint.should.be.equal('http://localhost/api');
                validAction.method.should.be.equal('GET');
            });

            it('must have default bailout function', () => {
                validAction.bailout.should.be.a('function');
            });

            it('must bail if we are loading data', () => {
                validAction.bailout({
                    data: {
                        loading: true
                    }
                }).should.equal(true);
            });

            it('must bail if we already have data', () => {
                validAction.bailout({
                    data: {
                        loading: false,
                        payload: 'dataalreadyhere'
                    }
                }).should.equal(true);
            });

            it('must not bail if we are not loading and we do not have data', () => {
                validAction.bailout({
                    data: {
                        loading: false
                    }
                }).should.equal(false);
            });

            it('must not bail if the store has no data on identifier', () => {
                validAction.bailout({}).should.equal(false);
            });

            it('must define correct number of types', () => {
                validAction.types.length.should.be.equal(3);
            });

            it('must have defined PENDING type with expected metadata', () => {
                const firstType = validAction.types[0];
                firstType.should.be.a('object');

                firstType.type.should.be.equal('DATA_FETCH_PENDING');
                firstType.meta.should.be.a('function');
                firstType.meta().endpoint.should.equal('http://localhost/api');
            });

            it('must have defined SUCCESS type with expected metadata', () => {
                const secondType = validAction.types[1];
                secondType.should.be.a('object');

                secondType.type.should.be.equal('DATA_FETCH_SUCCESS');
                secondType.meta.should.be.a('function');
                const meta = secondType.meta(null, null, {
                    status: 200,
                    type: 'cors'
                });

                meta.endpoint.should.equal('http://localhost/api');
                meta.response.status.should.equal(200);
                meta.response.type.should.equal('cors');
            });

            it('must have defined FAILURE type with expected metadata', () => {
                const thirdType = validAction.types[2];
                thirdType.should.be.a('object');

                thirdType.type.should.be.equal('DATA_FETCH_FAILURE');
                thirdType.meta.should.be.a('function');
                const meta = thirdType.meta(null, null, {
                    status: 500,
                    type: 'cors'
                });

                meta.endpoint.should.equal('http://localhost/api');
                meta.response.status.should.equal(500);
                meta.response.type.should.equal('cors');
            });

            it('must have defined FAILURE type with expected metadata on network failures', () => {
                const thirdType = validAction.types[2];
                thirdType.should.be.a('object');

                thirdType.type.should.be.equal('DATA_FETCH_FAILURE');
                thirdType.meta.should.be.a('function');
                const meta = thirdType.meta(null, null);

                meta.endpoint.should.equal('http://localhost/api');
                chai.expect(meta.response).to.be.equal(undefined);
            });

            it('must override using credentials from options', () => {
                const overridenAction = reduxFetcher.createFetchAction('data', 'http://localhost/api', {
                    credentials: 'anoverride'
                })[CALL_API];

                overridenAction.credentials.should.be.equal('anoverride');
            });

            it('must override using headers from options', () => {
                const overridenAction = reduxFetcher.createFetchAction('data', 'http://localhost/api', {
                    headers: {
                        'X-I-LOVE-VG': 'ohyes'
                    }
                })[CALL_API];

                overridenAction.headers['X-I-LOVE-VG'].should.be.equal('ohyes');
            });

            it('must override using method from options', () => {
                const overridenAction = reduxFetcher.createFetchAction('data', 'http://localhost/api', {
                    method: 'POST'
                })[CALL_API];

                overridenAction.method.should.be.equal('POST');
            });
        });

        describe('createFetchReducer', () => {
            let reducer;

            beforeEach(() => {
                reducer = reduxFetcher.createFetchReducer('data');
            });

            afterEach(() => {
                reducer = null;
            });

            it('must throw if identifier is not provided', () => {
                (() => reduxFetcher.createFetchReducer()).should.throw(Error);
            });

            it('must throw if reducer is called without arguments', () => {
                (() => (reduxFetcher.createFetchReducer('id'))()).should.throw(Error);
            });

            it('must return the same state if not the fetch action', () => {
                const originalState = {
                    payload: 'donottouch'
                };

                const state = reducer(
                    originalState,
                    {
                        type: 'OTHERDATA_FETCH_SUCCESS',
                        meta: {
                            endpoint: 'http://localhost/api'
                        },
                        payload: 'fetched-data'
                    }
                );

                state.should.be.equal(originalState);
            });

            it('must return payload with data and meta with endpoint '
                + 'with no loading and no errors on fetch success', () => {
                const state = reducer(
                    {},
                    {
                        type: 'DATA_FETCH_SUCCESS',
                        meta: {
                            endpoint: 'http://localhost/api'
                        },
                        payload: 'fetched-data'
                    }
                );

                state.loading.should.be.equal(false);
                state.error.should.be.equal(false);
                state.meta.endpoint.should.be.equal('http://localhost/api');
                state.payload.should.be.equal('fetched-data');
            });

            it('must return object containing payload with ' +
                'name and message of error and payload in meta with no loading on fetch error', () => {
                const errorPayload = {
                    name: 'errorname',
                    message: 'errormessage'
                };

                const state = reducer(
                    {},
                    {
                        type: 'DATA_FETCH_FAILURE',
                        meta: {
                            endpoint: 'http://localhost/api'
                        },
                        payload: errorPayload
                    }
                );

                state.loading.should.be.equal(false);
                state.error.should.be.equal(true);
                state.payload.should.be.equal(errorPayload);
                state.meta.endpoint.should.be.equal('http://localhost/api');
            });

            it('must return endpoint in meta with no error and active loading on fetch pending', () => {
                const endpoint = 'http://localhost/awesomeendpoint';
                const state = reducer({}, {
                    type: 'DATA_FETCH_PENDING',
                    meta: {
                        endpoint
                    }
                });

                state.loading.should.be.equal(true);
                state.error.should.be.equal(false);
                state.meta.endpoint.should.be.equal(endpoint);
            });
        });
    });
});
