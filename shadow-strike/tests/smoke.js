const assert=require('assert');
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='then'?undefined:stub(),apply:()=>stub(),set:()=>true});
const L={},store={};let raf=null;
const on=(n,f)=>{(L[n]=L[n]||[]).push(f)};
const doc=new Proxy({addEventListener:on,hidden:false,getElementById:()=>stub(),createElement:()=>stub(),querySelectorAll:()=>[]},{get:(t,k)=>k in t?t[k]:stub(),set:(t,k,v)=>{t[k]=v;return true}});
Object.assign(globalThis,{window:globalThis,document:doc,location:{search:'?dev=1'},addEventListener:on,requestAnimationFrame:f=>{raf=f;return 1},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}}});
require('../js/core.js');require('../js/game.js');
let ts=0;const frame=()=>{ts+=16.7;const f=raf;raf=null;f(ts)};
for(let i=0;i<30;i++)frame();
assert.strictEqual(SSDev.peek().state,'menu');
SSDev.play(1);assert.strictEqual(SSDev.peek().state,'fight');
let minE=1e9,blocked=0,sawStun=false,errs=0;
const key=(code,t)=>{(L.keydown||[]).forEach(f=>f({code,preventDefault(){},repeat:false}));if(t)(L.keyup||[]).forEach(f=>f({code}))};
for(let i=0;i<9000;i++){
 const{state,pl,en}=SSDev.peek();
 if(state!=='fight')break;
 const dx=Math.abs(en.x-pl.x);
 if(i%8===0){if(dx>95){key('KeyD')}else{(L.keyup||[]).forEach(f=>f({code:'KeyD'}));key(['KeyJ','KeyK','KeyL','KeyE'][i/8%4|0])}}
 
 if(i%200===0)key('ShiftLeft',1);if(i%310===0)key('KeyW',1);
 frame();
 for(const f of[pl,en])for(const k of['x','y','hp','vx','vy','en'])assert(Number.isFinite(f[k]),'NaN '+k);
 minE=Math.min(minE,en.hp);if(pl.stun>0)sawStun=true;
}
const end=SSDev.peek();
assert(minE<end.cfg.hp,'player attacks never damaged the enemy (hit detection broken)');
console.log('smoke ok: state='+end.state+' enemyHP='+Math.round(end.en.hp)+'/'+end.cfg.hp+' playerHP='+Math.round(end.pl.hp));
SSDev.play(25);for(let i=0;i<1500;i++){frame();const q=SSDev.peek();if(q.state!=='fight')break}
const q25=SSDev.peek();assert(q25.pl.hp<q25.pl.max,'level-25 enemy never damaged a passive player (enemy AI broken)');console.log('enemy AI ok: passive player HP '+Math.round(q25.pl.hp)+'/'+q25.pl.max+' state='+q25.state);
SSDev.play(1e7);for(let i=0;i<300;i++)frame();
console.log('sim',JSON.stringify(SSDev.sim(1,300000)));
process.exit(0);
