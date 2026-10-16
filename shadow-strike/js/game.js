(function(){
'use strict';
const SS=window.SS,WP=SS.WEAPONS,UPG=SS.UPG,clamp=SS.clamp,W=960,H=540,GY=452,TAU=Math.PI*2;
const $=id=>document.getElementById(id),lerp=(a,b,t)=>a+(b-a)*t,rnd=Math.random;
const cv=$('cv'),c=cv.getContext('2d'),ui=$('ui'),stage=$('stage');
let save=SS.load(),state='menu',pl,en,cfg,lvl=1,devRun=false,ps,time=0,fightT=0,endT=0,combo=0,comboT=0,shake=0,banner=0,last=0,pageStart=1,msg='',msgT=0;
let parts=[],texts=[],amb=[],ms={dealt:0,taken:0,maxc:0};
const input={held:{},q:[]},A={t:.8,dir:0,b:0,force:null};
const AT={punch:{s:.08,a:.1,r:.16,d:8,rg:55,kb:130,e:9},kick:{s:.12,a:.12,r:.22,d:12,rg:70,kb:210,e:11},heavy:{s:.3,a:.14,r:.4,d:24,rg:80,kb:380,e:16},special:{s:.15,a:.36,r:.36,d:46,rg:135,kb:520,e:0}};
const AR=[
{n:'Moonlit Bamboo Forest',a:'#070b24',b:'#1b2a5e',m:'#dff1ff',h:'#0c1a3a',g:'#050814',acc:'#22d3ee',fx:'leaf'},
{n:'Ancient Temple',a:'#1a0b2e',b:'#4c1d6b',m:'#f5e1ff',h:'#241043',g:'#0a0618',acc:'#c084fc',fx:'dust'},
{n:'Crimson Battlefield',a:'#1f0509',b:'#6b1426',m:'#ffd1c4',h:'#2e0a14',g:'#0d0306',acc:'#f43f5e',fx:'ember'},
{n:'Frozen Courtyard',a:'#071a2b',b:'#1e5a7a',m:'#e6fbff',h:'#0d2e45',g:'#04101a',acc:'#67e8f9',fx:'snow'},
{n:'Neon Shadow Dojo',a:'#0a0626',b:'#5b1a6f',m:'#ffd6f7',h:'#1a0b3d',g:'#07031a',acc:'#f0abfc',fx:'dust'},
{n:'Volcanic Arena',a:'#1c0802',b:'#7a2a06',m:'#ffe0b0',h:'#32120a',g:'#0e0402',acc:'#fb923c',fx:'ember'}];
const mk=o=>Object.assign({x:0,y:GY,vx:0,vy:0,f:1,hp:100,max:100,en:0,act:null,stun:0,inv:0,blk:false,dcd:0,dodge:0,kd:0,phase:0,dead:false,dt:0,ctl:false,air:false},o);
const isFree=f=>!f.act&&f.stun<=0&&f.kd<=0&&f.dodge<=0&&!f.dead;
const pick=o=>{let t=0;for(const k in o)t+=o[k];let r=rnd()*t;for(const k in o){r-=o[k];if(r<=0)return k}return Object.keys(o)[0]};
const note=m=>{msg=m;msgT=1.2};

const Au={x:null,
init(){if(this.x)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{this.x=new C();this.mg=this.x.createGain();this.sg=this.x.createGain();this.mg.connect(this.x.destination);this.sg.connect(this.x.destination);this.vol();this.st=0;setInterval(()=>this.tick(),280)}catch(e){this.x=null}},
vol(){if(!this.x)return;const s=save.set;this.mg.gain.value=s.mute?0:s.music*.5;this.sg.gain.value=s.mute?0:s.sfx},
tone(f,d,ty,v,to,g){const x=this.x,t=x.currentTime,o=x.createOscillator(),e=x.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(e);e.connect(g);o.start(t);o.stop(t+d+.02)},
sfx(n){if(!this.x)return;if(this.x.state==='suspended')this.x.resume().catch(()=>{});const P={punch:[230,.09,'square',110],kick:[170,.12,'sawtooth',80],heavy:[110,.26,'square',45],block:[700,.07,'triangle',420],dodge:[900,.12,'sine',300],ui:[520,.05,'sine',0],special:[320,.4,'sawtooth',90],lose:[160,.8,'sawtooth',50],win:[520,.25,'triangle',0]}[n];if(!P)return;this.tone(P[0],P[1],P[2],.3,P[3],this.sg);if(n==='win'){setTimeout(()=>this.tone(660,.25,'triangle',.3,0,this.sg),150);setTimeout(()=>this.tone(880,.4,'triangle',.3,0,this.sg),300)}},
tick(){if(!this.x||save.set.mute||this.x.state!=='running')return;const N=[110,130.8,146.8,196,220],s=this.st++;if(s%4===0)this.tone(N[(s>>2)%3]/2,1.1,'sine',.5,0,this.mg);this.tone(N[(s*3+(s>>3))%5]*2,.5,'triangle',.18,0,this.mg)}};

function h(t,p,...k){const e=document.createElement(t);if(p)for(const a in p){const v=p[a];if(v==null||v===false)continue;if(a==='on')for(const ev in v)e.addEventListener(ev,v[ev]);else if(a==='cls')e.className=v;else e.setAttribute(a,v)}for(const x of k.flat())if(x!=null&&x!==false)e.append(x);return e}
const btn=(l,fn,cls)=>h('button',{type:'button',cls:cls||'btn',on:{click:()=>{Au.init();Au.sfx('ui');fn()}}},l);
function panel(title,body,cls){ui.replaceChildren(h('div',{cls:'card '+(cls||''),role:'dialog','aria-label':title||'Shadow Strike'},title?h('h2',null,title):null,...body));ui.hidden=false;const f=ui.querySelector('button,input');if(f)f.focus({preventScroll:true})}
const hide=()=>{ui.hidden=true;ui.replaceChildren()};
const applyTouch=()=>stage.classList.toggle('touchon',!!save.set.touch);

function menu(){state='menu';hide();cfg=SS.levelConfig(save.level);
panel('',[h('div',{cls:'logo'},h('span',null,'SHADOW STRIKE'),h('small',null,'INFINITE ARENA')),
h('p',{cls:'sub'},`Level ${save.level} · ${save.coins} coins · ${WP[save.weapon].name}`),
SS.state.ok?null:h('p',{cls:'warn',role:'alert'},'Storage is blocked in this browser: progress will not be saved.'),
btn(save.best>0?`▶ Continue — Level ${save.level}`:'▶ Play',()=>start(save.level),'btn primary'),
btn('Level Select',()=>{pageStart=Math.floor((save.best)/10)*10+1;levels()}),btn('Weapons & Upgrades',()=>shop()),btn('Statistics',stats),btn('Settings',()=>settings(menu)),btn('Controls',()=>controls(menu))],'menu')}
function levels(){state='menu';const un=save.best+1,rows=[];
for(let i=0;i<10;i++){const n=pageStart+i,f=SS.levelConfig(n),lock=n>un;
rows.push(h('button',{type:'button',cls:'tile'+(lock?' lock':'')+(f.boss?' boss':'')+(n<=save.best?' done':''),disabled:lock?'':null,'aria-label':`Level ${n}${f.boss?' boss':''}${lock?' locked':''}`,on:{click:()=>start(n)}},h('b',null,n),h('small',null,f.boss?'BOSS':n<=save.best?'Cleared':lock?'Locked':'New'),h('small',null,`Diff ${f.rating}`),h('small',null,`+${f.reward}`)))}
panel('Level Select',[h('p',{cls:'sub'},`Unlocked up to level ${un}. Levels never end.`),h('div',{cls:'grid'},rows),
h('div',{cls:'pager'},btn('◀ Prev',()=>{pageStart=Math.max(1,pageStart-10);levels()}),btn('Current',()=>{pageStart=Math.floor((un-1)/10)*10+1;levels()}),btn('Next ▶',()=>{if(pageStart+10<=un){pageStart+=10;levels()}else{levels()}})),btn('Back',menu)],'wide')}
function shop(n){const ps2=SS.playerStats(save),min=()=>SS.persist(save);
const ws=Object.entries(WP).map(([k,w])=>{const own=save.owned.includes(k),eq=save.weapon===k;
return h('div',{cls:'row'+(eq?' on':'')},h('div',null,h('b',null,w.name),h('small',null,`Damage ×${w.dmg} · Range ${w.range} · Speed ×${w.speed}`)),
eq?h('span',{cls:'tag'},'Equipped'):own?btn('Equip',()=>{save.weapon=k;min();shop('Equipped '+w.name)}):btn(`Buy ${w.cost}`,()=>{if(save.coins<w.cost)return shop('Not enough coins');save.coins-=w.cost;save.owned.push(k);save.weapon=k;min();shop('Purchased '+w.name)}))});
const us=Object.entries(UPG).map(([k,u])=>{const lv=save.up[k],max=lv>=u.max,cost=SS.upgradeCost(lv);
return h('div',{cls:'row'},h('div',null,h('b',null,`${u.name} Lv ${lv}/${u.max}`),h('small',null,u.desc)),max?h('span',{cls:'tag'},'MAX'):btn(`Upgrade ${cost}`,()=>{if(save.coins<cost)return shop('Not enough coins');save.coins-=cost;save.up[k]++;min();shop(u.name+' upgraded')}))});
panel('Weapons & Upgrades',[h('p',{cls:'sub',role:'status','aria-live':'polite'},n||`Coins: ${save.coins}`),h('p',{cls:'sub'},`Health ${ps2.hp} · Damage ×${ps2.dmg.toFixed(2)} · Damage taken ×${ps2.take.toFixed(2)} · Energy ×${ps2.eng.toFixed(2)}`),h('div',{cls:'list'},ws,us),btn('Back',menu)],'wide')}
function stats(){const s=save.st,fav=Object.entries(s.wuse).sort((a,b)=>b[1]-a[1])[0],R=(a,b)=>h('tr',null,h('th',{scope:'row'},a),h('td',null,String(b)));
panel('Statistics',[h('table',{cls:'tbl'},h('tbody',null,R('Victories',s.wins),R('Defeats',s.losses),R('Enemies defeated',s.kills),R('Highest level reached',save.best),R('Highest boss defeated',s.top||'—'),R('Total coins earned',s.earned),R('Favorite weapon',fav?WP[fav[0]].name:'—'),R('Playtime',`${Math.floor(s.time/60)}m ${s.time%60}s`))),btn('Back',menu)])}
function controls(back){const R=(a,b,d)=>h('tr',null,h('th',{scope:'row'},a),h('td',null,b),h('td',null,d));
panel('Controls',[h('table',{cls:'tbl'},h('thead',null,h('tr',null,h('th',null,'Action'),h('th',null,'Keyboard'),h('th',null,'Touch'))),h('tbody',null,R('Move','A / D or ← →','◀ ▶'),R('Jump','W or ↑','Jump'),R('Block (hold)','S, ↓ or Space','Block'),R('Punch','J','Punch'),R('Kick','K','Kick'),R('Heavy attack','L','Heavy'),R('Dodge','Shift','Dodge'),R('Special (needs full energy)','E or I','Special'),R('Pause','Esc or P','❚❚'))),h('p',{cls:'sub'},'Block works against attacks coming from the front. Dodge makes you briefly invulnerable.'),btn('Back',back)])}
function settings(back){const sl=(l,k)=>h('label',{cls:'f'},l,h('input',{type:'range',min:0,max:1,step:.05,value:save.set[k],'aria-label':l,on:{input:e=>{save.set[k]=SS.num(e.target.value,.5,0,1);Au.vol()},change:()=>SS.persist(save)}}));
const cb=(l,k,fn)=>h('label',{cls:'f'},h('input',{type:'checkbox',checked:save.set[k]?'':null,on:{change:e=>{save.set[k]=e.target.checked;if(fn)fn();Au.vol();SS.persist(save)}}}),' '+l);
const st=h('p',{cls:'sub',role:'status','aria-live':'polite'}),ta=h('textarea',{rows:3,'aria-label':'Save data text'});
panel('Settings',[sl('Music volume','music'),sl('Effects volume','sfx'),cb('Mute all audio','mute'),cb('Reduced motion & effects','reduce'),cb('Always show touch controls','touch',applyTouch),ta,
h('div',{cls:'pager'},btn('Export save',()=>{ta.value=SS.exportSave(save);st.textContent='Save exported to the text box.';try{navigator.clipboard.writeText(ta.value).catch(()=>{})}catch(e){}}),
btn('Import save',()=>{const n=SS.importSave(ta.value);if(!n){st.textContent='Invalid save data. Nothing changed.';return}save=n;SS.persist(save);Au.vol();applyTouch();st.textContent='Save imported.'})),
st,btn('Reset all progress',()=>ask('Erase ALL progress, coins, weapons and statistics? This cannot be undone.',()=>{save=SS.defSave();SS.persist(save);Au.vol();applyTouch();menu()},()=>settings(back)),'btn danger'),btn('Back',back)])}
const ask=(m,y,n)=>panel('Are you sure?',[h('p',null,m),btn('Yes, erase',y,'btn danger'),btn('Cancel',n)]);

function begin(f,n,rg,sp,mul){const d=AT[n];if(!isFree(f))return false;if(n==='special'){if(f.en<100)return false;f.en-=100}
f.act={n,t:0,s:d.s/sp,a:d.a/sp,r:d.r/sp,dmg:d.d*mul,rg:d.rg*rg/50,kb:d.kb,hit:false};f.blk=false;return true}
function spark(x,y,col,n){if(save.set.reduce)n=Math.ceil(n/3);for(let i=0;i<n;i++)parts.push({x,y,vx:(rnd()-.5)*460,vy:(rnd()-.8)*420,l:.35+rnd()*.3,c:col})}
function strike(a,d){const k=a.act;k.hit=true;const guard=d.blk&&d.f===-a.f&&isFree(d);
let dm=k.dmg*(a===pl?1+Math.min(.3,combo*.02):1);const crit=rnd()<(a===pl?.1:.04);if(crit)dm*=1.5;if(d===pl)dm*=ps.take;
const px=d.x,py=d.y-80;
if(guard){dm*=k.n==='special'?.5:.15;d.vx=a.f*k.kb*.35;d.en=Math.min(100,d.en+3);Au.sfx('block');spark(px,py,'#9ee7ff',6)}
else{d.act=null;d.blk=false;if(k.n==='special')d.kd=.9;else d.stun=k.n==='heavy'?.45:.28;d.vx=a.f*k.kb;if(k.n==='heavy'||k.n==='special')d.vy=-220;
Au.sfx(k.n);spark(px,py,a===pl?'#ffd166':'#ff5c8a',k.n==='punch'?8:14);shake=Math.max(shake,k.n==='heavy'||k.n==='special'?10:4);
if(a!==pl&&cfg.leech)a.hp=Math.min(a.max,a.hp+dm*cfg.leech)}
d.hp=Math.max(0,d.hp-dm);
if(a===pl){if(!guard){combo++;comboT=1.6;ms.maxc=Math.max(ms.maxc,combo);pl.en=Math.min(100,pl.en+AT[k.n].e*ps.eng)}ms.dealt+=dm}
else{if(!guard)combo=0;ms.taken+=dm;pl.en=Math.min(100,pl.en+(guard?1:4*ps.eng))}
texts.push({x:px,y:py-30,s:(crit?'CRIT ':'')+Math.round(dm),l:.8,c:guard?'#9ee7ff':crit?'#fbbf24':'#fff'});
if(d.hp<=0){d.dead=true;d.act=null;d.blk=false;d.kd=999;d.vx=a.f*260;shake=14;Au.sfx('heavy')}}
function check(a,d){const k=a.act;if(!k||k.hit||k.t<k.s||k.t>k.s+k.a||d.dead||a.dead||d.inv>0)return;
const x1=a.x+a.f*10,x2=a.x+a.f*(10+k.rg);
if(Math.max(x1,x2)>=d.x-24&&Math.min(x1,x2)<=d.x+24&&a.y-120<d.y&&a.y-10>d.y-130)strike(a,d)}
function phys(f,dt){f.stun=Math.max(0,f.stun-dt);f.inv=Math.max(0,f.inv-dt);f.dcd=Math.max(0,f.dcd-dt);f.dodge=Math.max(0,f.dodge-dt);
if(f.dead)f.dt+=dt;else if(f.kd>0)f.kd-=dt;
const k=f.act;if(k){k.t+=dt;if(k.n==='special'&&k.t>k.s&&k.t<k.s+k.a)f.vx=f.f*430;if(k.t>=k.s+k.a+k.r)f.act=null}
f.vy+=1900*dt;f.y+=f.vy*dt;f.x+=f.vx*dt;if(f.y>=GY){f.y=GY;f.vy=0;f.air=false}else f.air=true;
if(!f.ctl)f.vx*=Math.pow(.004,dt);f.ctl=false;f.phase+=Math.abs(f.vx)*dt*.035;f.x=clamp(f.x,40,W-40)}
function doAct(a){const p=pl;if(!isFree(p))return false;const wp=WP[save.weapon];
if(a==='jump'){if(!p.air)p.vy=-700;return true}
if(a==='dodge'){if(p.dcd<=0){const i=input.held,d=i.right?1:i.left?-1:-p.f;p.dodge=.28;p.inv=.28;p.dcd=.8;p.vx=d*540;Au.sfx('dodge')}return true}
if(a==='special'&&p.en<100){note('Energy not full');return true}
begin(p,a,wp.range,wp.speed,ps.dmg);return true}
function control(){const p=pl,i=input.held;
if(isFree(p)){p.f=en.x>=p.x?1:-1;p.blk=!!i.block&&!p.air}else p.blk=false;
const keep=[];for(const m of input.q){if(time-m.t>.22)continue;if(!doAct(m.a))keep.push(m)}input.q=keep;
if(isFree(p)&&!p.blk){const d=(i.right?1:0)-(i.left?1:0);if(d){p.vx=d*235;p.ctl=true}}}
function enemyAtk(n){if(n==='special'&&en.en<100)n='heavy';begin(en,n,cfg.reach,cfg.wsp,cfg.dmg/8*(n==='special'?.6:1))}
function ai(dt){const e=en,p=pl;if(e.dead||p.dead){e.blk=false;return}
if(!isFree(e)){e.blk=false;return}
e.f=p.x>e.x?1:-1;const d=Math.abs(p.x-e.x),ar=34+AT.kick.rg*cfg.reach/50;
if(A.b>0){A.b-=dt;e.blk=true;if(A.b<=0){e.blk=false;if(cfg.counter&&d<ar){A.force='heavy';A.t=0}}return}
A.t-=dt;if(A.t>0){if(A.dir){e.vx=A.dir*cfg.spd;e.ctl=true}return}
A.t=cfg.react*(.6+.8*rnd());A.dir=0;
const k=p.act,threat=k&&k.t<k.s+k.a&&d<ar+40;
if(threat&&rnd()<cfg.def){if(e.dcd<=0&&rnd()<.3){e.dodge=.28;e.inv=.28;e.dcd=1.2;e.vx=-e.f*500}else A.b=.35+rnd()*.4;return}
if(A.force){enemyAtk(A.force);A.force=null;return}
if(d>ar){A.dir=rnd()<.35+cfg.aggr*.65?e.f:0;if(cfg.jump&&rnd()<.25&&!e.air)e.vy=-640;return}
if(rnd()<cfg.aggr){enemyAtk(pick(cfg.w));if(cfg.combo&&rnd()<cfg.combo){A.force=pick(cfg.w);A.t=.05}}else{A.dir=-e.f;A.t=.25}}
function fx(dt){for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);for(const t of texts){t.y-=40*dt;t.l-=dt}texts=texts.filter(t=>t.l>0)}
function amb_(dt){for(const p of amb){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>H)p.y=-5;if(p.y<-10)p.y=H;if(p.x>W+10)p.x=-5;if(p.x<-10)p.x=W}}
function initAmb(){amb=[];for(let i=0;i<(save.set.reduce?16:38);i++)amb.push({x:rnd()*W,y:rnd()*H,vx:(rnd()-.3)*30,vy:10+rnd()*30,s:1+rnd()*2.5})}
function step(dt){fightT+=dt;if(banner>0)banner-=dt;if(msgT>0)msgT-=dt;control();ai(dt);if(cfg.enr&&!en.dead)en.en=Math.min(100,en.en+cfg.enr*dt);
phys(pl,dt);phys(en,dt);
if(!pl.air&&!en.air){const d=en.x-pl.x;if(Math.abs(d)<42){const p=(42-Math.abs(d))/2*(d<0?-1:1);pl.x-=p;en.x+=p}}
check(pl,en);check(en,pl);comboT-=dt;if(comboT<=0)combo=0;fx(dt);
if(pl.dead||en.dead){endT+=dt;if(endT>1.7)finish(en.dead)}}
function clearHeld(){input.held={};input.q.length=0;document.querySelectorAll('[data-a]').forEach(e=>e.classList.remove('on'))}
function start(L,dev){Au.init();L=Math.max(1,Math.floor(SS.num(L,1,1,SS.MAXL)));devRun=!!dev;lvl=L;cfg=SS.levelConfig(L);ps=SS.playerStats(save);
pl=mk({x:260,f:1,hp:ps.hp,max:ps.hp});en=mk({x:700,f:-1,hp:cfg.hp,max:cfg.hp});
combo=0;comboT=0;fightT=0;endT=0;banner=1.8;parts=[];texts=[];ms={dealt:0,taken:0,maxc:0};A.t=.9;A.b=0;A.dir=0;A.force=null;
clearHeld();hide();initAmb();state='fight';stage.classList.add('fighting')}
function finish(win){state='result';stage.classList.remove('fighting');let rw=0;
if(!devRun){save.st.time+=Math.round(fightT);save.st.wuse[save.weapon]=(save.st.wuse[save.weapon]||0)+1;
if(win){rw=lvl>save.best?cfg.reward:Math.max(1,Math.floor(cfg.reward*.25));save.coins=Math.min(1e12,save.coins+rw);save.st.earned+=rw;save.st.wins++;save.st.kills++;
if(cfg.boss){save.st.boss++;save.st.top=Math.max(save.st.top,lvl)}save.best=Math.max(save.best,lvl);if(lvl>=save.level)save.level=Math.min(lvl+1,SS.MAXL)}else save.st.losses++;SS.persist(save)}
Au.sfx(win?'win':'lose');result(win,rw)}
function result(win,rw){const cheap=Math.min(...Object.keys(UPG).filter(k=>save.up[k]<UPG[k].max).map(k=>SS.upgradeCost(save.up[k])));
panel(win?'Victory!':'Defeat',[h('p',{cls:'sub'},`Level ${lvl}${cfg.boss?' · BOSS':''} — ${cfg.name}`),
h('ul',{cls:'sum'},h('li',null,`Time: ${fightT.toFixed(1)}s`),h('li',null,`Damage dealt: ${Math.round(ms.dealt)}`),h('li',null,`Damage taken: ${Math.round(ms.taken)}`),h('li',null,`Best combo: ${ms.maxc}`),win?h('li',null,`Reward: +${rw} coins`):null,win?h('li',null,'Enemies defeated: 1'):null),
devRun?h('p',{cls:'sub'},'Dev run: save untouched.'):null,
!win&&save.coins>=cheap?h('p',{cls:'sub'},'You can afford an upgrade. Try the shop before retrying.'):null,
win?btn(`Next Level (${lvl+1})`,()=>start(lvl+1,devRun),'btn primary'):btn('Retry',()=>start(lvl,devRun),'btn primary'),
win?btn('Replay',()=>start(lvl,devRun)):null,btn('Upgrades',()=>shop()),btn('Menu',menu)],win?'win':'lose')}
function pauseGame(){if(state!=='fight')return;state='pause';clearHeld();
panel('Paused',[btn('Resume',resume,'btn primary'),btn('Restart fight',()=>start(lvl,devRun)),btn('Settings',()=>settings(pauseBack)),btn('Controls',()=>controls(pauseBack)),btn('Return to menu',()=>{if(!devRun){save.st.time+=Math.round(fightT);SS.persist(save)}stage.classList.remove('fighting');menu()})])}
function pauseBack(){panel('Paused',[btn('Resume',resume,'btn primary'),btn('Restart fight',()=>start(lvl,devRun)),btn('Settings',()=>settings(pauseBack)),btn('Controls',()=>controls(pauseBack)),btn('Return to menu',()=>{stage.classList.remove('fighting');menu()})])}
function resume(){if(state!=='pause')return;hide();state='fight'}

