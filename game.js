"use strict";
// TILCAYO: LA ODISEA DEL DISTRITO 2 (El Alto, 4.050 m s.n.m.)
const cv=document.getElementById("c"),ctx=cv.getContext("2d");
const W=960,H=540,GY=450,LW=5700,GOAL=5450,G=0.55;
const BLUE="#1A4B84",GOLD="#F4C430",MAG="#E03A65",STEEL="#708090";

const STOPS=[
 {x:800,name:"Plaza del Minero",pages:[
  "Esta es la Plaza del Minero, en Villa Santiago II. El monumento recuerda a las familias mineras que fundaron el distrito.",
  "Dato útil: casi no hay señalización turística. Usa Google Maps y pregunta al chofer por la ruta que pasa por el Puente Bolivia."]},
 {x:2000,name:"Chacana: El Ojo del Universo",pages:[
  "La Chacana es una cruz andina escalonada. Los antiguos la veían como un puente entre mundos.",
  "Para llegar desde la Plaza toma un taxi o radio taxi: cuesta entre Bs 10 y 25. Las visitas se coordinan con anticipación."]},
 {x:3200,name:"Entrada Folklórica Villa Santiago II",pages:[
  "¡Música! Aquí baila el Apóstol Santiago con mineritos, polleras y bandas de bronce.",
  "En fiestas y ferias hay aglomeración y también hurtos. Lleva la mochila adelante y no muestres el celular. Hay q'ochalas con platos de Bs 30 a 60."]},
 {x:4400,name:"Planta Industrial La Francesa",pages:[
  "Esta es La Francesa, parte del polo industrial del distrito. El turismo industrial es una oportunidad: hay degustación en tiendas de fábrica.",
  "Ojo: las visitas a plantas requieren permiso. Coordina antes de ir."]}
];
// calles con autos: [desde, hasta, velocidad]
const CARS=[[300,560,2.2],[1250,1560,2.6],[2500,2820,2.5],[3700,4020,2.9],[4800,5150,3.1]];
// chorros: [x, min, max]
const THIEVES=[[1050,900,1250],[2350,2100,2450],[3450,3300,3650],[4600,4450,4750],[5300,5200,5400]];
const PLATS=[[450,350,120],[1400,340,120],[2650,340,120],[3850,340,120],[4950,340,120]];

let st="menu",frame=0,cam=0,coins,cars,thieves,hearts,sellos,money,cp,msg="",msgT=0,dlg=[],flags={},jp=false,shake=0;
const keys={},inp={l:0,r:0,j:0};
const p={x:60,y:GY-38,w:34,h:38,vy:0,face:1,gr:true,coy:0,inv:0,anim:0};

function say(pages){dlg=dlg.concat(pages);if(st==="play")st="talk";}
function adv(){
  if(st==="menu"){start();return;}
  if(st==="win"||st==="lost"){start();return;}
  if(st==="talk"){dlg.shift();if(!dlg.length)st="play";}
}
function toast(t){msg=t;msgT=140;}

function start(){
  coins=[];
  for(let x=200;x<GOAL-50;x+=95){
    const inCar=CARS.some(c=>x>c[0]-40&&x<c[1]+40);
    const nearStop=STOPS.some(s=>Math.abs(x-s.x)<70);
    if(!nearStop)coins.push({x,y:inCar?GY-125:GY-26,got:false});
  }
  PLATS.forEach(q=>{for(let i=0;i<3;i++)coins.push({x:q[0]+25+i*35,y:q[1]-26,got:false});});
  cars=CARS.map((c,i)=>({x:c[0]+i*40,y:GY-32,w:78,h:32,vx:c[2],min:c[0],max:c[1],col:["#E03A65","#F4C430","#fff","#2a9d8f","#ff7b00"][i%5]}));
  thieves=THIEVES.map(t=>({x:t[0],min:t[1],max:t[2],dir:-1,mode:0,alive:true,w:30,h:46,t:0}));
  STOPS.forEach(s=>s.done=false);
  hearts=3;sellos=0;money=0;cp=60;flags={};dlg=[];
  p.x=60;p.y=GY-38;p.vy=0;p.inv=60;cam=0;frame=0;st="play";
  say(["¡Hola! Soy Tilcayo, el gato andino. Te guío por el Distrito 2 de El Alto, a 4.050 metros de altura.",
       "Misión: visita 4 paradas, junta sus sellos y llega al paradero de la otra ruta. Cuidado con los autos y con los chorros."]);
}

