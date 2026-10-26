(function(){
'use strict';
var ADMIN=!!window.ADMIN,DATA=window.CONFRONTI||{};
var items=(DATA.items||[]).map(function(x){return Object.assign({},x);});
var DEF={name:'Alessio Minetto',text:'Ingegnere Edile-Architetto,\nlibero professionista,\nesperto in rappresentazione architettonica.',photo:'immagini/ritratto.jpg'};
var profile=Object.assign({},DEF,DATA.profile||{});
function sig(){return items.map(function(i){return i.id+':'+(i.before||'').length+':'+(i.after||'').length+':'+(i.abstract||'').length+':'+(i.title||'');}).join('|')+'#'+profile.name+'|'+profile.text.length+'|'+(profile.photo||'').length;}
var BASE=sig();
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var mq=window.matchMedia('(max-width:640px)');
var app=document.getElementById('app');

/* ---------- struttura ---------- */
function swHTML(cls,demo){var t=demo?' tabindex="-1"':'';return '<div class="sw '+(cls||'')+'" role="group" aria-label="Modalità di visualizzazione"'+(demo?' aria-hidden="true"':'')+'><button class="lbl" data-m="split" type="button" aria-pressed="true"'+t+'>Affiancate</button><button class="track" role="switch" aria-checked="false" aria-label="Sovrappone le immagini" type="button"'+t+'></button><button class="lbl" data-m="over" type="button" aria-pressed="false"'+t+'>Sovrapposte</button></div>';}
function sliderHTML(label,demo){return '<div class="slider"><i class="dot"></i><i class="dot r"></i><span class="ln"><b></b></span><button class="hd" type="button" role="slider" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"'+(demo?' tabindex="-1" aria-hidden="true"':'')+'></button></div>';}
var PUB='<div class="row"><button class="btn primary pub" type="button" disabled>Scarica aggiornamento</button><span class="stat" role="status"></span></div>';
app.innerHTML=
'<header class="top"><a class="brand" href="#" aria-label="Home"><img src="logo-bianco.png" alt="Alessio Minetto" width="32" height="32"></a>'+
'<nav class="nav" aria-label="Principale"><a href="#chi-sono" data-r="about"><span>Chi sono</span></a><a href="#progetti" data-r="work"><span>Progetti</span></a></nav>'+
'<button class="burger" id="burger" type="button" aria-label="Apri il menu" aria-expanded="false"><i></i><i></i><i></i></button></header>'+
'<div class="menu" id="menu" aria-hidden="true"><nav aria-label="Menu"><a href="#chi-sono">Chi sono</a><a href="#progetti">Progetti</a><a href="#contatti" class="ct" aria-current="true">Contatti</a></nav>'+
'<div class="mc"><img src="logo-bianco.png" alt="" width="130" height="130"><b>Alessio Minetto</b><a href="mailto:alessio.minetto@gmail.com">alessio.minetto@gmail.com</a><span>P.IVA 02600730069</span>'+
'<small>Via Provinciale Ovada 51, Tagliolo Monferrato (AL)<br>C.F. MNTLSS92C28G197L · Ordine Ingegneri di Alessandria n° A-2314</small></div></div>'+
'<main>'+
'<section class="page home" id="pHome" data-r="home"><h1 class="big">Foto<em>inserimenti</em></h1>'+swHTML('home-sw',true)+
'<div class="frame home split" id="fHome"><div class="cmp"><div class="pane before"><div class="pat"><div class="rot" id="rotA"></div></div></div>'+
'<div class="pane after"><div class="pat"><div class="rot" id="rotB"></div></div></div></div>'+
'<div class="under">'+sliderHTML('Cursore dimostrativo',true)+'</div></div></section>'+
'<section class="page about" id="pAbout" data-r="about" hidden><div class="ab"><figure class="portrait"><img id="abImg" alt="" width="640" height="640"></figure>'+
'<div class="abt"><h2 id="abName"></h2><p id="abText"></p></div></div></section>'+
'<section class="page work" id="pWork" data-r="work" hidden>'+swHTML('work-sw')+
'<div class="frame work split" id="fWork"><div class="cmp" id="cWork"><div class="pane before"><img id="imgA" alt="Stato di fatto" decoding="async" fetchpriority="high"></div>'+
'<div class="pane after"><img id="imgB" alt="Stato di progetto" decoding="async" fetchpriority="high"></div></div>'+
'<div class="cap" id="cap"><b id="capT"></b><span id="capA"></span></div>'+
'<div class="under">'+sliderHTML('Cursore di confronto',false)+'</div></div>'+
'<p class="none" id="none" hidden>Nessun progetto disponibile.</p>'+
'<nav class="nums" id="nums" aria-label="Progetti" hidden></nav></section>'+
'</main>';

function $(s,r){return (r||app).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s));}
var frames={home:$('#fHome'),work:$('#fWork')};
var imgA=$('#imgA'),imgB=$('#imgB'),cap=$('#cap'),capT=$('#capT'),capA=$('#capA'),nums=$('#nums'),none=$('#none');
var split=true,hsplit=true,page='home',cur=0,canEdit=ADMIN,preview=false,dirty=false,busy=false,studio=false,mt=0;
var pos={home:40,work:50},cap1=0,cap2=0;
function ed(){return canEdit&&!preview;}
function vis(){return ed()?items:items.filter(function(i){return i.before&&i.after;});}