const rr=(x,y,w,hh,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+hh,r);c.arcTo(x+w,y+hh,x,y+hh,r);c.arcTo(x,y+hh,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
function ridge(col,base,amp,fr,off){c.fillStyle=col;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=20)c.lineTo(x,base-amp*Math.sin(x*fr+off)-amp*.5*Math.sin(x*fr*2.3+off*2));c.lineTo(W,H);c.fill()}
function bg(){const a=AR[cfg.arena%AR.length],cx=(pl.x+en.x)/2-W/2;
let g=c.createLinearGradient(0,0,0,GY);g.addColorStop(0,a.a);g.addColorStop(1,a.b);c.fillStyle=g;c.fillRect(0,0,W,H);
const mx=760-cx*.02;g=c.createRadialGradient(mx,110,4,mx,110,130);g.addColorStop(0,a.m+'aa');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(mx-140,0,280,260);
c.fillStyle=a.m;c.beginPath();c.arc(mx,110,36,0,TAU);c.fill();
ridge(a.h,GY-110,36,.006,1+cx*.0006);ridge(a.g,GY-50,24,.011,3+cx*.0012);
c.fillStyle=a.g;for(let i=0;i<8;i++){const x=((i*150+60-cx*.3)%1200+1200)%1200-120;c.fillRect(x,50+i%3*30,8,GY-50);c.fillRect(x-14,110+i%4*40,36,3)}
g=c.createLinearGradient(0,GY,0,H);g.addColorStop(0,a.b);g.addColorStop(.15,a.g);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(0,GY,W,H-GY);
c.fillStyle=a.acc;c.globalAlpha=.8;c.fillRect(0,GY,W,2);c.globalAlpha=.12;c.fillRect(0,GY+2,W,10);c.globalAlpha=1;
c.fillStyle=a.fx==='ember'?'#fb923c':a.fx==='leaf'?'#34d399':'#e6f4ff';c.globalAlpha=.55;for(const p of amb)c.fillRect(p.x,p.y,p.s,a.fx==='leaf'?p.s*.6:p.s);c.globalAlpha=1}
function poly(pts,w,col){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.lineWidth=w;c.strokeStyle=col;c.stroke()}
const P=(x,y,a,l)=>[x+Math.cos(a)*l,y+Math.sin(a)*l];
function drawF(f,col,wk){const wp=WP[wk],k=f.act,H2=Math.PI/2,fxon=!save.set.reduce;
c.save();c.translate(f.x,f.y);c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(0,2,28,6,0,0,TAU);c.fill();c.scale(f.f,1);
if(f.dead||f.kd>0){const pr=f.dead?Math.min(1,f.dt/.3):clamp(Math.min((.9-f.kd)/.2,f.kd/.25),0,1);c.rotate(-H2*pr);c.translate(12*pr,0)}
if(f.inv>0&&!f.dead)c.globalAlpha=.5;
let lean=0,ft=H2-.28,fs=H2-.02,bt=H2+.3,bs=H2+.12,au=.55,af=-.5,bu=.95,bf=-1,crouch=0,spin=0;const w=Math.sin(f.phase)*.55;
if(!f.air){ft+=w*.9;bt-=w*.9;fs+=Math.max(0,-w)*.5;bs+=Math.max(0,w)*.5}else{ft=.7;fs=1.9;bt=1.7;bs=2.4}
if(f.dodge>0){lean=.5;crouch=14}
if(f.stun>0){lean=-.4;au=2.2;af=2.6;bu=2.4;bf=2.8}
if(f.blk){au=-.2;af=-1.7;bu=-.05;bf=-1.8;lean=.08}
if(k){const tot=k.s+k.a+k.r;let e=k.t<k.s?k.t/k.s*.4:k.t<k.s+k.a?.4+.6*(k.t-k.s)/k.a:1-(k.t-k.s-k.a)/k.r;e=clamp(e,0,1);
if(k.n==='punch'){au=lerp(.55,0,e);af=lerp(-.5,0,e);lean=e*.18}
else if(k.n==='kick'){ft=lerp(H2-.28,-.15,e);fs=lerp(H2,-.1,e);lean=-e*.2}
else if(k.n==='heavy'){if(k.t<k.s){const q=k.t/k.s;au=lerp(.55,-2.5,q);lean=-q*.25}else if(k.t<k.s+k.a){const q=(k.t-k.s)/k.a;au=lerp(-2.5,.4,q);lean=lerp(-.25,.3,q)}else{au=.4;lean=.3}af=au+.25;bu=au-.1;bf=au+.1}
else{spin=clamp((k.t-k.s)/k.a,0,1)*TAU;ft=-.1;fs=-.1;au=0;af=0;lean=.1}}
const hy=-64+crouch*.6,sx=Math.sin(lean)*44,sy=hy-Math.cos(lean)*44,hx=sx+Math.sin(lean)*15,hh=sy-Math.cos(lean)*15;
c.save();if(spin){c.translate(0,hy+18);c.rotate(spin);c.translate(0,-(hy+18))}
const kn=P(0,hy,ft,30),fo=P(kn[0],kn[1],fs,32),bk=P(0,hy,bt,30),bo=P(bk[0],bk[1],bs,32),
ae=P(sx,sy,au,26),ah=P(ae[0],ae[1],af,24),be=P(sx,sy,bu,26),bh=P(be[0],be[1],bf,24);
const L=[[[sx,sy],be,bh,8],[[0,hy],bk,bo,9],[[0,hy],[sx,sy],null,13],[[0,hy],kn,fo,9],[[sx,sy],ae,ah,8]];
const pts=l=>l[2]?[l[0],l[1],l[2]]:[l[0],l[1]];
c.lineCap='round';c.lineJoin='round';if(fxon){c.shadowColor=col;c.shadowBlur=9}
for(const l of L)poly(pts(l),l[3]+3,col);c.shadowBlur=0;for(const l of L)poly(pts(l),l[3],'#04050b');
c.fillStyle='#04050b';c.strokeStyle=col;c.lineWidth=2.5;c.beginPath();c.arc(hx,hh,11,0,TAU);c.fill();c.stroke();c.fillStyle=col;c.fillRect(hx+2,hh-3,8,2.5);
const sc=Math.sin(time*8)*3;poly([[hx-8,hh-2],[hx-22,hh+3+sc],[hx-36,hh+8-sc]],4,col);
if(wp.len){const wa=k&&k.n!=='kick'?af:af-.5,s0=P(ah[0],ah[1],wa,-wp.len*.18),e0=P(ah[0],ah[1],wa,wp.len);
if(fxon){c.shadowColor=wp.color;c.shadowBlur=10}poly([s0,e0],4,wp.color);
if(wk==='hammer')poly([P(ah[0],ah[1],wa,wp.len-18),e0],16,wp.color);
if(wk==='blades')poly([P(bh[0],bh[1],bf-.4,-6),P(bh[0],bh[1],bf-.4,wp.len*.85)],4,wp.color);c.shadowBlur=0}
c.restore();
if(k&&k.t>=k.s&&k.t<k.s+k.a){c.globalAlpha=.3;c.fillStyle=wp.len?wp.color:col;c.beginPath();const cy=k.n==='kick'?hy+25:sy+8;c.moveTo(8,cy);c.arc(8,cy,k.rg+14,-.7,.7);c.closePath();c.fill()}
c.restore()}
function bar(x,y,w,hh,r,c1,c2,rtl){c.fillStyle='rgba(8,8,24,.72)';rr(x,y,w,hh,hh/2);c.fill();
if(r>0){const fw=Math.max(hh,w*r),g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;rr(rtl?x+w-fw:x,y,fw,hh,hh/2);c.fill()}
c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.5;rr(x,y,w,hh,hh/2);c.stroke()}
const FN=s=>`700 ${s}px "Trebuchet MS","Segoe UI",system-ui,sans-serif`;
function hud(){c.textBaseline='alphabetic';
bar(24,18,350,20,pl.hp/pl.max,'#22d3ee','#34d399');bar(24,44,230,9,pl.en/100,'#a855f7',pl.en>=100?'#fbbf24':'#e879f9');
bar(W-374,18,350,20,en.hp/en.max,'#fb7185','#e11d9b',true);
c.font=FN(13);c.fillStyle='#eaf2ff';c.textAlign='left';c.fillText(`YOU · ${WP[save.weapon].name}`,26,72);c.fillText(pl.en>=100?'SPECIAL READY (E)':'ENERGY',262,53);
c.textAlign='right';c.fillText(cfg.name+(cfg.mods.length?' · '+cfg.mods.join(' / '):''),W-26,60);
c.textAlign='center';c.font=FN(18);c.fillText(`${cfg.boss?'BOSS ':''}LEVEL ${lvl}`,W/2,34);c.font=FN(12);c.fillStyle='#b9c4e8';c.fillText(AR[cfg.arena%AR.length].n,W/2,52);
if(combo>1){c.textAlign='right';c.font=FN(24+Math.min(combo,10)*2);c.fillStyle='#fbbf24';c.fillText(`${combo} HIT COMBO`,W-28,130)}
for(const t of texts){c.globalAlpha=clamp(t.l*2,0,1);c.font=FN(20);c.fillStyle=t.c;c.textAlign='center';c.fillText(t.s,t.x,t.y)}c.globalAlpha=1;
if(msgT>0){c.textAlign='center';c.font=FN(18);c.fillStyle='#fbbf24';c.fillText(msg,W/2,92)}
if(banner>0){c.globalAlpha=clamp(banner,0,1);c.textAlign='center';c.font=FN(46);c.fillStyle='#fff';c.fillText(cfg.boss?'BOSS FIGHT':`LEVEL ${lvl}`,W/2,230);c.font=FN(20);c.fillStyle='#fbbf24';c.fillText(cfg.name,W/2,262);c.globalAlpha=1}
if(endT>0.05){c.textAlign='center';c.font=FN(70);c.fillStyle=en.dead?'#fbbf24':'#fb7185';c.fillText(en.dead?'K.O.':'DEFEATED',W/2,250)}}
function render(){c.save();if(shake>0&&!save.set.reduce){c.translate((rnd()-.5)*shake,(rnd()-.5)*shake);shake*=.88;if(shake<.3)shake=0}
bg();drawF(en,cfg.color,cfg.weapon);drawF(pl,'#22d3ee',save.weapon);
for(const p of parts){c.globalAlpha=clamp(p.l*3,0,1);c.fillStyle=p.c;c.fillRect(p.x,p.y,3,3)}c.globalAlpha=1;
if(state==='fight'||state==='pause')hud();c.restore()}
function loop(ts){requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;time+=dt;
if(state==='fight')step(dt);if(state!=='pause')amb_(dt);render()}