// ---------- entrada ----------
function press(k){
  if(k==="j"){ if(st==="play"){jp=true;} else adv(); }
}
addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(["Space","ArrowUp","KeyW"].includes(e.code)&&!e.repeat){e.preventDefault();press("j");}
  if(e.code==="Enter"&&!e.repeat)adv();
});
addEventListener("keyup",e=>keys[e.code]=false);
function bind(id,key){
  const el=document.getElementById(id);
  const on=e=>{e.preventDefault();inp[key]=1;el.classList.add("on");if(key==="j")press("j");};
  const off=e=>{e.preventDefault();inp[key]=0;el.classList.remove("on");};
  el.addEventListener("pointerdown",on);
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,off));
}
bind("bl","l");bind("br","r");bind("bj","j");
cv.addEventListener("pointerdown",e=>{e.preventDefault();if(st!=="play")adv();});
document.addEventListener("contextmenu",e=>e.preventDefault());
addEventListener("blur",()=>{inp.l=inp.r=inp.j=0;});

// ---------- lógica ----------
function hurtbox(){return{x:p.x+5,y:p.y+5,w:p.w-10,h:p.h-5};}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

function damage(){
  if(p.inv>0)return;
  hearts--;shake=12;
  if(hearts<=0){st="lost";return;}
  p.x=Math.max(0,cp);p.y=GY-38;p.vy=0;p.inv=120;
  toast("¡Auch! Vuelves a la última parada");
  if(!flags.hurt){flags.hurt=1;say(["Inseguridad vial: en El Alto los autos no siempre frenan. Cruza solo cuando el auto pase y salta por encima. Mejor usa las cebras."]);}
}

