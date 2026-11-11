"use strict";
// ============================================================
// TILCAYO · Configuración y conexión con Supabase
// ------------------------------------------------------------
// 1) Crea las tablas ejecutando supabase_setup.sql en el SQL Editor.
// 2) En Supabase: Project Settings → API (o "API Keys"):
//      - Project URL            → SUPABASE_URL
//      - anon / publishable key → SUPABASE_ANON_KEY
//    (usa SOLO la clave pública. NUNCA pongas la service_role key aquí.)
// 3) En tu HTML carga este archivo ANTES de game.js:
//      <script src="Config.js"></script>
//      <script src="game.js"></script>
// ============================================================
window.TILCAYO_CONFIG={
  SUPABASE_URL:"https://zueoceniwkadhblwbizc.supabase.co",
  SUPABASE_ANON_KEY:"sb_publishable_GdcZZ_dOV4wNM2p_RFvVRQ_v2lv4MWV",
  TABLE:"scores",       // nombre de la tabla de puntajes
  TOP_N:10,             // cuántos puestos muestra el Salón de Trofeos (máx. 10)
  TIMEOUT_MS:8000,      // tiempo máximo de espera por petición
  GAME_VERSION:"v4"
};

// Cliente mínimo (sin librerías): habla con la API REST de Supabase (PostgREST).
window.TilcayoDB=(function(){
  const C=window.TILCAYO_CONFIG;

  // Solo se activa si ya pegaste tu URL y tu clave reales.
  function enabled(){
    const u=String(C.SUPABASE_URL||""),k=String(C.SUPABASE_ANON_KEY||"");
    return /^https:\/\//i.test(u)&&!/TU-PROYECTO/i.test(u)&&k.length>20&&!/^TU_/.test(k);
  }
  function endpoint(){return String(C.SUPABASE_URL).replace(/\/+$/,"")+"/rest/v1/"+C.TABLE;}
  function headers(extra){
    const k=C.SUPABASE_ANON_KEY,h={apikey:k,"Content-Type":"application/json"};
    // Las claves nuevas "sb_publishable_..." no son JWT: solo van en apikey.
    if(!/^sb_/.test(k))h.Authorization="Bearer "+k;
    return Object.assign(h,extra||{});
  }
  async function req(url,opts){
    const ctl=typeof AbortController!=="undefined"?new AbortController():null;
    const timer=ctl?setTimeout(()=>ctl.abort(),C.TIMEOUT_MS||8000):0;
    try{
      return await fetch(url,Object.assign({signal:ctl?ctl.signal:undefined},opts));
    }finally{clearTimeout(timer);}
  }
  const int=(v,max)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));

  // Top de mejores puntajes → {ok:true, rows:[...]} | {ok:false, error}
  async function getTop(limit){
    if(!enabled())return{ok:false,error:"Supabase no configurado"};
    const n=int(limit||C.TOP_N||10,50)||10;
    const q="?select=player_name,score,sellos,coins,time_seconds,won,created_at"
           +"&order=score.desc,created_at.asc&limit="+n;
    try{
      const r=await req(endpoint()+q,{method:"GET",headers:headers()});
      if(!r.ok)return{ok:false,error:"HTTP "+r.status};
      return{ok:true,rows:await r.json()};
    }catch(e){return{ok:false,error:String(e&&e.message||e)};}
  }

  // Guarda un puntaje → {ok:true} | {ok:false, error}
  async function submitScore(e){
    if(!enabled())return{ok:false,error:"Supabase no configurado"};
    const body={
      player_name:String(e.name||"").replace(/\s+/g," ").trim().slice(0,16),
      score:int(e.score,100000),
      sellos:int(e.sellos,4),
      coins:int(e.coins,5000),
      time_seconds:int(e.time,36000),
      won:!!e.won,
      game_version:C.GAME_VERSION||null
    };
    if(!body.player_name)return{ok:false,error:"Nombre vacío"};
    try{
      const r=await req(endpoint(),{method:"POST",headers:headers({Prefer:"return=minimal"}),body:JSON.stringify(body)});
      if(!r.ok)return{ok:false,error:"HTTP "+r.status};
      return{ok:true};
    }catch(err){return{ok:false,error:String(err&&err.message||err)};}
  }

  return{enabled,getTop,submitScore};
})();
