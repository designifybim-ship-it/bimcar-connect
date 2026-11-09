/* Shared data and verified email/password sessions. Only the publishable key is used here. */
(function(){
const config=window.DriveBimConfig;
const L=window.Live={settings:{},enabled:!!(config?.enabled&&window.supabase&&config.url&&config.key),user:null,cache:{},failed:false,reservations:[],unread:{}};
// Email links always return to the domain the site is actually served from.
if(config){const here=location.origin+location.pathname.replace(/[^/]*$/,'');config.siteUrl=(location.protocol.startsWith('http')?here:(config.siteUrl||here)).replace(/\/$/,'');}
// Supabase sends email links back to the Site URL (often the homepage). Route them to the right page
// so people always see a clear "verified", "set a new password" or "link expired" screen.
const redirecting=(()=>{const page=location.pathname.split('/').pop()||'index.html',hash=location.hash||'',query=location.search||'';
 const p=new URLSearchParams(hash.slice(1)+'&'+query.slice(1));
 if(!(p.has('access_token')||p.has('error_code')||p.has('error_description')||(p.has('code')&&p.has('type'))||p.get('type')))return false;
 const target=p.get('type')==='recovery'?'reset-password.html':'auth-confirm.html';
 if(page!==target&&page!=='reset-password.html'&&page!=='auth-confirm.html'){location.replace(target+query+hash);return true;}
 return false;
})();
if(redirecting){L.ready=new Promise(()=>{});return;}
if(!L.enabled){L.failed=!!config?.enabled;L.failure='The booking system could not be loaded.';L.ready=Promise.resolve();return;}
const client=L.client=supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'drivebim.auth'}});
const clone=v=>structuredClone(v);
let sessionRevision=0,sessionEnded=false;
const value=async promise=>{const result=await promise;if(result.error)throw result.error;return result.data;};
const booking=row=>({...row.payload,id:row.id,vehicle:row.vehicle_id,company:row.company_id,renterId:row.renter_id,from:row.starts,to:row.ends,status:row.status,sent:row.created_at});
L.booking=booking;
L.error=error=>{
 console.error('BimCar Connect operation failed:',error?.code||'request',error?.message||'');
 const message=String(error?.message||''),code=String(error?.code||'');
 if(code==='timeout'||/Failed to fetch|NetworkError|Load failed/i.test(message))return 'Connection problem. Check your internet and try again.';
 if(code==='42501'||/row-level security|permission denied/i.test(message))return 'You do not have permission to do that. Sign in with the right account and try again.';
 if(code==='23505'||/duplicate key/i.test(message))return 'That was already saved. Refresh the page to see the latest version.';
 if(/JWT|session/i.test(message))return 'Your session has expired. Please sign in again.';
 if(/rate limit|too many/i.test(message))return 'Too many attempts. Please wait a minute and try again.';
 return message&&message.length<180?message:'Unable to save. Please try again.';
};
L.requireSession=()=>{if(L.user)return true;sessionStorage.setItem('drivebim.return',location.pathname+location.search+location.hash);location.href='login.html';return false;};
L.reloadIdentity=async()=>{
 const revision=sessionRevision;
 const {data:{session}}=await client.auth.getSession();if(revision!==sessionRevision)return;L.user=null;if(!session)return;
 const {data,error}=await client.auth.getUser();if(revision!==sessionRevision)return;if(error){await client.auth.signOut();return;}
 const user=data.user;if(!user?.email_confirmed_at)return;
 const [profile,admin,companies]=await Promise.all([client.from('drivebim_profiles').select('*').eq('id',user.id).maybeSingle().then(r=>r.data||{}),value(client.rpc('drivebim_is_admin')),value(client.from('drivebim_companies').select('*').eq('owner_id',user.id))]);
 if(revision!==sessionRevision)return;
 let own=companies[0];
 if(!own&&user.user_metadata?.company_name){
  const profileDraft=user.user_metadata.company_profile||{};
  const parish=DB.parishes.includes(profileDraft.parish)?profileDraft.parish:'Christ Church';
  const pickups=Array.isArray(profileDraft.pickups)?[...new Set(profileDraft.pickups.filter(p=>DB.pickups.includes(p)))]:['GAIA airport'];
  const draft={name:user.user_metadata.company_name,parish,base:typeof profileDraft.base==='string'?profileDraft.base.trim().slice(0,300):'',phone:user.user_metadata.phone||'',email:user.email,about:'',verified:false,since:new Date().getFullYear(),rating:0,reviews:0,plan:'Starter',pickups,requirements:{},pay:{methods:[],when:'pickup',deposit:0,security:0,cancel:'24h',notes:''}};
  const result=await client.from('drivebim_companies').insert({owner_id:user.id,payload:draft}).select().single();if(result.error){const retry=await value(client.from('drivebim_companies').select('*').eq('owner_id',user.id));own=retry[0];if(!own)throw result.error;}else own=result.data;
 }
 if(revision!==sessionRevision)return;
 sessionEnded=false;
 L.user={id:user.id,email:user.email,name:profile.display_name||user.user_metadata?.name||user.email.split('@')[0],role:admin?'admin':own?'company':'renter',company:own?.id||null};L.user.details=(profile.details&&typeof profile.details==='object')?profile.details:(()=>{try{return JSON.parse(localStorage.getItem('drivebim.details.'+user.id)||'{}')}catch{return {}}})();
};
L.refresh=async()=>{
 const revision=sessionRevision,sessionUser=L.user;
 const before=JSON.stringify([DB.companies,L.cache.vehicles,L.cache.specials,L.cache.boosts,L.cache.coBookings,L.reservations,L.inquiries]);
 const [companies,cars,specials,boosts,reserved]=await Promise.all(['companies','vehicles','specials','boosts','reserved_dates'].map(t=>value(client.from('drivebim_'+t).select('*'))));
 if(revision!==sessionRevision)return;
 // Preview/sample rows (demo=true) are never shown on the live site.
 const companyRows=companies.filter(row=>!row.demo).map(row=>({...row.payload,id:row.id,approved:row.approved,demo:false,registeredAt:row.created_at,ownerId:row.owner_id}));
 const liveCompanies=new Set(companyRows.map(c=>c.id)),keep=row=>liveCompanies.has(row.company_id);
 const vehicles=cars.filter(keep).map(row=>({...row.payload,id:row.id,company:row.company_id,updatedAt:row.updated_at}));
 await L.resolvePhotos(vehicles,revision);if(revision!==sessionRevision)return;
 const [rows,inquiries,requests,privatePay]=sessionUser?await Promise.all([
  value(client.from('drivebim_bookings').select('*').order('created_at',{ascending:false})),
  value(client.from('drivebim_inquiries').select('*').order('created_at',{ascending:false})),
  value(client.from('drivebim_boost_requests').select('*')),
  value(client.from('drivebim_private_pay').select('*'))
 ]):[[],[],[],[]];
 if(revision!==sessionRevision)return;
 const nextCache={vehicles,specials:specials.filter(keep).map(row=>({...row.payload,id:row.id,company:row.company_id})),boosts:boosts.filter(keep).map(row=>({...row.payload,id:row.id,company:row.company_id})),coBookings:rows.filter(keep).map(booking),myTrips:rows.filter(r=>keep(r)&&r.renter_id===sessionUser?.id).map(booking),photoReports:inquiries.filter(r=>r.kind==='photo'&&r.status==='new').map(r=>({...r.payload,id:r.id,at:r.created_at})),profile:sessionUser?.company?companyRows.find(c=>c.id===sessionUser.company)||{}:{},boostRequests:requests.map(row=>({...row.payload,id:row.id,company:row.company_id,status:row.status}))};
 companies.forEach(row=>{nextCache['requirements_'+row.id]=row.payload.requirements||{};nextCache['pay_'+row.id]=row.payload.pay||{};});
 privatePay.forEach(row=>nextCache['pay_'+row.company_id]={...nextCache['pay_'+row.company_id],...row.payload});
 try{const st=await client.from('drivebim_settings').select('key,value,public');if(!st.error){L.settings=Object.fromEntries(st.data.map(r=>[r.key,r.value]));L.adminReady=true;const wa=String(L.settings.contact?.whatsapp||'').replace(/\D/g,'');if(wa.length>=7){DB.boostWhatsApp=wa;DB.contactWhatsApp=wa;}}else L.adminReady=false;}catch{L.adminReady=false;}
 // Paid ads (advertising clients). Only live ads are visible to visitors; admins receive all of them.
 try{const ads=await client.from('drivebim_ads').select('*').order('created_at',{ascending:false});if(!ads.error){const today=window.App?.todayISO?.()||new Date().toISOString().slice(0,10);L.ads=ads.data.map(a=>({...a,image:a.image_path?L.adImageUrl(a.image_path):null}));DB.partners=L.ads.filter(a=>a.active&&a.starts<=today&&a.ends>=today).map(a=>({id:a.id,name:a.title,kind:a.category||'',blurb:a.blurb||'',url:a.url||'',spot:a.spot,image:a.image,until:a.ends,size:a.size||'standard'}));}}catch{}
 if(revision!==sessionRevision)return;
 DB.companies=companyRows;L.cache=nextCache;L.reservations=reserved.filter(r=>vehicles.some(v=>v.id===r.vehicle_id));L.inquiries=inquiries;
 const after=JSON.stringify([DB.companies,L.cache.vehicles,L.cache.specials,L.cache.boosts,L.cache.coBookings,L.reservations,L.inquiries]);if(before!==after)window.dispatchEvent(new CustomEvent('drivebim:data'));
};