function update(){
  if(st!=="play"){jp=false;return;}
  frame++;
  const dir=((inp.r||keys.ArrowRight||keys.KeyD)?1:0)-((inp.l||keys.ArrowLeft||keys.KeyA)?1:0);
  if(dir){p.face=dir;p.anim++;p.x+=dir*3.3;}
  p.x=Math.max(0,Math.min(LW-p.w,p.x));
  if(p.gr)p.coy=7;else if(p.coy>0)p.coy--;
  if(jp&&p.coy>0){p.vy=-12.4;p.gr=false;p.coy=0;}
  jp=false;
  const held=inp.j||keys.Space||keys.ArrowUp||keys.KeyW;
  if(!held&&p.vy<-4.5)p.vy=-4.5;
  const prev=p.y+p.h;
  p.vy=Math.min(p.vy+G,13);p.y+=p.vy;p.gr=false;
  if(p.y+p.h>=GY){p.y=GY-p.h;p.vy=0;p.gr=true;}
  PLATS.forEach(q=>{
    if(p.vy>=0&&prev<=q[1]+1&&p.y+p.h>=q[1]&&p.x+p.w>q[0]&&p.x<q[0]+q[2]){p.y=q[1]-p.h;p.vy=0;p.gr=true;}
  });
  if(p.inv>0)p.inv--;
  const hb=hurtbox();

  cars.forEach(c=>{
    c.x+=c.vx;if(c.x<c.min||c.x+c.w>c.max+c.w){c.vx*=-1;c.x+=c.vx;}
    if(hit(hb,c)){damage();}
    if(!flags.car&&Math.abs(c.x-p.x)<420&&c.min-p.x<420&&p.x>c.min-300&&p.x<c.max){flags.car=1;say(["¡Mira ese auto! Calles sin semáforo: espera el momento y salta."]);}
  });

  thieves.forEach(t=>{
    if(!t.alive)return;
    t.t++;
    const near=Math.abs(p.x-t.x)<300&&Math.abs(p.y-(GY-t.h))<120;
    if(t.mode===0){
      if(near&&p.x>t.min-50&&p.x<t.max+80)t.dir=p.x>t.x?1:-1;
      t.x+=t.dir*(near?1.9:1);
      if(t.x<t.min){t.x=t.min;t.dir=1;}if(t.x>t.max){t.x=t.max;t.dir=-1;}
      if(!flags.thief&&near){flags.thief=1;say(["¡Cuidado, un chorro! Si te toca te roba monedas. Písalo desde arriba o esquívalo."]);}
    }else{t.x+=t.dir*4.2;if(Math.abs(t.x-p.x)>800)t.alive=false;}
    if(t.mode===0&&t.alive){
      const box={x:t.x,y:GY-t.h,w:t.w,h:t.h};
      if(hit(hb,box)){
        if(p.vy>0&&prev<=GY-t.h+16){t.alive=false;p.vy=-8;money+=5;toast("¡Atrapaste al chorro! +5 Bs");}
        else if(p.inv===0){
          const lost=Math.ceil(money/2);money-=lost;t.mode=1;t.dir=p.x>t.x?-1:1;p.inv=90;shake=10;
          toast(lost?("¡Te robaron "+lost+" Bs!"):"¡Casi te roban! Cuida tus cosas");
        }
      }
    }
  });

  coins.forEach(c=>{
    if(!c.got&&Math.hypot(p.x+17-c.x,p.y+19-c.y)<28){c.got=true;money++;}
  });

  STOPS.forEach((s,i)=>{
    if(!s.done&&p.x>s.x-80){
      s.done=true;sellos++;cp=s.x-120;
      toast("¡Sello "+sellos+"/4: "+s.name+"!");
      say(["Parada "+(i+1)+": "+s.name].concat(s.pages));
    }
  });

  if(p.x+p.w>=GOAL){
    st="win";
    dlg=[];
  }
  if(msgT>0)msgT--;if(shake>0)shake--;
  cam+=((p.x-W*0.4)-cam)*0.12;cam=Math.max(0,Math.min(LW-W,cam));
}

// ---------- dibujo ----------
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function par(f,per,fn){const off=cam*f,a=Math.floor(off/per)-1;for(let i=a;i<a+Math.ceil(W/per)+3;i++)fn(i*per-off,i);}
function hs(n){const s=Math.sin(n*127.1+311.7)*43758.5;return s-Math.floor(s);}

function bg(){
  const g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,"#3b82c4");g.addColorStop(1,"#d9f0ff");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  R(0,0,0,0,"#000");
  ctx.fillStyle="#fff";ctx.globalAlpha=.8;
  par(.1,420,(x,i)=>{R(x+hs(i)*100,60+hs(i+3)*80,90,16,"#fff");R(x+20+hs(i)*100,48+hs(i+3)*80,50,16,"#fff");});
  ctx.globalAlpha=1;
  // Illimani
  par(.06,900,(x,i)=>{
    ctx.fillStyle="#6f8fb8";ctx.beginPath();ctx.moveTo(x,GY);ctx.lineTo(x+300,190);ctx.lineTo(x+450,260);ctx.lineTo(x+620,150);ctx.lineTo(x+900,GY);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(x+560,190);ctx.lineTo(x+620,150);ctx.lineTo(x+685,200);ctx.lineTo(x+620,185);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+265,225);ctx.lineTo(x+300,190);ctx.lineTo(x+340,230);ctx.lineTo(x+300,220);ctx.fill();
  });
  // edificios de ladrillo alteños
  par(.3,230,(x,i)=>{
    const h=110+hs(i+7)*110;
    R(x,GY-h,150,h,"#b5533c");R(x,GY-h,150,8,"#8a3a28");
    for(let yy=GY-h+24;yy<GY-30;yy+=42)for(let xx=x+14;xx<x+130;xx+=44)R(xx,yy,22,24,hs(i+xx)<.3?GOLD:"#27406b");
  });
}

