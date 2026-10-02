# Shagalny Backend — ERD + Payment edition

Express + MongoDB API rebuilt to match the original ERD and add the escrow
payment system.

## What changed vs the previous version
- `Employer` model renamed to **`Vacancy`** (the company that posts jobs).
- Added **`JobSeeker`** (national ID as business key), **`Admin`**, **`Moderator`**
  as their own collections, linked to `User` by role.
- Added the payment layer: **`Card`**, **`Payment`**, **`Transaction`**,
  **`PaymentStatus`** (Held / Completed / Failed).
- Removed `Review`, `Notification`, `Ticket` (not part of the old ERD).

## Models
User, JobSeeker, Vacancy, Admin, Moderator, Card, Job, Application,
PaymentStatus, Payment, Transaction.

## Payment / escrow flow
1. `POST /api/payments` — company holds money in escrow for a hired seeker.
   The seeker's `Card` is the payout destination. Writes a `hold` transaction.
2. `PUT /api/payments/:id/release` — job confirmed done; escrow released and
   funds transferred to the seeker's card. Writes `release` + `transfer`.
3. `PUT /api/payments/:id/refund` — job not done; escrow returned to company.
   Writes a `refund` transaction.
4. `GET /api/payments/:id` — payment with its full transaction history.

## Run
```bash
npm install
cp .env.example .env   # set MONGO_URI + JWT_SECRET
npm run seed
npm run dev
```

## Seeded accounts
| Role      | Email                     | Password    |
|-----------|---------------------------|-------------|
| Admin     | admin@shagalny.eg         | admin1234   |
| Moderator | mod@shagalny.eg           | mod12345    |
| Seeker    | youssef@example.com       | password123 |
| Company   | karim@pyramidevents.eg    | password123 |
