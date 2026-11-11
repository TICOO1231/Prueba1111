"use strict";
// TILCAYO: LA ODISEA DEL DISTRITO 2 (El Alto, 4.050 m s.n.m.)
const cv=document.getElementById("c"),ctx=cv.getContext("2d");
const W=960,H=540,GY=450,LW=6200,GOAL=6050,G=0.55;
const BLUE="#1A4B84",GOLD="#F4C430",MAG="#E03A65",STEEL="#708090";

// ---------- LORE ----------
const LORE=[
 "Cada año, la Chacana reparte cuatro sellos de luz por el Distrito 2.",
 "Don Chorro, el ladrón de las ferias, los robó y los escondió en cuatro paradas.",
 "Tilcayo, el gato andino, debe recuperarlos y llegar al paradero de la otra ruta."];
const STOPS=[
 {x:700,name:"Plaza del Minero",say:"Plaza del Minero: aquí se asentaron las familias mineras de Villa Santiago II."},
 {x:1900,name:"Chacana",say:"La Chacana, Ojo del Universo. Llegar en taxi cuesta Bs 10 a 25."},
 {x:3100,name:"Entrada Folklórica",say:"Entrada del Apóstol Santiago. ¡Ojo con los hurtos en las ferias!"},
 {x:4300,name:"Planta La Francesa",say:"La Francesa: las visitas industriales necesitan permiso."}];
const TIPS={car:"Inseguridad vial: espera que pase el auto y salta.",thief:"¡Un chorro! Písalo o esquívalo, te roba monedas.",
 dog:"Perro callejero: se prepara y embiste.",boss:"¡Don Chorro! Písalo 3 veces.",saw:"Sierras de fábrica: salta con ritmo."};

// ---------- NIVEL ----------
const CARS=[[300,560,2.2],[1250,1560,2.6],[2500,2820,2.5],[3700,4020,2.9],[4750,5050,3.1]];
const THIEVES=[[1000,880,1150],[2250,2100,2400],[3450,3300,3600],[4500,4380,4650]];
const DOGS=[[1700,1600,1850],[2900,2800,3000],[3900,3800,4100],[4950,4900,5100]];
const BIRDS=[[1500,250],[2600,240],[3500,230],[4600,250],[5200,240]];
const SAWS=[[5160,60,1.5],[5290,60,1.8]];
const SPRINGS=[1180,2050];
const FLOATS=[[450,350,120],[1230,270,140],[2650,330,120],[4950,340,120]];
const MOVERS=[[2150,340,100,90,1.1],[2380,300,100,90,1.3]];
const CRUMBLES=[3750,3860,3970,4080];
const QROWS=[[380,"?S?"],[2200,"?D?"],[3350,"?M?"],[4950,"?H?"]];
const POWC={S:"shield",D:"double",M:"magnet",H:"heart"};
const POWCOL={shield:"#72D6FF",double:"#8CEB9A",magnet:"#D58AFF",heart:"#FF6B8A"};
const POWTXT={shield:"Escudo de aguayo",double:"Doble salto",magnet:"Imán de monedas",heart:"Vida extra"};

let st="menu",frame=0,cam=0,money,hearts,sellos,cp,msgs=[],bub=null,flags,jp=false,shake=0,score;
let coins,cars,foes,saws,qb,movers,crum,springs,sellosObj,powers,bullets,parts,boss,stopsDone;
const keys={},inp={l:0,r:0,j:0};
const p={x:60,y:GY-42,w:38,h:42,vy:0,face:1,gr:true,coy:0,inv:0,anim:0,on:null,shield:0,dj:0,air:0,mag:0,bounce:false};

function say(t,pri){ if(pri){msgs.unshift(t);if(bub)bub.t=0;}else if(!msgs.includes(t)&&(!bub||bub.txt!==t))msgs.push(t); }
function tipOnce(k){ if(!flags[k]){flags[k]=1;say(TIPS[k]);} }
function toast(t){say(t,true);}
function burst(x,y,c,n=10){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*5,l:30+Math.random()*20,c,s:3+Math.random()*3});}

