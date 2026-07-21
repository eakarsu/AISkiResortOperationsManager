const express=require('express');
const {pool}=require('../db');
const {validateOffer,validateTransition}=require('../domain/reservationPolicy');
const router=express.Router();
const tenantOf=(req)=>String(req.user.tenant_id||req.user.resort_id||req.user.id);

router.post('/',async(req,res,next)=>{try{
  const offer=validateOffer(req.body); const tenant=tenantOf(req); if(!req.body.idempotency_key||!req.body.currency) throw new Error('idempotency_key and currency are required');
  const result=await pool.query(`INSERT INTO resort_reservations(tenant_id,location_id,guest_id,reservation_ref,idempotency_key,product_ref,service_at,quantity,currency,quoted_total,inventory_version,price_version,payload,created_by)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT(tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`,
    [tenant,req.body.location_ref,String(req.user.id),req.body.reservation_ref,req.body.idempotency_key,req.body.product_ref,req.body.service_at,offer.quantity,req.body.currency,offer.total,req.body.inventory_version,req.body.price_version,req.body.payload||{},String(req.user.id)]);
  res.status(201).json(result.rows[0]);
}catch(error){next(error);}});

router.get('/:id',async(req,res,next)=>{try{const result=await pool.query('SELECT * FROM resort_reservations WHERE id=$1 AND tenant_id=$2',[req.params.id,tenantOf(req)]);if(!result.rows[0])return res.status(404).json({error:'Reservation not found'});res.json(result.rows[0]);}catch(error){next(error);}});

router.post('/:id/transition',async(req,res,next)=>{const client=await pool.connect();try{
  const tenant=tenantOf(req);await client.query('BEGIN');const found=await client.query('SELECT * FROM resort_reservations WHERE id=$1 AND tenant_id=$2 FOR UPDATE',[req.params.id,tenant]);const current=found.rows[0];
  if(!current){await client.query('ROLLBACK');return res.status(404).json({error:'Reservation not found'});}if(Number(req.body.version)!==current.version){await client.query('ROLLBACK');return res.status(409).json({error:'Stale workflow version'});}
  validateTransition(current.stage,req.body.to_stage,{...req.body.context,role:req.user.role,actorId:String(req.user.id),createdBy:current.created_by});
  const result=await client.query('UPDATE resort_reservations SET stage=$1,version=version+1,assigned_to=COALESCE($2,assigned_to),updated_at=NOW() WHERE id=$3 RETURNING *',[req.body.to_stage,req.body.assigned_to||null,current.id]);
  const receipt=req.body.context?.paymentReceipt||req.body.context?.refundReceipt||req.body.context?.inventoryReceipt;
  if(receipt?.provider&&receipt?.receipt_id) await client.query(`INSERT INTO resort_integration_deliveries(tenant_id,reservation_id,provider,operation,idempotency_key,status,receipt)
    VALUES($1,$2,$3,$4,$5,'acknowledged',$6) ON CONFLICT(tenant_id,provider,idempotency_key) DO NOTHING`,[tenant,current.id,receipt.provider,req.body.to_stage,receipt.receipt_id,receipt]);
  await client.query('INSERT INTO resort_workflow_audit(tenant_id,reservation_id,actor_id,action,from_stage,to_stage,payload) VALUES($1,$2,$3,$4,$5,$6,$7)',[tenant,current.id,String(req.user.id),'reservation.transitioned',current.stage,req.body.to_stage,req.body.context||{}]);
  await client.query('COMMIT');res.json(result.rows[0]);
}catch(error){await client.query('ROLLBACK').catch(()=>{});next(error);}finally{client.release();}});
module.exports=router;
