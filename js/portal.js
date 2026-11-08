/* BimCar Connect rental company portal: today, schedule, pick-ups & returns, calls,
   customers, maintenance and reports. Every record is limited to the signed-in company
   by the database, so companies only ever see their own data. */
(async function(){
await Live.ready;
const A=App,esc=A.esc,icon=A.icon,root=document.getElementById('portal-app');
if(Live.failed)return;
const CO=A.requireCompany();if(!CO)return;
const client=Live.client;
const val=async q=>{const r=await q;if(r.error)throw r.error;return r.data;};
let tablesReady=true,calls=[],handovers=[],maint=[],notes=[];
async function load(){
 try{
  [calls,handovers,maint,notes]=await Promise.all([
   val(client.from('drivebim_calls').select('*').eq('company_id',CO).order('at',{ascending:false}).limit(500)),
   val(client.from('drivebim_handovers').select('*').eq('company_id',CO).order('at',{ascending:false}).limit(500)),
   val(client.from('drivebim_maintenance').select('*').eq('company_id',CO).order('due',{ascending:true})),
   val(client.from('drivebim_customer_notes').select('*').eq('company_id',CO))
  ]);tablesReady=true;
 }catch(e){tablesReady=!Live.admin?.missing?.(e);calls=[];handovers=[];maint=[];notes=[];if(tablesReady)console.error(e);}
}
await load();

/* ---------- shared helpers ---------- */
const T=()=>A.todayISO();
const d=(s,o)=>s?A.fmtDate(String(s).slice(0,10),o||{weekday:'short',day:'numeric',month:'short'}):'—';
const cars=()=>A.vehicles().filter(v=>v.company===CO);
const carName=id=>(A.vehicle(id)||{name:'Removed car'}).name;
const bookings=()=>A.store.get('coBookings',[]).filter(b=>b.company===CO);
const phoneBookings=()=>cars().flatMap(v=>(v.availabilityBlocks||[]).filter(b=>b.source==='phone').map(b=>({...b,vehicle:v.id,phone:true})));
const empty=(t,x)=>`<div class="mini-empty"><p class="muted">${esc(t)}</p>${x||''}</div>`;
const head=(t,sub,actions)=>`<div class="dash-head"><div><h1>${esc(t)}</h1>${sub?`<p class="muted" style="margin:6px 0 0">${sub}</p>`:''}</div>${actions?`<div class="row">${actions}</div>`:''}</div>`;
const notReady=()=>tablesReady?'':`<div class="notice info" style="margin-bottom:18px">${icon('info')}<p><b>Some tools are still being switched on.</b> Call log, pick-up checklists, maintenance reminders and customer notes will be available shortly. Bookings and the schedule work now.</p></div>`;
const phoneLink=p=>{const n=String(p||'').replace(/[^\d+]/g,'');return n.length>=7?`<a class="btn btn-ghost btn-sm" href="tel:${esc(n)}">${icon('phone')}Call</a><a class="btn btn-ghost btn-sm" href="https://wa.me/${esc(n.replace(/\D/g,''))}" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>`:'';};
const contactLinks=c=>/@/.test(c||'')?`<a class="btn btn-ghost btn-sm" href="mailto:${esc(c)}">${icon('mail')}Email</a>`:phoneLink(c);
const handover=(ref,kind)=>handovers.find(h=>(h.booking_id||h.ref)===ref&&h.kind===kind);
async function run(btn,fn,ok){if(btn){btn.disabled=true;btn.classList.add('is-loading');}try{await fn();if(ok)A.toast(ok);await load();await draw();}catch(e){A.toast(Live.admin?.missing?.(e)?'This tool is still being switched on. Please try again soon.':Live.error(e));}finally{if(btn?.isConnected){btn.disabled=false;btn.classList.remove('is-loading');}}}
function modal(id,title,inner,wide){document.getElementById(id)?.remove();const m=document.createElement('div');m.className='modal';m.id=id;m.setAttribute('aria-hidden','true');m.innerHTML=`<div class="modal-box${wide?' portal-wide':''}" role="dialog" aria-labelledby="${id}-t"><div class="modal-head"><h3 id="${id}-t">${esc(title)}</h3><button class="icon-btn" data-x aria-label="Close">${icon('close')}</button></div>${inner}</div>`;document.body.appendChild(m);const close=()=>{A.closeModal(m);setTimeout(()=>m.remove(),300);};m.addEventListener('click',e=>{if(e.target.closest('[data-x]')||e.target===m)close();});A.openModal(id);return {m,close};}
function csv(name,rows){if(!rows.length){A.toast('Nothing to export yet');return;}const cols=Object.keys(rows[0]),q=v=>{v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};const blob=new Blob(['﻿'+[cols.join(','),...rows.map(r=>cols.map(c=>q(r[c])).join(','))].join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${name}-${T()}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}

/* All rentals the company handles: website bookings and phone/walk-in bookings */
function rentals(){
 const web=bookings().filter(b=>['request','confirmed','onrent','completed'].includes(b.status)).map(b=>({ref:b.id,web:true,status:b.status,vehicle:b.vehicle,from:b.from,to:b.to,name:b.renter||'Renter',contact:b.contact||'',pickup:b.pickup||'',total:Number(b.total)||0,renterId:b.renterId}));
 const ph=phoneBookings().map(p=>{const out=handover(p.id,'return'),inn=handover(p.id,'pickup');return {ref:p.id,web:false,status:out?'completed':inn?'onrent':'confirmed',vehicle:p.vehicle,from:p.from,to:p.to,name:p.customer?.name||'Phone booking',contact:p.customer?.phone||p.customer?.email||'',pickup:p.pickup||'',total:Number(p.total)||0};});
 return [...web,...ph];
}

/* ---------- sections ---------- */
const S={};
S.today=async()=>{
 const t=T(),tm=A.addDays(t,1),R=rentals();
 const pickups=R.filter(r=>r.status==='confirmed'&&(r.from===t||r.from===tm)).sort((a,b)=>a.from.localeCompare(b.from));
 const lateOut=R.filter(r=>r.status==='confirmed'&&r.from<t);
 const returns=R.filter(r=>r.status==='onrent'&&r.to<=tm).sort((a,b)=>a.to.localeCompare(b.to));
 const requests=bookings().filter(b=>b.status==='request');
 const follow=calls.filter(c=>!c.done&&c.follow_up&&c.follow_up<=t);
 const due=maint.filter(m=>!m.done_at&&m.due&&m.due<=A.addDays(t,7));
 const onRent=R.filter(r=>r.status==='onrent').length;
 const row=(r,kind)=>`<div class="list-item op-item" data-ref="${esc(r.ref)}"><div class="when"><b>${A.parseDay(kind==='return'?r.to:r.from)}</b><span>${A.fmtDate(kind==='return'?r.to:r.from,{month:'short'})}</span></div><div style="flex:1;min-width:0"><b>${esc(carName(r.vehicle))}</b>${r.web?'':' <span class="badge">Phone</span>'}<div class="small muted">${esc(r.name)}${r.pickup?' · '+esc(r.pickup):''}${kind==='return'&&r.to<t?' · <b style="color:#B4183C">overdue</b>':''}</div></div><div class="row" style="gap:6px">${contactLinks(r.contact)}<button class="btn ${kind==='return'?'btn-ghost':'btn-primary'} btn-sm" data-handover="${kind}">${kind==='return'?'Check in return':'Start pick-up'}</button></div></div>`;
 return head(`Today · ${d(t,{weekday:'long',day:'numeric',month:'long'})}`,'Everything that needs you today and tomorrow.',`<button class="btn btn-ghost" data-new-call>${icon('phone')}Log a call</button><button class="btn btn-primary" data-new-phone>${icon('plus')}Phone booking</button>`)+notReady()+
 `<div class="kpis"><div class="kpi feature"><div class="k-label">Pick-ups today & tomorrow</div><div class="k-num">${pickups.length}</div><div class="k-delta">${lateOut.length?lateOut.length+' late, not collected yet':'Keys ready?'}</div></div><div class="kpi"><div class="k-label">Returns due</div><div class="k-num">${returns.length}</div><div class="k-delta">${returns.filter(r=>r.to<t).length} overdue</div></div><div class="kpi"><div class="k-label">Cars on rent now</div><div class="k-num">${onRent}</div><div class="k-delta">of ${cars().length} in your fleet</div></div><a class="kpi" href="dashboard-bookings.html"><div class="k-label">Requests to answer</div><div class="k-num">${requests.length}</div><div class="k-delta">${requests.length?'Reply soon to win them':'All caught up'}</div></a></div>
 <div class="grid dash-row" style="grid-template-columns:1fr 1fr;margin-top:22px">
  <div class="card"><h3 style="margin-top:0">${icon('car')} Pick-ups</h3>${[...lateOut,...pickups].map(r=>row(r,'pickup')).join('')||empty('No pick-ups today or tomorrow.')}</div>
  <div class="card"><h3 style="margin-top:0">${icon('undo')} Returns</h3>${returns.map(r=>row(r,'return')).join('')||empty('No returns due today or tomorrow.')}</div>
  <div class="card"><div class="row between"><h3 style="margin:0">${icon('phone')} Callbacks due</h3><a class="small" href="#calls">Call log</a></div>${follow.map(c=>`<div class="list-item" data-call="${esc(c.id)}"><div style="flex:1;min-width:0"><b>${esc(c.name||'Caller')}</b><div class="small muted">${esc(c.topic||'')} · due ${d(c.follow_up)}</div></div>${phoneLink(c.phone)}<button class="btn btn-ghost btn-sm" data-call-done>Done</button></div>`).join('')||empty('No callbacks due.')}</div>
  <div class="card"><div class="row between"><h3 style="margin:0">${icon('gear')} Maintenance this week</h3><a class="small" href="#maintenance">All</a></div>${due.map(m=>`<div class="list-item" data-maint="${esc(m.id)}"><div style="flex:1;min-width:0"><b>${esc(m.title)}</b><div class="small muted">${esc(carName(m.vehicle_id))} · ${m.due<t?'<b style="color:#B4183C">overdue</b>':'due '+d(m.due)}</div></div><button class="btn btn-ghost btn-sm" data-maint-done>Mark done</button></div>`).join('')||empty('Nothing due this week.')}</div>
 </div>`;
};

S.schedule=async()=>{
 const start=state.weekStart||T(),days=[...Array(14)].map((_,i)=>A.addDays(start,i)),R=rentals(),list=cars();
 const blocks=list.flatMap(v=>(v.availabilityBlocks||[]).filter(b=>b.source!=='phone').map(b=>({...b,vehicle:v.id})));
 const bar=(item,cls,label,title)=>{const s=item.from<days[0]?days[0]:item.from,e=item.to>A.addDays(days[13],1)?A.addDays(days[13],1):item.to;const c0=days.indexOf(s),len=Math.max(1,Math.round((new Date(e)-new Date(s))/864e5));if(c0<0||e<=days[0])return '';return `<div class="sch-bar ${cls}" style="grid-column:${c0+1}/span ${Math.min(len,14-c0)}" title="${esc(title)}" ${item.ref?`data-ref="${esc(item.ref)}"`:''}>${esc(label)}</div>`;};
 return head('Schedule','Your whole fleet over the next two weeks.',`<button class="btn btn-ghost btn-sm" data-week="-7">${icon('arrowL')}Earlier</button><button class="btn btn-ghost btn-sm" data-week="0">Today</button><button class="btn btn-ghost btn-sm" data-week="7">Later <span class="flip">${icon('arrowL')}</span></button><button class="btn btn-primary" data-new-phone>${icon('plus')}Phone booking</button>`)+
 `<div class="sch-legend small"><span><i class="sch-request"></i>Request</span><span><i class="sch-confirmed"></i>Confirmed</span><span><i class="sch-onrent"></i>On rent</span><span><i class="sch-completed"></i>Returned</span><span><i class="sch-phone"></i>Phone booking</span><span><i class="sch-block"></i>Blocked</span></div>
 <div class="sch-wrap"><div class="sch-grid" style="--days:14"><div class="sch-corner">Car</div>${days.map(x=>`<div class="sch-day${x===T()?' is-today':''}${[0,6].includes(new Date(x+'T12:00').getDay())?' is-weekend':''}"><b>${A.parseDay(x)}</b><span>${new Date(x+'T12:00').toLocaleDateString('en-GB',{weekday:'short'})}</span></div>`).join('')}
 ${list.map(v=>`<div class="sch-car"><b>${esc(v.name)}</b><span class="small muted">${v.available?'Showing':'Hidden'}</span></div><div class="sch-row" style="grid-column:2/-1;grid-template-columns:repeat(14,1fr)">${days.map(()=>'<span></span>').join('')}${R.filter(r=>r.vehicle===v.id&&r.to>days[0]&&r.from<=days[13]).map(r=>bar(r,r.web?'sch-'+r.status:'sch-phone',r.name,`${r.name}: ${d(r.from)} – ${d(r.to)}`)).join('')}${blocks.filter(b=>b.vehicle===v.id).map(b=>bar(b,'sch-block',b.reason||'Blocked',b.reason||'Blocked')).join('')}</div>`).join('')||`<div style="grid-column:1/-1">${empty('Add your cars to see them here.','<a class="btn btn-primary btn-sm" href="dashboard-vehicles.html#new">Add a vehicle</a>')}</div>`}</div></div>
 <p class="small muted">Tap a booking to open it. To block dates for maintenance or personal use, use <a href="dashboard-vehicles.html">Vehicles → Calendar</a>.</p>`;
};

S.handovers=async()=>{
 const t=T(),R=rentals();
 const upcoming=R.filter(r=>(r.status==='confirmed'&&r.from<=A.addDays(t,14))||r.status==='onrent').sort((a,b)=>(a.status==='onrent'?a.to:a.from).localeCompare(b.status==='onrent'?b.to:b.from));
 return head('Pick-ups & returns','Use the checklist at every handover: it records mileage, fuel and damage, and updates the booking.')+notReady()+
 `<div class="card"><h3 style="margin-top:0">Coming up</h3><div class="table-wrap"><table class="t"><thead><tr><th>Car</th><th>Customer</th><th>Next step</th><th>Date</th><th></th></tr></thead><tbody>${upcoming.map(r=>{const kind=r.status==='onrent'?'return':'pickup',date=kind==='return'?r.to:r.from;return `<tr data-ref="${esc(r.ref)}"><td><b>${esc(carName(r.vehicle))}</b>${r.web?'':' <span class="badge">Phone</span>'}</td><td>${esc(r.name)}<div class="small muted">${esc(r.contact)}</div></td><td>${kind==='return'?'Return':'Pick-up'}${r.pickup?`<div class="small muted">${esc(r.pickup)}</div>`:''}</td><td>${d(date)}${date<t?' <span class="st st-no">Late</span>':date===t?' <span class="st st-req">Today</span>':''}</td><td><button class="btn ${kind==='return'?'btn-ghost':'btn-primary'} btn-sm" data-handover="${kind}">${kind==='return'?'Check in return':'Start pick-up'}</button></td></tr>`;}).join('')||`<tr><td colspan="5">${empty('No pick-ups or returns in the next two weeks.')}</td></tr>`}</tbody></table></div></div>
 <div class="card" style="margin-top:22px"><h3 style="margin-top:0">Handover records</h3><div class="table-wrap"><table class="t"><thead><tr><th>When</th><th>Type</th><th>Car</th><th>Mileage</th><th>Fuel</th><th>Damage / notes</th><th></th></tr></thead><tbody>${handovers.map(h=>`<tr data-hid="${esc(h.id)}"><td class="small">${new Date(h.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td>${h.kind==='pickup'?'<span class="st st-on">Pick-up</span>':'<span class="st st-done">Return</span>'}</td><td>${esc(carName(h.vehicle_id))}</td><td>${h.odometer!=null?Number(h.odometer).toLocaleString('en-US')+' km':'—'}</td><td>${esc(h.fuel||'—')}</td><td class="small">${esc(h.damage||h.notes||'—')}${Number(h.extra_charges)?`<div><b>Extra charges: ${A.moneyHTML(h.extra_charges)}</b></div>`:''}</td><td><button class="btn btn-ghost btn-sm" data-print-handover>Print</button></td></tr>`).join('')||`<tr><td colspan="7">${empty('Completed checklists appear here.')}</td></tr>`}</tbody></table></div></div>`;
};

const CHECK={pickup:[['licence','Driving licence checked and valid'],['id','Photo ID matches the booking'],['permit','Visitor driving permit (if needed)'],['agreement','Rental agreement signed'],['deposit','Deposit / payment collected'],['walkaround','Walk-around done with the renter'],['photos','Photos taken of all sides'],['keys','Keys handed over']],return:[['keys','Keys returned'],['walkaround','Walk-around done with the renter'],['photos','Photos taken of all sides'],['clean','Car is clean inside'],['belongings','Checked for belongings left behind'],['deposit','Deposit released or charges agreed']]};
const FUEL=['Full','3/4','1/2','1/4','Empty'];
function handoverForm(ref,kind){
 const r=rentals().find(x=>x.ref===ref);if(!r)return;
 if(!tablesReady){return run(null,async()=>{await Live.changeBooking(ref,kind==='pickup'?'onrent':'completed');},kind==='pickup'?'Marked as picked up':'Marked as returned');}
 const prev=handover(ref,'pickup');
 const {m,close}=modal('handover-form',`${kind==='pickup'?'Pick-up':'Return'}: ${carName(r.vehicle)}`,`<form class="stack" id="ho-form"><div class="ho-summary"><div><span class="small muted">Customer</span><b>${esc(r.name)}</b><span class="small">${esc(r.contact)}</span></div><div><span class="small muted">Dates</span><b>${d(r.from)} – ${d(r.to)}</b><span class="small">${esc(r.pickup||'')}</span></div>${prev&&kind==='return'?`<div><span class="small muted">At pick-up</span><b>${prev.odometer!=null?Number(prev.odometer).toLocaleString('en-US')+' km':'—'} · ${esc(prev.fuel||'—')}</b></div>`:''}</div>
 <fieldset class="ho-checks"><legend class="f">Checklist</legend>${CHECK[kind].map(([k,t])=>`<label class="check"><input type="checkbox" name="c_${k}"><span>${esc(t)}</span></label>`).join('')}</fieldset>
 <div class="form-grid"><label class="f">Mileage (km)<input class="input" type="number" name="odometer" min="0" max="2000000" inputmode="numeric" ${prev&&kind==='return'?`min="${prev.odometer||0}"`:''}></label><label class="f">Fuel level<select class="input" name="fuel">${FUEL.map(f=>`<option>${f}</option>`).join('')}</select></label></div>
 <label class="f">${kind==='pickup'?'Existing damage noted':'New damage found'}<textarea class="input" name="damage" rows="2" maxlength="3000" placeholder="${kind==='pickup'?'e.g. small scratch on rear bumper':'Leave empty if none'}"></textarea></label>
 ${kind==='return'?`<label class="f">Extra charges (BBD)<span class="hint">Fuel, late return, cleaning or damage agreed with the renter</span><input class="input" type="number" name="extra_charges" min="0" step="0.01" value="0"></label>`:''}
 <div class="form-grid"><label class="f">Notes<input class="input" name="notes" maxlength="3000"></label><label class="f">Staff member<input class="input" name="staff" maxlength="80" value="${esc((Live.user.name||'').split(' ')[0])}"></label></div>
 <p class="form-msg" id="ho-msg" role="alert"></p><div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit" id="ho-save">${kind==='pickup'?'Complete pick-up':'Complete return'}</button></div></form>`,true);
 m.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,msg=m.querySelector('#ho-msg'),v=Object.fromEntries(new FormData(f));
  const unchecked=CHECK[kind].filter(([k])=>!f.elements['c_'+k].checked);
  if(unchecked.length&&!f.dataset.confirmed){msg.textContent=`${unchecked.length} checklist item${unchecked.length===1?' is':'s are'} not ticked. Press the button again to continue anyway.`;f.dataset.confirmed='1';return;}
  if(v.odometer&&prev&&kind==='return'&&Number(v.odometer)<Number(prev.odometer||0)){msg.textContent='The return mileage is lower than at pick-up. Check the number.';return;}
  const b=m.querySelector('#ho-save');b.disabled=true;b.classList.add('is-loading');
  try{
   await val(client.from('drivebim_handovers').insert({company_id:CO,booking_id:r.web?r.ref:null,ref:r.web?null:r.ref,vehicle_id:r.vehicle,kind,odometer:v.odometer===''?null:Number(v.odometer),fuel:v.fuel,checklist:Object.fromEntries(CHECK[kind].map(([k])=>[k,!!f.elements['c_'+k].checked])),damage:(v.damage||'').trim()||null,extra_charges:Number(v.extra_charges)||0,notes:(v.notes||'').trim()||null,staff:(v.staff||'').trim()||null}).select().single());
   if(r.web&&((kind==='pickup'&&r.status==='confirmed')||(kind==='return'&&r.status==='onrent')))await Live.changeBooking(r.ref,kind==='pickup'?'onrent':'completed');
   close();A.toast(kind==='pickup'?'Pick-up complete. Enjoy the drive!':'Return complete');await load();draw();
  }catch(err){msg.textContent=/duplicate|23505/.test(String(err?.code)+err?.message)?`A ${kind} has already been recorded for this booking.`:Live.error(err);}finally{b.disabled=false;b.classList.remove('is-loading');}
 });
}
function printHandover(h){
 const c=A.company(CO),w=window.open('','_blank','width=800,height=900');if(!w){A.toast('Allow pop-ups to print');return;}
 const rows=Object.entries(h.checklist||{}).map(([k,v])=>`<tr><td>${esc((CHECK[h.kind].find(x=>x[0]===k)||[k,k])[1])}</td><td>${v?'Yes':'No'}</td></tr>`).join('');
 w.document.write(`<!DOCTYPE html><html><head><title>${h.kind==='pickup'?'Pick-up':'Return'} record</title><style>body{font:14px/1.6 system-ui,sans-serif;color:#202127;padding:32px;max-width:720px;margin:auto}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin:14px 0}td{border-bottom:1px solid #eee;padding:8px 4px}.sig{margin-top:48px;display:flex;gap:40px}.sig div{flex:1;border-top:1px solid #999;padding-top:6px;font-size:12px;color:#666}</style></head><body><h1>${esc(c.name)}</h1><p>${h.kind==='pickup'?'Vehicle pick-up':'Vehicle return'} record · ${esc(new Date(h.at).toLocaleString('en-GB'))}</p><table><tr><td>Car</td><td><b>${esc(carName(h.vehicle_id))}</b></td></tr><tr><td>Mileage</td><td>${h.odometer!=null?esc(h.odometer)+' km':'—'}</td></tr><tr><td>Fuel</td><td>${esc(h.fuel||'—')}</td></tr><tr><td>Damage</td><td>${esc(h.damage||'None noted')}</td></tr>${Number(h.extra_charges)?`<tr><td>Extra charges</td><td>BBD $${esc(h.extra_charges)}</td></tr>`:''}<tr><td>Notes</td><td>${esc(h.notes||'—')}</td></tr><tr><td>Staff</td><td>${esc(h.staff||'—')}</td></tr></table><h3>Checklist</h3><table>${rows}</table><div class="sig"><div>Renter signature</div><div>Company signature</div></div><script>onload=()=>print()<\/script></body></html>`);w.document.close();
}

S.calls=async()=>{
 const f=state.cf||'all',t=T(),list=calls.filter(c=>f==='all'||(f==='follow'?!c.done&&c.follow_up:f==='booked'?c.outcome==='booked':true));
 const OUT={answered:'Answered',no_answer:'No answer',voicemail:'Left voicemail',booked:'Booked',callback:'Call back',not_interested:'Not interested'};
 return head('Calls','Log phone and WhatsApp calls, set callback reminders and turn calls into bookings.',`<button class="btn btn-ghost" data-export-calls>${icon('doc')}Export</button><button class="btn btn-primary" data-new-call>${icon('plus')}Log a call</button>`)+notReady()+
 `<div class="tabs" style="margin-bottom:16px">${[['all','All calls'],['follow','Callbacks'],['booked','Booked']].map(([k,tt])=>`<button class="${f===k?'on':''}" data-state="cf" data-val="${k}">${tt}<span class="count">${k==='all'?calls.length:k==='follow'?calls.filter(c=>!c.done&&c.follow_up).length:calls.filter(c=>c.outcome==='booked').length}</span></button>`).join('')}</div>
 <div class="table-wrap"><table class="t"><thead><tr><th>When</th><th>Caller</th><th>About</th><th>Outcome</th><th>Callback</th><th></th></tr></thead><tbody>${list.map(c=>`<tr data-call="${esc(c.id)}"><td class="small">${new Date(c.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}<div class="muted">${c.direction==='out'?'Outgoing':'Incoming'}</div></td><td><b>${esc(c.name||'Unknown')}</b><div class="small muted">${esc(c.phone||'')}</div></td><td class="small">${esc(c.topic||'')}${c.notes?`<div class="muted">${esc(c.notes.slice(0,120))}</div>`:''}</td><td><span class="st ${c.outcome==='booked'?'st-ok':c.outcome==='callback'?'st-req':'st-done'}">${esc(OUT[c.outcome]||c.outcome)}</span></td><td class="small">${c.follow_up?(c.done?'<span class="muted">Done</span>':`${d(c.follow_up)}${c.follow_up<t?' <b style="color:#B4183C">overdue</b>':''}`):'—'}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end">${phoneLink(c.phone)}${c.follow_up&&!c.done?`<button class="btn btn-ghost btn-sm" data-call-done>Done</button>`:''}<button class="btn btn-ghost btn-sm" data-call-edit>Edit</button></div></td></tr>`).join('')||`<tr><td colspan="6">${empty('No calls logged yet.','<button class="btn btn-primary btn-sm" data-new-call>Log your first call</button>')}</td></tr>`}</tbody></table></div>`;
};
function callForm(c){
 if(!tablesReady){A.toast('The call log is still being switched on. Please try again soon.');return;}
 const x=c||{direction:'in',outcome:'answered',at:new Date().toISOString()};
 const {m,close}=modal('call-form',c?'Edit call':'Log a call',`<form class="form-grid" id="cl-form"><label class="f">Direction<select class="input" name="direction"><option value="in" ${x.direction==='in'?'selected':''}>Incoming</option><option value="out" ${x.direction==='out'?'selected':''}>Outgoing</option></select></label><label class="f">Outcome<select class="input" name="outcome">${[['answered','Answered'],['booked','Booked'],['callback','Call back'],['no_answer','No answer'],['voicemail','Left voicemail'],['not_interested','Not interested']].map(([k,t])=>`<option value="${k}" ${x.outcome===k?'selected':''}>${t}</option>`).join('')}</select></label><label class="f">Name<input class="input" name="name" maxlength="120" value="${esc(x.name||'')}"></label><label class="f">Phone / WhatsApp<input class="input" name="phone" type="tel" maxlength="40" value="${esc(x.phone||'')}" placeholder="+1 (246)"></label><label class="f full">What was it about?<input class="input" name="topic" maxlength="120" value="${esc(x.topic||'')}" placeholder="e.g. SUV for 5 days from 12 Dec"></label><label class="f full">Notes<textarea class="input" name="notes" rows="3" maxlength="3000">${esc(x.notes||'')}</textarea></label><label class="f">Call back on<input class="input" type="date" name="follow_up" value="${esc(x.follow_up||'')}"></label><div class="f" style="justify-content:end"><label class="check"><input type="checkbox" name="make_booking"><span>Add a phone booking after saving</span></label></div><p class="form-msg full" id="cl-msg" role="alert"></p><div class="full row" style="justify-content:flex-end">${c?`<button type="button" class="btn btn-danger" data-call-del>Delete</button>`:''}<button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit">Save call</button></div></form>`);
 const form=m.querySelector('form');
 form.elements.outcome.addEventListener('change',e=>{if(e.target.value==='callback'&&!form.elements.follow_up.value)form.elements.follow_up.value=A.addDays(T(),1);if(e.target.value==='booked')form.elements.make_booking.checked=true;});
 m.querySelector('[data-call-del]')?.addEventListener('click',()=>run(null,async()=>{await val(client.from('drivebim_calls').delete().eq('id',c.id));close();},'Call deleted'));
 form.addEventListener('submit',async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form));const row={company_id:CO,direction:v.direction,outcome:v.outcome,name:v.name.trim()||null,phone:v.phone.trim()||null,topic:v.topic.trim()||null,notes:v.notes.trim()||null,follow_up:v.follow_up||null,done:c?.done&&v.follow_up===c.follow_up?true:false};
  try{if(c)await val(client.from('drivebim_calls').update(row).eq('id',c.id).select().single());else await val(client.from('drivebim_calls').insert(row).select().single());close();A.toast('Call saved');await load();draw();if(form.elements.make_booking.checked)phoneBookingForm({name:row.name,phone:row.phone,notes:row.topic});}
  catch(err){m.querySelector('#cl-msg').textContent=Live.error(err);}});
}
function phoneBookingForm(pre){
 const list=cars();if(!list.length){A.toast('Add a vehicle first');return;}
 const {m,close}=modal('phone-form','Phone or walk-in booking',`<p class="small muted" style="margin-top:0">For bookings made by phone, WhatsApp or in person. The car's dates are blocked on the website so nobody else can book them.</p><form class="form-grid" id="pb-form"><label class="f full">Car<select class="input" name="vehicle">${list.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('')}</select></label><label class="f">Pick-up date<input class="input" type="date" name="from" required min="${T()}" value="${A.addDays(T(),1)}"></label><label class="f">Return date<input class="input" type="date" name="to" required value="${A.addDays(T(),4)}"></label><label class="f">Customer name<input class="input" name="name" required maxlength="120" value="${esc(pre?.name||'')}"></label><label class="f">Phone / email<input class="input" name="phone" maxlength="120" value="${esc(pre?.phone||'')}"></label><label class="f">Pick-up place<select class="input" name="pickup">${DB.pickups.map(p=>`<option>${esc(p)}</option>`).join('')}</select></label><label class="f">Agreed total (BBD)<input class="input" type="number" name="total" min="0" step="0.01"></label><label class="f full">Notes<input class="input" name="notes" maxlength="500" value="${esc(pre?.notes||'')}"></label><p class="form-msg full" id="pb-msg" role="alert"></p><div class="full row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit">Save booking</button></div></form>`);
 const form=m.querySelector('form');
 form.addEventListener('submit',async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form)),msg=m.querySelector('#pb-msg');
  if(!A.dateRangeValid(v.from,v.to)){msg.textContent='Choose a return date after the pick-up date, from today onwards.';return;}
  const car=A.vehicle(v.vehicle);if(A.availabilityRanges(car).some(r=>v.from<r.to&&v.to>r.from)){msg.textContent=`${car.name} is already booked or blocked for some of those dates.`;return;}
  const block={id:'PB-'+crypto.randomUUID().slice(0,8),from:v.from,to:v.to,reason:'Phone booking: '+v.name.trim(),source:'phone',customer:{name:v.name.trim(),phone:v.phone.trim()},pickup:v.pickup,total:Number(v.total)||0,notes:v.notes.trim()};
  try{await A.saveVehicles(A.vehicles().map(c=>c.id===car.id?{...c,availabilityBlocks:[...(c.availabilityBlocks||[]),block]}:c));close();A.toast(`Booked ${car.name} for ${block.customer.name}`);draw();}catch(err){msg.textContent=Live.error(err);}});
}