function start(){
  coins=[];
  for(let x=200;x<GOAL-60;x+=95){
    const inCar=CARS.some(c=>x>c[0]-40&&x<c[1]+80);
    if(STOPS.some(s=>Math.abs(x-s.x)<70)||x>5350)continue;
    coins.push({x,y:inCar?GY-130:GY-26,got:false});
  }
  FLOATS.forEach(q=>{for(let i=0;i<3;i++)coins.push({x:q[0]+25+i*35,y:q[1]-26,got:false});});
  CRUMBLES.forEach(x=>coins.push({x:x+45,y:290,got:false}));
  MOVERS.forEach(m=>coins.push({x:m[0]+50,y:m[1]-60,got:false}));
  cars=CARS.map((c,i)=>({x:c[0]+i*40,y:GY-32,w:78,h:32,vx:c[2],min:c[0],max:c[1],col:["#E03A65","#F4C430","#ffffff","#2a9d8f","#ff7b00"][i]}));
  foes=[];
  THIEVES.forEach(t=>foes.push({k:"thief",x:t[0],min:t[1],max:t[2],dir:-1,mode:0,w:30,h:46,y:GY-46,t:0,alive:true}));
  DOGS.forEach(t=>foes.push({k:"dog",x:t[0],min:t[1],max:t[2],dir:1,mode:0,w:44,h:30,y:GY-30,t:0,cool:0,wind:0,alive:true}));
  BIRDS.forEach(b=>foes.push({k:"bird",x:b[0],by:b[1],y:b[1],min:b[0]-220,max:b[0]+220,dir:1,w:34,h:24,t:0,alive:true}));
  saws=SAWS.map(s=>({x:s[0],bx:s[0],r:s[1],sp:s[2]}));
  qb=[];QROWS.forEach(r=>[...r[1]].forEach((ch,i)=>qb.push({x:r[0]+i*40,y:GY-135,w:40,h:40,c:ch,used:false,bump:0})));
  movers=MOVERS.map(m=>({x:m[0],bx:m[0],y:m[1],w:m[2],range:m[3],sp:m[4],dx:0}));
  crum=CRUMBLES.map(x=>({x,y:330,w:90,st:0,t:0}));
  springs=SPRINGS.map(x=>({x,y:GY-14,w:36,h:14,anim:0,cd:0}));
  sellosObj=STOPS.map(s=>({x:s.x,y:GY-120,got:false}));
  powers=[];bullets=[];parts=[];msgs=[];bub=null;flags={};stopsDone=0;
  boss={x:5750,y:GY-80,w:56,h:80,hp:3,max:3,dir:-1,vy:0,t:0,hurt:0,alive:true,active:false};
  money=0;hearts=3;sellos=0;cp=60;score=0;
  Object.assign(p,{x:60,y:GY-42,vy:0,inv:90,shield:0,dj:0,air:0,mag:0,on:null,face:1});
  cam=0;frame=0;st="play";
  say("¡Miau! Soy Tilcayo. Junta los 4 sellos de luz.");
}

// ---------- ENTRADA ----------
function press(){ if(st==="play")jp=true; else start(); }
addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(["Space","ArrowUp","KeyW"].includes(e.code)&&!e.repeat){e.preventDefault();press();}
  if(e.code==="Enter"&&!e.repeat&&st!=="play")start();
});
addEventListener("keyup",e=>keys[e.code]=false);
function bind(id,key){
  const el=document.getElementById(id);
  const on=e=>{e.preventDefault();inp[key]=1;el.classList.add("on");if(key==="j")press();};
  const off=e=>{e.preventDefault();inp[key]=0;el.classList.remove("on");};
  el.addEventListener("pointerdown",on);
  ["pointerup","pointercancel","pointerleave"].forEach(v=>el.addEventListener(v,off));
}
bind("bl","l");bind("br","r");bind("bj","j");
cv.addEventListener("pointerdown",e=>{e.preventDefault();if(st!=="play")start();});
document.addEventListener("contextmenu",e=>e.preventDefault());
addEventListener("blur",()=>{inp.l=inp.r=inp.j=0;});

// ---------- LÓGICA ----------
const hurtbox=()=>({x:p.x+7,y:p.y+6,w:p.w-14,h:p.h-6});
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

