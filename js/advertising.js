/* Public campaign pricing and the existing verified-account enquiry flow. */
(()=>{
 const money=value=>window.App?.money?App.money(value):'BBD $'+value;
 const bindMoney=(el,value,opts={})=>{if(window.App?.bindMoney)App.bindMoney(el,value,opts);else el.textContent=(opts.prefix||'')+money(value)+(opts.suffix||'');};
 document.querySelectorAll('[data-ad-price]').forEach(el=>bindMoney(el,Number(el.dataset.adPrice)));
 const form=document.getElementById('af');if(!form)return;
 const plans={daily:{name:'Daily',price:25,days:1},weekly:{name:'Weekly',price:140,days:7},monthly:{name:'Monthly',price:450,days:30},creative:{name:'Creative support',price:null,days:null,quote:true}};
 const packageSelect=form.elements.package,fixedPackage=form.dataset.package,status=document.getElementById('amsg'),submit=document.getElementById('ad-submit');let sending=false,available=true;if(fixedPackage&&plans[fixedPackage])packageSelect.value=fixedPackage;
 function describe(){const plan=plans[packageSelect.value]||plans.weekly;const both=[...form.elements.placement.options].find(option=>option.value==='Homepage and Island Drives');if(both){both.disabled=packageSelect.value!=='monthly';if(both.disabled&&form.elements.placement.value===both.value)form.elements.placement.selectedIndex=0;}const box=document.getElementById('ad-enquiry-summary');box.replaceChildren();const title=document.createElement('strong');title.textContent=plan.name+' campaign';const amount=document.createElement('span');if(plan.quote)amount.textContent='Quoted after your brief';else bindMoney(amount,plan.price,{suffix:' · '+plan.days+(plan.days===1?' day':' days')});form.elements.startDate.required=!plan.quote;form.elements.placement.closest('label').hidden=!!plan.quote;if(plan.quote)form.elements.creative.value='help';box.append(title,amount);document.querySelectorAll('[data-ad-package]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.adPackage===packageSelect.value)));}
 describe();
 const today=window.App?.todayISO?App.todayISO():new Intl.DateTimeFormat('en-CA',{timeZone:'America/Barbados',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());form.elements.startDate.min=today;
 document.querySelectorAll('[data-ad-package]').forEach(button=>button.addEventListener('click',()=>{packageSelect.value=button.dataset.adPackage;describe();document.getElementById('advertising-enquiry').scrollIntoView?.({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});packageSelect.focus({preventScroll:true});}));
 document.querySelector('[data-creative-help]')?.addEventListener('click',()=>{form.elements.creative.value='help';});packageSelect.addEventListener('change',describe);
 function useHash(){const hash=location.hash.slice(1);if(!fixedPackage&&plans[hash]){packageSelect.value=hash;describe();}}useHash();window.addEventListener('hashchange',useHash);
 (window.Live?.ready||Promise.resolve()).then(()=>{if(window.Live?.failed){available=false;submit.disabled=true;status.dataset.state='error';status.textContent='Advertising enquiries are temporarily unavailable. The packages are still available to browse; please reload and try again shortly.';}});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(sending||!available)return;if(!form.reportValidity())return;
  if(!window.Live){status.dataset.state='error';status.textContent='Unable to connect. Please reload and try again.';return;}
  await Live.ready;if(Live.failed){available=false;submit.disabled=true;status.dataset.state='error';status.textContent='Unable to connect. Please reload and try again.';return;}
  if(!Live.requireSession())return;
  const fields=form.elements,plan=plans[fixedPackage||packageSelect.value];if(!plan)return;for(const name of ['contactName','business','contact','message'])if(!fields[name].value.trim()){status.dataset.state='error';status.textContent='Please complete every required field.';fields[name].focus();return;}
  if(fields.startDate.value&&fields.startDate.value<today){status.dataset.state='error';status.textContent='Choose a start date from today onwards.';fields.startDate.focus();return;}
  const creative=fields.creative.options[fields.creative.selectedIndex].textContent;
  const payload={business:fields.business.value.trim(),contact:fields.contact.value.trim(),kind:fields.kind.value,spot:fields.placement.value,month:fields.startDate.value.slice(0,7),message:['Contact name: '+fields.contactName.value.trim(),'Package: '+(plan.quote?'Creative support / separate quote':plan.name+' / '+plan.days+' days / BBD $'+plan.price),'Preferred start: '+fields.startDate.value,'Promotional material: '+creative,'Instagram: '+(fields.instagram.value.trim()||'Not supplied'),'Campaign: '+fields.message.value.trim()].join('\n'),package:packageSelect.value,priceBBD:plan.price,durationDays:plan.days,startDate:fields.startDate.value,creativeSupport:fields.creative.value,instagram:fields.instagram.value.trim(),contactName:fields.contactName.value.trim()};
  sending=true;submit.disabled=true;submit.textContent='Sending enquiry…';status.dataset.state='';status.textContent='Sending your campaign details…';
  try{const row=await Live.submitInquiry('advertising',payload);form.reset();describe();status.dataset.state='success';status.textContent='Your advertising enquiry was received. Reference: '+row.id+'. We’ll confirm availability and next steps before payment.';window.App?.toast?.('Advertising enquiry received');}
  catch(error){status.dataset.state='error';status.textContent=Live.error?Live.error(error):'Unable to send. Please try again.';}
  finally{sending=false;submit.disabled=!available;submit.textContent='Send advertising enquiry';}
 });
})();
