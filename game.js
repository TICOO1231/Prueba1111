"use strict";
// TILCAYO: LA ODISEA DEL DISTRITO 2 (El Alto, 4.050 m s.n.m.)  ·  v2
const cv=document.getElementById("c"),ctx=cv.getContext("2d");
const W=960,H=540,GY=450,LW=16750,GOAL=16450,ARENA=15700,G=0.55;
const BLUE="#1A4B84",GOLD="#F4C430",MAG="#E03A65",STEEL="#708090",INK="#1b1424";

// ---------- LORE ----------
const LORE=[
 "Cada año, la Chacana reparte cuatro sellos de luz por el Distrito 2.",
 "Don Chorro, el ladrón de las ferias, los robó y los escondió en cuatro paradas.",
 "Tilcayo, el gato andino, debe recuperarlos y llegar al paradero de la otra ruta."];
const STOPS=[
 {x:1700,name:"Plaza del Minero",say:"Plaza del Minero: aquí se asentaron las familias mineras de Villa Santiago II."},
 {x:5000,name:"Chacana",say:"La Chacana, Ojo del Universo. Llegar en taxi cuesta Bs 10 a 25."},
 {x:8300,name:"Entrada Folklórica",say:"Entrada del Apóstol Santiago. ¡Ojo con los hurtos en las ferias!"},
 {x:11500,name:"Planta La Francesa",say:"La Francesa: las visitas industriales necesitan permiso."}];
const ZONES=[
 {x:0,n:"Villa Santiago II",t:"villa"},
 {x:3350,n:"Feria de la Chacana",t:"chacana"},
 {x:6650,n:"Entrada Folklórica",t:"entrada"},
 {x:9900,n:"Zona Industrial La Francesa",t:"fabrica"},
 {x:13000,n:"Avenida al Paradero",t:"camino"}];
const zoneAt=x=>{let z=0;for(let i=1;i<ZONES.length;i++)if(x>=ZONES[i].x)z=i;return z;};
const TIPS={moto:"¡Moto-chorro! Oye el motor y salta antes de que embista.",slinger:"Alguien lanza piedras: salta por encima.",car:"Inseguridad vial: espera que pase el auto y salta.",thief:"¡Un chorro! Písalo o esquívalo, te roba monedas.",
 dog:"Perro callejero: se prepara y embiste.",boss:"¡Don Chorro! Písalo 3 veces.",saw:"Sierras de fábrica: salta con ritmo.",
 pit:"¡Zanja de obras! Salta antes del borde o cruza por las tablas.",crumble:"Las tablas viejas se rompen: no te quedes quieto.",spring:"Resorte: salta encima para llegar muy alto.",box:"Golpea las cajas desde abajo para sacar monedas y poderes."};

// ---------- AUDIO (WebAudio, todo procedural) ----------
const Snd=(()=>{
  const BASE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const midi=n=>{const m=/^([A-G])([#b]?)(\d)$/.exec(n);return 12*(+m[3]+1)+BASE[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0);};
  const fq=m=>440*Math.pow(2,(m-69)/12);
  const IV={"":[0,4,7],m:[0,3,7],"7":[0,4,7,10]};
  const chord=(name,oct)=>{const m=/^([A-G][#b]?)(m|7)?$/.exec(name),r=midi(m[1]+oct);return IV[m[2]||""].map(i=>r+i);};
  // Huayno: células de 4 corcheas (negra-corchea-corchea). "." = nota sostenida, "_" = silencio
  const T={
   villa:{bpm:118,lead:{type:"sine",vol:.17,vib:.012,air:1},strum:1,bass:"r0f0r0f0",kick:[0,4],caja:[2,6],hat:[1,3,5,7],
    ch:"Am G F E Am G F E",
    mel:["E5 . C5 D5 E5 . G5 E5","D5 . B4 D5 G5 . E5 D5","C5 . A4 C5 F5 . E5 C5","B4 . G#4 B4 E5 . . .","A5 . G5 E5 C5 . E5 G5","G5 . D5 B4 D5 . G5 D5","A5 . G5 F5 E5 . C5 A4","B4 C5 B4 G#4 E5 . . ."]},
   chacana:{bpm:108,lead:{type:"triangle",vol:.2,vib:.015,air:1},strum:1,pad:1,bass:"r000f000",kick:[0],caja:[4],hat:[2,6],
    ch:"Dm C Bb A Dm C Bb A",
    mel:["A4 . D5 F5 A5 . F5 D5","G5 . E5 C5 E5 . G5 E5","F5 . D5 Bb4 D5 . F5 D5","E5 . C#5 A4 C#5 . E5 .","D5 F5 A5 . G5 F5 E5 D5","E5 G5 C5 . G5 E5 C5 .","D5 F5 Bb5 . A5 F5 D5 .","C#5 E5 A5 . G5 E5 C#5 ."]},
   entrada:{bpm:132,lead:{type:"square",vol:.075,lp:2600,vib:.006},strum:1,bass:"r0f0r0f0",kick:[0,4],caja:[2,3,6,7],hat:[1,5],
    ch:"G C D G Em C D G",
    mel:["D5 G5 B5 . A5 G5 B5 G5","E5 G5 G5 . E5 C5 E5 G5","F#5 A5 A5 . F#5 D5 F#5 A5","G5 B5 D5 . B4 G4 B4 D5","E5 G5 B5 . A5 G5 F#5 E5","C5 E5 G5 . E5 C5 E5 G5","A5 F#5 D5 . F#5 A5 A5 F#5","B5 G5 D5 . G5 . . ."]},
   fabrica:{bpm:138,lead:{type:"sawtooth",vol:.06,lp:1800},bass:"rrrrrrrr",bassType:"square",kick:[0,4],caja:[2,6],hat:[1,3,5,7],
    ch:"Em Em C D Em Em G B7",
    mel:["E4 E4 G4 . B4 . G4 E4","E4 E4 G4 . A4 B4 G4 .","C5 C5 E5 . G5 . E5 C5","D5 D5 F#5 . A5 . F#5 D5","B4 . E5 . G5 . E5 B4","B4 E5 G5 . F#5 E5 D5 B4","D5 G5 B5 . A5 G5 D5 .","D#5 F#5 B5 . A5 F#5 D#5 ."]},
   camino:{bpm:124,lead:{type:"triangle",vol:.2,vib:.012,air:1},strum:1,pad:1,bass:"r0f0r0f0",kick:[0,4],caja:[2,6],hat:[1,3,5,7],
    ch:"Dm Bb F C Dm Bb C A",
    mel:["D5 . F5 A5 . G5 F5 D5","D5 . F5 . Bb4 . D5 F5","C5 . F5 A5 . G5 F5 C5","E5 . G5 . C5 . E5 G5","A5 . F5 D5 . F5 A5 .","Bb5 . A5 F5 D5 . F5 .","G5 . E5 C5 E5 . G5 .","A4 C#5 E5 . G5 E5 C#5 ."]},
   boss:{bpm:156,lead:{type:"sawtooth",vol:.07,lp:2200},bass:"rrrrrrrr",bassType:"square",kick:[0,3,4,7],caja:[2,6],hat:[1,3,5,7],
    ch:"Am Am F E Am Am Dm E",
    mel:["A4 . A4 C5 E5 . D5 C5","A4 . A4 C5 E5 . G5 E5","F4 . F4 A4 C5 . A4 C5","E4 . G#4 B4 E5 . D5 B4","A4 . A4 C5 E5 . D5 C5","C5 . E5 A5 . G5 E5 C5","D5 . F5 A5 . F5 D5 .","G#4 B4 E5 . F5 E5 D5 B4"]}
  };
  T.menu=Object.assign({},T.villa,{bpm:92,kick:[0],caja:[],hat:[],pad:1});
  Object.keys(T).forEach(k=>{const t=T[k];t.ch=t.ch.split(" ");t.cm=t.ch.map(c=>chord(c,4));t.mel=t.mel.map(m=>m.split(" "));t.sd=60/t.bpm/2;});
  let ac=null,master,mus,fx,comp,nb,muted=false,cur=null,want=null,trk=null,step=0,nextT=0,tid=null;
  try{muted=localStorage.getItem("tilcayo_mute")==="1";}catch(e){}

  function tone(f,t,d,o){
    const osc=ac.createOscillator(),g=ac.createGain();
    osc.type=o.type||"sine";osc.frequency.setValueAtTime(f,t);
    if(o.slide)osc.frequency.exponentialRampToValueAtTime(o.slide,t+d);
    let out=osc;
    if(o.lp){const fl=ac.createBiquadFilter();fl.type="lowpass";fl.frequency.value=o.lp;osc.connect(fl);out=fl;}
    out.connect(g);g.connect(o.dest||mus);
    const a=o.a||.01,v=o.vol||.2,dd=Math.max(d,a+.03);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dd);
    if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*o.vib,t+dd*.6);l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dd+.05);}
    osc.start(t);osc.stop(t+dd+.05);
  }
  function noise(t,d,v,type,fr,dest){
    const s=ac.createBufferSource();s.buffer=nb;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=fr;
    const g=ac.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    s.connect(f);f.connect(g);g.connect(dest||mus);s.start(t);s.stop(t+d+.02);
  }
  function kick(t,v){
    const o=ac.createOscillator(),g=ac.createGain();
    o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
    o.connect(g);g.connect(mus);o.start(t);o.stop(t+.22);
  }
  function playStep(s,t){
    const bar=Math.floor(s/8)%trk.ch.length,k=s%8,sd=trk.sd,m=trk.mel[bar],cm=trk.cm[bar];
    const tok=m[k];
    if(tok&&tok!=="."&&tok!=="_"){
      let n=1;while(k+n<8&&m[k+n]===".")n++;
      const o=trk.lead;
      tone(fq(midi(tok)),t,n*sd*.97,{type:o.type,vol:o.vol,lp:o.lp,vib:o.vib,a:.03});
      if(o.air)noise(t,.05,.02,"highpass",3500);
    }
    if(trk.strum&&(k%4===0||k%4===2||k%4===3)){ // charango
      const acc=k%4===0;
      [cm[0],cm[1],cm[2],cm[0]+12].forEach((n,i)=>tone(fq(n),t+i*.012,.2,{type:"triangle",vol:acc?.055:.035}));
    }
    if(trk.pad&&k===0)cm.forEach(n=>tone(fq(n-12),t,sd*7.6,{type:"triangle",vol:.03,a:.3}));
    const b=trk.bass[k];
    if(b==="r"||b==="f"){
      const n=(b==="r"?cm[0]:cm[2])-24;
      tone(fq(n),t,sd*.9,{type:trk.bassType||"triangle",vol:trk.bassType?.1:.24,lp:600});
    }
    if(trk.kick.includes(k))kick(t,.5);
    if(trk.caja.includes(k))noise(t,.07,.14,"bandpass",1800);
    if(trk.hat.includes(k))noise(t,.03,.045,"highpass",6500);
  }
  function sched(){
    if(!ac||!trk||ac.state!=="running")return;
    if(nextT<ac.currentTime-.3)nextT=ac.currentTime+.05;
    while(nextT<ac.currentTime+.15){playStep(step,nextT);nextT+=trk.sd;step++;}
  }
  function music(name){
    want=name;if(!ac||cur===name)return;
    cur=name;trk=name?T[name]:null;step=0;nextT=ac.currentTime+.06;
  }
  function unlock(){
    if(!ac){
      const Ctor=(typeof window!=="undefined"&&(window.AudioContext||window.webkitAudioContext))||null;
      if(!Ctor)return;
      try{ac=new Ctor();}catch(e){ac=null;return;}
      master=ac.createGain();master.gain.value=muted?0:.7;
      comp=ac.createDynamicsCompressor();mus=ac.createGain();mus.gain.value=.55;fx=ac.createGain();fx.gain.value=.8;
      mus.connect(comp);fx.connect(comp);comp.connect(master);master.connect(ac.destination);
      nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      tid=setInterval(sched,30);
      document.addEventListener("visibilitychange",()=>{if(!ac)return;if(document.hidden)ac.suspend();else ac.resume();});
      if(want){const w=want;cur=null;music(w);}
    }
    if(ac.state==="suspended")ac.resume();
  }
  function toggle(){
    muted=!muted;if(master)master.gain.value=muted?0:.7;
    try{localStorage.setItem("tilcayo_mute",muted?"1":"0");}catch(e){}
  }
  function sfx(n){
    if(!ac||muted||ac.state!=="running")return;
    const t=ac.currentTime+.005,o=(ty,v,x)=>Object.assign({type:ty,vol:v,dest:fx},x||{});
    const arp=(fs,gap,d,ty,v)=>fs.forEach((f,i)=>tone(f,t+i*gap,d,o(ty,v)));
    switch(n){
     case "jump":tone(280,t,.13,o("square",.07,{slide:620}));break;
     case "djump":tone(420,t,.12,o("square",.07,{slide:900}));break;
     case "coin":tone(988,t,.07,o("square",.07));tone(1319,t+.07,.18,o("square",.07));break;
     case "stomp":tone(200,t,.12,o("triangle",.25,{slide:70}));noise(t,.08,.15,"lowpass",1200,fx);break;
     case "hurt":tone(330,t,.35,o("sawtooth",.12,{slide:90,lp:1500}));break;
     case "power":arp([523,659,784,1047],.07,.12,"square",.07);break;
     case "pop":tone(300,t,.12,o("sine",.2,{slide:700}));break;
     case "seal":arp([659,784,988,1319,1568],.09,.22,"triangle",.16);arp([659,784,988,1319,1568],.09,.12,"square",.04);break;
     case "spring":tone(220,t,.25,o("sine",.22,{slide:880}));break;
     case "bump":tone(120,t,.09,o("square",.1,{slide:80}));break;
     case "steal":arp([500,420,340],.07,.1,"square",.07);break;
     case "boss":tone(150,t,.3,o("sawtooth",.14,{slide:50}));noise(t,.15,.2,"lowpass",900,fx);break;
     case "cp":arp([784,1047],.09,.16,"triangle",.14);break;
     case "win":arp([523,659,784,1047,784,1047,1319,1568],.12,.25,"triangle",.18);break;
     case "lose":arp([392,330,262,196],.2,.3,"triangle",.2);break;
    }
  }
  return{unlock,music,sfx,toggle,muted:()=>muted};
})();

// ---------- NIVEL ----------
// El nivel se arma por segmentos: cada pieza tiene un ancho fijo (con margen) y se reparte en el tramo.
const WID={rat:220,thief:300,dog:320,moto:460,slinger:360,car:420,spring:300,pit:280,widepit:520,moverpit:480,saw:340,box:400,cp:140};
const SEGS=[
 {a:420,b:1440,it:["box:?S?","rat","thief+bird"]},
 {a:1980,b:4720,it:["dog","thief","car+bird","pit","box:?D?","moto","cp","thief+float"]},
 {a:5280,b:8020,it:["moto","thief+float","spring","dog+bird","pit","box:?M?","cp","thief"]},
 {a:8580,b:11220,it:["slinger","car+bird","thief","widepit","box:?H?","cp","saw"]},
 {a:11780,b:15600,it:["saw","moto","moverpit","cp","box:?M?","slinger","widepit","thief+float","box:?H?"]}];
function put(L,it,x){
  const has=m=>it.m.includes(m);
  switch(it.k){
   case "rat":L.rats.push([x+110,x+40,x+180]);break;
   case "thief":L.thieves.push([x+150,x+40,x+260]);if(has("float"))L.floats.push([x+90,GY-115,120]);break;
   case "dog":L.dogs.push([x+160,x+40,x+280]);break;
   case "moto":L.motos.push([x+230,x+40,x+420]);break;
   case "slinger":L.slingers.push(x+180);break;
   case "car":L.cars.push([x+30,x+290,2.2+hs(x)*.9]);break;
   case "spring":L.springs.push(x+50);L.floats.push([x+140,GY-200,150]);break;
   case "pit":L.pits.push([x+90,x+200]);break;
   case "widepit":{const a=x+60;L.pits.push([a,a+400]);[10,160,310].forEach(o=>L.crumbles.push(a+o));break;}
   case "moverpit":{const a=x+60;L.pits.push([a,a+340]);L.movers.push([a+115,GY-45,110,80,1.1]);break;}
   case "saw":L.saws.push([x+170,60,1.5]);break;
   case "box":L.qrows.push([x+140,it.arg]);break;
   case "cp":L.cps.push(x+70);break;
  }
  if(has("bird"))L.birds.push([x+WID[it.k]/2,240]);
}
function buildLevel(){
  const L={cars:[],thieves:[],rats:[],motos:[],slingers:[],dogs:[],birds:[],saws:[],springs:[],floats:[],movers:[],crumbles:[],qrows:[],pits:[],cps:[]};
  SEGS.forEach(sg=>{
    const its=sg.it.map(s=>{const pr=s.split("+"),b=pr[0].split(":");return{k:b[0],arg:b[1],m:pr.slice(1)};});
    const tot=its.reduce((a,i)=>a+WID[i.k],0),gap=Math.max(0,(sg.b-sg.a-tot)/(its.length+1));
    let x=sg.a+gap;
    its.forEach(it=>{put(L,it,Math.round(x));x+=WID[it.k]+gap;});
  });
  return L;
}
const LV=buildLevel();
const PITS=LV.pits,CARS=LV.cars;
const POWC={S:"shield",D:"double",M:"magnet",H:"heart"};
const POWCOL={shield:"#72D6FF",double:"#8CEB9A",magnet:"#D58AFF",heart:"#FF6B8A"};
const POWTXT={shield:"Escudo de aguayo",double:"Doble salto",magnet:"Imán de monedas",heart:"Vida extra"};
const POWMAX={shield:720,double:1500,magnet:840};
const QY=GY-120; // altura de las cajas: se golpean desde el suelo y se puede subir encima con un salto

let st="menu",frame=0,cam=0,money,hearts,sellos,cp,msgs=[],bub=null,flags,jp=false,shake=0,score,curZone=0;
let coins,cars,foes,saws,qb,movers,crum,springs,sellosObj,powers,bullets,parts,boss,cpObjs,amb=[];
const keys={},inp={l:0,r:0,j:0};
const p={x:60,y:GY-42,w:38,h:42,vy:0,face:1,gr:true,coy:0,inv:0,anim:0,on:null,shield:0,dj:0,air:0,mag:0,bounce:false,land:0};

function say(t,pri){ if(pri){msgs.unshift(t);if(bub)bub.t=0;}else if(!msgs.includes(t)&&(!bub||bub.txt!==t))msgs.push(t); }
function tipOnce(k){ if(!flags[k]){flags[k]=1;say(TIPS[k]);} }
function toast(t){say(t,true);}
function burst(x,y,c,n=10){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*5,l:30+Math.random()*20,c,s:3+Math.random()*3});}
function endGame(s){st=s;Snd.sfx(s==="win"?"win":"lose");Snd.music("menu");}