function damage(){
  if(p.inv>0||p.shield>0)return;
  hearts--;shake=12;burst(p.x+19,p.y+20,"#FF6B6B",14);
  if(hearts<=0){st="lost";return;}
  p.x=Math.max(0,cp);p.y=GY-p.h;p.vy=0;p.inv=120;bullets=[];
  toast("¡Auch! Vuelves a la última parada");
}
function givePower(t){
  if(t==="shield")p.shield=720;if(t==="double"){p.dj=1500;p.air=1;}
  if(t==="magnet")p.mag=840;if(t==="heart")hearts=Math.min(5,hearts+1);
  score+=50;burst(p.x+19,p.y,POWCOL[t],16);toast(POWTXT[t]);
}
function bumpQ(q){
  q.bump=10;if(q.used)return;q.used=true;
  if(q.c==="?"){money++;score+=10;burst(q.x+20,q.y-6,GOLD,8);}
  else powers.push({t:POWC[q.c],x:q.x+20,y:q.y-26,got:false});
}
function solids(){ // plataformas de aterrizaje
  const a=[];
  FLOATS.forEach(q=>a.push({x:q[0],y:q[1],w:q[2]}));
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
  movers.forEach(m=>{const o=m.x;m.x=m.bx+Math.sin(frame*.033*m.sp)*m.range;m.dx=m.x-o;});
  crum.forEach(c=>{
    if(c.st===1&&--c.t<=0){c.st=2;c.t=220;burst(c.x+45,c.y,"#C9A36B",10);}
    else if(c.st===2&&--c.t<=0)c.st=0;
  });
  qb.forEach(q=>{if(q.bump>0)q.bump--;});
  springs.forEach(s=>{if(s.anim>0)s.anim--;if(s.cd>0)s.cd--;});

  if(p.on&&p.on.m)p.x+=p.on.m.dx;
  const dir=((inp.r||keys.ArrowRight||keys.KeyD)?1:0)-((inp.l||keys.ArrowLeft||keys.KeyA)?1:0);
  if(dir){p.face=dir;p.anim++;p.x+=dir*3.3;}
  p.x=Math.max(0,Math.min(LW-p.w,p.x));
  if(p.gr)p.coy=7;else if(p.coy>0)p.coy--;
  if(jp){
    if(p.coy>0){p.vy=-12.4;p.gr=false;p.coy=0;p.air=p.dj>0?1:0;burst(p.x+19,p.y+42,"#ffffff",4);}
    else if(p.dj>0&&p.air>0){p.vy=-11.2;p.air--;burst(p.x+19,p.y+42,"#A7E8FF",8);}
  }
  jp=false;
  const held=inp.j||keys.Space||keys.ArrowUp||keys.KeyW;
  if(!held&&!p.bounce&&p.vy<-4.5)p.vy=-4.5;
  const prev=p.y+p.h,prevTop=p.y;
  p.vy=Math.min(p.vy+G,13);p.y+=p.vy;p.gr=false;p.on=null;
  if(p.y+p.h>=GY){p.y=GY-p.h;p.vy=0;p.gr=true;}
  for(const s of solids()){
    if(p.x+p.w<=s.x||p.x>=s.x+s.w)continue;
    if(p.vy>=0&&prev<=s.y+1&&p.y+p.h>=s.y){
      p.y=s.y-p.h;p.vy=0;p.gr=true;p.on=s;
      if(s.c&&s.c.st===0){s.c.st=1;s.c.t=45;}
    }
  }
  qb.forEach(q=>{ // golpe desde abajo
    if(p.vy<0&&p.x+p.w>q.x+4&&p.x<q.x+q.w-4&&prevTop>=q.y+q.h-2&&p.y<=q.y+q.h){p.y=q.y+q.h;p.vy=0;bumpQ(q);}
  });
  if(p.gr)p.bounce=false;
  ["inv","shield","dj","mag"].forEach(k=>{if(p[k]>0)p[k]--;});
  const hb=hurtbox();

  springs.forEach(s=>{
    if(s.cd===0&&p.vy>=0&&hit(hb,s)){p.vy=-17.5;p.bounce=true;p.gr=false;s.anim=12;s.cd=15;burst(s.x+18,s.y,"#fff",6);}
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
      else{e.x+=e.dir*4.4;if(Math.abs(e.x-p.x)>800)e.alive=false;}
    }
    if(e.k==="dog"){
      if(e.mode===0){e.x+=.8*e.dir;if(e.cool>0)e.cool--;else if(near&&Math.abs(p.x-e.x)<260&&Math.sign(p.x-e.x)===e.dir){e.mode=1;e.wind=35;tipOnce("dog");}}
      else if(e.mode===1){if(--e.wind<=0)e.mode=2;}
      else e.x+=3.4*e.dir;
      if(e.x<e.min){e.x=e.min;e.dir=1;if(e.mode===2){e.mode=0;e.cool=90;}}
      if(e.x>e.max){e.x=e.max;e.dir=-1;if(e.mode===2){e.mode=0;e.cool=90;}}
    }
    if(e.k==="bird"){e.x+=1.4*e.dir;e.y=e.by+Math.sin(e.t*.05)*40;if(e.x<e.min)e.dir=1;if(e.x>e.max)e.dir=-1;}
    if(e.mode===1&&e.k==="thief")return;
    const box={x:e.x,y:e.y,w:e.w,h:e.h};
    if(!hit(hb,box))return;
    const stomp=p.vy>0&&prev<=e.y+16;
    if(stomp){
      e.alive=false;p.vy=held?-10.5:-7;p.bounce=true;score+=30;burst(e.x+e.w/2,e.y+10,"#FFB3BA",12);
      if(e.k==="thief"){money+=5;toast("¡Atrapaste al chorro! +5 Bs");}
    }else if(e.k==="thief"&&p.inv===0&&p.shield===0){
      const lost=Math.ceil(money/2);money-=lost;e.mode=1;e.dir=p.x>e.x?-1:1;p.inv=90;shake=10;
      toast(lost?"¡Te robaron "+lost+" Bs!":"¡Casi te roban!");
    }else if(e.k!=="thief")damage();
  });

  bullets.forEach(b=>{
    b.x+=b.vx;b.l--;
    if(hit(hb,b)){
      if(p.vy>0&&prev<=b.y+6){b.l=0;p.vy=-8;p.bounce=true;burst(b.x,b.y,"#C8963A",8);}
      else{b.l=0;damage();}
    }
  });
  bullets=bullets.filter(b=>b.l>0);

  coins.forEach(c=>{
    if(c.got)return;
    const dx=p.x+19-c.x,dy=p.y+21-c.y,d=Math.hypot(dx,dy);
    if(p.mag>0&&d<200){c.x+=dx*.09;c.y+=dy*.09;}
    if(d<30){c.got=true;money++;score+=10;burst(c.x,c.y,GOLD,6);}
  });
  powers.forEach(w=>{if(!w.got&&Math.hypot(p.x+19-w.x,p.y+21-w.y)<32){w.got=true;givePower(w.t);}});
  sellosObj.forEach((s,i)=>{
    if(!s.got&&Math.hypot(p.x+19-s.x,p.y+21-s.y)<38){
      s.got=true;sellos++;cp=STOPS[i].x-120;score+=100;burst(s.x,s.y,GOLD,26);
      toast("¡Sello "+sellos+"/4! "+STOPS[i].say);
    }
  });

  // JEFE: Don Chorro
  if(boss.alive){
    boss.active=p.x>5300;
    if(boss.active){
      tipOnce("boss");boss.t++;if(boss.hurt>0)boss.hurt--;
      const ph=boss.max-boss.hp;
      boss.x+=(1.1+ph*.35)*boss.dir;
      if(boss.x<5450){boss.x=5450;boss.dir=1;}if(boss.x>5850){boss.x=5850;boss.dir=-1;}
      boss.vy+=.5;boss.y+=boss.vy;
      if(boss.y>=GY-boss.h){boss.y=GY-boss.h;boss.vy=0;if(ph>0&&boss.t%150===0)boss.vy=-10;}
      if(boss.t%Math.max(80,170-ph*35)===0){
        const d=p.x<boss.x?-1:1;
        bullets.push({x:boss.x+(d<0?-18:boss.w),y:GY-26,w:22,h:22,vx:3.2*d,l:300});
      }
      const bb={x:boss.x,y:boss.y,w:boss.w,h:boss.h};
      if(hit(hb,bb)){
        if(boss.hurt===0&&p.vy>0&&prev<=boss.y+30){
          boss.hp--;boss.hurt=70;p.vy=-10.5;p.bounce=true;burst(boss.x+28,boss.y+30,"#FF9D76",20);
          toast(boss.hp>0?"¡Golpe! Le quedan "+boss.hp:"");
        }else if(boss.hurt===0)damage();
      }
      if(boss.hp<=0){boss.alive=false;score+=500;burst(boss.x+28,boss.y+30,GOLD,40);toast("¡Don Chorro huyó! Corre al paradero");}
    }
  }

  if(p.x+p.w>=GOAL){
    if(boss.alive)say("Primero derrota a Don Chorro.");
    else if(sellos<4)say("Te faltan sellos de luz.");
    else{st="win";return;}
    p.x=GOAL-p.w-6;
  }
  parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.12;q.l--;});parts=parts.filter(q=>q.l>0);
  if(shake>0)shake--;
  cam+=((p.x-W*.4+p.face*40)-cam)*.12;cam=Math.max(0,Math.min(LW-W,cam));
}

