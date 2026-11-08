/* BimCar Connect admin console. Every action is checked again by the database, so only
   platform admins can use it. Sections: overview, accounts, companies, cars, bookings,
   deals & boosts, reviews, reports, insights, email templates, settings, activity. */
(async function(){
await Live.ready;
const A=App, esc=A.esc, icon=A.icon, root=document.getElementById('admin-app'), nav=document.getElementById('admin-nav');
if(Live.failed)return;
if(!Live.user||Live.user.role!=='admin'){location.replace(Live.user?(Live.user.company?'dashboard.html':'account.html'):'owner-access.html');return;}

const SUPABASE_PROJECT=(DriveBimConfig.url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)||[])[1]||'';
const SB=path=>`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/${path}`;
const NAV_GROUPS=[['',['overview']],['People',['accounts','companies','reviews']],['Marketplace',['cars','bookings','deals']],['Marketing',['ads','clients','invoices','posts']],['Support',['reports','emails']],['System',['insights','settings','activity']]];
const SECTIONS=[
 ['overview','Overview','home'],['accounts','Accounts','users'],['companies','Companies','shield'],['cars','Cars','car'],
 ['bookings','Bookings','cal'],['deals','Deals & boosts','bolt'],['ads','Ads','image'],['clients','Ad clients','users'],['invoices','Invoices','doc'],['posts','Blog posts','edit'],['reviews','Reviews','star'],['reports','Reports & enquiries','info'],
 ['insights','Insights & exports','chart'],['emails','Email templates','mail'],['settings','Site settings','settings'],['activity','Activity log','list']
];
const STATUS={request:['New request','st-req'],confirmed:['Confirmed','st-ok'],onrent:['On rent','st-on'],completed:['Returned','st-done'],declined:['Declined','st-no'],cancelled:['Cancelled','st-no']};
const TEMPLATE_DEFAULTS={
 company_approved:{label:'Company approved',subject:'{company} is now live on BimCar Connect',body:'Hi {name},\n\nGreat news: {company} has been approved and your cars can now be booked on BimCar Connect.\n\nKeep your calendar, prices and photos up to date from your dashboard: {site}dashboard.html\n\nWelcome aboard,\nThe BimCar Connect team'},
 request_documents:{label:'Ask for documents',subject:'BimCar Connect: verification documents for {company}',body:'Hi {name},\n\nThanks for listing {company} on BimCar Connect. Before we approve your company, please reply with:\n\n- A copy of your trading licence\n- Your current insurance certificate\n\nThank you,\nThe BimCar Connect team'},
 listing_removed:{label:'Listing taken down',subject:'Your BimCar Connect listing has been hidden',body:'Hi {name},\n\nWe have hidden one of your listings because it did not meet our rules (real, recent photos of the actual car and accurate details).\n\nPlease update it from your dashboard and reply to this email when it is ready to be reviewed again.\n\nThe BimCar Connect team'},
 account_suspended:{label:'Account suspended',subject:'Your BimCar Connect account has been suspended',body:'Hi {name},\n\nYour BimCar Connect account ({email}) has been suspended. If you think this is a mistake, reply to this email and we will look into it.\n\nThe BimCar Connect team'},
 account_deleted:{label:'Account deleted',subject:'Your BimCar Connect account has been deleted',body:'Hi {name},\n\nAs requested, your BimCar Connect account ({email}) and its data have been deleted.\n\nThank you for using BimCar Connect.\nThe BimCar Connect team'},
 general:{label:'General message',subject:'A message from BimCar Connect',body:'Hi {name},\n\n\n\nThe BimCar Connect team'}
};
const ACCOUNT_EMAILS={"confirm-signup": {"subject": "Confirm your BimCar Connect account", "html": "<div style=\"margin:0;padding:32px 12px;background:#F7F3FC;font-family:Poppins,Segoe UI,Helvetica,Arial,sans-serif;color:#202127\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E9E3EF\">\n    <tr><td style=\"height:6px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 35%,#8A3FFD 65%,#008EFF)\"></td></tr>\n    <tr><td style=\"padding:36px 36px 8px;text-align:center\">\n      <div style=\"font-size:26px;font-weight:800;letter-spacing:-.5px;color:#F4169B\">Bim<span style=\"color:#8A3FFD\">Car</span></div>\n      <div style=\"font-size:10px;letter-spacing:4px;color:#8A3FFD;font-weight:700\">CONNECT</div>\n    </td></tr>\n    <tr><td style=\"padding:20px 36px 8px;text-align:center\">\n      <h1 style=\"margin:0 0 12px;font-size:24px;line-height:1.3;color:#202127\">Welcome to BimCar Connect!</h1>\n      <p style=\"margin:0 0 26px;font-size:15px;line-height:1.7;color:#62636B\">Tap the button below to confirm your email address. You'll be signed in and ready to go.</p>\n      <a href=\"{{ .ConfirmationURL }}\" style=\"display:inline-block;padding:14px 30px;border-radius:12px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 40%,#8A3FFD);color:#ffffff;font-weight:700;font-size:15px;text-decoration:none\">Confirm my email</a>\n      <p style=\"margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A8B93\">This link works once and expires after 24 hours.</p>\n    </td></tr>\n    <tr><td style=\"padding:24px 36px 30px;text-align:center;font-size:11px;line-height:1.6;color:#9A9BA3;border-top:1px solid #F1ECF7\">\n      BimCar Connect &middot; Compare and book rental cars from local companies across Barbados.<br>If you didn't request this, you can ignore this email.\n    </td></tr>\n  </table>\n</div>"}, "reset-password": {"subject": "Reset your BimCar Connect password", "html": "<div style=\"margin:0;padding:32px 12px;background:#F7F3FC;font-family:Poppins,Segoe UI,Helvetica,Arial,sans-serif;color:#202127\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E9E3EF\">\n    <tr><td style=\"height:6px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 35%,#8A3FFD 65%,#008EFF)\"></td></tr>\n    <tr><td style=\"padding:36px 36px 8px;text-align:center\">\n      <div style=\"font-size:26px;font-weight:800;letter-spacing:-.5px;color:#F4169B\">Bim<span style=\"color:#8A3FFD\">Car</span></div>\n      <div style=\"font-size:10px;letter-spacing:4px;color:#8A3FFD;font-weight:700\">CONNECT</div>\n    </td></tr>\n    <tr><td style=\"padding:20px 36px 8px;text-align:center\">\n      <h1 style=\"margin:0 0 12px;font-size:24px;line-height:1.3;color:#202127\">Reset your password</h1>\n      <p style=\"margin:0 0 26px;font-size:15px;line-height:1.7;color:#62636B\">We received a request to reset the password for {{ .Email }}. Tap below to choose a new one.</p>\n      <a href=\"{{ .ConfirmationURL }}\" style=\"display:inline-block;padding:14px 30px;border-radius:12px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 40%,#8A3FFD);color:#ffffff;font-weight:700;font-size:15px;text-decoration:none\">Choose a new password</a>\n      <p style=\"margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A8B93\">This link works once and expires after 1 hour.</p>\n    </td></tr>\n    <tr><td style=\"padding:24px 36px 30px;text-align:center;font-size:11px;line-height:1.6;color:#9A9BA3;border-top:1px solid #F1ECF7\">\n      BimCar Connect &middot; Compare and book rental cars from local companies across Barbados.<br>If you didn't request this, you can ignore this email.\n    </td></tr>\n  </table>\n</div>"}, "change-email": {"subject": "Confirm your new BimCar Connect email", "html": "<div style=\"margin:0;padding:32px 12px;background:#F7F3FC;font-family:Poppins,Segoe UI,Helvetica,Arial,sans-serif;color:#202127\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E9E3EF\">\n    <tr><td style=\"height:6px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 35%,#8A3FFD 65%,#008EFF)\"></td></tr>\n    <tr><td style=\"padding:36px 36px 8px;text-align:center\">\n      <div style=\"font-size:26px;font-weight:800;letter-spacing:-.5px;color:#F4169B\">Bim<span style=\"color:#8A3FFD\">Car</span></div>\n      <div style=\"font-size:10px;letter-spacing:4px;color:#8A3FFD;font-weight:700\">CONNECT</div>\n    </td></tr>\n    <tr><td style=\"padding:20px 36px 8px;text-align:center\">\n      <h1 style=\"margin:0 0 12px;font-size:24px;line-height:1.3;color:#202127\">Confirm your new email</h1>\n      <p style=\"margin:0 0 26px;font-size:15px;line-height:1.7;color:#62636B\">Tap below to confirm {{ .NewEmail }} as the email for your BimCar Connect account.</p>\n      <a href=\"{{ .ConfirmationURL }}\" style=\"display:inline-block;padding:14px 30px;border-radius:12px;background-color:#F4169B;background:linear-gradient(115deg,#FF4F5E,#F4169B 40%,#8A3FFD);color:#ffffff;font-weight:700;font-size:15px;text-decoration:none\">Confirm new email</a>\n      <p style=\"margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A8B93\">If you didn't ask for this change, contact BimCar Connect.</p>\n    </td></tr>\n    <tr><td style=\"padding:24px 36px 30px;text-align:center;font-size:11px;line-height:1.6;color:#9A9BA3;border-top:1px solid #F1ECF7\">\n      BimCar Connect &middot; Compare and book rental cars from local companies across Barbados.<br>If you didn't request this, you can ignore this email.\n    </td></tr>\n  </table>\n</div>"}};
const site=location.origin+location.pathname.replace(/[^/]*$/,'');
let users=null,usersError=null,privateSettings={},activity=null;
const ready=()=>Live.adminReady;

/* ---------- helpers ---------- */
const d=(s,o)=>s?A.fmtDate(String(s).slice(0,10),o||{day:'numeric',month:'short',year:'numeric'}):'—';
const ago=s=>{if(!s)return 'Never';const m=Math.round((Date.now()-new Date(s))/6e4);return m<60?`${Math.max(1,m)} min ago`:m<1440?`${Math.round(m/60)} h ago`:`${Math.round(m/1440)} days ago`;};
const companyOf=id=>A.company(id);
const empty=(title,text)=>`<div class="empty"><h3>${esc(title)}</h3>${text?`<p class="muted" style="margin:0 auto">${esc(text)}</p>`:''}</div>`;
const notice=(html,kind)=>`<div class="notice ${kind||'info'}" style="margin-bottom:18px">${icon(kind==='warn'?'info':'shield')}<p>${html}</p></div>`;
const upgradeNotice=()=>ready()?'':notice(`<b>One step unlocks the rest of the admin tools.</b> Account deletion, suspensions, booking overrides, site settings, saved templates and the activity log need a one-time database upgrade. Open <a href="${SB('sql/new')}" target="_blank" rel="noopener">Supabase SQL Editor</a>, paste the file <code>backend/ADMIN-UPGRADE.sql</code> and press Run. Then refresh this page.`,'warn');
const head=(title,sub,actions)=>`<div class="dash-head"><div><h1>${esc(title)}</h1>${sub?`<p class="muted" style="margin:6px 0 0">${sub}</p>`:''}</div>${actions?`<div class="row">${actions}</div>`:''}</div>`;
const KPI_IC=[[/account/i,'users'],[/compan/i,'shield'],[/car/i,'car'],[/report/i,'info'],[/booking|request/i,'cal'],[/value|paid|payment|revenue/i,'cash'],[/conversion/i,'chart'],[/overdue/i,'bolt'],[/draft/i,'edit']];
const kpi=(label,value,sub,feature,href)=>`<${href?'a href="'+href+'"':'div'} class="kpi${feature?' feature':''}"><span class="k-ic" aria-hidden="true">${icon((KPI_IC.find(([r])=>r.test(label))||[0,'chart'])[1])}</span><div class="k-label">${esc(label)}</div><div class="k-num">${esc(value)}</div><div class="k-delta">${esc(sub||'')}</div></${href?'a':'div'}>`;
async function run(btn,fn,ok){if(btn){btn.disabled=true;btn.classList.add('is-loading');}try{await fn();if(ok)A.toast(ok);await draw();}catch(e){A.toast(Live.admin.missing(e)?'Run backend/ADMIN-UPGRADE.sql in Supabase to use this.':Live.error(e));}finally{if(btn&&btn.isConnected){btn.disabled=false;btn.classList.remove('is-loading');}}}
function csv(name,rows){if(!rows.length){A.toast('Nothing to export yet');return;}const cols=Object.keys(rows[0]);const q=v=>{v=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};const blob=new Blob(['﻿'+[cols.join(','),...rows.map(r=>cols.map(c=>q(r[c])).join(','))].join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bimcar-${name}-${A.todayISO()}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
function bars(values,labels){const mx=Math.max(1,...values);return `<div class="bars admin-bars">${values.map((v,i)=>`<div class="${v?'hi':'zero'}" data-v="${v} · ${esc(labels[i])}" style="height:${v?Math.max(8,v/mx*100):4}%"></div>`).join('')}</div><div class="bar-labels">${labels.map((l,i)=>`<span>${i%2?'':esc(l)}</span>`).join('')}</div>`;}
function templates(){const saved=privateSettings.message_templates||Live.settings.message_templates||{};return Object.fromEntries(Object.entries(TEMPLATE_DEFAULTS).map(([k,v])=>[k,{...v,...(saved[k]||{})}]));}
function fill(t,vars){return String(t).replace(/\{(name|company|email|site)\}/g,(m,k)=>vars[k]??'');}
function mailto(email,key,vars){const t=templates()[key]||templates().general;return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(fill(t.subject,vars))}&body=${encodeURIComponent(fill(t.body,vars))}`;}
function emailMenu(email,vars,keys){if(!email)return '';return `<details class="admin-menu"><summary class="btn btn-ghost btn-sm">${icon('mail')}Email</summary><div>${(keys||Object.keys(TEMPLATE_DEFAULTS)).map(k=>`<a href="${mailto(email,k,vars)}">${esc(templates()[k].label)}</a>`).join('')}</div></details>`;}

/* Confirm dialog (never uses browser pop-ups) */
function confirmBox({title,text,label,danger,typeWord}){return new Promise(resolve=>{
 document.getElementById('admin-confirm')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='admin-confirm';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box" role="alertdialog" aria-labelledby="ac-t" style="width:min(460px,100%)"><h3 id="ac-t">${esc(title)}</h3><p class="muted">${esc(text)}</p>${typeWord?`<label class="f">Type <b>${esc(typeWord)}</b> to confirm<input class="input" id="ac-word" autocomplete="off"></label>`:''}<div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-ac="no">Cancel</button><button class="btn ${danger?'btn-danger':'btn-primary'}" data-ac="yes" ${typeWord?'disabled':''}>${esc(label||'Confirm')}</button></div></div>`;
 document.body.appendChild(m);
 const done=v=>{A.closeModal(m);setTimeout(()=>m.remove(),300);resolve(v);};
 m.addEventListener('click',e=>{const b=e.target.closest('[data-ac]');if(b)done(b.dataset.ac==='yes');else if(e.target===m)done(false);});
 m.querySelector('#ac-word')?.addEventListener('input',e=>{m.querySelector('[data-ac=yes]').disabled=e.target.value.trim().toUpperCase()!==typeWord.toUpperCase();});
 A.openModal('admin-confirm');
});}
function formBox(title,fields,label){return new Promise(resolve=>{
 document.getElementById('admin-form')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='admin-form';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box" role="dialog" aria-labelledby="af-t" style="width:min(620px,100%)"><div class="modal-head"><h3 id="af-t">${esc(title)}</h3><button class="icon-btn" data-af="no" aria-label="Close">${icon('close')}</button></div><form class="form-grid" id="af-form">${fields.map(f=>`<label class="f ${f.full?'full':''}">${esc(f.label)}${f.type==='textarea'?`<textarea class="input" name="${f.name}" maxlength="${f.max||2000}">${esc(f.value??'')}</textarea>`:f.type==='select'?`<select class="input" name="${f.name}">${f.options.map(([v,t])=>`<option value="${esc(v)}" ${v===f.value?'selected':''}>${esc(t)}</option>`).join('')}</select>`:`<input class="input" name="${f.name}" type="${f.type||'text'}" value="${esc(f.value??'')}" maxlength="${f.max||300}">`}</label>`).join('')}<div class="full row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-af="no">Cancel</button><button class="btn btn-primary" type="submit">${esc(label||'Save')}</button></div></form></div>`;
 document.body.appendChild(m);
 const done=v=>{A.closeModal(m);setTimeout(()=>m.remove(),300);resolve(v);};
 m.addEventListener('click',e=>{if(e.target.closest('[data-af=no]')||e.target===m)done(null);});
 m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();done(Object.fromEntries(new FormData(e.target)));});
 A.openModal('admin-form');
});}

/* ---------- data ---------- */
async function loadUsers(force){if(!ready()){users=null;return;}if(users&&!force)return;try{users=await Live.admin.users();usersError=null;}catch(e){users=null;usersError=e;}}
async function loadPrivate(){if(!ready())return;try{privateSettings=await Live.admin.privateSettings();}catch{}}
const bookings=()=>A.store.get('coBookings',[]);
const allCars=()=>A.allVehicles();

/* ---------- sections ---------- */
const S={};
S.overview=async()=>{
 await loadUsers();await loadAdData();
 const cos=DB.companies,pending=cos.filter(c=>!c.approved),B=bookings(),open=(Live.inquiries||[]).filter(r=>r.status==='new');
 const live=A.publishedVehicles().filter(v=>v.available&&!v.archived);const month=A.todayISO().slice(0,7);
 const boostRev=A.boosts().filter(b=>String(b.start).slice(0,7)===month).reduce((n,b)=>n+(Number(b.paid??b.amount)||0),0);
 const pendingPay=A.store.get('boostRequests',[]).filter(r=>r.status==='pending');
 const list=checklist();
 const todo=pending.length+pendingPay.length+open.length;
 return `<section class="adm-hero"><div><p class="adm-date">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</p><h1>Welcome back, ${esc((Live.user.name||'admin').split(' ')[0])}</h1><p class="adm-sum">${todo?`You have <b>${todo}</b> thing${todo===1?'':'s'} waiting for you.`:'Everything is up to date. Nice work.'}</p></div><div class="adm-actions"><a href="#companies" class="adm-act">${icon('shield')}<span>Approve companies</span></a><a href="#ads" class="adm-act">${icon('image')}<span>New ad</span></a><a href="#invoices" class="adm-act">${icon('doc')}<span>New invoice</span></a><a href="#posts" class="adm-act">${icon('edit')}<span>Write a post</span></a><a href="index.html" class="adm-act">${icon('eye')}<span>View site</span></a></div></section>`+upgradeNotice()+
 `<div class="kpis">${kpi('Accounts',users?users.length:'—',users?`${users.filter(u=>u.company_id).length} companies · ${users.filter(u=>!u.company_id&&!u.is_admin).length} renters`:'Needs upgrade',true,'#accounts')}${kpi('Companies waiting',pending.length,pending.length?'Review and approve':'All caught up',false,'#companies')}${kpi('Cars showing',live.length,`${allCars().filter(v=>!v.archived).length} listed in total`,false,'#cars')}${kpi('Open reports',open.length,open.length?'Needs a reply':'Inbox zero',false,'#reports')}</div>
 <div class="grid dash-row" style="grid-template-columns:1.4fr 1fr;margin-top:22px">
  <div class="card"><div class="row between"><h3 style="margin:0">Launch checklist</h3><span class="small muted">${list.filter(i=>i.done).length} of ${list.length} done</span></div><div class="progress" style="margin:12px 0 14px"><i style="width:${list.filter(i=>i.done).length/list.length*100}%"></i></div><div class="stack checklist">${list.map(i=>`<label class="check-item${i.done?' done':''}"><span class="tick" aria-hidden="true">${i.done?icon('check'):''}</span><span>${i.html}</span>${i.manual?`<input type="checkbox" class="sr" data-check="${i.key}" ${i.done?'checked':''}>`:''}</label>`).join('')}</div><p class="small muted" style="margin:12px 0 0">Tick the items you have finished. Items without a box update automatically.</p></div>
  <div class="card"><h3 style="margin-top:0">Needs your attention</h3><div class="stack">
   ${pending.slice(0,4).map(c=>`<div class="list-item"><span class="co-avatar">${esc(A.initials(c.name))}</span><div style="flex:1;min-width:0"><b>${esc(c.name)}</b><div class="small muted">Waiting for approval · ${d(c.registeredAt)}</div></div><a class="btn btn-ghost btn-sm" href="#companies">Review</a></div>`).join('')}
   ${pendingPay.slice(0,3).map(r=>`<div class="list-item"><span class="badge badge-gold">${icon('bolt')}Boost</span><div style="flex:1;min-width:0"><b>${esc(companyOf(r.company).name)}</b><div class="small muted">Payment to confirm · ${A.moneyHTML(r.amount)}</div></div><a class="btn btn-ghost btn-sm" href="#deals">Open</a></div>`).join('')}
   ${open.slice(0,3).map(r=>`<div class="list-item"><span class="badge">${esc(r.kind)}</span><div style="flex:1;min-width:0"><b>${esc(r.payload?.name||r.payload?.business||r.payload?.contactName||'Enquiry')}</b><div class="small muted">${ago(r.created_at)}</div></div><a class="btn btn-ghost btn-sm" href="#reports">Reply</a></div>`).join('')}
   ${(invoices||[]).filter(i=>invStatus(i)==='overdue').slice(0,3).map(i=>`<div class="list-item"><span class="badge badge-hib">Overdue</span><div style="flex:1;min-width:0"><b>${esc(i.number)} · ${esc(i.client_snapshot?.name||'')}</b><div class="small muted">${bbd(invTotals(i).total)} due ${d(i.due)}</div></div><a class="btn btn-ghost btn-sm" href="#invoices">Open</a></div>`).join('')}
   ${!pending.length&&!pendingPay.length&&!open.length&&!(invoices||[]).some(i=>invStatus(i)==='overdue')?'<p class="muted">Nothing waiting. Nice work.</p>':''}
  </div></div>
 </div>
 <div class="grid adm-lists" style="margin-top:22px">
  <div class="card"><div class="row between"><h3 style="margin:0">Newest accounts</h3><a class="small" href="#accounts">See all</a></div><div class="adm-list">${(users||[]).slice().sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,6).map(u=>`<div class="adm-row"><span class="co-avatar">${esc(A.initials(u.name||u.email))}</span><div><b>${esc(u.name||u.email)}</b><span>${esc(u.email)}</span></div><em>${u.is_admin?'Admin':u.company_id?'Company':'Renter'}</em><time>${d(String(u.created_at).slice(0,10))}</time></div>`).join('')||'<p class="muted">No accounts yet.</p>'}</div></div>
  <div class="card"><div class="row between"><h3 style="margin:0">Latest bookings</h3><a class="small" href="#bookings">See all</a></div><div class="adm-list">${B.slice().sort((a,b)=>String(b.sent||'').localeCompare(String(a.sent||''))).slice(0,6).map(b=>`<div class="adm-row"><span class="co-avatar">${esc(A.initials(b.renter||'R'))}</span><div><b>${esc(b.renter||'Renter')}</b><span>${esc((A.vehicle(b.vehicle)||{}).name||'Vehicle')} · ${esc(companyOf(b.company).name||'')}</span></div><em>${esc({request:'Request',confirmed:'Confirmed',onrent:'On rent',completed:'Returned',declined:'Declined',cancelled:'Cancelled'}[b.status]||b.status)}</em><time>${d(b.from)}</time></div>`).join('')||'<p class="muted">No bookings yet.</p>'}</div></div>
 </div>
 <div class="grid g4 admin-mini" style="margin-top:22px">
  <div class="card"><h3 style="margin-top:0">Bookings</h3><p class="k-num" style="font-size:2rem;margin:0">${B.length}</p><p class="small muted">${B.filter(b=>b.status==='request').length} waiting for a company reply · ${B.filter(b=>['confirmed','onrent','completed'].includes(b.status)).length} confirmed</p><a class="small" href="#bookings">See all bookings</a></div>
  <div class="card"><h3 style="margin-top:0">Advertising</h3><p class="k-num" style="font-size:2rem;margin:0">${(Live.ads||[]).filter(a=>adStatus(a)==='live').length} live ad${(Live.ads||[]).filter(a=>adStatus(a)==='live').length===1?'':'s'}</p><p class="small muted">${bbd((invoices||[]).filter(i=>i.status==='sent').reduce((n,i)=>n+invTotals(i).total,0))} waiting on invoices</p><a class="small" href="#invoices">Invoices</a></div>
  <div class="card"><h3 style="margin-top:0">Boost revenue this month</h3><p class="k-num" style="font-size:2rem;margin:0">${A.moneyHTML(boostRev)}</p><p class="small muted">${pendingPay.length} payment${pendingPay.length===1?'':'s'} waiting to be confirmed</p><a class="small" href="#deals">Deals & boosts</a></div>
  <div class="card"><h3 style="margin-top:0">Quick links</h3><div class="stack small"><a href="${SB('auth/users')}" target="_blank" rel="noopener">Supabase: users</a><a href="${SB('auth/url-configuration')}" target="_blank" rel="noopener">Supabase: sign-in URLs</a><a href="${SB('auth/templates')}" target="_blank" rel="noopener">Supabase: email templates</a><a href="${SB('editor')}" target="_blank" rel="noopener">Supabase: database tables</a></div></div>
 </div>`;
};
function checklist(){
 const c=(ready()?privateSettings.launch_checklist:null)||JSON.parse(localStorage.getItem('bimcar.launch')||'{}');
 return [
  {key:'upgrade',html:'Install the admin upgrade (<code>backend/ADMIN-UPGRADE.sql</code>)',done:ready()},
  {key:'urls',manual:true,html:'Supabase sign-in URLs: Site URL and Redirect URLs set to your site',done:!!c.urls},
  {key:'email',manual:true,html:'Sign-up emails: turn off "Confirm email" or connect an email service',done:!!c.email},
  {key:'legal',html:'<b>Legal page</b> filled in with bimcarconnect@yahoo.com',done:true},
  {key:'social',html:'Instagram linked: @bimcarconnect246',done:true},
  {key:'clear',manual:true,html:'Clear old test data (<code>backend/CLEAR-ALL-DATA.sql</code>)',done:!!c.clear},
  {key:'contact',html:'Contact details: bimcarconnect@yahoo.com and +1 (246) 230-1679 (change them in Site settings)',done:true},
  {key:'company',html:'Approve your first rental company',done:DB.companies.some(x=>x.approved)},
  {key:'publish',html:'Site published on GitHub Pages',done:true}
 ];
}

S.accounts=async()=>{
 await loadUsers();
 if(!ready())return head('Accounts','Everyone who has signed up.')+upgradeNotice()+`<p class="muted">Until the upgrade is installed you can also manage accounts in <a href="${SB('auth/users')}" target="_blank" rel="noopener">Supabase → Authentication → Users</a>.</p>`;
 if(!users)return head('Accounts')+notice('Could not load accounts: '+esc(Live.error(usersError)),'warn');
 const q=(state.q||'').toLowerCase(),f=state.role||'all';
 const role=u=>u.is_admin?'admin':u.company_id?'company':'renter';
 const list=users.filter(u=>(f==='all'||(f==='suspended'?u.banned:f==='unconfirmed'?!u.email_confirmed_at:role(u)===f))&&(!q||`${u.name} ${u.email} ${u.company_name||''}`.toLowerCase().includes(q)));
 const count=k=>users.filter(u=>k==='all'||(k==='suspended'?u.banned:k==='unconfirmed'?!u.email_confirmed_at:role(u)===k)).length;
 return head('Accounts',`${users.length} accounts. Suspend, confirm, email, promote or delete any account.`,`<button class="btn btn-ghost" data-export="users">${icon('doc')}Export CSV</button>`)+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['all','All'],['renter','Renters'],['company','Companies'],['admin','Admins'],['unconfirmed','Unconfirmed'],['suspended','Suspended']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="role" data-val="${k}">${t}<span class="count">${count(k)}</span></button>`).join('')}</div><input class="input" data-search placeholder="Search name, email or company" value="${esc(state.q||'')}" style="max-width:280px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Account</th><th>Type</th><th>Joined</th><th>Last sign-in</th><th>Status</th><th></th></tr></thead><tbody>${list.map(u=>{const me=u.id===Live.user.id;const vars={name:(u.name||'').split(' ')[0],company:u.company_name||'',email:u.email,site};return `<tr data-user="${esc(u.id)}"><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="co-avatar">${esc(A.initials(u.name||u.email))}</span><div style="min-width:0"><b>${esc(u.name||'—')}${me?' <span class="badge">You</span>':''}</b><div class="small muted">${esc(u.email)}</div></div></div></td><td>${u.is_admin?'<span class="badge badge-gold">Admin</span> ':''}${u.company_id?`<a href="company.html#${esc(u.company_id)}" class="small">${esc(u.company_name||'Company')}</a>${u.company_approved?'':' <span class="small muted">(pending)</span>'}`:(!u.is_admin?'Renter':'')}<div class="small muted">${u.bookings} booking${u.bookings==1?'':'s'}</div></td><td class="small">${d(u.created_at)}</td><td class="small">${ago(u.last_sign_in_at)}</td><td>${u.banned?'<span class="st st-no">Suspended</span>':u.email_confirmed_at?'<span class="st st-ok">Active</span>':'<span class="st st-req">Email not confirmed</span>'}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end">${emailMenu(u.email,vars,['general','account_suspended','account_deleted','request_documents'])}<details class="admin-menu"><summary class="btn btn-ghost btn-sm" aria-label="More actions">More ${icon('chevronD')}</summary><div>
   ${!u.email_confirmed_at?`<button data-act="confirm">Confirm email</button>`:''}
   <button data-act="reset">Send password reset email</button>
   ${me?'':u.is_admin?`<button data-act="unadmin">Remove admin access</button>`:`<button data-act="admin">Make admin</button>`}
   ${me?'':u.banned?`<button data-act="unsuspend">Restore account</button>`:`<button data-act="suspend">Suspend account</button>`}
   ${me?'':`<button data-act="delete" class="danger">Delete account…</button>`}
 </div></details></div></td></tr>`;}).join('')||`<tr><td colspan="6">${empty('No accounts match','Try another filter or search.')}</td></tr>`}</tbody></table></div>`;
};
async function accountAction(id,act,btn){
 const u=users.find(x=>x.id===id);if(!u)return;
 if(act==='confirm')return run(btn,async()=>{await Live.admin.confirmEmail(id);await loadUsers(true);},'Email confirmed. They can sign in now.');
 if(act==='reset')return run(btn,async()=>{const {error}=await Live.client.auth.resetPasswordForEmail(u.email,{redirectTo:DriveBimConfig.siteUrl+'/reset-password.html'});if(error)throw error;await Live.admin.log('Sent password reset',u.email);},'Password reset email sent');
 if(act==='admin'){if(!await confirmBox({title:'Make admin?',text:`${u.email} will be able to approve companies, delete accounts and change every setting.`,label:'Make admin'}))return;return run(btn,async()=>{await Live.admin.setAdmin(id,true);await loadUsers(true);},'Admin access granted');}
 if(act==='unadmin'){if(!await confirmBox({title:'Remove admin access?',text:`${u.email} will become a normal account.`,label:'Remove access',danger:true}))return;return run(btn,async()=>{await Live.admin.setAdmin(id,false);await loadUsers(true);},'Admin access removed');}
 if(act==='suspend'){if(!await confirmBox({title:'Suspend this account?',text:`${u.email} won't be able to sign in until you restore the account. Their listings and bookings stay as they are.`,label:'Suspend',danger:true}))return;return run(btn,async()=>{await Live.admin.setSuspended(id,true);await loadUsers(true);},'Account suspended');}
 if(act==='unsuspend')return run(btn,async()=>{await Live.admin.setSuspended(id,false);await loadUsers(true);},'Account restored');
 if(act==='delete'){if(!await confirmBox({title:'Delete this account permanently?',text:`This deletes ${u.email}${u.company_name?`, the company "${u.company_name}" with all its cars, deals and bookings,`:''} plus their bookings, messages, reviews and enquiries. This cannot be undone.`,label:'Delete account',danger:true,typeWord:'DELETE'}))return;return run(btn,async()=>{await Live.admin.deleteUser(id);await loadUsers(true);},'Account deleted');}
}