function start(){
  coins=[];
  for(let x=220;x<ARENA-100;x+=100){
    if(STOPS.some(s=>Math.abs(x-s.x)<80))continue;
    if(PITS.some(q=>x>q[0]-50&&x<q[1]+50))continue;
    const inCar=CARS.some(c=>x>c[0]-40&&x<c[1]+80);
    coins.push({x,y:inCar?GY-130:GY-26,got:false});
  }
  PITS.forEach(q=>{const n=4,w=q[1]-q[0];for(let i=0;i<n;i++){const t=(i+.5)/n;coins.push({x:q[0]+w*t,y:GY-70-Math.sin(t*Math.PI)*50,got:false});}});
  LV.floats.forEach(q=>{for(let i=0;i<3;i++)coins.push({x:q[0]+q[2]/2-35+i*35,y:q[1]-26,got:false});});
  LV.crumbles.forEach(x=>coins.push({x:x+45,y:GY-76,got:false}));
  cars=CARS.map((c,i)=>({x:c[0]+(i%3)*40,y:GY-32,w:78,h:32,vx:c[2],min:c[0],max:c[1],col:["#E03A65","#F4C430","#ffffff","#2a9d8f","#ff7b00"][i%5]}));
  foes=[];
  LV.thieves.forEach(t=>foes.push({k:"thief",x:t[0],min:t[1],max:t[2],dir:-1,mode:0,w:30,h:46,y:GY-46,t:0,ft:0,alive:true}));
  LV.dogs.forEach(t=>foes.push({k:"dog",x:t[0],min:t[1],max:t[2],dir:1,mode:0,w:44,h:30,y:GY-30,t:0,cool:0,wind:0,alive:true}));
  LV.birds.forEach(b=>foes.push({k:"bird",x:b[0],by:b[1],y:b[1],min:b[0]-220,max:b[0]+220,dir:1,w:34,h:24,t:0,alive:true}));
  LV.motos.forEach(t=>foes.push({k:"moto",x:t[0],min:t[1],max:t[2],dir:1,mode:0,w:62,h:34,y:GY-34,t:0,cool:0,wind:0,alive:true}));
  LV.rats.forEach(t=>foes.push({k:"rat",x:t[0],min:t[1],max:t[2],dir:1,w:26,h:16,y:GY-16,t:0,alive:true}));
  LV.slingers.forEach(x=>foes.push({k:"slinger",x,min:x,max:x,dir:-1,w:30,h:46,y:GY-46,t:0,cool:60,alive:true}));
  saws=LV.saws.map(s=>({x:s[0],bx:s[0],r:s[1],sp:s[2]}));
  qb=[];LV.qrows.forEach(r=>[...r[1]].forEach((ch,i)=>qb.push({x:r[0]+i*40,y:QY,w:40,h:40,c:ch,used:false,bump:0})));
  movers=LV.movers.map(m=>({x:m[0],bx:m[0],y:m[1],w:m[2],range:m[3],sp:m[4],dx:0}));
  crum=LV.crumbles.map(x=>({x,y:GY-40,w:90,st:0,t:0}));
  springs=LV.springs.map(x=>({x,y:GY-14,w:36,h:14,anim:0,cd:0}));
  sellosObj=STOPS.map(s=>({x:s.x,y:GY-120,got:false}));
  cpObjs=LV.cps.map(x=>({x,on:false}));
  powers=[];bullets=[];parts=[];msgs=[];bub=null;flags={};
  boss={x:16150,y:GY-80,w:56,h:80,hp:3,max:3,dir:-1,vy:0,t:0,hurt:0,alive:true,active:false};
  amb=[];for(let i=0;i<26;i++)amb.push({x:Math.random()*W,y:Math.random()*GY,s:1+Math.random()*1.6,v:.3+Math.random()*.6});
  money=0;hearts=3;sellos=0;cp=60;score=0;curZone=0;
  Object.assign(p,{x:60,y:GY-42,vy:0,inv:90,shield:0,dj:0,air:0,mag:0,on:null,face:1,land:0});
  cam=0;frame=0;st="play";
  Snd.music(ZONES[0].t);
  say("¡Miau! Soy Tilcayo. Junta los 4 sellos de luz.");
}

// ---------- ENTRADA ----------
function press(){ Snd.unlock(); if(st==="play")jp=true; else start(); }
addEventListener("keydown",e=>{
  Snd.unlock();
  keys[e.code]=true;
  if(e.code==="KeyM"&&!e.repeat){Snd.toggle();return;}
  if(["Space","ArrowUp","KeyW"].includes(e.code)&&!e.repeat){e.preventDefault();press();}
  if(e.code==="Enter"&&!e.repeat&&st!=="play")start();
});
addEventListener("keyup",e=>keys[e.code]=false);
function bind(id,key){
  const el=document.getElementById(id);
  const on=e=>{e.preventDefault();inp[key]=1;el.classList.add("on");if(key==="j")press();else Snd.unlock();};
  const off=e=>{e.preventDefault();inp[key]=0;el.classList.remove("on");};
  el.addEventListener("pointerdown",on);
  ["pointerup","pointercancel","pointerleave"].forEach(v=>el.addEventListener(v,off));
}
bind("bl","l");bind("br","r");bind("bj","j");
cv.addEventListener("pointerdown",e=>{
  e.preventDefault();Snd.unlock();
  const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*W/r.width,my=(e.clientY-r.top)*H/r.height;
  if(mx>W-60&&my<60){Snd.toggle();return;}
  if(st!=="play")start();
});
document.addEventListener("contextmenu",e=>e.preventDefault());
addEventListener("blur",()=>{inp.l=inp.r=inp.j=0;});