// ---------- DIBUJO ----------
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function par(f,per,fn){const off=cam*f,a=Math.floor(off/per)-1;for(let i=a;i<a+Math.ceil(W/per)+3;i++)fn(i*per-off,i);}
function hs(n){const s=Math.sin(n*127.1+311.7)*43758.5;return s-Math.floor(s);}
function lerpC(a,b,t){const A=[1,3,5].map(i=>parseInt(a.substr(i,2),16)),B=[1,3,5].map(i=>parseInt(b.substr(i,2),16));return "rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")+")";}

function bg(){
  const pr=Math.min(1,cam/(LW-W));
  const g=ctx.createLinearGradient(0,0,0,GY);
  g.addColorStop(0,lerpC("#2e78c7","#3a2a6e",pr));g.addColorStop(1,lerpC("#d9f0ff","#ffb27a",pr));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=lerpC("#fff6b0","#ff7a45",pr);ctx.beginPath();ctx.arc(780,90+pr*170,46,0,7);ctx.fill();
  ctx.globalAlpha=.85;par(.1,420,(x,i)=>{R(x+hs(i)*100,60+hs(i+3)*80,90,16,"#fff");R(x+20+hs(i)*100,48+hs(i+3)*80,50,16,"#fff");});ctx.globalAlpha=1;
  par(.06,900,x=>{ // Illimani
    ctx.fillStyle="#6f8fb8";ctx.beginPath();ctx.moveTo(x,GY);ctx.lineTo(x+300,190);ctx.lineTo(x+450,260);ctx.lineTo(x+620,150);ctx.lineTo(x+900,GY);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(x+560,190);ctx.lineTo(x+620,150);ctx.lineTo(x+685,200);ctx.lineTo(x+620,185);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+265,225);ctx.lineTo(x+300,190);ctx.lineTo(x+340,230);ctx.lineTo(x+300,220);ctx.fill();
  });
  par(.18,260,(x,i)=>{ // casas lejanas
    const h=60+hs(i+1)*60;R(x,GY-h,120,h,"#a78fb0");R(x,GY-h,120,6,"#8a7396");
  });
  par(.32,230,(x,i)=>{ // ladrillo alteño
    const h=110+hs(i+7)*110;
    R(x,GY-h,150,h,"#b5533c");R(x,GY-h,150,8,"#8a3a28");R(x+4,GY-h-14,18,14,"#8a3a28");
    for(let yy=GY-h+24;yy<GY-30;yy+=42)for(let xx=x+14;xx<x+130;xx+=44)R(xx,yy,22,24,hs(i+xx)<.3?GOLD:"#27406b");
    if(hs(i+30)<.35){R(x+60,GY-h-30,3,30,"#555");R(x+48,GY-h-26,28,3,"#555");}
  });
  par(.55,380,(x,i)=>{ // postes de luz
    if(hs(i+60)<.4)return;R(x,GY-150,6,150,"#3b3f52");R(x-14,GY-154,36,8,"#3b3f52");R(x-14,GY-148,14,6,"#fff3a8");
  });
}

