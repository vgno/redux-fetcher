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

            it('must have defined types with expected naming convention in the correct order', () => {
                validAction.types.length.should.be.equal(3);
                validAction.types[0].should.be.a('object');
                validAction.types[0].type.should.be.equal('DATA_FETCH_PENDING');
                validAction.types[0].payload.should.be.a('function');
                validAction.types[0].payload().endpoint.should.equal('http://localhost/api');

                validAction.types[1].should.be.a('string');
                validAction.types[1].should.equal('DATA_FETCH_SUCCESS');
                validAction.types[2].should.be.a('string');
                validAction.types[2].should.equal('DATA_FETCH_FAILURE');
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

            it('must return payload with no loading and no errors on fetch success', () => {
                const state = reducer({}, { type: 'DATA_FETCH_SUCCESS', payload: 'fetched-data'});

                state.loading.should.be.equal(false);
                state.error.should.be.equal(false);
                state.payload.should.be.equal('fetched-data');
            });

            it('must return string containing name and message of error with no loading on fetch error', () => {
                const state = reducer({}, {
                    type: 'DATA_FETCH_FAILURE',
                    payload: {
                        name: 'errorname',
                        message: 'errormessage'
                    }
                });

                state.loading.should.be.equal(false);
                state.error.should.be.equal('errorname: errormessage');
            });

            it('must return endpoint with no error and active loading on fetch pending', () => {
                const endpoint = 'http://localhost/awesomeendpoint';
                const state = reducer({}, {
                    type: 'DATA_FETCH_PENDING',
                    payload: {
                        endpoint
                    }
                });

                state.loading.should.be.equal(true);
                state.endpoint.should.be.equal(endpoint);
            });
        });
    });
});