// ---------- LÓGICA ----------
const hurtbox=()=>({x:p.x+7,y:p.y+6,w:p.w-14,h:p.h-6});
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const inPitX=x=>PITS.some(q=>x>q[0]+6&&x<q[1]-6);

function damage(){
  if(p.inv>0||p.shield>0)return;
  hearts--;shake=12;burst(p.x+19,p.y+20,"#FF6B6B",14);Snd.sfx("hurt");
  if(hearts<=0){endGame("lost");return;}
  p.x=Math.max(0,cp);p.y=GY-p.h;p.vy=0;p.inv=120;bullets=[];
  toast("¡Auch! Vuelves a la última parada");
}
function fall(){ // caída a una zanja: vuelves justo antes del borde
  const cx=p.x+p.w/2,q=PITS.find(q=>cx>q[0]-60&&cx<q[1]+60);
  hearts--;shake=12;Snd.sfx("hurt");
  if(hearts<=0){endGame("lost");return;}
  p.x=Math.max(cp,q?q[0]-150:cp);p.y=GY-p.h;p.vy=0;p.inv=120;p.on=null;bullets=[];
  toast("¡Cuidado con las zanjas!");
}
function givePower(t){
  if(t==="shield")p.shield=720;if(t==="double"){p.dj=1500;p.air=1;}
  if(t==="magnet")p.mag=840;if(t==="heart")hearts=Math.min(5,hearts+1);
  score+=50;burst(p.x+19,p.y,POWCOL[t],16);toast(POWTXT[t]);Snd.sfx("power");
}
function bumpQ(q){
  q.bump=10;if(q.used)return;q.used=true;Snd.sfx("bump");
  if(q.c==="?"){money++;score+=10;burst(q.x+20,q.y-6,GOLD,8);Snd.sfx("coin");}
  else{powers.push({t:POWC[q.c],x:q.x+20,y:q.y-8,vx:p.face*1.3,vy:-7,got:false,rest:false});Snd.sfx("pop");}
}
function solids(){ // plataformas de aterrizaje
  const a=[];
  LV.floats.forEach(q=>a.push({x:q[0],y:q[1],w:q[2]}));
  movers.forEach(m=>a.push({x:m.x,y:m.y,w:m.w,m}));
  crum.forEach(c=>{if(c.st!==2)a.push({x:c.x,y:c.y,w:c.w,c});});
  qb.forEach(q=>a.push({x:q.x,y:q.y,w:q.w}));
  return a;
}

function update(){
  if(st!=="play"){jp=false;return;}
  frame++;
  // mensajes no bloqueantes
  if(bub){bub.t--;if(bub.t<=0)bub=null;}
  if(!bub&&msgs.length){const t=msgs.shift();bub={txt:t,t:Math.max(150,t.length*5),max:Math.max(150,t.length*5)};}
  // zona y música
  const zi=zoneAt(p.x);
  if(zi!==curZone){curZone=zi;if(zi>0)toast("Zona: "+ZONES[zi].n);}
  Snd.music(boss.alive&&boss.active?"boss":ZONES[zi].t);
  movers.forEach(m=>{const o=m.x;m.x=m.bx+Math.sin(frame*.033*m.sp)*m.range;m.dx=m.x-o;});
  crum.forEach(c=>{
    if(c.st===1&&--c.t<=0){c.st=2;c.t=220;burst(c.x+45,c.y,"#C9A36B",10);}
    else if(c.st===2&&--c.t<=0)c.st=0;
  });
  qb.forEach(q=>{if(q.bump>0)q.bump--;});
  springs.forEach(s=>{if(s.anim>0)s.anim--;if(s.cd>0)s.cd--;});
  amb.forEach(a=>{a.x-=a.v+(inp.r||keys.ArrowRight||keys.KeyD?.4:0);a.y+=Math.sin((frame+a.s*50)*.02)*.2;if(a.x<-4){a.x=W+4;a.y=Math.random()*GY;}});

  if(p.on&&p.on.m)p.x+=p.on.m.dx;
  const dir=((inp.r||keys.ArrowRight||keys.KeyD)?1:0)-((inp.l||keys.ArrowLeft||keys.KeyA)?1:0);
  if(dir){p.face=dir;p.anim++;p.x+=dir*3.3;}
  p.x=Math.max(0,Math.min(LW-p.w,p.x));
  if(p.gr)p.coy=7;else if(p.coy>0)p.coy--;
  if(jp){
    if(p.coy>0){p.vy=-12.4;p.gr=false;p.coy=0;p.air=p.dj>0?1:0;burst(p.x+19,p.y+42,"#ffffff",4);Snd.sfx("jump");}
    else if(p.dj>0&&p.air>0){p.vy=-11.2;p.air--;burst(p.x+19,p.y+42,"#A7E8FF",8);Snd.sfx("djump");}
  }
  jp=false;
  const held=inp.j||keys.Space||keys.ArrowUp||keys.KeyW;
  if(!held&&!p.bounce&&p.vy<-4.5)p.vy=-4.5;
  const prev=p.y+p.h,prevTop=p.y,wasGr=p.gr;
  p.vy=Math.min(p.vy+G,13);p.y+=p.vy;p.gr=false;p.on=null;
  const cx0=p.x+p.w/2;
  if(p.y+p.h>=GY&&prev<=GY+2&&!inPitX(cx0)){p.y=GY-p.h;p.vy=0;p.gr=true;}
  for(const s of solids()){
    if(p.x+p.w<=s.x||p.x>=s.x+s.w)continue;
    if(p.vy>=0&&prev<=s.y+1&&p.y+p.h>=s.y){
      p.y=s.y-p.h;p.vy=0;p.gr=true;p.on=s;
      if(s.c&&s.c.st===0){s.c.st=1;s.c.t=45;}
    }
  }
  if(p.gr&&!wasGr)p.land=8;else if(p.land>0)p.land--;
  qb.forEach(q=>{ // golpe desde abajo
    if(p.vy<0&&p.x+p.w>q.x+4&&p.x<q.x+q.w-4&&prevTop>=q.y+q.h-2&&p.y<=q.y+q.h){p.y=q.y+q.h;p.vy=0;bumpQ(q);}
  });
  if(p.gr)p.bounce=false;
  // dentro de la zanja no se puede salir caminando por las paredes
  if(!p.gr&&p.y+p.h>GY+3){
    const q=PITS.find(q=>cx0>q[0]-40&&cx0<q[1]+40);
    if(q){const lo=q[0]+10-p.w/2,hi=q[1]-10-p.w/2;p.x=Math.max(lo,Math.min(hi,p.x));}
  }
  if(p.y>H+30){fall();return;}
  ["inv","shield","dj","mag"].forEach(k=>{if(p[k]>0)p[k]--;});
  const hb=hurtbox();

  if(PITS.some(q=>q[0]-p.x>0&&q[0]-p.x<320))tipOnce("pit");
  if(crum.some(c=>Math.abs(c.x-p.x)<260))tipOnce("crumble");
  if(springs.some(s=>Math.abs(s.x-p.x)<260))tipOnce("spring");
  if(qb.some(q=>Math.abs(q.x-p.x)<300))tipOnce("box");

  springs.forEach(s=>{
    if(s.cd===0&&p.vy>=0&&hit(hb,s)){p.vy=-17.5;p.bounce=true;p.gr=false;s.anim=12;s.cd=15;burst(s.x+18,s.y,"#fff",6);Snd.sfx("spring");}
  });

  cars.forEach(c=>{
    c.x+=c.vx;if(c.x<c.min||c.x>c.max){c.vx*=-1;c.x+=c.vx;}
    if(hit(hb,c))damage();
    if(Math.abs(c.x-p.x)<350)tipOnce("car");
  });
  saws.forEach(s=>{
    s.x=s.bx+Math.sin(frame*.035*s.sp)*s.r;
    if(Math.hypot(p.x+19-s.x,p.y+p.h-(GY-14))<30&&p.y+p.h>GY-34)damage();
    if(Math.abs(s.x-p.x)<350)tipOnce("saw");
  });

  foes.forEach(e=>{
    if(!e.alive)return;
    e.t++;
    const near=Math.abs(p.x-e.x)<300&&Math.abs(p.y-e.y)<140;
    if(e.k==="thief"){
      if(e.mode===0){if(near)e.dir=p.x>e.x?1:-1;e.x+=e.dir*(near?1.9:1);if(e.x<e.min){e.x=e.min;e.dir=1;}if(e.x>e.max){e.x=e.max;e.dir=-1;}if(near)tipOnce("thief");}
      else{e.x+=e.dir*4.4;if(++e.ft>50||Math.abs(e.x-p.x)>800){e.alive=false;burst(e.x+15,e.y+20,"#cfd3dc",10);}}
    }
    if(e.k==="dog"||e.k==="moto"){
      if(e.mode===0){e.x+=(e.k==="moto"?1:.8)*e.dir;if(e.cool>0)e.cool--;else if(near&&Math.abs(p.x-e.x)<(e.k==="moto"?340:260)&&Math.sign(p.x-e.x)===e.dir){e.mode=1;e.wind=35;tipOnce(e.k);}}
      else if(e.mode===1){if(--e.wind<=0)e.mode=2;}
      else e.x+=(e.k==="moto"?5.4:3.4)*e.dir;
      if(e.x<e.min){e.x=e.min;e.dir=1;if(e.mode===2){e.mode=0;e.cool=90;}}
      if(e.x>e.max){e.x=e.max;e.dir=-1;if(e.mode===2){e.mode=0;e.cool=90;}}
    }
    if(e.k==="bird"){e.x+=1.4*e.dir;e.y=e.by+Math.sin(e.t*.05)*40;if(e.x<e.min)e.dir=1;if(e.x>e.max)e.dir=-1;}
    if(e.k==="rat"){e.x+=2.2*e.dir;if(e.x<e.min)e.dir=1;if(e.x>e.max)e.dir=-1;}
    if(e.k==="slinger"){
      const d=p.x>e.x?1:-1;e.dir=d;
      if(Math.abs(p.x-e.x)<420&&--e.cool<=0){e.cool=120;bullets.push({x:e.x+(d>0?28:-12),y:GY-32,w:14,h:14,vx:3.8*d,l:240,rock:true});tipOnce("slinger");}
    }
    if(e.mode===1&&e.k==="thief")return;
    const box={x:e.x,y:e.y,w:e.w,h:e.h};
    if(!hit(hb,box))return;
    const stomp=p.vy>0&&prev<=e.y+16;
    if(stomp){
      e.alive=false;p.vy=held?-10.5:-7;p.bounce=true;score+=30;burst(e.x+e.w/2,e.y+10,"#FFB3BA",12);Snd.sfx("stomp");
      if(e.k==="thief"){money+=5;toast("¡Atrapaste al chorro! +5 Bs");}
    }else if(e.k==="thief"&&p.inv===0&&p.shield===0){
      const lost=Math.ceil(money/2);money-=lost;e.mode=1;e.ft=0;e.dir=p.x>e.x?-1:1;p.inv=90;shake=10;Snd.sfx("steal");
      toast(lost?"¡Te robaron "+lost+" Bs!":"¡Casi te roban!");
    }else if(e.k!=="thief")damage();
  });

  bullets.forEach(b=>{
    b.x+=b.vx;b.l--;
    if(hit(hb,b)){
      if(p.vy>0&&prev<=b.y+6){b.l=0;p.vy=-8;p.bounce=true;burst(b.x,b.y,"#C8963A",8);Snd.sfx("stomp");}
      else{b.l=0;damage();}
    }
  });
  bullets=bullets.filter(b=>b.l>0);

  coins.forEach(c=>{
    if(c.got)return;
    const dx=p.x+19-c.x,dy=p.y+21-c.y,d=Math.hypot(dx,dy);
    if(p.mag>0&&d<200){c.x+=dx*.09;c.y+=dy*.09;}
    if(d<30){c.got=true;money++;score+=10;burst(c.x,c.y,GOLD,6);Snd.sfx("coin");}
  });
  powers.forEach(w=>{
    if(w.got)return;
    if(!w.rest){w.vy+=.35;w.x+=w.vx;w.y+=w.vy;if(w.y>=GY-18){w.y=GY-18;w.vy=0;w.vx=0;w.rest=true;}}
    if(Math.hypot(p.x+19-w.x,p.y+21-w.y)<32){w.got=true;givePower(w.t);}
  });
  sellosObj.forEach((s,i)=>{
    if(!s.got&&Math.hypot(p.x+19-s.x,p.y+21-s.y)<38){
      s.got=true;sellos++;cp=Math.max(cp,STOPS[i].x-120);score+=100;burst(s.x,s.y,GOLD,26);Snd.sfx("seal");
      toast("¡Sello "+sellos+"/4! "+STOPS[i].say);
    }
  });
  cpObjs.forEach(c=>{
    if(!c.on&&p.x>c.x){c.on=true;cp=Math.max(cp,c.x-30);toast("¡Parada! Punto de control guardado");Snd.sfx("cp");burst(c.x,GY-100,"#7dff9b",12);}
  });

  // JEFE: Don Chorro
  if(boss.alive){
    boss.active=p.x>ARENA;
    if(boss.active){
      tipOnce("boss");boss.t++;if(boss.hurt>0)boss.hurt--;
      const ph=boss.max-boss.hp;
      boss.x+=(1.1+ph*.35)*boss.dir;
      if(boss.x<ARENA+150){boss.x=ARENA+150;boss.dir=1;}if(boss.x>ARENA+550){boss.x=ARENA+550;boss.dir=-1;}
      boss.vy+=.5;boss.y+=boss.vy;
      if(boss.y>=GY-boss.h){boss.y=GY-boss.h;boss.vy=0;if(ph>0&&boss.t%150===0)boss.vy=-10;}
      if(boss.t%Math.max(80,170-ph*35)===0){
        const d=p.x<boss.x?-1:1;
        bullets.push({x:boss.x+(d<0?-18:boss.w),y:GY-26,w:22,h:22,vx:3.2*d,l:300});
      }
      const bb={x:boss.x,y:boss.y,w:boss.w,h:boss.h};
      if(hit(hb,bb)){
        if(boss.hurt===0&&p.vy>0&&prev<=boss.y+30){
          boss.hp--;boss.hurt=70;p.vy=-10.5;p.bounce=true;burst(boss.x+28,boss.y+30,"#FF9D76",20);Snd.sfx("boss");
          toast(boss.hp>0?"¡Golpe! Le quedan "+boss.hp:"");
        }else if(boss.hurt===0)damage();
      }
      if(boss.hp<=0){boss.alive=false;score+=500;burst(boss.x+28,boss.y+30,GOLD,40);Snd.sfx("seal");toast("¡Don Chorro huyó! Corre al paradero");}
    }
  }

  if(p.x+p.w>=GOAL){
    if(boss.alive)say("Primero derrota a Don Chorro.");
    else if(sellos<4)say("Te faltan sellos de luz.");
    else{endGame("win");return;}
    p.x=GOAL-p.w-6;
  }
  parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.12;q.l--;});parts=parts.filter(q=>q.l>0);
  if(shake>0)shake--;
  cam+=((p.x-W*.4+p.face*40)-cam)*.12;cam=Math.max(0,Math.min(LW-W,cam));
}

