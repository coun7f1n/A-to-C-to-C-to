import {fits,opposite,makeAdapter,matchEnd,connectionPoints,hitChain,portPose,headAngle,dockingEnd,chainPoses} from './rules.js';
import {bench,adapter,round} from './draw.js';
export class World {
 constructor(canvas,notify){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.notify=notify;this.keys=new Set();this.reset();}
 reset(){this.x=550;this.y=350;this.heading=0;this.chain=[{ends:[{type:'A',gender:'F'},{type:'C',gender:'M'}],bent:false,openEnd:1,port:{type:'C',gender:'M'}}];this.port=this.chain[0].port;this.score=0;this.count=0;this.strikes=0;this.elapsed=0;this.lastFit=null;this.invulnerable=0;this.flash=0;this.running=false;this.dead=false;this.won=false;this.particles=[];this.items=[];this.obstacles=[{x:420,y:70,w:202,h:78,kind:'keyboard'},{x:820,y:265,w:94,h:84,kind:'tray'},{x:150,y:400,w:112,h:88,kind:'note'}];for(let i=0;i<10;i++)this.spawn(i===0);this.ensureMatch();}
 blocked(x,y,r=25){return x<30+r||x>1090-r||y<30+r||y>610-r||this.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);}
 spawn(guaranteed=false){let x,y,valid=false;for(let i=0;i<400;i++){x=75+Math.random()*970;y=85+Math.random()*470;if(!this.blocked(x,y,85)&&Math.hypot(x-this.x,y-this.y)>115&&this.items.every(a=>Math.hypot(x-a.x,y-a.y)>140)){valid=true;break;}}if(!valid)return;const a=guaranteed?makeAdapter(this.port.type,opposite(this.port.gender)):makeAdapter();this.items.push({...a,x,y,angle:Math.floor(Math.random()*4)*Math.PI/2,cooldown:0});}
 ensureMatch(){if(!this.items.some(a=>a.ends.some(e=>fits(this.port,e)))){if(this.items.length)this.items[0].ends[0]={type:this.port.type,gender:opposite(this.port.gender)};else this.spawn(true);}}
 update(dt){if(!this.running)return;this.elapsed+=dt;this.invulnerable=Math.max(0,this.invulnerable-dt);this.flash=Math.max(0,this.flash-dt);let dx=(this.keys.has('right')?1:0)-(this.keys.has('left')?1:0),dy=(this.keys.has('down')?1:0)-(this.keys.has('up')?1:0);if(dx&&dy){if(Math.abs(Math.cos(this.heading))>.5)dy=0;else dx=0;}let moved=false;const length=Math.hypot(dx,dy);if(length){this.heading=Math.atan2(dy,dx);dx=dx/length*205*dt;dy=dy/length*205*dt;const nx=this.x+dx,ny=this.y+dy;if(this.blocked(nx,ny)){if(!this.invulnerable)this.hit();}else{this.x=nx;this.y=ny;moved=true;}}if(!this.running)return;
 const head=this.chain[this.chain.length-1];
 const tip=portPose(head,head.openEnd??1,this.x,this.y,headAngle(head,this.heading));
 for(const a of [...this.items]){
   a.cooldown=Math.max(0,a.cooldown-dt);
   const end=dockingEnd(this.port,a,tip,{x:moved?dx:0,y:moved?dy:0});
   if(end>=0){this.connect(a,end);break;}
   if(length&&Math.hypot(a.x-this.x,a.y-this.y)<65&&!a.cooldown){
     a.cooldown=1.5;
     this.notify(matchEnd(this.port,a)>=0?'Line up with the labeled port and approach straight into its opening.':`Doesn't fit. Find USB-${this.port.type} ${this.port.gender==='M'?'female (F)':'male (M)'}.`);
   }
 }
 this.particles=this.particles.filter(p=>(p.life-=dt)>0);this.particles.forEach(p=>p.y-=dt*28);}
 connect(a,end){const seconds=this.lastFit===null?6:this.elapsed-this.lastFit;const points=connectionPoints(seconds);this.score+=points;this.count++;this.strikes=0;this.lastFit=this.elapsed;this.port={...a.ends[1-end]};this.chain.push({...a,openEnd:1-end,port:this.port});this.items.splice(this.items.indexOf(a),1);this.particles.push({x:a.x,y:a.y-35,text:`CLICK! +${points}`,life:1.6});this.notify(`Connected! +${points} points. Now find USB-${this.port.type} ${opposite(this.port.gender)==='F'?'female':'male'}.`);this.spawn();this.ensureMatch();if(this.count>=12){this.won=true;this.running=false;}}
 hit(){const result=hitChain(this.chain,this.strikes);this.strikes=result.strikes;this.port=this.chain[this.chain.length-1].port;this.invulnerable=1.4;this.flash=.3;this.dead=result.dead;this.running=!this.dead;this.ensureMatch();this.notify(this.dead?'Two hits without a connection. Shift ended.':'Adapter knocked loose! Make a connection before the next hit.');}
 draw(){const c=this.ctx;bench(c,1120,640,this.obstacles);for(const a of this.items){adapter(c,a,a.x,a.y);
 a.ends.forEach((end,i)=>{const p=portPose(a,i);const matching=fits(this.port,end);c.strokeStyle=matching?'#d5ed83':'#a7bcb2';c.lineWidth=matching?2:1;c.beginPath();c.moveTo(p.x+p.dx*5,p.y+p.dy*5);c.lineTo(p.x+p.dx*23,p.y+p.dy*23);c.stroke();c.font='bold 10px monospace';c.textAlign='center';c.fillStyle=matching?'#eaffad':'#e0e8d7';c.fillText(`${end.type} ${end.gender}`,p.x+p.dx*37,p.y+p.dy*37+4);});}
 const poses=chainPoses(this.chain,this.x,this.y,this.heading);
 for(let i=0;i<this.chain.length-1;i++){const p=poses[i];adapter(c,this.chain[i],p.x,p.y,true,1,p.angle);}
 c.save();if(this.invulnerable&&Math.floor(this.invulnerable*12)%2)c.globalAlpha=.4;c.strokeStyle='#d5ed8355';c.lineWidth=2;c.beginPath();c.arc(this.x,this.y,42,0,Math.PI*2);c.stroke();const head=this.chain[this.chain.length-1];adapter(c,head,this.x,this.y,true,1,headAngle(head,this.heading));const tip=portPose(head,head.openEnd??1,this.x,this.y,headAngle(head,this.heading));c.fillStyle='#f0ffc1';c.beginPath();c.arc(tip.x,tip.y,4,0,Math.PI*2);c.fill();c.restore();round(c,this.x-26,this.y-49,52,17,4,'#d5ed83');c.fillStyle='#253a31';c.textAlign='center';c.font='bold 9px monospace';c.fillText('YOU',this.x,this.y-37);
 for(const p of this.particles){c.globalAlpha=Math.min(1,p.life);c.fillStyle='#e8ffa5';c.font='bold 18px monospace';c.fillText(p.text,p.x,p.y);}c.globalAlpha=1;c.textAlign='left';if(this.flash){c.fillStyle='#ff765522';c.fillRect(0,0,1120,640);}}
}