S.customers=async()=>{
 const R=rentals(),map=new Map();
 R.forEach(r=>{const key=(r.renterId||String(r.contact||r.name).toLowerCase()).slice(0,120);const c=map.get(key)||{key,name:r.name,contact:r.contact,trips:0,spent:0,last:'',web:r.web,refs:[]};c.trips++;if(['confirmed','onrent','completed'].includes(r.status))c.spent+=r.total;if(r.from>c.last)c.last=r.from;c.refs.push(r.ref);map.set(key,c);});
 const q=(state.q||'').toLowerCase(),tag=state.tag||'all';
 const list=[...map.values()].map(c=>({...c,note:notes.find(n=>n.customer_key===c.key)})).filter(c=>(!q||`${c.name} ${c.contact}`.toLowerCase().includes(q))&&(tag==='all'||c.note?.tag===tag)).sort((a,b)=>b.last.localeCompare(a.last));
 const TAG={vip:['VIP','badge-gold'],repeat:['Repeat','badge-reef'],caution:['Caution','badge-hib']};
 return head('Customers','Everyone who has booked with you. Add private notes and tags only your team can see.',`<button class="btn btn-ghost" data-export-customers>${icon('doc')}Export</button>`)+notReady()+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['all','All'],['vip','VIP'],['repeat','Repeat'],['caution','Caution']].map(([k,t])=>`<button class="${tag===k?'on':''}" data-state="tag" data-val="${k}">${t}</button>`).join('')}</div><input class="input" data-search placeholder="Search customers" value="${esc(state.q||'')}" style="max-width:260px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Customer</th><th>Trips</th><th>Spent</th><th>Last rental</th><th>Notes</th><th></th></tr></thead><tbody>${list.map(c=>`<tr data-cust="${esc(c.key)}"><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="co-avatar">${esc(A.initials(c.name))}</span><div><b>${esc(c.name)}</b> ${c.note?.tag&&TAG[c.note.tag]?`<span class="badge ${TAG[c.note.tag][1]}">${TAG[c.note.tag][0]}</span>`:''}<div class="small muted">${esc(c.contact)}${c.web?'':' · phone booking'}</div></div></div></td><td>${c.trips}</td><td>${A.moneyHTML(c.spent)}</td><td class="small">${d(c.last)}</td><td class="small" style="max-width:240px">${esc(c.note?.note||'')}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end">${contactLinks(c.contact)}${c.web?`<button class="btn btn-ghost btn-sm" data-cust-chat="${esc(c.refs[0])}">Message</button>`:''}<button class="btn btn-ghost btn-sm" data-cust-note>Note</button></div></td></tr>`).join('')||`<tr><td colspan="6">${empty('Customers appear here after their first booking.')}</td></tr>`}</tbody></table></div>`;
};
function noteForm(key,name){
 if(!tablesReady){A.toast('Customer notes are still being switched on.');return;}
 const n=notes.find(x=>x.customer_key===key)||{};
 const {m,close}=modal('note-form',`Notes: ${name}`,`<form class="stack" id="nt-form"><label class="f">Tag<select class="input" name="tag"><option value="">None</option><option value="vip" ${n.tag==='vip'?'selected':''}>VIP</option><option value="repeat" ${n.tag==='repeat'?'selected':''}>Repeat customer</option><option value="caution" ${n.tag==='caution'?'selected':''}>Caution</option></select></label><label class="f">Private note<span class="hint">Only your company sees this. Keep it factual.</span><textarea class="input" name="note" rows="4" maxlength="2000">${esc(n.note||'')}</textarea></label><div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit">Save note</button></div></form>`);
 m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));run(null,async()=>{await val(client.from('drivebim_customer_notes').upsert({company_id:CO,customer_key:key,tag:v.tag||null,note:v.note.trim()||null,updated_at:new Date().toISOString()}));close();},'Note saved');});
}

