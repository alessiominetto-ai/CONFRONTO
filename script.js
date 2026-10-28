(function(){
'use strict';
var ADMIN=!!window.ADMIN,DATA=window.CONFRONTI||{};
var items=(DATA.items||[]).map(function(x){return Object.assign({},x);});
var DEF={name:'Alessio Minetto',text:'Ingegnere Edile-Architetto,\nlibero professionista,\nesperto in rappresentazione architettonica.',photo:'immagini/ritratto.jpg',email:'alessio.minetto@gmail.com',phone:'3475552247',piva:'02600730069',extra:''};
var profile=Object.assign({},DEF,DATA.profile||{});
function sig(){return items.map(function(i){return i.id+':'+(i.before||'').length+':'+(i.after||'').length+':'+(i.abstract||'').length+':'+(i.title||'');}).join('|')+'#'+['name','text','photo','email','phone','piva','extra'].map(function(k){return (profile[k]||'').length;}).join(',');}
var BASE=sig();
var LOGO='<svg viewBox="867.5 249.5 185.5 199.5" role="img" aria-label="Alessio Minetto"><path fill="currentColor" d="M 899.609375 420.089844 C 857.878906 420.089844 911.523438 258.539062 938.855469 387.671875 L 940.9375 397.46875 C 929.433594 411.738281 915.550781 420.089844 899.609375 420.089844 M 1010.015625 250.148438 L 979.101562 250.148438 C 979.101562 291.4375 972.632812 331.140625 960.699219 361.78125 L 937.054688 250.148438 L 909.742188 250.148438 C 909.742188 250.148438 827.1875 448.710938 894.09375 448.710938 C 914.265625 448.710938 931.550781 437.4375 945.539062 419.214844 L 951.792969 448.710938 L 979.101562 448.710938 L 965.410156 384.03125 C 977.574219 355.097656 984.847656 319.792969 986.542969 285.285156 L 1021.148438 448.710938 L 1052.0625 448.710938 Z M 1010.015625 250.148438"/></svg>';
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var app=document.getElementById('app');

/* ---------- struttura ---------- */
var NAV=[['#immagini','work','Immagini',63],['#chi-sono','about','Chi sono',525],['#contatti','contacts','Contatti',989]];
function navHTML(cls){return NAV.map(function(n,i){return '<a class="lk'+(cls?' '+cls[i]:'')+'" href="'+n[0]+'" data-r="'+n[1]+'" style="--t:'+n[3]+'">'+n[2]+'</a>';}).join('');}
var SW='<div class="sw" role="group" aria-label="Modalità di visualizzazione"><button class="lbl" data-m="split" type="button" aria-pressed="true">Affiancate</button><button class="track" role="switch" aria-checked="false" aria-label="Sovrappone le immagini" type="button"></button><button class="lbl" data-m="over" type="button" aria-pressed="false">Sovrapposte</button></div>';
app.innerHTML=
'<div class="wrap"><div class="board" id="board" data-page="home">'+
'<a class="slogo" href="#" aria-label="Home">'+LOGO+'</a>'+
'<nav class="vnav" aria-label="Principale">'+navHTML()+'</nav>'+
'<section class="page" id="pHome" data-r="home"><div class="blogo">'+LOGO+'</div><h1 class="big">Foto<em>inserimenti</em></h1><hr class="hline">'+
'<nav class="hl" aria-label="Sezioni">'+navHTML(['l','c','r'])+'</nav></section>'+
'<section class="page split" id="pWork" data-r="work" hidden>'+SW+
'<div class="stage" id="stage"><div class="pane before"><img id="imgA" alt="Stato di fatto" decoding="async" fetchpriority="high"></div>'+
'<div class="pane after"><img id="imgB" alt="Stato di progetto" decoding="async" fetchpriority="high"></div></div>'+
'<div class="cap" id="cap"><b id="capT"></b><span id="capA"></span></div>'+
'<div class="slider"><i class="dot"></i><i class="dot r"></i><span class="ln"><b></b></span><button class="hd" type="button" role="slider" aria-label="Cursore di confronto" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="-1"></button></div>'+
'<p class="none" id="none" hidden>Nessuna immagine disponibile.</p>'+
'<nav class="nums" id="nums" aria-label="Immagini" hidden></nav></section>'+
'<section class="page" id="pAbout" data-r="about" hidden><div class="por"><img id="abImg" alt="" width="640" height="640"></div>'+
'<div class="abt"><h2 id="abName"></h2><p id="abText"></p></div></section>'+
'<section class="page" id="pContacts" data-r="contacts" hidden><div class="blogo">'+LOGO+'</div>'+
'<a class="ct c1" id="ctMail" href="#"></a><a class="ct c2" id="ctTel" href="#"></a><span class="ct c3" id="ctIva"></span><div class="ct c4" id="ctExtra"></div></section>'+
'</div></div><div class="studios" id="studios"></div>';

function $(s,r){return (r||app).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s));}
var board=$('#board'),pWork=$('#pWork'),imgA=$('#imgA'),imgB=$('#imgB'),cap=$('#cap'),capT=$('#capT'),capA=$('#capA'),nums=$('#nums'),none=$('#none');
var lastShown=null,split=true,page='home',cur=0,canEdit=ADMIN,preview=false,dirty=false,busy=false,studio=false,mt=0,pos=50;
function ed(){return canEdit&&!preview;}
function vis(){return ed()?items:items.filter(function(i){return i.before&&i.after;});}

