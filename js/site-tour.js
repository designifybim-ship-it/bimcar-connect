/* Optional client-side guide. It never changes booking/account data. */
(()=>{
 if(window.BimCarGuide)return;
 const preferenceKey='bimcar.guide.preference',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let root=null,invite=null,steps=[],index=0,previousFocus=null,inerted=[],frame=0,started=false;
 const stored=()=>{try{return localStorage.getItem(preferenceKey);}catch{return null;}};
 const remember=value=>{try{localStorage.setItem(preferenceKey,value);}catch{}};
 const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length>0;
 const arrivalBlocking=()=>{const el=document.querySelector('.island-arrival:not(.arrived)');return el&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none';};
 const find=selectors=>{for(const selector of selectors){for(const el of document.querySelectorAll(selector))if(visible(el))return el;}return null;};
 const options=[
  {selectors:['#booking'],title:'Start with your plans',text:'Choose a pickup area, your dates and the kind of car you need. Search compares the listings in one place.'},
  {selectors:['#s-from + .dp-field','#s-from'],label:true,title:'Pick your dates',text:'Use the calendar for pickup and return dates. A car’s recorded availability and driver requirements help you narrow the options.'},
  {selectors:['.nav-links a[href="vehicles.html"]','a[href="vehicles.html"]'],title:'Compare cars and requirements',text:'Open Our cars to compare daily rates, vehicle details, pickup options and company rules. Unavailable cars are clearly marked.'},
  {selectors:['#message-launcher'],title:'Keep replies in Messages',text:'Once you send a booking request, open Messages to read and reply to the rental company. You can return to your conversation from any page.'},
  {selectors:['.nav-links a[href="blog.html"]','a[href="blog.html"]'],title:'Make a day of the drive',text:'Island Drives has places to visit, suggested outings and food stops. The driving guide is linked there too.'}
 ];
 function close(value){if(value)remember(value);if(frame)cancelAnimationFrame(frame);frame=0;root?.remove();root=null;inerted.forEach(el=>{el.inert=false;});inerted=[];previousFocus?.focus?.({preventScroll:true});}
 function place(){frame=0;if(!root)return;const target=steps[index]?.target,box=root.querySelector('.tour-dialog');if(!target||!target.isConnected){close();return;}const r=target.getBoundingClientRect(),pad=7,w=innerWidth,h=innerHeight;
  const top=Math.max(6,r.top-pad),left=Math.max(6,r.left-pad),right=Math.min(w-6,r.right+pad),bottom=Math.min(h-6,r.bottom+pad),focus=root.querySelector('.tour-spotlight');
  Object.assign(focus.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
  const bw=Math.min(360,w-32),bh=box.getBoundingClientRect().height||260;box.style.width=bw+'px';const bx=Math.min(w-bw-16,Math.max(16,r.left+(r.width-bw)/2));let by=r.bottom+20;if(by+bh>h-16)by=r.top-bh-20;if(by<16)by=Math.max(16,Math.min(h-bh-16,(h-bh)/2));Object.assign(box.style,{left:bx+'px',top:by+'px',maxHeight:Math.max(140,h-32)+'px'});
 }
 function queuePlace(){if(root&&!frame)frame=requestAnimationFrame(place);}
 function draw(){if(!root)return;const step=steps[index];root.querySelector('#tour-title').textContent=step.title;root.querySelector('#tour-description').textContent=step.text;root.querySelector('.tour-count').textContent=`${index+1} of ${steps.length}`;root.querySelector('[data-tour-back]').disabled=index===0;root.querySelector('[data-tour-next]').textContent=index===steps.length-1?'Done':'Next';step.target.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'center',inline:'nearest'});place();root.querySelector('[data-tour-next]').focus({preventScroll:true});}
 function start(){
  if(arrivalBlocking()){setTimeout(start,450);return;}
  if(document.querySelector('.modal.open,.drawer.open'))return;
  invite?.remove();invite=null;close();steps=options.map(step=>{let target=find(step.selectors);if(step.label&&target?.matches('input'))target=target.closest('label')||target;return target?{...step,target}:null;}).filter(Boolean);if(!steps.length)return;
  previousFocus=document.activeElement;index=0;root=document.createElement('div');root.className='site-tour';root.innerHTML='<div class="tour-spotlight" aria-hidden="true"></div><section class="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-description"><div class="tour-top"><span class="tour-count" role="status" aria-live="polite"></span><button type="button" class="tour-close" data-tour-skip aria-label="Close guide">×</button></div><h2 id="tour-title"></h2><p id="tour-description"></p><div class="tour-actions"><button type="button" data-tour-back>Back</button><button type="button" data-tour-next>Next</button></div><button type="button" class="tour-turn-off" data-tour-skip>Turn off this guide</button></section>';
  document.body.appendChild(root);inerted=[...document.body.children].filter(el=>el!==root&&el.tagName!=='SCRIPT'&&!el.inert);inerted.forEach(el=>el.inert=true);
  root.querySelector('[data-tour-next]').addEventListener('click',()=>{if(index===steps.length-1)close('done');else{index++;draw();}});root.querySelector('[data-tour-back]').addEventListener('click',()=>{if(index){index--;draw();}});root.querySelectorAll('[data-tour-skip]').forEach(b=>b.addEventListener('click',()=>close('off')));
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close('off');return;}if(e.key==='Tab'){const items=[...root.querySelectorAll('button')].filter(b=>!b.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});draw();
 }
 function offer(){
  if(started)return;started=true;if(stored()||!document.getElementById('booking'))return;
  const show=()=>{if(arrivalBlocking()){setTimeout(show,450);return;}if(root||stored())return;if(window.BimCarPolish?.noticePending){window.addEventListener('bimcar:storage-notice-closed',show,{once:true});return;}invite=document.createElement('aside');invite.className='tour-invite';invite.setAttribute('aria-label','Optional site guide');invite.innerHTML='<div><strong>First time here?</strong><p>Take a quick look around, or explore at your own pace.</p></div><div class="tour-invite-actions"><button type="button" data-tour-show>Show me around</button><button type="button" data-tour-dismiss>Not now</button></div>';document.body.appendChild(invite);invite.querySelector('[data-tour-show]').addEventListener('click',start);invite.querySelector('[data-tour-dismiss]').addEventListener('click',()=>{remember('off');invite.remove();invite=null;});};setTimeout(show,700);
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-start-tour]')){e.preventDefault();start();}});window.addEventListener('drivebim:ready',offer,{once:true});window.addEventListener('resize',queuePlace);window.addEventListener('scroll',queuePlace,{passive:true});window.addEventListener('pagehide',()=>close());window.BimCarGuide={start,close:()=>close('off')};
 function ready(){if(window.App&&document.querySelector('.site-header'))offer();else (window.Live?.ready||Promise.resolve()).then(()=>setTimeout(offer,100));}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