const signedPhotoCache=new Map();
L.resolvePhotos=async(cars=L.cache.vehicles||[],revision=sessionRevision)=>{
 for(const car of cars){if(!Array.isArray(car.photoPaths)||!car.photoPaths.length)continue;const urls=[];let missing=false;
  for(const path of car.photoPaths){if(revision!==sessionRevision)return;let cached=signedPhotoCache.get(path);
   if(!cached||cached.expires<Date.now()){
    try{const data=await value(client.storage.from('drivebim-vehicle-photos').createSignedUrl(path,3600));if(revision!==sessionRevision)return;cached={url:data.signedUrl,expires:Date.now()+3000000};}
    catch{cached={url:null,expires:Date.now()+60000};missing=true;}
    if(revision!==sessionRevision)return;signedPhotoCache.set(path,cached);
   }
   if(cached.url)urls.push(cached.url);else missing=true;
  }
  car.photoUrls=urls;car.photoUnavailable=missing;
 }
};

L.uploadPhotos=async(company,vehicle,dataUrls)=>{const urls=[];for(const data of dataUrls){const blob=await (await fetch(data)).blob();if(!['image/jpeg','image/png','image/webp'].includes(blob.type)||blob.size>8388608)throw new Error('Use JPEG, PNG or WebP photos smaller than 8 MB.');const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[blob.type],path=company+'/'+vehicle+'/'+crypto.randomUUID()+'.'+extension;await value(client.storage.from('drivebim-vehicle-photos').upload(path,blob,{contentType:blob.type,upsert:false}));urls.push(path);}return urls;};
L.saveVehicles=async cars=>{
 if(!L.requireSession())throw new Error('Sign in required');
 const previous=L.cache.vehicles||[],before=new Map(previous.map(v=>[v.id,v]));
 for(const car of cars){if(JSON.stringify(car)===JSON.stringify(before.get(car.id)))continue;await value(client.from('drivebim_vehicles').upsert({id:car.id,company_id:car.company,payload:Object.fromEntries(Object.entries(car).filter(([key])=>!['photoUrls','updatedAt','photoUnavailable'].includes(key)))}));}
 const ids=new Set(cars.map(v=>v.id));for(const car of previous){if(ids.has(car.id))continue;const removed=await client.from('drivebim_vehicles').delete().eq('id',car.id).select('id');if(removed.error||!removed.data?.length){/* Cars with booking history are archived so past bookings keep their details. */const payload=Object.fromEntries(Object.entries({...car,available:false,archived:true,special:null}).filter(([key])=>!['photoUrls','updatedAt','photoUnavailable'].includes(key)));await value(client.from('drivebim_vehicles').update({payload}).eq('id',car.id).select('id').single());}}
 await L.refresh();
};
L.saveSpecials=async specials=>{
 if(!L.requireSession())throw new Error('Sign in required');
 const before=L.cache.specials||[],old=new Map(before.map(v=>[v.id,v]));for(const special of specials){if(JSON.stringify(special)!==JSON.stringify(old.get(special.id)))await value(client.from('drivebim_specials').upsert({id:special.id,company_id:special.company,payload:special}));}
 const ids=new Set(specials.map(s=>s.id));for(const s of before)if(!ids.has(s.id))await value(client.from('drivebim_specials').delete().eq('id',s.id));await L.refresh();
};
L.saveCompany=async(co,profile,requirements,pay)=>{
 if(!L.requireSession())throw new Error('Sign in required');const current=DB.companies.find(c=>c.id===co);if(!current)throw new Error('Company not found');
 const {bank,link,...publicPay}=pay;const payload={...current,...profile,requirements,pay:publicPay};delete payload.approved;delete payload.demo;delete payload.registeredAt;delete payload.ownerId;
 await value(client.from('drivebim_companies').update({payload}).eq('id',co).select('id').single());
 await value(client.from('drivebim_private_pay').upsert({company_id:co,payload:{bank:bank||'',link:link||''}}));await L.refresh();
};
L.companyImageUrl=path=>path?config.url+'/storage/v1/object/public/drivebim-company-images/'+String(path).split('/').map(encodeURIComponent).join('/'):null;
L.setCompanyImage=async(co,kind,blob)=>{if(!L.requireSession())throw new Error('Sign in required');const current=DB.companies.find(c=>c.id===co);if(!current)throw new Error('Company not found');
 const key=kind==='logo'?'logoPath':'coverPath';let path=null;
 if(blob){const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[blob.type]||'jpg';path=co+'/'+kind+'-'+crypto.randomUUID()+'.'+ext;
  try{await value(client.storage.from('drivebim-company-images').upload(path,blob,{contentType:blob.type,upsert:false,cacheControl:'31536000'}));}
  catch(e){if(/bucket|not found|404/i.test(String(e?.message)+String(e?.statusCode)))throw new Error('Image uploads are still being switched on. Please try again soon.');throw e;}}
 const old=current[key];const payload={...current,[key]:path};delete payload.approved;delete payload.demo;delete payload.registeredAt;delete payload.ownerId;
 await value(client.from('drivebim_companies').update({payload}).eq('id',co).select('id').single());
 if(old&&old!==path)client.storage.from('drivebim-company-images').remove([old]).catch(()=>{});
 await L.refresh();return path;};
