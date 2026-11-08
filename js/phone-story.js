/* Home page phone story (fictional, nothing is really sent):
   1. A visitor calls and messages rental companies and gets nowhere.
   2. They open their browser, type "BimCar Connect", search and request a car.
   3. They sort out the details with the company in Messages and get confirmed. */
(()=>{
 const host=document.getElementById('phone-story');if(!host||host.dataset.initialized)return;host.dataset.initialized='true';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const I={
  phone:'<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/></svg>',
  out:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tick:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 4.5 6.5 11.5 3 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search:'<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10.6 10.6 3.6 3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  lock:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.8" fill="currentColor"/><path d="M5.3 7V5.2a2.7 2.7 0 0 1 5.4 0V7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  cal:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="12" rx="2.5" fill="currentColor"/><rect x="1.5" y="5.5" width="13" height="1.4" fill="#fff" opacity=".9"/></svg>',
  shield:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 2.5 3v4.6c0 3.4 2.4 6.2 5.5 7.4 3.1-1.2 5.5-4 5.5-7.4V3z" fill="currentColor"/><path d="m5.4 8 1.8 1.8L10.8 6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  car:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 4.3A2 2 0 0 1 5.1 3h5.8a2 2 0 0 1 1.9 1.3L14 7.5V12a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-.5H5v.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5zM4.5 7h7l-.8-2.2a.8.8 0 0 0-.7-.5H6a.8.8 0 0 0-.7.5z" fill="currentColor"/></svg>',
  seat:'<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5.5" cy="4.5" r="2.3" fill="currentColor"/><circle cx="11" cy="5" r="1.9" fill="currentColor"/><path d="M1.5 13c0-2.5 1.8-4.3 4-4.3s4 1.8 4 4.3zM10 13c0-1.7-.5-3-1.4-3.8.6-.3 1.5-.5 2.4-.5 1.9 0 3.5 1.7 3.5 4.3z" fill="currentColor"/></svg>',
  gear:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.4 1.2 9.8 3a5.3 5.3 0 0 1 1.4.8l1.7-.6 1.4 2.4-1.4 1.2a5 5 0 0 1 0 1.6l1.4 1.2-1.4 2.4-1.7-.6a5.3 5.3 0 0 1-1.4.8l-.4 1.8H6.6L6.2 13a5.3 5.3 0 0 1-1.4-.8l-1.7.6-1.4-2.4L3.1 9.2a5 5 0 0 1 0-1.6L1.7 6.4l1.4-2.4 1.7.6A5.3 5.3 0 0 1 6.2 3l.4-1.8zM8 5.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z" fill="currentColor"/></svg>',
  fuel:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5A1.5 1.5 0 0 1 4 1h5a1.5 1.5 0 0 1 1.5 1.5V14h-8zM4 3v3.5h5V3z" fill="currentColor"/></svg>',
  chat:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5c-3.6 0-6.5 2.5-6.5 5.6 0 1.6.8 3.1 2.1 4.1L3 14.5l3.4-1.8c.5.1 1 .2 1.6.2 3.6 0 6.5-2.5 6.5-5.7S11.6 1.5 8 1.5z" fill="#fff"/><circle cx="5" cy="7.2" r="1" fill="#8A3FFD"/><circle cx="8" cy="7.2" r="1" fill="#8A3FFD"/><circle cx="11" cy="7.2" r="1" fill="#8A3FFD"/></svg>',
  clip:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 4.5 5.6 9.4a1.4 1.4 0 0 0 2 2l5.2-5.2a2.8 2.8 0 0 0-4-4L3.5 7.5a4.2 4.2 0 0 0 6 6l4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
 };
 host.innerHTML='<div class="phone-frame"><img class="phone-frame-art" src="img/ui/phone-mockup.png" alt="" aria-hidden="true" decoding="async"><div class="phone-display ph2"><div class="phone-status" aria-hidden="true"><span class="phone-clock">9:41</span><span class="phone-signal">▮▮▮ ▰</span></div><div class="ph-app" role="img" aria-label="Animated example: calling rental companies with no luck, then finding and booking a car on BimCar Connect"></div><div class="ph-toast" aria-hidden="true"></div></div><img class="phone-hardware-art" src="img/ui/phone-mockup.png" alt="" aria-hidden="true" decoding="async"><span class="ph-vibe ph-vibe-l" aria-hidden="true"></span><span class="ph-vibe ph-vibe-r" aria-hidden="true"></span></div><img class="phone-keys-hand" src="img/people/hand-keys.webp" width="900" height="509" alt="" aria-hidden="true" decoding="async">';
 const app=host.querySelector('.ph-app'),frame=host.querySelector('.phone-frame'),clock=host.querySelector('.phone-clock'),toast=host.querySelector('.ph-toast');

 /* ---------- Optional sound (off until the visitor turns it on; made in code, no audio files) ---------- */
 let ac=null,soundOn=false,ringTimer=null;
 const tone=(f,t0,dur,type='sine',vol=.12,f2)=>{if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.05);};
 const sfx={
  ring(){[0,.45].forEach(d=>{tone(440,d,.38,'sine',.07);tone(480,d,.38,'sine',.07);});},
  buzz(){[0,.18].forEach(d=>tone(150,d,.14,'sawtooth',.035));},
  ding(){tone(1046,0,.18,'sine',.09);tone(1568,.09,.32,'sine',.07);},
  tap(){tone(1900,0,.035,'square',.025);},
  type(){tone(2400+Math.random()*400,0,.02,'square',.012);},
  success(){[523,659,784,1046].forEach((f,i)=>tone(f,i*.11,.35,'triangle',.08));},
  keys(){for(let i=0;i<7;i++)tone(3000+Math.random()*2500,.05+i*.06+Math.random()*.03,.12,'sine',.03);}
 };
 const play=n=>{if(soundOn&&ac&&ac.state==='running')try{sfx[n]();}catch{}};
 const startRing=()=>{stopRing();if(!soundOn)return;play('ring');ringTimer=setInterval(()=>play('ring'),1600);};
 const stopRing=()=>{clearInterval(ringTimer);ringTimer=null;};
 const soundBtn=document.createElement('button');soundBtn.type='button';soundBtn.className='ph-sound';soundBtn.setAttribute('aria-pressed','false');
 const spk=on=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor"/>${on?'<path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.7a6 6 0 0 1 0 8.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>':'<path d="m10.5 6 4 4m0-4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'}</svg>`;
 const paintBtn=()=>{soundBtn.innerHTML=spk(soundOn)+`<span>${soundOn?'Sound on':'Sound off'}</span>`;soundBtn.setAttribute('aria-pressed',String(soundOn));soundBtn.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');};
 soundBtn.addEventListener('click',async()=>{soundOn=!soundOn;if(soundOn){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();await ac.resume();play('ding');if(host.classList.contains('is-calling'))startRing();}catch{soundOn=false;}}else stopRing();paintBtn();});
 if(window.AudioContext||window.webkitAudioContext){paintBtn();host.appendChild(soundBtn);}
 const $=sel=>app.querySelector(sel);
 const show=(name,html)=>{app.dataset.scene=name;app.innerHTML=`<div class="ph-scene ph-s-${name}">${html}</div>`;};
 const buzz=()=>{play('buzz');frame.classList.remove('is-buzzing');void frame.offsetWidth;frame.classList.add('is-buzzing');};
 const notify=(from,text)=>{toast.innerHTML=`<span class="ph-toast-ic">${I.chat}</span><div><b>${from}</b><span>${text}</span></div>`;toast.classList.remove('on');void toast.offsetWidth;toast.classList.add('on');buzz();play('ding');};
 const tap=sel=>{const el=$(sel);if(!el)return;play('tap');el.classList.add('ph-tapped');const r=document.createElement('span');r.className='pa-ripple';el.appendChild(r);};
 const type=(sel,text,ms)=>{const el=$(sel);if(!el)return;el.textContent='';el.classList.add('is-typing');let i=0;const step=()=>{if(!el.isConnected)return;el.textContent=text.slice(0,++i);if(i%2)play('type');if(i<text.length)setTimeout(step,ms);else el.classList.remove('is-typing');};step();};

 /* ---------- Part 1: calling around ---------- */
 const calls=[
  ['South Coast Rentals','SC','No answer','9:41'],['Island Wheels','IW','Fully booked','9:44'],['Coral Bay Cars','CB','Voicemail','9:47'],
  ['Bajan Auto Hire','BA','No automatics','9:52'],['Sunset Drive','SD','Busy','9:55'],['Gold Coast Cars','GC','No answer','9:58'],
  ['Palm Tree Rentals','PT','Call back Monday','10:03'],['Oistins Car Hire','OC','No answer','10:07'],['West Bay Rentals','WB','Fully booked','10:12']
 ];
 const callRow=(c,i)=>`<li class="ph-call ${/booked|automatics|Monday/.test(c[2])?'is-no':'is-miss'}" style="--d:${i}"><span class="ph-av">${c[1]}</span><div><b>${c[0]}</b><span>${I.out}${c[2]}</span></div><time>${c[3]}</time></li>`;
 function callsScene(){show('calls',`<div class="ph-calls-head"><b>Recents</b><span class="ph-count"><em>0</em> calls today</span></div><ul class="ph-call-list"></ul><div class="ph-dialing" hidden><span class="ph-dial-av"></span><b class="ph-dial-name"></b><span class="ph-dial-state">Calling…</span><span class="ph-dial-dots"><i></i><i></i><i></i></span><span class="ph-dial-end">${I.phone}</span></div>`);}
 function dial(c){const d=$('.ph-dialing');if(!d)return;d.hidden=false;d.querySelector('.ph-dial-av').textContent=c[1];d.querySelector('.ph-dial-name').textContent=c[0];d.querySelector('.ph-dial-state').textContent='Calling…';host.classList.add('is-calling');startRing();}
 function hang(c){stopRing();play('tap');const d=$('.ph-dialing');if(d){d.querySelector('.ph-dial-state').textContent=c[2];setTimeout(()=>{d.hidden=true;host.classList.remove('is-calling');},420);}}
 function logCall(i){const list=$('.ph-call-list');if(!list)return;clock.textContent=calls[i][3];list.insertAdjacentHTML('afterbegin',callRow(calls[i],0));while(list.children.length>8)list.lastElementChild.remove();const n=$('.ph-count em');if(n)n.textContent=i+1;}
 const whats=[['Island Wheels','Only a manual left for those dates. BBD $160 a day.'],['Coral Bay Cars','Sorry, we are fully booked 12th to 19th.'],['Bajan Auto Hire','No automatics until January, sorry!']];
 function waScene(){clock.textContent='10:19';show('wa',`<div class="ph-wa-head"><span class="ph-av">IW</span><div><b>Rental enquiries</b><span>4 chats</span></div></div><div class="ph-wa-thread"><div class="ph-wa me">Hi, any automatic free 12th to 19th Dec? Airport pick-up.<time>10:19 ✓✓</time></div></div>`);}
 function waReply(i){const t=$('.ph-wa-thread');if(!t)return;t.insertAdjacentHTML('beforeend',`<div class="ph-wa"><small>${whats[i][0]}</small>${whats[i][1]}<time>10:${24+i*3}</time></div>`);clock.textContent='10:'+(24+i*3);notify(whats[i][0],whats[i][1]);}
 function stuck(){const t=$('.ph-wa-thread');if(t)t.insertAdjacentHTML('beforeend','<div class="ph-stuck"><b>9 calls · 4 chats · over an hour</b><span>Still no automatic for 12 to 19 Dec.</span></div>');}

 /* ---------- Part 2: the browser and BimCar Connect ---------- */
 const browserBar=(text,typing)=>`<div class="ph-urlbar"><span class="ph-url">${typing?'':I.lock}<em class="ph-url-text">${text}</em></span></div>`;
 const siteHeader='<div class="ps-header"><img src="img/brand/bimcar-connect.png" alt="" width="2066" height="761"><span class="ps-burger"><i></i><i></i><i></i></span></div><svg class="ps-wave2" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0h300v5c-55-6-95 7-150 5S50 1 0 7z"/></svg>';
 function browserScene(){clock.textContent='10:31';frame.classList.add('phone-switch');show('browser',`<div class="ph-urlbar is-focus"><span class="ph-url">${I.search}<em class="ph-url-text"></em></span><span class="ph-cancel">Cancel</span></div><div class="ph-start"><b>Favourites</b><div class="ph-favs"><i></i><i></i><i></i><i></i></div><div class="ph-suggest" hidden><span class="ph-sg-ic">${I.search}</span><div><b>BimCar Connect</b><span>Compare rental cars across Barbados</span></div></div></div>`);setTimeout(()=>type('.ph-url-text','bimcar connect',70),350);}
 function suggest(){frame.classList.remove('phone-switch');const s=$('.ph-suggest');if(s)s.hidden=false;}
 function loadSite(){show('site',browserBar('BimCar Connect')+'<div class="ph-load"><i></i></div><div class="ph-page">'+siteHeader+`<div class="ph-page-body"><h4 class="ph-site-title">One search. More island.</h4><div class="ps-booking"><div class="ps-booking-top"><span class="ps-search-ic">${I.search}</span><div><b>Find your car</b><small>Choose your dates. Compare local rentals.</small></div></div><label>Pick-up location<span class="ps-input"><em data-v="pick">Anywhere on the island</em></span></label><div class="ph-two"><label>Pick-up<span class="ps-input">${I.cal}<em data-v="from">Tue 10 Nov</em></span></label><label>Drop-off<span class="ps-input">${I.cal}<em data-v="to">Sun 15 Nov</em></span></label></div><label>Vehicle type<span class="ps-input"><em data-v="type">Any type</em></span></label><span class="ps-btn ps-find">${I.search}Find my car</span></div></div></div>`);}
 function fill(){type('[data-v=pick]','Grantley Adams Airport',28);setTimeout(()=>type('[data-v=from]','Sat 12 Dec',40),700);setTimeout(()=>type('[data-v=to]','Sat 19 Dec',40),1150);setTimeout(()=>type('[data-v=type]','Automatic',45),1600);}
 const cars=[{name:'Suzuki Swift',co:'Sunset Car Hire',price:95,img:'img/swift-white.jpg',type:'Compact'},{name:'Toyota RAV4',co:'Blue Reef Rentals',price:140,img:'img/rav4-black.jpg',type:'SUV'}];
 const vcard=(c,i)=>`<article class="ps-vcard" style="--i:${i}"><div class="ps-media"><img src="${c.img}" alt="" decoding="async"></div><div class="ps-vbody"><div class="ps-vtop"><b class="ph-name">${c.name}</b><span class="ps-type">${I.car}${c.type}</span></div><div class="ps-co"><span>${c.co}</span><span class="ps-verified">${I.shield}Verified</span></div><div class="ps-specs"><span>${I.seat}5 Seats</span><span>${I.gear}Auto</span><span>${I.fuel}Petrol</span></div><div class="ps-vfoot"><div><b>BBD $${c.price}</b><small>/day</small></div><span class="ps-btn ps-book">Book now</span></div></div></article>`;
 function results(){clock.textContent='10:33';show('results',browserBar('BimCar Connect')+'<div class="ph-page">'+siteHeader+`<div class="ph-page-body"><div class="ph-res-head"><b>6 cars free</b><span>12 to 19 Dec · Automatic · Airport</span></div>${vcard(cars[0],0)}${vcard(cars[1],1)}</div></div>`);}
 function vehicle(){const c=cars[0];show('vehicle',browserBar('BimCar Connect')+'<div class="ph-page">'+siteHeader+`<div class="ph-page-body"><p class="ps-crumbs">Home / Find a vehicle / <span>${c.name}</span></p><h4 class="ph-name ph-vtitle">${c.name}</h4><p class="ph-sub">${c.co} · Airport pick-up</p><div class="ps-photo"><img src="${c.img}" alt="" decoding="async"></div><ul class="ph-reqs"><li>${I.tick}Drivers 23+ · licence held 2+ years</li><li>${I.tick}BBD $300 refundable deposit</li></ul></div></div><div class="ps-requestbar"><div><small>12 to 19 Dec · 7 days</small><b>BBD $${c.price*7}</b></div><span class="ps-btn ps-send">Send request</span></div>`);}

 /* ---------- Part 3: sorting it out in Messages ---------- */
 function chat(){clock.textContent='10:35';show('chat',`<div class="ps-chat"><div class="ps-chat-top"><span class="ps-chat-ic">${I.chat}</span><div><b class="ph-name">Messages</b><small>Your rental conversations</small></div><span class="ps-x">×</span></div><div class="ps-convo"><div class="ps-convo-head"><span class="ps-avatar">SC</span><div><b>Sunset Car Hire</b><small>Suzuki Swift · 12 to 19 Dec</small><div class="ps-status-row"><span class="ps-chip ps-chip-req">● Request sent</span></div></div></div></div><div class="ph-thread"><div class="ps-msg me"><p>Hi! I'd like the Swift 12 to 19 Dec. I land at 2pm.</p><span>10:35 · ✓ Sent</span></div></div><div class="ps-compose"><span>Write to the rental team…</span><b class="ps-btn">Send</b></div><div class="pa-confetti" aria-hidden="true">${'<i></i>'.repeat(14)}</div></div>`);}
 const say=(html,me,time)=>{const t=$('.ph-thread');if(!t)return;t.querySelector('.ps-typing')?.remove();if(me)play('tap');t.insertAdjacentHTML('beforeend',`<div class="ps-msg${me?' me':''}">${me?'':'<small>Sunset Car Hire</small>'}<p>${html}</p><span>${time}${me?' · ✓ Sent':''}</span></div>`);while(t.children.length>4)t.firstElementChild.remove();clock.textContent=time;if(!me){buzz();play('ding');}};
 const typing=()=>{const t=$('.ph-thread');if(t)t.insertAdjacentHTML('beforeend','<div class="ps-typing"><span><i></i><i></i><i></i></span>Rental team is typing…</div>');};
 function confirmed(){const chip=$('.ps-chip');if(chip){chip.className='ps-chip ps-chip-ok';chip.textContent='● Confirmed';}$('.ps-chat')?.classList.add('is-confirmed');buzz();play('success');setTimeout(()=>play('keys'),700);frame.classList.add('phone-celebrate');setTimeout(()=>host.classList.add('keys-in'),650);host.classList.add('phone-finished');}

 const steps=[
  [callsScene,250],
  [()=>dial(calls[0]),1000],[()=>{hang(calls[0]);logCall(0);},650],
  [()=>dial(calls[1]),900],[()=>{hang(calls[1]);logCall(1);},600],
  [()=>logCall(2),380],[()=>logCall(3),340],[()=>logCall(4),300],[()=>logCall(5),280],[()=>logCall(6),280],
  [()=>dial(calls[7]),800],[()=>{hang(calls[7]);logCall(7);},500],[()=>logCall(8),900],
  [waScene,900],[()=>waReply(0),1100],[()=>waReply(1),1000],[()=>waReply(2),1100],[stuck,2300],
  [browserScene,1700],[suggest,600],[()=>tap('.ph-suggest'),450],
  [loadSite,900],[fill,2300],[()=>tap('.ps-find'),550],
  [results,1900],[()=>tap('.ps-book'),500],
  [vehicle,1700],[()=>tap('.ps-send'),550],
  [chat,900],[typing,1100],
  [()=>say('Hi! It\'s free. Please send a photo of your licence and the driver\'s age.',false,'10:38'),1500],
  [()=>say(`<span class="ph-attach">${I.clip}licence-photo.jpg</span> Driver is 34.`,true,'10:40'),900],[typing,1000],
  [()=>say('Thanks! A BBD $300 deposit holds it. Bank transfer or card at pick-up.',false,'10:44'),1500],
  [()=>say('Transfer sent.',true,'10:47'),900],[typing,1000],
  [()=>say('Received. You\'re booked! We\'ll meet you at arrivals with the keys.',false,'10:52'),500],
  [confirmed,0]
 ];
 let i=0,timer=null,deadline=0,remaining=300,visible=false,done=false;
 const shouldRun=()=>visible&&!document.hidden&&!done;
 function schedule(){clearTimeout(timer);timer=null;if(!shouldRun())return;deadline=Date.now()+remaining;timer=setTimeout(advance,remaining);}
 function advance(){timer=null;if(!shouldRun())return;const [fn,wait]=steps[i++];fn();if(i>=steps.length){done=true;return;}remaining=wait;schedule();}
 function pause(){stopRing();if(timer){remaining=Math.max(0,deadline-Date.now());clearTimeout(timer);timer=null;}}
 function state(){if(shouldRun())schedule();else pause();}
 if(reduced){
  host.dataset.reducedMotion='true';chat();
  const t=$('.ph-thread');t.innerHTML='<div class="ph-stuck"><b>Before: 9 calls · 4 chats · over an hour</b><span>Still no automatic.</span></div>';
  say('Hi! It\'s free. Please send a photo of your licence and the driver\'s age.',false,'10:38');say('Received. You\'re booked! We\'ll meet you at arrivals with the keys.',false,'10:52');
  const chip=$('.ps-chip');chip.className='ps-chip ps-chip-ok';chip.textContent='● Confirmed';host.classList.add('keys-in','phone-finished');return;
 }
 callsScene();
 document.addEventListener('visibilitychange',state);window.addEventListener('pagehide',pause);
 if('IntersectionObserver' in window){new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);state();},{threshold:.25}).observe(host);}else{visible=true;schedule();}
})();
