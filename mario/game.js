(()=>{
'use strict';
const TITLE='MARIO',TS=16,VH=192,ROWS=12;
const PHY={g:900,run:120,acc:700,air:450,fric:800,jump:-340,cut:-110,fall:420,coyote:.1,buffer:.1,bounce:-220,step:1/120};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),cx=cv.getContext('2d'),stage=$('#stage'),pvc=$('#pv').getContext('2d');
const NAMES=['Sunny Meadow','Crystal Caverns','Sky Fortress'];
const TH=[
{s:['#5c94fc','#a8d8ff'],g:'#c84c0c',t:'#38b838',b:'#b8541c',st:'#8c8c9c',p:'#18a018'},
{s:['#0c0c24','#2a1a4a'],g:'#4a3a6a',t:'#7a5aaa',b:'#6a4a8a',st:'#5a5a8a',p:'#2a8a8a'},
{s:['#1a2a6a','#f08a5a'],g:'#6a6a8a',t:'#aaaacc',b:'#a04a3a',st:'#7a7a9a',p:'#3a9a6a'}];
const SZ={g:[14,14,1,2],k:[14,14,1,2],f:[14,12,1,2],c:[10,14,3,1],S:[12,8,2,8],m:[32,8,0,0],K:[8,24,4,-8],F:[4,112,6,0],u:[14,14,1,2]};
const MAP={'#':7,B:2,'?':3,M:4};
function build(w,theme,par,fn){
const T=Array.from({length:ROWS},()=>new Uint8Array(w)),E=[];
fn({
G:(a,b)=>{for(let c=a;c<=b;c++)T[10][c]=T[11][c]=1},
R:(x,y,s)=>{[...s].forEach((h,i)=>{if(MAP[h])T[y][x+i]=MAP[h]})},
P:(x,h)=>{for(let r=10-h;r<10;r++)T[r][x]=T[r][x+1]=6},
St:(x,n)=>{for(let i=0;i<n;i++)for(let r=9-i;r<10;r++)T[r][x+i]=7},
Ce:()=>{for(let c=0;c<w;c++)T[0][c]=T[1][c]=7},
E:(t,x,y,r)=>E.push({t,x:x*TS,y:y*TS,r:(r||0)*TS}),
C:(x,y,n)=>{for(let i=0;i<(n||1);i++)E.push({t:'c',x:(x+i)*TS,y:y*TS})}});
return{T,E,w,theme,par}}
const LV=[
build(120,0,90,a=>{
a.G(0,30);a.G(34,60);a.G(64,90);a.G(94,119);
a.R(12,7,'?');a.R(15,7,'B?M?B');a.P(24,2);a.P(40,3);a.P(52,2);
a.R(36,7,'B?B');a.R(56,7,'B?B');a.R(70,7,'?B?B?');a.R(78,7,'BBB');a.St(100,5);
[22,38,44,56,78,82,108].forEach(x=>a.E('g',x,9));[70,98].forEach(x=>a.E('k',x,9));
a.E('K',66,9);a.E('F',112,3);
a.C(18,5,3);a.C(31,7,3);a.C(61,7,3);a.C(91,7,3);a.C(36,5,3);a.C(78,5,3);a.C(46,8,3);a.C(70,5,5)}),
build(140,1,120,a=>{
a.Ce();a.G(0,22);a.G(28,52);a.G(58,80);a.G(87,109);a.G(114,139);
a.R(54,8,'##');a.R(111,8,'##');a.E('m',23,10,3);a.E('m',81,10,4);
a.R(30,7,'?B?');a.R(44,7,'M');a.R(62,7,'B?B');a.R(92,7,'?B?B');a.R(120,7,'B?M?');a.P(40,2);a.P(98,3);
[34,35,66,67,68,122,123].forEach(x=>a.E('S',x,9));
[14,46,74,77,92,105,126].forEach(x=>a.E('g',x,9));[49,95,102,129].forEach(x=>a.E('k',x,9));
a.E('f',42,6);a.E('f',70,6);a.E('K',60,9);a.E('K',116,9);a.E('F',133,3);
a.C(24,7,3);a.C(54,6,2);a.C(111,6,2);a.C(30,5,3);a.C(62,5,3);a.C(92,5,4);a.C(66,6,3);a.C(120,5,4);a.C(83,8,3)}),
build(150,2,150,a=>{
[[0,9],[13,17],[21,24],[30,36],[50,56],[64,72],[76,80],[96,104],[111,118],[122,128],[129,149]].forEach(g=>a.G(g[0],g[1]));
a.E('m',25,10,4);a.E('m',57,10,5);a.E('m',105,10,5);
a.R(22,7,'?');a.R(38,9,'##');a.R(41,8,'##');a.R(44,7,'##');a.R(47,6,'##');
a.R(66,7,'B?M?B');a.R(83,9,'##');a.R(87,9,'#');a.R(90,8,'#');a.R(93,9,'#');a.R(112,6,'B?B');a.St(131,6);
[52,53,113,114].forEach(x=>a.E('S',x,9));
a.E('g',67,9);a.E('k',70,9);a.E('k',55,9);a.E('f',74,6);a.E('k',100,9);a.E('f',98,6);a.E('f',102,5);a.E('k',116,9);
a.E('f',120,6);a.E('g',125,9);a.E('g',139,9);a.E('f',138,5);a.E('K',32,9);a.E('K',124,9);a.E('F',143,3);
a.C(10,7,3);a.C(18,7,3);a.C(38,7,2);a.C(41,6,2);a.C(44,5,2);a.C(47,3,2);a.C(58,6,5);
a.C(66,5,5);a.C(83,7,2);a.C(87,7,1);a.C(90,6,1);a.C(93,7,1);a.C(112,4,3)})];

const KEY='mario-platformer-v1';
const def=()=>({unlocked:1,hi:0,times:{},sound:true,shake:true,touch:'auto'});
let D=def();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r==='object')D=Object.assign(def(),r)}catch(e){D=def()}
D.unlocked=Math.min(3,Math.max(1,D.unlocked|0||1));D.hi=D.hi|0;if(!D.times||typeof D.times!=='object')D.times={};
D.sound=D.sound!==false;D.shake=D.shake!==false;if(!['auto','on','off'].includes(D.touch))D.touch='auto'}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}