function ground(){
  R(0,GY,W,H-GY,"#4a5360");R(0,GY,W,10,"#9aa3ad");R(0,GY+10,W,4,"#6b7480");
  par(1,80,x=>R(x,GY+40,40,5,GOLD));
  CARS.forEach(c=>{
    const x0=c[0]-cam,w=c[1]-c[0]+80;if(x0>W||x0+w<0)return;
    for(let i=0;i<w;i+=22)R(x0+i,GY+14,12,H-GY-14,"rgba(255,255,255,.6)");
  });
}

function landmark(i,x){
  const bx=x-cam;if(bx<-300||bx>W+300)return;
  if(i===0){
    R(bx-110,GY-30,220,30,"#8d8f98");R(bx-60,GY-60,120,30,"#a2a4ad");
    R(bx-22,GY-170,44,110,"#b8793c");R(bx-34,GY-130,12,50,"#b8793c");R(bx+22,GY-130,12,50,"#b8793c");
    R(bx-16,GY-200,32,32,"#c98a4b");R(bx-24,GY-208,48,8,GOLD);R(bx+30,GY-150,8,70,"#6b4a2b");R(bx+26,GY-158,22,10,"#555");
    for(let k=0;k<3;k++){R(bx-110+k*8,GY-34,6,4,"#fff");}
  }
  if(i===1){
    R(bx-140,GY-14,280,14,"#9a9588");R(bx-110,GY-28,220,14,"#aaa597");R(bx-80,GY-42,160,14,"#bdb8a9");
    [[-22,-150,44,110],[-60,-110,120,44]].forEach(r=>R(bx+r[0],GY+r[1],r[2],r[3],"#c9c3b0"));
    R(bx-34,GY-170,68,16,"#c9c3b0");R(bx-34,GY-60,68,18,"#c9c3b0");
    ctx.globalAlpha=.5+Math.sin(frame*.07)*.3;R(bx-4,GY-150,8,110,GOLD);R(bx-60,GY-92,120,8,GOLD);ctx.globalAlpha=1;
    R(bx-4,GY-96,8,16,MAG);
    [-120,-90,90,120].forEach(o=>{R(bx+o,GY-44,16,16,MAG);R(bx+o+4,GY-52,8,10,GOLD);});
  }
  if(i===2){
    R(bx-200,GY-230,400,6,"#fff");
    for(let k=-200;k<200;k+=40)R(bx+k,GY-224,30,34,[MAG,GOLD,BLUE,"#2a9d8f"][((k+200)/40)%4]);
    for(let k=0;k<4;k++){
      const dx=bx-120+k*70,b=Math.abs(Math.sin(frame*.12+k))*14;
      R(dx,GY-92-b,26,56,[MAG,GOLD,"#2a9d8f",BLUE][k]);R(dx+4,GY-112-b,18,18,"#d9a27a");R(dx-6,GY-40-b,38,10,[GOLD,MAG,BLUE,"#fff"][k]);R(dx+2,GY-120-b,22,8,"#222");
    }
    R(bx+160,GY-70,60,70,"#c8963a");R(bx+170,GY-58,40,10,GOLD);
    for(let k=0;k<10;k++)R(bx-190+((k*53+frame*1.5)%380),GY-210+((k*37+frame)%200),4,4,[MAG,GOLD,"#fff"][k%3]);
  }
  if(i===3){
    R(bx-190,GY-190,380,190,"#c9d2dc");R(bx-190,GY-190,380,18,BLUE);
    R(bx+120,GY-290,34,100,STEEL);R(bx+110,GY-296,54,10,"#555");
    for(let k=0;k<5;k++)R(bx-170+k*70,GY-150,50,44,"#8fd3ff");
    R(bx-30,GY-84,60,84,"#2f3e55");
    ctx.fillStyle="#fff";ctx.font="bold 16px Arial";ctx.textAlign="center";ctx.fillText("LA FRANCESA",bx-60,GY-172);ctx.textAlign="left";
    R(bx-190,GY-18,380,18,"#3c4656");for(let k=0;k<380;k+=26)R(bx-190+((k+frame*2)%380),GY-14,12,8,GOLD);
  }
}

function goal(){
  const x=GOAL-cam;if(x<-200||x>W+200)return;
  R(x,GY-210,10,210,"#fff");R(x+10,GY-210,150,70,BLUE);R(x+10,GY-210,150,8,GOLD);
  ctx.fillStyle="#fff";ctx.font="bold 15px Arial";ctx.fillText("PARADERO",x+34,GY-182);ctx.fillText("RUTA SIGUIENTE",x+16,GY-160);
  R(x+60,GY-100,160,60,GOLD);for(let k=0;k<3;k++)R(x+70+k*40,GY-90,32,22,"#8fd3ff");
  R(x+70,GY-44,22,22,"#222");R(x+190,GY-44,22,22,"#222");
  if(boss.alive&&sellos>=0){ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(x-4,GY-212,170,214);ctx.fillStyle="#fff";ctx.font="26px Arial";ctx.fillText("🔒",x+50,GY-60);}
}