function ground(){
  R(0,GY,W,H-GY,"#4a5360");
  R(0,GY,W,10,"#9aa3ad");
  par(1,80,x=>R(x,GY+36,40,5,GOLD));
  CARS.forEach(c=>{
    const x0=c[0]-cam,w=c[1]-c[0]+80;
    if(x0>W||x0+w<0)return;
    for(let i=0;i<w;i+=22)R(x0+i,GY+10,12,H-GY-10,"rgba(255,255,255,.55)");
  });
}

function landmark(i,x){
  const bx=x-cam;if(bx<-300||bx>W+300)return;
  if(i===0){ // Plaza del Minero
    R(bx-110,GY-30,220,30,"#8d8f98");R(bx-60,GY-60,120,30,"#a2a4ad");
    R(bx-22,GY-170,44,110,"#b8793c");R(bx-34,GY-130,12,50,"#b8793c");R(bx+22,GY-130,12,50,"#b8793c");
    R(bx-16,GY-200,32,32,"#c98a4b");R(bx-24,GY-208,48,8,GOLD);R(bx+30,GY-150,8,70,"#6b4a2b");R(bx+26,GY-158,22,10,"#555");
  }
  if(i===1){ // Chacana
    R(bx-140,GY-14,280,14,"#9a9588");R(bx-110,GY-28,220,14,"#aaa597");
    R(bx-80,GY-42,160,14,"#bdb8a9");
    const gl=.5+Math.sin(frame*.07)*.3;
    [[-22,-150,44,110],[-60,-110,120,44]].forEach(r=>R(bx+r[0],GY+r[1],r[2],r[3],"#c9c3b0"));
    R(bx-34,GY-170,68,16,"#c9c3b0");R(bx-34,GY-60,68,18,"#c9c3b0");
    ctx.globalAlpha=gl;R(bx-4,GY-150,8,110,GOLD);R(bx-60,GY-92,120,8,GOLD);ctx.globalAlpha=1;
    R(bx-4,GY-96,8,16,MAG);
    [-120,-90,90,120].forEach(o=>{R(bx+o,GY-44,16,16,MAG);R(bx+o+4,GY-52,8,10,GOLD);});
  }
  if(i===2){ // Entrada folklórica
    R(bx-200,GY-230,400,6,"#fff");
    for(let k=-200;k<200;k+=40){R(bx+k,GY-224,30,34,[MAG,GOLD,BLUE,"#2a9d8f"][((k+200)/40)%4]);}
    for(let k=0;k<4;k++){
      const dx=bx-120+k*70,b=Math.abs(Math.sin(frame*.12+k))*14;
      R(dx,GY-92-b,26,56,[MAG,GOLD,"#2a9d8f",BLUE][k]);R(dx+4,GY-112-b,18,18,"#d9a27a");R(dx-6,GY-40-b,38,10,[GOLD,MAG,BLUE,"#fff"][k]);
      R(dx+2,GY-120-b,22,8,"#222");
    }
    R(bx+160,GY-70,60,70,"#c8963a");R(bx+170,GY-58,40,10,GOLD);
  }
  if(i===3){ // La Francesa
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
  R(x+60,GY-100,160,60,GOLD);R(x+70,GY-90,32,22,"#8fd3ff");R(x+110,GY-90,32,22,"#8fd3ff");R(x+150,GY-90,32,22,"#8fd3ff");
  R(x+70,GY-44,22,22,"#222");R(x+190,GY-44,22,22,"#222");
}

function cat(){
  if(p.inv>0&&Math.floor(frame/5)%2===0)return;
  const x=Math.round(p.x-cam),y=Math.round(p.y);
  ctx.save();
  if(p.face<0){ctx.translate(x+p.w,0);ctx.scale(-1,1);}else ctx.translate(x,0);
  const lg=p.gr&&(inp.l||inp.r||keys.ArrowLeft||keys.ArrowRight)&&Math.floor(p.anim/6)%2?3:0;
  // cola con anillos
  R(26,y+22,10,8,"#8e99a6");R(32,y+12,8,18,"#9aa5b1");R(32,y+16,8,3,"#2b3340");R(32,y+22,8,3,"#2b3340");
  R(3,y+18,26,18,"#aab4bf");R(3,y+4,28,22,"#b9c2cc");
  R(2,y,9,11,"#8e99a6");R(24,y,9,11,"#8e99a6");R(5,y+3,4,5,"#e9a0b0");R(27,y+3,4,5,"#e9a0b0");
  R(9,y+11,4,6,"#16202c");R(22,y+11,4,6,"#16202c");R(16,y+18,4,3,"#e97d9a");
  R(8,y+19,6,2,"#2b3340");R(22,y+19,6,2,"#2b3340");
  R(3,y+24,28,6,MAG);R(3,y+26,28,2,GOLD);          // aguayo
  R(24,y+31,7,5,"#33e8ff");                          // smartband
  R(5,y+34+lg,8,8-lg,"#d8dee5");R(22,y+34-lg,8,8+lg,"#d8dee5");
  ctx.restore();
}

function thief(t){
  if(!t.alive)return;
  const x=t.x-cam,y=GY-t.h;if(x<-60||x>W+60)return;
  const s=Math.floor(t.t/8)%2;
  R(x+5,y+14,20,22,"#222");R(x+7,y,16,16,"#d9a27a");R(x+5,y-3,20,9,"#111");R(x+7,y+6,16,4,"#111");
  R(x+10,y+9,3,3,"#fff");R(x+17,y+9,3,3,"#fff");
  R(x+(s?4:9),y+36,8,10,"#333");R(x+(s?18:13),y+36,8,10,"#333");
  R(x+(t.dir>0?22:-6),y+18,10,6,"#c8963a");
  if(t.mode===1){ctx.fillStyle=GOLD;ctx.fillRect(x+10,y-16,8,8);}
  else if(Math.abs(p.x-t.x)<300){ctx.fillStyle="#ff3b3b";ctx.font="bold 20px Arial";ctx.fillText("!",x+10,y-10);}
}

function car(c){
  const x=c.x-cam;if(x<-120||x>W+120)return;
  const y=c.y,d=c.vx>0?1:-1;
  R(x,y+8,c.w,24,c.col);R(x+(d>0?18:12),y-8,44,18,c.col);R(x+(d>0?24:18),y-4,14,12,"#8fd3ff");R(x+(d>0?42:36),y-4,14,12,"#8fd3ff");
  R(x+8,y+26,16,12,"#111");R(x+c.w-24,y+26,16,12,"#111");
  R(d>0?x+c.w-6:x,y+14,6,8,"#ffec99");
}

function ui(){
  R(10,10,430,52,"rgba(26,75,132,.88)");R(10,10,430,4,GOLD);
  ctx.fillStyle="#fff";ctx.font="bold 18px Arial";
  ctx.fillText("Bs "+money,22,38);ctx.fillText("♥ "+hearts,110,38);ctx.fillText("Sellos "+sellos+"/4",180,38);
  ctx.font="12px Arial";ctx.fillText("Altitud 4.050 m | Distrito 2, El Alto",22,55);
  ctx.font="bold 13px Arial";ctx.fillText("Distrito 2",340,38);
  // barra de ruta con paradas
  const bx=60,bw=W-120;R(bx,H-14,bw,6,"rgba(0,0,0,.45)");R(bx,H-14,bw*Math.min(1,p.x/GOAL),6,GOLD);
  STOPS.forEach(s=>R(bx+bw*s.x/GOAL-3,H-18,6,14,s.done?"#7dff9b":"#fff"));
  if(msgT>0){ctx.font="bold 17px Arial";const w=ctx.measureText(msg).width+40;R(W/2-w/2,76,w,38,"rgba(224,58,101,.92)");
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(msg,W/2,101);ctx.textAlign="left";}
}

function wrap(t,mw){const w=t.split(" ");let l="",o=[];w.forEach(x=>{const n=l?l+" "+x:x;if(ctx.measureText(n).width>mw&&l){o.push(l);l=x;}else l=n;});o.push(l);return o;}

function dialog(){
  const bx=60,by=40,bw=W-120,bh=150;
  R(bx,by,bw,bh,"rgba(15,30,60,.95)");R(bx,by,bw,5,GOLD);R(bx,by+bh-5,bw,5,MAG);
  // cara de Tilcayo
  R(bx+16,by+34,72,64,"#b9c2cc");R(bx+14,by+22,20,26,"#8e99a6");R(bx+70,by+22,20,26,"#8e99a6");
  R(bx+32,by+52,10,14,"#16202c");R(bx+62,by+52,10,14,"#16202c");R(bx+48,by+72,10,7,"#e97d9a");
  R(bx+16,by+98,72,8,MAG);R(bx+60,by+98,28,8,"#33e8ff");
  ctx.fillStyle=GOLD;ctx.font="bold 15px Arial";ctx.fillText("TILCAYO",bx+16,by+20);
  ctx.fillStyle="#fff";ctx.font="19px Arial";
  wrap(dlg[0],bw-150).slice(0,5).forEach((l,i)=>ctx.fillText(l,bx+110,by+42+i*26));
  ctx.fillStyle=GOLD;ctx.font="bold 13px Arial";ctx.textAlign="right";
  ctx.fillText(dlg.length>1?"Toca para seguir":"Toca para jugar",bx+bw-14,by+bh-14);ctx.textAlign="left";
}

function overlay(t,sub,lines){
  R(0,0,W,H,"rgba(10,25,55,.88)");
  ctx.textAlign="center";ctx.fillStyle=GOLD;ctx.font="bold 40px Arial";ctx.fillText(t,W/2,150);
  ctx.fillStyle="#fff";ctx.font="bold 20px Arial";ctx.fillText(sub,W/2,195);
  ctx.font="17px Arial";lines.forEach((l,i)=>ctx.fillText(l,W/2,250+i*28));
  ctx.fillStyle=MAG;ctx.font="bold 20px Arial";ctx.fillText(frame%2?"Toca la pantalla para jugar":"Toca la pantalla para jugar",W/2,430);
  ctx.textAlign="left";
}

function draw(){
  ctx.save();
  if(shake>0)ctx.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
  bg();ground();
  STOPS.forEach((s,i)=>landmark(i,s.x));
  goal();
  PLATS.forEach(q=>{const x=q[0]-cam;R(x,q[1],q[2],16,"#c8963a");R(x,q[1],q[2],5,GOLD);});
  coins&&coins.forEach(c=>{if(c.got)return;const x=c.x-cam;if(x<-20||x>W+20)return;
    const w=4+Math.abs(Math.sin(frame*.07+c.x))*6;R(x-w,c.y-10,w*2,20,"#b87816");R(x-w+2,c.y-10,w*2-4,20,GOLD);});
  thieves&&thieves.forEach(thief);
  cars&&cars.forEach(car);
  cat();
  ctx.restore();
  if(st!=="menu")ui();
  if(st==="talk")dialog();
  if(st==="menu"){frame++;overlay("TILCAYO","La Odisea del Distrito 2 · El Alto, Bolivia",
    ["Recorre 4 paradas: Plaza del Minero, Chacana,","Entrada Folklórica y Planta La Francesa.","Esquiva autos y chorros. Llega al paradero de la otra ruta."]);}
  if(st==="win")overlay("¡LLEGASTE A LA OTRA RUTA!","Pase Dorado del Altiplano ganado",
    ["Sellos: "+sellos+"/4   |   Monedas: Bs "+money,"Tilcayo: recuerda, retorna al teleférico antes del anochecer.","Próximo destino: otro distrito de El Alto."]);
  if(st==="lost")overlay("SIN CORAZONES","Los autos y los chorros ganaron esta vez",["Tilcayo: tranquilo, a todos nos pasa. Inténtalo de nuevo."]);
}

let last=0,acc=0;const STEP=1000/60;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=STEP){update();acc-=STEP;}
  draw();requestAnimationFrame(loop);
}
start();st="menu";
requestAnimationFrame(loop);