let ac=null,mg=null;
function initAudio(){try{if(ac){if(ac.state==='suspended')ac.resume();return}
const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();mg=ac.createGain();mg.gain.value=.15;mg.connect(ac.destination)}catch(e){ac=null}}
const SFX={jump:[[300,.12,'square',600]],coin:[[988,.07,'square'],[1319,.2,'square']],stomp:[[200,.1,'square',80]],
power:[[392,.08,'square'],[523,.08,'square'],[659,.08,'square'],[784,.16,'square']],hurt:[[300,.25,'sawtooth',100]],
die:[[400,.15,'square'],[300,.15,'square'],[200,.15,'square'],[100,.4,'square']],check:[[660,.1,'triangle'],[880,.2,'triangle']],
win:[[523,.12,'square'],[659,.12,'square'],[784,.12,'square'],[1047,.4,'square']],over:[[300,.3,'triangle'],[220,.3,'triangle'],[150,.6,'triangle']],
click:[[500,.05,'square']],bump:[[120,.08,'square']],brk:[[150,.12,'sawtooth',50]]};
function sfx(n){if(!D.sound||!ac)return;try{let t=ac.currentTime;for(const[f,d,w,e]of SFX[n]){const o=ac.createOscillator(),g=ac.createGain();
o.type=w;o.frequency.setValueAtTime(f,t);if(e)o.frequency.exponentialRampToValueAtTime(e,t+d);g.gain.setValueAtTime(.8,t);
g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(mg);o.start(t);o.stop(t+d);t+=d}}catch(e){}}

const kd={l:0,r:0,j:0},tp=new Map();
const KM={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'j',w:'j',W:'j',' ':'j'};
const down=k=>kd[k]||[...tp.values()].includes(k);
function clearKeys(){kd.l=kd.r=kd.j=0;tp.clear();$$('#touch button').forEach(b=>b.classList.remove('on'))}
const playing=()=>S==='play'||S==='dead'||S==='win';

let S='menu',L=null,li=0,T=null,LW=0,ents=[],parts=[],bump=[],P=null,spawn=null,cam=0,VW=400,sc=1,dpr=1;
let score=0,lives=3,coins=0,lcoins=0,kills=0,clock=0,wt=0,dt2=0,shake=0,jb=0,pj=false,menuCam=0,tt=0,rotOff=false,rst=0,armT=0,totalC=0,fw=0,winX=0,fin=0,lastT=0,acc=0;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const sol=(c,r)=>r<0?false:c<0||c>=LW?true:r>=ROWS?false:T[r][c]>0;
function stuck(b){const c0=Math.floor(b.x/TS),c1=Math.floor((b.x+b.w-.01)/TS),r0=Math.floor(b.y/TS),r1=Math.floor((b.y+b.h-.01)/TS);
for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(sol(c,r))return true;return false}
function mv(b,dt,hh){
b.x+=b.vx*dt;b.hx=0;
let c0=Math.floor(b.x/TS),c1=Math.floor((b.x+b.w-.01)/TS),r0=Math.floor(b.y/TS),r1=Math.floor((b.y+b.h-.01)/TS);
for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(sol(c,r)){if(b.vx>0)b.x=c*TS-b.w;else if(b.vx<0)b.x=(c+1)*TS;else continue;b.hx=1;if(hh)b.vx=0}
b.y+=b.vy*dt;
c0=Math.floor(b.x/TS);c1=Math.floor((b.x+b.w-.01)/TS);r0=Math.floor(b.y/TS);r1=Math.floor((b.y+b.h-.01)/TS);
let hr=-1,hc=-1;
for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(sol(c,r)){
if(b.vy>0){b.y=r*TS-b.h;b.vy=0;b.gr=1}
else if(b.vy<0){b.y=(r+1)*TS;b.vy=0;if(hr<0){hr=r;hc=c}}}
if(hr>=0&&hh){const cc=Math.floor((b.x+b.w/2)/TS);hitBlock(sol(cc,hr)?cc:hc,hr)}}

