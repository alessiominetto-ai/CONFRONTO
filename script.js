(function(){
var items=[];
try{items=(window.CONFRONTI&&window.CONFRONTI.items)||[];}catch(_){}
var BASE=items.map(function(i){return i.id+':'+(i.before||'').length+':'+(i.after||'').length+':'+(i.abstract||'').length+':'+(i.title||'');}).join('|');
var app=document.getElementById('app');
app.innerHTML=`<header><div class="switch" role="group" aria-label="Modalità di visualizzazione">
<button class="lbl" id="lblOver" aria-pressed="true" type="button">Sovrapposte</button>
<button class="track" id="track" role="switch" aria-checked="false" aria-label="Affianca le immagini" type="button"></button>
<button class="lbl" id="lblSplit" aria-pressed="false" type="button">Affiancate</button></div></header>
<nav class="tabs" id="tabs" hidden aria-label="Confronti"></nav>
<main>
<div class="frame" id="frame" hidden>
<div class="stage" id="stage">
<div class="pane before"><span class="tag">Stato di fatto</span><img id="imgA" alt="Stato di fatto"></div>
<div class="pane after"><span class="tag">Stato di progetto</span><img id="imgB" alt="Stato di progetto"></div>
<div class="handle" id="handle" tabindex="0" role="slider" aria-label="Cursore di confronto: frecce sinistra e destra per spostare la divisione, su e giù per alzare o abbassare il pomello" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><div class="knob"><svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></div></div>
</div>
<div class="caps"><span>Stato di fatto</span><span>Stato di progetto</span></div>
<div class="abstract" id="absBox"><p id="absText"></p><textarea id="abs" rows="2" maxlength="600" placeholder="Scrivi un breve abstract del confronto…" aria-label="Abstract del confronto" hidden></textarea></div>
</div>
<p class="none" id="none" hidden>Nessun confronto disponibile.</p>
<div id="studioHost"></div>
</main>`;
var $=function(s){return app.querySelector(s);};
var stage=$('#stage'),handle=$('#handle'),track=$('#track'),lo=$('#lblOver'),ls=$('#lblSplit'),
    imgA=$('#imgA'),imgB=$('#imgB'),absT=$('#absText'),abs=$('#abs'),absBox=$('#absBox'),
    tabs=$('#tabs'),frame=$('#frame'),none=$('#none');
var pos=50,py=50,split=false,timer,drag=false,both=false,cur=0,canEdit=!!window.ADMIN,dirty=false,busy=false,artifactNS=null,studio=null;

/* ---- confronto ---- */
function setPos(p){pos=Math.max(0,Math.min(100,p));stage.style.setProperty('--pos',pos+'%');handle.setAttribute('aria-valuenow',Math.round(pos));}
function setPy(p){py=Math.max(4,Math.min(96,p));stage.style.setProperty('--py',py+'%');}
function setMode(s){
  if(s===split)return;
  split=s;stage.classList.add('morph');stage.classList.toggle('split',s);
  track.setAttribute('aria-checked',String(s));
  lo.setAttribute('aria-pressed',String(!s));ls.setAttribute('aria-pressed',String(s));
  handle.tabIndex=s?-1:0;
  clearTimeout(timer);timer=setTimeout(function(){stage.classList.remove('morph');},1000);
}
function fromEvent(e){var r=stage.getBoundingClientRect();setPos((e.clientX-r.left)/r.width*100);if(both)setPy((e.clientY-r.top)/r.height*100);}
stage.addEventListener('pointerdown',function(e){
  if(split)return;
  drag=true;both=!!e.target.closest('.knob');
  stage.classList.remove('morph');stage.classList.toggle('dragging-both',both);
  try{stage.setPointerCapture(e.pointerId);}catch(_){}
  fromEvent(e);
});
stage.addEventListener('pointermove',function(e){if(drag)fromEvent(e);});
['pointerup','pointercancel'].forEach(function(n){stage.addEventListener(n,function(){drag=false;both=false;stage.classList.remove('dragging-both');});});
handle.addEventListener('keydown',function(e){
  var step=e.shiftKey?10:2;
  if(e.key==='ArrowLeft'){setPos(pos-step);e.preventDefault();}
  else if(e.key==='ArrowRight'){setPos(pos+step);e.preventDefault();}
  else if(e.key==='ArrowUp'){setPy(py-step);e.preventDefault();}
  else if(e.key==='ArrowDown'){setPy(py+step);e.preventDefault();}
  else if(e.key==='Home'){setPos(0);e.preventDefault();}
  else if(e.key==='End'){setPos(100);e.preventDefault();}
});
track.addEventListener('click',function(){setMode(!split);});
lo.addEventListener('click',function(){setMode(false);});
ls.addEventListener('click',function(){setMode(true);});

/* ---- contenuti ---- */
function ed(){return canEdit&&!preview;}
var preview=false,bar=null;
function vis(){return ed()?items:items.filter(function(i){return i.before&&i.after;});}
function grow(){abs.style.height='auto';abs.style.height=abs.scrollHeight+'px';}
function setImg(el,src){if(src)el.src=src;else el.removeAttribute('src');}
function renderTabs(){
  var v=vis();tabs.hidden=v.length<2;while(tabs.children.length>v.length)tabs.removeChild(tabs.lastChild);
  v.forEach(function(x,i){
    var b=tabs.children[i];if(!b){b=document.createElement('button');b.type='button';b.className='tab';b.onclick=function(){var k=Array.prototype.indexOf.call(tabs.children,b);if(k!==cur)morphTo(k);};tabs.appendChild(b);}
    b.textContent=x.title||String(i+1);b.setAttribute('aria-current',String(i===cur));
    
  });
}
function morphTo(i){cur=i;show();}
function setAr(it){var a=it.ar||.75;frame.style.setProperty('--ar',a);frame.setAttribute('data-o',a<=1?'l':'p');}
function show(){
  var v=vis();if(cur>=v.length)cur=Math.max(0,v.length-1);
  var it=v[cur];
  frame.hidden=!it;none.hidden=!!it||ed();
  if(it){
    setAr(it);setImg(imgA,it.before);setImg(imgB,it.after);
    absT.textContent=it.abstract||'';absT.hidden=ed();
    abs.hidden=!ed();if(ed()){abs.value=it.abstract||'';grow();}
    absBox.hidden=!ed()&&!it.abstract;
  }
  renderTabs();updateStudio();
}
abs.addEventListener('input',function(){var it=vis()[cur];if(!it)return;it.abstract=abs.value;grow();markDirty();});
window.addEventListener('resize',function(){if(canEdit)grow();});

/* ---- area di modifica (solo chi può modificare) ---- */
var $s=function(s){return studio.querySelector(s);};
function say(t){if(studio)$s('#stat').textContent=t||'';}
function idb(){return new Promise(function(res,rej){var r=indexedDB.open('confronto',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv');};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function dget(){return idb().then(function(d){return new Promise(function(res){var q=d.transaction('kv').objectStore('kv').get('draft');q.onsuccess=function(){res(q.result||null);};q.onerror=function(){res(null);};});}).catch(function(){return null;});}
function dput(v){return idb().then(function(d){var t=d.transaction('kv','readwrite');if(v===null)t.objectStore('kv').delete('draft');else t.objectStore('kv').put(v,'draft');}).catch(function(){});}
var st;
function markDirty(){dirty=true;updateStudio();clearTimeout(st);st=setTimeout(function(){dput({items:items,base:BASE});},500);}
function updateStudio(){
  if(!studio)return;
  var it=vis()[cur];
  $s('#upA').textContent=(it&&it.before?'Sostituisci':'Carica')+' stato di fatto';
  $s('#upB').textContent=(it&&it.after?'Sostituisci':'Carica')+' stato di progetto';
  $s('#upA').disabled=$s('#upB').disabled=$s('#del').disabled=$s('#ttl').disabled=!it;
  if(it&&document.activeElement!==$s('#ttl'))$s('#ttl').value=it.title||'';
  $s('#pub').disabled=!dirty||busy;
  if(dirty&&!busy&&!$s('#stat').textContent)say('Modifiche non ancora scaricate');
}
function prep(file){
  return createImageBitmap(file).then(function(b){
    var s=Math.min(1,1600/Math.max(b.width,b.height)),c=document.createElement('canvas');
    c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);
    c.getContext('2d').drawImage(b,0,0,c.width,c.height);
    return {url:c.toDataURL('image/jpeg',.82),ar:c.height/c.width};
  });
}
function buildBar(){
  bar=document.createElement('div');bar.className='devbar';
  bar.innerHTML='<span id="barTxt"></span><button class="barbtn" id="barBtn" type="button"></button>';
  app.insertBefore(bar,app.firstChild);
  bar.querySelector('#barBtn').onclick=function(){preview=!preview;applyMode();};
  applyMode();
}
function applyMode(){
  bar.querySelector('#barTxt').textContent=preview?'Anteprima visitatore':'Vista sviluppatore';
  bar.querySelector('#barBtn').textContent=preview?'Torna alla modifica':'Anteprima visitatore';
  if(studio)studio.hidden=preview;
  show();
}
function buildStudio(){
  studio=document.createElement('section');studio.className='studio';
  studio.innerHTML=`<p class="hint">Area sviluppatore. Le modifiche restano su questo dispositivo finché non scarichi data.js e lo carichi su GitHub al posto del file esistente.</p>
<input class="field" id="ttl" maxlength="60" placeholder="Titolo del confronto (facoltativo)" aria-label="Titolo del confronto">
<div class="row"><button class="btn" id="upA" type="button"></button><button class="btn" id="upB" type="button"></button></div>
<div class="row"><button class="btn" id="add" type="button">Nuovo confronto</button><button class="btn" id="del" type="button">Elimina questo confronto</button></div>
<div class="row"><button class="btn primary" id="pub" type="button" disabled>Scarica data.js</button><span class="stat" id="stat" role="status"></span></div>
<input type="file" id="file" accept="image/*" hidden>`;
  $('#studioHost').appendChild(studio);
  var target=null,file=$s('#file');
  $s('#upA').onclick=function(){target='before';file.click();};
  $s('#upB').onclick=function(){target='after';file.click();};
  file.onchange=function(){
    var f=file.files[0];file.value='';if(!f||!target)return;
    var it=vis()[cur],t=target;say('Preparo l’immagine…');
    prep(f).then(function(r){it[t]=r.url;if(t==='before'||!it.before)it.ar=r.ar;say('');markDirty();show();}).catch(function(){say('Impossibile leggere questo file.');});
  };
  $s('#ttl').oninput=function(){var it=vis()[cur];if(it){it.title=this.value;markDirty();renderTabs();}};
  $s('#add').onclick=function(){items.push({id:Date.now().toString(36),title:'',before:'',after:'',abstract:''});cur=items.length-1;say('');markDirty();show();};
  var armed=false,dt;
  function disarm(){clearTimeout(dt);armed=false;$s('#del').textContent='Elimina questo confronto';}
  $s('#del').onclick=function(){
    if(!armed){armed=true;this.textContent='Conferma eliminazione';dt=setTimeout(disarm,3000);return;}
    disarm();var it=vis()[cur];if(!it)return;
    items.splice(items.indexOf(it),1);cur=Math.max(0,cur-1);say('');markDirty();show();
  };
  $s('#pub').onclick=publish;
  updateStudio();
}
function publish(){
  if(busy)return;
  var src='window.CONFRONTI='+JSON.stringify({items:items}).replace(/</g,'\\u003c')+';\n';
  var url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
  var a=document.createElement('a');a.href=url;a.download='data.js';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},4000);
  dirty=false;say('data.js scaricato: caricalo su GitHub al posto del file esistente.');updateStudio();
}

setPos(50);setPy(50);show();
if(canEdit){
  dget().then(function(d){
    if(d&&d.items&&d.items.length&&d.base===BASE){items=d.items;dirty=true;}
    buildStudio();buildBar();
    if(dirty)say('Bozza ripristinata, non ancora scaricata');
  });
}
})();