/* trame della home: la parola extrabold è una delle ripetizioni, al centro del riquadro */
function fillPat(el,word,rows,n){
  var h='',mid=(rows-1)/2,r,off,c;
  for(r=0;r<rows;r++){
    off=Math.abs(r-mid);
    if(off===0)h+='<div class="row"><span class="w">'+new Array(n+1).join(word)+'</span><b>'+word+'</b><span class="w">'+new Array(n+1).join(word)+'</span></div>';
    else{c=2*n+1+(off%2?1:0);h+='<div class="row"><span class="w">'+new Array(c+1).join(word)+'</span></div>';}
  }
  el.innerHTML=h;
}
fillPat($('#rotA'),'PRIMA',27,9);fillPat($('#rotB'),'DOPO',27,9);

/* ---------- cursore ---------- */
function setPos(k,p){
  pos[k]=Math.max(0,Math.min(100,p));
  frames[k].style.setProperty('--pos',pos[k]+'%');frames[k].style.setProperty('--p',String(pos[k]/100));
  var h=$('.hd',frames[k]);if(h)h.setAttribute('aria-valuenow',String(Math.round(pos[k])));
}
function bindDrag(el,k,rect){
  var d=false;
  function mv(e){var r=rect();if(r.width)setPos(k,(e.clientX-r.left)/r.width*100);}
  el.addEventListener('pointerdown',function(e){
    if(split)return;
    d=true;frames[k].classList.remove('morph');
    try{el.setPointerCapture(e.pointerId);}catch(_){}
    mv(e);
  });
  el.addEventListener('pointermove',function(e){if(d)mv(e);});
  ['pointerup','pointercancel'].forEach(function(n){el.addEventListener(n,function(){d=false;});});
}
bindDrag($('#cWork'),'work',function(){return $('.pane.before',frames.work).getBoundingClientRect();});
bindDrag($('.slider',frames.work),'work',function(){return $('.slider',frames.work).getBoundingClientRect();});
$('.hd',frames.work).addEventListener('keydown',function(e){
  var s=e.shiftKey?10:2;
  if(e.key==='ArrowLeft'||e.key==='ArrowDown'){setPos('work',pos.work-s);e.preventDefault();}
  else if(e.key==='ArrowRight'||e.key==='ArrowUp'){setPos('work',pos.work+s);e.preventDefault();}
  else if(e.key==='Home'){setPos('work',0);e.preventDefault();}
  else if(e.key==='End'){setPos('work',100);e.preventDefault();}
});

