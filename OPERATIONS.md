# Operations

Provision least-privilege PostgreSQL, copy `.env.example` to `.env`, replace credentials and use a random 32+ character JWT secret. Install dependencies intentionally, apply `./scripts/migrate.sh`, then use `./start.sh backend` or `all`; startup never creates users/databases, seeds, installs, kills ports or migrates.

Monitor held inventory expiry, stale reservation versions, failed/dead-letter provider deliveries, double-booking/payment/refund evaluation counters and partial fulfillment. Reconcile authoritative provider receipts before advancing. Supervisors use cancellation/refund/recovery states and record evidence; never infer payment success from a timeout. AI/gap routes are quarantined.
