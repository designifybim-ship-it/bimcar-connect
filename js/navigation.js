/* Details menus retain native keyboard behavior and close predictably. */
(()=>{
 const legacy={daily:'advertise-daily.html',weekly:'advertise-weekly.html',monthly:'advertise-monthly.html','creative-support':'advertise-creative.html'};
 if(location.pathname.endsWith('/advertise.html')&&legacy[location.hash.slice(1)]){location.replace(legacy[location.hash.slice(1)]);return;}

 const menus=()=>[...document.querySelectorAll('[data-advertising-nav]')];
 // Add decorative route icons without changing native link text or destinations.
 const adIcons={
  'advertise.html':'M1 1h6v6H1zm8 0h6v6H9zM1 9h6v6H1zm8 0h6v6H9z',
  'advertise-daily.html':'M4 0h1v2h6V0h1v2h2a2 2 0 0 1 2 2v1H0V4a2 2 0 0 1 2-2h2zM0 6h16v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4 3v4h4V9z',
  'advertise-weekly.html':'M4 0h1v2h6V0h1v2h2a2 2 0 0 1 2 2v1H0V4a2 2 0 0 1 2-2h2zM0 6h16v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm3 3v2h2V9zm4 0v2h2V9zm4 0v2h2V9z',
  'advertise-monthly.html':'M4 0h1v2h6V0h1v2h2a2 2 0 0 1 2 2v1H0V4a2 2 0 0 1 2-2h2zM0 6h16v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm3 3v2h2V9zm4 0v2h2V9zm4 0v2h2V9zm-8 3v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z',
  'advertise-creative.html':'M12.5.5a2.12 2.12 0 0 1 3 3L7 12l-4 1 1-4zM2 11l3 3H1z'
 };
 function decorate(){menus().forEach(menu=>menu.querySelectorAll('.ad-dropdown-links>a').forEach(link=>{
  if(link.dataset.adDecorated)return;const file=new URL(link.href,location.href).pathname.split('/').pop(),shape=adIcons[file];if(!shape)return;
  link.dataset.adDecorated='true';const label=document.createElement('span');label.className='ad-nav-label';label.textContent=link.textContent.trim();
  const icon=document.createElement('span');icon.className='ad-nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="'+shape+'"/></svg>';
  const arrow=document.createElement('span');arrow.className='ad-nav-arrow';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 16 16" width="14" height="14"><path d="M1.5 7.25h10.19L7.22 2.78l1.06-1.06L14.56 8l-6.28 6.28-1.06-1.06 4.47-4.47H1.5z"/></svg>';
  link.replaceChildren(icon,label,arrow);
 }));}
 decorate();document.addEventListener('DOMContentLoaded',decorate,{once:true});window.addEventListener('drivebim:ready',decorate);
 const close=(except=null)=>menus().forEach(menu=>{if(menu!==except)menu.open=false;});
 document.addEventListener('toggle',e=>{if(e.target.matches?.('[data-advertising-nav]')&&e.target.open)close(e.target);},true);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-advertising-nav]'))close();});
 document.addEventListener('click',e=>{if(e.target.closest('[data-advertising-nav] a[href]'))close();});
 document.addEventListener('keydown',e=>{
  const menu=e.target.closest?.('[data-advertising-nav]');
  if(e.key==='Escape'){
   const open=menus().find(item=>item.open);if(!open)return;
   e.preventDefault();e.stopPropagation();close();open.querySelector('summary').focus({preventScroll:true});return;
  }
  if(!menu)return;
  const links=[...menu.querySelectorAll('.ad-dropdown-links a')];
  if(e.key==='ArrowDown'&&e.target.tagName==='SUMMARY'){
   e.preventDefault();menu.open=true;links[0]?.focus();return;
  }
  if(!menu.open||!links.includes(e.target))return;
  const current=links.indexOf(e.target);let index=null;
  if(e.key==='ArrowDown')index=(current+1)%links.length;
  if(e.key==='ArrowUp')index=(current-1+links.length)%links.length;
  if(e.key==='Home')index=0;if(e.key==='End')index=links.length-1;
  if(index!==null){e.preventDefault();links[index]?.focus();}
 },true);
 window.addEventListener('resize',()=>close());
})();