const KM={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'jump',ArrowUp:'jump',KeyS:'block',ArrowDown:'block',Space:'block',KeyJ:'punch',KeyK:'kick',KeyL:'heavy',ShiftLeft:'dodge',ShiftRight:'dodge',KeyE:'special',KeyI:'special'},TAP=new Set(['jump','punch','kick','heavy','dodge','special']);
const press=a=>{Au.init();input.held[a]=true;if(TAP.has(a))input.q.push({a,t:time})},release=a=>{input.held[a]=false};
window.addEventListener('keydown',e=>{if(e.code==='Escape'||e.code==='KeyP'){if(state==='fight')pauseGame();else if(state==='pause')resume();return}
if(state!=='fight')return;const a=KM[e.code];if(!a)return;e.preventDefault();if(!e.repeat)press(a)});
window.addEventListener('keyup',e=>{const a=KM[e.code];if(a)release(a)});
document.querySelectorAll('[data-a]').forEach(el=>{const a=el.dataset.a,up=()=>{release(a);el.classList.remove('on')};
el.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='fight')return;try{el.setPointerCapture(e.pointerId)}catch(x){}press(a);el.classList.add('on')});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>el.addEventListener(n,up))});
$('pauseBtn').addEventListener('click',pauseGame);
stage.addEventListener('contextmenu',e=>e.preventDefault());
const lose=()=>{clearHeld();if(state==='fight')pauseGame()};
window.addEventListener('blur',lose);document.addEventListener('visibilitychange',()=>{if(document.hidden)lose()});
if(/[?&]dev=1/.test(location.search))window.SSDev={play:n=>start(n,true),peek:()=>({state,pl,en,cfg}),press,release,
sim:(a,b)=>{let bad=0;for(let n=a;n<=b;n++){const q=SS.levelConfig(n);for(const k of['hp','dmg','spd','aggr','def','react','reward'])if(!Number.isFinite(q[k]))bad++}return{checked:b-a+1,invalid:bad}}};
cfg=SS.levelConfig(save.level);pl=mk({x:300});en=mk({x:660,f:-1});initAmb();applyTouch();Au.vol();menu();requestAnimationFrame(loop);
})();