S.maintenance=async()=>{
 const t=T(),open=maint.filter(m=>!m.done_at),done=maint.filter(m=>m.done_at).sort((a,b)=>String(b.done_at).localeCompare(String(a.done_at)));
 const spent=done.filter(m=>String(m.done_at).slice(0,4)===t.slice(0,4)).reduce((n,m)=>n+(Number(m.cost)||0),0);
 const KIND={service:'Service',tyres:'Tyres',inspection:'Inspection',insurance:'Insurance renewal',licence:'Road licence renewal',repair:'Repair',other:'Other'};
 return head('Maintenance','Services, inspections and renewals for every car, with reminders.',`<button class="btn btn-primary" data-new-maint>${icon('plus')}Add reminder</button>`)+notReady()+
 `<div class="kpis" style="margin-bottom:22px"><div class="kpi feature"><div class="k-label">Overdue</div><div class="k-num">${open.filter(m=>m.due&&m.due<t).length}</div><div class="k-delta">Needs attention</div></div><div class="kpi"><div class="k-label">Due in 30 days</div><div class="k-num">${open.filter(m=>m.due&&m.due>=t&&m.due<=A.addDays(t,30)).length}</div><div class="k-delta">Plan ahead</div></div><div class="kpi"><div class="k-label">Spent this year</div><div class="k-num">${A.money(spent)}</div><div class="k-delta">From completed jobs</div></div><div class="kpi"><div class="k-label">Cars</div><div class="k-num">${cars().length}</div><div class="k-delta">In your fleet</div></div></div>
 <div class="card"><h3 style="margin-top:0">To do</h3><div class="table-wrap"><table class="t"><thead><tr><th>Car</th><th>Job</th><th>Due</th><th>Notes</th><th></th></tr></thead><tbody>${open.sort((a,b)=>String(a.due||'9').localeCompare(String(b.due||'9'))).map(m=>`<tr data-maint="${esc(m.id)}"><td><b>${esc(carName(m.vehicle_id))}</b></td><td>${esc(m.title)}<div class="small muted">${esc(KIND[m.kind]||m.kind)}</div></td><td>${m.due?d(m.due):'—'}${m.due&&m.due<t?' <span class="st st-no">Overdue</span>':m.due&&m.due<=A.addDays(t,7)?' <span class="st st-req">Soon</span>':''}</td><td class="small">${esc(m.notes||'')}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end"><button class="btn btn-primary btn-sm" data-maint-done>Mark done</button><button class="btn btn-ghost btn-sm" data-maint-edit>Edit</button></div></td></tr>`).join('')||`<tr><td colspan="5">${empty('No reminders yet. Add services, inspections and insurance renewals so nothing is missed.')}</td></tr>`}</tbody></table></div></div>
 <div class="card" style="margin-top:22px"><h3 style="margin-top:0">History</h3><div class="table-wrap"><table class="t"><thead><tr><th>Done</th><th>Car</th><th>Job</th><th>Cost</th></tr></thead><tbody>${done.map(m=>`<tr><td class="small">${d(m.done_at)}</td><td>${esc(carName(m.vehicle_id))}</td><td>${esc(m.title)}</td><td>${m.cost!=null?A.moneyHTML(m.cost):'—'}</td></tr>`).join('')||`<tr><td colspan="4">${empty('Completed jobs appear here.')}</td></tr>`}</tbody></table></div></div>`;
};
function maintForm(mt){
 if(!tablesReady){A.toast('Maintenance reminders are still being switched on.');return;}
 const list=cars();if(!list.length){A.toast('Add a vehicle first');return;}
 const x=mt||{kind:'service',due:A.addDays(T(),30),vehicle_id:list[0].id};
 const {m,close}=modal('maint-form',mt?'Edit reminder':'Add maintenance reminder',`<form class="form-grid" id="mt-form"><label class="f">Car<select class="input" name="vehicle_id">${list.map(v=>`<option value="${esc(v.id)}" ${v.id===x.vehicle_id?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label><label class="f">Type<select class="input" name="kind">${[['service','Service'],['tyres','Tyres'],['inspection','Inspection'],['insurance','Insurance renewal'],['licence','Road licence renewal'],['repair','Repair'],['other','Other']].map(([k,t])=>`<option value="${k}" ${x.kind===k?'selected':''}>${t}</option>`).join('')}</select></label><label class="f full">Job<input class="input" name="title" required maxlength="120" value="${esc(x.title||'')}" placeholder="e.g. 10,000 km service"></label><label class="f">Due<input class="input" type="date" name="due" value="${esc(x.due||'')}"></label><label class="f">Notes<input class="input" name="notes" maxlength="2000" value="${esc(x.notes||'')}"></label><div class="full row" style="justify-content:flex-end">${mt?`<button type="button" class="btn btn-danger" data-mt-del>Delete</button>`:''}<button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit">Save</button></div></form>`);
 m.querySelector('[data-mt-del]')?.addEventListener('click',()=>run(null,async()=>{await val(client.from('drivebim_maintenance').delete().eq('id',mt.id));close();},'Reminder deleted'));
 m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));if(!v.title.trim()){A.toast('Describe the job');return;}const row={company_id:CO,vehicle_id:v.vehicle_id,kind:v.kind,title:v.title.trim(),due:v.due||null,notes:v.notes.trim()||null};run(null,async()=>{if(mt)await val(client.from('drivebim_maintenance').update(row).eq('id',mt.id).select().single());else await val(client.from('drivebim_maintenance').insert(row).select().single());close();},'Reminder saved');});
}
function maintDone(id){
 const mt=maint.find(x=>x.id===id);if(!mt)return;
 const {m,close}=modal('maint-done',`Done: ${mt.title}`,`<form class="form-grid" id="md-form"><label class="f">Completed on<input class="input" type="date" name="done_at" value="${T()}" max="${T()}"></label><label class="f">Cost (BBD)<input class="input" type="number" name="cost" min="0" step="0.01"></label><label class="f full">Schedule the next one<select class="input" name="next"><option value="">Don't repeat</option><option value="90">In 3 months</option><option value="182">In 6 months</option><option value="365">In 1 year</option></select></label><div class="full row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" type="submit">Save</button></div></form>`);
 m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));run(null,async()=>{await val(client.from('drivebim_maintenance').update({done_at:v.done_at||T(),cost:v.cost===''?null:Number(v.cost)}).eq('id',id).select().single());if(v.next)await val(client.from('drivebim_maintenance').insert({company_id:CO,vehicle_id:mt.vehicle_id,kind:mt.kind,title:mt.title,due:A.addDays(v.done_at||T(),Number(v.next)),notes:mt.notes}).select().single());close();},'Marked as done');});
}

