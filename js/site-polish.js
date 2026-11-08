/* Small, progressive text motion and a truthful cookie/browser-storage notice. */
(()=>{
 if(window.BimCarPolish)return;
 const key='bimcar.storage-notice.v1',motion=matchMedia('(prefers-reduced-motion: reduce)');
 let notice=null,opener=null,acknowledged=false;
 try{acknowledged=localStorage.getItem(key)==='acknowledged';}catch{}
 const arrivalOpen=()=>!!document.querySelector('.island-arrival:not(.arrived)');
 function dismiss(){
  acknowledged=true;try{localStorage.setItem(key,'acknowledged');}catch{}
  const restore=notice?.contains(document.activeElement);notice?.remove();notice=null;
  if(restore)opener?.focus?.({preventScroll:true});opener=null;
  document.body.classList.remove('has-storage-notice');
  window.dispatchEvent(new CustomEvent('bimcar:storage-notice-closed'));
 }
 function show(manual=false){
  if(notice){if(manual)notice.querySelector('button').focus();return;}
  if(!manual&&acknowledged)return;
  if(arrivalOpen()){setTimeout(()=>show(manual),300);return;}
  if(manual)opener=document.activeElement;
  notice=document.createElement('aside');notice.className='cookie-notice';notice.setAttribute('role','region');notice.setAttribute('aria-labelledby','storage-notice-title');
  notice.innerHTML='<div><strong id="storage-notice-title">Cookies &amp; your privacy</strong><p>We use essential browser storage for sign-in and to remember your choices. This site does not add advertising or analytics trackers.</p></div><div class="cookie-notice-actions"><button type="button">Got it</button><a href="legal.html#cookies">How storage works</a></div>';
  document.body.appendChild(notice);document.body.classList.add('has-storage-notice');notice.querySelector('button').addEventListener('click',dismiss);
  if(manual)notice.querySelector('button').focus({preventScroll:true});
 }
 window.BimCarPolish={showNotice:()=>show(true),get noticePending(){return !acknowledged;}};
 document.addEventListener('click',e=>{if(e.target.closest('[data-storage-notice]')){e.preventDefault();show(true);}});
 function ready(){
  show();
  document.querySelectorAll('.word-banner').forEach(banner=>{
   const button=banner.querySelector('.word-banner-toggle');if(!button)return;
   let paused=motion.matches;
   const draw=()=>{banner.classList.toggle('is-paused',paused);button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Play scrolling text':'Pause scrolling text';};
   button.addEventListener('click',()=>{paused=!paused;draw();});
   motion.addEventListener?.('change',e=>{paused=e.matches;draw();});draw();
  });
  if(motion.matches||!('IntersectionObserver'in window))return;
  const seen=new WeakSet(),observer=new IntersectionObserver(entries=>entries.forEach(en=>{
   if(en.isIntersecting){en.target.classList.add('text-arrive');observer.unobserve(en.target);}
  }),{threshold:.12});
  const selector='main h1,main h2,main h3,main .lede,main .section-head .muted,.site-footer h4';
  function scan(root){const nodes=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];for(const el of nodes){if(seen.has(el)||el.closest('.phone-story,.chat-sidebar,.modal,.site-tour,[hidden]'))continue;seen.add(el);observer.observe(el);}}
  scan(document);
  new MutationObserver(records=>{for(const record of records)for(const el of record.addedNodes)if(el.nodeType===1)scan(el);}).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
