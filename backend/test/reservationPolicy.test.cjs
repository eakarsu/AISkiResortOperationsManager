const test=require('node:test');const assert=require('node:assert/strict');const p=require('../src/domain/reservationPolicy');
const offer={reservation_ref:'r1',location_ref:'mountain',product_ref:'lesson',inventory_version:'i2',price_version:'p3',service_at:'2026-12-01',quantity:2,unit_price:99.5,available_quantity:3};
test('prices available inventory deterministically',()=>assert.deepEqual(p.validateOffer(offer),{quantity:2,unit_price:99.5,total:199}));
test('rejects stock races and invalid prices',()=>assert.throws(()=>p.validateOffer({...offer,available_quantity:1}),/availability/));
test('confirmation requires settled payment',()=>assert.throws(()=>p.validateTransition('payment_pending','confirmed',{paymentStatus:'pending'}),/settled/));
test('allocation requires inventory and staff evidence',()=>assert.throws(()=>p.validateTransition('confirmed','allocated',{}),/allocation/));
test('refund requires authority and independent receipt',()=>assert.throws(()=>p.validateTransition('refund_pending','refunded',{role:'finance_manager',actorId:'u1',createdBy:'u1',refundReceipt:'x'}),/independent/));
test('completion requires fulfillment evidence',()=>assert.throws(()=>p.validateTransition('in_service','completed',{}),/fulfillment/));