S.companies=async()=>{
 const f=state.co||'pending',q=(state.q||'').toLowerCase();
 const all=DB.companies,match=c=>!q||`${c.name} ${c.email||''} ${c.parish||''}`.toLowerCase().includes(q);
 const groups={pending:all.filter(c=>!c.approved),live:all.filter(c=>c.approved),all};
 const list=(groups[f]||all).filter(match);
 return head('Companies','Approve, suspend, verify, edit or remove rental companies.',`<button class="btn btn-ghost" data-export="companies">${icon('doc')}Export CSV</button>`)+upgradeNotice()+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['pending','Waiting / suspended'],['live','Live'],['all','All']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="co" data-val="${k}">${t}<span class="count">${groups[k].length}</span></button>`).join('')}</div><input class="input" data-search placeholder="Search companies" value="${esc(state.q||'')}" style="max-width:260px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Company</th><th>Contact</th><th>Fleet</th><th>Requirements</th><th>Status</th><th></th></tr></thead><tbody>${list.map(c=>{const cars=allCars().filter(v=>v.company===c.id&&!v.archived),showing=cars.filter(v=>v.available&&A.vehiclePolicyComplete(v)).length;const owner=users?.find(u=>u.company_id===c.id);const vars={name:(owner?.name||c.name).split(' ')[0],company:c.name,email:c.email||owner?.email||'',site};return `<tr data-co="${esc(c.id)}"><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="co-avatar">${esc(A.initials(c.name))}</span><div style="min-width:0"><a href="company.html#${esc(c.id)}"><b>${esc(c.name)}</b></a><div class="small muted">${esc(c.parish||'')} · joined ${d(c.registeredAt)}</div></div></div></td><td class="small">${esc(c.email||owner?.email||'')}<br>${esc(c.phone||'')}</td><td class="small">${cars.length} car${cars.length===1?'':'s'}<br><span class="muted">${showing} showing</span></td><td>${A.requirementsComplete(c.id)?'<span class="st st-ok">Complete</span>':'<span class="st st-req">Not set yet</span>'}</td><td>${c.approved?'<span class="st st-ok">Live</span>':'<span class="st st-req">Not live</span>'}${c.verified?' <span class="badge badge-reef">'+icon('shield')+'Verified</span>':''}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end">${c.approved?'':`<button class="btn btn-primary btn-sm" data-co-act="approve">Approve</button>`}${emailMenu(vars.email,vars,['company_approved','request_documents','listing_removed','general'])}<details class="admin-menu"><summary class="btn btn-ghost btn-sm">More ${icon('chevronD')}</summary><div>
  <button data-co-act="verify">${c.verified?'Remove Verified badge':'Add Verified badge'}</button>
  <button data-co-act="edit">Edit details</button>
  ${c.approved?`<button data-co-act="suspend">Suspend (hide from site)</button>`:''}
  <a href="company.html#${esc(c.id)}">View public page</a>
  <button data-co-act="delete" class="danger">Delete company…</button>
 </div></details></div></td></tr>`;}).join('')||`<tr><td colspan="6">${empty(f==='pending'?'No companies waiting':'No companies here','New company sign-ups show up here for approval.')}</td></tr>`}</tbody></table></div>`;
};
async function companyAction(id,act,btn){
 const c=DB.companies.find(x=>x.id===id);if(!c)return;
 if(act==='approve')return run(btn,async()=>{if(ready())await Live.admin.setCompanyApproved(id,true);else{await Live.approveCompany(id);}await Live.admin.log('Approved company',c.name);},`${c.name} is live`);
 if(act==='suspend'){if(!await confirmBox({title:`Suspend ${c.name}?`,text:'Their company page and cars are hidden from renters until you approve them again. Nothing is deleted.',label:'Suspend',danger:true}))return;return run(btn,()=>Live.admin.setCompanyApproved(id,false),`${c.name} suspended`);}
 if(act==='verify')return run(btn,async()=>{await Live.setVerified(id,!c.verified);await Live.admin.log(c.verified?'Removed Verified badge':'Added Verified badge',c.name);},c.verified?'Verified badge removed':'Verified badge added');
 if(act==='edit'){const v=await formBox(`Edit ${c.name}`,[{name:'name',label:'Company name',value:c.name},{name:'parish',label:'Parish',type:'select',value:c.parish,options:DB.parishes.map(p=>[p,p])},{name:'phone',label:'Phone / WhatsApp',value:c.phone},{name:'email',label:'Email',type:'email',value:c.email},{name:'base',label:'Address or landmark',value:c.base,full:true},{name:'about',label:'About',type:'textarea',value:c.about,full:true}],'Save changes');if(!v)return;if(!v.name.trim()){A.toast('Company name is required');return;}return run(null,async()=>{await Live.admin.updateCompany(id,v);await Live.admin.log('Edited company',v.name);},'Company details saved');}
 if(act==='delete'){if(!await confirmBox({title:`Delete ${c.name}?`,text:'This permanently deletes the company, its cars, deals, boosts and all of its bookings and conversations. The owner keeps a renter account. This cannot be undone.',label:'Delete company',danger:true,typeWord:'DELETE'}))return;return run(btn,()=>Live.admin.deleteCompany(id),'Company deleted');}
}