L.requestBooking=async request=>{
 if(!L.requireSession())throw new Error('Sign in required');
 const row=await value(client.rpc('drivebim_request_booking',{vid:request.vehicle,d1:request.from,d2:request.to,details:request,first_message:request.initialMessage||'',request_id:request.id}));await L.refresh();return booking(row);
};
L.saveProfile=async(name,details)=>{if(!L.user)throw new Error('Sign in required');const clean={};Object.entries(details||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&String(v).trim()!=='')clean[k]=String(v).trim().slice(0,120);});
 let {error}=await client.from('drivebim_profiles').update({display_name:name,details:clean}).eq('id',L.user.id);
 if(error&&/details|PGRST204|42703|schema cache/i.test(String(error.code)+' '+error.message)){({error}=await client.from('drivebim_profiles').update({display_name:name}).eq('id',L.user.id));try{localStorage.setItem('drivebim.details.'+L.user.id,JSON.stringify(clean));}catch{}}
 if(error)throw error;L.user.name=name;L.user.details=clean;window.dispatchEvent(new CustomEvent('drivebim:profile'));};
L.changeBooking=async(id,status)=>{await value(client.rpc('drivebim_change_booking',{bid:id,new_status:status}));await L.refresh();};
L.submitInquiry=async(kind,payload)=>{if(!L.requireSession())throw new Error('Sign in required');const row=await value(client.from('drivebim_inquiries').insert({kind,payload}).select().single());await L.refresh();return row;};
L.closeInquiry=async id=>{await value(client.from('drivebim_inquiries').update({status:'closed'}).eq('id',id).select('id').single());await L.refresh();};
L.createBoostRequest=async request=>{if(!L.requireSession())throw new Error('Sign in required');await value(client.from('drivebim_boost_requests').insert({id:request.id,company_id:request.company,payload:request}));await L.refresh();};
L.confirmBoost=async id=>{await value(client.rpc('drivebim_confirm_boost_payment',{rid:id}));await L.refresh();};
L.setVerified=async(id,verified)=>{const current=DB.companies.find(c=>c.id===id);if(!current)throw new Error('Company not found');const payload={...current,verified:!!verified};['approved','demo','registeredAt','ownerId'].forEach(k=>delete payload[k]);await value(client.from('drivebim_companies').update({payload}).eq('id',id).select('id').single());await L.refresh();};
L.adImageUrl=path=>config.url+'/storage/v1/object/public/drivebim-ad-images/'+String(path).split('/').map(encodeURIComponent).join('/');
const rpc=(name,args)=>value(client.rpc(name,args||{}));
const missing=error=>/drivebim_admin_|drivebim_settings|drivebim_admin_log|drivebim_calls|drivebim_handovers|drivebim_maintenance|drivebim_customer_notes|PGRST202|PGRST205|42883|42P01|schema cache/i.test(String(error?.code||'')+' '+String(error?.message||''));
L.admin={
 missing,
 log:async(action,target,details)=>{if(!L.adminReady)return;try{await client.from('drivebim_admin_log').insert({action,target:target==null?null:String(target).slice(0,300),details:details||{},admin_email:L.user?.email||null});}catch{}},
 activity:async()=>value(client.from('drivebim_admin_log').select('*').order('id',{ascending:false}).limit(300)),
 users:async()=>rpc('drivebim_admin_users'),
 deleteUser:async id=>{await rpc('drivebim_admin_delete_user',{uid:id});await L.refresh();},
 setSuspended:async(id,on)=>rpc('drivebim_admin_set_suspended',{uid:id,suspended:!!on}),
 confirmEmail:async id=>rpc('drivebim_admin_confirm_email',{uid:id}),
 setAdmin:async(id,on)=>rpc('drivebim_admin_set_admin',{uid:id,make_admin:!!on}),
 setCompanyApproved:async(co,on)=>{await rpc('drivebim_admin_set_company_approved',{co,approve:!!on});await L.refresh();},
 deleteCompany:async co=>{await rpc('drivebim_admin_delete_company',{co});await L.refresh();},
 setBookingStatus:async(id,status)=>{await rpc('drivebim_admin_set_booking_status',{bid:id,new_status:status});await L.refresh();},
 endBoost:async id=>{await rpc('drivebim_admin_end_boost',{boost_id:id});await L.refresh();},
 cancelBoostRequest:async id=>{await rpc('drivebim_admin_cancel_boost_request',{rid:id});await L.refresh();},
 saveSetting:async(key,val,isPublic)=>{await value(client.from('drivebim_settings').upsert({key,value:val,public:!!isPublic,updated_at:new Date().toISOString(),updated_by:L.user?.id||null}));L.settings={...L.settings,[key]:val};},
 privateSettings:async()=>{const rows=await value(client.from('drivebim_settings').select('key,value'));return Object.fromEntries(rows.map(r=>[r.key,r.value]));},
 clients:async()=>value(client.from('drivebim_ad_clients').select('*').order('name')),
 saveClient:async c=>{const row={name:String(c.name||'').trim(),contact_name:c.contact_name||null,email:c.email||null,phone:c.phone||null,address:c.address||null,notes:c.notes||null};return c.id?value(client.from('drivebim_ad_clients').update(row).eq('id',c.id).select().single()):value(client.from('drivebim_ad_clients').insert(row).select().single());},
 deleteClient:async id=>value(client.from('drivebim_ad_clients').delete().eq('id',id)),
 saveAd:async a=>{const row={client_id:a.client_id||null,title:String(a.title||'').trim(),category:a.category||null,blurb:a.blurb||null,url:a.url||null,spot:a.spot,starts:a.starts,ends:a.ends,active:a.active!==false,size:['standard','banner','square','tall'].includes(a.size)?a.size:'standard',real_photo_confirmed:!!a.real_photo_confirmed,...(a.image_path!==undefined?{image_path:a.image_path}:{})};const save=r=>a.id?value(client.from('drivebim_ads').update(r).eq('id',a.id).select().single()):value(client.from('drivebim_ads').insert(r).select().single());let res;try{res=await save(row);}catch(e){if(!/size|real_photo|PGRST204|42703|schema cache/i.test(String(e?.code)+' '+e?.message))throw e;const {size,real_photo_confirmed,...older}=row;res=await save(older);}await L.refresh();return res;},
 deleteAd:async id=>{const ad=(L.ads||[]).find(a=>a.id===id);await value(client.from('drivebim_ads').delete().eq('id',id));if(ad?.image_path)await client.storage.from('drivebim-ad-images').remove([ad.image_path]).catch(()=>{});await L.refresh();},
 uploadAdImage:async(blob,folder)=>{const ext={'image/webp':'webp','image/jpeg':'jpg','image/png':'png'}[blob.type]||'jpg',path=(folder||'ads')+'/'+crypto.randomUUID()+'.'+ext;await value(client.storage.from('drivebim-ad-images').upload(path,blob,{contentType:blob.type,upsert:false,cacheControl:'31536000'}));return path;},
 posts:async()=>value(client.from('drivebim_posts').select('*').order('created_at',{ascending:false})),
 savePost:async p=>{const row={slug:p.slug,title:String(p.title||'').trim(),excerpt:p.excerpt||null,category:p.category||null,body:p.body||'',author_name:p.author_name||null,status:p.status,published_at:p.status==='published'?(p.published_at||new Date().toISOString().slice(0,10)):(p.published_at||null),updated_at:new Date().toISOString(),...(p.cover_path!==undefined?{cover_path:p.cover_path}:{})};return p.id?value(client.from('drivebim_posts').update(row).eq('id',p.id).select().single()):value(client.from('drivebim_posts').insert(row).select().single());},
 deletePost:async id=>value(client.from('drivebim_posts').delete().eq('id',id)),
 invoices:async()=>value(client.from('drivebim_invoices').select('*').order('created_at',{ascending:false})),
 saveInvoice:async inv=>{const row={client_id:inv.client_id||null,client_snapshot:inv.client_snapshot||{},issued:inv.issued,due:inv.due||null,items:inv.items||[],discount:Number(inv.discount)||0,tax_rate:Number(inv.tax_rate)||0,notes:inv.notes||null,status:inv.status||'draft',paid_at:inv.status==='paid'?(inv.paid_at||new Date().toISOString().slice(0,10)):null};return inv.id?value(client.from('drivebim_invoices').update(row).eq('id',inv.id).select().single()):value(client.from('drivebim_invoices').insert(row).select().single());},
 deleteInvoice:async id=>value(client.from('drivebim_invoices').delete().eq('id',id)),
 updateCompany:async(co,changes)=>{const current=DB.companies.find(c=>c.id===co);if(!current)throw new Error('Company not found');const payload={...current,...changes};['approved','demo','registeredAt','ownerId'].forEach(k=>delete payload[k]);await value(client.from('drivebim_companies').update({payload}).eq('id',co).select('id').single());await L.refresh();}
};
L.approveCompany=async id=>{await value(client.rpc('drivebim_approve_company',{co:id}));await L.refresh();};
L.messages=async(id,before)=>{let query=client.from('drivebim_messages').select('*').eq('booking_id',id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(50);if(before)query=query.or('created_at.lt.'+before.created_at+',and(created_at.eq.'+before.created_at+',id.lt.'+before.id+')');return (await value(query)).reverse();};
L.sendMessage=async(id,text,nonce)=>{const result=await client.from('drivebim_messages').insert({id:nonce,booking_id:id,body:text.trim()}).select().single();if(!result.error)return result.data;if(result.error.code==='23505'){const existing=await value(client.from('drivebim_messages').select('*').eq('id',nonce).single());if(existing.booking_id===id&&existing.sender_id===L.user.id&&existing.body===text.trim())return existing;}throw result.error;};
L.publicPosts=async()=>{const r=await client.from('drivebim_posts').select('id,slug,title,excerpt,category,cover_path,published_at,status').eq('status','published').order('published_at',{ascending:false});return r.error?[]:r.data.map(x=>({...x,cover:x.cover_path?L.adImageUrl(x.cover_path):null}));};
L.post=async slug=>{const r=await client.from('drivebim_posts').select('*').eq('slug',slug).maybeSingle();if(r.error||!r.data)return null;return {...r.data,cover:r.data.cover_path?L.adImageUrl(r.data.cover_path):null};};
L.popularCars=async()=>value(client.rpc('drivebim_popular_cars'));
L.publicReviews=async co=>value(client.rpc('drivebim_public_reviews',{co:co||null}));
L.myReviews=async()=>L.user?value(client.rpc('drivebim_my_reviews')):[];
L.submitReview=async data=>{if(!L.requireSession())throw Error('Sign in required');return value(client.rpc('drivebim_submit_review',{co:data.companyId||null,bid:data.bookingId||null,rating:data.stars,review_body:data.body}));};
L.pendingReviews=async()=>value(client.rpc('drivebim_pending_reviews'));
L.moderateReview=async(id,status)=>value(client.rpc('drivebim_moderate_review',{rid:id,decision:status}));
L.setTyping=async(id,typing)=>value(client.rpc('drivebim_set_typing',{bid:id,typing}));
L.typingState=async id=>value(client.rpc('drivebim_typing_state',{bid:id}));
L.markRead=async id=>value(client.from('drivebim_chat_reads').upsert({booking_id:id,user_id:L.user.id,last_read_at:new Date().toISOString()}));
L.refreshUnread=async()=>{const revision=sessionRevision,userId=L.user?.id;if(!userId)return;const counts=await value(client.rpc('drivebim_unread_counts'));if(revision!==sessionRevision||userId!==L.user?.id)return;L.unread=counts;window.dispatchEvent(new CustomEvent('drivebim:unread'));};
const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error('The booking system took too long to respond.'),{code:'timeout'})),ms));
L.ready=(async()=>{try{await Promise.race([(async()=>{await L.reloadIdentity();await L.refresh();})(),timeout(10000)]);L.refreshUnread().catch(()=>{});}catch(error){L.failed=true;L.failure=L.error(error);}})();
L.ready.then(()=>{if(L.failed)return;let polling=false;setInterval(async()=>{if(polling||document.visibilityState!=='visible')return;polling=true;try{await L.refresh();await L.refreshUnread();}catch{window.dispatchEvent(new CustomEvent('drivebim:sync-error'));}finally{polling=false;}},15000);});
function endSession(){
 if(sessionEnded)return;sessionEnded=true;sessionRevision++;L.user=null;L.cache={vehicles:[],specials:[],boosts:[],coBookings:[],myTrips:[],photoReports:[],boostRequests:[],profile:{}};L.unread={};L.inquiries=[];L.reservations=[];DB.companies=[];signedPhotoCache.clear();
 try{for(const key of Object.keys(sessionStorage))if(key==='drivebim.chat.open'||key==='drivebim.chat.selected'||key.startsWith('drivebim.chat.draft.'))sessionStorage.removeItem(key);}catch{}
 window.dispatchEvent(new CustomEvent('drivebim:session-ended'));window.dispatchEvent(new CustomEvent('drivebim:data'));window.dispatchEvent(new CustomEvent('drivebim:unread'));
 const page=location.pathname.split('/').pop();
 if(page==='admin.html'||page==='account.html'||/^dashboard(?:-[a-z-]+)?\.html$/.test(page||'')){try{sessionStorage.setItem('drivebim.return',location.pathname+location.search+location.hash);}catch{}location.replace('login.html');}
}
L.signOut=async()=>{const {error}=await client.auth.signOut();if(error)throw error;endSession();sessionStorage.removeItem('drivebim.return');location.href='index.html';};
client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT')endSession();});
})();