// GATITO ORIGINAL (naranja)
function cat(){
  if(p.inv>0&&Math.floor(frame/5)%2===0)return;
  const x=Math.round(p.x-cam),y=Math.round(p.y);
  ctx.save();
  if(p.face===-1){ctx.translate(x+p.w,0);ctx.scale(-1,1);}else ctx.translate(x,0);
  const mv=inp.l||inp.r||keys.ArrowLeft||keys.ArrowRight||keys.KeyA||keys.KeyD;
  const walking=mv&&p.gr&&Math.abs(p.anim%12)<6,lo=walking?3:0,air=!p.gr;
  if(p.shield>0){ctx.strokeStyle="#72D6FF";ctx.lineWidth=3;ctx.beginPath();ctx.arc(19,y+22,27,0,7);ctx.stroke();}
  const tail=Math.sin(frame*.2)*2;
  R(29,y+25,9,8,"#E68A35");R(34,y+17+tail,8,12,"#E68A35");
  R(4,y+18,30,19,"#F5A64D");R(4,y+4,30,23,"#F5A64D");
  R(3,y,10,12,"#E68A35");R(25,y,10,12,"#E68A35");R(6,y+4,4,5,"#FFB3BA");R(28,y+4,4,5,"#FFB3BA");
  R(11,y+11,4,air?8:6,"#30243D");R(24,y+11,4,air?8:6,"#30243D");
  R(18,y+19,5,4,"#E97D9A");R(14,y+21,5,4,"#fff");R(22,y+21,5,4,"#fff");
  R(5,y+28,28,4,MAG);R(26,y+27,7,6,"#33e8ff"); // aguayo y smartband de Tilcayo
  if(air){R(6,y+34,8,8,"#FFE0AE");R(24,y+32,8,8,"#FFE0AE");}
  else{R(6,y+34+lo,8,8-lo,"#FFE0AE");R(24,y+34-lo,8,8+lo,"#FFE0AE");}
  ctx.restore();
}

