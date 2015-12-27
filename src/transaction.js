/**
 * Applicative.
 *
 * @param {Object} x Anything to put in the Transaction Monad.
 *
 * @return {Transaction} A Transaction of x.
 */
const of = x => Transaction((rej, res) => res(x), (rej, res) => res());

/**
 * A Transaction monad builds up two computations: One containing the async IO
 * to perform during the transaction, and the other containing the async IO to
 * perform during the rollback.
 *
 * The idea is that the computations are built up step by step in parallel, so
 * if a step in the transaction fails, the rollback steps have only built up
 * to that point, and can be walked in reverse to roll back everything starting
 * from the point of failure.
 */
const Transaction = (commit, rollback) => {

  /**
   * A helper to roll back two Transactions in parallel.
   *
   * @sig rollbackBoth :: Transaction -> (* -> Void) -> (* -> Void) -> Void
   *
   * @param {Transaction} m The other Transaction to roll back.
   * @param {Function} rej The callback to call in case of failure.
   * @param {Function} res The callback to call in case of success.
   *
   * @return {Void}
   */
  const rollbackBoth = m => (rej, res) => {
    let resolved = false, rejected = false;
    const resOnce = () => resolved ? res() : (resolved = true);
    const rejOnce = x => rejected || (rejected = true, rej(x));
    rollback(rejOnce, resOnce);
    m.rollback(rejOnce, resOnce);
  };

  /**
   * Chain.
   *
   * @sig chain :: Transaction[a, b] => (b -> Transaction[a, c]) -> Transaction[a, c]
   *
   * @param {Function} f The flat mapper.
   *
   * @return {Transaction} The new Transaction.
   */
  const chain = f => {
    let m;
    return Transaction(
      (rej, res) => commit(rej, x => {
        m = f(x);
        m.commit(e => rollback(rej, () => rej(e)), res)
      }),
      (rej, res) => rollbackBoth(m)(rej, res)
    );
  };

  /**
   * Functor.
   *
   * @sig map :: Transaction[a, b] => (b -> c) -> Transaction[a, c]
   *
   * @param {Function} f The mapper.
   *
   * @return {Transaction} The new Transaction.
   */
  const map = f => chain(x => of(f(x)));

  /**
   * Apply.
   *
   * @sig ap :: Transaction[a, (b -> c)] => Transaction[a, b] -> Transaction[a, c]
   *
   * @param {Transaction} m The Transaction to apply to.
   *
   * @return {Transaction} The new Transaction.
   */
  const ap = m => Transaction(
    (rej, res) => {
      let fn, val, rejected = false;
      const rejOnce = x => rejected || (rejected = true, rej(x));
      commit(rejOnce, f => val ? res(f(val)) : (fn = f));
      m.commit(rejOnce, x => fn ? res(fn(x)) : (val = x));
    },
    rollbackBoth(m)
  );

  /**
   * Returns a string representation of the Transaction.
   *
   * @sig Transaction => String
   *
   * @return {String}
   */
  const toString = () => `Transaction(${commit.toString()}, ${rollback.toString()})`;

  //Create the new Transaction.
  //Uses `Object.create` to generate the right inheritance tree.
  //Uses `Object.assign` instead of prototype to avoid using `this`.
  return Object.assign(
    Object.create(Transaction.prototype),
    {commit, rollback, chain, map, ap, toString}
  );

};

//Expose the of function on the constructor and prototype.
Transaction.of = Transaction.prototype.of = of;

//Export the Transaction as per default.
export default Transaction;
