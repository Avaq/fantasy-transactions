import Transaction from '../src/transaction';

const noop = () => {};
const identity = x => x;
const compose = f => g => x => f(g(x));
const add = a => b => a + b;
const mult = a => b => a * b;

const failRej = x => {
  throw new Error(`Invalidly entered rejection branch with value ${x}`);
};

describe('Fantasy Law', () => {

  const assertEqual = (a, b, done) => a.commit(failRej, a => b.commit(failRej, b => (
    expect(a).to.equal(b),
    done()
  )));

  describe('Functor', () => {

    it('identity', done => {
      const a = Transaction.of(1);
      const b = a.map(identity);
      assertEqual(a, b, done);
    });

    it('composition', done => {
      const x = Transaction.of(1);
      const a = x.map(compose(mult(2))(add(1)));
      const b = x.map(add(1)).map(mult(2));
      assertEqual(a, b, done);
    });

  });

  describe('Apply', () => {

    it('composition', done => {
      const f = Transaction.of(mult(2));
      const g = Transaction.of(add(1));
      const x = Transaction.of(1);
      const a = f.map(compose).ap(g).ap(x);
      const b = f.ap(g.ap(x));
      assertEqual(a, b, done);
    });

  });

  describe('Applicative', () => {

    it('identity', done => {
      const a = Transaction.of(1);
      const b = Transaction.of(identity).ap(a);
      assertEqual(a, b, done);
    });

    it('homomorphism', done => {
      const f = add(1);
      const x = 1;
      const a = Transaction.of(f).ap(Transaction.of(x));
      const b = Transaction.of(f(x));
      assertEqual(a, b, done);
    });

    it('interchange', done => {
      const f = Transaction.of(add(1));
      const x = 1;
      const a = f.ap(Transaction.of(x));
      const b = Transaction.of(g => g(x)).ap(f);
      assertEqual(a, b, done);
    });

  });

  describe('Chain', () => {

    it('associativity', done => {
      const x = Transaction.of(1);
      const f = compose(Transaction.of)(add(1));
      const g = compose(Transaction.of)(mult(2));
      const a = x.chain(f).chain(g);
      const b = x.chain(x => f(x).chain(g));
      assertEqual(a, b, done);
    });

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