/* home: dimostrazione automatica, coordinata con l'interruttore */
var raf=0,t0=0,hT=0,hRun=false,hi=0;
function setHome(v){
  if(v===hsplit)return;
  hsplit=v;
  var f=frames.home,w=$('.home-sw');
  f.classList.add('morph');f.classList.toggle('split',v);
  $('.track',w).setAttribute('aria-checked',String(!v));
  $$('.lbl',w).forEach(function(b){b.setAttribute('aria-pressed',String((b.getAttribute('data-m')==='split')===v));});
  if(v)setPos('home',40);
  setTimeout(function(){f.classList.remove('morph');},1000);
}
function homeTick(ts){
  if(hsplit||!hRun){raf=0;return;}
  if(!t0)t0=ts;
  setPos('home',40+10*(1-Math.cos((ts-t0)/1000*1.75))/2);
  raf=requestAnimationFrame(homeTick);
}
var HS=[
  [2400,function(){setHome(false);}],
  [1100,function(){t0=0;if(!raf)raf=requestAnimationFrame(homeTick);}],
  [7200,function(){setHome(true);}],
  [1800,function(){}]
];
function homeNext(){
  if(!hRun)return;
  var st=HS[hi];
  hT=setTimeout(function(){if(!hRun)return;st[1]();hi=(hi+1)%HS.length;homeNext();},st[0]);
}
function homeStart(){if(hRun||page!=='home'||reduce||document.hidden)return;hRun=true;hi=0;setHome(true);homeNext();}
function homeStop(){hRun=false;clearTimeout(hT);if(raf)cancelAnimationFrame(raf);raf=0;}
document.addEventListener('visibilitychange',function(){if(document.hidden)homeStop();else homeStart();});

/* ---------- interruttore ---------- */
function applyUnder(){
  var u=$('.under',frames.work);
  if(mq.matches){u.style.height='';return;}
  u.style.height=(split?(cap1?cap1+16+40:56):72)+'px';
}
function setMode(s){
  if(s===split)return;
  split=s;
  frames.work.classList.add('morph');frames.work.classList.toggle('split',s);
  $$('.sw:not(.home-sw)').forEach(function(w){
    $('.track',w).setAttribute('aria-checked',String(!s));
    $$('.lbl',w).forEach(function(b){b.setAttribute('aria-pressed',String((b.getAttribute('data-m')==='split')===s));});
  });
  $$('.hd').forEach(function(h){if(h.getAttribute('aria-hidden')!=='true')h.tabIndex=s?-1:0;});
  applyUnder();
  clearTimeout(mt);
  mt=setTimeout(function(){frames.work.classList.remove('morph');},1000);
}
$$('.sw:not(.home-sw)').forEach(function(w){
  $('.track',w).addEventListener('click',function(){setMode(!split);});
  $$('.lbl',w).forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m')==='split');});});
});
$$('.hd',frames.work).forEach(function(h){h.tabIndex=-1;});

