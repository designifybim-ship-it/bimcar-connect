/* BimCar Connect: visual article editor (the writing canvas).
   You edit the article as it will look; no code, no image links.
   Underneath it saves the simple article format that renderPost() in app.js
   reads, so older posts open unchanged and the public pages stay the same.

   Blocks (in order):
     text    {t:'p'|'h2'|'h3'|'quote'|'callout', html, align}
     list    {t:'ul'|'ol', items:[html]}
     photos  {t:'photos', layout, photos:[{url,a,b}]}   a/b = caption, or name + news
     other   {t:'hr'} {t:'video',url} {t:'spacer',size:'s'|'m'|'l'}
             {t:'button',label,url,style:'button'|'button-outline',align}
   Photo layouts that hold several photos (grid, polaroids, pile, stories) join a
   neighbouring group of the same kind, exactly as the public page shows them. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG=/^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)(?:\{([\w-]+)\})?$/;
const YT=/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,20})\S*$/;
const URLRE='(?:https:\\/\\/|mailto:)[^)\\s]+|[\\w-]+\\.html(?:\\?p=[\\w-]+)?(?:#[\\w-]+)?';
const LINK_OK=u=>new RegExp('^(?:'+URLRE+')$').test(u||'');
const BTN=new RegExp('^\\[([^\\]]+)\\]\\(('+URLRE+')\\)\\{(button|button-outline)\\}$');
const TEXT_T=['p','h2','h3','quote','callout'];
const STYLE_NAMES={p:'Paragraph',h2:'Heading',h3:'Subheading',quote:'Quote',callout:'Callout box'};

/* Photo layouts. multi: holds several photos. two: two caption boxes. crop: shape used by Crop. */
const LAYOUTS={
 grid:{label:'Grid / full width',tag:'',multi:true,crop:[4,3],hint:n=>n>1?'An even grid. Tap any photo to open the gallery.':'One full-width photo.'},
 polaroid:{label:'Polaroids',tag:'polaroid',multi:true,crop:[1,1],hint:n=>n>1?'A neat row of prints, slightly tilted.':'One print beside your text.'},
 pile:{label:'Photo pile',tag:'pile',multi:true,crop:[1,1],hint:()=>'A stack of prints. Readers tap it to open the gallery.'},
 story:{label:'Business stories',tag:'story',multi:true,crop:[9,16],two:['Business name','News, e.g. New menu from 6pm'],hint:()=>'Instagram-style circles. Same business name = one circle. Labelled as a paid feature.'},
 featured:{label:'Featured person',tag:'featured',crop:[4,3],two:['Name','Business or role'],hint:()=>'A large card introducing an owner or local.'},
 wide:{label:'One photo, extra wide',tag:'wide',crop:[16,9],hint:()=>'Wider than the text.'},
 medium:{label:'One photo, medium',tag:'medium',crop:[4,3],hint:()=>'Centred, a little narrower than the text.'},
 small:{label:'One photo, small',tag:'small',crop:[4,3],hint:()=>'Small and centred.'},
 left:{label:'One photo, left of text',tag:'left',crop:[4,3],hint:()=>'Text wraps around it on the right.'},
 right:{label:'One photo, right of text',tag:'right',crop:[4,3],hint:()=>'Text wraps around it on the left.'},
 'polaroid-left':{label:'One polaroid, left',tag:'polaroid-left',crop:[1,1],hint:()=>'A print on the left with text beside it.'},
 'polaroid-right':{label:'One polaroid, right',tag:'polaroid-right',crop:[1,1],hint:()=>'A print on the right with text beside it.'},
 'polaroid-center':{label:'One polaroid, centred',tag:'polaroid-center',crop:[1,1],hint:()=>'A print in the middle of the page.'}
};
const TAG2LAY=Object.fromEntries(Object.entries(LAYOUTS).map(([k,v])=>[v.tag,k]));
const joinKey=l=>LAYOUTS[l]?.multi?l:null;
const toMulti=l=>LAYOUTS[l]?.multi?l:/^polaroid/.test(l)?'polaroid':'grid';

/* ---------- article format <-> blocks ---------- */
function mdInline(t){return esc(t)
 .replace(new RegExp('\\[([^\\]]+)\\]\\(('+URLRE+')\\)','g'),'<a href="$2">$1</a>')
 .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>')
 .replace(/\+\+([^+]+)\+\+/g,'<u>$1</u>').replace(/~~([^~]+)~~/g,'<s>$1</s>');}
const tidy=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[\u200b\r\n\t]/g,' ').replace(/ {2,}/g,' ').trim();
const wrapMd=(t,m)=>{const x=t.match(/^(\s*)([\s\S]*?)(\s*)$/);return x[2]?x[1]+m+x[2]+m+x[3]:t;};
function htmlToMd(html){const d=document.createElement('div');d.innerHTML=html||'';
 const walk=node=>{let s='';node.childNodes.forEach(n=>{
  if(n.nodeType===3){s+=n.textContent.replace(/\*/g,'∗').replace(/\+\+/g,'+\u200b+').replace(/~~/g,'~\u200b~');return;}
  if(n.nodeType!==1)return;const tag=n.tagName,st=n.style||{},inner=walk(n);
  if(tag==='BR')s+=' ';
  else if(tag==='B'||tag==='STRONG'||/^(bold|[6-9]00)$/.test(st.fontWeight))s+=wrapMd(inner,'**');
  else if(tag==='I'||tag==='EM'||st.fontStyle==='italic')s+=wrapMd(inner,'*');
  else if(tag==='U'||/underline/.test(st.textDecoration||st.textDecorationLine||''))s+=wrapMd(inner,'++');
  else if(tag==='S'||tag==='STRIKE'||tag==='DEL'||/line-through/.test(st.textDecoration||st.textDecorationLine||''))s+=wrapMd(inner,'~~');
  else if(tag==='A'){const h=n.getAttribute('href')||'';s+=LINK_OK(h)&&inner.trim()?`[${inner.trim().replace(/[\[\]]/g,'')}](${h})`:inner;}
  else if(/^(DIV|P|LI|H\d|BLOCKQUOTE)$/.test(tag))s+=' '+inner+' ';
  else s+=inner;});return s;};
 return tidy(walk(d)).replace(/\*\*\*\*/g,'');}