S.reports=async()=>{
 const R=rentals().filter(r=>['confirmed','onrent','completed'].includes(r.status)),months=[...Array(6)].map((_,i)=>{const x=new Date();x.setDate(1);x.setMonth(x.getMonth()-5+i);return x.toISOString().slice(0,7);});
 const rev=months.map(mo=>R.filter(r=>r.from.slice(0,7)===mo).reduce((n,r)=>n+r.total,0)),mx=Math.max(1,...rev);
 const days=30,start=A.addDays(T(),-days+1),list=cars();
 const util=list.map(v=>{let booked=0;for(let i=0;i<days;i++){const x=A.addDays(start,i);if(R.some(r=>r.vehicle===v.id&&r.from<=x&&r.to>x))booked++;}return {v,pct:Math.round(booked/days*100),trips:R.filter(r=>r.vehicle===v.id).length,revenue:R.filter(r=>r.vehicle===v.id).reduce((n,r)=>n+r.total,0)};}).sort((a,b)=>b.pct-a.pct);
 const extra=handovers.reduce((n,h)=>n+(Number(h.extra_charges)||0),0),cost=maint.filter(m=>m.done_at).reduce((n,m)=>n+(Number(m.cost)||0),0);
 return head('Reports','How your business is doing. Website and phone bookings are both included.',`<button class="btn btn-ghost" data-export-rentals>${icon('doc')}Export rentals</button>`)+
 `<div class="kpis"><div class="kpi feature"><div class="k-label">Booked this month</div><div class="k-num">${A.money(rev.at(-1))}</div><div class="k-delta">${R.filter(r=>r.from.slice(0,7)===months.at(-1)).length} rentals</div></div><div class="kpi"><div class="k-label">Last 6 months</div><div class="k-num">${A.money(rev.reduce((a,b)=>a+b,0))}</div><div class="k-delta">Booked value</div></div><div class="kpi"><div class="k-label">Extra charges collected</div><div class="k-num">${A.money(extra)}</div><div class="k-delta">From returns</div></div><div class="kpi"><div class="k-label">Maintenance spend</div><div class="k-num">${A.money(cost)}</div><div class="k-delta">All time</div></div></div>
 <div class="grid g2" style="margin-top:22px"><div class="card"><h3 style="margin-top:0">Booked value by month</h3><div class="bars">${rev.map((v,i)=>`<div class="${v?'hi':'zero'}" data-v="${A.money(v)} · ${months[i]}" style="height:${v?Math.max(8,v/mx*100):4}%"></div>`).join('')}</div><div class="bar-labels">${months.map(mo=>`<span>${new Date(mo+'-01T12:00').toLocaleDateString('en-GB',{month:'short'})}</span>`).join('')}</div></div>
 <div class="card"><h3 style="margin-top:0">How busy each car is (last 30 days)</h3>${util.map(u=>`<div class="util-row"><div class="row between small"><b>${esc(u.v.name)}</b><span>${u.pct}% · ${u.trips} rental${u.trips===1?'':'s'} · ${A.money(u.revenue)}</span></div><div class="progress"><i style="width:${u.pct}%"></i></div></div>`).join('')||empty('Add cars to see this.')}</div></div>`;
};

