/* BimCar Connect launch layer: background decoration, scroll progress,
   card reveal motion and show/hide password buttons. Safe to load on any page. */
(()=>{
 if(window.BimCarLaunch)return;window.BimCarLaunch=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

 // Show / hide password buttons (works for forms rendered later too)
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-pw-toggle]');if(!button)return;
  const input=button.parentElement.querySelector('input');if(!input)return;
  const show=input.type==='password';input.type=show?'text':'password';
  button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'Hide password':'Show password');
  input.focus({preventScroll:true});
 });

 function ready(){
  // Soft colour orbs + dot grid behind every page
  if(!document.querySelector('.lx-backdrop')){
   const bg=document.createElement('div');bg.className='lx-backdrop';bg.setAttribute('aria-hidden','true');
   bg.innerHTML='<b class="lx-waves"></b><i class="o1"></i><i class="o2"></i><i class="o3"></i><i class="o4"></i>';
   document.body.prepend(bg);
  }
  if(reduced)return;

  // Thin gradient reading-progress line
  const bar=document.createElement('div');bar.className='lx-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
  let ticking=false;
  const update=()=>{ticking=false;const max=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${max>40?Math.min(1,scrollY/max):0})`;};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true});update();

  // Cards and panels rise into view
  if(!('IntersectionObserver' in window))return;
  const selector='.card,.vcard,.co-card,.special,.kpi,.route-card,.partner,.ad-slot,.boost-card,.empty,.faq,.pkg,.journal-card,.table-wrap';
  const skip='.modal,.drawer,.dp-pop,.side,.cookie-notice,.site-tour,.phone-story,[class*="chat"],#bimcar-arrival,.auth-box,.book-card';
  const styleDesc=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'style');
  const styleOf=el=>{try{return styleDesc.get.call(el);}catch{return null;}};
  const io=new IntersectionObserver(entries=>{
   const batch=entries.filter(en=>en.isIntersecting);
   batch.forEach((en,i)=>{const st=styleOf(en.target);st?.setProperty('--lx-delay',Math.min(i,5)*70+'ms');en.target.classList.add('lx-in');io.unobserve(en.target);
    setTimeout(()=>{en.target.classList.remove('lx-reveal','lx-in');st?.removeProperty('--lx-delay');},1200);});
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  const seen=new WeakSet();
  function scan(root){
   const nodes=[...(root.matches?.(selector)?[root]:[]),...(root.querySelectorAll?root.querySelectorAll(selector):[])];
   for(const el of nodes){
    if(seen.has(el))continue;seen.add(el);
    if(el.closest(skip)||el.hasAttribute('data-reveal')||el.classList.contains('surface-reveal')||/animation/.test(el.getAttribute('style')||'')||el.closest('[data-reveal],[data-stagger],.lx-reveal'))continue;
    el.classList.add('lx-reveal');io.observe(el);
   }
  }
  const start=()=>{scan(document.body);new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)scan(n);}).observe(document.body,{childList:true,subtree:true});};
  if(window.BimCarArrival?.loading)addEventListener('bimcar:arrival-complete',start,{once:true});else start();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

/* Slide the hand with keys in from the edge when its section scrolls into view */
(function(){
 const hands=document.querySelectorAll('.key-hand');if(!hands.length)return;
 if(!('IntersectionObserver' in window)){hands.forEach(h=>h.classList.add('is-in'));return;}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.key-hand').forEach(h=>h.classList.add('is-in'));io.unobserve(e.target);}}),{threshold:.3});
 hands.forEach(h=>io.observe(h.parentElement));
})();

/* Rental company banner: draw the chart, count the numbers up, slide the list in */
(function(){
 const box=document.querySelector('.rent-promo');if(!box)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const go=()=>{box.classList.add('is-in');if(reduced)return;box.querySelectorAll('[data-count]').forEach(el=>{const end=+el.dataset.count,t0=performance.now(),d=1200;const step=t=>{const k=Math.min(1,(t-t0)/d);el.textContent=Math.round(end*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);};el.textContent='0';requestAnimationFrame(step);});};
 if(!('IntersectionObserver' in window)){go();return;}
 const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){go();io.disconnect();}},{threshold:.3});io.observe(box);
})();
