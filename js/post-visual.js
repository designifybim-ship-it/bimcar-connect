/* BimCar Connect: visual article editor.
   You edit the article as it looks (text, headings, photos), never raw code.
   Underneath it still saves the same simple article format the site already
   reads, so old posts open as they are and the public pages don't change.

   Model: an ordered list of blocks.
     {t:'p'|'h2'|'h3'|'quote', html}   text you type, with bold, italic and links
     {t:'ul'|'ol', items:[html]}        bullet or numbered list
     {t:'hr'} divider    {t:'video', url} YouTube video
     {t:'photos', layout, photos:[{url, a, b}]}   one group of photos
   Photo layouts that hold several photos (grid, polaroids, pile, stories)
   automatically join a neighbouring group of the same kind, the same way the
   public page shows them, so what you see here is what readers get. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG=/^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)(?:\{([\w-]+)\})?$/;
const YT=/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,20})\S*$/;
const LINK_OK=u=>/^(?:https:\/\/[^\s)]+|mailto:[^\s)]+|[\w-]+\.html(?:\?p=[\w-]+)?(?:#[\w-]+)?)$/.test(u);

/* Photo layouts. multi: can hold several photos. two: has two caption boxes. */
const LAYOUTS={
 grid:{label:'Grid / full width',tag:'',multi:true,hint:n=>n>1?'An even grid of photos. Tap any photo to open the gallery.':'One full-width photo.'},
 polaroid:{label:'Polaroids',tag:'polaroid',multi:true,hint:n=>n>1?'A neat row of prints, slightly tilted.':'One print beside your text.'},
 pile:{label:'Photo pile',tag:'pile',multi:true,hint:()=>'A stack of prints. Readers tap it to open the gallery.'},
 story:{label:'Business stories',tag:'story',multi:true,two:['Business name','News, e.g. New menu from 6pm'],hint:()=>'Instagram-style story circles. Same business name = one circle. Labelled as a paid feature.'},
 featured:{label:'Featured person',tag:'featured',two:['Name','Business or role'],hint:()=>'A large card introducing an owner or local.'},
 wide:{label:'One photo, extra wide',tag:'wide',hint:()=>'Wider than the text.'},
 medium:{label:'One photo, medium',tag:'medium',hint:()=>'Centred, a little narrower than the text.'},
 small:{label:'One photo, small',tag:'small',hint:()=>'Small and centred.'},
 left:{label:'One photo, left of text',tag:'left',hint:()=>'Your text wraps around it on the right.'},
 right:{label:'One photo, right of text',tag:'right',hint:()=>'Your text wraps around it on the left.'},
 'polaroid-left':{label:'One polaroid, left',tag:'polaroid-left',hint:()=>'A print on the left with text beside it.'},
 'polaroid-right':{label:'One polaroid, right',tag:'polaroid-right',hint:()=>'A print on the right with text beside it.'},
 'polaroid-center':{label:'One polaroid, centred',tag:'polaroid-center',hint:()=>'A print in the middle of the page.'}
};
const TAG2LAY=Object.fromEntries(Object.entries(LAYOUTS).map(([k,v])=>[v.tag,k]));
const joinKey=l=>LAYOUTS[l]?.multi?l:null;
/* single-photo layouts become this when a second photo is added */
const toMulti=l=>LAYOUTS[l]?.multi?l:/^polaroid/.test(l)?'polaroid':'grid';
const PHOTO_MENU=[['grid','Photos or a grid','One photo full width, or several in an even grid'],['polaroid','Polaroids','A row of prints, or one beside your text'],['pile','Photo pile','A stack of prints that opens a gallery'],['story','Business stories','Instagram-style circles (paid feature)'],['featured','Featured person','An owner or local with their name and business']];

