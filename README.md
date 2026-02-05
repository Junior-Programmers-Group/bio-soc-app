# Respecia — Local auth demo

This project contains a simple frontend and a minimal Node.js backend demonstrating authentication backed by PostgreSQL.

Quick start

1. Copy `.env.example` to `.env` and update the `DATABASE_URL` value.

2. Install dependencies:

```bash
npm install
```

3. Initialize the database (run the SQL in `db/init.sql`). Example using psql:

```bash
psql $DATABASE_URL -f db/init.sql
```

4. (Optional) Create a test user. Run this Node snippet to generate a bcrypt hash and insert into `users`:

```js
// run with `node -e "require('bcrypt').hash('Password123',10).then(h=>console.log(h))"`
```

Then insert into DB:

```sql
INSERT INTO users(email, password_hash) VALUES('demo@example.com','<HASH>');
```

5. Start the server:

```bash
npm start
```

6. Open `login.html` in a browser and point the form to the server (if serving static files differently, ensure the API root is reachable).

Notes
- The server returns a simple JSON success on login — replace with proper session or JWT handling for production.
- The reset endpoint creates a token in `password_resets` but does not send email. Implement an email provider to deliver reset links.
