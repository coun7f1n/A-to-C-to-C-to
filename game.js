import {World} from './js/world.js';
import {connectionPoints} from './js/rules.js';
const $=id=>document.getElementById(id);
const world=new World($('game'),message=>$('status').textContent=message);
let best=0;try{best=Number(localStorage.getItem('port-authority-best'))||0;}catch{}
let mode='welcome';
function overlay(tag,title,copy,button){$('overlay').classList.remove('hidden');$('modal-tag').textContent=tag;$('modal-title').textContent=title;$('modal-copy').textContent=copy;$('start').textContent=button;}
function start(){if(mode!=='paused')world.reset();world.running=true;mode='playing';$('overlay').classList.add('hidden');$('status').textContent='Find USB-C female (C F). Watch the edges and equipment.';}
function pause(){if(mode==='playing'){world.running=false;world.keys.clear();mode='paused';overlay('OFF THE CLOCK','Take a breather.','Your bench is exactly where you left it.','Resume shift →');}else if(mode==='paused')start();}
$('start').addEventListener('click',()=>{start();$('start').blur();});$('restart').addEventListener('click',()=>{mode='welcome';start();$('restart').blur();});
const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
window.addEventListener('keydown',e=>{const key=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(key){e.preventDefault();world.keys.add(key);}if((e.code==='Space'||e.key==='Escape')&&!e.repeat&&e.target.tagName!=='BUTTON'){e.preventDefault();pause();}});
window.addEventListener('keyup',e=>world.keys.delete(keyMap[e.key]||keyMap[e.key.toLowerCase()]));window.addEventListener('blur',()=>{world.keys.clear();if(mode==='playing')pause();});
document.querySelectorAll('[data-dir]').forEach(button=>{button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);world.keys.add(button.dataset.dir);});['pointerup','pointercancel','lostpointercapture'].forEach(event=>button.addEventListener(event,()=>world.keys.delete(button.dataset.dir)));});
function hud(){$('score').textContent=String(world.score).padStart(4,'0');$('count').innerHTML=`${world.count} <small>/ 12</small>`;$('bonus').textContent=`×${(connectionPoints(world.lastFit===null?6:world.elapsed-world.lastFit)/100).toFixed(1)}`;$('best').textContent=String(best).padStart(4,'0');$('port').textContent=`USB-${world.port.type} · ${world.port.gender==='M'?'MALE':'FEMALE'}`;$('need').textContent=`Find USB-${world.port.type} ${world.port.gender==='M'?'female (F)':'male (M)'}`;$('strikes').textContent=world.strikes===0?'○ ○':world.strikes===1?'● ○':'● ●';}
let previous=0,accumulator=0;
function frame(time){accumulator+=Math.min((time-previous)/1000,.05);previous=time;while(accumulator>=1/60){world.update(1/60);accumulator-=1/60;}world.draw();if(world.score>best){best=world.score;try{localStorage.setItem('port-authority-best',String(best));}catch{}}hud();if(mode==='playing'&&(world.dead||world.won)){mode='ended';world.keys.clear();overlay(world.won?'WORK ORDER COMPLETE':'SHIFT ENDED',world.won?'A perfect fit.':'Unplugged.',`${world.count} adapters fitted · ${world.score} points. ${world.won?'The service bench is back in business.':'Two collisions without a new connection. Try a fresh chain.'}`,'Start a new shift →');}requestAnimationFrame(frame);}requestAnimationFrame(frame);
