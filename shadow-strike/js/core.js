(function(g){
'use strict';
const KEY='shadowstrike.save.v1',MAXL=1e7,S={ok:true};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d,a,b)=>{v=Number(v);return Number.isFinite(v)?clamp(v,a,b):d};
const rng=s=>()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const WEAPONS={
fists:{name:'Fists',dmg:1,range:50,speed:1,cost:0,len:0,color:'#e5e7eb'},
sword:{name:'Sword',dmg:1.3,range:72,speed:.95,cost:150,len:62,color:'#67e8f9'},
blades:{name:'Dual Blades',dmg:.9,range:58,speed:1.35,cost:320,len:42,color:'#f0abfc'},
staff:{name:'Staff',dmg:1.1,range:95,speed:.9,cost:520,len:105,color:'#fcd34d'},
spear:{name:'Spear',dmg:1.35,range:115,speed:.85,cost:800,len:125,color:'#fb923c'},
hammer:{name:'War Hammer',dmg:2,range:68,speed:.62,cost:1200,len:72,color:'#f87171'}};
const UPG={hp:{name:'Vitality',desc:'+12% max health per level',max:40},dmg:{name:'Power',desc:'+10% damage per level',max:40},def:{name:'Iron Skin',desc:'Reduces damage taken (8% per level, diminishing)',max:40},eng:{name:'Focus',desc:'+12% special energy gain per level',max:40}};
const ARCH=[
{id:'agile',name:'Agile Martial Artist',hp:.85,dmg:.9,spd:1.2,reach:50,aggr:1.1,def:.8,wsp:1.15,w:{punch:5,kick:4,heavy:1},weapon:'fists',color:'#22d3ee'},
{id:'brawler',name:'Heavy Brawler',hp:1.4,dmg:1.25,spd:.8,reach:55,aggr:.95,def:.7,wsp:.8,w:{punch:2,kick:2,heavy:5},weapon:'hammer',color:'#fb923c'},
{id:'guard',name:'Defensive Warrior',hp:1.2,dmg:.9,spd:.9,reach:60,aggr:.75,def:1.6,wsp:1,w:{punch:3,kick:3,heavy:2},weapon:'sword',color:'#a78bfa'},
{id:'counter',name:'Counterattacker',hp:1,dmg:1.1,spd:1,reach:60,aggr:.8,def:1.3,wsp:1.1,counter:1,w:{punch:3,kick:4,heavy:2},weapon:'blades',color:'#f472b6'},
{id:'spear',name:'Spear Fighter',hp:1,dmg:1.1,spd:.95,reach:115,aggr:.9,def:.9,wsp:.9,w:{punch:4,kick:1,heavy:3},weapon:'spear',color:'#fbbf24'},
{id:'sword',name:'Sword Duelist',hp:1.1,dmg:1.15,spd:1.05,reach:72,aggr:1,def:1.1,wsp:1,w:{punch:4,kick:2,heavy:3},weapon:'sword',color:'#67e8f9'},
{id:'dual',name:'Dual-Blade Dancer',hp:.9,dmg:.85,spd:1.25,reach:58,aggr:1.2,def:.9,wsp:1.4,combo:.5,w:{punch:6,kick:3,heavy:1},weapon:'blades',color:'#e879f9'},
{id:'acro',name:'Shadow Acrobat',hp:.9,dmg:1,spd:1.3,reach:55,aggr:1.1,def:1,wsp:1.2,jump:1,w:{punch:3,kick:5,heavy:2},weapon:'fists',color:'#34d399'},
{id:'elite',name:'Elite Shadow Warrior',hp:1.3,dmg:1.2,spd:1.15,reach:80,aggr:1.15,def:1.3,wsp:1.15,combo:.4,w:{punch:3,kick:3,heavy:3,special:1},weapon:'staff',color:'#f43f5e'}];
const MODS=[{tag:'Swift',spd:1.18,wsp:1.12},{tag:'Armored',hp:1.25,def:.12},{tag:'Savage',dmg:1.2},{tag:'Relentless',aggr:.12,combo:.3},{tag:'Vampiric',leech:.2},{tag:'Iron Will',hp:1.15,def:.1,react:.9}];
const BOSS=['Shadow Lord','Crimson Sovereign','Void Tyrant','Frost Warden','Ember King','Night Emperor'];
function levelConfig(n){
n=Math.floor(num(n,1,1,MAXL));
const r=rng(n*7919+17),boss=n%10===0;
const pool=boss?ARCH:ARCH.slice(0,Math.min(ARCH.length,1+Math.floor(n/2)));
const a=pool[Math.floor(r()*pool.length)];
const k=n>=5?Math.min(MODS.length,Math.floor(Math.log2(n/3+1))+(boss?1:0)):0;
const mods=MODS.map(m=>[r(),m]).sort((x,y)=>x[0]-y[0]).slice(0,k).map(x=>x[1]);
let hp=(55+6*Math.pow(n,.75))*a.hp*(boss?2.2:1),dmg=(5+.35*Math.pow(n,.6))*a.dmg*(boss?1.25:1),spd=150*a.spd,
aggr=a.aggr*(.3+.6*(1-Math.exp(-n/70))),def=a.def*(.05+.5*(1-Math.exp(-n/120))),wsp=a.wsp,react=.65*Math.exp(-n/90)+.14,combo=a.combo||0,leech=0;
for(const m of mods){hp*=m.hp||1;dmg*=m.dmg||1;spd*=m.spd||1;wsp*=m.wsp||1;aggr+=m.aggr||0;def+=m.def||0;combo+=m.combo||0;react*=m.react||1;leech+=m.leech||0}
const w=Object.assign({},a.w);if(boss)w.special=(w.special||0)+1;
hp=Math.round(clamp(hp,40,6000));dmg=+clamp(dmg,3,14).toFixed(2);aggr=clamp(aggr,.2,.95);def=clamp(def,0,.75);
return{level:n,boss,name:boss?BOSS[Math.floor(n/10)%BOSS.length]+' · '+a.name:a.name,arch:a.id,mods:mods.map(m=>m.tag),hp,dmg,spd:clamp(spd,100,300),wsp:clamp(wsp,.6,1.6),aggr,def,react:clamp(react,.12,.8),combo:clamp(combo,0,.8),leech:clamp(leech,0,.4),reach:a.reach,w,weapon:a.weapon,color:a.color,jump:!!a.jump,counter:!!a.counter,enr:boss||a.id==='elite'?12:0,
reward:Math.floor(clamp((18+5*Math.pow(n,.7))*(boss?3:1),1,1e6)),rating:Math.round(10*Math.log2(1+hp*dmg*(1+aggr)*(1+def)/300)),arena:Math.floor((n-1)/5)%6}}
function playerStats(s){const w=WEAPONS[s.weapon]||WEAPONS.fists;return{hp:Math.round(100*(1+.12*s.up.hp)),dmg:(1+.1*s.up.dmg)*w.dmg,take:1/(1+.08*s.up.def),eng:1+.12*s.up.eng}}
const upgradeCost=lv=>Math.floor(clamp(40*Math.pow(1.3,lv),1,1e9));
const defSave=()=>({v:1,level:1,best:0,coins:0,owned:['fists'],weapon:'fists',up:{hp:0,dmg:0,def:0,eng:0},st:{wins:0,losses:0,kills:0,boss:0,top:0,earned:0,time:0,wuse:{}},set:{music:.5,sfx:.8,mute:false,reduce:false,touch:false}});
function sanitize(o){
const d=defSave();if(!o||typeof o!=='object')return d;
d.best=Math.floor(num(o.best,0,0,MAXL));d.level=Math.min(Math.floor(num(o.level,1,1,MAXL)),d.best+1);d.coins=Math.floor(num(o.coins,0,0,1e12));
const ow=Array.isArray(o.owned)?o.owned.filter(k=>WEAPONS[k]):[];d.owned=[...new Set(['fists',...ow])];d.weapon=d.owned.includes(o.weapon)?o.weapon:'fists';
for(const k in UPG)d.up[k]=Math.floor(num(o.up&&o.up[k],0,0,UPG[k].max));
const s=o.st&&typeof o.st==='object'?o.st:{};for(const k of['wins','losses','kills','boss','top','earned','time'])d.st[k]=Math.floor(num(s[k],0,0,1e12));
if(s.wuse&&typeof s.wuse==='object')for(const k in WEAPONS)d.st.wuse[k]=Math.floor(num(s.wuse[k],0,0,1e9));
const t=o.set&&typeof o.set==='object'?o.set:{};d.set.music=num(t.music,.5,0,1);d.set.sfx=num(t.sfx,.8,0,1);d.set.mute=!!t.mute;d.set.reduce=!!t.reduce;d.set.touch=!!t.touch;
return d}
function load(){try{const r=g.localStorage.getItem(KEY);S.ok=true;return r?sanitize(JSON.parse(r)):defSave()}catch(e){S.ok=false;return defSave()}}
function persist(s){try{g.localStorage.setItem(KEY,JSON.stringify(s));S.ok=true}catch(e){S.ok=false}return S.ok}
const exportSave=s=>JSON.stringify(s);
function importSave(t){try{const o=JSON.parse(t);if(!o||typeof o!=='object'||Array.isArray(o)||typeof o.v!=='number')return null;return sanitize(o)}catch(e){return null}}
g.SS={WEAPONS,UPG,ARCH,MODS,MAXL,state:S,clamp,num,rng,levelConfig,playerStats,upgradeCost,defSave,sanitize,load,persist,exportSave,importSave};
})(typeof window!=='undefined'?window:globalThis);
