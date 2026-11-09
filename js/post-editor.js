/* BimCar Connect: full-page blog post editor.
   Left: things you can add.  Middle: title, web address, summary and the
   visual article (js/post-visual.js).  Right: post settings and SEO.
   Saving goes through Live.admin.savePost, the same as before. */
(function(){
'use strict';
const TODAY=()=>App.todayISO();
const CATS=['Island drives','Places & viewpoints','Food & bar stops','Driving tips','News'];

function open(p,deps){
 const {A,Live,optimiseImage,formBox,confirmBox,slugify,posts,onSaved}=deps,esc=A.esc,icon=A.icon;
 const x=p?{...p}:{title:'',slug:'',excerpt:'',category:'Island drives',body:'',status:'draft',published_at:TODAY(),author_name:Live.user.name||'',tags:[],seo_title:'',seo_description:''};
 x.tags=Array.isArray(x.tags)?x.tags.slice():[];
 let coverPath=x.cover_path||null,coverUrl=x.cover||null,slugTouched=!!p?.id,dirty=false,closing=false;
 const allPosts=(posts()||[]);
 const cats=[...new Set([...CATS,...allPosts.map(o=>o.category).filter(Boolean)])];
 const knownTags=[...new Set(allPosts.flatMap(o=>Array.isArray(o.tags)?o.tags:[]))];
 const site=location.origin+location.pathname.replace(/[^/]*$/,'');
 const startBody=x.body?PostVisual.serialize(PostVisual.parse(A.tidyPhotoBlocks(x.body))):'';

 document.getElementById('post-editor')?.remove();
 const m=document.createElement('div');m.id='post-editor';m.className='pe2';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','pe2-h');
 m.innerHTML=`
 <header class="pe2-top">
  <button type="button" class="pe2-back" data-pe="close">${icon('arrowL')}<span>Blog posts</span></button>
  <h2 id="pe2-h">${p?.id?'Edit blog post':'New blog post'}</h2>
  <span class="pe2-pill" id="pe2-pill"></span>
  <div class="pe2-actions"><span class="pe2-saved" id="pe2-saved" aria-live="polite"></span>
   <button type="button" class="btn btn-ghost btn-sm" data-pe="draft">Save draft</button>
   <button type="button" class="btn btn-ghost btn-sm" data-pe="preview" aria-pressed="false">${icon('eye')}<span>Preview</span></button>
   <div class="pe2-pub"><button type="button" class="btn btn-primary btn-sm" data-pe="publish" id="pe2-publish">Publish</button><button type="button" class="btn btn-primary btn-sm pe2-pub-more" data-pe="pubmenu" aria-label="More publishing options" aria-expanded="false">▾</button>
    <div class="pe2-pubmenu" hidden><button type="button" data-pe="publish">Publish now</button><button type="button" data-pe="schedule">Schedule for a date…</button><button type="button" data-pe="unpublish">Switch back to draft</button></div></div>
  </div>
 </header>
 <p class="pe2-msg" id="pe2-msg" role="alert"></p>
 <div class="pe2-body">
  <aside class="pe2-left" aria-label="Add to post"><p class="pe2-lh">Add to post</p>${PostVisual.ADD_ITEMS.map(i=>`<button type="button" data-add="${i.k}" title="${esc(i.desc)}"><span class="pe2-ic">${i.ic}</span><span>${esc(i.label)}</span></button>`).join('')}</aside>
  <main class="pe2-canvas">
   <div class="pe2-restore" id="pe2-restore" hidden><span>You have unsaved changes from earlier on this device.</span><button type="button" class="btn btn-ghost btn-sm" data-pe="restore">Restore them</button><button type="button" class="link-btn" data-pe="dismiss">Dismiss</button></div>
   <textarea class="pe2-title" id="pe2-title" maxlength="160" rows="1" placeholder="Post title" aria-label="Title">${esc(x.title)}</textarea>
   <div class="pe2-url">${icon('link')}<span class="pe2-url-base">${esc(site.replace(/^https?:\/\//,''))}post.html?p=</span><span class="pe2-slug" id="pe2-slug-view">${esc(x.slug||slugify(x.title)||'your-post')}</span><input class="pe2-slug-in" id="pe2-slug" maxlength="80" value="${esc(x.slug)}" hidden aria-label="Web address"><button type="button" class="link-btn" data-pe="slug">Edit</button></div>
   <textarea class="pe2-sum" id="pe2-sum" maxlength="300" rows="2" placeholder="A short summary for the blog card (one or two sentences)" aria-label="Summary">${esc(x.excerpt||'')}</textarea>
   <div id="pe2-ve"></div>
   <textarea name="body" id="pe2-body" hidden>${esc(startBody)}</textarea>
   <div class="pe2-preview post-body" id="pe2-preview" hidden></div>
   <p class="pe2-count small muted" id="pe2-count"></p>
  </main>
  <aside class="pe2-right">
   <div class="pe2-tabs" role="tablist"><button type="button" role="tab" class="on" data-tab="settings" aria-selected="true">Post settings</button><button type="button" role="tab" data-tab="seo" aria-selected="false">SEO</button></div>
   <section data-panel="settings">
    <h4>Featured image</h4>
    <div class="pe2-cover" id="pe2-cover"></div>
    <input type="file" accept="image/*" id="pe2-cover-file" hidden>
    <label class="pe2-f">Category<select class="input" id="pe2-cat">${cats.map(c=>`<option ${c===x.category?'selected':''}>${esc(c)}</option>`).join('')}${x.category&&!cats.includes(x.category)?`<option selected>${esc(x.category)}</option>`:''}<option value="__new">+ New category…</option></select></label>
    <div class="pe2-f"><span>Tags</span><div class="pe2-tags" id="pe2-tags"><input id="pe2-tag-in" list="pe2-tag-list" placeholder="Add a tag and press Enter" maxlength="30" aria-label="Add a tag"></div><datalist id="pe2-tag-list">${knownTags.map(t=>`<option value="${esc(t)}">`).join('')}</datalist><small>Readers can tap a tag to see similar posts.</small></div>
    <label class="pe2-f">Author<input class="input" id="pe2-author" maxlength="80" value="${esc(x.author_name||'')}"></label>
    <label class="pe2-f">Publish date<input class="input" type="date" id="pe2-date" value="${esc(x.published_at||TODAY())}"></label>
    <label class="pe2-switch"><input type="checkbox" id="pe2-sched" ${x.published_at&&x.published_at>TODAY()?'checked':''}><span class="pe2-tog" aria-hidden="true"></span><span>Schedule post<small>Goes live on the publish date instead of now.</small></span></label>
    ${p?.id?`<button type="button" class="pe2-del link-btn" data-pe="delete">Delete this post</button>`:''}
   </section>
   <section data-panel="seo" hidden>
    <p class="pe2-note">How this post appears in Google and when it's shared.</p>
    <label class="pe2-f">SEO title<input class="input" id="pe2-seot" maxlength="70" value="${esc(x.seo_title||'')}" placeholder="Uses the post title if empty"><small id="pe2-seot-n"></small></label>
    <label class="pe2-f">Description<textarea class="input" id="pe2-seod" maxlength="170" rows="3" placeholder="Uses the summary if empty">${esc(x.seo_description||'')}</textarea><small id="pe2-seod-n"></small></label>
    <div class="pe2-g"><p class="pe2-g-h">${icon('info')}Search preview</p><b id="pe2-g-t"></b><span id="pe2-g-u"></span><p id="pe2-g-d"></p></div>
   </section>
  </aside>
 </div>`;
 document.body.append(m);document.documentElement.classList.add('crop-open');
 const $=s=>m.querySelector(s),msg=$('#pe2-msg'),body=$('#pe2-body'),title=$('#pe2-title'),slugIn=$('#pe2-slug'),sum=$('#pe2-sum');
 /* the title wraps onto more lines instead of being cut off */
 const fitTitle=()=>{title.style.height='auto';title.style.height=title.scrollHeight+'px';};title.addEventListener('input',fitTitle);title.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sum.focus();}});requestAnimationFrame(fitTitle);addEventListener('resize',fitTitle);
 const say=(t,ok)=>{msg.textContent=t||'';msg.classList.toggle('ok',!!ok);};

 /* ----- visual article ----- */
 const upload=async f=>{const o=await optimiseImage(f,{mode:'natural'});return Live.adImageUrl(await Live.admin.uploadAdImage(o.blob,'posts'));};
 const fromUrl=async url=>{const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error('That photo could not be opened for cropping.');const bl=await r.blob();return new File([bl],'photo',{type:bl.type||'image/jpeg'});};
 const ve=PostVisual.mount($('#pe2-ve'),body,{upload,
  crop:async(url,[w,h])=>{const f=await fromUrl(url);const W=w>=h?1600:Math.round(1600*w/h),H=Math.round(W*h/w);const blob=await A.cropImage(f,{aspect:w/h,outW:W,outH:H,allowFit:true,title:'Crop and position'});if(!blob)return null;return Live.adImageUrl(await Live.admin.uploadAdImage(blob,'posts'));},
  status:t=>say(t),errorText:e=>Live.error(e),toast:t=>A.toast(t),
  askLink:async({url,text,hasText})=>{const v=await formBox(hasText?'Link':'Add a link',[...(hasText?[]:[{name:'text',label:'Words to show',value:text||''}]),{name:'url',label:'Web address (leave empty to remove the link)',value:url||'https://'}],'Save link');if(!v)return null;return {url:(v.url||'').trim().replace(/^https:\/\/$/,''),text:(v.text||'').trim()};},
  askVideo:async cur=>(await formBox('YouTube video',[{name:'url',label:'Paste the YouTube link',type:'url',value:cur||''}],'Add video'))?.url||''});
 m.querySelector('.pe2-left').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)ve.add(b.dataset.add);});

 /* ----- featured image ----- */
 function paintCover(){$('#pe2-cover').innerHTML=coverUrl?`<img src="${esc(coverUrl)}" alt="Featured image"><div class="pe2-cover-acts"><button type="button" data-pe="cover">${icon('image')}Replace</button><button type="button" data-pe="cropcover">Crop</button><button type="button" data-pe="nocover" aria-label="Remove featured image" title="Remove">${icon('close')}</button></div>`:`<button type="button" class="pe2-cover-add" data-pe="cover">${icon('upload')}<b>Add a featured image</b><span>Shown on the blog card and at the top of the post. 1920 × 1080 works best.</span></button>`;}
 async function setCover(file){const blob=await A.cropImage(file,{aspect:16/9,outW:1920,outH:1080,allowFit:true,title:'Featured image'});if(!blob)return;say('Uploading featured image…');
  try{coverPath=await Live.admin.uploadAdImage(blob,'posts');coverUrl=Live.adImageUrl(coverPath);say('');paintCover();changed();}catch(e){say(Live.error(e));}}
 $('#pe2-cover-file').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)setCover(f);});
 paintCover();

 /* ----- tags ----- */
 const tagBox=$('#pe2-tags'),tagIn=$('#pe2-tag-in');
 const paintTags=()=>{tagBox.querySelectorAll('.pe2-tag').forEach(t=>t.remove());x.tags.forEach((t,i)=>tagIn.insertAdjacentHTML('beforebegin',`<span class="pe2-tag">${esc(t)}<button type="button" data-tag="${i}" aria-label="Remove tag ${esc(t)}">×</button></span>`));};
 const addTag=v=>{v=String(v||'').trim().toLowerCase().replace(/[^a-z0-9 &'-]/g,'').replace(/\s+/g,' ').slice(0,30);if(v&&!x.tags.includes(v)&&x.tags.length<12){x.tags.push(v);paintTags();changed();}tagIn.value='';};
 tagIn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(tagIn.value);}else if(e.key==='Backspace'&&!tagIn.value&&x.tags.length){x.tags.pop();paintTags();changed();}});
 tagIn.addEventListener('change',()=>{if(knownTags.includes(tagIn.value.trim()))addTag(tagIn.value);});
 tagIn.addEventListener('blur',()=>{if(tagIn.value.trim())addTag(tagIn.value);});
 tagBox.addEventListener('click',e=>{const b=e.target.closest('[data-tag]');if(b){x.tags.splice(+b.dataset.tag,1);paintTags();changed();}else tagIn.focus();});
 paintTags();

 /* ----- title, web address, status ----- */
 const slugView=$('#pe2-slug-view');
 title.addEventListener('input',()=>{if(!slugTouched){slugIn.value=slugify(title.value);slugView.textContent=slugIn.value||'your-post';}changed();});
 slugIn.addEventListener('input',()=>{slugTouched=true;slugView.textContent=slugify(slugIn.value)||'your-post';changed();});
 slugIn.addEventListener('blur',()=>{slugIn.value=slugify(slugIn.value||title.value);slugView.textContent=slugIn.value;slugIn.hidden=true;slugView.hidden=false;});
 if(!slugIn.value)slugIn.value=slugify(x.title);
 $('#pe2-cat').addEventListener('change',async e=>{if(e.target.value!=='__new')return changed();const v=(await formBox('New category',[{name:'name',label:'Category name',value:''}],'Add'))?.name?.trim();const sel=e.target;
  if(v){const o=document.createElement('option');o.textContent=v.slice(0,60);sel.insertBefore(o,sel.lastElementChild);sel.value=o.textContent;}else sel.value=x.category||cats[0];changed();});
 const pill=()=>{const st=x.status==='published'?($('#pe2-date').value>TODAY()?'scheduled':'published'):'draft';const el=$('#pe2-pill');el.textContent={draft:'Draft',published:'Published',scheduled:'Scheduled'}[st];el.className='pe2-pill is-'+st;
  $('#pe2-publish').textContent=$('#pe2-sched').checked&&$('#pe2-date').value>TODAY()?'Schedule':x.status==='published'?'Update':'Publish';};
 const origDate=x.published_at||TODAY();
 $('#pe2-sched').addEventListener('change',e=>{const d=$('#pe2-date');if(e.target.checked&&d.value<=TODAY()){const t=new Date();t.setDate(t.getDate()+1);d.value=new Date(t-t.getTimezoneOffset()*6e4).toISOString().slice(0,10);d.focus();}if(!e.target.checked&&d.value>TODAY())d.value=origDate<=TODAY()?origDate:TODAY();pill();changed();});
 $('#pe2-date').addEventListener('change',()=>{$('#pe2-sched').checked=$('#pe2-date').value>TODAY();pill();changed();});
 pill();

 /* ----- SEO ----- */
 function seo(){const t=$('#pe2-seot').value.trim()||title.value.trim()||'Your post title',d=$('#pe2-seod').value.trim()||sum.value.trim()||'Add a summary so people know what the post is about.';
  $('#pe2-g-t').textContent=(t.length>60?t.slice(0,58)+'…':t)+' | BimCar Connect';$('#pe2-g-u').textContent=site.replace(/^https?:\/\//,'')+'post.html?p='+(slugIn.value||'your-post');$('#pe2-g-d').textContent=d.length>160?d.slice(0,158)+'…':d;
  const n1=$('#pe2-seot').value.trim().length,n2=$('#pe2-seod').value.trim().length;$('#pe2-seot-n').textContent=`${n1} of 60 characters`;$('#pe2-seod-n').textContent=`${n2} of 160 characters`;}
 ['#pe2-seot','#pe2-seod'].forEach(s=>$(s).addEventListener('input',()=>{seo();changed();}));seo();

 /* ----- word count, autosave on this device ----- */
 const draftKey='bimcar.postdraft.'+(p?.id||'new');
 const values=()=>({title:title.value.replace(/\s+/g,' ').trim(),slug:slugify(slugIn.value||title.value),excerpt:sum.value.trim(),category:$('#pe2-cat').value==='__new'?'':$('#pe2-cat').value,author_name:$('#pe2-author').value.trim(),published_at:$('#pe2-date').value||TODAY(),tags:x.tags.slice(),seo_title:$('#pe2-seot').value.trim(),seo_description:$('#pe2-seod').value.trim()});
 function count(){const w=(body.value.replace(/!\[[^\]]*\]\([^)]*\)(\{[\w-]+\})?/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').match(/[A-Za-z0-9’']+/g)||[]).length;$('#pe2-count').textContent=`${w} word${w===1?'':'s'} · ${Math.max(1,Math.round(w/220))} min read`;}
 let saveT;function changed(){dirty=true;count();seo();pill();clearTimeout(saveT);saveT=setTimeout(()=>{try{const v=values();localStorage.setItem(draftKey,JSON.stringify({...v,body:body.value,cover_path:coverPath,at:Date.now()}));$('#pe2-saved').textContent='Saved on this device';}catch{}},700);}
 body.addEventListener('input',()=>{changed();if(!$('#pe2-preview').hidden)preview();});sum.addEventListener('input',changed);$('#pe2-author').addEventListener('input',changed);
 count();
 try{const dr=JSON.parse(localStorage.getItem(draftKey)||'null');if(dr&&dr.body&&dr.body.trim()!==body.value.trim()&&Date.now()-dr.at<14*864e5){$('#pe2-restore').hidden=false;
  m.querySelector('[data-pe=restore]').addEventListener('click',()=>{title.value=dr.title||'';sum.value=dr.excerpt||'';slugIn.value=dr.slug||'';slugView.textContent=dr.slug||'your-post';body.value=dr.body;if(Array.isArray(dr.tags)){x.tags=dr.tags;paintTags();}if(dr.cover_path){coverPath=dr.cover_path;coverUrl=Live.adImageUrl(coverPath);paintCover();}
   body.dispatchEvent(new Event('ve-reload'));$('#pe2-restore').hidden=true;changed();});}}catch{}

 /* ----- preview ----- */
 function preview(){const v=values();$('#pe2-preview').innerHTML=`${coverUrl?`<img class="pe2-pv-cover" src="${esc(coverUrl)}" alt="">`:''}<span class="journal-category">${esc(v.category||'Island Drives')}</span><h1 class="pe2-pv-title">${esc(v.title||'Your title')}</h1>${v.excerpt?`<p class="lede">${esc(v.excerpt)}</p>`:''}${A.renderPost(body.value)}${v.tags.length?`<p class="post-tags">${v.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</p>`:''}`;}
 function togglePreview(on){const pv=$('#pe2-preview'),btn=m.querySelector('[data-pe=preview]');pv.hidden=!on;$('#pe2-ve').hidden=on;title.hidden=on;sum.hidden=on;m.querySelector('.pe2-url').hidden=on;m.classList.toggle('is-preview',on);btn.setAttribute('aria-pressed',String(on));btn.querySelector('span').textContent=on?'Back to editing':'Preview';if(on){preview();pv.scrollIntoView({block:'start'});}}

 /* ----- save ----- */
 async function save(mode){say('');const v=values();
  if(!v.title){say('Add a title first.');title.focus();return;}
  if(allPosts.some(o=>o.slug===v.slug&&o.id!==p?.id)){say('Another post already uses that web address. Change it slightly.');return;}
  let status=mode==='draft'?'draft':'published';
  if(mode==='keep')status=x.status==='published'?'published':'draft';
  if(status==='published'&&body.value.replace(/!\[[^\]]*\]\([^)]*\)(\{[\w-]+\})?/g,'').trim().length<40){say('Write a little more before publishing (at least a couple of sentences).');return;}
  if(status==='published'&&mode!=='schedule'&&!$('#pe2-sched').checked&&x.status!=='published')v.published_at=TODAY();
  const btns=m.querySelectorAll('.pe2-actions .btn');btns.forEach(b=>b.disabled=true);m.querySelector(mode==='draft'?'[data-pe=draft]':'#pe2-publish').classList.add('is-loading');
  try{const saved=await Live.admin.savePost({...v,body:body.value,status,id:p?.id,cover_path:coverPath});
   try{localStorage.removeItem(draftKey);}catch{}dirty=false;
   await Live.admin.log(p?.id?'Edited blog post':'Created blog post',saved.title,{status:saved.status});
   if(saved._extrasMissing)A.toast('Saved. Tags and SEO need one more database update before they are kept: run backend/ADMIN-UPGRADE.sql in Supabase.');
   else A.toast(status==='draft'?'Draft saved':saved.published_at>TODAY()?`Scheduled for ${A.fmtDate(saved.published_at,{day:'numeric',month:'long'})}`:x.status==='published'?'Post updated':'Post published');
   close(true);onSaved?.();}
  catch(err){say(/duplicate|23505/.test(String(err?.code)+err?.message)?'Another post already uses that web address.':Live.error(err));}
  finally{btns.forEach(b=>{b.disabled=false;b.classList.remove('is-loading');});m.querySelector('#pe2-publish').classList.remove('is-loading');}}
 async function close(force){if(closing)return;if(!force&&dirty&&!(await confirmBox({title:'Leave without saving?',text:'Your changes stay saved on this device, so you can restore them next time you open this post.',label:'Leave'})))return;
  closing=true;m.remove();document.documentElement.classList.remove('crop-open');document.removeEventListener('keydown',onKey);}
 const onKey=e=>{if(e.key==='Escape'&&!document.querySelector('.crop-modal,#admin-form,#admin-confirm,.lightbox')){const pm=m.querySelector('.pe2-pubmenu');if(!pm.hidden){pm.hidden=true;return;}close();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save('keep');}};
 document.addEventListener('keydown',onKey);

 m.addEventListener('click',async e=>{
  const tab=e.target.closest('[data-tab]');if(tab){m.querySelectorAll('[data-tab]').forEach(t=>{const on=t===tab;t.classList.toggle('on',on);t.setAttribute('aria-selected',String(on));});m.querySelectorAll('[data-panel]').forEach(s=>s.hidden=s.dataset.panel!==tab.dataset.tab);return;}
  const b=e.target.closest('[data-pe]');const pm=m.querySelector('.pe2-pubmenu');if(!b){if(!e.target.closest('.pe2-pub'))pm.hidden=true;return;}
  const a=b.dataset.pe;if(a!=='pubmenu')pm.hidden=true;
  if(a==='close')return close();
  if(a==='pubmenu'){pm.hidden=!pm.hidden;b.setAttribute('aria-expanded',String(!pm.hidden));return;}
  if(a==='draft')return save('draft');
  if(a==='publish')return save('publish');
  if(a==='schedule'){const v=await formBox('Schedule this post',[{name:'date',label:'Goes live on',type:'date',value:$('#pe2-date').value>TODAY()?$('#pe2-date').value:''}],'Schedule');if(!v?.date)return;if(v.date<=TODAY()){say('Pick a date after today to schedule.');return;}$('#pe2-date').value=v.date;$('#pe2-sched').checked=true;pill();return save('schedule');}
  if(a==='unpublish')return save('draft');
  if(a==='preview')return togglePreview($('#pe2-preview').hidden);
  if(a==='slug'){slugView.hidden=true;slugIn.hidden=false;slugIn.focus();slugIn.select();return;}
  if(a==='cover')return $('#pe2-cover-file').click();
  if(a==='cropcover'){try{await setCover(await fromUrl(coverUrl));}catch(err){say(err.message);}return;}
  if(a==='nocover'){coverPath=null;coverUrl=null;paintCover();changed();A.toast('Featured image removed. Save to keep this change.');return;}
  if(a==='dismiss'){$('#pe2-restore').hidden=true;try{localStorage.removeItem(draftKey);}catch{}return;}
  if(a==='delete'){if(!(await confirmBox({title:'Delete this post?',text:'It will be removed from the blog straight away. This cannot be undone.',label:'Delete post',danger:true})))return;
   try{await Live.admin.deletePost(p.id);await Live.admin.log('Deleted blog post',p.title);A.toast('Post deleted');close(true);onSaved?.();}catch(err){say(Live.error(err));}}
 });
 setTimeout(()=>{if(!p?.id)title.focus();},60);
 return m;
}
window.PostEditor={open};
})();