/* ---------- rendering & events ---------- */
const state={};let current='today';
const SECTIONS=['today','schedule','handovers','calls','customers','maintenance','reports'];
async function draw(){
 const k=SECTIONS.includes(location.hash.slice(1))?location.hash.slice(1):'today';
 if(k!==current){current=k;Object.keys(state).forEach(x=>delete state[x]);}
 root.innerHTML=await S[k]();
 document.querySelectorAll('#dash-side a, .side a').forEach(a=>{const h=a.getAttribute('href')||'';if(h.startsWith('dashboard-operations.html'))a.toggleAttribute('aria-current',h.endsWith('#'+k)||(k==='today'&&h==='dashboard-operations.html'));if(a.hasAttribute('aria-current'))a.setAttribute('aria-current','page');});
 document.title=`${{today:'Today',schedule:'Schedule',handovers:'Pick-ups & returns',calls:'Calls',customers:'Customers',maintenance:'Maintenance',reports:'Reports'}[k]} | BimCar Connect`;
 const params=new URLSearchParams(location.search);if(params.get('handover')&&params.get('kind')){const ref=params.get('handover'),kind=params.get('kind');history.replaceState(null,'',location.pathname+location.hash);handoverForm(ref,kind);}
}
window.addEventListener('hashchange',draw);window.onHash=null;
let timer;root.addEventListener('input',e=>{if(e.target.matches('[data-search]')){state.q=e.target.value;clearTimeout(timer);timer=setTimeout(async()=>{const pos=e.target.selectionStart;await draw();const s=root.querySelector('[data-search]');s?.focus();s?.setSelectionRange(pos,pos);},200);}});
root.addEventListener('click',async e=>{
 const t=e.target;
 const st=t.closest('[data-state]');if(st){state[st.dataset.state]=st.dataset.val;draw();return;}
 const wk=t.closest('[data-week]');if(wk){state.weekStart=Number(wk.dataset.week)?A.addDays(state.weekStart||T(),Number(wk.dataset.week)):T();draw();return;}
 if(t.closest('[data-new-call]'))return callForm(null);
 if(t.closest('[data-new-phone]'))return phoneBookingForm(null);
 if(t.closest('[data-new-maint]'))return maintForm(null);
 const ho=t.closest('[data-handover]');if(ho)return handoverForm(ho.closest('[data-ref]').dataset.ref,ho.dataset.handover);
 const bar=t.closest('.sch-bar[data-ref]');if(bar){const r=rentals().find(x=>x.ref===bar.dataset.ref);if(r?.web)return BookingChat.open(r.ref);if(r){A.toast(`${r.name} · ${r.contact||'no contact'} · ${d(r.from)} – ${d(r.to)}`);}return;}
 const call=t.closest('[data-call]');if(call){const c=calls.find(x=>x.id===call.dataset.call);if(t.closest('[data-call-done]'))return run(t.closest('button'),()=>val(client.from('drivebim_calls').update({done:true}).eq('id',c.id).select().single()),'Callback done');if(t.closest('[data-call-edit]'))return callForm(c);}
 const mt=t.closest('[data-maint]');if(mt){if(t.closest('[data-maint-done]'))return maintDone(mt.dataset.maint);if(t.closest('[data-maint-edit]'))return maintForm(maint.find(x=>x.id===mt.dataset.maint));}
 const hp=t.closest('[data-print-handover]');if(hp)return printHandover(handovers.find(h=>h.id===hp.closest('[data-hid]').dataset.hid));
 const cu=t.closest('[data-cust]');if(cu){if(t.closest('[data-cust-note]'))return noteForm(cu.dataset.cust,cu.querySelector('b').textContent);const ch=t.closest('[data-cust-chat]');if(ch)return BookingChat.open(ch.dataset.custChat);}
 if(t.closest('[data-export-calls]'))return csv('calls',calls.map(c=>({when:c.at,direction:c.direction,name:c.name,phone:c.phone,about:c.topic,outcome:c.outcome,callback:c.follow_up,done:c.done,notes:c.notes})));
 if(t.closest('[data-export-customers]')){const R=rentals(),m=new Map();R.forEach(r=>{const k=r.renterId||r.contact||r.name;const c=m.get(k)||{name:r.name,contact:r.contact,trips:0,spent_bbd:0};c.trips++;if(['confirmed','onrent','completed'].includes(r.status))c.spent_bbd+=r.total;m.set(k,c);});return csv('customers',[...m.values()]);}
 if(t.closest('[data-export-rentals]'))return csv('rentals',rentals().map(r=>({ref:r.ref,source:r.web?'website':'phone',status:r.status,car:carName(r.vehicle),customer:r.name,contact:r.contact,from:r.from,to:r.to,pickup:r.pickup,total_bbd:r.total})));
});
window.addEventListener('drivebim:data',()=>{if(!document.querySelector('.modal.open'))draw();});
draw();
})();