// ---------- DIBUJO: utilidades ----------
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function RO(x,y,w,h,c,o){R(x-1,y-1,w+2,h+2,o||INK);R(x,y,w,h,c);}
function circ(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill();}
function heart(x,y,s,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y+s*.35);ctx.bezierCurveTo(x-s*.1,y-s*.1,x-s*.7,y-s*.1,x-s*.7,y+s*.3);ctx.bezierCurveTo(x-s*.7,y+s*.7,x-s*.1,y+s*.85,x,y+s);ctx.bezierCurveTo(x+s*.1,y+s*.85,x+s*.7,y+s*.7,x+s*.7,y+s*.3);ctx.bezierCurveTo(x+s*.7,y-s*.1,x+s*.1,y-s*.1,x,y+s*.35);ctx.fill();}
function chak(cx,cy,u,c){R(cx-3*u,cy-u/2,6*u,u,c);R(cx-u/2,cy-3*u,u,6*u,c);R(cx-2*u,cy-1.5*u,4*u,3*u,c);R(cx-1.5*u,cy-2*u,3*u,4*u,c);}
function par(f,per,fn){const off=cam*f,a=Math.floor(off/per)-1;for(let i=a;i<a+Math.ceil(W/per)+3;i++)fn(i*per-off,i);}
function hs(n){const s=Math.sin(n*127.1+311.7)*43758.5;return s-Math.floor(s);}
function hx(c){return [1,3,5].map(i=>parseInt(c.substr(i,2),16));}
function mix(a,b,t){const A=hx(a),B=hx(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("");}

// ---------- DIBUJO: fondo ----------
let NT=0,HAZE="#dff3ff";
const SKY=[[0,"#2f7fd0","#dff3ff"],[.3,"#3a86d8","#eef7ff"],[.6,"#5f78bc","#ffd9a8"],[.82,"#4a3a86","#ff9a6a"],[1,"#241a55","#c86a8a"]];
function skyAt(pr){
  for(let i=1;i<SKY.length;i++)if(pr<=SKY[i][0]){const a=SKY[i-1],b=SKY[i],t=(pr-a[0])/(b[0]-a[0]);return[mix(a[1],b[1],t),mix(a[2],b[2],t)];}
  const l=SKY[SKY.length-1];return[l[1],l[2]];
}
function mountains(f,per,hmin,hrng,col,snow){
  par(f,per,(x,i)=>{
    const h=hmin+hs(i+11)*hrng,w=per*.95,pk=x+w*(.35+hs(i+5)*.3);
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,GY);
    ctx.lineTo(x+w*.12,GY-h*.42);ctx.lineTo(pk-w*.09,GY-h*.78);ctx.lineTo(pk,GY-h);ctx.lineTo(pk+w*.1,GY-h*.8);
    ctx.lineTo(x+w*.7,GY-h*.48);ctx.lineTo(x+w*.84,GY-h*.52);ctx.lineTo(x+w,GY);ctx.fill();
    ctx.fillStyle="rgba(25,30,80,.2)";ctx.beginPath();ctx.moveTo(pk,GY-h);ctx.lineTo(pk+w*.1,GY-h*.8);ctx.lineTo(x+w*.7,GY-h*.48);ctx.lineTo(x+w*.84,GY-h*.52);ctx.lineTo(x+w,GY);ctx.lineTo(pk+w*.03,GY);ctx.lineTo(pk+w*.05,GY-h*.5);ctx.fill();
    if(snow){
      ctx.fillStyle="rgba(255,255,255,.92)";ctx.beginPath();ctx.moveTo(pk,GY-h);ctx.lineTo(pk+w*.1,GY-h*.8);ctx.lineTo(pk+w*.07,GY-h*.72);ctx.lineTo(pk+w*.035,GY-h*.76);ctx.lineTo(pk+w*.01,GY-h*.66);ctx.lineTo(pk-w*.03,GY-h*.74);ctx.lineTo(pk-w*.06,GY-h*.68);ctx.lineTo(pk-w*.09,GY-h*.78);ctx.fill();
      ctx.fillStyle="rgba(150,170,215,.45)";ctx.beginPath();ctx.moveTo(pk,GY-h);ctx.lineTo(pk+w*.1,GY-h*.8);ctx.lineTo(pk+w*.07,GY-h*.72);ctx.lineTo(pk+w*.035,GY-h*.76);ctx.lineTo(pk+w*.01,GY-h*.66);ctx.fill();
    }
  });
}
function win(x,y,w,h,F,sd){ // ventana sin brillo: vidrio apagado; de noche, un tono cálido tenue en pocas
  const lit=hs(sd)<.35;
  let g=mix("#86aed3","#5f86ae",hs(sd+3));
  g=mix(g,lit?"#cfa968":"#3d5472",NT*(lit?.5:.55));
  R(x-2,y-2,w+4,h+4,F("#3b2f2a"));R(x,y,w,h,F(g));
  R(x+2,y+2,Math.max(3,w*.35),3,F(mix(g,"#ffffff",.25)));R(x+w/2-1,y,2,h,F("#3b2f2a"));
}
function house(x,w,h,sd,ft){
  const F=c=>ft?mix(c,HAZE,ft):c,top=GY-h,ty=hs(sd+1),kind=ty<.45?0:ty<.82?1:2;
  const pal=["#d8c7a8","#a9bfd0","#d3a9b0","#bccb9f","#e3bd82"],wall=pal[Math.floor(hs(sd+9)*5)];
  if(kind===0){
    R(x,top,w,h,F("#b0553f"));
    ctx.fillStyle=F("#9b4632");for(let yy=top+10;yy<GY;yy+=10)ctx.fillRect(Math.round(x),yy,Math.round(w),1);
    for(let yy=top+5;yy<GY-4;yy+=20)for(let xx=x+((yy/20|0)%2?6:0);xx<x+w;xx+=16)ctx.fillRect(Math.round(xx),yy,1,10);
    R(x+w-12,top,12,h,F("#9a4632"));R(x,top,w,7,F("#c9c0b2"));R(x,top+7,w,2,F("#8a8378"));
    [x+6,x+w-14].forEach(cx=>{R(cx,top-22,8,22,F("#a7a39a"));R(cx+3,top-34,2,12,F("#6a4a3a"));});
    if(hs(sd+12)<.6)R(x+14,top-14,w-28,3,F("#8a8378"));
    const cols=Math.max(2,Math.floor((w-16)/40));
    for(let r=0,yy=top+22;yy<GY-52;yy+=48,r++)for(let c=0;c<cols;c++)win(x+10+c*((w-20)/cols)+4,yy,20,24,F,sd*7+r*3+c);
    R(x+w/2-11,GY-36,22,36,F("#4a3326"));R(x+w/2-13,GY-38,26,3,F("#6a5646"));
  }else if(kind===1){
    R(x,top+14,w,h-14,F(wall));R(x+w-10,top+14,10,h-14,F(mix(wall,"#000000",.13)));
    ctx.fillStyle=F("#6f7c8a");ctx.beginPath();ctx.moveTo(x-6,top+14);ctx.lineTo(x+8,top);ctx.lineTo(x+w-8,top);ctx.lineTo(x+w+6,top+14);ctx.fill();
    for(let k=x;k<x+w-8;k+=8)R(k+4,top+2,2,12,F("#8995a3"));
    if(hs(sd+20)<.4){R(x+w*.5-14,top-26,28,26,F("#2c6fb0"));R(x+w*.5-14,top-26,28,5,F("#4b8ed0"));R(x+w*.5-14,top-8,28,3,F("#245a92"));}
    else if(hs(sd+41)<.4){R(x+w*.7,top-28,2,28,F("#444"));ctx.fillStyle=F("#cfd3dc");ctx.beginPath();ctx.ellipse(x+w*.7+1,top-28,9,5,.4,0,7);ctx.fill();}
    const cols=Math.max(2,Math.floor((w-16)/40));
    for(let r=0,yy=top+32;yy<GY-52;yy+=46,r++)for(let c=0;c<cols;c++)win(x+10+c*((w-20)/cols)+4,yy,20,22,F,sd*5+r*3+c);
    R(x+w/2-11,GY-36,22,36,F("#5b4636"));R(x+w/2+4,GY-20,3,3,F(GOLD));
  }else{
    const hh=76+hs(sd+4)*38,y=GY-hh,ac=[MAG,BLUE,"#2a9d8f","#ff7b00"][Math.floor(hs(sd+6)*4)];
    R(x,y,w,hh,F(wall));R(x+w-10,y,10,hh,F(mix(wall,"#000000",.13)));R(x,y,w,5,F("#8a8378"));
    R(x+8,y+9,w-16,16,F("#233a63"));R(x+12,y+13,w-24,3,F(GOLD));R(x+12,y+19,(w-24)*.6,3,F("#fff"));
    for(let k=0;k<w-4;k+=14)R(x+k,y+30,14,14,F((k/14|0)%2?"#f0eadb":ac));
    R(x+10,y+46,w-20,hh-46,F("#26364a"));
    for(let k=0;k<4;k++)R(x+16+k*((w-40)/4),GY-26,12,8,F(["#e3bd82","#c0392b","#8fd3a8","#d9a2d0"][k]));
  }
  if(kind!==2&&hs(sd+31)<.25){R(x+6,top-12,w-12,1,F("#444"));for(let k=0;k<3;k++)R(x+14+k*((w-40)/2),top-11,10,12,F([MAG,GOLD,"#fff"][k]));}
  R(x,GY-3,w,3,F("#6b6560"));
}
function farHouse(x,w,h,sd,ft){
  const F=c=>mix(c,HAZE,ft),top=GY-h,c=["#a78fb0","#b09aa0","#9aa6b8","#b8a89a"][Math.floor(hs(sd)*4)];
  R(x,top,w,h,F(c));R(x,top,w,5,F("#8a7396"));
  if(hs(sd+4)<.4){ctx.fillStyle=F("#7f8aa0");ctx.beginPath();ctx.moveTo(x-3,top);ctx.lineTo(x+w*.3,top-10);ctx.lineTo(x+w+3,top);ctx.fill();}
  for(let yy=top+14;yy<GY-14;yy+=24)for(let xx=x+8;xx<x+w-10;xx+=22)R(xx,yy,9,11,F(mix("#7a93b4","#4a5a78",NT*.6)));
}
function lampPost(x){
  R(x,GY-150,5,150,"#3b3f52");R(x-12,GY-154,32,6,"#3b3f52");R(x-14,GY-150,12,6,"#2a2d3a");
  if(NT>.2){const g=ctx.createRadialGradient(x-8,GY-146,2,x-8,GY-146,46);g.addColorStop(0,"rgba(255,230,160,"+(.22*NT)+")");g.addColorStop(1,"rgba(255,230,160,0)");ctx.fillStyle=g;ctx.fillRect(x-54,GY-196,92,92);}
}
function dress(x,i,per,f){
  const z=zoneAt(i*per/f),h=hs(i+77),F=c=>mix(c,HAZE,.16),cols=[MAG,GOLD,BLUE,"#2a9d8f","#ff7b00"];
  if(z===0){
    if(h<.35){R(x,GY-72,140,72,F("#cdbfa6"));R(x,GY-72,140,6,F("#a89a80"));chak(x+70,GY-38,9,F(MAG));chak(x+70,GY-38,5,F(GOLD));R(x+10,GY-18,120,4,F(BLUE));}
    else if(h<.7){R(x+18,GY-110,5,110,F("#555a66"));R(x+66,GY-110,5,110,F("#555a66"));R(x+10,GY-152,70,44,F("#2c6fb0"));R(x+10,GY-152,70,8,F("#4b8ed0"));R(x+10,GY-114,70,6,F("#245a92"));}
    else{for(let r=0;r<3;r++)for(let c=0;c<3-r;c++)R(x+c*40+r*20,GY-22-r*20,38,20,F(r%2?"#cfc7b6":"#b9b19f"));}
  }else if(z===1){
    R(x+4,GY-120,4,120,F("#5a4636"));R(x+116,GY-120,4,120,F("#5a4636"));
    for(let k=0;k<6;k++)R(x+k*20,GY-132,20,22,F(cols[(k+i)%5]));
    for(let k=0;k<6;k++){ctx.fillStyle=F(cols[(k+i)%5]);ctx.beginPath();ctx.arc(x+k*20+10,GY-110,10,0,Math.PI);ctx.fill();}
    R(x,GY-62,124,10,F("#8a6a48"));R(x+6,GY-52,112,52,F("#7a5a3c"));R(x+6,GY-44,112,10,F(cols[i%5]));
    for(let k=0;k<5;k++)R(x+8+k*22,GY-80,16,18,F(cols[(k*2+i)%5]));
  }else if(z===2){
    R(x,GY-190,5,190,F("#4a3a30"));R(x+300,GY-190,5,190,F("#4a3a30"));
    ctx.strokeStyle=F("#2d3347");ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+5,GY-186);ctx.quadraticCurveTo(x+152,GY-150,x+300,GY-186);ctx.stroke();
    for(let k=0;k<12;k++){const t=(k+.5)/12,fx=x+5+t*295,fy=GY-186+Math.sin(t*Math.PI)*18;ctx.fillStyle=F(cols[k%5]);ctx.beginPath();ctx.moveTo(fx-8,fy);ctx.lineTo(fx+8,fy);ctx.lineTo(fx,fy+16);ctx.fill();}
    circ(x+2,GY-198,10,F(cols[i%5]));circ(x+303,GY-198,10,F(cols[(i+2)%5]));
  }else if(z===3){
    R(x+20,GY-190,26,190,F("#7a6a62"));R(x+20,GY-190,26,10,F("#4a3d38"));R(x+20,GY-150,26,8,F("#b5533c"));R(x+20,GY-110,26,8,F("#b5533c"));
    for(let k=0;k<4;k++){const t=((frame*.4+k*30)%120)/120;circ(x+33+Math.sin(t*6+k)*8+t*30,GY-196-t*90,12+t*16,"rgba(205,205,212,"+(.3*(1-t)).toFixed(2)+")");}
    R(x+80,GY-84,64,84,F("#8a9aa8"));R(x+80,GY-84,64,10,F("#6f7f8f"));R(x+90,GY-60,44,4,F("#6f7f8f"));R(x+90,GY-40,44,4,F("#6f7f8f"));
    R(x+170,GY-52,130,3,F("#444"));for(let k=0;k<=130;k+=18)R(x+170+k,GY-52,3,52,F("#555"));
  }else{
    if(h<.5){R(x+20,GY-120,6,120,F("#555a66"));R(x+124,GY-120,6,120,F("#555a66"));R(x,GY-196,150,76,F(BLUE));R(x+4,GY-192,142,68,F("#1f5fa6"));R(x+8,GY-186,134,8,F(GOLD));R(x+16,GY-168,92,6,F("#fff"));R(x+16,GY-154,62,6,F("#bcd0ea"));chak(x+124,GY-152,5,F(GOLD));}
    else{const bc=["#2a9d8f","#e07b39","#c0392b"][i%3];R(x,GY-72,150,54,F(bc));R(x+6,GY-84,110,14,F(bc));R(x+10,GY-64,130,22,F("#8fd3ff"));for(let k=0;k<5;k++)R(x+30+k*24,GY-64,2,22,F(bc));R(x,GY-34,150,6,F("#f2f2f2"));circ(x+30,GY-16,12,F("#111"));circ(x+120,GY-16,12,F("#111"));circ(x+30,GY-16,5,F("#9aa3ad"));circ(x+120,GY-16,5,F("#9aa3ad"));}
  }
}
function cables(){
  const F=c=>mix(c,HAZE,.25);
  R(0,100,W,2,F("#2d3347"));
  par(.22,520,(x,i)=>{
    R(x,100,6,GY-100,F("#2d3347"));R(x-14,98,34,6,F("#2d3347"));R(x-8,150,22,4,F("#2d3347"));
    const cx=x+((frame*.9+i*170)%520);
    R(cx,102,2,14,"#222");R(cx-14,114,32,22,MAG);R(cx-14,114,32,5,GOLD);R(cx-10,121,10,10,"#bfe8ff");R(cx+4,121,10,10,"#bfe8ff");
  });
}
function bg(){
  const pr=Math.min(1,cam/(LW-W));NT=Math.max(0,Math.min(1,(pr-.55)/.4));
  const sk=skyAt(pr),top=sk[0],bot=sk[1];HAZE=bot;
  const g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(NT>.25){ctx.globalAlpha=Math.min(1,(NT-.25)*1.3);for(let i=0;i<60;i++){const sx=(hs(i)*W-cam*.02+W*3)%W,sy=hs(i+90)*GY*.6,b=i%7===0;R(sx,sy,b?3:2,b?3:2,"#fff");}ctx.globalAlpha=1;}
  const sy=90+pr*190,sx=780,gl=ctx.createRadialGradient(sx,sy,10,sx,sy,120);
  gl.addColorStop(0,"rgba(255,240,190,.32)");gl.addColorStop(1,"rgba(255,240,190,0)");ctx.fillStyle=gl;ctx.fillRect(sx-120,sy-120,240,240);
  circ(sx,sy,42,mix("#fff6b0","#ff7a45",pr));
  const cc=mix("#ffffff","#f6b6a0",pr);
  ctx.globalAlpha=.85;par(.07,520,(x,i)=>{const cx=x+hs(i)*160,cy=52+hs(i+3)*90;[[0,0,24],[26,-8,20],[50,2,22],[-24,6,16]].forEach(c=>circ(cx+c[0],cy+c[1],c[2],cc));});ctx.globalAlpha=1;
  mountains(.04,1100,170,110,mix(mix("#6f8fb8","#5b4f90",pr),HAZE,.35),true);
  mountains(.08,760,90,70,mix(mix("#7f9cc0","#6a5a96",pr),HAZE,.5),false);
  par(.14,150,(x,i)=>farHouse(x,70+hs(i+2)*40,40+hs(i+1)*50,i+100,.72));
  cables();
  par(.18,260,(x,i)=>farHouse(x,110+hs(i+3)*30,60+hs(i+1)*60,i+300,.5));
  par(.32,230,(x,i)=>{const w=130+hs(i+4)*40;house(x+hs(i+8)*30,w,110+hs(i+7)*110,i+7,.14);});
  par(.55,380,(x,i)=>{if(hs(i+60)<.45)return;lampPost(x);});
  par(.55,420,(x,i)=>{if(hs(i+50)<.25)return;dress(x+40,i,420,.55);});
}