S.cars=async()=>{
 const f=state.car||'all',q=(state.q||'').toLowerCase();
 const status=v=>v.archived?'archived':!companyOf(v.company).approved?'company':!A.vehiclePolicyComplete(v)?'incomplete':v.available?'showing':'hidden';
 const LABEL={showing:['Showing','st-ok'],hidden:['Hidden','st-done'],incomplete:['Rules incomplete','st-req'],company:['Company not live','st-req'],archived:['Removed','st-no']};
 const cars=allCars(),list=cars.filter(v=>(f==='all'?!v.archived:status(v)===f)&&(!q||`${v.name} ${companyOf(v.company).name}`.toLowerCase().includes(q)));
 return head('Cars','Every listing on the site. Hide anything that breaks the rules.',`<button class="btn btn-ghost" data-export="cars">${icon('doc')}Export CSV</button>`)+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['all','All'],['showing','Showing'],['hidden','Hidden'],['incomplete','Incomplete'],['company','Company not live'],['archived','Removed']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="car" data-val="${k}">${t}<span class="count">${k==='all'?cars.filter(v=>!v.archived).length:cars.filter(v=>status(v)===k).length}</span></button>`).join('')}</div><input class="input" data-search placeholder="Search cars or companies" value="${esc(state.q||'')}" style="max-width:260px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Car</th><th>Company</th><th>Price/day</th><th>Photos</th><th>Status</th><th></th></tr></thead><tbody>${list.map(v=>{const s=LABEL[status(v)];return `<tr data-car="${esc(v.id)}"><td><div class="t-veh">${A.carImg(v)}<div><b>${esc(v.name)}</b><div class="small muted">${esc(v.type||'')} · ${esc(v.seats||'')} seats</div></div></div></td><td class="small"><a href="company.html#${esc(v.company)}">${esc(companyOf(v.company).name)}</a></td><td>${A.moneyHTML(v.price)}</td><td class="small">${(v.photoPaths||[]).length||'None'}</td><td><span class="st ${s[1]}">${s[0]}</span></td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end"><a class="icon-btn" href="vehicle.html#${esc(v.id)}" aria-label="View listing">${icon('eye')}</a>${v.archived?'':v.available?`<button class="btn btn-ghost btn-sm" data-car-act="hide">Hide</button>`:`<button class="btn btn-ghost btn-sm" data-car-act="show">Show</button>`}${v.archived?'':`<button class="btn btn-danger btn-sm" data-car-act="delete">Remove</button>`}</div></td></tr>`;}).join('')||`<tr><td colspan="6">${empty('No cars here')}</td></tr>`}</tbody></table></div>`;
};
async function carAction(id,act,btn){
 const v=A.vehicle(id);if(!v)return;
 if(act==='hide'||act==='show'){if(act==='show'&&!A.vehiclePolicyComplete(v)){A.toast('This car\'s rental rules are incomplete, so it can\'t be shown yet.');return;}return run(btn,async()=>{await A.saveVehicles(A.vehicles().map(x=>x.id===id?{...x,available:act==='show'}:x));await Live.admin.log(act==='hide'?'Hid car':'Showed car',`${v.name} (${companyOf(v.company).name})`);},act==='hide'?'Car hidden from renters':'Car is showing again');}
 if(act==='delete'){if(!await confirmBox({title:`Remove ${v.name}?`,text:'The car disappears from the site. If it has booking history it is archived so past bookings keep their details.',label:'Remove car',danger:true}))return;return run(btn,async()=>{await A.saveVehicles(A.vehicles().filter(x=>x.id!==id));await Live.admin.log('Removed car',`${v.name} (${companyOf(v.company).name})`);},'Car removed');}
}

S.bookings=async()=>{
 const f=state.bk||'all',q=(state.q||'').toLowerCase();
 const B=bookings().slice().sort((a,b)=>String(b.sent||'').localeCompare(String(a.sent||'')));
 const list=B.filter(b=>(f==='all'||b.status===f)&&(!q||`${b.renter||''} ${b.contact||''} ${companyOf(b.company).name} ${(A.vehicle(b.vehicle)||{}).name||''} ${b.id}`.toLowerCase().includes(q)));
 return head('Bookings','Every booking request on the platform. Open the conversation or change a status if something goes wrong.',`<button class="btn btn-ghost" data-export="bookings">${icon('doc')}Export CSV</button>`)+upgradeNotice()+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['all','All'],...Object.entries(STATUS).map(([k,v])=>[k,v[0]])].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="bk" data-val="${k}">${t}<span class="count">${k==='all'?B.length:B.filter(b=>b.status===k).length}</span></button>`).join('')}</div><input class="input" data-search placeholder="Search renter, company, car" value="${esc(state.q||'')}" style="max-width:260px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Booking</th><th>Renter</th><th>Company & car</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${list.map(b=>{const v=A.vehicle(b.vehicle)||{name:'Removed car'},s=STATUS[b.status]||[b.status,'st-req'];return `<tr data-bk="${esc(b.id)}"><td><b title="${esc(b.id)}">${esc(String(b.id).slice(0,11))}</b><div class="small muted">${d(b.sent)}</div></td><td>${esc(b.renter||'Renter')}<div class="small muted">${esc(b.contact||'')}</div></td><td>${esc(companyOf(b.company).name)}<div class="small muted">${esc(v.name)}</div></td><td class="small">${A.fmtDate(b.from)} – ${A.fmtDate(b.to)}<div class="muted">${A.daysBetween(b.from,b.to)} days</div></td><td>${A.moneyHTML(b.total)||'—'}</td><td>${ready()?`<select class="input admin-status" data-bk-status aria-label="Booking status">${Object.entries(STATUS).map(([k,t])=>`<option value="${k}" ${k===b.status?'selected':''}>${t[0]}</option>`).join('')}</select>`:`<span class="st ${s[1]}">${s[0]}</span>`}</td><td><button class="btn btn-ghost btn-sm" data-chat="${esc(b.id)}">Conversation</button></td></tr>`;}).join('')||`<tr><td colspan="7">${empty('No bookings here')}</td></tr>`}</tbody></table></div>`;
};

S.deals=async()=>{
 const t=A.todayISO(),reqs=A.store.get('boostRequests',[]),pend=reqs.filter(r=>r.status==='pending'),Bo=A.boosts().slice().sort((a,b)=>String(b.start).localeCompare(String(a.start)));
 const target=b=>b.type==='special'?(A.specials().find(s=>s.id===b.target)||{title:'Special'}).title:(A.vehicle(b.target)||{name:'Car'}).name;
 const sp=A.specials().slice().sort((a,b)=>String(a.ends).localeCompare(String(b.ends)));
 return head('Deals & boosts','Confirm boost payments, end boosts and remove deals.')+upgradeNotice()+
 `<h3>Boost payments waiting</h3><p class="small muted">Only record a payment after you have checked WhatsApp and received the money.</p><div class="stack" style="margin-bottom:28px">${pend.map(r=>`<div class="card row between" data-req="${esc(r.id)}"><div><b>${esc(companyOf(r.company).name)}</b> · ${esc(target(r))}<p class="small muted" style="margin:4px 0 0">${esc((DB.boostTypes.find(x=>x.id===r.type)||{}).name||'Boost')} · ${r.weeks} week${r.weeks===1?'':'s'} · ${d(r.start)} to ${d(r.end)} · ${A.moneyHTML(r.amount)} · ref ${esc(r.id)}</p><label class="check" style="margin-top:8px"><input type="checkbox" data-paid><span>I have received this payment</span></label></div><div class="row"><button class="btn btn-primary btn-sm" data-req-act="pay">Record payment</button>${ready()?`<button class="btn btn-ghost btn-sm" data-req-act="cancel">Cancel request</button>`:''}</div></div>`).join('')||'<p class="muted">No payments waiting.</p>'}</div>
 <h3>Boosts</h3><div class="table-wrap" style="margin-bottom:28px"><table class="t"><thead><tr><th>Company</th><th>Promoting</th><th>Placement</th><th>Dates</th><th>Paid</th><th>Status</th><th></th></tr></thead><tbody>${Bo.map(b=>{const live=b.start<=t&&b.end>=t,done=b.end<t;return `<tr data-boost="${esc(b.id)}"><td>${esc(companyOf(b.company).name)}</td><td>${esc(target(b))}</td><td>${esc((DB.boostTypes.find(x=>x.id===b.type)||{}).name||'')}</td><td class="small">${d(b.start)} – ${d(b.end)}</td><td>${A.moneyHTML(Number(b.paid??b.amount)||0)}</td><td><span class="st ${live?'st-ok':done?'st-done':'st-req'}">${live?'Live':done?'Finished':'Scheduled'}</span></td><td>${ready()&&!done?`<button class="btn btn-ghost btn-sm" data-boost-act="end">End now</button>`:''}</td></tr>`;}).join('')||'<tr><td colspan="7"><p class="muted" style="margin:0">No boosts yet.</p></td></tr>'}</tbody></table></div>
 <h3>Deals posted by companies</h3><div class="table-wrap"><table class="t"><thead><tr><th>Deal</th><th>Company</th><th>Code</th><th>Ends</th><th></th></tr></thead><tbody>${sp.map(s=>`<tr data-sp="${esc(s.id)}"><td><b>${esc(s.title)}</b><div class="small muted">${esc(s.off)} · ${esc(s.desc||'')}</div></td><td>${esc(companyOf(s.company).name)}</td><td><code>${esc(s.code)}</code></td><td class="small">${d(s.ends)}${s.ends<t?' <span class="st st-done">Ended</span>':''}</td><td><button class="btn btn-danger btn-sm" data-sp-act="end">Remove</button></td></tr>`).join('')||'<tr><td colspan="5"><p class="muted" style="margin:0">No deals yet.</p></td></tr>'}</tbody></table></div>`;
};

S.reviews=async()=>head('Reviews','Publish genuine reviews and decline anything fake, abusive or off topic.')+'<div class="card"><div id="review-moderation"></div></div>';