function parts_(x,y,col,n,sp){for(let i=0;i<n&&parts.length<220;i++)parts.push({x,y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp,l:.5+Math.random()*.4,c:col})}
function addCoin(){coins++;lcoins++;score+=200;if(coins%50===0){lives++;sfx('power')}hud()}
function hitBlock(c,r){const t=T[r][c];if(t<2||t>4)return;bump.push({c,r,t:.12});
if(t===3){T[r][c]=5;addCoin();parts_(c*TS+8,r*TS,'#ffd23f',6,120);sfx('coin')}
else if(t===4){T[r][c]=5;sfx('power');ents.push({t:'u',x:c*TS+1,y:r*TS-14,w:14,h:14,vx:45,vy:-80,dir:1,hp:1,dead:0,got:0,cool:0,act:1,ph:0,sx:0,sy:0})}
else if(t===2){if(P.big){T[r][c]=0;score+=50;parts_(c*TS+8,r*TS+8,'#b8541c',10,160);sfx('brk');hud()}else sfx('bump')}
for(const e of ents)if(!e.dead&&(e.t==='g'||e.t==='k')&&e.x+e.w>c*TS&&e.x<c*TS+TS&&Math.abs(e.y+e.h-r*TS)<3){e.dead=.5;score+=100;kills++;hud()}}
function hurt(){if(P.inv>0||S!=='play')return;if(P.big){P.big=0;P.y+=8;P.h=16;P.inv=2;shake=.2;sfx('hurt');hud()}else die()}
function die(){if(S!=='play')return;S='dead';dt2=0;P.vy=-300;P.vx=0;lives--;shake=.25;sfx('die');hud()}
function mkP(x,y){return{x,y,w:12,h:16,vx:0,vy:0,big:0,face:1,gr:1,coy:0,inv:0,at:0,land:0,sl:0,hide:0,st:'idle',ride:null,hx:0}}
function respawn(){P=mkP(spawn.x,spawn.y);P.inv=2;ents=ents.filter(e=>e.t!=='u');
for(const e of ents)if(e.t==='g'||e.t==='k'||e.t==='f'){e.x=e.sx;e.y=e.sy;e.vx=e.vy=0;e.dead=0;e.hp=e.t==='k'?2:1;e.act=0;e.dir=-1;e.cool=0}
cam=clamp(P.x-VW*.4,0,LW*TS-VW);S='play';clearKeys();jb=0;hud()}
function start(i,fresh){
li=i;L=LV[i];LW=L.w;T=L.T.map(r=>r.slice());
if(fresh){score=0;lives=3;coins=0}
lcoins=0;kills=0;clock=0;bump=[];parts=[];fin=0;
ents=L.E.map(o=>{const z=SZ[o.t],e={t:o.t,x:o.x+z[2],y:o.y+z[3],w:z[0],h:z[1],r:o.r,vx:0,vy:0,dir:-1,hp:o.t==='k'?2:1,dead:0,got:0,cool:0,act:0,ph:Math.random()*6};e.sx=e.x;e.sy=e.y;return e});
totalC=ents.filter(e=>e.t==='c').length;spawn={x:32,y:144};P=mkP(32,144);cam=0;S='play';show(null);clearKeys();jb=0;pj=false;hud(true)}
function winStart(f){S='win';wt=0;fw=1;winX=f.x+46;P.sl=1;P.vx=0;P.vy=0;P.x=f.x-P.w+4;P.face=1;clearKeys();
score+=Math.max(0,Math.floor(L.par-clock))*10;sfx('win');
D.unlocked=Math.max(D.unlocked,Math.min(3,li+2));const bt=D.times[li];if(!bt||clock<bt)D.times[li]=Math.round(clock*10)/10;D.hi=Math.max(D.hi,score);save();hud(true)}
function showWin(){fin=1;const st=1+(lcoins>=totalC*.7?1:0)+(clock<=L.par?1:0);
$('#wsum').innerHTML=`<p>${li+1}. ${NAMES[li]}</p><p>Score: ${score}</p><p>Coins: ${lcoins}/${totalC}</p><p>Enemies defeated: ${kills}</p><p>Time: ${fmt(clock)}</p><p>Rating: ${'★'.repeat(st)}${'☆'.repeat(3-st)}</p>`;
$('#nextb').classList.toggle('hidden',li>=2);S='end';show('s-win')}
function gameOver(){S='over';D.hi=Math.max(D.hi,score);save();sfx('over');$('#osum').textContent='Score: '+score;show('s-over')}
const fmt=t=>{t=Math.floor(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};

function upP(dt){
const j=down('j');if(j&&!pj)jb=PHY.buffer;pj=j;jb-=dt;
const ax=(down('r')?1:0)-(down('l')?1:0),a=P.gr?PHY.acc:PHY.air;
if(ax){P.vx+=ax*a*(Math.sign(P.vx)===-ax?2:1)*dt;P.face=ax}else{const f=PHY.fric*dt;P.vx=Math.abs(P.vx)<=f?0:P.vx-Math.sign(P.vx)*f}
P.vx=clamp(P.vx,-PHY.run,PHY.run);
if(P.ride)P.x+=P.ride.dx;
if(P.gr)P.coy=PHY.coyote;else P.coy-=dt;
if(jb>0&&P.coy>0){P.vy=PHY.jump;P.coy=0;jb=0;P.gr=0;sfx('jump');parts_(P.x+6,P.y+P.h,'#ddd',4,40)}
if(!j&&P.vy<PHY.cut)P.vy=PHY.cut;
P.vy=Math.min(P.vy+PHY.g*dt,PHY.fall);
const was=P.gr,pv=P.vy;P.gr=0;P.ride=null;
mv(P,dt,true);
for(const p of ents)if(p.t==='m'&&P.vy>=0){const b=P.y+P.h;
if(P.x+P.w>p.x&&P.x<p.x+p.w&&b>=p.y&&b-P.vy*dt<=p.y+3){P.y=p.y-P.h;P.vy=0;P.gr=1;P.ride=p}}
if(P.gr&&!was&&pv>180){P.land=.1;parts_(P.x+6,P.y+P.h,'#ddd',4,50)}
P.land-=dt;P.inv-=dt;P.at+=dt*Math.abs(P.vx)/120;
P.st=!P.gr?(P.vy<0?'jump':'fall'):P.land>0?'land':Math.abs(P.vx)>10?'run':'idle';
if(P.y>VH+24)die()}
function stomp(e){e.hp--;P.y=e.y-P.h;P.vy=down('j')?-300:PHY.bounce;sfx('stomp');
if(e.hp<=0){e.dead=.5;score+=100;kills++;parts_(e.x+7,e.y+7,'#fff',6,100)}else{e.cool=.3}hud()}
function upE(dt){
for(const e of ents){if(e.gone)continue;
if(e.t==='m'){const px=e.x;e.x=e.sx+e.r*(.5-.5*Math.cos(tt*.9));e.dx=e.x-px;continue}
if(e.t==='c'){if(!e.got&&ov(P,e)){e.got=1;e.gone=1;addCoin();parts_(e.x+5,e.y+7,'#ffd23f',5,90);sfx('coin')}continue}
if(e.t==='S'){if(ov(P,e))hurt();continue}
if(e.t==='K'){if(!e.got&&ov(P,e)){e.got=1;spawn={x:e.x-2,y:144};sfx('check')}continue}
if(e.t==='F'){if(ov(P,e)){winStart(e);return}continue}
if(e.t==='u'){e.vy=Math.min(e.vy+PHY.g*dt,PHY.fall);e.vx=e.dir*45;mv(e,dt,false);if(e.hx)e.dir*=-1;
if(ov(P,e)){e.gone=1;if(!P.big){P.big=1;P.y-=8;P.h=24;if(stuck(P)){P.y+=8;P.h=16;P.big=0;score+=1000}}else score+=1000;sfx('power');hud()}
if(e.y>VH+40)e.gone=1;continue}
if(e.dead>0){e.dead-=dt;if(e.dead<=0)e.gone=1;continue}
if(!e.act){if(e.x<cam+VW+48)e.act=1;else continue}
e.cool-=dt;
if(e.t==='f'){const px=e.x;e.x=e.sx+Math.sin(tt*1.2+e.ph)*(e.r||40);e.y=e.sy+Math.sin(tt*2.4+e.ph)*8;e.dir=e.x>=px?1:-1}
else{e.vy=Math.min(e.vy+PHY.g*dt,PHY.fall);e.vx=e.dir*(e.t==='k'?(e.hp<2?55:30):28);e.gr=0;mv(e,dt,false);if(e.hx)e.dir*=-1;
if(e.t==='k'&&e.gr&&!sol(Math.floor((e.dir>0?e.x+e.w+1:e.x-1)/TS),Math.floor((e.y+e.h+1)/TS)))e.dir*=-1;
if(e.y>VH+40){e.gone=1;continue}}
if(S==='play'&&e.cool<=0&&ov(P,e)){if(P.vy>0&&P.y+P.h-e.y<10)stomp(e);else hurt()}}}
function step(dt){
tt+=dt;
if(S==='play'){clock+=dt;for(const e of ents)if(e.t==='m')e.dx=0;upE(dt);if(S==='play')upP(dt)}
else if(S==='dead'){dt2+=dt;P.vy+=PHY.g*dt;P.y+=P.vy*dt;if(dt2>1.6){lives>0?respawn():gameOver()}}
else if(S==='win'){wt+=dt;P.st='win';
if(P.sl){P.y+=70*dt;if(P.y+P.h>=160){P.y=160-P.h;P.sl=0;P.x+=10}}
else if(P.x<winX){P.x+=50*dt;P.st='run';P.at+=dt*.4}else P.hide=1;
if(wt>1&&wt>fw){fw=wt+.35;const x=winX+Math.random()*50,y=40+Math.random()*50,c=['#ffd23f','#e03c28','#fff','#38b838'][Math.random()*4|0];parts_(x,y,c,14,160)}
if(wt>3.2&&!fin)showWin()}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.vy+=500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.l<=0)parts.splice(i,1)}
for(let i=bump.length-1;i>=0;i--){bump[i].t-=dt;if(bump[i].t<=0)bump.splice(i,1)}}