// ---------- DIBUJO: suelo, zanjas, decoración ----------
function cone(x){ctx.fillStyle="#ff7b00";ctx.beginPath();ctx.moveTo(x,GY-24);ctx.lineTo(x+9,GY);ctx.lineTo(x-9,GY);ctx.fill();R(x-4,GY-14,8,4,"#fff");R(x-11,GY-2,22,3,"#c85a00");}
function ground(){
  const gg=ctx.createLinearGradient(0,GY,0,H);gg.addColorStop(0,"#5a6372");gg.addColorStop(1,"#323844");ctx.fillStyle=gg;ctx.fillRect(0,GY,W,H-GY);
  par(1,40,(x,i)=>{
    const z=zoneAt(i*40),h=hs(i*1.7);
    if(z===1){for(let r=0;r<4;r++){const o=(r%2)*20;R(x+o+1,GY+15+r*21,36,18,mix("#6d6a63","#8c8779",hs(i+r*7)));R(x+o+1,GY+15+r*21,36,3,"rgba(255,255,255,.12)");}}
    else if(z===3){R(x,GY+14,2,H-GY-14,"rgba(0,0,0,.25)");if(h<.2)R(x+6,GY+30,24,6,"rgba(0,0,0,.18)");}
    else{R(x+h*28,GY+18+hs(i+2)*60,3,2,"#7e8793");R(x+20,GY+6+hs(i+4)*8,2,6,"#7a838f");if(h<.1){R(x+4,GY+22,30,2,"#3c424d");R(x+14,GY+24,2,12,"#3c424d");}}
  });
  R(0,GY,W,10,z0Sidewalk());R(0,GY,W,2,"#d3d9e0");R(0,GY+10,W,4,"#6b7480");
  par(1,80,x=>R(x,GY+44,40,5,GOLD));
  CARS.forEach(c=>{
    const x0=c[0]-cam,w=c[1]-c[0]+80;if(x0>W||x0+w<0)return;
    for(let i=0;i<w;i+=22)R(x0+i,GY+14,12,H-GY-14,"rgba(255,255,255,.55)");
  });
}
function z0Sidewalk(){const z=zoneAt(cam+W*.4);return ["#9aa3ad","#a89f8e","#a99fb0","#8f99a2","#9aa3ad"][z];}
function pitsDraw(){
  PITS.forEach(q=>{
    const x=Math.round(q[0]-cam),w=q[1]-q[0];if(x>W+30||x+w<-30)return;
    const g=ctx.createLinearGradient(0,GY,0,H);g.addColorStop(0,"#241c22");g.addColorStop(1,"#050508");ctx.fillStyle=g;ctx.fillRect(x,GY,w,H-GY);
    R(x-4,GY,4,H-GY,"#3a3f4b");R(x+w,GY,4,H-GY,"#3a3f4b");R(x-6,GY-3,10,3,"#b3b9c2");R(x+w-4,GY-3,10,3,"#b3b9c2");
    for(let k=0;k<w;k+=22)R(x+k,GY+22+hs(k+x)*30,10,3,"#3b2c33");
    R(x+6,H-18,w-12,5,"#1f2f6a");R(x+10,H-17,w-20,1,"#3f5fc0");
    cone(x-20);cone(x+w+20);
    for(let k=0;k<30;k+=10)R(x-60+k,GY-30,10,6,(k/10|0)%2?"#111":GOLD);R(x-58,GY-24,3,24,"#555");R(x-34,GY-24,3,24,"#555");
  });
}
function gdeco(){
  par(1,110,(x,i)=>{
    const ox=hs(i)*60,wx=i*110+ox;
    if(PITS.some(q=>wx>q[0]-70&&wx<q[1]+70)||STOPS.some(s=>Math.abs(wx-s.x)<150)||hs(i+5)<.35)return;
    const z=zoneAt(wx),sx=x+ox;
    if(z===0||z===4){ctx.strokeStyle="#c8b45a";ctx.lineWidth=2;ctx.beginPath();[-5,0,5].forEach((d,k)=>{ctx.moveTo(sx+d,GY+2);ctx.lineTo(sx+d*1.6+k-1,GY-9-k*2);});ctx.stroke();}
    else if(z===1){R(sx,GY-3,6,3,"#ff7b00");R(sx+10,GY-2,5,2,"#fff");R(sx+22,GY-3,5,3,"#2a9d8f");}
    else if(z===2){for(let k=0;k<5;k++)R(sx+k*7,GY-2-(k%2)*3,3,3,[MAG,GOLD,BLUE,"#2a9d8f","#fff"][k]);}
    else{ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(sx,GY+4,14,3,0,0,7);ctx.fill();R(sx+22,GY-5,8,5,"#6f7f8f");}
  });
}
function shadows(){
  ctx.fillStyle="rgba(0,0,0,.28)";
  const sh=(x,w)=>{if(inPitX(x))return;ctx.beginPath();ctx.ellipse(x-cam,GY+3,w,5,0,0,7);ctx.fill();};
  sh(p.x+19,22-Math.min(10,Math.max(0,(GY-p.y-p.h)/12)));
  foes.forEach(e=>{if(e.alive&&e.k!=="bird")sh(e.x+e.w/2,e.w/2+2);});
  cars.forEach(c=>sh(c.x+c.w/2,c.w/2+4));
  if(boss.alive)sh(boss.x+boss.w/2,38);
}
function vignette(){
  const g=ctx.createRadialGradient(W/2,H/2,H*.5,W/2,H/2,H*1);
  g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(10,10,40,.26)");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}

// ---------- DIBUJO: hitos ----------
function landmark(i,x){
  const bx=x-cam;if(bx<-320||bx>W+320)return;
  if(i===0){ // Plaza del Minero
    R(bx-130,GY-12,260,12,"#8d8f98");R(bx-100,GY-24,200,12,"#a2a4ad");R(bx-70,GY-36,140,12,"#b4b6bf");
    [-170,170].forEach(o=>{R(bx+o-4,GY-60,8,60,"#5b4632");circ(bx+o,GY-76,26,"#4c6b3a");circ(bx+o-14,GY-62,18,"#5a7a45");circ(bx+o+14,GY-64,18,"#436034");});
    R(bx-32,GY-84,64,48,"#7b7e88");R(bx-36,GY-90,72,8,"#9a9ca6");R(bx-24,GY-70,48,16,BLUE);ctx.fillStyle="#fff";ctx.font="bold 9px Arial";ctx.textAlign="center";ctx.fillText("EL MINERO",bx,GY-59);ctx.textAlign="left";
    RO(bx-13,GY-148,26,58,"#8a5a2b");R(bx-13,GY-148,8,58,"#9c6a35");R(bx+13,GY-150,6,64,"#6b4a2b");R(bx+4,GY-158,32,8,"#555");R(bx+30,GY-158,6,18,"#555");
    RO(bx-10,GY-168,20,20,"#a8703a");R(bx-13,GY-176,26,10,"#c98a4b");R(bx-4,GY-174,8,5,"#fff3a8");R(bx-16,GY-142,6,26,"#7a4d25");
  }
  if(i===1){ // Chacana
    R(bx-150,GY-14,300,14,"#9a9588");R(bx-120,GY-28,240,14,"#aaa597");R(bx-90,GY-42,180,14,"#bdb8a9");
    const u=24,cx=bx,cy=GY-122;
    chak(cx,cy,u+4,"#8d8878");chak(cx,cy,u,"#c9c3b0");chak(cx,cy,u*.55,"#b2ac98");
    ctx.globalAlpha=.55+Math.sin(frame*.05)*.2;chak(cx,cy,u*.22,GOLD);R(cx-u*2.6,cy-1,u*5.2,2,GOLD);R(cx-1,cy-u*2.6,2,u*5.2,GOLD);ctx.globalAlpha=1;
    circ(cx,cy,5,MAG);
    [-130,-100,100,130].forEach(o=>{R(bx+o,GY-44,16,16,MAG);R(bx+o+4,GY-52,8,10,GOLD);});
  }
  if(i===2){ // Entrada folklórica
    R(bx-210,GY-232,420,6,"#fff");
    for(let k=-210;k<210;k+=40)R(bx+k,GY-226,30,34,[MAG,GOLD,BLUE,"#2a9d8f"][((k+210)/40|0)%4]);
    for(let k=0;k<4;k++){
      const dx=bx-130+k*72,b=Math.abs(Math.sin(frame*.1+k))*12,c1=[MAG,GOLD,"#2a9d8f",BLUE][k],c2=[GOLD,MAG,BLUE,"#fff"][k];
      RO(dx,GY-92-b,26,56,c1);R(dx+3,GY-92-b,20,6,c2);RO(dx+4,GY-112-b,18,18,"#d9a27a");R(dx+1,GY-118-b,24,6,"#222");R(dx+5,GY-128-b,16,10,"#222");
      ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(dx-8,GY-38-b);ctx.lineTo(dx+34,GY-38-b);ctx.lineTo(dx+42,GY-b*0.2-26);ctx.lineTo(dx-16,GY-b*0.2-26);ctx.fill();
      R(dx+4,GY-36-b,6,14,"#222");R(dx+16,GY-36-b,6,14,"#222");
    }
    RO(bx+168,GY-84,64,84,"#c8963a");R(bx+176,GY-70,48,12,GOLD);R(bx+176,GY-52,48,6,MAG);
    for(let k=0;k<10;k++)R(bx-190+((k*53+frame*1.2)%380),GY-210+((k*37+frame*.8)%200),4,4,[MAG,GOLD,"#fff"][k%3]);
  }
  if(i===3){ // Planta La Francesa
    R(bx-200,GY-176,400,176,"#c3ccd6");R(bx-200,GY-176,400,6,"#e0e6ee");R(bx-200,GY-196,400,22,BLUE);
    for(let k=0;k<5;k++){ctx.fillStyle="#9aa6b4";ctx.beginPath();ctx.moveTo(bx-200+k*80,GY-196);ctx.lineTo(bx-200+k*80,GY-228);ctx.lineTo(bx-200+k*80+80,GY-196);ctx.fill();}
    R(bx+130,GY-310,34,114,STEEL);R(bx+122,GY-316,50,10,"#555");R(bx+130,GY-270,34,8,"#b5533c");R(bx+130,GY-240,34,8,"#b5533c");
    for(let k=0;k<4;k++){const t=((frame*.5+k*34)%136)/136;circ(bx+147+Math.sin(t*6+k)*8+t*34,GY-322-t*90,14+t*16,"rgba(205,205,212,"+(.35*(1-t)).toFixed(2)+")");}
    for(let k=0;k<5;k++){R(bx-178+k*68,GY-150,48,40,"#2f3e55");R(bx-174+k*68,GY-146,40,32,mix("#8fd3ff","#4a6a90",NT*.6));R(bx-153+k*68,GY-146,2,32,"#2f3e55");}
    RO(bx-34,GY-90,68,90,"#2f3e55");R(bx-2,GY-90,4,90,"#445572");
    ctx.fillStyle="#fff";ctx.font="bold 16px Arial";ctx.textAlign="center";ctx.fillText("LA FRANCESA",bx-110,GY-178);ctx.textAlign="left";
    R(bx-200,GY-18,400,18,"#3c4656");for(let k=0;k<400;k+=26)R(bx-200+((k+frame*2)%400),GY-14,12,8,GOLD);
    R(bx+210,GY-60,10,60,"#555");R(bx+210,GY-60,60,6,"#555");
  }
}
function goal(){
  const x=GOAL-cam;if(x<-300||x>W+300)return;
  R(x,GY-210,10,210,"#fff");R(x+10,GY-210,150,70,BLUE);R(x+10,GY-210,150,8,GOLD);
  ctx.fillStyle="#fff";ctx.font="bold 15px Arial";ctx.fillText("PARADERO",x+34,GY-182);ctx.fillText("RUTA SIGUIENTE",x+16,GY-160);
  RO(x+60,GY-100,170,66,GOLD);for(let k=0;k<3;k++)R(x+70+k*42,GY-90,34,24,"#8fd3ff");R(x+60,GY-70,170,5,MAG);
  circ(x+92,GY-33,13,"#111");circ(x+198,GY-33,13,"#111");circ(x+92,GY-33,5,"#9aa3ad");circ(x+198,GY-33,5,"#9aa3ad");
  if(boss.alive){ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(x-4,GY-212,260,214);ctx.fillStyle="#fff";ctx.font="26px Arial";ctx.fillText("🔒",x+50,GY-60);}
}
function arenaDraw(){
  const x=ARENA-cam;if(x<-60||x>W+60)return;
  R(x,GY-70,6,70,"#555");for(let k=0;k<60;k+=12)R(x+6,GY-66+k*0,0,0,"#000");
  for(let k=0;k<5;k++)R(x+6+k*12,GY-60+Math.sin(frame*.1+k)*2,12,6,k%2?"#111":GOLD);
}
function checkpointsDraw(){
  cpObjs.forEach(c=>{
    const x=c.x-cam;if(x<-60||x>W+60)return;
    R(x,GY-112,6,112,"#555a66");RO(x-22,GY-122,52,32,c.on?"#2fb36a":BLUE);R(x-22,GY-122,52,5,c.on?"#8cf0b0":GOLD);
    ctx.fillStyle="#fff";ctx.font="bold 10px Arial";ctx.textAlign="center";ctx.fillText("PARADA",x+4,GY-99);ctx.textAlign="left";
    R(x-14,GY-6,34,6,"#8a8378");
  });
}

// ---------- DIBUJO: personajes ----------
function cat(){
  if(p.inv>0&&Math.floor(frame/5)%2===0)return;
  const x=Math.round(p.x-cam),y=Math.round(p.y);
  ctx.save();
  if(p.face===-1){ctx.translate(x+p.w,0);ctx.scale(-1,1);}else ctx.translate(x,0);
  const mv=inp.l||inp.r||keys.ArrowLeft||keys.ArrowRight||keys.KeyA||keys.KeyD,air=!p.gr;
  const ph=p.anim*.5,sw=air?0:(mv?Math.sin(ph)*5:0),bob=(mv&&!air)?Math.abs(Math.sin(ph))*1.6:0;
  const sq=p.land>0?1.5:0;
  if(p.shield>0){ctx.strokeStyle="rgba(114,214,255,.9)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(19,y+22,28,0,7);ctx.stroke();ctx.fillStyle="rgba(114,214,255,.12)";ctx.fill();}
  ctx.translate(0,y-bob+sq);
  const O="#7a3f12",B="#F5A64D",D="#E68A35",wag=Math.sin(frame*.18)*3+(mv?3:0);
  ctx.lineCap="round";ctx.lineJoin="round";
  // cola
  ctx.strokeStyle=O;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(4,30);ctx.quadraticCurveTo(-10,28+wag,-5,9+wag);ctx.stroke();
  ctx.strokeStyle=D;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(4,30);ctx.quadraticCurveTo(-10,28+wag,-5,9+wag);ctx.stroke();
  ctx.strokeStyle=O;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-6,14+wag);ctx.lineTo(-5,9+wag);ctx.stroke();
  const leg=(hx,off,lift,col)=>{ctx.strokeStyle=O;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(hx,31);ctx.lineTo(hx+off,41-lift);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(hx,31);ctx.lineTo(hx+off,41-lift);ctx.stroke();circ(hx+off,41-lift,3,"#FFE0AE");};
  const bo=air?-6:-sw,fo=air?6:sw;
  leg(9,bo,air?2:0,D);leg(26,fo,air?3:0,D);
  // cuerpo
  ctx.fillStyle=B;ctx.strokeStyle=O;ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(17,28,15,9.5,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle="#FFE0AE";ctx.beginPath();ctx.ellipse(18,33,9,3.6,0,0,7);ctx.fill();
  R(8,19,3,6,D);R(14,18,3,7,D);R(20,19,3,6,D);
  // aguayo (bufanda y capa)
  const w1=Math.sin(frame*.3)*2.5-(mv?3:0),w2=Math.sin(frame*.25+1)*2;
  ctx.fillStyle=MAG;ctx.strokeStyle=O;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(21,21);ctx.lineTo(23,30);ctx.lineTo(0+w1,35+w2);ctx.lineTo(-5+w1,26+w2);ctx.lineTo(8,20);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(21,24);ctx.lineTo(-2+w1,28+w2);ctx.stroke();
  ctx.strokeStyle=BLUE;ctx.beginPath();ctx.moveTo(22,27);ctx.lineTo(-1+w1,32+w2);ctx.stroke();
  // patas delanteras/traseras cercanas
  leg(13,fo,air?2:0,B);leg(30,bo,air?3:0,B);
  R(27+fo-3,36-(air?3:0),6,3,"#33e8ff");R(27+fo-1,37-(air?3:0),2,1,"#fff"); // smartband
  // cabeza
  ctx.fillStyle=B;ctx.strokeStyle=O;ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(22,12);ctx.lineTo(23,0);ctx.lineTo(31,8);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(30,8);ctx.lineTo(37,0);ctx.lineTo(39,14);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#FFB3BA";ctx.beginPath();ctx.moveTo(24,10);ctx.lineTo(24.6,4);ctx.lineTo(29,8.5);ctx.fill();ctx.beginPath();ctx.moveTo(32,8);ctx.lineTo(36,3.5);ctx.lineTo(37,11);ctx.fill();
  ctx.fillStyle=B;ctx.strokeStyle=O;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(30,17,10.5,0,7);ctx.fill();ctx.stroke();
  R(28,8,2,4,D);R(32,8,2,4,D);
  ctx.fillStyle="#FFE0AE";ctx.beginPath();ctx.ellipse(36,21,5.5,4.2,0,0,7);ctx.fill();
  const blink=frame%210<6;
  if(blink){ctx.strokeStyle="#30243D";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(30,16);ctx.lineTo(37,16);ctx.stroke();}
  else{ctx.fillStyle="#30243D";ctx.beginPath();ctx.ellipse(34,16,2.8,3.6,0,0,7);ctx.fill();R(33,14,2,2,"#fff");}
  ctx.fillStyle="#E97D9A";ctx.beginPath();ctx.moveTo(38,19);ctx.lineTo(42,19);ctx.lineTo(40,22);ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(38,22);ctx.lineTo(46,20);ctx.moveTo(38,23);ctx.lineTo(46,24);ctx.stroke();
  ctx.restore();
}
function drawExtra(e){
  const x=e.x-cam,y=e.y;if(x<-90||x>W+90)return;
  const s=Math.floor(e.t/6)%2;
  if(e.k==="moto"){
    const d=e.dir,wd=e.mode===1,sx=wd?Math.round(Math.sin(e.t*2.5)*2):0,bx=x+sx;
    circ(bx+10,y+30,9,INK);circ(bx+52,y+30,9,INK);circ(bx+10,y+30,4,"#9aa3ad");circ(bx+52,y+30,4,"#9aa3ad");
    RO(bx+10,y+14,42,12,e.mode===2?"#c0152a":MAG);R(bx+(d>0?40:6),y+6,14,10,"#2b2b3a");R(bx+12,y+16,38,3,"rgba(255,255,255,.3)");
    RO(bx+22,y-8,16,24,"#222");RO(bx+22,y-20,16,14,"#111");R(bx+(d>0?30:22),y-16,8,6,"#8fd3ff");
    R(bx+(d>0?56:-4),y+16,6,6,e.mode>0?"#fff3a8":"#ffec99");
    if(e.mode===2)R(bx+(d>0?-26:62),y+16,24,5,"rgba(255,255,255,.4)");
    if(wd){ctx.fillStyle="#ff3b3b";ctx.font="bold 22px Arial";ctx.fillText("!",bx+26,y-26);}
  }
  if(e.k==="rat"){
    const d=e.dir;RO(x,y+6,22,10,"#7c7f8c");RO(x+(d>0?18:-4),y+4,10,9,"#8e91a0");R(x+(d>0?24:-4),y+7,4,3,"#222");
    R(x+(d>0?-10:20),y+10,12,2,"#d49aa8");R(x+(s?3:9),y+14,5,3,"#555");R(x+(s?14:8),y+14,5,3,"#555");R(x+(d>0?20:2),y,4,6,"#d49aa8");
  }
  if(e.k==="slinger"){
    const d=e.dir;RO(x+5,y+16,20,26,"#6b3d1e");R(x+5,y+16,20,5,"#8a5a30");RO(x+7,y+2,16,16,"#d9a27a");R(x+4,y-3,22,8,MAG);R(x+6,y-5,18,3,GOLD);R(x+7,y+8,16,4,"#222");
    R(x+(s?4:9),y+40,8,6,"#222");R(x+(s?18:13),y+40,8,6,"#222");
    const a=Math.sin(e.t*.25)*4;R(x+(d>0?22:-4),y+18+a,12,5,"#d9a27a");
    if(e.cool<20){RO(x+(d>0?32:-14),y+14,8,8,"#8d93a1");}
  }
}
function drawFoe(e){drawExtra(e);
  const x=e.x-cam,y=e.y;if(x<-80||x>W+80)return;
  const s=Math.floor(e.t/8)%2;
  if(e.k==="thief"){
    RO(x+5,y+14,20,22,"#2a2a33");R(x+5,y+14,20,4,"#3a3a46");RO(x+7,y,16,16,"#d9a27a");RO(x+5,y-3,20,9,"#111");R(x+7,y+6,16,4,"#111");
    R(x+10,y+9,3,3,"#fff");R(x+17,y+9,3,3,"#fff");R(x+11,y+10,1,1,"#000");R(x+18,y+10,1,1,"#000");
    R(x+(s?4:9),y+36,8,10,"#333");R(x+(s?18:13),y+36,8,10,"#333");R(x+(s?3:8),y+43,10,3,"#111");R(x+(s?17:12),y+43,10,3,"#111");
    RO(x+(e.dir>0?22:-6),y+18,10,12,"#c8963a");
    if(e.mode===1)R(x+10,y-16,8,8,GOLD);
    else if(Math.abs(p.x-e.x)<300){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px Arial";ctx.fillText("!",x+10,y-8);}
  }
  if(e.k==="dog"){
    const wd=e.mode===1,sx=wd?Math.round(Math.sin(e.t*2)*2):0,d=e.dir,wg=Math.sin(e.t*.4)*3;
    RO(x+sx,y+8,38,16,e.mode===2?"#8a4b22":"#a9703f");R(x+sx+4,y+10,30,4,"#c08a58");
    RO(x+sx+(d>0?28:-4),y,18,16,"#a9703f");RO(x+sx+(d>0?30:0),y-6,6,12,"#6b4a2b");
    R(x+sx+(d>0?38:-4),y+6,6,5,"#222");R(x+sx+(d>0?36:2),y+3,3,3,"#fff");R(x+sx+(d>0?26:4),y+14,10,3,MAG);
    R(x+sx+(s?4:10),y+24,7,6,"#6b4a2b");R(x+sx+(s?26:20),y+24,7,6,"#6b4a2b");
    R(x+sx+(d>0?-6:36),y+6+wg*.3,8,4,"#a9703f");
    if(wd){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px Arial";ctx.fillText("!",x+14,y-12);}
  }
  if(e.k==="bird"){
    const f=Math.sin(e.t*.4)*8;
    RO(x+6,y+6,22,14,"#9aa0ae");RO(x+(e.dir>0?24:0),y+2,10,10,"#7e8496");R(x+(e.dir>0?27:3),y+8,4,2,"#6fd0a0");R(x+(e.dir>0?32:-2),y+6,5,3,GOLD);R(x+(e.dir>0?29:3),y+4,2,2,"#222");
    ctx.fillStyle="#c4c9d6";ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+10,y+8);ctx.lineTo(x+18,y-8+f);ctx.lineTo(x+26,y+8);ctx.closePath();ctx.fill();ctx.stroke();
  }
}
function drawCar(c){
  const x=c.x-cam;if(x<-120||x>W+120)return;
  const y=c.y,d=c.vx>0?1:-1;
  RO(x,y+8,c.w,24,c.col);RO(x+(d>0?18:12),y-8,44,18,c.col);R(x+(d>0?24:18),y-4,14,12,"#8fd3ff");R(x+(d>0?42:36),y-4,14,12,"#8fd3ff");
  R(x,y+24,c.w,4,"rgba(0,0,0,.22)");
  circ(x+16,y+32,8,"#111");circ(x+c.w-16,y+32,8,"#111");circ(x+16,y+32,3,"#9aa3ad");circ(x+c.w-16,y+32,3,"#9aa3ad");
  R(d>0?x+c.w-6:x,y+14,6,8,"#ffec99");R(x+30,y+2,18,5,"rgba(255,255,255,.3)");
}
function drawBoss(){
  if(!boss.alive||(boss.hurt>0&&Math.floor(frame/4)%2===0))return;
  const x=boss.x-cam,y=boss.y;if(x<-120||x>W+120)return;
  RO(x+4,y+24,48,56,"#2b2b3a");R(x+8,y+28,40,8,MAG);R(x+4,y+24,6,56,"#3a3a4e");RO(x+12,y+4,32,26,"#d9a27a");
  RO(x+6,y-6,44,14,"#1a1a24");RO(x+14,y-14,28,10,"#1a1a24");R(x+14,y-6,28,3,GOLD);
  R(x+12,y+8,32,6,"#111");R(x+18,y+14,6,6,"#fff");R(x+32,y+14,6,6,"#fff");R(x+20,y+16,3,4,"#c0152a");R(x+34,y+16,3,4,"#c0152a");
  R(x+20,y+24,16,4,"#3a2a1a");RO(x-12,y+34,18,26,"#C8963A");R(x-8,y+30,10,6,"#8a6a2a");
  R(x+8,y+80-8,14,8,"#111");R(x+34,y+80-8,14,8,"#111");
  R(x-4,y-34,64,10,"#30243D");R(x-2,y-32,(boss.hp/boss.max)*60,6,"#FF586E");
  ctx.fillStyle="#fff";ctx.font="bold 11px Arial";ctx.fillText("DON CHORRO",x-2,y-38);
}

// ---------- DIBUJO: objetos del mundo ----------
function drawWorld(){
  qb.forEach(q=>{
    const x=q.x-cam;if(x<-50||x>W+50)return;let y=q.y;if(q.bump>0)y-=Math.sin(q.bump/10*Math.PI)*7;
    const pw=q.c!=="?",u=q.used,face=u?"#8A6A48":(pw?"#F0B42A":GOLD),bd=u?"#6B4F32":(pw?"#B9561A":"#C8821A");
    R(x-1,y-1,42,42,INK);R(x,y,40,40,face);R(x,y,40,3,u?"#9a7a58":"#FFE58A");R(x,y,3,40,u?"#9a7a58":"#FFE58A");R(x,y+37,40,3,bd);R(x+37,y,3,40,bd);
    [[3,3],[33,3],[3,33],[33,33]].forEach(c=>R(x+c[0],y+c[1],4,4,u?"#6B4F32":"#C8821A"));
    if(!u){
      if(pw){chak(x+20,y+20,5,MAG);chak(x+20,y+20,2.6,"#fff3b0");}
      else{ctx.fillStyle="#fff3b0";ctx.font="bold 24px Arial";ctx.textAlign="center";ctx.fillText("?",x+20,y+29);ctx.textAlign="left";}
    }
  });
  LV.floats.forEach(q=>{const x=q[0]-cam;if(x<-200||x>W+50)return;RO(x,q[1],q[2],16,"#a9703f");R(x,q[1],q[2],6,"#d9a24a");for(let i=0;i<q[2];i+=35)R(x+i+4,q[1]+9,13,4,"#7a4a25");R(x,q[1]+16,q[2],3,"rgba(0,0,0,.2)");for(let i=6;i<q[2]-10;i+=24)R(x+i,q[1]+1,10,3,i%48?MAG:BLUE);});
  movers.forEach(m=>{const x=m.x-cam;RO(x,m.y,m.w,16,"#9AA3B5");R(x,m.y,m.w,6,"#C6CEDD");R(x+m.w/2-8,m.y+6,16,4,GOLD);R(x+4,m.y+16,6,8,"#555");R(x+m.w-10,m.y+16,6,8,"#555");});
  crum.forEach(c=>{if(c.st===2)return;let x=c.x-cam;if(c.st===1)x+=Math.sin(frame*1.5)*2;
    RO(x,c.y,c.w,18,"#C9A36B");R(x,c.y,c.w,6,"#E3C48F");R(x+20,c.y+4,3,14,"#7A5A33");R(x+56,c.y+6,3,12,"#7A5A33");R(x+4,c.y+12,c.w-8,2,"#9c7a48");});
  springs.forEach(s=>{const x=s.x-cam,q=s.anim>0?6:0;R(x,s.y+10,s.w,4,"#555");for(let i=0;i<3;i++)R(x+6,s.y+8-i*(3-q/3)+q,s.w-12,3,"#D9D9D9");R(x-2,s.y-2+q,s.w+4,5,MAG);});
  saws.forEach(s=>{
    const x=s.x-cam;if(x<-60||x>W+60)return;
    R(s.bx-s.r-cam,GY-16,s.r*2,4,"rgba(0,0,0,.3)");R(s.bx-s.r-cam,GY-14,s.r*2,2,"#555");
    ctx.save();ctx.translate(x,GY-14);ctx.rotate(frame*.15);ctx.fillStyle="#D0D0D8";
    for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-4,-22,8,12);}
    ctx.beginPath();ctx.arc(0,0,15,0,7);ctx.fill();ctx.fillStyle="#555";ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill();ctx.restore();
  });
  sellosObj.forEach(s=>{
    if(s.got)return;const x=s.x-cam,y=s.y+Math.sin(frame*.06)*6;if(x<-40||x>W+40)return;
    ctx.fillStyle="rgba(244,196,48,.2)";ctx.beginPath();ctx.arc(x,y,30+Math.sin(frame*.1)*3,0,7);ctx.fill();
    chak(x,y,9,INK);chak(x,y,8,GOLD);R(x-3,y-3,6,6,MAG);
  });
  coins.forEach(c=>{
    if(c.got)return;const x=c.x-cam,y=c.y+Math.sin(frame*.07+c.x)*3;if(x<-20||x>W+20)return;
    const w=4+Math.abs(Math.sin(frame*.06+c.x))*6;R(x-w-1,y-11,w*2+2,22,"#B87816");R(x-w,y-10,w*2,20,GOLD);R(x-2,y-6,4,12,"#FFF2A6");
  });
  powers.forEach(w=>{
    if(w.got)return;const x=w.x-cam,y=w.y+(w.rest?Math.sin(frame*.08)*4:0);
    R(x-19,y-19,38,38,"rgba(255,255,255,.22)");RO(x-13,y-13,26,26,POWCOL[w.t]);
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(x-13,y-13,26,26);
    ctx.fillStyle="#30243D";ctx.font="bold 15px Arial";ctx.textAlign="center";ctx.fillText({shield:"S",double:"↑",magnet:"M",heart:"♥"}[w.t],x,y+5);ctx.textAlign="left";
  });
  bullets.forEach(b=>{const x=b.x-cam;
    if(b.rock){RO(x,b.y,b.w,b.h,"#555a66");R(x+2,b.y+2,b.w-6,b.h-6,"#8d93a1");R(x+3,b.y+3,4,4,"#c9cedb");return;}
    RO(x,b.y,b.w,b.h,"#8a6a2a");R(x+3,b.y+3,b.w-6,b.h-6,"#C8963A");R(x+8,b.y-4,6,6,"#8a6a2a");});
}

// ---------- DIBUJO: interfaz ----------
function ui(){
  rr(10,10,520,58,12,"rgba(18,40,78,.88)");R(22,10,496,3,GOLD);
  circ(34,32,10,"#B87816");circ(34,32,8,GOLD);R(32,27,4,10,"#FFF2A6");
  ctx.fillStyle="#fff";ctx.font="bold 18px Arial";ctx.fillText(money,50,39);
  for(let i=0;i<hearts;i++)heart(124+i*23,23,17,"#FF5470");
  for(let i=0;i<4;i++){chak(300+i*30,32,i<sellos?5:4,i<sellos?GOLD:"rgba(255,255,255,.22)");}
  ctx.fillStyle="#fff";ctx.fillText("Puntos "+score,424,39);
  ctx.font="11px Arial";ctx.fillStyle="#cfe";ctx.fillText(ZONES[zoneAt(p.x)].n+" · Distrito 2, El Alto · 4.050 m s.n.m.",22,60);
  let px=10;
  [["ESCUDO","shield",p.shield],["DOBLE SALTO","double",p.dj],["IMÁN","magnet",p.mag]].forEach(a=>{
    if(a[2]>0){rr(px,74,112,16,8,"rgba(18,40,78,.82)");rr(px+2,76,Math.max(6,108*a[2]/POWMAX[a[1]]),12,6,POWCOL[a[1]]);ctx.fillStyle="#1b1424";ctx.font="bold 10px Arial";ctx.fillText(a[0],px+8,86);px+=120;}
  });
  // botón de música
  rr(W-50,10,38,38,10,"rgba(18,40,78,.88)");
  ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(W-40,26);ctx.lineTo(W-35,26);ctx.lineTo(W-28,20);ctx.lineTo(W-28,38);ctx.lineTo(W-35,32);ctx.lineTo(W-40,32);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#fff";ctx.lineWidth=2;
  if(Snd.muted()){ctx.strokeStyle="#ff6b6b";ctx.beginPath();ctx.moveTo(W-24,23);ctx.lineTo(W-16,35);ctx.moveTo(W-16,23);ctx.lineTo(W-24,35);ctx.stroke();}
  else{ctx.beginPath();ctx.arc(W-28,29,6,-.9,.9);ctx.stroke();ctx.beginPath();ctx.arc(W-28,29,11,-.8,.8);ctx.stroke();}
  // progreso
  const bx=60,bw=W-120;rr(bx,H-16,bw,8,4,"rgba(0,0,0,.45)");rr(bx,H-16,Math.max(8,bw*Math.min(1,p.x/GOAL)),8,4,GOLD);
  STOPS.forEach((s,i)=>R(bx+bw*s.x/GOAL-3,H-21,6,18,sellosObj[i].got?"#7dff9b":"#fff"));
  R(bx+bw*ARENA/GOAL-3,H-21,6,18,boss.alive?MAG:"#7dff9b");
  if(boss.alive&&boss.active){rr(W-250,56,200,22,6,"#30243D");rr(W-246,60,(boss.hp/boss.max)*192,14,5,"#FF586E");ctx.fillStyle="#fff";ctx.font="bold 11px Arial";ctx.fillText("DON CHORRO",W-240,71);}
}
function bubble(){
  if(!bub)return;
  const a=Math.min(1,bub.t/20,(bub.max-bub.t)/15+.2);
  ctx.globalAlpha=Math.max(0,a);
  ctx.font="bold 16px Arial";
  const w=Math.min(700,ctx.measureText(bub.txt).width+90),x=W/2-w/2,y=96;
  rr(x,y,w,44,10,"rgba(15,30,60,.93)");R(x+10,y,w-20,3,GOLD);R(x+10,y+41,w-20,3,MAG);
  R(x+8,y+8,26,26,"#F5A64D");R(x+6,y+4,8,10,"#E68A35");R(x+28,y+4,8,10,"#E68A35");R(x+14,y+16,3,5,"#30243D");R(x+25,y+16,3,5,"#30243D");R(x+18,y+24,6,3,"#E97D9A");
  ctx.fillStyle="#fff";ctx.fillText(bub.txt,x+46,y+28);
  ctx.globalAlpha=1;
}
function overlay(t,sub,lines,cta){
  R(0,0,W,H,"rgba(10,25,55,.9)");
  chak(W/2-250,100,10,GOLD);chak(W/2+250,100,10,GOLD);
  ctx.textAlign="center";ctx.fillStyle="#000";ctx.font="bold 42px Arial";ctx.fillText(t,W/2+2,122);ctx.fillStyle=GOLD;ctx.fillText(t,W/2,120);
  ctx.fillStyle="#fff";ctx.font="bold 19px Arial";ctx.fillText(sub,W/2,158);
  ctx.font="17px Arial";lines.forEach((l,i)=>ctx.fillText(l,W/2,215+i*28));
  ctx.fillStyle=Math.floor(Date.now()/500)%2?MAG:"#ff8fb0";ctx.font="bold 20px Arial";ctx.fillText(cta,W/2,455);
  ctx.textAlign="left";
}

function draw(){
  ctx.save();
  if(shake>0)ctx.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
  bg();ground();pitsDraw();gdeco();
  STOPS.forEach((s,i)=>landmark(i,s.x));
  checkpointsDraw();arenaDraw();goal();drawWorld();
  shadows();foes.forEach(drawFoe);cars.forEach(drawCar);drawBoss();cat();
  parts&&parts.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/45);R(q.x-cam,q.y,q.s,q.s,q.c);});ctx.globalAlpha=1;
  ctx.fillStyle="rgba(255,255,255,.35)";amb.forEach(a=>ctx.fillRect(Math.round(a.x),Math.round(a.y),a.s,a.s));
  ctx.restore();
  vignette();
  if(st!=="menu"){ui();bubble();}
  frame+=st==="menu"?1:0;
  if(st==="menu")overlay("TILCAYO","La Odisea del Distrito 2 · El Alto, Bolivia",LORE.concat(["","Mover: ← → o A D · Saltar: Espacio, ↑ o W · Música: M","Pisa a los enemigos, golpea las cajas desde abajo y junta 4 sellos."]),"Toca la pantalla para jugar");
  if(st==="win")overlay("¡LLEGASTE A LA OTRA RUTA!","Pase Dorado del Altiplano ganado",
    ["Sellos: "+sellos+"/4  |  Bs "+money+"  |  Puntos "+score,"La Chacana brilla otra vez sobre El Alto.","Tilcayo sigue su viaje hacia el siguiente distrito."],"Toca para jugar de nuevo");
  if(st==="lost")overlay("SIN CORAZONES","Los autos, las zanjas y los chorros ganaron esta vez",["Tilcayo se sacude el polvo y lo intenta otra vez."],"Toca para reintentar");
}

let last=0,acc=0;const STEP=1000/60;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=STEP){update();acc-=STEP;}
  draw();requestAnimationFrame(loop);
}
start();st="menu";msgs=[];bub=null;Snd.music("menu");
requestAnimationFrame(loop);
