# Fantasy Transactions

A Fantasy Land compliant Monad for asynchronous transactions

## Example

```js
//A mock database query.

const query = (x, done) => void setTimeout(() => (
  log(x),
  done(null, 1)
), 300);

//Sequential transactions.

Transaction(
  (rej, res) => query('INSERT foo INTO bar', (e, x) => e ? rej(e) : res(x)),
  (rej, res) => query('DELETE foo FROM bar', (e, x) => e ? rej(e) : res())
)

.chain(x => Transaction(
  (rej, res) => query(`INSERT ${x} INTO ids`, (e, x) => e ? rej(e) : res(x)),
  (rej, res) => query(`DELETE ${x} FROM ids`, (e, x) => e ? rej(e) : res())
))

.chain(x => Transaction(
  (rej, res) => rej("Final transaction failed!"),
  (rej, res) => res()
))

.commit(err, log);

//Parallel transactions.

Transaction.of(a => b => [a, b])

.ap(Transaction(
  (rej, res) => query('INSERT foo INTO bar', (e, x) => e ? rej(e) : res(x)),
  (rej, res) => query('DELETE foo FROM bar', (e, x) => e ? rej(e) : res())
))

.ap(Transaction(
  (rej, res) => query('INSERT fiz INTO buz', (e, x) => e ? rej(e) : res(x)),
  (rej, res) => query('DELETE fiz FROM buz', (e, x) => e ? rej(e) : res())
))

.chain(([a, b]) => Transaction(
  (rej, res) => rej(`Could not do ${a} + ${b}`),
  (rej, res) => res()
))

.commit(err, log);
```