function drawFoe(e){
  const x=e.x-cam,y=e.y;if(x<-80||x>W+80)return;
  const s=Math.floor(e.t/8)%2;
  if(e.k==="thief"){
    R(x+5,y+14,20,22,"#222");R(x+7,y,16,16,"#d9a27a");R(x+5,y-3,20,9,"#111");R(x+7,y+6,16,4,"#111");
    R(x+10,y+9,3,3,"#fff");R(x+17,y+9,3,3,"#fff");R(x+(s?4:9),y+36,8,10,"#333");R(x+(s?18:13),y+36,8,10,"#333");
    R(x+(e.dir>0?22:-6),y+18,10,6,"#c8963a");
    if(e.mode===1)R(x+10,y-16,8,8,GOLD);
    else if(Math.abs(p.x-e.x)<300){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px Arial";ctx.fillText("!",x+10,y-8);}
  }
  if(e.k==="dog"){
    const wd=e.mode===1,sx=wd?Math.round(Math.sin(e.t*2)*2):0,d=e.dir;
    R(x+sx,y+8,38,16,e.mode===2?"#8a4b22":"#a9703f");R(x+sx+(d>0?28:-4),y,18,16,"#a9703f");R(x+sx+(d>0?30:0),y-6,6,10,"#6b4a2b");
    R(x+sx+(d>0?38:-4),y+6,6,5,"#222");R(x+sx+(d>0?36:2),y+3,3,3,"#fff");
    R(x+sx+(s?4:10),y+24,7,6,"#6b4a2b");R(x+sx+(s?26:20),y+24,7,6,"#6b4a2b");
    R(x+sx+(d>0?-6:36),y+6,8,4,"#a9703f");
    if(wd){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px Arial";ctx.fillText("!",x+14,y-12);}
  }
  if(e.k==="bird"){
    const f=Math.sin(e.t*.4)*8;
    R(x+6,y+6,22,14,"#9aa0ae");R(x+(e.dir>0?24:0),y+2,10,10,"#7e8496");R(x+(e.dir>0?32:-2),y+6,5,3,GOLD);
    ctx.fillStyle="#c4c9d6";ctx.beginPath();ctx.moveTo(x+10,y+8);ctx.lineTo(x+18,y-8+f);ctx.lineTo(x+26,y+8);ctx.fill();
  }
}

function drawCar(c){
  const x=c.x-cam;if(x<-120||x>W+120)return;
  const y=c.y,d=c.vx>0?1:-1;
  R(x,y+8,c.w,24,c.col);R(x+(d>0?18:12),y-8,44,18,c.col);R(x+(d>0?24:18),y-4,14,12,"#8fd3ff");R(x+(d>0?42:36),y-4,14,12,"#8fd3ff");
  R(x+8,y+26,16,12,"#111");R(x+c.w-24,y+26,16,12,"#111");R(d>0?x+c.w-6:x,y+14,6,8,"#ffec99");
  R(x+30,y+2,18,5,"rgba(255,255,255,.35)");
}

function drawBoss(){
  if(!boss.alive||(boss.hurt>0&&Math.floor(frame/4)%2===0))return;
  const x=boss.x-cam,y=boss.y;if(x<-120||x>W+120)return;
  R(x+4,y+24,48,56,"#2b2b3a");R(x+8,y+28,40,8,MAG);R(x+12,y+4,32,26,"#d9a27a");
  R(x+6,y-6,44,14,"#1a1a24");R(x+14,y-14,28,10,"#1a1a24"); // sombrero
  R(x+12,y+8,32,6,"#111");R(x+18,y+14,6,6,"#fff");R(x+32,y+14,6,6,"#fff");R(x+20,y+16,3,4,"#c0152a");R(x+34,y+16,3,4,"#c0152a");
  R(x+20,y+24,16,4,"#3a2a1a");R(x-12,y+34,18,26,"#C8963A");R(x-8,y+30,10,6,"#8a6a2a"); // saco robado
  R(x+8,y+80-8,14,8,"#111");R(x+34,y+80-8,14,8,"#111");
  R(x-4,y-34,64,10,"#30243D");R(x-2,y-32,(boss.hp/boss.max)*60,6,"#FF586E");
  ctx.fillStyle="#fff";ctx.font="bold 11px Arial";ctx.fillText("DON CHORRO",x-2,y-38);
}

function drawWorld(){
  qb.forEach(q=>{
    const x=q.x-cam;if(x<-50||x>W+50)return;let y=q.y;if(q.bump>0)y-=Math.sin(q.bump/10*Math.PI)*7;
    R(x,y,40,40,q.used?"#8A6A48":GOLD);R(x,y,40,3,q.used?"#6B4F32":"#C8821A");R(x,y+37,40,3,q.used?"#6B4F32":"#C8821A");R(x,y,3,40,q.used?"#6B4F32":"#C8821A");R(x+37,y,3,40,q.used?"#6B4F32":"#C8821A");
    if(!q.used){ctx.fillStyle="#fff3b0";ctx.font="bold 24px Arial";ctx.textAlign="center";ctx.fillText("?",x+20,y+29);ctx.textAlign="left";}
  });
  FLOATS.forEach(q=>{const x=q[0]-cam;R(x,q[1],q[2],18,"#a9703f");R(x,q[1],q[2],6,"#d9a24a");for(let i=0;i<q[2];i+=35)R(x+i+4,q[1]+10,13,4,"#7a4a25");});
  movers.forEach(m=>{const x=m.x-cam;R(x,m.y,m.w,16,"#9AA3B5");R(x,m.y,m.w,6,"#C6CEDD");R(x+m.w/2-8,m.y+6,16,4,GOLD);});
  crum.forEach(c=>{if(c.st===2)return;let x=c.x-cam;if(c.st===1)x+=Math.sin(frame*1.5)*2;
    R(x,c.y,c.w,18,"#C9A36B");R(x,c.y,c.w,6,"#E3C48F");R(x+20,c.y+4,3,14,"#7A5A33");R(x+56,c.y+6,3,12,"#7A5A33");});
  springs.forEach(s=>{const x=s.x-cam,q=s.anim>0?6:0;R(x,s.y+10,s.w,4,"#555");for(let i=0;i<3;i++)R(x+6,s.y+8-i*(3-q/3)+q,s.w-12,3,"#D9D9D9");R(x-2,s.y-2+q,s.w+4,5,MAG);});
  saws.forEach(s=>{
    const x=s.x-cam;if(x<-60||x>W+60)return;
    R(s.bx-s.r-cam,GY-16,s.r*2,4,"rgba(0,0,0,.3)");
    ctx.save();ctx.translate(x,GY-14);ctx.rotate(frame*.15);ctx.fillStyle="#D0D0D8";
    for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-4,-22,8,12);}
    ctx.beginPath();ctx.arc(0,0,15,0,7);ctx.fill();ctx.fillStyle="#555";ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill();ctx.restore();
  });
  sellosObj.forEach(s=>{
    if(s.got)return;const x=s.x-cam,y=s.y+Math.sin(frame*.06)*6;if(x<-40||x>W+40)return;
    ctx.fillStyle="rgba(244,196,48,.25)";ctx.beginPath();ctx.arc(x,y,30+Math.sin(frame*.1)*4,0,7);ctx.fill();
    R(x-6,y-24,12,48,GOLD);R(x-24,y-6,48,12,GOLD);R(x-3,y-3,6,6,MAG);
  });
  coins.forEach(c=>{
    if(c.got)return;const x=c.x-cam,y=c.y+Math.sin(frame*.07+c.x)*3;if(x<-20||x>W+20)return;
    const w=4+Math.abs(Math.sin(frame*.06+c.x))*6;R(x-w-1,y-11,w*2+2,22,"#B87816");R(x-w,y-10,w*2,20,GOLD);R(x-2,y-6,4,12,"#FFF2A6");
  });
  powers.forEach(w=>{
    if(w.got)return;const x=w.x-cam,y=w.y+Math.sin(frame*.08)*5;
    R(x-19,y-19,38,38,"rgba(255,255,255,.25)");R(x-13,y-13,26,26,POWCOL[w.t]);
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(x-13,y-13,26,26);
    ctx.fillStyle="#30243D";ctx.font="bold 15px Arial";ctx.textAlign="center";ctx.fillText({shield:"S",double:"↑",magnet:"M",heart:"♥"}[w.t],x,y+5);ctx.textAlign="left";
  });
  bullets.forEach(b=>{const x=b.x-cam;R(x,b.y,b.w,b.h,"#8a6a2a");R(x+3,b.y+3,b.w-6,b.h-6,"#C8963A");R(x+8,b.y-4,6,6,"#8a6a2a");});
}