/* ---------- cursore ---------- */
function setPos(p){
  pos=Math.max(0,Math.min(100,p));
  pWork.style.setProperty('--pos',pos+'%');
  $('.hd',pWork).setAttribute('aria-valuenow',String(Math.round(pos)));
}
function bindDrag(el,rect){
  var d=false;
  function mv(e){var r=rect();if(r.width)setPos((e.clientX-r.left)/r.width*100);}
  el.addEventListener('pointerdown',function(e){
    if(split)return;
    d=true;pWork.classList.remove('morph');
    try{el.setPointerCapture(e.pointerId);}catch(_){}
    mv(e);
  });
  el.addEventListener('pointermove',function(e){if(d)mv(e);});
  ['pointerup','pointercancel'].forEach(function(n){el.addEventListener(n,function(){d=false;});});
}

/* zoom con due dita (o Ctrl + rotella), trascinamento dell'immagine ingrandita, doppio tocco per ingrandire o ripristinare */
var stageEl=$('#stage'),Z={s:1,x:0,y:0},ptr={},pinch=null,divDrag=false,lastTap=0,tapX=0,tapY=0,moved=0;
function refRect(cx,cy){
  var a=$('.pane.before',pWork).getBoundingClientRect(),b=$('.pane.after',pWork).getBoundingClientRect();
  return (split&&cx>=b.left&&cx<=b.right&&cy>=b.top&&cy<=b.bottom)?b:a;
}
function clampZ(r){Z.x=Math.min(0,Math.max(r.width*(1-Z.s),Z.x));Z.y=Math.min(0,Math.max(r.height*(1-Z.s),Z.y));}
function applyZ(){
  var t=Z.s>1.001?'translate('+Z.x+'px,'+Z.y+'px) scale('+Z.s+')':'';
  imgA.style.transform=t;imgB.style.transform=t;
  stageEl.classList.toggle('zoomed',Z.s>1.001);
}
function zoomAt(ns,cx,cy){
  var r=refRect(cx,cy);ns=Math.max(1,Math.min(6,ns));
  var fx=cx-r.left,fy=cy-r.top,k=ns/Z.s;
  Z.x=fx-(fx-Z.x)*k;Z.y=fy-(fy-Z.y)*k;Z.s=ns;
  if(Z.s<=1.001){Z.s=1;Z.x=0;Z.y=0;}else clampZ(r);
  applyZ();
}
function resetZ(){Z.s=1;Z.x=0;Z.y=0;applyZ();}
function divTo(e){var r=$('.pane.before',pWork).getBoundingClientRect();if(r.width)setPos((e.clientX-r.left)/r.width*100);}
function midOf(){var ids=Object.keys(ptr),a=ptr[ids[0]],b=ptr[ids[1]];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)||1};}
stageEl.addEventListener('pointerdown',function(e){
  ptr[e.pointerId]={x:e.clientX,y:e.clientY};
  try{stageEl.setPointerCapture(e.pointerId);}catch(_){}
  var n=Object.keys(ptr).length;
  if(n===2){var m=midOf();pinch={d:m.d,s:Z.s,mx:m.x,my:m.y};divDrag=false;}
  else if(n===1){moved=0;if(!split&&Z.s<=1.001){divDrag=true;pWork.classList.remove('morph');divTo(e);}}
});
stageEl.addEventListener('pointermove',function(e){
  var p=ptr[e.pointerId];if(!p)return;
  var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(Object.keys(ptr).length>=2&&pinch){
    var m=midOf();
    Z.x+=m.x-pinch.mx;Z.y+=m.y-pinch.my;pinch.mx=m.x;pinch.my=m.y;
    zoomAt(pinch.s*m.d/pinch.d,m.x,m.y);
    moved+=99;return;
  }
  moved+=Math.abs(dx)+Math.abs(dy);
  if(Z.s>1.001){Z.x+=dx;Z.y+=dy;clampZ(refRect(e.clientX,e.clientY));applyZ();}
  else if(divDrag)divTo(e);
});
function upP(e){
  var had=ptr[e.pointerId];delete ptr[e.pointerId];
  var n=Object.keys(ptr).length;
  if(n<2)pinch=null;
  if(n===0)divDrag=false;
  if(e.type==='pointerup'&&had&&n===0&&moved<8){
    var now=Date.now();
    if(now-lastTap<350&&Math.hypot(e.clientX-tapX,e.clientY-tapY)<30){
      if(Z.s>1.001)resetZ();else zoomAt(2.5,e.clientX,e.clientY);
      lastTap=0;
    }else{lastTap=now;tapX=e.clientX;tapY=e.clientY;}
  }
}
stageEl.addEventListener('pointerup',upP);
stageEl.addEventListener('pointercancel',upP);
stageEl.addEventListener('wheel',function(e){
  if(!(e.ctrlKey||e.metaKey))return;
  e.preventDefault();zoomAt(Z.s*Math.exp(-e.deltaY*0.01),e.clientX,e.clientY);
},{passive:false});
['gesturestart','gesturechange','gestureend'].forEach(function(n){stageEl.addEventListener(n,function(e){e.preventDefault();});});
bindDrag($('.slider',pWork),function(){return $('.slider',pWork).getBoundingClientRect();});
$('.hd',pWork).addEventListener('keydown',function(e){
  var s=e.shiftKey?10:2;
  if(e.key==='ArrowLeft'||e.key==='ArrowDown'){setPos(pos-s);e.preventDefault();}
  else if(e.key==='ArrowRight'||e.key==='ArrowUp'){setPos(pos+s);e.preventDefault();}
  else if(e.key==='Home'){setPos(0);e.preventDefault();}
  else if(e.key==='End'){setPos(100);e.preventDefault();}
});