S.reports=async()=>{
 const f=state.rep||'open',all=(Live.inquiries||[]).slice().sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 const list=all.filter(r=>f==='open'?r.status==='new':f==='done'?r.status!=='new':true);
 const card=r=>{const p=r.payload||{};const v=r.kind==='photo'?A.vehicle(p.vehicle):null;const contact=p.contact||p.email||'';const isMail=/@/.test(contact),digits=String(contact).replace(/\D/g,'');
  const reply=isMail?`<a class="btn btn-ghost btn-sm" href="mailto:${esc(contact)}?subject=${encodeURIComponent('Re: your message to BimCar Connect')}">${icon('mail')}Reply by email</a>`:digits.length>=7?`<a class="btn btn-ghost btn-sm" href="https://wa.me/${digits}" target="_blank" rel="noopener">${icon('chat')}Reply on WhatsApp</a>`:'';
  return `<div class="card report-card" data-inq="${esc(r.id)}"><div class="row between"><div class="row" style="gap:8px"><span class="badge ${r.kind==='photo'||r.kind==='conversation'?'badge-hib':''}">${esc({photo:'Photo report',contact:'Contact',advertising:'Advertising',conversation:'Reported conversation'}[r.kind]||r.kind)}</span><span class="small muted">${d(r.created_at)} · ${ago(r.created_at)}</span></div>${r.status==='new'?'<span class="st st-req">Open</span>':'<span class="st st-done">Handled</span>'}</div>
  ${v?`<div class="list-item" style="margin-top:10px">${A.carImg(v,'','width:72px;height:48px;aspect-ratio:auto;border-radius:8px;flex:none')}<div><b><a href="vehicle.html#${esc(v.id)}">${esc(v.name)}</a></b><div class="small muted">${esc(companyOf(v.company).name)}</div></div></div>`:''}
  <dl class="report-fields">${Object.entries(p).filter(([k])=>k!=='vehicle').map(([k,val])=>`<dt>${esc(k.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase()))}</dt><dd>${esc(typeof val==='object'?JSON.stringify(val):String(val))}</dd>`).join('')}</dl>
  <div class="row">${reply}${r.kind==='photo'&&v&&!v.archived&&v.available?`<button class="btn btn-danger btn-sm" data-inq-act="takedown">Hide this car</button>`:''}${r.kind==='conversation'&&p.booking?`<button class="btn btn-ghost btn-sm" data-chat="${esc(p.booking)}">${icon('chat')}Read conversation</button><a class="btn btn-ghost btn-sm" href="#accounts">Suspend an account</a>`:''}${r.kind==='advertising'&&ready()?`<button class="btn btn-ghost btn-sm" data-inq-client="${esc(r.id)}">${icon('plus')}Add as ad client</button>`:''}${r.status==='new'?`<button class="btn btn-primary btn-sm" data-inq-act="close">Mark handled</button>`:''}</div></div>`;};
 return head('Reports & enquiries','Photo reports, contact messages and advertising enquiries.',`<button class="btn btn-ghost" data-export="enquiries">${icon('doc')}Export CSV</button>`)+
 `<div class="tabs" style="margin-bottom:16px">${[['open','Open'],['done','Handled'],['all','All']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="rep" data-val="${k}">${t}<span class="count">${k==='open'?all.filter(r=>r.status==='new').length:k==='done'?all.filter(r=>r.status!=='new').length:all.length}</span></button>`).join('')}</div><div class="grid g2">${list.map(card).join('')||`<div style="grid-column:1/-1">${empty(f==='open'?'Inbox zero':'Nothing here','New reports and enquiries appear here.')}</div>`}</div>`;
};

S.insights=async()=>{
 await loadUsers();
 const weeks=12,start=A.addDays(A.todayISO(),-(weeks*7-1));
 const weekLabels=[...Array(weeks)].map((_,i)=>A.fmtDate(A.addDays(start,i*7),{day:'numeric',month:'short'}));
 const per=(dates)=>{const out=Array(weeks).fill(0);dates.forEach(s=>{if(!s)return;const day=String(s).slice(0,10);if(day<start)return;const i=Math.floor((new Date(day)-new Date(start))/(7*864e5));if(i>=0&&i<weeks)out[i]++;});return out;};
 const B=bookings();
 const byCo={};B.forEach(b=>{byCo[b.company]=(byCo[b.company]||0)+1;});
 const top=Object.entries(byCo).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const byCar={};B.forEach(b=>{byCar[b.vehicle]=(byCar[b.vehicle]||0)+1;});
 const topCars=Object.entries(byCar).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const confirmedValue=B.filter(b=>['confirmed','onrent','completed'].includes(b.status)).reduce((n,b)=>n+(Number(b.total)||0),0);
 return head('Insights & exports','How the platform is growing. Download any list as a spreadsheet (CSV).')+
 `<div class="kpis">${kpi('Accounts',users?users.length:'—',users?`${per(users.map(u=>u.created_at)).at(-1)} new this week`:'Needs upgrade',true)}${kpi('Booking requests',B.length,`${per(B.map(b=>b.sent)).at(-1)} this week`)}${kpi('Confirmed rental value',A.money(confirmedValue),'Paid directly to companies')}${kpi('Conversion',B.length?Math.round(B.filter(b=>['confirmed','onrent','completed'].includes(b.status)).length/B.length*100)+'%':'—','Requests that were confirmed')}</div>
 <div class="grid g2" style="margin-top:22px">
  <div class="card"><h3 style="margin-top:0">New accounts per week</h3>${users?bars(per(users.map(u=>u.created_at)),weekLabels):'<p class="muted">Install the admin upgrade to see sign-ups.</p>'}</div>
  <div class="card"><h3 style="margin-top:0">Booking requests per week</h3>${bars(per(B.map(b=>b.sent)),weekLabels)}</div>
  <div class="card"><h3 style="margin-top:0">Busiest companies</h3>${top.length?top.map(([id,n])=>`<div class="list-item"><span class="co-avatar">${esc(A.initials(companyOf(id).name))}</span><div style="flex:1"><b>${esc(companyOf(id).name)}</b></div><b>${n}</b></div>`).join(''):'<p class="muted">No bookings yet.</p>'}</div>
  <div class="card"><h3 style="margin-top:0">Most requested cars</h3>${topCars.length?topCars.map(([id,n])=>{const v=A.vehicle(id)||{name:'Removed car'};return `<div class="list-item"><div style="flex:1"><b>${esc(v.name)}</b><div class="small muted">${esc(companyOf(v.company).name)}</div></div><b>${n}</b></div>`;}).join(''):'<p class="muted">No bookings yet.</p>'}</div>
 </div>
 <div class="card" style="margin-top:22px"><h3 style="margin-top:0">Download data</h3><div class="row">${[['users','Accounts'],['companies','Companies'],['cars','Cars'],['bookings','Bookings'],['enquiries','Reports & enquiries'],['boosts','Boosts'],['clients','Ad clients'],['ads','Ads'],['invoices','Invoices']].map(([k,t])=>`<button class="btn btn-ghost btn-sm" data-export="${k}">${icon('doc')}${t}</button>`).join('')}</div></div>`;
};

S.emails=async()=>{
 await loadPrivate();const T=templates();
 return head('Email templates','Account emails sent by Supabase, and your own reusable messages for companies and renters.')+upgradeNotice()+
 `<div class="card"><h3 style="margin-top:0">Account emails (sign-up, password reset, email change)</h3><p class="small muted">These are sent automatically by Supabase. To use these BimCar designs: connect an email service under <a href="${SB('auth/smtp')}" target="_blank" rel="noopener">Supabase → Emails → SMTP Settings</a>, then open <a href="${SB('auth/templates')}" target="_blank" rel="noopener">Email templates</a>, choose the matching tab, paste the subject and the HTML, and save. Supabase only lets you edit these after an email service is connected.</p>
 <div class="tabs" style="margin:14px 0">${Object.keys(ACCOUNT_EMAILS).map(k=>`<button class="${(state.em||'confirm-signup')===k?'on':''}" data-state="em" data-val="${k}">${{'confirm-signup':'Confirm sign-up','reset-password':'Reset password','change-email':'Change email'}[k]}</button>`).join('')}</div>
 ${(()=>{const k=state.em||'confirm-signup',t=ACCOUNT_EMAILS[k];return `<div class="grid email-grid"><iframe class="email-preview" title="Email preview" sandbox srcdoc="${esc(t.html.replace(/\{\{ \.ConfirmationURL \}\}/g,'#').replace(/\{\{ \.Email \}\}/g,'you@example.com').replace(/\{\{ \.NewEmail \}\}/g,'new@example.com'))}"></iframe><div class="stack"><label class="f">Subject<input class="input" readonly value="${esc(t.subject)}"></label><button class="btn btn-ghost" data-copy-text="${esc(t.subject)}">${icon('copy')}Copy subject</button><button class="btn btn-primary" data-copy-html="${k}">${icon('copy')}Copy email HTML</button><a class="btn btn-ghost" href="${SB('auth/templates')}" target="_blank" rel="noopener">Open Supabase templates</a></div></div>`;})()}
 </div>
 <div class="card" style="margin-top:22px"><div class="row between"><h3 style="margin:0">Your message templates</h3><span class="small muted">Used by the Email buttons on Accounts and Companies</span></div><p class="small muted">Write once, reuse anywhere. You can use {name}, {company}, {email} and {site}; they're filled in automatically. Emails open in your own mail app so replies come back to you.</p>
 <form id="tpl-form" class="stack">${Object.entries(T).map(([k,t])=>`<details class="faq"><summary>${esc(t.label)}</summary><div class="stack" style="margin-top:12px"><label class="f">Subject<input class="input" name="${k}.subject" value="${esc(t.subject)}" maxlength="200"></label><label class="f">Message<textarea class="input" name="${k}.body" rows="8" maxlength="4000">${esc(t.body)}</textarea></label><button type="button" class="link-btn" data-tpl-reset="${k}">Restore the original wording</button></div></details>`).join('')}
 <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit" ${ready()?'':'disabled'}>Save templates</button></div></form></div>`;
};