/* text that would accidentally look like a heading, list, photo or button gets an invisible mark */
const safeStart=s=>/^(#{2,3}\s|>|!!!|[-*]\s|\d+[.)]\s|-{3,}$|\*{3,}$|!\[|\{spacer|\[[^\]]+\]\([^)]+\)\{button|https:\/\/\S+$)/.test(s)?'\u200b'+s:s;
const capClean=s=>tidy(s).replace(/[\[\]|]/g,' ').replace(/ {2,}/g,' ').trim();
const alignOf=b=>b.align&&b.align!=='left'?` {:${b.align}}`:'';

function parse(md){const out=[];let para=[],paraAlign='',list=null;
 const flushP=()=>{if(para.length){out.push({t:'p',html:mdInline(para.join(' ')),align:paraAlign||'left'});para=[];paraAlign='';}};
 const flushL=()=>{if(list){out.push(list);list=null;}};
 const flush=()=>{flushP();flushL();};
 String(md||'').replace(/\r/g,'').split('\n').forEach(raw=>{let line=raw.trim();const lit=line.startsWith('\u200b');line=line.replace(/^\u200b/,'');let m;
  if(!line){flush();return;}
  let al='left';if((m=line.match(/^(.*\S)\s*\{:(center|right)\}$/))){line=m[1];al=m[2];}
  if(!lit){
   if((m=line.match(/^(#{2,3})\s+(.+)/))){flush();out.push({t:m[1].length===2?'h2':'h3',html:mdInline(m[2]),align:al});return;}
   if((m=line.match(/^!!!\s?(.*)/))){flush();out.push({t:'callout',html:mdInline(m[1]),align:al});return;}
   if((m=line.match(/^>\s?(.*)/))){flush();out.push({t:'quote',html:mdInline(m[1]),align:al});return;}
   if((m=line.match(BTN))){flush();out.push({t:'button',label:m[1],url:m[2],style:m[3],align:al});return;}
   if((m=line.match(/^\{spacer(-s|-l)?\}$/))){flush();out.push({t:'spacer',size:m[1]?m[1].slice(1):'m'});return;}
   if((m=line.match(/^[-*]\s+(.+)/))){flushP();if(!list||list.t!=='ul'){flushL();list={t:'ul',items:[]};}list.items.push(mdInline(m[1]));return;}
   if((m=line.match(/^\d+[.)]\s+(.+)/))){flushP();if(!list||list.t!=='ol'){flushL();list={t:'ol',items:[]};}list.items.push(mdInline(m[1]));return;}
   if(/^(-{3,}|\*{3,})$/.test(line)){flush();out.push({t:'hr'});return;}
   if(YT.test(line)){flush();out.push({t:'video',url:line});return;}
   if((m=line.match(IMG))){flush();const layout=TAG2LAY[m[3]||'']||'grid',cap=m[1]==='Add a caption'?'':m[1];
    const two=LAYOUTS[layout].two,parts=cap.split('|').map(x=>x.trim());const ph={url:m[2],a:two?parts[0]||'':cap,b:two?parts.slice(1).join(' · '):''};
    const last=out[out.length-1];if(last&&last.t==='photos'&&joinKey(last.layout)&&joinKey(last.layout)===joinKey(layout))last.photos.push(ph);
    else out.push({t:'photos',layout,photos:[ph]});return;}
  }
  if(list)flushL();para.push(line.replace(/∗/g,'*'));if(al!=='left')paraAlign=al;});
 flush();return out;}

function serialize(blocks){return blocks.map(b=>{
 if(b.t==='p'){const s=htmlToMd(b.html);return s?safeStart(s)+alignOf(b):null;}
 if(b.t==='h2'||b.t==='h3'){const s=htmlToMd(b.html);return s?(b.t==='h2'?'## ':'### ')+s+alignOf(b):null;}
 if(b.t==='quote'){const s=htmlToMd(b.html);return s?'> '+s+alignOf(b):null;}
 if(b.t==='callout'){const s=htmlToMd(b.html);return s?'!!! '+s+alignOf(b):null;}
 if(b.t==='ul'||b.t==='ol'){const it=b.items.map(htmlToMd).filter(Boolean);return it.length?it.map((x,i)=>(b.t==='ul'?'- ':`${i+1}. `)+x).join('\n'):null;}
 if(b.t==='hr')return '---';
 if(b.t==='spacer')return b.size==='s'?'{spacer-s}':b.size==='l'?'{spacer-l}':'{spacer}';
 if(b.t==='video')return YT.test(b.url||'')?b.url:null;
 if(b.t==='button'){const l=capClean(b.label);return l&&LINK_OK(b.url)?`[${l}](${b.url}){${b.style==='button-outline'?'button-outline':'button'}}`+alignOf(b):null;}
 if(b.t==='photos'){const L=LAYOUTS[b.layout]||LAYOUTS.grid,tag=L.tag?`{${L.tag}}`:'';const ph=b.photos.filter(p=>p.url);
  return ph.length?ph.map(p=>{const a=capClean(p.a),bb=capClean(p.b);return `![${L.two?(bb?`${a} | ${bb}`:a):a}](${p.url})${tag}`;}).join('\n'):null;}
 return null;}).filter(Boolean).join('\n\n')+'\n';}

/* Things that can be added (shared by the left panel and the phone "+ Add" menu) */
const ADD_ITEMS=[
 {k:'p',label:'Text',desc:'A paragraph',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6h14M12 6v13"/></svg>'},
 {k:'h2',label:'Heading',desc:'A section title',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5v14M15 5v14M5 12h10M19 9v10"/></svg>'},
 {k:'photos:grid',label:'Photos',desc:'One photo, or several in a grid',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>'},
 {k:'photos:polaroid',label:'Polaroids',desc:'Prints in a row, or one beside text',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1.5" transform="rotate(-4 12 12)"/><rect x="7" y="6" width="10" height="9" transform="rotate(-4 12 12)"/></svg>'},
 {k:'photos:pile',label:'Photo pile',desc:'A stack that opens a gallery',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="1.5"/><path d="M4 16V5.5A1.5 1.5 0 0 1 5.5 4H16"/></svg>'},
 {k:'photos:story',label:'Business stories',desc:'Instagram-style circles (paid feature)',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="5.5"/></svg>'},
 {k:'photos:featured',label:'Featured person',desc:'An owner or local, with their business',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'},
 {k:'button',label:'Button',desc:'A link styled as a button',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/></svg>'},
 {k:'callout',label:'Callout',desc:'A highlighted tip box',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'},
 {k:'quote',label:'Quote',desc:'A quote or saying',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7c-2 1-3 3-3 6v4h5v-5H6c0-2 1-3 2.5-3.5zM17 7c-2 1-3 3-3 6v4h5v-5h-3c0-2 1-3 2.5-3.5z"/></svg>'},
 {k:'video',label:'Video',desc:'A YouTube video',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/></svg>'},
 {k:'hr',label:'Divider',desc:'A thin line between sections',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18"/></svg>'},
 {k:'spacer',label:'Spacer',desc:'Extra space between blocks',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/></svg>'}
];

/* ---------- the canvas ---------- */
function mount(root,ta,opts){
 opts=opts||{};let blocks=[],uid=0,cur=null,drag=null,hist=[],fut=[],typingT=null,savedRange=null,pickFor=null;
 const id=()=>'b'+(++uid);
 const isText=b=>b&&(TEXT_T.includes(b.t)||b.t==='ul'||b.t==='ol');
 const find=bid=>blocks.findIndex(b=>b.id===bid);
 const load=md=>{blocks=parse(md).map(b=>({...b,id:id()}));};
 const remember=()=>{const s=JSON.stringify(blocks);if(hist[hist.length-1]!==s){hist.push(s);if(hist.length>80)hist.shift();fut=[];}paintTools();};
 const sync=()=>{const md=serialize(blocks);if(ta.value!==md){ta.value=md;ta.dispatchEvent(new Event('input',{bubbles:true}));}};
 /* after every change that isn't typing: save it and record it for undo */
 const done=()=>{sync();remember();};

 root.classList.add('ve');
 root.innerHTML=`<div class="ve-bar" role="toolbar" aria-label="Text tools">
  <div class="ve-grp ve-add-wrap"><button type="button" class="ve-add-btn" data-cmd="add" aria-expanded="false" aria-haspopup="true">+ Add</button><div class="ve-menu" hidden>${ADD_ITEMS.map(x=>`<button type="button" data-add="${x.k}"><span class="ve-mi">${x.ic}</span><span><b>${x.label}</b><small>${x.desc}</small></span></button>`).join('')}</div></div>
  <div class="ve-grp"><select class="ve-style" data-cmd="style" aria-label="Text style">${TEXT_T.map(t=>`<option value="${t}">${STYLE_NAMES[t]}</option>`).join('')}</select></div>
  <div class="ve-grp"><button type="button" data-cmd="bold" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button><button type="button" data-cmd="italic" title="Italic (Ctrl+I)" aria-label="Italic"><i>I</i></button><button type="button" data-cmd="underline" title="Underline (Ctrl+U)" aria-label="Underline"><u>U</u></button><button type="button" data-cmd="strikeThrough" title="Strikethrough" aria-label="Strikethrough"><s>S</s></button><button type="button" data-cmd="link" title="Link (Ctrl+K)" aria-label="Link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>
  <div class="ve-grp">${['left','center','right'].map(a=>`<button type="button" data-cmd="align" data-align="${a}" title="Align ${a==='center'?'centre':a}" aria-label="Align ${a==='center'?'centre':a}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${a==='left'?'M4 6h16M4 10h10M4 14h16M4 18h10':a==='center'?'M4 6h16M7 10h10M4 14h16M7 18h10':'M4 6h16M10 10h10M4 14h16M10 18h10'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`).join('')}</div>
  <div class="ve-grp"><button type="button" data-cmd="ul" title="Bullet list" aria-label="Bullet list"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.5" fill="currentColor"/><circle cx="4.5" cy="12" r="1.5" fill="currentColor"/><circle cx="4.5" cy="18" r="1.5" fill="currentColor"/></svg></button><button type="button" data-cmd="ol" title="Numbered list" aria-label="Numbered list"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="2" y="9" font-size="7" font-weight="700" fill="currentColor">1</text><text x="2" y="15" font-size="7" font-weight="700" fill="currentColor">2</text><text x="2" y="21" font-size="7" font-weight="700" fill="currentColor">3</text></svg></button></div>
  <div class="ve-grp ve-undo"><button type="button" data-cmd="undo" title="Undo (Ctrl+Z)" aria-label="Undo">↶</button><button type="button" data-cmd="redo" title="Redo" aria-label="Redo">↷</button></div>
 </div>
 <div class="ve-doc post-body" aria-label="Article"></div>
 <button type="button" class="ve-more" data-cmd="more">Click to keep writing…</button>
 <input type="file" accept="image/*" multiple hidden class="ve-file">`;
 const doc=root.querySelector('.ve-doc'),bar=root.querySelector('.ve-bar'),menu=root.querySelector('.ve-menu'),fileIn=root.querySelector('.ve-file'),styleSel=bar.querySelector('.ve-style');

 /* toolbar state follows the block you're in */
 function paintTools(){bar.querySelector('[data-cmd=undo]').disabled=hist.length<2;bar.querySelector('[data-cmd=redo]').disabled=!fut.length;
  const b=blocks[find(cur)],txt=b&&TEXT_T.includes(b.t);styleSel.disabled=!txt;styleSel.value=txt?b.t:'p';
  const canAlign=b&&(TEXT_T.includes(b.t)||b.t==='button');bar.querySelectorAll('[data-cmd=align]').forEach(x=>{x.disabled=!canAlign;x.classList.toggle('on',!!canAlign&&(b.align||'left')===x.dataset.align);});
  bar.querySelector('[data-cmd=ul]').classList.toggle('on',b?.t==='ul');bar.querySelector('[data-cmd=ol]').classList.toggle('on',b?.t==='ol');}
 document.addEventListener('selectionchange',()=>{if(!doc.contains(document.activeElement))return;['bold','italic','underline','strikeThrough'].forEach(c=>{let on=false;try{on=document.queryCommandState(c);}catch{}bar.querySelector(`[data-cmd=${c}]`)?.classList.toggle('on',on);});});

 /* ----- drawing ----- */
 const PH={p:'Write something…',h2:'Heading',h3:'Subheading',quote:'A quote or saying',callout:'A tip readers shouldn\'t miss'};
 function textEl(b){if(b.t==='ul'||b.t==='ol')return `<${b.t} class="ve-edit" contenteditable="true" data-placeholder="List item">${(b.items.length?b.items:['']).map(x=>`<li>${x}</li>`).join('')}</${b.t}>`;
  const tag={p:'p',h2:'h2',h3:'h3',quote:'blockquote',callout:'p'}[b.t],al=b.align&&b.align!=='left'?` al-${b.align}`:'';
  const ed=`<${tag} class="ve-edit${al}" contenteditable="true" data-placeholder="${PH[b.t]}">${b.html||''}</${tag}>`;
  return b.t==='callout'?`<aside class="post-callout ve-callout${al}"><span class="pc-ic" aria-hidden="true">i</span>${ed}</aside>`:ed;}
 function photoCards(b){const L=LAYOUTS[b.layout]||LAYOUTS.grid;return b.photos.map((p,i)=>`<div class="ve-ph${p.url?'':' is-loading'}" data-pi="${i}" draggable="${p.url?'true':'false'}">
   <div class="ve-ph-img">${p.url?`<img src="${esc(p.url)}" alt="" draggable="false">`:'<span class="ve-spin" aria-label="Uploading"></span>'}
    <div class="ve-ph-acts">${p.url?`<button type="button" data-ve="prep" title="Replace photo">Replace</button><button type="button" data-ve="pcrop" title="Crop and position">Crop</button>`:''}<button type="button" data-ve="pdel" title="Remove photo" aria-label="Remove photo">✕</button></div>
    ${b.photos.length>1?`<div class="ve-ph-move"><button type="button" data-ve="pleft" aria-label="Move left" ${i===0?'disabled':''}>‹</button><button type="button" data-ve="pright" aria-label="Move right" ${i===b.photos.length-1?'disabled':''}>›</button></div>`:''}</div>
   ${L.two?`<input class="ve-cap" data-cap="a" maxlength="60" placeholder="${esc(L.two[0])}" value="${esc(p.a)}"><input class="ve-cap" data-cap="b" maxlength="140" placeholder="${esc(L.two[1])}" value="${esc(p.b)}">`:`<input class="ve-cap" data-cap="a" maxlength="140" placeholder="Caption (optional)" value="${esc(p.a)}">`}</div>`).join('');}
 function photoBlock(b){const n=b.photos.length,L=LAYOUTS[b.layout]||LAYOUTS.grid;
  const opt=k=>{const v=LAYOUTS[k],off=n>1&&!v.multi;return `<option value="${k}" ${k===b.layout?'selected':''} ${off?'disabled':''}>${esc(v.label)}${off?' (one photo only)':''}</option>`;};
  return `<div class="ve-ph-head"><label class="ve-lay">Layout<select data-ve-layout>
    <optgroup label="One or more photos">${['grid','polaroid','pile','story'].map(opt).join('')}</optgroup>
    <optgroup label="One photo">${['featured','wide','medium','small','left','right','polaroid-left','polaroid-right','polaroid-center'].map(opt).join('')}</optgroup></select></label>
   <span class="ve-hint">${esc(L.hint(n))}</span>${L.multi||!n?`<button type="button" class="ve-addph" data-ve="addph">+ Add photos</button>`:''}</div>
   <div class="ve-phs lay-${esc(b.layout)}">${photoCards(b)}</div>`;}
 function buttonBlock(b){return `<div class="ve-btn-prev al-${b.align||'left'}"><span class="btn ${b.style==='button-outline'?'btn-ghost':'btn-primary'}">${esc(b.label||'Button text')}</span></div>
  <div class="ve-btn-fields"><label>Button text<input class="input" data-bf="label" maxlength="60" value="${esc(b.label)}" placeholder="e.g. Book a table"></label><label>Link<input class="input" data-bf="url" maxlength="400" value="${esc(b.url)}" placeholder="https://"></label><label>Style<select class="input" data-bf="style"><option value="button" ${b.style!=='button-outline'?'selected':''}>Filled</option><option value="button-outline" ${b.style==='button-outline'?'selected':''}>Outline</option></select></label></div>
  <p class="ve-warn" ${b.url&&!LINK_OK(b.url)?'':'hidden'}>Links need to start with https:// (for example https://www.example.com).</p>`;}
 function blockHTML(b,i){let body;
  if(isText(b))body=textEl(b);
  else if(b.t==='photos')body=photoBlock(b);
  else if(b.t==='button')body=buttonBlock(b);
  else if(b.t==='hr')body='<hr>';
  else if(b.t==='spacer')body=`<div class="ve-spacer sz-${b.size}"><span>Space</span><select data-ve-spacer aria-label="Space size"><option value="s" ${b.size==='s'?'selected':''}>Small</option><option value="m" ${b.size==='m'?'selected':''}>Medium</option><option value="l" ${b.size==='l'?'selected':''}>Large</option></select></div>`;
  else if(b.t==='video'){const v=(b.url||'').match(YT);body=`<div class="ve-video">${v?`<img src="https://img.youtube.com/vi/${esc(v[1])}/hqdefault.jpg" alt="">`:''}<span class="ve-play">▶</span><span class="ve-vlabel">YouTube video</span><button type="button" data-ve="vid">Change video</button></div>`;}
  return `<div class="ve-b ve-t-${b.t}${b.id===cur?' is-cur':''}" data-id="${b.id}"><div class="ve-side"><span class="ve-grip" draggable="true" title="Drag to move" aria-hidden="true">⠿</span></div><div class="ve-main">${body}</div><div class="ve-acts"><button type="button" data-ve="up" title="Move up" aria-label="Move up" ${i===0?'disabled':''}>↑</button><button type="button" data-ve="down" title="Move down" aria-label="Move down" ${i===blocks.length-1?'disabled':''}>↓</button><button type="button" data-ve="del" title="Delete" aria-label="Delete block">✕</button></div></div>`;}
 function draw(){
  for(let i=blocks.length-1;i>0;i--){const a=blocks[i-1],b=blocks[i];if(a.t==='photos'&&b.t==='photos'&&joinKey(a.layout)&&joinKey(a.layout)===joinKey(b.layout)){a.photos.push(...b.photos);blocks.splice(i,1);}}
  blocks=blocks.filter(b=>b.t!=='photos'||b.photos.length);
  if(!blocks.length)blocks.push({t:'p',html:'',align:'left',id:id()});
  doc.innerHTML=blocks.map(blockHTML).join('');paintTools();}
 const redrawBlock=b=>{const el=doc.querySelector(`[data-id="${b.id}"]`);if(!el)return draw();const t=document.createElement('div');t.innerHTML=blockHTML(b,find(b.id));el.replaceWith(t.firstElementChild);};

 /* ----- caret and focus ----- */
 const editOf=bid=>doc.querySelector(`[data-id="${bid}"] .ve-edit`);
 function place(el,atStart){if(!el)return;el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(!!atStart);const s=getSelection();s.removeAllRanges();s.addRange(r);}
 function setCur(bid){if(cur!==bid){doc.querySelector('.ve-b.is-cur')?.classList.remove('is-cur');cur=bid;doc.querySelector(`[data-id="${bid}"]`)?.classList.add('is-cur');}paintTools();}
 function focusBlock(bid,atStart){const el=editOf(bid);if(el)place(el,atStart);else doc.querySelector(`[data-id="${bid}"] input,[data-id="${bid}"] select,[data-id="${bid}"] button`)?.focus();setCur(bid);}
 const readText=b=>{const el=editOf(b.id);if(!el)return;if(b.t==='ul'||b.t==='ol')b.items=[...el.querySelectorAll('li')].map(li=>li.innerHTML);else b.html=el.innerHTML==='<br>'?'':el.innerHTML;};
 const caretAtStart=el=>{const s=getSelection();if(!s.rangeCount||!s.isCollapsed)return false;const r=s.getRangeAt(0),pre=document.createRange();pre.selectNodeContents(el);pre.setEnd(r.startContainer,r.startOffset);return pre.toString().replace(/\u200b/g,'')==='';};
 const insertAfter=(nb,afterId)=>{nb.id=nb.id||id();const i=afterId?find(afterId):blocks.length-1;blocks.splice(i<0?blocks.length:i+1,0,nb);return nb;};
 const scrollTo=bid=>doc.querySelector(`[data-id="${bid}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});

 /* ----- block actions ----- */
 function convert(t){const b=blocks[find(cur)];if(!isText(b))return;readText(b);remember();
  if(t==='ul'||t==='ol'){if(b.t===t){const i=find(b.id),nbs=b.items.filter(x=>tidy(x.replace(/<[^>]+>/g,''))).map(x=>({t:'p',html:x,align:'left',id:id()}));if(!nbs.length)nbs.push({t:'p',html:'',align:'left',id:id()});blocks.splice(i,1,...nbs);cur=nbs[0].id;}
   else{const items=b.t==='ul'||b.t==='ol'?b.items:[b.html];Object.assign(b,{t,items});delete b.html;delete b.align;}}
  else if(b.t==='ul'||b.t==='ol'){const i=find(b.id),nbs=b.items.filter(x=>tidy(x.replace(/<[^>]+>/g,''))).map(x=>({t,html:x,align:'left',id:id()}));if(!nbs.length)nbs.push({t,html:'',align:'left',id:id()});blocks.splice(i,1,...nbs);cur=nbs[0].id;}
  else b.t=t;
  draw();done();focusBlock(cur);}
 function setAlign(a){const b=blocks[find(cur)];if(!b||!(TEXT_T.includes(b.t)||b.t==='button'))return;if(isText(b))readText(b);remember();b.align=a;redrawBlock(b);done();paintTools();if(isText(b))focusBlock(b.id);}
 function move(bid,d){const i=find(bid),j=i+d;if(i<0||j<0||j>=blocks.length)return;remember();[blocks[i],blocks[j]]=[blocks[j],blocks[i]];draw();done();setCur(bid);doc.querySelector(`[data-id="${bid}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
 function del(bid){const i=find(bid);if(i<0)return;remember();blocks.splice(i,1);draw();done();const nb=blocks[Math.max(0,i-1)];if(nb)setCur(nb.id);opts.toast?.('Removed. Press ↶ to undo.');}
 function addBlock(nb,atEnd){remember();insertAfter(nb,atEnd?null:cur);draw();done();setCur(nb.id);if(isText(nb))focusBlock(nb.id,true);else doc.querySelector(`[data-id="${nb.id}"] input`)?.focus();scrollTo(nb.id);return nb;}
 function add(k){if(k.startsWith('photos:'))return pick({layout:k.slice(7)});
  if(k==='video')return video(null);
  if(k==='hr')return addBlock({t:'hr'});
  if(k==='spacer')return addBlock({t:'spacer',size:'m'});
  if(k==='button')return addBlock({t:'button',label:'',url:'',style:'button',align:'left'});
  return addBlock({t:k,html:'',align:'left'});}

 /* ----- photos ----- */
 function pick(target){pickFor=target;fileIn.multiple=!(target.replace||(target.layout&&!LAYOUTS[target.layout].multi));fileIn.value='';fileIn.click();}
 fileIn.addEventListener('change',()=>{const fs=[...fileIn.files];fileIn.value='';const t=pickFor;pickFor=null;if(!fs.length||!t)return;if(t.replace)replacePhoto(t.bid,t.pi,fs[0]);else addPhotos(fs,t);});
 async function addPhotos(files,target){files=files.filter(f=>/^image\//.test(f.type)).slice(0,20);if(!files.length)return;remember();
  let b=target.bid?blocks[find(target.bid)]:null;
  if(!b){b={t:'photos',layout:target.layout||'grid',photos:[]};insertAfter(b,cur);}
  if(b.photos.length+files.length>1&&!LAYOUTS[b.layout].multi){b.layout=toMulti(b.layout);opts.toast?.('That layout holds one photo, so these are shown together. You can change the layout above the photos.');}
  const slots=files.map(()=>({url:'',a:'',b:''}));b.photos.push(...slots);draw();setCur(b.id);scrollTo(b.id);
  for(let i=0;i<files.length;i++){opts.status?.(`Uploading photo ${i+1} of ${files.length}…`);
   try{slots[i].url=await opts.upload(files[i]);}catch(e){opts.status?.(opts.errorText?opts.errorText(e):String(e.message||e));}
   if(find(b.id)>-1)redrawBlock(b);}
  b.photos=b.photos.filter(p=>p.url);opts.status?.('');draw();done();
  const cap=doc.querySelector(`[data-id="${b.id}"] .ve-ph:nth-child(${Math.max(1,b.photos.length-files.length+1)}) .ve-cap`);if(LAYOUTS[b.layout]?.two&&cap)cap.focus();}
 async function replacePhoto(bid,pi,file){const b=blocks[find(bid)];if(!b||!b.photos[pi])return;remember();const old=b.photos[pi].url;b.photos[pi].url='';redrawBlock(b);opts.status?.('Uploading photo…');
  try{b.photos[pi].url=await opts.upload(file);}catch(e){b.photos[pi].url=old;opts.status?.(opts.errorText?opts.errorText(e):String(e.message||e));return redrawBlock(b);}
  opts.status?.('');redrawBlock(b);done();}
 async function cropPhoto(bid,pi){const b=blocks[find(bid)],p=b?.photos[pi];if(!p||!opts.crop)return;const L=LAYOUTS[b.layout]||LAYOUTS.grid;
  try{const url=await opts.crop(p.url,L.crop);if(!url)return;remember();p.url=url;redrawBlock(b);done();}catch(e){opts.toast?.(opts.errorText?opts.errorText(e):String(e.message||e));}}

 /* ----- links and video ----- */
 const saveSel=()=>{const s=getSelection();savedRange=s.rangeCount&&doc.contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;};
 const restoreSel=()=>{if(!savedRange)return;const s=getSelection();s.removeAllRanges();s.addRange(savedRange);};
 async function link(){saveSel();if(!savedRange){opts.toast?.('Click into your text first, then add a link.');return;}
  const node=savedRange.startContainer.nodeType===1?savedRange.startContainer:savedRange.startContainer.parentElement,a=node.closest('a'),ed=node.closest('.ve-edit');if(!ed)return;
  const txt=savedRange.toString();const v=await opts.askLink?.({url:a?.getAttribute('href')||'https://',text:txt,hasText:!!txt||!!a});if(!v)return;ed.focus();restoreSel();
  if(!v.url){if(a){const r=document.createRange();r.selectNode(a);getSelection().removeAllRanges();getSelection().addRange(r);document.execCommand('unlink');}}
  else if(!LINK_OK(v.url)){opts.toast?.('Links need to start with https:// (for example https://www.visitbarbados.org).');return;}
  else if(a){a.setAttribute('href',v.url);if(v.text)a.textContent=v.text;}
  else if(txt)document.execCommand('createLink',false,v.url);
  else document.execCommand('insertHTML',false,`<a href="${esc(v.url)}">${esc(v.text||v.url)}</a>&nbsp;`);
  const b=blocks[find(ed.closest('.ve-b').dataset.id)];readText(b);remember();sync();}
 async function video(b){const url=(await opts.askVideo?.(b?.url||'')||'').trim();if(!url)return;if(!YT.test(url)){opts.toast?.('Paste a YouTube link, for example https://www.youtube.com/watch?v=…');return;}
  if(b){remember();b.url=url;redrawBlock(b);done();}else addBlock({t:'video',url});}

 /* ----- toolbar ----- */
 bar.addEventListener('mousedown',e=>{if(e.target.closest('button[data-cmd]:not([data-cmd=add]):not([data-cmd=undo]):not([data-cmd=redo])'))e.preventDefault();});
 bar.addEventListener('change',e=>{if(e.target===styleSel)convert(styleSel.value);});
 bar.addEventListener('click',e=>{const ad=e.target.closest('[data-add]')?.dataset.add;
  if(ad){toggleMenu(false);return add(ad);}
  const btn=e.target.closest('button[data-cmd]');if(!btn)return;const c=btn.dataset.cmd;
  if(c==='add')return toggleMenu(menu.hidden);
  if(['bold','italic','underline','strikeThrough'].includes(c)){const ed=document.activeElement?.closest?.('.ve-edit');if(!ed){opts.toast?.('Select some text first.');return;}document.execCommand(c);readText(blocks[find(ed.closest('.ve-b').dataset.id)]);sync();clearTimeout(typingT);typingT=setTimeout(remember,500);return;}
  if(c==='link')return link();
  if(c==='align')return setAlign(btn.dataset.align);
  if(c==='ul'||c==='ol'){if(!isText(blocks[find(cur)])){opts.toast?.('Click into your text first.');return;}return convert(c);}
  if(c==='undo'||c==='redo'){if(c==='undo'){if(hist.length<2)return;fut.push(hist.pop());}else{if(!fut.length)return;hist.push(fut.pop());}
   blocks=JSON.parse(hist[hist.length-1]);draw();sync();paintTools();}});
 const toggleMenu=o=>{menu.hidden=!o;bar.querySelector('.ve-add-btn').setAttribute('aria-expanded',String(o));};
 document.addEventListener('click',e=>{if(!e.target.closest('.ve-add-wrap'))toggleMenu(false);});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){e.stopPropagation();toggleMenu(false);bar.querySelector('.ve-add-btn').focus();}});
 root.querySelector('.ve-more').addEventListener('click',()=>{const last=blocks[blocks.length-1];if(last&&last.t==='p'&&!tidy((last.html||'').replace(/<[^>]+>/g,'')))focusBlock(last.id);else addBlock({t:'p',html:'',align:'left'},true);});

 /* ----- typing ----- */
 doc.addEventListener('focusin',e=>{const b=e.target.closest('.ve-b');if(b)setCur(b.dataset.id);});
 doc.addEventListener('mousedown',e=>{const b=e.target.closest('.ve-b');if(b&&!e.target.closest('.ve-edit,input,select,button'))setCur(b.dataset.id);});
 doc.addEventListener('input',e=>{const be=e.target.closest('.ve-b');if(!be)return;const b=blocks[find(be.dataset.id)];if(!b)return;
  if(e.target.matches('.ve-cap')){const p=b.photos[+e.target.closest('.ve-ph').dataset.pi];if(p)p[e.target.dataset.cap]=e.target.value;}
  else if(e.target.matches('[data-bf]')){b[e.target.dataset.bf]=e.target.value;const pv=be.querySelector('.ve-btn-prev .btn');if(pv&&e.target.dataset.bf==='label')pv.textContent=b.label||'Button text';}
  else if(e.target.closest('.ve-edit')){const ed=e.target.closest('.ve-edit');if(!ed.textContent&&!ed.querySelector('img,li+li'))ed.innerHTML=(b.t==='ul'||b.t==='ol')?'<li></li>':'';readText(b);}
  sync();clearTimeout(typingT);typingT=setTimeout(remember,800);});
 doc.addEventListener('change',e=>{const be=e.target.closest('.ve-b');if(!be)return;const b=blocks[find(be.dataset.id)];if(!b)return;
  if(e.target.matches('[data-ve-layout]')){remember();b.layout=e.target.value;draw();done();setCur(b.id);remember();return;}
  if(e.target.matches('[data-ve-spacer]')){remember();b.size=e.target.value;redrawBlock(b);done();return;}
  /* button fields update in place, so moving to the next box never loses your place */
  if(e.target.matches('[data-bf]')){const f=e.target.dataset.bf;b[f]=e.target.value.trim();
   if(f==='url'){if(b.url&&!/^(https?:|mailto:|[\w-]+\.html)/.test(b.url))b.url='https://'+b.url;b.url=b.url.replace(/^http:\/\//,'https://');e.target.value=b.url;be.querySelector('.ve-warn').hidden=!b.url||LINK_OK(b.url);}
   if(f==='style')be.querySelector('.ve-btn-prev .btn').className='btn '+(b.style==='button-outline'?'btn-ghost':'btn-primary');
   done();}});
 doc.addEventListener('click',e=>{const a=e.target.closest('[data-ve]');if(!a)return;const be=a.closest('.ve-b'),bid=be.dataset.id,b=blocks[find(bid)],act=a.dataset.ve;setCur(bid);
  if(act==='up')return move(bid,-1);if(act==='down')return move(bid,1);if(act==='del')return del(bid);
  if(act==='addph')return pick({bid});if(act==='vid')return video(b);
  const pi=+a.closest('.ve-ph')?.dataset.pi;if(Number.isNaN(pi))return;
  if(act==='prep')return pick({bid,pi,replace:true});
  if(act==='pcrop')return cropPhoto(bid,pi);
  remember();
  if(act==='pdel'){b.photos.splice(pi,1);opts.toast?.('Photo removed. Press ↶ to undo.');}
  if(act==='pleft'&&pi>0)[b.photos[pi-1],b.photos[pi]]=[b.photos[pi],b.photos[pi-1]];
  if(act==='pright'&&pi<b.photos.length-1)[b.photos[pi+1],b.photos[pi]]=[b.photos[pi],b.photos[pi+1]];
  draw();done();});

 doc.addEventListener('keydown',e=>{const ed=e.target.closest('.ve-edit');if(!ed)return;const be=ed.closest('.ve-b'),b=blocks[find(be.dataset.id)];
  const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();link();return;}
  if((e.ctrlKey||e.metaKey)&&k==='u'){e.preventDefault();document.execCommand('underline');readText(b);sync();return;}
  if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();readText(b);remember();bar.querySelector(`[data-cmd=${e.shiftKey?'redo':'undo'}]`).click();return;}
  const isList=b.t==='ul'||b.t==='ol';
  if(e.key==='Enter'){
   if(isList){const an=getSelection().anchorNode,li=an&&(an.nodeType===1?an:an.parentElement).closest('li');
    if(li&&!li.textContent.trim()&&!e.shiftKey){e.preventDefault();li.remove();readText(b);b.items=b.items.filter(x=>tidy(x.replace(/<[^>]+>/g,'')));remember();
     let target;if(!b.items.length){Object.assign(b,{t:'p',html:'',align:'left'});delete b.items;target=b;}else{target=insertAfter({t:'p',html:'',align:'left'},b.id);}
     draw();done();focusBlock(target.id,true);}
    return;}
   e.preventDefault();if(e.shiftKey)return;
   const s=getSelection();if(!s.rangeCount)return;s.deleteFromDocument();const r=s.getRangeAt(0),tail=document.createRange();tail.selectNodeContents(ed);tail.setStart(r.endContainer,r.endOffset);
   const frag=tail.extractContents(),tmp=document.createElement('div');tmp.append(frag);readText(b);remember();
   const nb=insertAfter({t:'p',html:tidy(tmp.textContent)?tmp.innerHTML:'',align:b.t==='p'?b.align:'left'},b.id);draw();done();focusBlock(nb.id,true);return;}
  if(e.key==='Backspace'&&!isList&&caretAtStart(ed)){const i=find(b.id),prev=blocks[i-1],empty=!tidy(ed.textContent);
   if(empty&&b.t!=='p'){e.preventDefault();remember();b.t='p';draw();done();focusBlock(b.id,true);return;}
   if(empty&&blocks.length>1){e.preventDefault();remember();blocks.splice(i,1);draw();done();if(prev&&isText(prev))focusBlock(prev.id);return;}
   if(prev&&TEXT_T.includes(prev.t)&&TEXT_T.includes(b.t)){e.preventDefault();readText(b);remember();prev.html=(prev.html||'')+'<span id="ve-join"></span>'+(b.html||'');blocks.splice(i,1);draw();done();
    const mk=doc.querySelector('#ve-join'),pe=mk?.closest('.ve-edit');if(pe){pe.focus();const rr=document.createRange();rr.setStartBefore(mk);rr.collapse(true);getSelection().removeAllRanges();getSelection().addRange(rr);mk.remove();readText(prev);sync();setCur(prev.id);}return;}}
  if(e.key==='Backspace'&&isList&&caretAtStart(ed)&&b.items.length<=1&&!tidy(ed.textContent)){e.preventDefault();remember();Object.assign(b,{t:'p',html:'',align:'left'});delete b.items;draw();done();focusBlock(b.id,true);}});

 /* paste keeps the words, not outside styling; pasted photos are uploaded */
 doc.addEventListener('paste',e=>{const ed=e.target.closest('.ve-edit');const files=[...(e.clipboardData?.files||[])].filter(f=>/^image\//.test(f.type));
  if(files.length){e.preventDefault();addPhotos(files,{layout:'grid'});return;}
  if(!ed)return;e.preventDefault();const parts=(e.clipboardData.getData('text/plain')||'').replace(/\r/g,'').split(/\n\s*\n/).map(t=>t.replace(/\s*\n\s*/g,' ').trim()).filter(Boolean);
  if(parts.length<=1){document.execCommand('insertText',false,parts[0]||'');return;}
  document.execCommand('insertText',false,parts[0]);const b=blocks[find(ed.closest('.ve-b').dataset.id)];readText(b);remember();let after=b.id,last=null;
  parts.slice(1).forEach(t=>{last=insertAfter({t:'p',html:esc(t),align:'left'},after);after=last.id;});draw();done();focusBlock(last.id);});

 /* drag and drop: blocks by the handle, photos within or between groups, photo files from the computer */
 doc.addEventListener('dragstart',e=>{const g=e.target.closest?.('.ve-grip'),ph=e.target.closest?.('.ve-ph');
  if(g){drag={kind:'block',bid:g.closest('.ve-b').dataset.id};try{e.dataTransfer.setDragImage(g.closest('.ve-b'),20,20);}catch{}}
  else if(ph&&ph.draggable&&!e.target.closest('input')){drag={kind:'photo',bid:ph.closest('.ve-b').dataset.id,pi:+ph.dataset.pi};}else return;
  e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','');}catch{}doc.classList.add('is-dragging');});
 const clearMarks=()=>doc.querySelectorAll('.drop-before,.drop-after').forEach(x=>x.classList.remove('drop-before','drop-after'));
 doc.addEventListener('dragend',()=>{drag=null;clearMarks();doc.classList.remove('is-dragging','file-over');});
 doc.addEventListener('dragover',e=>{const files=[...(e.dataTransfer?.items||[])].some(i=>i.kind==='file');
  if(files&&!drag){e.preventDefault();doc.classList.add('file-over');return;}if(!drag)return;e.preventDefault();clearMarks();
  if(drag.kind==='photo'){const ph=e.target.closest('.ve-ph');if(ph){const r=ph.getBoundingClientRect();ph.classList.add(e.clientX>r.left+r.width/2?'drop-after':'drop-before');}return;}
  const be=e.target.closest('.ve-b');if(be){const r=be.getBoundingClientRect();be.classList.add(e.clientY>r.top+r.height/2?'drop-after':'drop-before');}});
 doc.addEventListener('dragleave',e=>{if(!doc.contains(e.relatedTarget))doc.classList.remove('file-over');});
 doc.addEventListener('drop',e=>{doc.classList.remove('file-over');
  if(!drag){const fs=[...(e.dataTransfer?.files||[])].filter(f=>/^image\//.test(f.type));if(!fs.length)return;e.preventDefault();const tb=e.target.closest('.ve-b'),tbl=tb&&blocks[find(tb.dataset.id)];
   if(tbl&&tbl.t==='photos'&&LAYOUTS[tbl.layout].multi)addPhotos(fs,{bid:tbl.id});else{if(tb)setCur(tb.dataset.id);addPhotos(fs,{layout:'grid'});}return;}
  e.preventDefault();const d=drag;drag=null;clearMarks();doc.classList.remove('is-dragging');
  if(d.kind==='block'){const be=e.target.closest('.ve-b');if(!be||be.dataset.id===d.bid)return;const r=be.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;remember();
   const [x]=blocks.splice(find(d.bid),1);blocks.splice(find(be.dataset.id)+(after?1:0),0,x);draw();done();setCur(x.id);remember();return;}
  const ph=e.target.closest('.ve-ph'),tb=e.target.closest('.ve-b');if(!tb)return;const src=blocks[find(d.bid)],dst=blocks[find(tb.dataset.id)];if(!dst||dst.t!=='photos')return;remember();
  const [p]=src.photos.splice(d.pi,1);let to=ph?+ph.dataset.pi:dst.photos.length;if(ph){const r=ph.getBoundingClientRect();if(e.clientX>r.left+r.width/2)to++;}if(src===dst&&d.pi<to)to--;dst.photos.splice(to,0,p);
  if(dst.photos.length>1&&!LAYOUTS[dst.layout].multi)dst.layout=toMulti(dst.layout);draw();done();});

 ta.addEventListener('ve-reload',()=>{load(ta.value);hist=[];draw();remember();});
 load(ta.value);draw();remember();{const md=serialize(blocks);if(ta.value.trim()&&ta.value!==md)ta.value=md;}
 return {add,reload(){load(ta.value);draw();},focus(){const f=blocks.find(isText);if(f)focusBlock(f.id);}};
}
window.PostVisual={mount,parse,serialize,ADD_ITEMS};
})();
