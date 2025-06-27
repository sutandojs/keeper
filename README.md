# @sutando/keeper

> 🛡️ A lightweight authentication & API token plugin for [Sutando ORM](https://sutando.org), inspired by Laravel Sanctum.

**@sutando/keeper** provides sessionless, token-based authentication for modern applications including SPAs, mobile clients, and traditional backends.

---

## ✨ Features

- 🔐 Personal access tokens scoped to users
- ⚙️ Extensible and database-agnostic
- 🧩 Compatible with any Sutando Model (e.g. `User`)

---

## 📦 Installation

```bash
npm install @sutando/keeper
```

Or using pnpm:

```bash
pnpm add @sutando/keeper
```

Auto create migration file and run migration

```bash
sutando migrate:publish @sutando/keeper
sutando migrate:run
```

<details>
<summary>Alternatively, you can create the token table manually</summary>

```js
await sutando.connection().schema.createTable('personal_access_tokens', (table) => {
  table.increments('id');
  table.string('tokenable_type').index();
  table.integer('tokenable_id').index();
  table.string('name');
  table.string('token', 64).unique();
  table.string('abilities').nullable();
  table.datetime('last_used_at').nullable();
  table.datetime('expires_at').nullable();
  table.timestamps();

  table.index(['tokenable_type', 'tokenable_id'], 'tokenable_index');
});
```
</details>

---

## 🔐 Usage

### Setup

```ts
import { HasApiTokens, PersonalAccessToken } from '@sutando/keeper'
import { sutando, Model } from 'sutando'

class User extends HasApiTokens()(Model) {
  // your model definition
}
```

### Issue Token

```ts
const user = await User.query().find(1);
const token = await user.createToken('mobile-app');

// Issue token with abilities
const token = await user.createToken('admin', ['read', 'write']);

// Issue token with expiration date
const token = await user.createToken(
  'mobile-app', ['read', 'write'], new Date(Date.now() + 7 * 86400000);
);
```

### Validate Token

```ts
const user = await User.findByToken(tokenString);

if (user.tokenCan('read')) {
  // Access granted
}
```

### Revoking Tokens

```ts
// Revoke all tokens...
await user.tokens().delete();

// Revoke the token that was used to authenticate the current request...
await user.currentAccessToken().delete();

// Revoke a specific token...
await user.tokens().where('id', tokenId).delete();
```

---

## 🧪 Example with Hono

```ts
import User from './models/user'
import { bearerAuth } from 'hono/bearer-auth'

const auth = (ability?: string) =>
  bearerAuth({
    verifyToken: async (token, c) => {
      const user = await User.findByToken(token)
      if (!user || (ability && user.tokenCant(ability))) {
        return false
      }
      c.set('user', user)
      return true
    },
  })

app.post('/tokens/create', async (c) => {
  const user = await User.query().find(1)
  const token = await user.createToken('mobile-app')
  return c.json({ token: token.plainTextToken })
})

app.get('/api/user', auth(), async (c) => {
  const user = c.get('user')
  return c.json(user)
})

app.get('/admin', auth('write'), handler)
```

---

## 📌 API Reference

### `HasApiTokens(options)`

- `accessTokenModel`: Model used for token storage (optional, default: `PersonalAccessToken`)
- `token_prefix`: Prefix for token string (optional, default: `''`)
- `type`: Token type (optional, default: Model name)
- `separator`: Separator for returned token string (optional, default: `|`)

### `PersonalAccessToken`

- `personalAccessToken.findToken(token: string): Promise<PersonalAccessToken | null>`
- `personalAccessToken.can(ability: string): boolean`
- `personalAccessToken.cant(ability: string): boolean`

### `NewAccessToken`

- `newAccessToken.accessToken: PersonalAccessToken`
- `newAccessToken.plainTextToken: string`

### User Model Extensions

- `createToken(name: string, abilities?: string[], expires_at?: Date | string): Promise<NewAccessToken>`
- `findByToken(token: string, last_used_at?: Date | string): Promise<User | null>`
- `tokenCan(ability: string): boolean`
- `tokenCant(ability: string): boolean`

---

## 🔐 Security Notes

All tokens are stored as **SHA-256 hashes**, ensuring they cannot be reverse-engineered if leaked.

---

## 📄 License

MIT © Kidd Yu
