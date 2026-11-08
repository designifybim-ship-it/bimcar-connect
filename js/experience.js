/* The same branded loading screen covers refreshes and full-page navigation. */
(()=>{
 if(window.BimCarArrival)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const path=location.pathname.split('/').pop()||'index.html',preview=new URLSearchParams(location.search).has('intro');
 let first=true;try{first=sessionStorage.getItem('drivebim.arrived')!=='1';}catch{}
 const longIntro=path==='index.html'&&(first||preview);
 let intro=null,closed=true,outgoing=false,domReady=document.readyState!=='loading',appReady=false,settling=false,started=0,previousFocus=null,previousOverflow='',observer=null;
 let fallback,readyTimer,removalTimer,navigateTimer;
 const owned=new Set(),raf=fn=>(window.requestAnimationFrame||((cb)=>setTimeout(cb,16)))(fn);
 function lockNode(el){if(el===intro||el.tagName==='SCRIPT'||el.tagName==='STYLE'||el.inert)return;el.inert=true;owned.add(el);}
 function release(){observer?.disconnect();observer=null;owned.forEach(el=>el.inert=false);owned.clear();document.body.style.overflow=previousOverflow;document.body.removeAttribute('aria-busy');document.documentElement.classList.remove('page-loading');}
 function finish(){
  if(closed)return;closed=true;clearTimeout(fallback);clearTimeout(readyTimer);release();document.body.classList.add('island-landed');
  const ended=intro;if(ended){ended.classList.add('arrived');removalTimer=setTimeout(()=>ended.remove(),reduced?0:620);}
  if(ended?.contains(document.activeElement)){const main=document.getElementById('main');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}else previousFocus?.focus?.({preventScroll:true});}
  try{sessionStorage.setItem('drivebim.arrived','1');}catch{}
  window.dispatchEvent(new CustomEvent('bimcar:arrival-complete'));
 }
 function mount(leaving=false){
  if(!closed)release();clearTimeout(fallback);clearTimeout(readyTimer);clearTimeout(removalTimer);intro?.remove();
  outgoing=leaving;closed=false;settling=false;started=Date.now();previousFocus=document.activeElement;previousOverflow=document.body.style.overflow;
  document.body.classList.remove('leaving');document.body.classList.add('has-page-arrival');document.documentElement.classList.add('page-loading');document.body.style.overflow='hidden';document.body.setAttribute('aria-busy','true');
  intro=document.createElement('div');intro.id='bimcar-arrival';intro.className='island-arrival';intro.setAttribute('role','dialog');intro.setAttribute('aria-label',leaving?'Opening your next page':'Welcome to BimCar Connect');intro.setAttribute('aria-modal','true');intro.tabIndex=-1;
  intro.innerHTML='<div class="arrival-bg" aria-hidden="true"><i class="arrival-blob b1"></i><i class="arrival-blob b2"></i><i class="arrival-blob b3"></i><i class="arrival-blob b4"></i></div><div class="arrival-scene logo-only-scene"><div class="arrival-halo" aria-hidden="true"></div><div class="arrival-logo-stage"><img class="arrival-logo-echo" src="img/brand/bimcar-connect.png" width="2066" height="761" alt="" aria-hidden="true"><img class="arrival-brand-logo" src="img/brand/bimcar-connect.png" width="2066" height="761" alt="BimCar Connect"><span class="arrival-logo-sheen" aria-hidden="true"></span></div><div class="arrival-road" aria-hidden="true"><span class="arrival-progress"></span><span class="arrival-dashes"></span></div><p class="arrival-tagline" aria-hidden="true">'+(leaving?'On the way':'One Search. <b>More Island.</b>')+'</p><span id="arrival-status" class="sr" role="status" aria-live="polite">Loading BimCar Connect</span><button type="button" class="arrival-skip">Continue to site</button></div>';
  if(leaving)intro.classList.add('is-leaving');
  document.body.appendChild(intro);[...document.body.children].forEach(lockNode);
  observer=new MutationObserver(records=>{if(closed)return;for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)lockNode(node);});observer.observe(document.body,{childList:true});
  intro.focus({preventScroll:true});intro.querySelector('button').addEventListener('click',finish);
  intro.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){e.preventDefault();intro.querySelector('button').focus({preventScroll:true});}});
  fallback=setTimeout(finish,reduced?2500:4500);
 }
 function settle(){
  if(closed||outgoing||settling||!domReady||!appReady)return;settling=true;
  // Keep entrance animation and font reflow behind the loading screen.
  Promise.resolve(document.fonts?.ready).catch(()=>{}).then(()=>{
   if(closed||outgoing)return;
   const wait=reduced?0:Math.max(longIntro?1500-(Date.now()-started):380-(Date.now()-started),120);
   readyTimer=setTimeout(()=>raf(()=>raf(()=>{if(!outgoing)finish();})),wait);
  });
 }
 function beginTransition(){if(!closed&&outgoing)return;mount(true);}
 function navigate(href){
  const url=new URL(href,location.href),sameDocument=url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search;
  if(sameDocument&&url.hash){location.href=url.href;return;}
  beginTransition();let committed=false;const commit=()=>{if(committed)return;committed=true;location.href=url.href;};
  raf(()=>raf(commit));navigateTimer=setTimeout(commit,100);
 }
 window.BimCarArrival={get loading(){return !closed;},beginTransition,navigate,finish};
 window.addEventListener('drivebim:ready',()=>{appReady=true;settle();},{once:true});
 window.addEventListener('beforeunload',beginTransition);
 window.addEventListener('pagehide',()=>{clearTimeout(fallback);clearTimeout(readyTimer);clearTimeout(navigateTimer);});
 window.addEventListener('pageshow',event=>{if(event.persisted){outgoing=false;finish();document.body.classList.remove('leaving');}});
 mount();
 function ready(){
  domReady=true;document.body.classList.add('island-landed');
  const entry=document.querySelector('.hero-media');
  if(entry&&!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(en=>en.isIntersecting)){entry.classList.add('island-in');io.disconnect();}},{threshold:.08});io.observe(entry);}
  if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('surface-in');io.unobserve(en.target);}}),{threshold:.08});document.querySelectorAll('.island-card,.step,.promise').forEach((el,i)=>{el.style.setProperty('--arrival-delay',Math.min(i%3*70,140)+'ms');el.classList.add('surface-reveal');io.observe(el);});}
  settle();
 }
 if(domReady)ready();else document.addEventListener('DOMContentLoaded',ready,{once:true});
})();
