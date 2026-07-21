const STAGES = Object.freeze(['draft','held','payment_pending','confirmed','allocated','in_service','partial_fulfillment','completed','cancelled','refund_pending','refunded','recovered','closed']);
const acknowledged = (receipt) => Boolean(receipt && receipt.provider && receipt.receipt_id && receipt.status === 'acknowledged' && !Number.isNaN(new Date(receipt.acknowledged_at).valueOf()));

function validateOffer(input) {
  for (const field of ['reservation_ref','location_ref','product_ref','inventory_version','price_version','service_at']) if (!input[field]) throw new Error(`${field} is required`);
  const quantity = Number(input.quantity);
  const unitPrice = Number(input.unit_price);
  const available = Number(input.available_quantity);
  if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isInteger(available) || available < quantity) throw new Error('valid price and sufficient availability required');
  return { quantity, unit_price: unitPrice, total: Number((quantity * unitPrice).toFixed(2)) };
}

function validateTransition(from, to, context = {}) {
  const allowed = { draft:['held','cancelled'], held:['payment_pending','cancelled'], payment_pending:['confirmed','cancelled'], confirmed:['allocated','cancelled','refund_pending'], allocated:['in_service','cancelled','refund_pending'], in_service:['partial_fulfillment','completed','recovered'], partial_fulfillment:['completed','refund_pending','recovered'], completed:['refund_pending'], cancelled:['refund_pending'], refund_pending:['refunded','recovered'], refunded:[], recovered:['allocated','closed'], closed:[] };
  if (!allowed[from]?.includes(to)) throw new Error('invalid reservation transition');
  if (to === 'confirmed' && (!acknowledged(context.paymentReceipt) || context.paymentStatus !== 'settled')) throw new Error('settled acknowledged payment receipt required');
  if (to === 'allocated' && (!acknowledged(context.inventoryReceipt) || !context.staffOwner)) throw new Error('acknowledged inventory allocation and staff owner required');
  if (['refund_pending','refunded'].includes(to) && !['supervisor','finance_manager','admin'].includes(context.role)) throw new Error('refund authority required');
  if (to === 'refunded' && (!acknowledged(context.refundReceipt) || context.actorId === context.createdBy)) throw new Error('independent acknowledged refund receipt required');
  if (to === 'completed' && !context.fulfillmentEvidence) throw new Error('fulfillment evidence required');
  return true;
}

module.exports = { STAGES, validateOffer, validateTransition };