/* ---------- progetti ---------- */
function setImg(el,src){if(src)el.src=src;else el.removeAttribute('src');}
function measure(){
  if(cap.hidden||!frames.work.clientWidth||mq.matches){cap1=cap2=0;frames.work.style.setProperty('--caph','0px');applyUnder();return;}
  var F=frames.work.clientWidth;
  function h(w){var c=cap.cloneNode(true);c.removeAttribute('id');c.className='cap2';c.style.cssText='position:absolute;left:0;top:0;visibility:hidden;width:'+Math.max(w,40)+'px';
    $$('[id]',c).forEach(function(n){n.removeAttribute('id');});frames.work.appendChild(c);var r=c.offsetHeight;c.remove();return r;}
  cap1=h(.459*F);cap2=h(.226*F-28);
  frames.work.style.setProperty('--caph',cap2+'px');
  applyUnder();
}
function show(){
  var v=vis();if(cur>=v.length)cur=Math.max(0,v.length-1);
  var it=v[cur];
  frames.work.hidden=!it;nums.hidden=v.length<2;none.hidden=!!it||ed();
  if(it){
    var a=it.ar||.75;
    frames.work.style.setProperty('--ar',a);frames.work.setAttribute('data-o',a<=1?'l':'p');
    setImg(imgA,it.before);setImg(imgB,it.after);
    capT.textContent=it.title||'';capA.textContent=it.abstract||'';cap.hidden=!(it.title||it.abstract);
    measure();
  }
  renderNums();updateStudio();
}
function renderNums(){
  var v=vis();
  while(nums.children.length>v.length&&nums.lastChild.className!=='dropmark')nums.removeChild(nums.lastChild);
  nums.classList.toggle('edit',ed()&&v.length>1);
  v.forEach(function(x,i){
    var b=nums.children[i];
    if(!b||b.className==='dropmark'){
      b=document.createElement('button');b.type='button';b.className='num';
      b.onclick=function(){if(noClick)return;var k=numIndex(b);if(k!==cur)goTo(k);};
      b.onkeydown=function(e){if(ed()&&e.shiftKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){var k=numIndex(b);moveItem(k,k+(e.key==='ArrowLeft'?-1:1));if(nums.children[cur])nums.children[cur].focus();e.preventDefault();}};
      nums.insertBefore(b,nums.children[i]||null);
    }
    b.textContent=String(i+1);b.setAttribute('aria-current',String(i===cur));
  });
}
function numIndex(b){return Array.prototype.indexOf.call(nums.children,b);}
function goTo(i){cur=i;show();try{history.replaceState(null,'','#progetti/'+(i+1));}catch(_){}}
window.addEventListener('resize',function(){if(page==='work')measure();});

/* riordino trascinando i numeri (solo sviluppatore) */
var dragS=null,noClick=false;
function moveItem(from,to){
  if(from===to||to<0||to>=items.length)return;
  var it=items.splice(from,1)[0];items.splice(to,0,it);
  cur=to;markDirty();show();
  try{history.replaceState(null,'','#progetti/'+(cur+1));}catch(_){}
}
nums.addEventListener('pointerdown',function(e){
  if(!ed())return;
  var b=e.target.closest('.num');if(!b)return;
  dragS={b:b,i:numIndex(b),x:e.clientX,y:e.clientY,on:false,id:e.pointerId,rects:null,to:numIndex(b),mark:null};
});
nums.addEventListener('pointermove',function(e){
  var s=dragS;if(!s||e.pointerId!==s.id)return;
  var dx=e.clientX-s.x,dy=e.clientY-s.y;
  if(!s.on){
    if(Math.abs(dx)+Math.abs(dy)<8)return;
    s.on=true;try{nums.setPointerCapture(e.pointerId);}catch(_){}
    s.b.classList.add('drag');
    var tr=nums.getBoundingClientRect();
    s.rects=Array.prototype.map.call(nums.children,function(c){
      var r=c.getBoundingClientRect();
      return {l:r.left-tr.left,r:r.right-tr.left,t:r.top-tr.top,b:r.bottom-tr.top,cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2};
    });
    s.mark=document.createElement('div');s.mark.className='dropmark';nums.appendChild(s.mark);
  }
  s.b.style.transform='translate('+dx+'px,'+dy+'px)';
  var best=0,bd=1e9;
  s.rects.forEach(function(r,k){if(k>=items.length)return;var d=Math.hypot(e.clientX-r.cx,e.clientY-r.cy);if(d<bd){bd=d;best=k;}});
  var r=s.rects[best],after=e.clientX>r.cx,slot=best+(after?1:0);
  s.to=slot>s.i?slot-1:slot;
  s.mark.style.left=((after?r.r+16:r.l-16)-1)+'px';
  s.mark.style.top=(r.t+8)+'px';s.mark.style.height=Math.max(r.b-r.t-16,8)+'px';
});
function endDrag(e){
  var s=dragS;if(!s||e.pointerId!==s.id)return;
  dragS=null;if(!s.on)return;
  noClick=true;setTimeout(function(){noClick=false;},60);
  s.b.style.transition='none';s.b.style.transform='';s.b.classList.remove('drag');
  requestAnimationFrame(function(){s.b.style.transition='';});
  if(s.mark)s.mark.remove();
  try{nums.releasePointerCapture(e.pointerId);}catch(_){}
  if(e.type==='pointerup')moveItem(s.i,s.to);
}
nums.addEventListener('pointerup',endDrag);
nums.addEventListener('pointercancel',endDrag);