const fr=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
function hero(c,x,y,f,st,a,big,blink){
if(blink)return;
const lf=st==='run'?Math.floor(a*12)%4:0,jp=st==='jump'||st==='fall',up=st==='win'||st==='dead';
c.save();c.translate(x+6,y+(big?24:16));
if(st==='dead'){c.translate(0,-16);c.scale(1,-1);c.translate(0,16)}
c.scale(f*(st==='land'?1.12:1),(big?1.5:1)*(st==='land'?.88:1));
fr(c,'#e03c28',-5,-16,10,3);fr(c,'#e03c28',1,-14,6,2);
fr(c,'#f8c890',-4,-13,8,5);fr(c,'#000',2,-12,1,2);fr(c,'#5a2a0a',0,-9,5,1);
fr(c,'#3050e0',-4,-8,8,5);fr(c,'#ffd23f',-1,-7,2,2);
fr(c,'#e03c28',-6,up?-13:-8,2,4);fr(c,'#e03c28',4,up||jp?-13:-8,2,4);
if(jp){fr(c,'#3050e0',-4,-3,3,3);fr(c,'#3050e0',2,-3,4,2);fr(c,'#6a3a0a',-5,-1,4,1);fr(c,'#6a3a0a',3,-2,4,2)}
else{const o=lf===1||lf===3?2:0;fr(c,'#3050e0',-4,-3,3,3);fr(c,'#3050e0',1,-3,3,3);fr(c,'#6a3a0a',-5+o,-1,4,1);fr(c,'#6a3a0a',1-o,-1,4,1)}
c.restore()}
const lay=(cm,f,w,fn)=>{const o=cm*f,j0=Math.floor(o/w);for(let j=j0;j<j0+VW/w+2;j++)fn(j*w-o,j)};
function bg(th,cm){
const g=cx.createLinearGradient(0,0,0,VH);g.addColorStop(0,TH[th].s[0]);g.addColorStop(1,TH[th].s[1]);cx.fillStyle=g;cx.fillRect(0,0,VW,VH);
if(th===0){cx.fillStyle='#58b858';lay(cm,.2,160,(x,j)=>{cx.beginPath();cx.ellipse(x+80,160,70,36+(j*13%20),0,Math.PI,0);cx.fill()});
cx.fillStyle='#fff';lay(cm,.5,130,(x,j)=>{const y=18+(j*29%40);cx.fillRect(x+10,y,34,8);cx.fillRect(x+16,y-6,20,6);cx.fillRect(x+4,y+4,46,6)})}
else if(th===1){lay(cm,.3,70,(x,j)=>{cx.fillStyle='#3a2a6a';cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+30,0);cx.lineTo(x+15,30+(j*17%40));cx.fill();
cx.fillStyle='#4adada';cx.beginPath();cx.moveTo(x+30,VH);cx.lineTo(x+40,VH-20-(j*11%20));cx.lineTo(x+50,VH);cx.fill()})}
else{cx.fillStyle='#fff';lay(cm,.1,40,(x,j)=>cx.fillRect(x,(j*53)%110,1,1));
cx.fillStyle='rgba(255,220,220,.8)';lay(cm,.4,140,(x,j)=>{const y=110+(j*23%40);cx.fillRect(x,y,40,8);cx.fillRect(x+8,y-6,22,6)});
cx.fillStyle='#2a2a5a';lay(cm,.25,120,(x,j)=>{cx.fillRect(x,120+(j*7%20),24,80);cx.fillRect(x+4,112+(j*7%20),4,8);cx.fillRect(x+16,112+(j*7%20),4,8)})}}
function tile(t,x,y,ab,th){
const h=TH[th];
if(t===1){fr(cx,h.g,x,y,16,16);if(!ab)fr(cx,h.t,x,y,16,4);fr(cx,'rgba(0,0,0,.2)',x+3,y+8,2,2);fr(cx,'rgba(0,0,0,.2)',x+10,y+11,2,2)}
else if(t===2){fr(cx,h.b,x,y,16,16);fr(cx,'rgba(0,0,0,.55)',x,y+7,16,1);fr(cx,'rgba(0,0,0,.55)',x,y+15,16,1);fr(cx,'rgba(0,0,0,.55)',x+7,y,1,7);fr(cx,'rgba(0,0,0,.55)',x+3,y+8,1,7);fr(cx,'rgba(0,0,0,.55)',x+11,y+8,1,7)}
else if(t===3||t===4){const p=Math.floor(tt*3)%4===0;fr(cx,'#a06000',x,y,16,16);fr(cx,p?'#ffe070':'#f8b800',x+1,y+1,14,14);cx.fillStyle='#fff';cx.font='bold 11px monospace';cx.fillText('?',x+4,y+12)}
else if(t===5){fr(cx,'#4a3018',x,y,16,16);fr(cx,'#7a5a3a',x+1,y+1,14,14)}
else if(t===6){fr(cx,h.p,x,y,16,16);fr(cx,'rgba(255,255,255,.3)',x+3,y,3,16);fr(cx,'rgba(0,0,0,.25)',x+12,y,4,16);if(!ab)fr(cx,'rgba(0,0,0,.25)',x,y,16,3)}
else{fr(cx,'#222',x,y,16,16);fr(cx,h.st,x+1,y+1,14,14);fr(cx,'rgba(255,255,255,.2)',x+1,y+1,14,2)}}
function ent(e,x){
const y=Math.round(e.y),fl=Math.floor(tt*5)%2;
switch(e.t){
case'c':{const w=Math.abs(Math.cos(tt*5+e.x))*8+2;fr(cx,'#a06000',x+5-w/2-1+0,y-0,w+2,14);fr(cx,'#ffd23f',x+5-w/2,y+1,w,12);break}
case'S':cx.fillStyle='#ddd';for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(x+i*4,y+8);cx.lineTo(x+i*4+2,y);cx.lineTo(x+i*4+4,y+8);cx.fill()}break;
case'm':fr(cx,'#5a3a10',x,y,32,8);fr(cx,'#c08a3a',x+1,y+1,30,5);break;
case'K':fr(cx,'#ddd',x+3,y,2,24);fr(cx,e.got?'#38c838':'#e03c28',x+5,y,7,5);break;
case'F':fr(cx,'#fff',x+1,y,2,112);fr(cx,'#ffd23f',x,y-3,4,4);fr(cx,'#38c838',x-8,y+4+(S==='win'||S==='end'?Math.min(wt*40,90):0),9,7);
fr(cx,'#8c4a2a',x+40,128,40,32);fr(cx,'#6a3a1a',x+40,122,8,6);fr(cx,'#6a3a1a',x+56,122,8,6);fr(cx,'#6a3a1a',x+72,122,8,6);fr(cx,'#000',x+54,142,12,18);break;
case'u':fr(cx,'#e03c28',x,y,14,8);fr(cx,'#fff',x+2,y+2,3,3);fr(cx,'#fff',x+8,y+1,3,3);fr(cx,'#f8e8c8',x+3,y+8,8,6);break;
case'g':if(e.dead>0)fr(cx,'#a0522d',x,y+10,14,4);else{fr(cx,'#a0522d',x+1,y,12,9);fr(cx,'#fff',x+3,y+3,3,3);fr(cx,'#fff',x+8,y+3,3,3);fr(cx,'#000',x+4,y+4,1,2);fr(cx,'#000',x+9,y+4,1,2);fr(cx,'#3a1a0a',x+(fl?0:2),y+10,5,4);fr(cx,'#3a1a0a',x+(fl?9:7),y+10,5,4)}break;
case'k':if(e.dead>0)fr(cx,'#1a8a8a',x,y+10,14,4);else{const col=e.hp<2?'#c83030':'#1a8a8a';fr(cx,col,x,y+1,14,9);fr(cx,'rgba(255,255,255,.35)',x+2,y+2,10,2);fr(cx,'#f8c890',e.dir>0?x+9:x,y+6,5,5);fr(cx,'#000',e.dir>0?x+11:x+2,y+7,1,2);fr(cx,'#3a1a0a',x+(fl?0:2),y+10,5,4);fr(cx,'#3a1a0a',x+(fl?9:7),y+10,5,4)}break;
case'f':if(e.dead>0)fr(cx,'#7a3aaa',x+2,y+8,10,4);else{fr(cx,'#7a3aaa',x+3,y+3,8,7);fr(cx,'#f33',x+4,y+5,2,2);fr(cx,'#f33',x+8,y+5,2,2);fr(cx,'#4a1a7a',x,y+(fl?0:4),4,4);fr(cx,'#4a1a7a',x+10,y+(fl?0:4),4,4)}break}}
function render(dt){
cx.setTransform(sc,0,0,sc,0,0);cx.imageSmoothingEnabled=false;
const inG=L&&S!=='menu',th=inG?L.theme:0;let cm;
if(!inG){menuCam+=dt*25;cm=Math.floor(menuCam)}
else{if(S!=='pause'){const tg=clamp(P.x-VW*.4,0,Math.max(0,LW*TS-VW));cam+=(tg-cam)*Math.min(1,dt*6)}cm=Math.round(cam)}
bg(th,cm);
let sx=0,sy=0;if(shake>0){shake-=dt;if(D.shake&&!matchMedia('(prefers-reduced-motion:reduce)').matches){sx=(Math.random()-.5)*3;sy=(Math.random()-.5)*3}}
cx.save();cx.translate(Math.round(sx),Math.round(sy));
if(!inG){fr(cx,TH[0].g,0,VH-32,VW,32);fr(cx,TH[0].t,0,VH-32,VW,4)}
else{
const c0=Math.floor(cm/TS),c1=c0+Math.ceil(VW/TS)+1;
for(let r=0;r<ROWS;r++)for(let c=c0;c<=c1&&c<LW;c++){const t=T[r][c];if(!t)continue;let by=0;
if(t>=2&&t<=5)for(const b of bump)if(b.c===c&&b.r===r)by=-Math.sin(b.t/.12*Math.PI)*4;
tile(t,c*TS-cm,r*TS+Math.round(by),r>0&&T[r-1][c]>0,th)}
for(const e of ents){if(e.gone)continue;const x=Math.round(e.x)-cm;if(x<-130||x>VW+60)continue;ent(e,x)}
if(!P.hide)hero(cx,Math.round(P.x)-cm,Math.round(P.y),P.face,P.st,P.at,P.big,P.inv>0&&S==='play'&&Math.floor(P.inv*20)%2===0)}
for(const p of parts){cx.fillStyle=p.c;cx.fillRect(Math.round(p.x-cm*(inG?1:0)),Math.round(p.y),2,2)}
cx.restore();
if(S==='menu'){pvc.setTransform(1,0,0,1,0,0);pvc.clearRect(0,0,64,64);pvc.setTransform(3,0,0,3,0,0);pvc.imageSmoothingEnabled=false;hero(pvc,5,2,1,'run',tt,0,false)}}