S.settings=async()=>{
 await loadPrivate();
 const a=Live.settings.announcement||{},c=Live.settings.contact||{};
 return head('Site settings','Changes go live for every visitor straight away.')+upgradeNotice()+
 `<form class="card stack" id="set-ann"><h3 style="margin:0">Announcement banner</h3><p class="small muted" style="margin:0">A strip under the header on every page, e.g. "Now booking for Crop Over" or "Planned maintenance tonight at 10pm".</p>
  <label class="row small"><span class="switch"><input type="checkbox" name="enabled" ${a.enabled?'checked':''}><span></span></span>Show the banner</label>
  <label class="f">Message<input class="input" name="text" maxlength="180" value="${esc(a.text||'')}" placeholder="e.g. List your rental company free until 31 December"></label>
  <div class="form-grid"><label class="f">Style<select class="input" name="tone">${[['info','Information (purple)'],['success','Good news (green)'],['warning','Warning (amber)']].map(([v,t])=>`<option value="${v}" ${a.style===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="f">Link (optional)<input class="input" name="link" maxlength="300" value="${esc(a.link||'')}" placeholder="signup.html or https://…"></label><label class="f">Link text<input class="input" name="linkLabel" maxlength="40" value="${esc(a.linkLabel||'')}" placeholder="Learn more"></label></div>
  <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit" ${ready()?'':'disabled'}>Save banner</button></div></form>
 <form class="card stack" id="set-contact" style="margin-top:22px"><h3 style="margin:0">Contact details</h3><p class="small muted" style="margin:0">The WhatsApp number receives boost payment requests and contact messages from visitors who aren't signed in. Email and phone show on the Contact page.</p>
  <div class="form-grid"><label class="f">WhatsApp number<span class="hint">Country code and number, e.g. 12465551234</span><input class="input" name="whatsapp" inputmode="numeric" maxlength="20" value="${esc(c.whatsapp||DB.boostWhatsApp||'')}"></label><label class="f">Contact email<input class="input" type="email" name="email" maxlength="200" value="${esc(c.email||'')}"></label><label class="f">Phone<input class="input" name="phone" maxlength="40" value="${esc(c.phone||'')}"></label></div>
  <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit" ${ready()?'':'disabled'}>Save contact details</button></div></form>
 <form class="card stack" id="set-ads" style="margin-top:22px"><h3 style="margin:0">Ads</h3><p class="small muted" style="margin:0">How many paid ads can run at the same time in each placement (homepage, blog and after-booking).</p><label class="f" style="max-width:220px">Ads per placement<input class="input" type="number" name="limit" min="1" max="12" step="1" value="${A.adLimit()}"></label><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit" ${ready()?'':'disabled'}>Save</button></div></form>
 <form class="card stack" id="set-chat" style="margin-top:22px"><h3 style="margin:0">Message safety</h3><p class="small muted" style="margin:0">Messages containing any of these words or phrases are blocked before they're sent, and the sender is asked to rephrase. One per line. Whole words only, so "sex" won't block "Essex". People can also report a conversation; reports appear in Reports & enquiries.</p><textarea class="input" name="words" rows="8">${esc(((privateSettings.chat_safety||{}).words||[]).join('\n'))}</textarea><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit" ${ready()?'':'disabled'}>Save blocked words</button></div></form>
 <div class="card" style="margin-top:22px"><h3 style="margin-top:0">Admins</h3><p class="small muted">Give another person admin access from <a href="#accounts">Accounts</a> → More → Make admin. They need an account with a confirmed email first.</p></div>`;
};

S.activity=async()=>{
 if(!ready())return head('Activity log','A record of every admin action.')+upgradeNotice();
 try{activity=await Live.admin.activity();}catch(e){return head('Activity log')+notice(esc(Live.error(e)),'warn');}
 return head('Activity log','The last 300 admin actions: who did what, and when.',`<button class="btn btn-ghost" data-export="activity">${icon('doc')}Export CSV</button>`)+
 `<div class="table-wrap"><table class="t"><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>On</th></tr></thead><tbody>${activity.map(r=>`<tr><td class="small">${new Date(r.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td class="small">${esc(r.admin_email||'—')}</td><td><b>${esc(r.action)}</b>${r.details&&Object.keys(r.details).length&&r.details.from?`<div class="small muted">${esc(r.details.from)} → ${esc(r.details.to)}</div>`:''}</td><td class="small">${esc(r.target||'')}</td></tr>`).join('')||`<tr><td colspan="4">${empty('No activity yet','Admin actions are recorded here.')}</td></tr>`}</tbody></table></div>`;
};

/* ---------- advertising: ads, clients, invoices ---------- */
const SPOTS={home:'Homepage',guide:'Island Drives blog & driving guide',confirm:'After a booking request'};
const PACKAGES=[['Daily ad',25,1],['Weekly ad',140,7],['Monthly ad',450,30],['Creative support (design)',0,0]];
let clients=null,invoices=null,adsLoaded=false;
async function loadAdData(force){if(!ready())return;try{if(!clients||force)clients=await Live.admin.clients();if(!invoices||force)invoices=await Live.admin.invoices();}catch(e){clients=clients||[];invoices=invoices||[];}}
const clientName=id=>(clients||[]).find(c=>c.id===id)?.name||'No client';
const adStatus=a=>{const t=A.todayISO();return !a.active?'paused':a.ends<t?'ended':a.starts>t?'scheduled':'live';};
const AD_LABEL={live:['Live','st-ok'],scheduled:['Scheduled','st-req'],paused:['Paused','st-done'],ended:['Ended','st-no']};
const invTotals=inv=>{const sub=(inv.items||[]).reduce((n,i)=>n+(Number(i.qty)||0)*(Number(i.price)||0),0),disc=Math.min(sub,Number(inv.discount)||0),tax=(sub-disc)*(Number(inv.tax_rate)||0)/100;return {sub,disc,tax,total:Math.round((sub-disc+tax)*100)/100};};
const invStatus=inv=>inv.status==='sent'&&inv.due&&inv.due<A.todayISO()?'overdue':inv.status;
const INV_LABEL={draft:['Draft','st-done'],sent:['Sent','st-req'],paid:['Paid','st-ok'],void:['Void','st-no'],overdue:['Overdue','st-no']};
const bbd=n=>'BBD $'+(Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

/* Image optimiser: any photo or poster becomes a crisp WebP/JPEG at the chosen ad size. */
const AD_SIZES={standard:['Standard card',1200,675,'16:9 · fits every spot'],banner:['Wide banner',1500,400,'Full width across the section'],square:['Square',1080,1080,'1:1 · great for logos and food'],tall:['Tall',1080,1350,'4:5 · posters and menus']};
async function optimiseImage(file,{mode='fill',focus='center',W=1200,H=675}={}){
 if(!/^image\//.test(file.type))throw new Error('Choose an image file (JPG, PNG, WebP or HEIC).');
 if(file.size>25*1024*1024)throw new Error('That image is over 25 MB. Choose a smaller one.');
 let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{bmp=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('This image format can\'t be read in this browser. Try a JPG or PNG.'));i.src=URL.createObjectURL(file);});}
 if(mode==='natural'){const k=Math.min(1,1600/Math.max(bmp.width,1),1600/Math.max(bmp.height,1));W=Math.max(1,Math.round(bmp.width*k));H=Math.max(1,Math.round(bmp.height*k));}
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingQuality='high';
 const iw=bmp.width,ih=bmp.height,cover=Math.max(W/iw,H/ih),contain=Math.min(W/iw,H/ih);
 if(mode==='natural'){g.drawImage(bmp,0,0,W,H);}else if(mode==='fit'){ // soft blurred backdrop, then the whole image with nothing cropped
  const bw=iw*cover,bh=ih*cover;g.filter='blur(28px) saturate(1.15)';g.drawImage(bmp,(W-bw)/2,(H-bh)/2,bw,bh);g.filter='none';g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,W,H);
  const w=iw*contain,h=ih*contain;g.shadowColor='rgba(0,0,0,.18)';g.shadowBlur=24;g.drawImage(bmp,(W-w)/2,(H-h)/2,w,h);g.shadowBlur=0;
 }else{ // fill the frame, cropping the edges
  const w=iw*cover,h=ih*cover,y=focus==='top'?0:focus==='bottom'?H-h:(H-h)/2;g.drawImage(bmp,(W-w)/2,y,w,h);
 }
 const enc=(type,q)=>new Promise(r=>c.toBlob(r,type,q));
 let blob=await enc('image/webp',.82);if(!blob||blob.type!=='image/webp')blob=await enc('image/jpeg',.86);
 return {blob,url:URL.createObjectURL(blob),before:file.size,after:blob.size,from:`${iw}×${ih}`};
}
const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';

S.ads=async()=>{
 await loadAdData();
 if(!ready())return head('Ads','Upload ads for local businesses and choose where they appear.')+upgradeNotice();
 const f=state.adf||'all',cf=state.adClient||'';
 const all=(Live.ads||[]).filter(a=>!cf||a.client_id===cf);
 const list=all.filter(a=>f==='all'||adStatus(a)===f);
 const lim=A.adLimit(),liveBy=k=>(Live.ads||[]).filter(a=>a.spot===k&&adStatus(a)==='live').length;
 return head('Ads',`Upload an image, add the details and pick the dates. Ads appear on the site automatically while they're live. Up to ${lim} ads can run at once in each placement: ${Object.entries(SPOTS).map(([k,t])=>`${t.split(' ')[0]} ${liveBy(k)}/${lim}`).join(' · ')}.`,`<button class="btn btn-primary" data-ad-new>${icon('plus')}New ad</button>`)+
 `<div class="row between" style="margin-bottom:16px"><div class="tabs">${[['all','All'],['live','Live'],['scheduled','Scheduled'],['paused','Paused'],['ended','Ended']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="adf" data-val="${k}">${t}<span class="count">${k==='all'?all.length:all.filter(a=>adStatus(a)===k).length}</span></button>`).join('')}</div>${cf?`<button class="btn btn-ghost btn-sm" data-state="adClient" data-val="">Showing ${esc(clientName(cf))} · show all</button>`:''}</div>
 <div class="grid g3">${list.map(a=>{const st=AD_LABEL[adStatus(a)];return `<article class="card ad-admin-card" data-ad="${esc(a.id)}"><div class="ad-thumb">${a.image?`<img src="${esc(a.image)}" alt="">`:`<span>${icon('image')}No image</span>`}<span class="st ${st[1]}">${st[0]}</span></div><h3 style="margin:14px 0 4px">${esc(a.title)}</h3><p class="small muted" style="margin:0">${esc(clientName(a.client_id))} · ${esc(SPOTS[a.spot]||a.spot)}</p><p class="small" style="margin:6px 0 14px">${d(a.starts)} – ${d(a.ends)}</p><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-ad-act="edit">Edit</button><button class="btn btn-ghost btn-sm" data-ad-act="toggle">${a.active?'Pause':'Resume'}</button><button class="btn btn-ghost btn-sm" data-ad-act="invoice">Invoice</button><button class="btn btn-danger btn-sm" data-ad-act="delete" aria-label="Delete ad">${icon('trash')}</button></div></article>`;}).join('')||`<div style="grid-column:1/-1">${empty('No ads here yet','Create an ad for a client: upload their image, write a line about them and choose the dates.')}</div>`}</div>`;
};

async function adEditor(ad,preset){
 await loadAdData();
 if(!clients.length&&!ad){if(await confirmBox({title:'Add a client first',text:'Every ad belongs to an advertising client so you can invoice them. Add the client now?',label:'Add client'}))return clientEditor(null,true);return;}
 const a=ad||{spot:'home',starts:A.todayISO(),ends:A.addDays(A.todayISO(),6),active:true,client_id:preset?.client_id||clients[0]?.id};
 let img=null,src=a.image||null,mode='fill',focus='center',file=null,adSize=AD_SIZES[a.size]?a.size:'standard';
 document.getElementById('ad-editor')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='ad-editor';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box ad-editor" role="dialog" aria-labelledby="ae-t"><div class="modal-head"><h3 id="ae-t">${ad?'Edit ad':'New ad'}</h3><button class="icon-btn" data-ae="close" aria-label="Close">${icon('close')}</button></div>
 <form id="ae-form" class="ad-editor-grid">
  <div class="stack">
   <label class="dropzone ad-drop" id="ae-drop"><input type="file" accept="image/*" id="ae-file" class="sr"><span>${icon('upload')}</span><b>Drop the ad image here or click to upload</b><span class="small muted" id="ae-size-note">Any size or shape. It's resized and compressed automatically for the ad size you choose.</span></label>
   <div><span class="f" style="font-weight:600">Ad size</span><div class="ae-sizes" role="radiogroup" aria-label="Ad size">${Object.entries(AD_SIZES).map(([k,[t,w,h,n]])=>`<button type="button" role="radio" aria-checked="${k===adSize}" class="ae-size${k===adSize?' on':''}" data-size="${k}"><i style="aspect-ratio:${w}/${h}"></i><b>${t}</b><small>${w} × ${h}</small><small>${n}</small></button>`).join('')}</div></div>
   <div class="row ae-modes"><div class="tabs" role="group" aria-label="How to fit the image"><button type="button" class="on" data-mode="fill">Fill & crop</button><button type="button" data-mode="fit">Fit whole image</button></div><div class="tabs" role="group" aria-label="Crop position" id="ae-focus"><button type="button" data-focus="top">Top</button><button type="button" class="on" data-focus="center">Centre</button><button type="button" data-focus="bottom">Bottom</button></div></div>
   <p class="small muted" id="ae-size">${src?'Current image. Upload a new one to replace it.':'Tip: use "Fit whole image" for logos and posters with text so nothing gets cut off.'}</p>
   <div class="ae-preview-label small muted">Live preview</div>
   <div id="ae-preview" class="ae-preview"></div>
  </div>
  <div class="stack">
   <label class="f">Client<select class="input" name="client_id">${clients.map(c=>`<option value="${esc(c.id)}" ${c.id===a.client_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>
   <label class="f">Business name shown<input class="input" name="title" required maxlength="120" value="${esc(a.title||clientName(a.client_id)||'')}"></label>
   <label class="f">Category<input class="input" name="category" maxlength="60" value="${esc(a.category||'')}" placeholder="e.g. Catamaran cruise"></label>
   <label class="f">Short description<span class="hint">One or two sentences, up to 160 characters</span><textarea class="input" name="blurb" maxlength="160" rows="3">${esc(a.blurb||'')}</textarea></label>
   <label class="f">Website or booking link (optional)<input class="input" name="url" type="url" maxlength="300" value="${esc(a.url||'')}" placeholder="https://"></label>
   <label class="f">Where it appears<select class="input" name="spot">${Object.entries(SPOTS).map(([k,t])=>`<option value="${k}" ${k===a.spot?'selected':''}>${t}</option>`).join('')}</select></label>
   <div><span class="f" style="font-weight:600">Package</span><div class="row" style="gap:6px;margin-top:6px">${PACKAGES.slice(0,3).map(([n,price,days])=>`<button type="button" class="chip" data-days="${days}">${esc(n.replace(' ad',''))} · ${A.money(price)}</button>`).join('')}</div></div>
   <div class="form-grid"><label class="f">Starts<input class="input" type="date" name="starts" required value="${esc(a.starts)}"></label><label class="f">Ends<input class="input" type="date" name="ends" required value="${esc(a.ends)}"></label></div>
   <label class="row small"><span class="switch"><input type="checkbox" name="active" ${a.active!==false?'checked':''}><span></span></span>Active (shows on the site between these dates)</label>
   <label class="ae-real check"><input type="checkbox" name="real" ${a.real_photo_confirmed?'checked':''}><span><b>Real images only.</b> I confirm this ad uses real, unedited photos of the actual business, food or product. No AI-generated or AI-edited images, and no stock photos presented as the real thing.</span></label>
   <p class="form-msg" id="ae-msg" role="alert"></p>
   <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-ae="close">Cancel</button><button class="btn btn-primary" type="submit" id="ae-save">${ad?'Save ad':'Create ad'}</button></div>
  </div>
 </form></div>`;
 document.body.appendChild(m);
 const form=m.querySelector('form'),prev=m.querySelector('#ae-preview'),size=m.querySelector('#ae-size'),msg=m.querySelector('#ae-msg');
 const preview=()=>{const v=Object.fromEntries(new FormData(form));prev.dataset.size=adSize;prev.innerHTML=A.partnerCard({name:v.title||'Business name',kind:v.category||'',blurb:v.blurb||'Your short description appears here.',url:v.url&&/^https:\/\//.test(v.url)?v.url:'',image:src&&/^(https:|blob:)/.test(src)?src:null,size:adSize}).replace('/^https:\\/\\//','');if(src&&src.startsWith('blob:')){const im=prev.querySelector('.partner-img');if(!im){prev.querySelector('.media')?.insertAdjacentHTML('afterbegin',`<img class="partner-img" src="${src}" alt="">`);prev.querySelector('.partner')?.classList.add('has-image');}}};
 async function process(){if(!file)return;size.textContent='Optimising…';const [,W,H]=AD_SIZES[adSize];try{img=await optimiseImage(file,{mode,focus,W,H});src=img.url;size.innerHTML=`<b>Optimised:</b> ${esc(img.from)} · ${kb(img.before)} → ${W}×${H} · ${kb(img.after)} ${img.blob.type==='image/webp'?'WebP':'JPEG'} (${Math.max(0,Math.round((1-img.after/img.before)*100))}% smaller)`;}catch(e){img=null;size.textContent=e.message;}preview();}
 m.querySelector('#ae-file').addEventListener('change',e=>{file=e.target.files[0];process();});
 const drop=m.querySelector('#ae-drop');['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,()=>drop.classList.remove('over')));drop.addEventListener('drop',e=>{e.preventDefault();file=e.dataTransfer.files[0];process();});
 m.addEventListener('click',e=>{
  if(e.target.closest('[data-ae=close]')||e.target===m){A.closeModal(m);setTimeout(()=>m.remove(),300);return;}
  const md=e.target.closest('[data-mode]');if(md){mode=md.dataset.mode;md.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===md));m.querySelector('#ae-focus').hidden=mode==='fit';process();}
  const fc=e.target.closest('[data-focus]');if(fc){focus=fc.dataset.focus;fc.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===fc));process();}
  const sz=e.target.closest('[data-size]');if(sz){adSize=sz.dataset.size;m.querySelectorAll('[data-size]').forEach(b=>{const on=b===sz;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});if(file)process();else{if(src&&a.size!==adSize)size.textContent='Upload the image again so it\'s resized for this ad size.';preview();}}
  const dy=e.target.closest('[data-days]');if(dy){form.elements.ends.value=A.addDays(form.elements.starts.value||A.todayISO(),Number(dy.dataset.days)-1);}
 });
 form.addEventListener('input',preview);
 form.elements.client_id.addEventListener('change',()=>{if(!form.elements.title.value.trim()||clients.some(c=>c.name===form.elements.title.value))form.elements.title.value=clientName(form.elements.client_id.value);preview();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();msg.textContent='';const v=Object.fromEntries(new FormData(form));
  if(!v.title.trim()){msg.textContent='Add the business name.';return;}
  if(v.url&&!/^https:\/\//.test(v.url)){msg.textContent='Links must start with https://';return;}
  if(!v.starts||!v.ends||v.ends<v.starts){msg.textContent='The end date must be on or after the start date.';return;}
  if(!img&&!a.image_path){msg.textContent='Upload an image for the ad.';return;}
  if(!form.elements.real.checked){msg.textContent='Confirm the ad uses real images only. AI-generated or AI-edited images are not allowed.';return;}
  if(!img&&a.image_path&&(a.size||'standard')!==adSize){msg.textContent='Upload the image again so it fits the new ad size.';return;}
  if(form.elements.active.checked){const lim=A.adLimit(),others=(Live.ads||[]).filter(o=>o.id!==ad?.id&&o.active&&o.spot===v.spot&&o.starts<=v.ends&&o.ends>=v.starts);let day=v.starts,full=null;for(let n=0;day<=v.ends&&n<400;n++,day=A.addDays(day,1)){if(others.filter(o=>o.starts<=day&&o.ends>=day).length>=lim){full=day;break;}}
   if(full){msg.textContent=`${SPOTS[v.spot]} already has ${lim} ads running on ${d(full)}. Choose other dates or another placement, pause an ad, or change the limit in Site settings.`;return;}}
  const btn=m.querySelector('#ae-save');btn.disabled=true;btn.classList.add('is-loading');
  try{let image_path;if(img){image_path=await Live.admin.uploadAdImage(img.blob);}
   await Live.admin.saveAd({id:ad?.id,client_id:v.client_id,title:v.title,category:v.category.trim(),blurb:v.blurb.trim(),url:v.url.trim(),spot:v.spot,starts:v.starts,ends:v.ends,active:form.elements.active.checked,size:adSize,real_photo_confirmed:true,...(image_path?{image_path}:{})});
   await Live.admin.log(ad?'Edited ad':'Created ad',v.title,{spot:v.spot,starts:v.starts,ends:v.ends,size:adSize});
   A.closeModal(m);setTimeout(()=>m.remove(),300);A.toast(ad?'Ad saved':'Ad created');draw();
  }catch(err){msg.textContent=Live.error(err);}finally{btn.disabled=false;btn.classList.remove('is-loading');}
 });
 preview();A.openModal('ad-editor');
}

S.clients=async()=>{
 await loadAdData(true);
 if(!ready())return head('Ad clients','Businesses that advertise on BimCar Connect.')+upgradeNotice();
 const q=(state.q||'').toLowerCase(),list=clients.filter(c=>!q||`${c.name} ${c.contact_name||''} ${c.email||''}`.toLowerCase().includes(q));
 const stats=id=>{const inv=invoices.filter(i=>i.client_id===id&&i.status!=='void');const billed=inv.reduce((n,i)=>n+invTotals(i).total,0),paid=inv.filter(i=>i.status==='paid').reduce((n,i)=>n+invTotals(i).total,0);const ads=(Live.ads||[]).filter(a=>a.client_id===id);return {billed,paid,owing:billed-paid-inv.filter(i=>i.status==='draft').reduce((n,i)=>n+invTotals(i).total,0),ads:ads.length,live:ads.filter(a=>adStatus(a)==='live').length};};
 return head('Ad clients','Businesses that advertise with you, their ads and what they owe.',`<button class="btn btn-ghost" data-export="clients">${icon('doc')}Export CSV</button><button class="btn btn-ghost" data-draw>${icon('star')}Free article draw</button><button class="btn btn-primary" data-cl-new>${icon('plus')}Add client</button>`)+
 `<div class="row between" style="margin-bottom:16px"><span class="small muted">${clients.length} client${clients.length===1?'':'s'}</span><input class="input" data-search placeholder="Search clients" value="${esc(state.q||'')}" style="max-width:260px"></div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Client</th><th>Contact</th><th>Ads</th><th>Invoiced</th><th>Owing</th><th></th></tr></thead><tbody>${list.map(c=>{const st=stats(c.id);return `<tr data-cl="${esc(c.id)}"><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="co-avatar">${esc(A.initials(c.name))}</span><div style="min-width:0"><b>${esc(c.name)}</b>${c.notes?`<div class="small muted">${esc(c.notes.slice(0,70))}</div>`:''}</div></div></td><td class="small">${esc(c.contact_name||'')}<br>${c.email?`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:''}${c.phone?`<br>${esc(c.phone)}`:''}</td><td class="small"><a href="#ads" data-cl-act="ads">${st.ads} ad${st.ads===1?'':'s'}</a><br><span class="muted">${st.live} live</span></td><td>${bbd(st.billed)}<div class="small muted">${bbd(st.paid)} paid</div></td><td>${st.owing>0?`<b style="color:#B4183C">${bbd(st.owing)}</b>`:'<span class="st st-ok">Paid up</span>'}</td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-cl-act="ad">New ad</button><button class="btn btn-ghost btn-sm" data-cl-act="invoice">New invoice</button><details class="admin-menu"><summary class="btn btn-ghost btn-sm">More ${icon('chevronD')}</summary><div><button data-cl-act="edit">Edit client</button>${c.email?`<a href="mailto:${esc(c.email)}">Email client</a>`:''}<button data-cl-act="delete" class="danger">Delete client…</button></div></details></div></td></tr>`;}).join('')||`<tr><td colspan="6">${empty('No clients yet','Add a business that wants to advertise, or convert an advertising enquiry from Reports.')}</td></tr>`}</tbody></table></div>`;
};
async function clientEditor(c,thenAd,prefill){
 c=c||prefill||{};
 const v=await formBox(c.id?`Edit ${c.name}`:'Add client',[{name:'name',label:'Business name',value:c.name},{name:'contact_name',label:'Contact person',value:c.contact_name},{name:'email',label:'Email',type:'email',value:c.email},{name:'phone',label:'Phone / WhatsApp',value:c.phone},{name:'address',label:'Billing address (shown on invoices)',value:c.address,full:true},{name:'notes',label:'Notes (private)',type:'textarea',value:c.notes,full:true}],c.id?'Save client':'Add client');
 if(!v)return;if(!v.name.trim()){A.toast('Add the business name');return;}
 try{const saved=await Live.admin.saveClient({...v,id:c.id});await Live.admin.log(c.id?'Edited client':'Added client',v.name);clients=null;await loadAdData(true);A.toast(c.id?'Client saved':'Client added');if(thenAd)return adEditor(null,{client_id:saved.id});draw();return saved;}catch(e){A.toast(Live.error(e));}
}

S.invoices=async()=>{
 await loadAdData(true);
 if(!ready())return head('Invoices','Create and track invoices for advertising.')+upgradeNotice();
 const f=state.invf||'all',t=A.todayISO(),month=t.slice(0,7);
 const live=invoices.filter(i=>i.status!=='void');
 const owing=live.filter(i=>['sent'].includes(i.status)).reduce((n,i)=>n+invTotals(i).total,0),paidMonth=live.filter(i=>i.status==='paid'&&String(i.paid_at||'').slice(0,7)===month).reduce((n,i)=>n+invTotals(i).total,0);
 const list=invoices.filter(i=>f==='all'||invStatus(i)===f);
 return head('Invoices','Branded invoices for advertising. Print or save as PDF, email, and track payment.',`<button class="btn btn-ghost" data-inv-profile>${icon('settings')}Invoice details</button><button class="btn btn-primary" data-inv-new>${icon('plus')}New invoice</button>`)+
 `<div class="kpis" style="margin-bottom:22px">${kpi('Waiting for payment',bbd(owing),`${live.filter(i=>i.status==='sent').length} sent invoice${live.filter(i=>i.status==='sent').length===1?'':'s'}`,true)}${kpi('Paid this month',bbd(paidMonth),'Recorded as paid')}${kpi('Overdue',live.filter(i=>invStatus(i)==='overdue').length,'Past their due date')}${kpi('Drafts',live.filter(i=>i.status==='draft').length,'Not sent yet')}</div>
 <div class="tabs" style="margin-bottom:16px">${[['all','All'],['draft','Drafts'],['sent','Sent'],['overdue','Overdue'],['paid','Paid'],['void','Void']].map(([k,tt])=>`<button class="${f===k?'on':''}" data-state="invf" data-val="${k}">${tt}<span class="count">${k==='all'?invoices.length:invoices.filter(i=>invStatus(i)===k).length}</span></button>`).join('')}</div>
 <div class="table-wrap"><table class="t"><thead><tr><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${list.map(i=>{const s=INV_LABEL[invStatus(i)];return `<tr data-inv="${esc(i.id)}"><td><b>${esc(i.number)}</b><div class="small muted">${esc((i.items||[])[0]?.description||'')}${(i.items||[]).length>1?` +${i.items.length-1} more`:''}</div></td><td>${esc(i.client_snapshot?.name||clientName(i.client_id))}</td><td class="small">${d(i.issued)}</td><td class="small">${d(i.due)}</td><td><b>${bbd(invTotals(i).total)}</b></td><td><span class="st ${s[1]}">${s[0]}</span></td><td><div class="row" style="flex-wrap:nowrap;gap:6px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-inv-act="view">View & print</button>${i.status==='sent'?`<button class="btn btn-primary btn-sm" data-inv-act="paid">Mark paid</button>`:i.status==='draft'?`<button class="btn btn-primary btn-sm" data-inv-act="sent">Mark sent</button>`:''}<details class="admin-menu"><summary class="btn btn-ghost btn-sm">More ${icon('chevronD')}</summary><div><button data-inv-act="edit">Edit</button><button data-inv-act="email">Email to client</button><button data-inv-act="copy">Duplicate</button>${i.status!=='void'?`<button data-inv-act="void">Void invoice</button>`:''}<button data-inv-act="delete" class="danger">Delete…</button></div></details></div></td></tr>`;}).join('')||`<tr><td colspan="7">${empty('No invoices yet','Create one from here, from a client, or from an ad.')}</td></tr>`}</tbody></table></div>`;
};

function profile(){return {business:'BimCar Connect',address:'Barbados',email:Live.settings.contact?.email||'',phone:Live.settings.contact?.phone||'',payment:'',footer:'Thank you for advertising with BimCar Connect.',...(privateSettings.invoice_profile||{})};}
function invoiceHTML(inv){
 const p=profile(),c=inv.client_snapshot&&inv.client_snapshot.name?inv.client_snapshot:((clients||[]).find(x=>x.id===inv.client_id)||{}),t=invTotals(inv),st=invStatus(inv);
 return `<div class="invoice-doc"><div class="inv-band"></div><header class="inv-head"><div><img src="img/brand/bimcar-connect.png" alt="BimCar Connect" class="inv-logo"><div class="inv-from"><b>${esc(p.business)}</b><br>${esc(p.address||'').replace(/\n/g,'<br>')}${p.email?`<br>${esc(p.email)}`:''}${p.phone?`<br>${esc(p.phone)}`:''}</div></div><div class="inv-meta"><h1>Invoice</h1><table><tr><td>Invoice no.</td><td><b>${esc(inv.number||'Draft')}</b></td></tr><tr><td>Issued</td><td>${d(inv.issued)}</td></tr>${inv.due?`<tr><td>Due</td><td>${d(inv.due)}</td></tr>`:''}<tr><td>Status</td><td><span class="inv-status is-${st}">${INV_LABEL[st][0]}</span></td></tr></table></div></header>
 <section class="inv-to"><span>Bill to</span><b>${esc(c.name||'—')}</b>${c.contact_name?`<div>${esc(c.contact_name)}</div>`:''}${c.address?`<div>${esc(c.address)}</div>`:''}${c.email?`<div>${esc(c.email)}</div>`:''}${c.phone?`<div>${esc(c.phone)}</div>`:''}</section>
 <table class="inv-items"><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${(inv.items||[]).map(i=>`<tr><td>${esc(i.description)}</td><td>${esc(i.qty)}</td><td>${bbd(i.price)}</td><td>${bbd((Number(i.qty)||0)*(Number(i.price)||0))}</td></tr>`).join('')}</tbody></table>
 <div class="inv-totals"><div><span>Subtotal</span><span>${bbd(t.sub)}</span></div>${t.disc?`<div><span>Discount</span><span>−${bbd(t.disc)}</span></div>`:''}${Number(inv.tax_rate)?`<div><span>Tax (${esc(inv.tax_rate)}%)</span><span>${bbd(t.tax)}</span></div>`:''}<div class="inv-grand"><span>Total due</span><span>${bbd(t.total)}</span></div><div class="small muted">US$${(t.total/A.RATE).toFixed(2)} at BBD $2 = US$1</div></div>
 ${p.payment?`<section class="inv-pay"><b>How to pay</b><div>${esc(p.payment).replace(/\n/g,'<br>')}</div></section>`:''}
 ${inv.notes?`<section class="inv-notes"><b>Notes</b><div>${esc(inv.notes).replace(/\n/g,'<br>')}</div></section>`:''}
 <footer class="inv-foot">${esc(p.footer||'')}</footer></div>`;
}
function viewInvoice(inv){
 document.getElementById('inv-view')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='inv-view';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box inv-modal" role="dialog" aria-label="Invoice ${esc(inv.number)}"><div class="modal-head no-print"><h3>${esc(inv.number)}</h3><div class="row"><button class="btn btn-primary btn-sm" data-iv="print">${icon('doc')}Print / Save as PDF</button><button class="btn btn-ghost btn-sm" data-iv="email">${icon('mail')}Email</button><button class="icon-btn" data-iv="close" aria-label="Close">${icon('close')}</button></div></div><div id="inv-sheet">${invoiceHTML(inv)}</div></div>`;
 document.body.appendChild(m);
 m.addEventListener('click',e=>{const b=e.target.closest('[data-iv]');if(!b&&e.target!==m)return;const k=b?.dataset.iv||'close';if(k==='close'){A.closeModal(m);setTimeout(()=>m.remove(),300);}if(k==='print'){document.body.classList.add('printing-invoice');window.print();setTimeout(()=>document.body.classList.remove('printing-invoice'),600);}if(k==='email')emailInvoice(inv);});
 A.openModal('inv-view');
}
function emailInvoice(inv){
 const c=inv.client_snapshot?.email?inv.client_snapshot:((clients||[]).find(x=>x.id===inv.client_id)||{}),p=profile(),t=invTotals(inv);
 if(!c.email){A.toast('Add an email address to this client first');return;}
 const lines=(inv.items||[]).map(i=>`- ${i.description}: ${i.qty} × ${bbd(i.price)}`).join('\n');
 const body=`Hi ${(c.contact_name||c.name||'').split(' ')[0]},\n\nPlease find invoice ${inv.number} from ${p.business} below.\n\n${lines}\n\nTotal due: ${bbd(t.total)}${inv.due?`\nDue by: ${d(inv.due)}`:''}${p.payment?`\n\nHow to pay:\n${p.payment}`:''}\n\nA PDF copy is attached.\n\nThank you,\n${p.business}`;
 location.href=`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(`Invoice ${inv.number} from ${p.business}`)}&body=${encodeURIComponent(body)}`;
 A.toast('Tip: use "Print / Save as PDF" first, then attach the PDF to the email.');
}
async function invoiceEditor(inv,preset){
 await loadAdData();
 if(!clients.length){if(await confirmBox({title:'Add a client first',text:'Invoices are addressed to an advertising client. Add one now?',label:'Add client'}))await clientEditor(null);if(!clients.length)return;}
 const today=A.todayISO();
 const x=inv?structuredClone(inv):{client_id:preset?.client_id||clients[0].id,issued:today,due:A.addDays(today,14),items:preset?.items||[],discount:0,tax_rate:0,notes:'',status:'draft'};
 if(!x.items.length)x.items=[{description:'Weekly ad',qty:1,price:140}];
 document.getElementById('inv-editor')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='inv-editor';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box inv-editor" role="dialog" aria-labelledby="ie-t"><div class="modal-head"><h3 id="ie-t">${inv?'Edit '+esc(inv.number):'New invoice'}</h3><button class="icon-btn" data-ie="close" aria-label="Close">${icon('close')}</button></div>
 <form id="ie-form" class="stack"><div class="form-grid"><label class="f">Client<select class="input" name="client_id">${clients.map(c=>`<option value="${esc(c.id)}" ${c.id===x.client_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label class="f">Status<select class="input" name="status">${['draft','sent','paid','void'].map(s=>`<option value="${s}" ${s===x.status?'selected':''}>${INV_LABEL[s][0]}</option>`).join('')}</select></label><label class="f">Issued<input class="input" type="date" name="issued" required value="${esc(x.issued)}"></label><label class="f">Due<input class="input" type="date" name="due" value="${esc(x.due||'')}"></label></div>
 <div><div class="row between"><b>Items</b><div class="row" style="gap:6px">${PACKAGES.map(([n,p])=>`<button type="button" class="chip" data-pkg="${esc(n)}" data-price="${p}">+ ${esc(n.replace(' (design)',''))}</button>`).join('')}</div></div>
 <table class="inv-edit-items"><thead><tr><th>Description</th><th>Qty</th><th>Unit price (BBD)</th><th>Amount</th><th></th></tr></thead><tbody id="ie-items"></tbody></table><button type="button" class="btn btn-ghost btn-sm" data-ie="add">${icon('plus')}Add line</button></div>
 <div class="form-grid"><label class="f">Discount (BBD)<input class="input" type="number" min="0" step="0.01" name="discount" value="${esc(x.discount||0)}"></label><label class="f">Tax rate (%)<span class="hint">Leave at 0 unless you charge VAT</span><input class="input" type="number" min="0" max="100" step="0.01" name="tax_rate" value="${esc(x.tax_rate||0)}"></label></div>
 <label class="f">Notes on the invoice (optional)<textarea class="input" name="notes" maxlength="1500" rows="3" placeholder="e.g. Campaign runs 1–7 December on the homepage">${esc(x.notes||'')}</textarea></label>
 <div class="inv-edit-total" id="ie-total"></div><p class="form-msg" id="ie-msg" role="alert"></p>
 <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-ie="close">Cancel</button><button type="button" class="btn btn-ghost" data-ie="preview">Preview</button><button class="btn btn-primary" type="submit" id="ie-save">${inv?'Save invoice':'Create invoice'}</button></div></form></div>`;
 document.body.appendChild(m);
 const form=m.querySelector('form'),rows=m.querySelector('#ie-items');
 const drawItems=()=>{rows.innerHTML=x.items.map((it,i)=>`<tr data-i="${i}"><td><input class="input" data-k="description" value="${esc(it.description)}" maxlength="200" aria-label="Description"></td><td><input class="input" data-k="qty" type="number" min="0" step="1" value="${esc(it.qty)}" aria-label="Quantity" style="width:80px"></td><td><input class="input" data-k="price" type="number" min="0" step="0.01" value="${esc(it.price)}" aria-label="Unit price" style="width:120px"></td><td class="small">${bbd((Number(it.qty)||0)*(Number(it.price)||0))}</td><td><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remove line">${icon('trash')}</button></td></tr>`).join('');totals();};
 const read=()=>{const v=Object.fromEntries(new FormData(form));return {...x,client_id:v.client_id,status:v.status,issued:v.issued,due:v.due,discount:Number(v.discount)||0,tax_rate:Number(v.tax_rate)||0,notes:v.notes.trim(),items:x.items.filter(i=>String(i.description).trim())};};
 const totals=()=>{const t=invTotals(read());m.querySelector('#ie-total').innerHTML=`<span>Subtotal ${bbd(t.sub)}</span>${t.disc?`<span>Discount −${bbd(t.disc)}</span>`:''}${t.tax?`<span>Tax ${bbd(t.tax)}</span>`:''}<b>Total ${bbd(t.total)}</b>`;};
 rows.addEventListener('input',e=>{const tr=e.target.closest('[data-i]');if(!tr)return;const it=x.items[+tr.dataset.i];it[e.target.dataset.k]=e.target.dataset.k==='description'?e.target.value:Number(e.target.value);tr.children[3].textContent=bbd((Number(it.qty)||0)*(Number(it.price)||0));totals();});
 form.addEventListener('input',e=>{if(!e.target.closest('#ie-items'))totals();});
 m.addEventListener('click',e=>{
  const k=e.target.closest('[data-ie]')?.dataset.ie;
  if(k==='close'||e.target===m){A.closeModal(m);setTimeout(()=>m.remove(),300);return;}
  if(k==='add'){x.items.push({description:'',qty:1,price:0});drawItems();rows.querySelector('tr:last-child input')?.focus();return;}
  if(k==='preview'){viewInvoice({...read(),number:inv?.number||'Draft',client_snapshot:clients.find(c=>c.id===form.elements.client_id.value)||{}});return;}
  const pk=e.target.closest('[data-pkg]');if(pk){x.items.push({description:pk.dataset.pkg,qty:1,price:Number(pk.dataset.price)});drawItems();return;}
  const rm=e.target.closest('[data-rm]');if(rm){x.items.splice(+rm.dataset.rm,1);drawItems();}
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();const v=read(),msg=m.querySelector('#ie-msg');msg.textContent='';
  if(!v.items.length){msg.textContent='Add at least one item.';return;}
  if(v.due&&v.due<v.issued){msg.textContent='The due date can\'t be before the issue date.';return;}
  const btn=m.querySelector('#ie-save');btn.disabled=true;btn.classList.add('is-loading');
  try{const c=clients.find(cl=>cl.id===v.client_id)||{};const saved=await Live.admin.saveInvoice({...v,client_snapshot:{name:c.name,contact_name:c.contact_name,email:c.email,phone:c.phone,address:c.address}});await Live.admin.log(inv?'Edited invoice':'Created invoice',saved.number,{total:invTotals(saved).total});invoices=null;A.closeModal(m);setTimeout(()=>m.remove(),300);A.toast(inv?'Invoice saved':`Invoice ${saved.number} created`);if(location.hash!=='#invoices')location.hash='invoices';else draw();}
  catch(err){msg.textContent=Live.error(err);}finally{btn.disabled=false;btn.classList.remove('is-loading');}
 });
 drawItems();A.openModal('inv-editor');
}
async function invoiceAction(id,act,btn){
 const inv=invoices.find(i=>i.id===id);if(!inv)return;
 if(act==='view')return viewInvoice(inv);
 if(act==='edit')return invoiceEditor(inv);
 if(act==='email')return emailInvoice(inv);
 if(act==='copy')return invoiceEditor({...inv,id:undefined,number:undefined,status:'draft',issued:A.todayISO(),due:A.addDays(A.todayISO(),14),paid_at:null});
 if(act==='paid'||act==='sent'||act==='void'){if(act==='void'&&!await confirmBox({title:`Void ${inv.number}?`,text:'The invoice stays on record but no longer counts as owed.',label:'Void invoice',danger:true}))return;return run(btn,async()=>{await Live.admin.saveInvoice({...inv,status:act});await Live.admin.log(`Marked invoice ${act}`,inv.number);invoices=null;},act==='paid'?'Marked as paid':act==='sent'?'Marked as sent':'Invoice voided');}
 if(act==='delete'){if(!await confirmBox({title:`Delete ${inv.number}?`,text:'The invoice is removed permanently. To keep a record, void it instead.',label:'Delete invoice',danger:true}))return;return run(btn,async()=>{await Live.admin.deleteInvoice(id);await Live.admin.log('Deleted invoice',inv.number);invoices=null;},'Invoice deleted');}
}
async function invoiceProfile(){
 await loadPrivate();const p=profile();
 const v=await formBox('Invoice details',[{name:'business',label:'Business name on invoices',value:p.business},{name:'email',label:'Email',type:'email',value:p.email},{name:'phone',label:'Phone',value:p.phone},{name:'address',label:'Business address',type:'textarea',value:p.address,full:true},{name:'payment',label:'How to pay (bank details, payment link…)',type:'textarea',value:p.payment,full:true},{name:'footer',label:'Footer message',value:p.footer,full:true}],'Save details');
 if(!v)return;try{await Live.admin.saveSetting('invoice_profile',v,false);privateSettings.invoice_profile=v;await Live.admin.log('Updated invoice details','');A.toast('Invoice details saved');}catch(e){A.toast(Live.error(e));}
}
root.addEventListener('click',async e=>{
 const t=e.target;
 if(t.closest('[data-ad-new]'))return adEditor(null);
 if(t.closest('[data-cl-new]'))return clientEditor(null);
 if(t.closest('[data-inv-new]'))return invoiceEditor(null);
 if(t.closest('[data-inv-profile]'))return invoiceProfile();
 const ad=t.closest('[data-ad-act]');if(ad){const id=ad.closest('[data-ad]').dataset.ad,a=(Live.ads||[]).find(x=>x.id===id);if(!a)return;const act=ad.dataset.adAct;
  if(act==='edit')return adEditor(a);
  if(act==='toggle')return run(ad,async()=>{await Live.admin.saveAd({...a,active:!a.active});await Live.admin.log(a.active?'Paused ad':'Resumed ad',a.title);},a.active?'Ad paused':'Ad resumed');
  if(act==='invoice'){const days=Math.round((new Date(a.ends)-new Date(a.starts))/864e5)+1,pk=days>=28?PACKAGES[2]:days>=7?PACKAGES[1]:PACKAGES[0],qty=pk[2]===30?Math.max(1,Math.round(days/30)):pk[2]===7?Math.max(1,Math.round(days/7)):days;return invoiceEditor(null,{client_id:a.client_id,items:[{description:`${pk[0]}: ${a.title}, ${SPOTS[a.spot]}, ${d(a.starts)} – ${d(a.ends)}`,qty,price:pk[1]}]});}
  if(act==='delete'){if(!await confirmBox({title:`Delete the ad for ${a.title}?`,text:'It disappears from the site and its image is deleted. Invoices are kept.',label:'Delete ad',danger:true}))return;return run(ad,async()=>{await Live.admin.deleteAd(id);await Live.admin.log('Deleted ad',a.title);},'Ad deleted');}
 }
 const cl=t.closest('[data-cl-act]');if(cl){t.closest('details')?.removeAttribute('open');const id=cl.closest('[data-cl]').dataset.cl,c=clients.find(x=>x.id===id);const act=cl.dataset.clAct;
  if(act==='ads'){e.preventDefault();state.adClient=id;location.hash='ads';return;}
  if(act==='ad')return adEditor(null,{client_id:id});
  if(act==='invoice')return invoiceEditor(null,{client_id:id});
  if(act==='edit')return clientEditor(c);
  if(act==='delete'){if(!await confirmBox({title:`Delete ${c.name}?`,text:'The client is removed. Their ads and invoices stay but will show "No client". To stop their ads, pause or delete them in Ads.',label:'Delete client',danger:true}))return;return run(cl,async()=>{await Live.admin.deleteClient(id);await Live.admin.log('Deleted client',c.name);clients=null;},'Client deleted');}
 }
 const iv=t.closest('[data-inv-act]');if(iv){t.closest('details')?.removeAttribute('open');return invoiceAction(iv.closest('[data-inv]').dataset.inv,iv.dataset.invAct,iv);}
 const conv=t.closest('[data-inq-client]');if(conv){const r=(Live.inquiries||[]).find(x=>x.id===conv.dataset.inqClient),p=r?.payload||{},contact=p.contact||'';return clientEditor(null,false,{name:p.business||p.name||'',contact_name:p.contactName||p.name||'',email:/@/.test(contact)?contact:'',phone:/@/.test(contact)?'':contact,notes:[p.package&&`Package: ${p.package}`,p.placement&&`Placement: ${p.placement}`,p.startDate&&`Start: ${p.startDate}`,p.message].filter(Boolean).join('\n')});}
});


/* Free article draw: one entry per paid Weekly or Monthly campaign in the chosen month. */
async function articleDraw(){
 await loadAdData(true);await loadPrivate();
 const month=A.todayISO().slice(0,7);
 const entriesFor=m=>{const out=[];invoices.filter(i=>i.status==='paid'&&String(i.paid_at||i.issued).slice(0,7)===m).forEach(i=>(i.items||[]).forEach(it=>{if(/weekly|monthly/i.test(it.description||'')){for(let k=0;k<Math.max(1,Math.min(10,Number(it.qty)||1));k++)out.push({client_id:i.client_id,name:i.client_snapshot?.name||clientName(i.client_id),invoice:i.number});}}));return out;};
 const past=(privateSettings.article_draws||[]).slice(-6).reverse();
 document.getElementById('draw-box')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='draw-box';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box" role="dialog" aria-labelledby="dr-t" style="width:min(560px,100%)"><div class="modal-head"><h3 id="dr-t">Free article draw</h3><button class="icon-btn" data-dr="close" aria-label="Close">${icon('close')}</button></div><p class="small muted">Every Weekly or Monthly campaign that's been <b>paid</b> (invoice marked Paid) in the month gets one entry.</p><label class="f" style="max-width:220px">Month<input class="input" type="month" id="dr-month" value="${month}" max="${month}"></label><div id="dr-list" style="margin:14px 0"></div><div id="dr-result"></div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost" data-dr="close">Close</button><button class="btn btn-primary" data-dr="go">${icon('star')}Draw a winner</button></div>${past.length?`<h4 style="margin:22px 0 6px">Past winners</h4>${past.map(w=>`<div class="small">${esc(w.month)}: <b>${esc(w.name)}</b> <span class="muted">(${w.entries} entries)</span></div>`).join('')}`:''}</div>`;
 document.body.appendChild(m);
 const list=()=>{const e=entriesFor(m.querySelector('#dr-month').value),by={};e.forEach(x=>by[x.name]=(by[x.name]||0)+1);m.querySelector('#dr-list').innerHTML=e.length?`<b>${e.length} entr${e.length===1?'y':'ies'}</b><div class="stack small" style="margin-top:8px">${Object.entries(by).map(([n,c])=>`<div class="row between"><span>${esc(n)}</span><span class="muted">${c} entr${c===1?'y':'ies'}</span></div>`).join('')}</div>`:'<p class="muted">No paid Weekly or Monthly campaigns in this month yet.</p>';m.querySelector('[data-dr=go]').disabled=!e.length;return e;};
 m.querySelector('#dr-month').addEventListener('change',()=>{m.querySelector('#dr-result').innerHTML='';list();});
 m.addEventListener('click',async e=>{const k=e.target.closest('[data-dr]')?.dataset.dr;
  if(k==='close'||e.target===m){A.closeModal(m);setTimeout(()=>m.remove(),300);return;}
  if(k==='go'){const entries=list();if(!entries.length)return;const r=new Uint32Array(1);crypto.getRandomValues(r);const win=entries[r[0]%entries.length],mon=m.querySelector('#dr-month').value,c=(clients||[]).find(x=>x.id===win.client_id)||{};
   const rec={month:mon,name:win.name,client_id:win.client_id,invoice:win.invoice,entries:entries.length,at:new Date().toISOString()};
   try{const hist=[...(privateSettings.article_draws||[]),rec].slice(-60);await Live.admin.saveSetting('article_draws',hist,false);privateSettings.article_draws=hist;await Live.admin.log('Free article draw',win.name,{month:mon,entries:entries.length});}catch(err){A.toast(Live.error(err));}
   m.querySelector('#dr-result').innerHTML=`<div class="draw-winner"><span>${icon('star')}</span><div><small>Winner for ${esc(mon)}</small><b>${esc(win.name)}</b><div class="small muted">From ${entries.length} entr${entries.length===1?'y':'ies'} · invoice ${esc(win.invoice)}</div></div></div><div class="row" style="margin-top:12px">${c.email?`<a class="btn btn-ghost btn-sm" href="mailto:${esc(c.email)}?subject=${encodeURIComponent('You won a free featured article on BimCar Connect!')}&body=${encodeURIComponent(`Hi ${(c.contact_name||c.name||'').split(' ')[0]},\n\nGreat news: ${c.name} has won this month's free featured article on the BimCar Connect Island Drives blog!\n\nReply with a few photos and a short description of what makes your business special, and we'll write the article and share it with you before it goes live.\n\nThe BimCar Connect team`)}">${icon('mail')}Email the winner</a>`:''}<button class="btn btn-primary btn-sm" data-dr="post">Start their article</button></div>`;
   m.dataset.winner=win.name;return;}
  if(k==='post'){A.closeModal(m);setTimeout(()=>m.remove(),300);location.hash='posts';setTimeout(()=>postEditor({title:`Featured: ${m.dataset.winner}`,slug:'',excerpt:'',category:'Featured business',body:'',status:'draft',published_at:A.todayISO(),author_name:Live.user.name||''}),400);}
 });
 list();A.openModal('draw-box');
}
root.addEventListener('click',e=>{if(e.target.closest('[data-draw]'))articleDraw();});
/* ---------- blog posts ---------- */
let posts=null;
const slugify=t=>String(t||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'post';
const postStatus=p=>p.status!=='published'?'draft':(p.published_at||'')>A.todayISO()?'scheduled':'published';
const POST_LABEL={draft:['Draft','st-done'],scheduled:['Scheduled','st-req'],published:['Published','st-ok']};
async function loadPosts(force){if(!ready())return;if(!posts||force){try{posts=(await Live.admin.posts()).map(p=>({...p,cover:p.cover_path?Live.adImageUrl(p.cover_path):null}));}catch{posts=[];}}}
S.posts=async()=>{
 await loadPosts(true);
 if(!ready())return head('Blog posts','Write and publish Island Drives articles.')+upgradeNotice();
 const f=state.pf||'all',list=posts.filter(p=>f==='all'||postStatus(p)===f);
 return head('Blog posts','Write Island Drives articles. Published posts appear on the blog straight away.',`<a class="btn btn-ghost" href="blog.html" target="_blank" rel="noopener">${icon('eye')}View blog</a><button class="btn btn-primary" data-post-new>${icon('plus')}New post</button>`)+
 `<div class="tabs" style="margin-bottom:16px">${[['all','All'],['published','Published'],['scheduled','Scheduled'],['draft','Drafts']].map(([k,t])=>`<button class="${f===k?'on':''}" data-state="pf" data-val="${k}">${t}<span class="count">${k==='all'?posts.length:posts.filter(p=>postStatus(p)===k).length}</span></button>`).join('')}</div>
 <div class="grid g3">${list.map(p=>{const s=POST_LABEL[postStatus(p)];return `<article class="card ad-admin-card" data-post="${esc(p.id)}"><div class="ad-thumb">${p.cover?`<img src="${esc(p.cover)}" alt="">`:`<span>${icon('image')}No cover image</span>`}<span class="st ${s[1]}">${s[0]}</span></div><span class="journal-category" style="display:block;margin-top:12px">${esc(p.category||'Island Drives')}</span><h3 style="margin:4px 0">${esc(p.title)}</h3><p class="small muted" style="margin:0 0 14px">${p.published_at?d(p.published_at):'Not published'} · ${Math.max(1,Math.round((p.body||'').split(/\s+/).length/200))} min read</p><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-post-act="edit">Edit</button><a class="btn btn-ghost btn-sm" href="post.html?p=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">${postStatus(p)==='published'?'View':'Preview'}</a>${p.status==='published'?`<button class="btn btn-ghost btn-sm" data-post-act="unpublish">Unpublish</button>`:`<button class="btn btn-primary btn-sm" data-post-act="publish">Publish</button>`}<button class="btn btn-danger btn-sm" data-post-act="delete" aria-label="Delete post">${icon('trash')}</button></div></article>`;}).join('')||`<div style="grid-column:1/-1">${empty('No posts yet','Write your first Island Drives article: a favourite drive, a beach stop or a local food spot.')}</div>`}</div>
 <p class="small muted" style="margin-top:18px">Your three original articles (Top 10 places, Three island drives, Beach bars) are built into the site and always show on the blog.</p>`;
};
async function postEditor(p){
 const x=p?{...p}:{title:'',slug:'',excerpt:'',category:'Island drives',body:'',status:'draft',published_at:A.todayISO(),author_name:Live.user.name||''};
 let cover=null,coverSrc=x.cover||null,slugTouched=!!p;
 document.getElementById('post-editor')?.remove();
 const m=document.createElement('div');m.className='modal';m.id='post-editor';m.setAttribute('aria-hidden','true');
 m.innerHTML=`<div class="modal-box post-editor" role="dialog" aria-labelledby="pe-t"><div class="modal-head"><h3 id="pe-t">${p?'Edit post':'New blog post'}</h3><button class="icon-btn" data-pe="close" aria-label="Close">${icon('close')}</button></div>
 <form id="pe-form" class="post-editor-grid">
  <div class="stack">
   <label class="f">Title<input class="input" name="title" required maxlength="160" value="${esc(x.title)}" placeholder="e.g. A Sunday drive up the east coast"></label>
   <div class="form-grid"><label class="f">Category<input class="input" name="category" maxlength="60" value="${esc(x.category||'')}" list="pe-cats"><datalist id="pe-cats"><option>Island drives</option><option>Places &amp; viewpoints</option><option>Food &amp; bar stops</option><option>Driving tips</option><option>News</option></datalist></label><label class="f">Web address<span class="hint">post.html?p=…</span><input class="input" name="slug" maxlength="80" value="${esc(x.slug)}" pattern="[a-z0-9]+(-[a-z0-9]+)*"></label></div>
   <label class="f">Summary<span class="hint">Shown on the blog card and under the title (up to 300 characters)</span><textarea class="input" name="excerpt" maxlength="300" rows="2">${esc(x.excerpt||'')}</textarea></label>
   <div><span class="f" style="font-weight:600">Article</span>
    <div class="pe-toolbar" role="toolbar" aria-label="Formatting"><button type="button" data-fmt="h2" title="Heading">H2</button><button type="button" data-fmt="h3" title="Subheading">H3</button><button type="button" data-fmt="bold" title="Bold"><b>B</b></button><button type="button" data-fmt="italic" title="Italic"><i>I</i></button><button type="button" data-fmt="link" title="Link">${icon('link')}</button><button type="button" data-fmt="ul" title="Bullet list">${icon('list')}</button><button type="button" data-fmt="quote" title="Quote">“ ”</button><label class="pe-img-btn" title="Add photos (pick several for a gallery)">${icon('image')}<span>Add photos</span><input type="file" accept="image/*" multiple class="sr" id="pe-inline-img"></label></div>
    <textarea class="input pe-body" name="body" rows="16" maxlength="60000" placeholder="Start writing… Use the buttons above for headings, bold text, links and lists.">${esc(x.body||'')}</textarea>
    <p class="small muted" style="margin:6px 0 0">Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>[text](https://link)</code>, <code>- list item</code>, <code>&gt; quote</code>. Leave a blank line between paragraphs.</p></div>
  </div>
  <div class="stack">
   <label class="dropzone ad-drop" id="pe-drop"><input type="file" accept="image/*" id="pe-file" class="sr"><span>${icon('upload')}</span><b>Cover image</b><span class="small muted">Any photo. It's resized to 1200 × 675 and compressed automatically.</span></label>
   <p class="small muted" id="pe-size">${coverSrc?'Current cover. Upload a new one to replace it.':''}</p>
   <div class="form-grid"><label class="f">Status<select class="input" name="status"><option value="draft" ${x.status!=='published'?'selected':''}>Draft (only you can see it)</option><option value="published" ${x.status==='published'?'selected':''}>Published</option></select></label><label class="f">Publish date<span class="hint">A future date schedules it</span><input class="input" type="date" name="published_at" value="${esc(x.published_at||A.todayISO())}"></label></div>
   <label class="f">Author<input class="input" name="author_name" maxlength="80" value="${esc(x.author_name||'')}"></label>
   <div class="small muted">Preview</div><div class="pe-preview" id="pe-preview"></div>
   <p class="form-msg" id="pe-msg" role="alert"></p>
   <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-pe="close">Cancel</button><button class="btn btn-primary" type="submit" id="pe-save">${p?'Save post':'Save post'}</button></div>
  </div>
 </form></div>`;
 document.body.appendChild(m);
 const form=m.querySelector('form'),body=form.elements.body,prev=m.querySelector('#pe-preview'),msg=m.querySelector('#pe-msg');
 const preview=()=>{const v=Object.fromEntries(new FormData(form));prev.innerHTML=`${coverSrc?`<img class="pe-cover" src="${esc(coverSrc)}" alt="">`:''}<span class="journal-category">${esc(v.category||'Island Drives')}</span><h2>${esc(v.title||'Your title')}</h2>${v.excerpt?`<p class="lede">${esc(v.excerpt)}</p>`:''}<div class="post-body">${A.renderPost(v.body)}</div>`;};
 const wrap=(before,after,placeholder)=>{const s0=body.selectionStart,s1=body.selectionEnd,sel=body.value.slice(s0,s1)||placeholder;body.setRangeText(before+sel+after,s0,s1,'end');body.focus();if(!body.value.slice(s0,s1))body.setSelectionRange(s0+before.length,s0+before.length+sel.length);preview();};
 const linePrefix=prefix=>{const s0=body.selectionStart,start=body.value.lastIndexOf('\n',s0-1)+1;body.setRangeText(prefix,start,start,'end');body.focus();preview();};
 m.addEventListener('click',async e=>{
  if(e.target.closest('[data-pe=close]')||e.target===m){A.closeModal(m);setTimeout(()=>m.remove(),300);return;}
  const f=e.target.closest('[data-fmt]')?.dataset.fmt;if(!f)return;
  if(f==='h2')linePrefix('## ');if(f==='h3')linePrefix('### ');if(f==='bold')wrap('**','**','bold text');if(f==='italic')wrap('*','*','italic text');if(f==='ul')linePrefix('- ');if(f==='quote')linePrefix('> ');
  if(f==='link'){const url=(await formBox('Add a link',[{name:'url',label:'Link address',type:'url',value:'https://'}],'Add link'))?.url;if(url&&/^(https:\/\/|mailto:|[\w-]+\.html)/.test(url))wrap('[',`](${url})`,'link text');}
 });
 async function setCover(file){const sz=m.querySelector('#pe-size');sz.textContent='Optimising…';try{cover=await optimiseImage(file,{mode:'fill'});coverSrc=cover.url;sz.innerHTML=`<b>Optimised:</b> ${esc(cover.from)} · ${kb(cover.before)} → ${kb(cover.after)}`;}catch(err){cover=null;sz.textContent=err.message;}preview();}
 m.querySelector('#pe-file').addEventListener('change',e=>e.target.files[0]&&setCover(e.target.files[0]));
 const drop=m.querySelector('#pe-drop');['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,()=>drop.classList.remove('over')));drop.addEventListener('drop',e=>{e.preventDefault();e.dataTransfer.files[0]&&setCover(e.dataTransfer.files[0]);});
 async function addPhotos(files){files=[...files].filter(f=>/^image\//.test(f.type)).slice(0,12);if(!files.length)return;const urls=[];
  for(let i=0;i<files.length;i++){msg.textContent=`Uploading photo ${i+1} of ${files.length}…`;try{const o=await optimiseImage(files[i],{mode:'natural'});const path=await Live.admin.uploadAdImage(o.blob,'posts');urls.push(Live.adImageUrl(path));}catch(err){msg.textContent=Live.error(err);return;}}
  msg.textContent='';const md='\n\n'+urls.map((u,i)=>`![${files.length>1?'':'Add a caption'}](${u})`).join('\n')+'\n\n';const ta=form.elements.body,at=ta.selectionStart??ta.value.length;ta.value=ta.value.slice(0,at)+md+ta.value.slice(at);ta.dispatchEvent(new Event('input',{bubbles:true}));A.toast(files.length>1?`${files.length} photos added as a gallery`:'Photo added. Edit the caption between the [ ].');}
 m.querySelector('#pe-inline-img').addEventListener('change',e=>{addPhotos(e.target.files);e.target.value='';});
 const bodyTa=form.elements.body;['dragover','dragenter'].forEach(ev=>bodyTa.addEventListener(ev,e=>{if([...(e.dataTransfer?.items||[])].some(i=>i.kind==='file')){e.preventDefault();bodyTa.classList.add('drop-over');}}));['dragleave','drop'].forEach(ev=>bodyTa.addEventListener(ev,()=>bodyTa.classList.remove('drop-over')));bodyTa.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length){e.preventDefault();addPhotos(e.dataTransfer.files);}});
 form.addEventListener('input',e=>{if(e.target.name==='title'&&!slugTouched)form.elements.slug.value=slugify(e.target.value);if(e.target.name==='slug')slugTouched=true;preview();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();msg.textContent='';const v=Object.fromEntries(new FormData(form));
  v.slug=slugify(v.slug||v.title);if(!v.title.trim()){msg.textContent='Add a title.';return;}
  if((posts||[]).some(o=>o.slug===v.slug&&o.id!==p?.id)){msg.textContent='Another post already uses that web address. Change it slightly.';return;}
  if(v.status==='published'&&v.body.trim().length<40){msg.textContent='Write a little more before publishing (at least a couple of sentences).';return;}
  const btn=m.querySelector('#pe-save');btn.disabled=true;btn.classList.add('is-loading');
  try{let cover_path;if(cover)cover_path=await Live.admin.uploadAdImage(cover.blob,'posts');
   const saved=await Live.admin.savePost({...v,id:p?.id,excerpt:v.excerpt.trim(),category:v.category.trim(),author_name:v.author_name.trim(),...(cover_path?{cover_path}:{})});
   await Live.admin.log(p?'Edited blog post':'Created blog post',saved.title,{status:saved.status});
   A.closeModal(m);setTimeout(()=>m.remove(),300);A.toast(saved.status==='published'?(postStatus(saved)==='scheduled'?'Post scheduled':'Post published'):'Draft saved');draw();
  }catch(err){msg.textContent=/duplicate|23505/.test(String(err?.code)+err?.message)?'Another post already uses that web address.':Live.error(err);}finally{btn.disabled=false;btn.classList.remove('is-loading');}
 });
 preview();A.openModal('post-editor');setTimeout(()=>form.elements.title.focus(),200);
}
root.addEventListener('click',async e=>{
 if(e.target.closest('[data-post-new]'))return postEditor(null);
 const b=e.target.closest('[data-post-act]');if(!b)return;const id=b.closest('[data-post]').dataset.post,p=posts.find(x=>x.id===id);if(!p)return;const act=b.dataset.postAct;
 if(act==='edit')return postEditor(p);
 if(act==='publish'||act==='unpublish')return run(b,async()=>{await Live.admin.savePost({...p,status:act==='publish'?'published':'draft',published_at:act==='publish'?(p.published_at&&p.published_at>A.todayISO()?p.published_at:A.todayISO()):p.published_at});await Live.admin.log(act==='publish'?'Published post':'Unpublished post',p.title);},act==='publish'?'Post published':'Post moved to drafts');
 if(act==='delete'){if(!await confirmBox({title:`Delete "${p.title}"?`,text:'The post is removed from the blog permanently.',label:'Delete post',danger:true}))return;return run(b,async()=>{await Live.admin.deletePost(id);await Live.admin.log('Deleted blog post',p.title);},'Post deleted');}
});

/* ---------- exports ---------- */
const EXPORTS={
 users:()=>(users||[]).map(u=>({name:u.name,email:u.email,type:u.is_admin?'admin':u.company_id?'company':'renter',company:u.company_name||'',joined:u.created_at,last_sign_in:u.last_sign_in_at||'',email_confirmed:!!u.email_confirmed_at,suspended:u.banned,bookings:u.bookings})),
 companies:()=>DB.companies.map(c=>({name:c.name,email:c.email||'',phone:c.phone||'',parish:c.parish||'',address:c.base||'',live:!!c.approved,verified:!!c.verified,cars:allCars().filter(v=>v.company===c.id&&!v.archived).length,joined:c.registeredAt||''})),
 cars:()=>allCars().map(v=>({name:v.name,company:companyOf(v.company).name,type:v.type,price_bbd:v.price,seats:v.seats,showing:!!(v.available&&!v.archived),removed:!!v.archived,photos:(v.photoPaths||[]).length})),
 bookings:()=>bookings().map(b=>({id:b.id,sent:b.sent,status:b.status,renter:b.renter||'',contact:b.contact||'',company:companyOf(b.company).name,car:(A.vehicle(b.vehicle)||{}).name||'',from:b.from,to:b.to,pickup:b.pickup||'',total_bbd:b.total??''})),
 enquiries:()=>(Live.inquiries||[]).map(r=>({id:r.id,type:r.kind,status:r.status,received:r.created_at,...Object.fromEntries(Object.entries(r.payload||{}).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v):v]))})),
 boosts:()=>A.boosts().map(b=>({id:b.id,company:companyOf(b.company).name,type:b.type,start:b.start,end:b.end,paid_bbd:b.paid??b.amount})),
 activity:()=>(activity||[]).map(r=>({at:r.at,admin:r.admin_email,action:r.action,target:r.target})),
 clients:()=>(clients||[]).map(c=>({name:c.name,contact:c.contact_name||'',email:c.email||'',phone:c.phone||'',address:c.address||'',added:c.created_at})),
 invoices:()=>(invoices||[]).map(i=>({number:i.number,client:i.client_snapshot?.name||clientName(i.client_id),issued:i.issued,due:i.due||'',status:invStatus(i),total_bbd:invTotals(i).total,paid_on:i.paid_at||''})),
 ads:()=>(Live.ads||[]).map(a=>({business:a.title,client:clientName(a.client_id),spot:SPOTS[a.spot]||a.spot,starts:a.starts,ends:a.ends,status:adStatus(a),link:a.url||''}))
};

/* ---------- rendering & events ---------- */
const state={};
let current='overview',drawing=null;
nav.innerHTML=`<div class="co-mini"><span class="co-avatar" aria-hidden="true">${esc(A.initials(Live.user.name||'Admin'))}</span><div><b>${esc(Live.user.name||'Admin')}</b><span class="small co-status is-live">Platform admin</span></div></div>${NAV_GROUPS.map(([g,keys])=>`${g?`<div class="grp">${g}</div>`:''}${keys.map(k=>SECTIONS.find(x=>x[0]===k)).filter(Boolean).map(([k,t,i])=>`<a href="#${k}" data-sec="${k}">${icon(i)}<span>${t}</span><span class="nav-count" data-count-for="${k}"></span></a>`).join('')}`).join('')}<a href="#" data-inbox class="admin-inbox">${icon('chat')}<span>Messages</span><span class="nav-count" data-inbox-count></span></a><div class="side-foot">${Live.user.company?`<a href="dashboard.html">${icon('car')}My company dashboard</a>`:''}<a href="index.html">${icon('eye')}View site</a><a href="#" data-logout>${icon('logout')}Log out</a></div>`;
function counts(){const set=(k,n)=>{const el=nav.querySelector(`[data-count-for="${k}"]`);if(el)el.textContent=n?String(n):'';};set('companies',DB.companies.filter(c=>!c.approved).length);set('reports',(Live.inquiries||[]).filter(r=>r.status==='new').length);set('deals',A.store.get('boostRequests',[]).filter(r=>r.status==='pending').length);}
async function draw(){
 if(!Live.user||Live.user.role!=='admin')return;
 const k=SECTIONS.some(s=>s[0]===location.hash.slice(1))?location.hash.slice(1):'overview';
 if(k!==current){current=k;Object.keys(state).forEach(x=>delete state[x]);}
 nav.querySelectorAll('[data-sec]').forEach(a=>a.toggleAttribute('aria-current',a.dataset.sec===k));nav.querySelectorAll('[data-sec][aria-current]').forEach(a=>a.setAttribute('aria-current','page'));
 const token=drawing={};const html=await S[k]();if(token!==drawing)return;
 const focus=document.activeElement?.matches?.('[data-search]')?document.activeElement.selectionStart:null;
 root.innerHTML=html;counts();
 if(focus!==null){const s=root.querySelector('[data-search]');if(s){s.focus();s.setSelectionRange(focus,focus);}}
 if(k==='reviews')SiteReviews.moderation('#review-moderation');
 document.title=`${SECTIONS.find(s=>s[0]===k)[1]} | Admin | BimCar Connect`;
}
window.addEventListener('hashchange',()=>{draw();window.scrollTo({top:0,behavior:'smooth'});});
window.onHash=null;
// Only one dropdown open at a time; clicking elsewhere or pressing Escape closes it.
document.addEventListener('click',e=>{const own=e.target.closest('details.admin-menu');document.querySelectorAll('details.admin-menu[open]').forEach(m=>{if(m!==own)m.removeAttribute('open');});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('details.admin-menu[open]').forEach(m=>{m.removeAttribute('open');m.querySelector('summary')?.focus();});});
let searchTimer;
root.addEventListener('input',e=>{if(e.target.matches('[data-search]')){clearTimeout(searchTimer);state.q=e.target.value;searchTimer=setTimeout(draw,180);}});
root.addEventListener('change',async e=>{
 const t=e.target;
 if(t.matches('[data-check]')){const c={...((ready()?privateSettings.launch_checklist:null)||JSON.parse(localStorage.getItem('bimcar.launch')||'{}')),[t.dataset.check]:t.checked};if(ready()){try{await Live.admin.saveSetting('launch_checklist',c,false);privateSettings.launch_checklist=c;}catch(err){A.toast(Live.error(err));}}else localStorage.setItem('bimcar.launch',JSON.stringify(c));draw();}
 if(t.matches('[data-bk-status]')){const id=t.closest('[data-bk]').dataset.bk,b=bookings().find(x=>x.id===id);if(!b)return;if(!await confirmBox({title:'Change booking status?',text:`From "${STATUS[b.status]?.[0]||b.status}" to "${STATUS[t.value][0]}". The renter and company will see the new status. Confirmed and on-rent bookings block the car's calendar.`,label:'Change status'})){t.value=b.status;return;}run(null,()=>Live.admin.setBookingStatus(id,t.value),'Booking updated');}
});
root.addEventListener('click',async e=>{
 const t=e.target;
 const st=t.closest('[data-state]');if(st){state[st.dataset.state]=st.dataset.val;draw();return;}
 const ex=t.closest('[data-export]');if(ex){if(ex.dataset.export==='users'&&!users)await loadUsers();if(['clients','invoices'].includes(ex.dataset.export))await loadAdData(true);if(ex.dataset.export==='activity'&&!activity&&ready())activity=await Live.admin.activity().catch(()=>[]);csv(ex.dataset.export,EXPORTS[ex.dataset.export]());return;}
 const ua=t.closest('[data-act]');if(ua){t.closest('details')?.removeAttribute('open');accountAction(ua.closest('[data-user]').dataset.user,ua.dataset.act,ua);return;}
 const ca=t.closest('[data-co-act]');if(ca){t.closest('details')?.removeAttribute('open');companyAction(ca.closest('[data-co]').dataset.co,ca.dataset.coAct,ca);return;}
 const va=t.closest('[data-car-act]');if(va){carAction(va.closest('[data-car]').dataset.car,va.dataset.carAct,va);return;}
 const ch=t.closest('[data-chat]');if(ch){BookingChat.open(ch.dataset.chat);return;}
 const ra=t.closest('[data-req-act]');if(ra){const card=ra.closest('[data-req]'),id=card.dataset.req;if(ra.dataset.reqAct==='pay'){if(!card.querySelector('[data-paid]').checked){A.toast('Tick "I have received this payment" first');return;}return run(ra,async()=>{await Live.confirmBoost(id);await Live.admin.log('Recorded boost payment',id);},'Payment recorded. The boost is live.');}if(!await confirmBox({title:'Cancel this boost request?',text:'The company will see it as cancelled. No placement is given.',label:'Cancel request',danger:true}))return;return run(ra,()=>Live.admin.cancelBoostRequest(id),'Boost request cancelled');}
 const ba=t.closest('[data-boost-act]');if(ba){if(!await confirmBox({title:'End this boost now?',text:'The Featured placement stops immediately. Refunds, if any, are arranged with the company directly.',label:'End boost',danger:true}))return;return run(ba,()=>Live.admin.endBoost(ba.closest('[data-boost]').dataset.boost),'Boost ended');}
 const sa=t.closest('[data-sp-act]');if(sa){const id=sa.closest('[data-sp]').dataset.sp,s=A.specials().find(x=>x.id===id);if(!await confirmBox({title:`Remove "${s?.title||'this deal'}"?`,text:'The deal and its promo code disappear from the site.',label:'Remove deal',danger:true}))return;return run(sa,async()=>{await A.saveVehicles(A.vehicles().map(v=>v.special===id?{...v,special:null}:v));await A.saveSpecials(A.specials().filter(x=>x.id!==id));await Live.admin.log('Removed deal',s?.title||id);},'Deal removed');}
 const ia=t.closest('[data-inq-act]');if(ia){const id=ia.closest('[data-inq]').dataset.inq,r=(Live.inquiries||[]).find(x=>x.id===id);if(ia.dataset.inqAct==='takedown'){const v=A.vehicle(r?.payload?.vehicle);if(!v)return;if(!await confirmBox({title:`Hide ${v.name}?`,text:'The car is hidden from renters and the report is marked handled. The company can fix it and switch it back on.',label:'Hide car',danger:true}))return;return run(ia,async()=>{await A.saveVehicles(A.vehicles().map(x=>x.id===v.id?{...x,available:false}:x));await Live.closeInquiry(id);await Live.admin.log('Hid reported car',v.name);},'Car hidden and report closed');}return run(ia,async()=>{await Live.closeInquiry(id);await Live.admin.log('Closed enquiry',r?.kind||id);},'Marked handled');}
 const ct=t.closest('[data-copy-text]');if(ct){A.copy(ct.dataset.copyText,'subject');return;}
 const chtml=t.closest('[data-copy-html]');if(chtml){A.copy(ACCOUNT_EMAILS[chtml.dataset.copyHtml].html,'email HTML');return;}
 const tr=t.closest('[data-tpl-reset]');if(tr){const k=tr.dataset.tplReset,f=document.getElementById('tpl-form');f.elements[k+'.subject'].value=TEMPLATE_DEFAULTS[k].subject;f.elements[k+'.body'].value=TEMPLATE_DEFAULTS[k].body;A.toast('Original wording restored. Save to keep it.');return;}
});
root.addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,btn=f.querySelector('button[type=submit]');
 if(f.id==='tpl-form'){const data={};Object.keys(TEMPLATE_DEFAULTS).forEach(k=>{data[k]={subject:f.elements[k+'.subject'].value.trim(),body:f.elements[k+'.body'].value};});return run(btn,async()=>{await Live.admin.saveSetting('message_templates',data,false);privateSettings.message_templates=data;await Live.admin.log('Updated message templates','');},'Templates saved');}
 if(f.id==='set-ann'){const v=Object.fromEntries(new FormData(f));const val={enabled:!!f.elements.enabled.checked,text:(v.text||'').trim(),style:v.tone,link:(v.link||'').trim(),linkLabel:(v.linkLabel||'').trim()};if(val.enabled&&!val.text){A.toast('Write a message for the banner');return;}if(val.link&&!/^(https:\/\/|[\w-]+\.html)/.test(val.link)){A.toast('Links must start with https:// or be a page like signup.html');return;}return run(btn,async()=>{await Live.admin.saveSetting('announcement',val,true);A.announcement();await Live.admin.log(val.enabled?'Updated announcement banner':'Turned off announcement banner',val.text);},'Banner saved');}
 if(f.id==='set-ads'){const n=Number(f.elements.limit.value);if(!Number.isInteger(n)||n<1||n>12){A.toast('Choose a number from 1 to 12');return;}return run(btn,async()=>{await Live.admin.saveSetting('ads',{limit_per_spot:n},true);A.renderAdSpots();await Live.admin.log('Changed ad limit',String(n));},'Ad limit saved');}
 if(f.id==='set-chat'){const words=[...new Set(f.elements.words.value.split('\n').map(w=>w.trim().toLowerCase()).filter(w=>w.length>=3))].slice(0,500);return run(btn,async()=>{await Live.admin.saveSetting('chat_safety',{words},false);privateSettings.chat_safety={words};await Live.admin.log('Updated blocked words',`${words.length} words`);},'Blocked words saved');}
 if(f.id==='set-contact'){const v=Object.fromEntries(new FormData(f));const wa=String(v.whatsapp||'').replace(/\D/g,'');if(wa&&wa.length<7){A.toast('Check the WhatsApp number');return;}if(v.email&&!f.elements.email.checkValidity()){A.toast('Check the email address');return;}const val={whatsapp:wa,email:(v.email||'').trim(),phone:(v.phone||'').trim()};return run(btn,async()=>{await Live.admin.saveSetting('contact',val,true);if(wa){DB.boostWhatsApp=wa;DB.contactWhatsApp=wa;}await Live.admin.log('Updated contact details','');},'Contact details saved');}
});
window.addEventListener('drivebim:data',()=>{if(!Live.user||Live.user.role!=='admin')return;if(!document.querySelector('.modal.open')&&!root.contains(document.activeElement)||document.activeElement===document.body)draw();else counts();});
await loadPrivate();
draw();
})();