/* ---------- article format <-> blocks ---------- */
function mdInline(t){return esc(t)
 .replace(/\[([^\]]+)\]\(((?:https:\/\/|mailto:)[^)\s]+|[\w-]+\.html(?:\?p=[\w-]+)?(?:#[\w-]+)?)\)/g,'<a href="$2">$1</a>')
 .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>');}
const tidy=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[\u200b\r\n\t]/g,' ').replace(/ {2,}/g,' ').trim();
const wrapMd=(t,m)=>{const x=t.match(/^(\s*)([\s\S]*?)(\s*)$/);return x[2]?x[1]+m+x[2]+m+x[3]:t;};
function htmlToMd(html){const d=document.createElement('div');d.innerHTML=html||'';
 const walk=node=>{let s='';node.childNodes.forEach(n=>{if(n.nodeType===3){s+=n.textContent.replace(/\*/g,'∗');return;}if(n.nodeType!==1)return;const tag=n.tagName,inner=walk(n);
  if(tag==='BR')s+=' ';
  else if(tag==='B'||tag==='STRONG'||(n.style&&/^(bold|[6-9]00)$/.test(n.style.fontWeight)))s+=wrapMd(inner,'**');
  else if(tag==='I'||tag==='EM'||(n.style&&n.style.fontStyle==='italic'))s+=wrapMd(inner,'*');
  else if(tag==='A'){const h=n.getAttribute('href')||'';s+=LINK_OK(h)&&inner.trim()?`[${inner.trim().replace(/[\[\]]/g,'')}](${h})`:inner;}
  else if(/^(DIV|P|LI|H\d|BLOCKQUOTE)$/.test(tag))s+=' '+inner+' ';
  else s+=inner;});return s;};
 return tidy(walk(d)).replace(/\*\*\*\*/g,'');}
/* text that would accidentally start a heading, list, quote or photo gets a harmless invisible mark */
const safeStart=s=>/^(#{2,3}\s|>|[-*]\s|\d+[.)]\s|-{3,}$|\*{3,}$|!\[|https:\/\/\S+$)/.test(s)?'\u200b'+s:s;
const capClean=s=>tidy(s).replace(/[\[\]|]/g,' ').replace(/ {2,}/g,' ').trim();

function parse(md){const out=[];let para=[],list=null;
 const flushP=()=>{if(para.length){out.push({t:'p',html:mdInline(para.join(' '))});para=[];}};
 const flushL=()=>{if(list){out.push(list);list=null;}};
 const flush=()=>{flushP();flushL();};
 String(md||'').replace(/\r/g,'').split('\n').forEach(raw=>{const line=raw.trim().replace(/^\u200b/,'');let m;const lit=raw.trim().startsWith('\u200b');
  if(!line){flush();return;}
  if(!lit&&(m=line.match(/^(#{2,3})\s+(.+)/))){flush();out.push({t:m[1].length===2?'h2':'h3',html:mdInline(m[2])});return;}
  if(!lit&&(m=line.match(/^>\s?(.*)/))){flush();out.push({t:'quote',html:mdInline(m[1])});return;}
  if(!lit&&(m=line.match(/^[-*]\s+(.+)/))){flushP();if(!list||list.t!=='ul'){flushL();list={t:'ul',items:[]};}list.items.push(mdInline(m[1]));return;}
  if(!lit&&(m=line.match(/^\d+[.)]\s+(.+)/))){flushP();if(!list||list.t!=='ol'){flushL();list={t:'ol',items:[]};}list.items.push(mdInline(m[1]));return;}
  if(!lit&&/^(-{3,}|\*{3,})$/.test(line)){flush();out.push({t:'hr'});return;}
  if(!lit&&YT.test(line)){flush();out.push({t:'video',url:line});return;}
  if(!lit&&(m=line.match(IMG))){flush();const layout=TAG2LAY[m[3]||'']||'grid',cap=m[1]==='Add a caption'?'':m[1];
   const two=LAYOUTS[layout].two,parts=cap.split('|').map(x=>x.trim());
   const ph={url:m[2],a:two?parts[0]||'':cap,b:two?parts.slice(1).join(' · '):''};
   const last=out[out.length-1];if(last&&last.t==='photos'&&joinKey(last.layout)&&joinKey(last.layout)===joinKey(layout))last.photos.push(ph);
   else if(last&&last.t==='photos'&&layout==='grid'&&last.layout==='grid')last.photos.push(ph);
   else out.push({t:'photos',layout,photos:[ph]});return;}
  if(list)flushL();para.push(line.replace(/∗/g,'*'));});
 flush();return out;}

function serialize(blocks){return blocks.map(b=>{
 if(b.t==='p'){const s=htmlToMd(b.html);return s?safeStart(s):null;}
 if(b.t==='h2'||b.t==='h3'){const s=htmlToMd(b.html);return s?(b.t==='h2'?'## ':'### ')+s:null;}
 if(b.t==='quote'){const s=htmlToMd(b.html);return s?'> '+s:null;}
 if(b.t==='ul'||b.t==='ol'){const it=b.items.map(htmlToMd).filter(Boolean);return it.length?it.map((x,i)=>(b.t==='ul'?'- ':`${i+1}. `)+x).join('\n'):null;}
 if(b.t==='hr')return '---';
 if(b.t==='video')return YT.test(b.url||'')?b.url:null;
 if(b.t==='photos'){const L=LAYOUTS[b.layout]||LAYOUTS.grid,tag=L.tag?`{${L.tag}}`:'';const ph=b.photos.filter(p=>p.url);
  return ph.length?ph.map(p=>{const a=capClean(p.a),bb=capClean(p.b);const cap=L.two?(bb?`${a} | ${bb}`:a):a;return `![${cap}](${p.url})${tag}`;}).join('\n'):null;}
 return null;}).filter(Boolean).join('\n\n')+'\n';}

/* ---------- the editor ---------- */
function mount(root,ta,opts){
 opts=opts||{};let blocks=[],uid=0,cur=null,drag=null,hist=[],fut=[],typingT=null;
 const id=()=>'b'+(++uid);
 const load=md=>{blocks=parse(md).map(b=>({...b,id:id()}));if(!blocks.length||blocks[blocks.length-1].t!=='p')blocks.push({t:'p',html:'',id:id()});};
 const snap=()=>JSON.stringify(blocks);
 const remember=()=>{const s=snap();if(hist[hist.length-1]!==s){hist.push(s);if(hist.length>60)hist.shift();fut=[];}paintUndo();};
 const find=bid=>blocks.findIndex(b=>b.id===bid);
 const sync=()=>{const md=serialize(blocks);if(ta.value!==md){ta.value=md;ta.dispatchEvent(new Event('input',{bubbles:true}));}};
 const isText=b=>b&&/^(p|h2|h3|quote|ul|ol)$/.test(b.t);

 root.classList.add('ve');
 root.innerHTML=`<div class="ve-bar" role="toolbar" aria-label="Article tools">
  <div class="ve-grp" aria-label="Text style"><button type="button" data-cmd="p" title="Normal text">Text</button><button type="button" data-cmd="h2" title="Heading">Heading</button><button type="button" data-cmd="h3" title="Small heading">Subheading</button><button type="button" data-cmd="ul" title="Bullet list">• List</button><button type="button" data-cmd="ol" title="Numbered list">1. List</button><button type="button" data-cmd="quote" title="Quote">“ Quote</button></div>
  <div class="ve-grp" aria-label="Format"><button type="button" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button><button type="button" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button><button type="button" data-cmd="link" title="Link (Ctrl+K)">Link</button></div>
  <div class="ve-grp ve-add-wrap"><button type="button" class="ve-add-btn" data-cmd="add" aria-expanded="false">+ Add</button>
   <div class="ve-menu" hidden><p class="ve-menu-h">Photos</p>${PHOTO_MENU.map(([k,t,d])=>`<button type="button" data-add="photos:${k}"><b>${t}</b><span>${d}</span></button>`).join('')}<p class="ve-menu-h">Other</p><button type="button" data-add="video"><b>YouTube video</b><span>Paste a YouTube link</span></button><button type="button" data-add="hr"><b>Divider line</b><span>A thin line between sections</span></button><button type="button" data-add="p"><b>Paragraph</b><span>A new block of text</span></button></div></div>
  <div class="ve-grp ve-undo"><button type="button" data-cmd="undo" title="Undo" aria-label="Undo">↶</button><button type="button" data-cmd="redo" title="Redo" aria-label="Redo">↷</button></div>
 </div>
 <div class="ve-doc post-body" aria-label="Article"></div>
 <button type="button" class="ve-more" data-cmd="more">Click to keep writing…</button>
 <input type="file" accept="image/*" multiple hidden class="ve-file">`;
 const doc=root.querySelector('.ve-doc'),bar=root.querySelector('.ve-bar'),menu=root.querySelector('.ve-menu'),fileIn=root.querySelector('.ve-file');
 const paintUndo=()=>{bar.querySelector('[data-cmd=undo]').disabled=hist.length<2;bar.querySelector('[data-cmd=redo]').disabled=!fut.length;};

 /* ----- drawing ----- */
 function textEl(b){const ph={p:'Write something…',h2:'Heading',h3:'Subheading',quote:'A quote or tip'}[b.t]||'';
  if(b.t==='ul'||b.t==='ol')return `<${b.t} class="ve-edit" contenteditable="true" data-placeholder="List item">${(b.items.length?b.items:['']).map(x=>`<li>${x}</li>`).join('')}</${b.t}>`;
  const tag={p:'p',h2:'h2',h3:'h3',quote:'blockquote'}[b.t];return `<${tag} class="ve-edit" contenteditable="true" data-placeholder="${ph}">${b.html||''}</${tag}>`;}
 function photoCards(b){const L=LAYOUTS[b.layout]||LAYOUTS.grid;return b.photos.map((p,i)=>`<div class="ve-ph${p.url?'':' is-loading'}" data-pi="${i}" draggable="${p.url?'true':'false'}">
   <div class="ve-ph-img">${p.url?`<img src="${esc(p.url)}" alt="" draggable="false">`:'<span class="ve-spin" aria-label="Uploading"></span>'}
    <div class="ve-ph-acts"><button type="button" data-ve="pleft" title="Move left" aria-label="Move left" ${i===0?'disabled':''}>‹</button><button type="button" data-ve="pright" title="Move right" aria-label="Move right" ${i===b.photos.length-1?'disabled':''}>›</button><button type="button" data-ve="pdel" title="Remove photo" aria-label="Remove photo">✕</button></div></div>
   ${L.two?`<input class="ve-cap" data-cap="a" maxlength="60" placeholder="${esc(L.two[0])}" value="${esc(p.a)}"><input class="ve-cap" data-cap="b" maxlength="140" placeholder="${esc(L.two[1])}" value="${esc(p.b)}">`:`<input class="ve-cap" data-cap="a" maxlength="140" placeholder="Caption (optional)" value="${esc(p.a)}">`}
  </div>`).join('');}
 function photoBlock(b){const n=b.photos.length,L=LAYOUTS[b.layout]||LAYOUTS.grid;
  const opt=(k)=>{const v=LAYOUTS[k];const off=n>1&&!v.multi;return `<option value="${k}" ${k===b.layout?'selected':''} ${off?'disabled':''}>${esc(v.label)}${off?' (one photo only)':''}</option>`;};
  return `<div class="ve-ph-head"><label class="ve-lay">Layout<select data-ve-layout>
    <optgroup label="One or more photos">${['grid','polaroid','pile','story'].map(opt).join('')}</optgroup>
    <optgroup label="One photo">${['featured','wide','medium','small','left','right','polaroid-left','polaroid-right','polaroid-center'].map(opt).join('')}</optgroup></select></label>
   <span class="ve-hint">${esc(L.hint(n))}</span><button type="button" class="ve-addph" data-ve="addph">+ Add photos</button></div>
   <div class="ve-phs lay-${esc(b.layout)}">${photoCards(b)}</div>`;}
 function blockHTML(b,i){const body=isText(b)?textEl(b):b.t==='hr'?'<hr>':b.t==='video'?(()=>{const v=(b.url||'').match(YT);return `<div class="ve-video">${v?`<img src="https://img.youtube.com/vi/${esc(v[1])}/hqdefault.jpg" alt="">`:''}<span class="ve-play">▶</span><span class="ve-vlabel">YouTube video</span><button type="button" data-ve="vid">Change video</button></div>`;})():photoBlock(b);
  return `<div class="ve-b ve-t-${b.t}${b.id===cur?' is-cur':''}" data-id="${b.id}"><div class="ve-side"><span class="ve-grip" draggable="true" title="Drag to move this block" aria-hidden="true">⠿</span></div><div class="ve-main">${body}</div><div class="ve-acts"><button type="button" data-ve="up" title="Move up" aria-label="Move up" ${i===0?'disabled':''}>↑</button><button type="button" data-ve="down" title="Move down" aria-label="Move down" ${i===blocks.length-1?'disabled':''}>↓</button><button type="button" data-ve="del" title="Delete block" aria-label="Delete block">✕</button></div></div>`;}
 function draw(){/* join neighbouring photo groups of the same kind, like the public page */
  for(let i=blocks.length-1;i>0;i--){const a=blocks[i-1],b=blocks[i];if(a.t==='photos'&&b.t==='photos'&&joinKey(a.layout)&&joinKey(a.layout)===joinKey(b.layout)){a.photos.push(...b.photos);blocks.splice(i,1);}}
  blocks=blocks.filter(b=>b.t!=='photos'||b.photos.length);
  if(!blocks.length||blocks[blocks.length-1].t!=='p'&&blocks[blocks.length-1].t!=='h2'&&blocks[blocks.length-1].t!=='h3')blocks.push({t:'p',html:'',id:id()});
  doc.innerHTML=blocks.map(blockHTML).join('');}
 const redrawBlock=b=>{const el=doc.querySelector(`[data-id="${b.id}"]`);if(!el)return draw();const i=find(b.id);const t=document.createElement('div');t.innerHTML=blockHTML(b,i);el.replaceWith(t.firstElementChild);};

 /* ----- caret helpers ----- */
 const editOf=bid=>doc.querySelector(`[data-id="${bid}"] .ve-edit`);
 function place(el,atStart){if(!el)return;el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(!!atStart);const s=getSelection();s.removeAllRanges();s.addRange(r);}
 function focusBlock(bid,atStart){const el=editOf(bid);if(el)place(el,atStart);else doc.querySelector(`[data-id="${bid}"] input,[data-id="${bid}"] select`)?.focus();setCur(bid);}
 function setCur(bid){if(cur===bid)return;doc.querySelector('.ve-b.is-cur')?.classList.remove('is-cur');cur=bid;doc.querySelector(`[data-id="${bid}"]`)?.classList.add('is-cur');}
 const readText=b=>{const el=editOf(b.id);if(!el)return;if(b.t==='ul'||b.t==='ol')b.items=[...el.querySelectorAll('li')].map(li=>li.innerHTML);else b.html=el.innerHTML==='<br>'?'':el.innerHTML;};
 const caretAtStart=el=>{const s=getSelection();if(!s.rangeCount||!s.isCollapsed)return false;const r=s.getRangeAt(0),pre=document.createRange();pre.selectNodeContents(el);pre.setEnd(r.startContainer,r.startOffset);return pre.toString().replace(/\u200b/g,'')===''&&!pre.cloneContents().querySelector?.('img');};
 const insertAfter=(nb,afterId)=>{const i=afterId?find(afterId):blocks.length-1;blocks.splice(i<0?blocks.length:i+1,0,nb);return nb;};

 /* ----- structural actions ----- */
 function convert(t){const b=blocks[find(cur)];if(!b||!isText(b))return;readText(b);remember();
  const html=b.t==='ul'||b.t==='ol'?b.items:[b.html];
  if(t==='ul'||t==='ol'){const items=b.t==='ul'||b.t==='ol'?b.items:[b.html];Object.assign(b,{t,items});delete b.html;}
  else if(b.t==='ul'||b.t==='ol'){const i=find(b.id);const nbs=html.filter(x=>tidy(x.replace(/<[^>]+>/g,''))).map(x=>({t,html:x,id:id()}));if(!nbs.length)nbs.push({t,html:'',id:id()});blocks.splice(i,1,...nbs);cur=nbs[0].id;}
  else{b.t=t;}
  draw();sync();focusBlock(cur);}
 function move(bid,d){const i=find(bid),j=i+d;if(i<0||j<0||j>=blocks.length)return;remember();[blocks[i],blocks[j]]=[blocks[j],blocks[i]];draw();sync();setCur(bid);doc.querySelector(`[data-id="${bid}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
 function del(bid){const i=find(bid);if(i<0)return;remember();blocks.splice(i,1);draw();sync();const nb=blocks[Math.max(0,i-1)];if(nb)focusBlock(nb.id);opts.toast?.('Block removed. Press ↶ to undo.');}
 function addBlock(nb,atEnd){remember();insertAfter(nb,atEnd?null:cur);nb.id=nb.id||id();draw();sync();setCur(nb.id);if(isText(nb))focusBlock(nb.id,true);doc.querySelector(`[data-id="${nb.id}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});return nb;}

 /* ----- photos ----- */
 let pickFor=null;
 function pick(target){pickFor=target;fileIn.multiple=!(target.layout&&!LAYOUTS[target.layout].multi);fileIn.value='';fileIn.click();}
 fileIn.addEventListener('change',()=>{const fs=[...fileIn.files];fileIn.value='';if(fs.length&&pickFor)addPhotos(fs,pickFor);pickFor=null;});
 async function addPhotos(files,target){files=files.filter(f=>/^image\//.test(f.type)).slice(0,20);if(!files.length)return;remember();
  let b=target.bid?blocks[find(target.bid)]:null;
  if(!b){b={t:'photos',layout:target.layout||'grid',photos:[],id:id()};insertAfter(b,cur);}
  if(b.photos.length+files.length>1&&!LAYOUTS[b.layout].multi){b.layout=toMulti(b.layout);opts.toast?.('That layout holds one photo, so these are shown together instead. You can change the layout above the photos.');}
  const slots=files.map(()=>({url:'',a:'',b:''}));b.photos.push(...slots);draw();sync();setCur(b.id);doc.querySelector(`[data-id="${b.id}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});
  for(let i=0;i<files.length;i++){opts.status?.(`Uploading photo ${i+1} of ${files.length}…`);
   try{slots[i].url=await opts.upload(files[i]);}catch(e){opts.status?.(opts.errorText?opts.errorText(e):String(e.message||e));const k=b.photos.indexOf(slots[i]);if(k>-1)b.photos.splice(k,1);}
   if(find(b.id)>-1)redrawBlock(b);}
  b.photos=b.photos.filter(p=>p.url);opts.status?.('');draw();sync();
  const firstCap=doc.querySelector(`[data-id="${b.id}"] .ve-ph:last-child .ve-cap`);if(LAYOUTS[b.layout].two&&firstCap)firstCap.focus();}

 /* ----- links and video ----- */
 let savedRange=null;
 const saveSel=()=>{const s=getSelection();savedRange=s.rangeCount&&doc.contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;};
 const restoreSel=()=>{if(!savedRange)return false;const s=getSelection();s.removeAllRanges();s.addRange(savedRange);return true;};
 async function link(){saveSel();if(!savedRange){opts.toast?.('Click into your text first, then add a link.');return;}
  const a=(savedRange.startContainer.nodeType===1?savedRange.startContainer:savedRange.startContainer.parentElement).closest('a');
  const txt=savedRange.toString();const v=await opts.askLink?.({url:a?.getAttribute('href')||'https://',text:txt,hasText:!!txt||!!a});if(!v)return;
  const ed=(savedRange.startContainer.nodeType===1?savedRange.startContainer:savedRange.startContainer.parentElement).closest('.ve-edit');if(!ed)return;ed.focus();restoreSel();
  if(!v.url){if(a){const r=document.createRange();r.selectNode(a);getSelection().removeAllRanges();getSelection().addRange(r);document.execCommand('unlink');}}
  else if(!LINK_OK(v.url)){opts.toast?.('Links need to start with https:// (for example https://www.visitbarbados.org).');return;}
  else if(a){a.setAttribute('href',v.url);if(v.text)a.textContent=v.text;}
  else if(txt)document.execCommand('createLink',false,v.url);
  else document.execCommand('insertHTML',false,`<a href="${esc(v.url)}">${esc(v.text||v.url)}</a>&nbsp;`);
  const b=blocks[find(ed.closest('.ve-b').dataset.id)];readText(b);remember();sync();}
 async function video(b){const url=await opts.askVideo?.(b?.url||'');if(!url)return;if(!YT.test(url.trim())){opts.toast?.('Paste a YouTube link, for example https://www.youtube.com/watch?v=…');return;}
  if(b){remember();b.url=url.trim();draw();sync();}else addBlock({t:'video',url:url.trim()});}

 /* ----- events ----- */
 bar.addEventListener('mousedown',e=>{if(e.target.closest('[data-cmd=bold],[data-cmd=italic],[data-cmd=link]'))e.preventDefault();});
 bar.addEventListener('click',e=>{const c=e.target.closest('[data-cmd]')?.dataset.cmd;const ad=e.target.closest('[data-add]')?.dataset.add;
  if(ad){menu.hidden=true;bar.querySelector('.ve-add-btn').setAttribute('aria-expanded','false');
   if(ad.startsWith('photos:'))pick({layout:ad.slice(7)});else if(ad==='video')video(null);else if(ad==='hr')addBlock({t:'hr'});else addBlock({t:'p',html:''});return;}
  if(!c)return;
  if(c==='add'){menu.hidden=!menu.hidden;e.target.closest('button').setAttribute('aria-expanded',String(!menu.hidden));return;}
  if(c==='bold'||c==='italic'){document.execCommand(c);const ed=document.activeElement?.closest?.('.ve-edit');if(ed){readText(blocks[find(ed.closest('.ve-b').dataset.id)]);sync();}return;}
  if(c==='link')return link();
  if(c==='undo'||c==='redo'){const from=c==='undo'?hist:fut,to=c==='undo'?fut:hist;if(c==='undo'){if(hist.length<2)return;to.push(from.pop());}else{if(!from.length)return;to.push(from.pop());}
   blocks=JSON.parse(hist[hist.length-1]);draw();sync();paintUndo();return;}
  if(/^(p|h2|h3|quote|ul|ol)$/.test(c)){if(!isText(blocks[find(cur)])){opts.toast?.('Click into a paragraph first.');return;}convert(c);}});
 document.addEventListener('click',e=>{if(!e.target.closest('.ve-add-wrap')){menu.hidden=true;bar.querySelector('.ve-add-btn')?.setAttribute('aria-expanded','false');}});
 root.querySelector('.ve-more').addEventListener('click',()=>{const last=blocks[blocks.length-1];if(last&&last.t==='p'&&!tidy(last.html.replace(/<[^>]+>/g,'')))focusBlock(last.id);else addBlock({t:'p',html:''},true);});

 doc.addEventListener('focusin',e=>{const b=e.target.closest('.ve-b');if(b)setCur(b.dataset.id);});
 doc.addEventListener('input',e=>{const be=e.target.closest('.ve-b');if(!be)return;const b=blocks[find(be.dataset.id)];if(!b)return;
  if(e.target.matches('.ve-cap')){const p=b.photos[+e.target.closest('.ve-ph').dataset.pi];if(p)p[e.target.dataset.cap]=e.target.value;}
  else if(e.target.closest('.ve-edit')){const ed=e.target.closest('.ve-edit');if(!ed.textContent&&!ed.querySelector('img,li+li'))ed.innerHTML=(b.t==='ul'||b.t==='ol')?'<li></li>':'';readText(b);}
  sync();clearTimeout(typingT);typingT=setTimeout(remember,900);});
 doc.addEventListener('change',e=>{const s=e.target.closest('[data-ve-layout]');if(!s)return;const b=blocks[find(s.closest('.ve-b').dataset.id)];remember();b.layout=s.value;draw();sync();setCur(b.id);});
 doc.addEventListener('click',e=>{const a=e.target.closest('[data-ve]');if(!a)return;const be=a.closest('.ve-b'),bid=be.dataset.id,b=blocks[find(bid)],act=a.dataset.ve;
  if(act==='up')return move(bid,-1);if(act==='down')return move(bid,1);if(act==='del')return del(bid);
  if(act==='addph')return pick({bid});if(act==='vid')return video(b);
  const pi=+a.closest('.ve-ph')?.dataset.pi;if(Number.isNaN(pi))return;remember();
  if(act==='pdel'){b.photos.splice(pi,1);opts.toast?.('Photo removed. Press ↶ to undo.');}
  if(act==='pleft'&&pi>0)[b.photos[pi-1],b.photos[pi]]=[b.photos[pi],b.photos[pi-1]];
  if(act==='pright'&&pi<b.photos.length-1)[b.photos[pi+1],b.photos[pi]]=[b.photos[pi],b.photos[pi+1]];
  draw();sync();});

 doc.addEventListener('keydown',e=>{const ed=e.target.closest('.ve-edit');if(!ed)return;const be=ed.closest('.ve-b'),b=blocks[find(be.dataset.id)];
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();link();return;}
  const isList=b.t==='ul'||b.t==='ol';
  if(e.key==='Enter'){
   if(isList){const an=getSelection().anchorNode,li=an&&(an.nodeType===1?an:an.parentElement).closest('li');
    if(li&&!li.textContent.trim()&&!e.shiftKey){e.preventDefault();li.remove();readText(b);b.items=b.items.filter(x=>tidy(x.replace(/<[^>]+>/g,'')));remember();
     let target;if(!b.items.length){Object.assign(b,{t:'p',html:''});delete b.items;target=b;}else{target={t:'p',html:'',id:id()};insertAfter(target,b.id);}
     draw();sync();focusBlock(target.id,true);}
    return;}
   e.preventDefault();if(e.shiftKey)return;
   const s=getSelection();if(!s.rangeCount)return;s.deleteFromDocument();const r=s.getRangeAt(0),tail=document.createRange();tail.selectNodeContents(ed);tail.setStart(r.endContainer,r.endOffset);
   const frag=tail.extractContents(),tmp=document.createElement('div');tmp.append(frag);readText(b);remember();
   const nb={t:'p',html:tidy(tmp.textContent)?tmp.innerHTML:'',id:id()};insertAfter(nb,b.id);draw();sync();focusBlock(nb.id,true);return;}
  if(e.key==='Backspace'&&caretAtStart(ed)&&!isList){const i=find(b.id),prev=blocks[i-1];const empty=!tidy(ed.textContent);
   if(empty&&blocks.length>1){e.preventDefault();remember();blocks.splice(i,1);draw();sync();if(prev&&isText(prev))focusBlock(prev.id);return;}
   if(prev&&/^(p|h2|h3|quote)$/.test(prev.t)&&/^(p|h2|h3|quote)$/.test(b.t)){e.preventDefault();readText(b);remember();const mark='<span id="ve-join"></span>';prev.html=(prev.html||'')+mark+(b.html||'');blocks.splice(i,1);draw();sync();
    const m=doc.querySelector('#ve-join'),pe=m?.closest('.ve-edit');if(pe){pe.focus();const rr=document.createRange();rr.setStartBefore(m);rr.collapse(true);getSelection().removeAllRanges();getSelection().addRange(rr);m.remove();readText(prev);sync();}return;}
   if(empty&&b.t!=='p'){e.preventDefault();b.t='p';draw();sync();focusBlock(b.id,true);}}
  if(e.key==='Backspace'&&isList&&caretAtStart(ed)&&b.items.length<=1&&!tidy(ed.textContent)){e.preventDefault();remember();Object.assign(b,{t:'p',html:''});delete b.items;draw();sync();focusBlock(b.id,true);}});

 /* paste: keep the words, drop outside styling. Pasted photos are uploaded. */
 doc.addEventListener('paste',e=>{const ed=e.target.closest('.ve-edit');const files=[...(e.clipboardData?.files||[])].filter(f=>/^image\//.test(f.type));
  if(files.length){e.preventDefault();addPhotos(files,{layout:'grid'});return;}
  if(!ed)return;e.preventDefault();const text=(e.clipboardData.getData('text/plain')||'').replace(/\r/g,'');const parts=text.split(/\n\s*\n/).map(t=>t.replace(/\s*\n\s*/g,' ').trim()).filter(Boolean);
  if(parts.length<=1){document.execCommand('insertText',false,parts[0]||'');return;}
  document.execCommand('insertText',false,parts[0]);const b=blocks[find(ed.closest('.ve-b').dataset.id)];readText(b);remember();let after=b.id,last=null;
  parts.slice(1).forEach(t=>{last={t:'p',html:esc(t),id:id()};insertAfter(last,after);after=last.id;});draw();sync();focusBlock(last.id);});

 /* drag and drop: blocks by their handle, photos within or between groups, and new photo files */
 doc.addEventListener('dragstart',e=>{const g=e.target.closest?.('.ve-grip'),ph=e.target.closest?.('.ve-ph');
  if(g){const bid=g.closest('.ve-b').dataset.id;drag={kind:'block',bid};e.dataTransfer.setDragImage(g.closest('.ve-b'),20,20);}
  else if(ph&&ph.draggable){drag={kind:'photo',bid:ph.closest('.ve-b').dataset.id,pi:+ph.dataset.pi};}else return;
  e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','');}catch{}doc.classList.add('is-dragging');});
 const clearMarks=()=>doc.querySelectorAll('.drop-before,.drop-after').forEach(x=>x.classList.remove('drop-before','drop-after'));
 doc.addEventListener('dragend',()=>{drag=null;clearMarks();doc.classList.remove('is-dragging','file-over');});
 doc.addEventListener('dragover',e=>{const files=[...(e.dataTransfer?.items||[])].some(i=>i.kind==='file');
  if(files&&!drag){e.preventDefault();doc.classList.add('file-over');return;}if(!drag)return;e.preventDefault();clearMarks();
  if(drag.kind==='photo'){const ph=e.target.closest('.ve-ph');if(ph){const r=ph.getBoundingClientRect();ph.classList.add(e.clientX>r.left+r.width/2?'drop-after':'drop-before');}return;}
  const be=e.target.closest('.ve-b');if(be){const r=be.getBoundingClientRect();be.classList.add(e.clientY>r.top+r.height/2?'drop-after':'drop-before');}});
 doc.addEventListener('dragleave',e=>{if(!doc.contains(e.relatedTarget))doc.classList.remove('file-over');});
 doc.addEventListener('drop',e=>{doc.classList.remove('file-over');
  if(!drag){const fs=[...(e.dataTransfer?.files||[])].filter(f=>/^image\//.test(f.type));if(!fs.length)return;e.preventDefault();const tb=e.target.closest('.ve-b');const tbl=tb&&blocks[find(tb.dataset.id)];
   if(tbl&&tbl.t==='photos')addPhotos(fs,{bid:tbl.id});else{if(tb)setCur(tb.dataset.id);addPhotos(fs,{layout:'grid'});}return;}
  e.preventDefault();const d=drag;drag=null;clearMarks();doc.classList.remove('is-dragging');
  if(d.kind==='block'){const be=e.target.closest('.ve-b');if(!be||be.dataset.id===d.bid)return;const r=be.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;remember();
   const from=find(d.bid),[x]=blocks.splice(from,1);let to=find(be.dataset.id)+(after?1:0);blocks.splice(to,0,x);draw();sync();setCur(x.id);return;}
  const ph=e.target.closest('.ve-ph'),tb=e.target.closest('.ve-b');if(!tb)return;const src=blocks[find(d.bid)],dst=blocks[find(tb.dataset.id)];if(!dst||dst.t!=='photos')return;remember();
  const [p]=src.photos.splice(d.pi,1);let to=ph?+ph.dataset.pi:dst.photos.length;if(ph){const r=ph.getBoundingClientRect();if(e.clientX>r.left+r.width/2)to++;}if(src===dst&&d.pi<to)to--;dst.photos.splice(to,0,p);
  if(dst.photos.length>1&&!LAYOUTS[dst.layout].multi)dst.layout=toMulti(dst.layout);draw();sync();});

 ta.addEventListener('ve-reload',()=>{load(ta.value);hist=[];remember();draw();});
 load(ta.value);draw();remember();{const md=serialize(blocks);if(ta.value.trim()&&ta.value!==md)ta.value=md;}
 return {reload(){load(ta.value);draw();},blocks:()=>blocks,focus(){const f=blocks.find(isText);if(f)focusBlock(f.id);}};
}
window.PostVisual={mount,parse,serialize};
})();
