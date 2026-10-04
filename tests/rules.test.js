import test from 'node:test';
import assert from 'node:assert/strict';
import {fits,matchEnd,connectionPoints,hitChain} from '../js/rules.js';
import {World} from '../js/world.js';
import {portPose,headAngle,dockingEnd,chainPoses} from '../js/rules.js';

test('mixed straight and elbow chains stay joined through every turn and either attachment end',()=>{
 for(let mask=0;mask<64;mask++)for(let direction=0;direction<4;direction++){
  const chain=Array.from({length:3},(_,i)=>({bent:!!(mask&(1<<i)),openEnd:(mask>>(i+3))&1}));
  const poses=chainPoses(chain,550,350,direction*Math.PI/2);
  for(let i=0;i<chain.length-1;i++){
   const a=poses[i],b=poses[i+1];
   const left=portPose(chain[i],chain[i].openEnd,a.x,a.y,a.angle);
   const right=portPose(chain[i+1],1-chain[i+1].openEnd,b.x,b.y,b.angle);
   assert(Math.hypot(left.x-right.x,left.y-right.y)<1e-9,'port tips must touch');
   assert(Math.abs(left.dx*right.dx+left.dy*right.dy+1)<1e-9,'joined ports must face each other');
  }
 }
});
test('an elbow bends the following straight adapter by ninety degrees',()=>{
 const chain=[{bent:false,openEnd:1},{bent:true,openEnd:1}];
 const poses=chainPoses(chain,550,350,0);
 assert(Math.abs(Math.cos(poses[0].angle))<1e-9);
 assert.equal(poses[1].angle,-Math.PI/2);
 assert.deepEqual(chainPoses([],0,0,0),[]);
});

test('docking requires the correct side, facing, alignment, and inward motion in every orientation',()=>{
 for(const bent of [false,true])for(let rotation=0;rotation<4;rotation++)for(const end of [0,1]){
  const a={x:400,y:300,angle:rotation*Math.PI/2,bent,ends:[{type:'A',gender:'F'},{type:'C',gender:'M'}]};
  const p=portPose(a,end),port={type:a.ends[end].type,gender:end===0?'M':'F'};
  const tip={x:p.x+p.dx*5,y:p.y+p.dy*5,dx:-p.dx,dy:-p.dy};
  const movement={x:-p.dx,y:-p.dy};
  assert.equal(dockingEnd(port,a,tip,movement),end);
  assert.equal(dockingEnd(port,a,tip,{x:0,y:0}),-1);
  assert.equal(dockingEnd(port,a,tip,{x:p.dx,y:p.dy}),-1);
  assert.equal(dockingEnd(port,a,{...tip,dx:p.dx,dy:p.dy},movement),-1);
  assert.equal(dockingEnd(port,a,{...tip,x:p.x-p.dx*15,y:p.y-p.dy*15},movement),-1);
  assert.equal(dockingEnd(port,a,{...tip,x:tip.x+p.dy*20,y:tip.y-p.dx*20},movement),-1);
 }
});
test('either open end faces movement on straight and bent player adapters',()=>{
 for(const bent of [false,true])for(const openEnd of [0,1])for(let d=0;d<4;d++){
  const a={bent,openEnd},heading=d*Math.PI/2;
  const p=portPose(a,openEnd,0,0,headAngle(a,heading));
  assert(Math.abs(p.dx-Math.cos(heading))<1e-9);
  assert(Math.abs(p.dy-Math.sin(heading))<1e-9);
 }
});
test('world movement docks from the front but does not collect on center overlap',()=>{
 const w=new World({getContext:()=>({})},()=>{});
 const item={x:400,y:350,angle:0,bent:false,ends:[{type:'C',gender:'F'},{type:'A',gender:'M'}],cooldown:0};
 w.items=[item];w.x=400;w.y=350;w.running=true;w.update(1/60);assert.equal(w.count,0);
 w.x=320;w.keys.add('right');w.update(1/60);assert.equal(w.count,1);
 assert.equal(w.chain.at(-1).openEnd,1);
 w.keys.clear();w.keys.add('up');w.update(1/60);assert.equal(w.heading,-Math.PI/2);
});
test('only the same USB type and opposite gender fit',()=>{for(const type of ['A','C'])for(const gender of ['M','F'])for(const t of ['A','C'])for(const g of ['M','F'])assert.equal(fits({type,gender},{type:t,gender:g}),type===t&&gender!==g);});
test('either end can connect; quick connections earn more',()=>{assert.equal(matchEnd({type:'C',gender:'M'},{ends:[{type:'A',gender:'M'},{type:'C',gender:'F'}]}),1);assert.equal(connectionPoints(0),300);assert.equal(connectionPoints(3),200);assert.equal(connectionPoints(20),100);});
test('collisions remove a connector and the second consecutive hit kills',()=>{const chain=[1,2,3];assert.deepEqual(hitChain(chain,0),{strikes:1,dead:false});assert.equal(chain.length,2);assert.deepEqual(hitChain(chain,1),{strikes:2,dead:true});assert.equal(chain.length,1);});
const makeWorld=()=>new World({getContext:()=>({})},()=>{});
test('fit clears a strike, exposes unused end, and wall hit restores previous port',()=>{const w=makeWorld();w.strikes=1;const a={ends:[{type:'C',gender:'F'},{type:'A',gender:'M'}],x:300,y:300};w.items.push(a);w.connect(a,0);assert.equal(w.strikes,0);assert.deepEqual(w.port,{type:'A',gender:'M'});assert.equal(w.score,100);w.hit();assert.deepEqual(w.port,{type:'C',gender:'M'});assert.equal(w.dead,false);w.hit();assert.equal(w.dead,true);});
test('boards always offer a match and twelve connections win',()=>{for(let i=0;i<30;i++){const w=makeWorld();assert(w.items.some(a=>matchEnd(w.port,a)>=0));for(let n=0;n<12;n++){const a=w.items.find(a=>matchEnd(w.port,a)>=0);assert(a);w.connect(a,matchEnd(w.port,a));}assert(w.won);}});
