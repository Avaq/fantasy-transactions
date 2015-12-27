import Transaction from '../src/transaction';

const noop = () => {};

describe('Fantasy Law', () => {

  describe('Functor', () => {

  });

  describe('Apply', () => {

  });

  describe('Applicative', () => {

  });

  describe('Chain', () => {

  });

});

describe('Behaviour', () => {

  describe('constructor', () => {

    it('returns an instance of Transaction', () => {
      expect(Transaction(noop, noop)).to.be.an.instanceof(Transaction);
    });

  });

  describe('.of()', () => {

  });

  describe('#commit()', () => {

  });

  describe('#rollback()', () => {

  });

  describe('#chain()', () => {

  });

  describe('#ap()', () => {

  });

  describe('#map()', () => {

  });

});
