BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS resort_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, location_id TEXT NOT NULL, guest_id TEXT NOT NULL,
  reservation_ref TEXT NOT NULL, idempotency_key TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'draft', version INTEGER NOT NULL DEFAULT 1,
  product_ref TEXT NOT NULL, service_at TIMESTAMPTZ NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), currency TEXT NOT NULL,
  quoted_total NUMERIC(12,2) NOT NULL CHECK(quoted_total >= 0), inventory_version TEXT NOT NULL, price_version TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}', created_by TEXT NOT NULL, assigned_to TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,idempotency_key), UNIQUE(tenant_id,reservation_ref), CHECK(stage IN ('draft','held','payment_pending','confirmed','allocated','in_service','partial_fulfillment','completed','cancelled','refund_pending','refunded','recovered','closed'))
);
CREATE INDEX IF NOT EXISTS resort_reservations_location_stage_idx ON resort_reservations(tenant_id,location_id,stage,service_at);
CREATE TABLE IF NOT EXISTS resort_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, reservation_id UUID NOT NULL REFERENCES resort_reservations(id),
  resource_type TEXT NOT NULL, resource_ref TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), allocation_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'held', UNIQUE(tenant_id,resource_type,resource_ref,allocation_version)
);
CREATE TABLE IF NOT EXISTS resort_integration_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, reservation_id UUID REFERENCES resort_reservations(id),
  provider TEXT NOT NULL, operation TEXT NOT NULL, idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ, request JSONB NOT NULL DEFAULT '{}', receipt JSONB, last_error TEXT, UNIQUE(tenant_id,provider,idempotency_key),
  CHECK(status IN ('pending','sent','acknowledged','failed','dead_letter','reconciled'))
);
CREATE TABLE IF NOT EXISTS resort_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, fixture_version TEXT NOT NULL, double_bookings INTEGER NOT NULL,
  oversells INTEGER NOT NULL, payment_mismatches INTEGER NOT NULL, refund_mismatches INTEGER NOT NULL, passed BOOLEAN NOT NULL,
  details JSONB NOT NULL DEFAULT '{}', evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS resort_workflow_audit (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, reservation_id UUID, actor_id TEXT NOT NULL, action TEXT NOT NULL,
  from_stage TEXT, to_stage TEXT, payload JSONB NOT NULL DEFAULT '{}', occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION resort_workflow_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'resort workflow audit is append-only'; END; $$;
DROP TRIGGER IF EXISTS resort_workflow_audit_no_mutation ON resort_workflow_audit;
CREATE TRIGGER resort_workflow_audit_no_mutation BEFORE UPDATE OR DELETE ON resort_workflow_audit FOR EACH ROW EXECUTE FUNCTION resort_workflow_audit_immutable();
COMMIT;