const cache={};
function setT(id,v){if(cache[id]!==v){cache[id]=v;$('#'+id).textContent=v}}
function hud(f){if(!L)return;setT('hs','SCORE '+String(score).padStart(6,'0'));setT('hc','COINS '+coins);setT('hl','LIVES '+Math.max(0,lives));
setT('hw','WORLD '+(li+1)+' '+NAMES[li].toUpperCase());setT('ht','TIME '+fmt(clock));setT('hp',P&&P.big?'POWER: BIG':'')}
function show(id){$$('.screen').forEach(s=>s.classList.add('hidden'));if(id){const el=$('#'+id);el.classList.remove('hidden');const b=el.querySelector('button:not(:disabled)');if(b)b.focus({preventScroll:true})}else if(document.activeElement)document.activeElement.blur();ui()}
function touchOn(){return D.touch==='on'||(D.touch==='auto'&&(matchMedia('(pointer:coarse)').matches||'ontouchstart'in window))}
function ui(){const pl=playing()||S==='pause';$('#hud').classList.toggle('hidden',!pl);document.body.classList.toggle('playing',playing());document.body.classList.toggle('tch',touchOn());
$('#rot').classList.toggle('hidden',!(playing()&&touchOn()&&innerHeight>innerWidth&&!rotOff));
const m=['ON','OFF'][D.sound?0:1];$('#sndb').textContent='Sound: '+m;$('#sndb2').textContent='Sound: '+m;
$('#shkb').textContent='Screen shake: '+(D.shake?'ON':'OFF');$('#tchb').textContent='Touch controls: '+D.touch.toUpperCase();
$('#best').textContent='HIGH SCORE '+String(D.hi).padStart(6,'0')+(D.times[0]?'  BEST 1-1 '+fmt(D.times[0]):'')}
function levelsScreen(){const w=$('#lvl');w.innerHTML='';NAMES.forEach((n,i)=>{const b=document.createElement('button'),ok=i<D.unlocked;b.className='b';b.disabled=!ok;b.dataset.a='lv';b.dataset.i=i;
b.textContent=ok?`${i+1}. ${n}${D.times[i]?'  ★ '+fmt(D.times[i]):''}`:`${i+1}. Locked`;w.appendChild(b)})}
function pause(p){if(p&&S==='play'){S='pause';clearKeys();show('s-pause')}else if(!p&&S==='pause'){S='play';show(null)}}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(armT);armT=setTimeout(()=>t.classList.add('hidden'),1500)}
function act(a,b){
switch(a){
case'play':start(0,true);break;
case'levels':levelsScreen();show('s-levels');break;
case'lv':start(+b.dataset.i,true);break;
case'help':show('s-help');break;
case'settings':show('s-set');break;
case'about':show('s-about');break;
case'menu':S='menu';clearKeys();show('s-menu');break;
case'resume':pause(0);break;
case'pause':pause(1);break;
case'retry':start(li,true);break;
case'next':start(li+1,false);break;
case'snd':D.sound=!D.sound;save();ui();break;
case'shk':D.shake=!D.shake;save();ui();break;
case'tch':D.touch={auto:'on',on:'off',off:'auto'}[D.touch];save();ui();break;
case'reset':if(rst){D=Object.assign(def(),{sound:D.sound,shake:D.shake,touch:D.touch});save();rst=0;$('#rstb').textContent='Progress reset';ui()}else{rst=1;$('#rstb').textContent='Really reset? Click again';setTimeout(()=>{rst=0;$('#rstb').textContent='Reset progress'},3000)}break}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;initAudio();sfx('click');act(b.dataset.a,b)});
let rT=0;
addEventListener('keydown',e=>{initAudio();
if(e.key==='Escape'||e.key==='p'||e.key==='P'){if(S==='play')pause(1);else if(S==='pause')pause(0);else if(S==='menu'&&$('#s-menu').classList.contains('hidden'))act('menu');return}
if((e.key==='r'||e.key==='R')&&(S==='play'||S==='pause')){if(performance.now()-rT<1500){start(li,true)}else{rT=performance.now();toast('Press R again to restart')}return}
const k=KM[e.key];if(k&&playing()){e.preventDefault();kd[k]=1}});
addEventListener('keyup',e=>{const k=KM[e.key];if(k)kd[k]=0});
addEventListener('blur',()=>{clearKeys();pause(1)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearKeys();pause(1)}});
$$('#touch button').forEach(b=>{const k=b.dataset.k;
b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();try{b.setPointerCapture(e.pointerId)}catch(x){}tp.set(e.pointerId,k);b.classList.add('on')});
const up=e=>{tp.delete(e.pointerId);if(![...tp.values()].includes(k))b.classList.remove('on')};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,up));
b.addEventListener('contextmenu',e=>e.preventDefault())});
$('#rot').addEventListener('click',()=>{rotOff=true;ui()});
document.addEventListener('touchmove',e=>{if(playing()&&e.cancelable)e.preventDefault()},{passive:false});
function resize(){const cw=stage.clientWidth,ch=stage.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);
let s=Math.min(ch/VH,cw/240);if(s>=2)s=Math.floor(s);VW=Math.max(240,Math.min(400,Math.floor(cw/s)));
cv.style.width=VW*s+'px';cv.style.height=VH*s+'px';cv.width=Math.round(VW*s*dpr);cv.height=Math.round(VH*s*dpr);sc=s*dpr;ui()}
addEventListener('resize',resize);addEventListener('orientationchange',resize);
function frame(ts){requestAnimationFrame(frame);const dt=Math.min(.1,(ts-lastT)/1000||0);lastT=ts;
if(playing()){acc+=dt;while(acc>=PHY.step){step(PHY.step);acc-=PHY.step}if(S==='play'&&Math.floor(clock*2)%1===0)hud()}else acc=0;
render(dt)}
load();document.title=TITLE;$('#title').textContent=TITLE;resize();ui();requestAnimationFrame(frame);
})();
