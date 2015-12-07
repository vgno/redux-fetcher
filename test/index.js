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
        });
        describe('createFetchReducer', () => {
            it('must be function', () => {
                reduxFetcher.createFetchReducer.should.be.a('function');
            });
        });
    });
});