/* ---------- interruttore ---------- */
function setMode(s){
  if(s===split)return;
  split=s;
  pWork.classList.add('morph');pWork.classList.toggle('split',s);
  $('.track',pWork).setAttribute('aria-checked',String(!s));
  $$('.lbl',pWork).forEach(function(b){b.setAttribute('aria-pressed',String((b.getAttribute('data-m')==='split')===s));});
  $('.hd',pWork).tabIndex=s?-1:0;
  clearTimeout(mt);mt=setTimeout(function(){pWork.classList.remove('morph');},1000);
}
$('.track',pWork).addEventListener('click',function(){setMode(!split);});
$$('.lbl',pWork).forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m')==='split');});});

/* ---------- immagini ---------- */
function setImg(el,src){if(src)el.src=src;else el.removeAttribute('src');}
function show(){
  var v=vis();if(cur>=v.length)cur=Math.max(0,v.length-1);
  var it=v[cur];
  if((it&&it.id)!==lastShown){lastShown=it&&it.id;resetZ();}
  $('#stage').hidden=!it;cap.hidden=!it||!(it.title||it.abstract);nums.hidden=v.length<2;none.hidden=!!it||ed();
  $('.slider',pWork).hidden=!it;$('.sw',pWork).hidden=!it&&!ed();
  if(it){
    var a=it.ar||.75;
    pWork.style.setProperty('--ar',a);pWork.setAttribute('data-o',a<=1?'l':'p');
    setImg(imgA,it.before);setImg(imgB,it.after);
    capT.textContent=it.title||'';capA.textContent=it.abstract||'';
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
function goTo(i){cur=i;show();try{history.replaceState(null,'','#immagini/'+(i+1));}catch(_){}}

/* riordino trascinando i numeri (solo sviluppatore) */
var dragS=null,noClick=false;
function moveItem(from,to){
  if(from===to||to<0||to>=items.length)return;
  var it=items.splice(from,1)[0];items.splice(to,0,it);
  cur=to;markDirty();show();
  try{history.replaceState(null,'','#immagini/'+(cur+1));}catch(_){}
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
  s.mark.style.left=((after?r.r+10:r.l-10)-1)+'px';
  s.mark.style.top=(r.t+4)+'px';s.mark.style.height=Math.max(r.b-r.t-8,8)+'px';
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

/* ---------- chi sono e contatti ---------- */
function renderAbout(){
  $('#abName').textContent=profile.name;$('#abText').textContent=profile.text;
  var im=$('#abImg');if(profile.photo)im.src=profile.photo;else im.removeAttribute('src');im.alt=profile.name;
}
function renderContacts(){
  var m=$('#ctMail'),t=$('#ctTel');
  m.textContent=profile.email;m.href='mailto:'+profile.email;m.hidden=!profile.email;
  t.textContent=profile.phone;t.href='tel:'+(profile.phone||'').replace(/[^\d+]/g,'');t.hidden=!profile.phone;
  $('#ctIva').textContent=profile.piva?'P.IVA '+profile.piva:'';
  var x=$('#ctExtra');x.textContent=profile.extra||'';x.hidden=!profile.extra;
}

/* ---------- pagine ---------- */
var TITLES={home:'Alessio Minetto · Fotoinserimenti',work:'Immagini · Alessio Minetto',about:'Chi sono · Alessio Minetto',contacts:'Contatti · Alessio Minetto'};
function route(){
  var h=decodeURIComponent(location.hash.replace(/^#\/?/,'')),m,p='home';
  if(h==='chi-sono')p='about';
  else if(h==='contatti')p='contacts';
  else if((m=/^(?:(?:immagini|progetti)\/)?(\d+)$/.exec(h))){p='work';cur=Math.max(0,parseInt(m[1],10)-1);}
  else if(h==='immagini'||h==='progetti')p='work';
  var changed=p!==page;page=p;
  board.setAttribute('data-page',p);
  $$('.page',board).forEach(function(s){s.hidden=s.getAttribute('data-r')!==p;});
  $$('.vnav .lk').forEach(function(a){if(a.getAttribute('data-r')===p)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.title=TITLES[p];
  if(changed)window.scrollTo(0,0);
  if(p==='work')show();
  updateStudio();
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
var PUB='<div class="row"><button class="btn primary pub" type="button" disabled>Scarica aggiornamento</button><span class="stat" role="status"></span></div>';
function updateStudio(){
  if(!studio)return;
  var on=ed();
  $('#stProj').hidden=!(on&&page==='work');$('#stProf').hidden=!(on&&page==='about');$('#stCont').hidden=!(on&&page==='contacts');
  var it=vis()[cur];
  $('#upA').textContent=(it&&it.before?'Sostituisci':'Carica')+' stato di fatto';
  $('#upB').textContent=(it&&it.after?'Sostituisci':'Carica')+' stato di progetto';
  $('#upA').disabled=$('#upB').disabled=$('#del').disabled=$('#ttl').disabled=$('#abs').disabled=!it;
  if(it){
    if(document.activeElement!==$('#ttl'))$('#ttl').value=it.title||'';
    if(document.activeElement!==$('#abs'))$('#abs').value=it.abstract||'';
  }
  $('#lnk').textContent=it?'Link di questa immagine: '+location.href.split('#')[0].replace(/admin\.html.*$/,'')+'#immagini/'+(cur+1):'';
  [['pn','name'],['pt','text'],['cm','email'],['cp','phone'],['cv','piva'],['cx','extra']].forEach(function(k){var f=$('#'+k[0]);if(document.activeElement!==f)f.value=profile[k[1]]||'';});
  $$('.pub').forEach(function(b){b.disabled=!dirty||busy;});
  var ge=document.getElementById('goEdit');if(ge)ge.hidden=!(on&&page!=='home');
  if(dirty&&!busy&&!$('.stat').textContent)say('Modifiche non ancora scaricate');
}
function buildStudio(){
  studio=true;
  var host=$('#studios');
  function sec(id,html){var s=document.createElement('section');s.className='studio';s.id=id;s.hidden=true;s.innerHTML=html;host.appendChild(s);return s;}
  sec('stProj','<p class="hint">Area sviluppatore: immagini. Per cambiare l’ordine trascina i numeri (da tastiera: Maiusc con le frecce). Le modifiche restano su questo dispositivo finché non scarichi l’aggiornamento e lo carichi su GitHub.</p>'+
    '<input class="field" id="ttl" maxlength="60" placeholder="Titolo" aria-label="Titolo">'+
    '<textarea class="field" id="abs" rows="2" maxlength="200" placeholder="Breve descrizione (compare sotto le immagini)" aria-label="Descrizione"></textarea>'+
    '<p class="hint" id="lnk"></p>'+
    '<div class="row"><button class="btn" id="upA" type="button"></button><button class="btn" id="upB" type="button"></button></div>'+
    '<div class="row"><button class="btn" id="add" type="button">Nuovo confronto</button><button class="btn" id="del" type="button">Elimina questo confronto</button></div>'+PUB+
    '<input type="file" id="file" accept="image/*" hidden>');
  sec('stProf','<p class="hint">Area sviluppatore: pagina «Chi sono». Le modifiche restano su questo dispositivo finché non scarichi l’aggiornamento.</p>'+
    '<input class="field" id="pn" maxlength="60" placeholder="Nome" aria-label="Nome">'+
    '<textarea class="field" id="pt" rows="4" maxlength="300" placeholder="Descrizione (una riga per ogni a capo)" aria-label="Descrizione della persona"></textarea>'+
    '<div class="row"><button class="btn" id="pPh" type="button">Sostituisci la foto</button></div>'+PUB+
    '<input type="file" id="fileP" accept="image/*" hidden>');
  sec('stCont','<p class="hint">Area sviluppatore: pagina «Contatti». Il campo «Altre informazioni» è facoltativo e compare in piccolo sotto la partita IVA.</p>'+
    '<input class="field" id="cm" maxlength="80" placeholder="Email" aria-label="Email">'+
    '<input class="field" id="cp" maxlength="30" placeholder="Telefono" aria-label="Telefono">'+
    '<input class="field" id="cv" maxlength="30" placeholder="Partita IVA" aria-label="Partita IVA">'+
    '<textarea class="field" id="cx" rows="3" maxlength="300" placeholder="Altre informazioni (indirizzo, C.F., Ordine…)" aria-label="Altre informazioni"></textarea>'+PUB);
  var target=null,file=$('#file');
  $('#upA').onclick=function(){target='before';file.click();};
  $('#upB').onclick=function(){target='after';file.click();};
  file.onchange=function(){
    var f=file.files[0];file.value='';if(!f||!target)return;
    var it=vis()[cur],t=target;say('Preparo l’immagine…');
    prep(f,1600,.82).then(function(r){it[t]=r.url;if(t==='before'||!it.before)it.ar=r.ar;say('');markDirty();show();}).catch(function(){say('Impossibile leggere questo file.');});
  };
  $('#ttl').oninput=function(){var it=vis()[cur];if(it){it.title=this.value;capT.textContent=it.title;cap.hidden=!(it.title||it.abstract);markDirty();}};
  $('#abs').oninput=function(){var it=vis()[cur];if(it){it.abstract=this.value;capA.textContent=it.abstract;cap.hidden=!(it.title||it.abstract);markDirty();}};
  $('#add').onclick=function(){items.push({id:Date.now().toString(36),title:'',before:'',after:'',abstract:''});cur=items.length-1;say('');markDirty();show();};
  var armed=false,dt;
  function disarm(){clearTimeout(dt);armed=false;$('#del').textContent='Elimina questo confronto';}
  $('#del').onclick=function(){
    if(!armed){armed=true;this.textContent='Conferma eliminazione';dt=setTimeout(disarm,3000);return;}
    disarm();var it=vis()[cur];if(!it)return;
    items.splice(items.indexOf(it),1);cur=Math.max(0,cur-1);say('');markDirty();show();
  };
  function bindField(id,key,render){$('#'+id).oninput=function(){profile[key]=this.value;render();markDirty();};}
  bindField('pn','name',renderAbout);bindField('pt','text',renderAbout);
  bindField('cm','email',renderContacts);bindField('cp','phone',renderContacts);bindField('cv','piva',renderContacts);bindField('cx','extra',renderContacts);
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
  bar.innerHTML='<span id="barTxt"></span><button class="barbtn" id="barBtn" type="button"></button><button class="barbtn" id="goEdit" type="button">Vai alla modifica ↓</button>';
  document.body.appendChild(bar);
  function apply(){
    $('#barTxt',bar).textContent=preview?'Anteprima visitatore':'Vista sviluppatore';
    $('#barBtn',bar).textContent=preview?'Torna alla modifica':'Anteprima visitatore';
    if(page==='work')show();else{renderNums();updateStudio();}
  }
  $('#barBtn',bar).onclick=function(){preview=!preview;apply();};
  $('#goEdit',bar).onclick=function(){var s=$$('.studio').filter(function(x){return !x.hidden;})[0];if(s)s.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});};
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
  var prof={name:profile.name,text:profile.text,photo:store(profile.photo,'ritratto'),email:profile.email,phone:profile.phone,piva:profile.piva,extra:profile.extra};
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
  renderAbout();renderContacts();
  if(ADMIN){buildStudio();buildBar();}
  setPos(50);
  route();
  if(page!=='work')show();
  var pre=function(){setTimeout(function(){items.forEach(function(it){[it.before,it.after,profile.photo].forEach(function(s){if(s&&!/^data:/.test(s)){var im=new Image();im.src=s;}});});},400);};
  if(document.readyState==='complete')pre();else window.addEventListener('load',pre);
}
if(ADMIN){
  dget().then(function(d){
    if(d&&d.items&&d.items.length&&d.base===BASE){items=d.items;if(d.profile)profile=Object.assign({},DEF,d.profile);dirty=true;}
    start();
    if(dirty)say('Bozza ripristinata, non ancora scaricata');
  });
}else start();
})();