/* ---------- chi sono ---------- */
function renderAbout(){
  $('#abName').textContent=profile.name;$('#abText').textContent=profile.text;
  var im=$('#abImg');if(profile.photo)im.src=profile.photo;else im.removeAttribute('src');im.alt=profile.name;
}

/* ---------- menu ---------- */
var menu=$('#menu'),burger=$('#burger');
function menuOpen(o){
  menu.classList.toggle('open',o);menu.setAttribute('aria-hidden',String(!o));
  burger.setAttribute('aria-expanded',String(o));$('.top').classList.toggle('mopen',o);burger.setAttribute('aria-label',o?'Chiudi il menu':'Apri il menu');
  document.body.style.overflow=o?'hidden':'';
}
burger.addEventListener('click',function(){
  var o=!menu.classList.contains('open');menuOpen(o);
  if(!o&&location.hash==='#contatti'){try{history.replaceState(null,'','#'+(page==='home'?'':page==='about'?'chi-sono':'progetti'));}catch(_){}}
});
menu.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&!a.classList.contains('ct')){menuOpen(false);}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open'))menuOpen(false);});

/* ---------- pagine ---------- */
function route(){
  var h=decodeURIComponent(location.hash.replace(/^#\/?/,'')),m;
  if(h==='contatti'){menuOpen(true);return;}
  menuOpen(false);
  var p='home';
  if(h==='chi-sono')p='about';
  else if((m=/^(?:progetti\/)?(\d+)$/.exec(h))){p='work';cur=Math.max(0,parseInt(m[1],10)-1);}
  else if(h==='progetti')p='work';
  var changed=p!==page;page=p;
  $$('main .page').forEach(function(s){s.hidden=s.getAttribute('data-r')!==p;});
  $$('.nav a').forEach(function(a){if(a.getAttribute('data-r')===p)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(changed)window.scrollTo(0,0);
  if(p==='work')show();
  updateStudio();
  if(p==='home')homeStart();else homeStop();
}
window.addEventListener('hashchange',route);

/* ---------- area sviluppatore (solo admin.html) ---------- */
function idb(){return new Promise(function(res,rej){var r=indexedDB.open('confronto',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv');};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function dget(){return idb().then(function(d){return new Promise(function(res){var q=d.transaction('kv').objectStore('kv').get('draft');q.onsuccess=function(){res(q.result||null);};q.onerror=function(){res(null);};});}).catch(function(){return null;});}
function dput(v){return idb().then(function(d){var t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,'draft');}).catch(function(){});}
var st;
function markDirty(){dirty=true;updateStudio();clearTimeout(st);st=setTimeout(function(){dput({items:items,profile:profile,base:BASE});},500);}
function say(t){$$('.stat').forEach(function(s){s.textContent=t||'';});}
function prep(file,max,q){
  return createImageBitmap(file).then(function(b){
    var s=Math.min(1,max/Math.max(b.width,b.height)),c=document.createElement('canvas');
    c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);
    c.getContext('2d').drawImage(b,0,0,c.width,c.height);
    return {url:c.toDataURL('image/jpeg',q),ar:c.height/c.width};
  });
}
function updateStudio(){
  if(!studio)return;
  var proj=ed()&&page==='work',prof=ed()&&page==='about';
  $('#stProj').hidden=!proj;$('#stProf').hidden=!prof;
  var it=vis()[cur];
  $('#upA').textContent=(it&&it.before?'Sostituisci':'Carica')+' stato di fatto';
  $('#upB').textContent=(it&&it.after?'Sostituisci':'Carica')+' stato di progetto';
  $('#upA').disabled=$('#upB').disabled=$('#del').disabled=$('#ttl').disabled=$('#abs').disabled=!it;
  if(it){
    if(document.activeElement!==$('#ttl'))$('#ttl').value=it.title||'';
    if(document.activeElement!==$('#abs'))$('#abs').value=it.abstract||'';
  }
  $('#lnk').textContent=it?'Link di questo progetto: '+location.href.split('#')[0].replace(/admin\.html.*$/,'')+'#progetti/'+(cur+1):'';
  if(document.activeElement!==$('#pn'))$('#pn').value=profile.name||'';
  if(document.activeElement!==$('#pt'))$('#pt').value=profile.text||'';
  $$('.pub').forEach(function(b){b.disabled=!dirty||busy;});
  if(dirty&&!busy&&!$('.stat').textContent)say('Modifiche non ancora scaricate');
}
function buildStudio(){
  studio=true;
  var sp=document.createElement('section');sp.className='studio';sp.id='stProj';sp.hidden=true;
  sp.innerHTML='<p class="hint">Area sviluppatore. Per cambiare l’ordine dei progetti trascina i numeri (da tastiera: Maiusc con le frecce). Le modifiche restano su questo dispositivo finché non scarichi l’aggiornamento e lo carichi su GitHub.</p>'+
    '<input class="field" id="ttl" maxlength="60" placeholder="Titolo del progetto" aria-label="Titolo del progetto">'+
    '<textarea class="field" id="abs" rows="2" maxlength="200" placeholder="Breve descrizione (compare sotto le immagini)" aria-label="Descrizione"></textarea>'+
    '<p class="hint" id="lnk"></p>'+
    '<div class="row"><button class="btn" id="upA" type="button"></button><button class="btn" id="upB" type="button"></button></div>'+
    '<div class="row"><button class="btn" id="add" type="button">Nuovo progetto</button><button class="btn" id="del" type="button">Elimina questo progetto</button></div>'+PUB+
    '<input type="file" id="file" accept="image/*" hidden>';
  $('#pWork').appendChild(sp);
  var pp=document.createElement('section');pp.className='studio';pp.id='stProf';pp.hidden=true;
  pp.innerHTML='<p class="hint">Area sviluppatore: pagina «Chi sono». Le modifiche restano su questo dispositivo finché non scarichi l’aggiornamento.</p>'+
    '<input class="field" id="pn" maxlength="60" placeholder="Nome" aria-label="Nome">'+
    '<textarea class="field" id="pt" rows="4" maxlength="300" placeholder="Descrizione (una riga per ogni a capo)" aria-label="Descrizione"></textarea>'+
    '<div class="row"><button class="btn" id="pPh" type="button">Sostituisci la foto</button></div>'+PUB+
    '<input type="file" id="fileP" accept="image/*" hidden>';
  $('#pAbout').appendChild(pp);
  var target=null,file=$('#file');
  $('#upA').onclick=function(){target='before';file.click();};
  $('#upB').onclick=function(){target='after';file.click();};
  file.onchange=function(){
    var f=file.files[0];file.value='';if(!f||!target)return;
    var it=vis()[cur],t=target;say('Preparo l’immagine…');
    prep(f,1600,.82).then(function(r){it[t]=r.url;if(t==='before'||!it.before)it.ar=r.ar;say('');markDirty();show();}).catch(function(){say('Impossibile leggere questo file.');});
  };
  $('#ttl').oninput=function(){var it=vis()[cur];if(it){it.title=this.value;capT.textContent=it.title;cap.hidden=!(it.title||it.abstract);measure();markDirty();}};
  $('#abs').oninput=function(){var it=vis()[cur];if(it){it.abstract=this.value;capA.textContent=it.abstract;cap.hidden=!(it.title||it.abstract);measure();markDirty();}};
  $('#add').onclick=function(){items.push({id:Date.now().toString(36),title:'',before:'',after:'',abstract:''});cur=items.length-1;say('');markDirty();show();};
  var armed=false,dt;
  function disarm(){clearTimeout(dt);armed=false;$('#del').textContent='Elimina questo progetto';}
  $('#del').onclick=function(){
    if(!armed){armed=true;this.textContent='Conferma eliminazione';dt=setTimeout(disarm,3000);return;}
    disarm();var it=vis()[cur];if(!it)return;
    items.splice(items.indexOf(it),1);cur=Math.max(0,cur-1);say('');markDirty();show();
  };
  $('#pn').oninput=function(){profile.name=this.value;renderAbout();markDirty();};
  $('#pt').oninput=function(){profile.text=this.value;renderAbout();markDirty();};
  var fileP=$('#fileP');
  $('#pPh').onclick=function(){fileP.click();};
  fileP.onchange=function(){
    var f=fileP.files[0];fileP.value='';if(!f)return;say('Preparo la foto…');
    prep(f,900,.86).then(function(r){profile.photo=r.url;renderAbout();say('');markDirty();}).catch(function(){say('Impossibile leggere questo file.');});
  };
  $$('.pub').forEach(function(b){b.onclick=publish;});
  updateStudio();
}
function buildBar(){
  var bar=document.createElement('div');bar.className='devbar';
  bar.innerHTML='<span id="barTxt"></span><button class="barbtn" id="barBtn" type="button"></button>';
  app.insertBefore(bar,app.firstChild);
  function apply(){
    $('#barTxt',bar).textContent=preview?'Anteprima visitatore':'Vista sviluppatore';
    $('#barBtn',bar).textContent=preview?'Torna alla modifica':'Anteprima visitatore';
    if(page==='work')show();else{renderNums();updateStudio();}
  }
  $('#barBtn',bar).onclick=function(){preview=!preview;apply();};
  apply();
}
function dataToU8(u){var b=atob(u.split(',')[1]),a=new Uint8Array(b.length),i;for(i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;}
function publish(){
  if(busy)return;
  var files=[],stamp=Date.now().toString(36),n=0;
  function store(v,name){if(/^data:/.test(v||'')){var p='img-'+name+'-'+stamp+'.jpg';files.push({name:p,data:dataToU8(v)});n++;return p;}return v;}
  var out=items.map(function(it){
    return {id:it.id,title:it.title||'',ar:it.ar,abstract:it.abstract||'',before:store(it.before,it.id+'-fatto'),after:store(it.after,it.id+'-progetto')};
  });
  var prof={name:profile.name,text:profile.text,photo:store(profile.photo,'ritratto')};
  var js='window.CONFRONTI='+JSON.stringify({items:out,profile:prof}).replace(/</g,'\\u003c')+';\n';
  files.unshift({name:'data.js',data:new TextEncoder().encode(js)});
  files.forEach(function(f,i){
    setTimeout(function(){
      var url=URL.createObjectURL(new Blob([f.data],{type:/\.js$/.test(f.name)?'text/javascript':'image/jpeg'}));
      var a=document.createElement('a');a.href=url;a.download=f.name;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},4000);
    },i*500);
  });
  dirty=false;
  say('Sto scaricando '+files.length+' file: se il browser lo chiede, consenti i download multipli. Poi caricali tutti insieme nella cartella principale del repository su GitHub.');
  updateStudio();
}

/* ---------- avvio ---------- */
function start(){
  renderAbout();
  if(ADMIN){buildStudio();buildBar();}
  route();
  if(page!=='work')show();
  setPos('home',40);setPos('work',50);
  var pre=function(){setTimeout(function(){items.forEach(function(it){[it.before,it.after,profile.photo].forEach(function(s){if(s&&!/^data:/.test(s)){var im=new Image();im.src=s;}});});},400);};
  if(document.readyState==='complete')pre();else window.addEventListener('load',pre);
}
if(ADMIN){
  dget().then(function(d){
    if(d&&d.items&&d.items.length&&d.base===BASE){items=d.items;if(d.profile)profile=d.profile;dirty=true;}
    start();
    if(dirty)say('Bozza ripristinata, non ancora scaricata');
  });
}else start();
})();