function ui(){
  R(10,10,470,56,"rgba(26,75,132,.9)");R(10,10,470,4,GOLD);
  ctx.fillStyle="#fff";ctx.font="bold 18px Arial";
  ctx.fillText("Bs "+money,22,40);ctx.fillText("♥ "+hearts,112,40);ctx.fillText("Sellos "+sellos+"/4",182,40);ctx.fillText("Puntos "+score,300,40);
  ctx.font="11px Arial";ctx.fillStyle="#cfe";ctx.fillText("Distrito 2, El Alto · 4.050 m s.n.m.",22,58);
  let px=250,pw=[["ESCUDO",p.shield],["DOBLE SALTO",p.dj],["IMÁN",p.mag]];
  ctx.fillStyle=GOLD;ctx.font="bold 11px Arial";
  pw.forEach(([n,t])=>{if(t>0){ctx.fillText(n+" "+Math.ceil(t/60)+"s",px,58);px+=n.length*7+34;}});
  const bx=60,bw=W-120;R(bx,H-14,bw,6,"rgba(0,0,0,.45)");R(bx,H-14,bw*Math.min(1,p.x/GOAL),6,GOLD);
  STOPS.forEach((s,i)=>R(bx+bw*s.x/GOAL-3,H-19,6,15,sellosObj[i].got?"#7dff9b":"#fff"));
  R(bx+bw*5400/GOAL-3,H-19,6,15,boss.alive?MAG:"#7dff9b");
  if(boss.alive&&boss.active){R(W-190,14,172,22,"#30243D");R(W-186,18,(boss.hp/boss.max)*164,14,"#FF586E");}
}

// Burbuja de Tilcayo: NO detiene el juego, desaparece sola
function bubble(){
  if(!bub)return;
  const a=Math.min(1,bub.t/20,(bub.max-bub.t)/15+.2);
  ctx.globalAlpha=Math.max(0,a);
  ctx.font="bold 16px Arial";
  const w=Math.min(620,ctx.measureText(bub.txt).width+90),x=W/2-w/2,y=78;
  R(x,y,w,44,"rgba(15,30,60,.92)");R(x,y,w,3,GOLD);R(x,y+41,w,3,MAG);
  R(x+8,y+8,26,26,"#F5A64D");R(x+6,y+4,8,10,"#E68A35");R(x+28,y+4,8,10,"#E68A35");R(x+14,y+16,3,5,"#30243D");R(x+25,y+16,3,5,"#30243D");R(x+18,y+24,6,3,"#E97D9A");
  ctx.fillStyle="#fff";ctx.fillText(bub.txt,x+46,y+28);
  ctx.globalAlpha=1;
}

function overlay(t,sub,lines,cta){
  R(0,0,W,H,"rgba(10,25,55,.9)");
  ctx.textAlign="center";ctx.fillStyle=GOLD;ctx.font="bold 42px Arial";ctx.fillText(t,W/2,120);
  ctx.fillStyle="#fff";ctx.font="bold 19px Arial";ctx.fillText(sub,W/2,158);
  ctx.font="17px Arial";lines.forEach((l,i)=>ctx.fillText(l,W/2,215+i*28));
  ctx.fillStyle=Math.floor(Date.now()/500)%2?MAG:"#ff8fb0";ctx.font="bold 20px Arial";ctx.fillText(cta,W/2,445);
  ctx.textAlign="left";
}

function draw(){
  ctx.save();
  if(shake>0)ctx.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
  bg();ground();
  STOPS.forEach((s,i)=>landmark(i,s.x));
  goal();drawWorld();
  foes&&foes.forEach(drawFoe);cars&&cars.forEach(drawCar);drawBoss();cat();
  parts&&parts.forEach(q=>{ctx.globalAlpha=Math.max(0,q.l/45);R(q.x-cam,q.y,q.s,q.s,q.c);});ctx.globalAlpha=1;
  ctx.restore();
  if(st!=="menu"){ui();bubble();}
  frame+=st==="menu"?1:0;
  if(st==="menu")overlay("TILCAYO","La Odisea del Distrito 2 · El Alto, Bolivia",LORE.concat(["","Salta con SALTAR. Pisa a los enemigos. Junta 4 sellos."]),"Toca la pantalla para jugar");
  if(st==="win")overlay("¡LLEGASTE A LA OTRA RUTA!","Pase Dorado del Altiplano ganado",
    ["Sellos: "+sellos+"/4  |  Bs "+money+"  |  Puntos "+score,"La Chacana brilla otra vez sobre El Alto.","Tilcayo sigue su viaje hacia el siguiente distrito."],"Toca para jugar de nuevo");
  if(st==="lost")overlay("SIN CORAZONES","Los autos y los chorros ganaron esta vez",["Tilcayo se sacude el polvo y lo intenta otra vez."],"Toca para reintentar");
}

let last=0,acc=0;const STEP=1000/60;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=STEP){update();acc-=STEP;}
  draw();requestAnimationFrame(loop);
}
start();st="menu";msgs=[];bub=null;
requestAnimationFrame(loop);
