export function round(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
export function adapter(ctx,a,x,y,active=false,scale=1,angle=a.angle||0){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.shadowColor='#091b1b80';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
 const color=active?'#d5ed83':'#e4e3d4';
 round(ctx,-24,-11,40,22,5,color);if(a.bent)round(ctx,3,-7,16,27,4,color);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 const positions=[[-31,0],[a.bent?11:25,a.bent?24:0]];
 a.ends.forEach((end,i)=>{ctx.save();ctx.translate(...positions[i]);if(i===1&&a.bent)ctx.rotate(Math.PI/2);round(ctx,-9,-8,18,16,end.type==='C'?7:2,'#9eaaa6');round(ctx,-6,-5,12,10,end.type==='C'?5:1,end.gender==='F'?'#192c2e':'#dae0d9');ctx.fillStyle=end.gender==='F'?'#547c84':'#568b9f';ctx.fillRect(-4,-2,8,4);ctx.restore();});
 ctx.fillStyle='#394842';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(a.bent?'90°':'USB',-5,3);ctx.restore();
}
export function bench(ctx,w,h,obstacles){
 ctx.fillStyle='#a49378';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#8e7d6538';ctx.lineWidth=1;for(let y=5;y<h;y+=12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+3);ctx.stroke();}
 round(ctx,22,22,w-44,h-44,13,'#375b58');ctx.save();ctx.beginPath();ctx.rect(28,28,w-56,h-56);ctx.clip();ctx.strokeStyle='#9bb8a01b';for(let x=28;x<w;x+=24){ctx.beginPath();ctx.moveTo(x,28);ctx.lineTo(x,h-28);ctx.stroke();}for(let y=28;y<h;y+=24){ctx.beginPath();ctx.moveTo(28,y);ctx.lineTo(w-28,y);ctx.stroke();}ctx.restore();
 ctx.fillStyle='#b9cfb65c';ctx.font='10px monospace';ctx.fillText('ANTI-STATIC SERVICE MAT / ESD SAFE',43,h-40);ctx.fillText('PORT AUTHORITY — REPAIR & REUSE',43,48);
 obstacles.forEach(o=>{ctx.save();ctx.shadowColor='#10242370';ctx.shadowBlur=10;ctx.shadowOffsetY=6;round(ctx,o.x,o.y,o.w,o.h,8,o.kind==='keyboard'?'#c0c3b3':o.kind==='tray'?'#7d8e87':'#d6ac63');ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 if(o.kind==='keyboard'){for(let row=0;row<3;row++)for(let col=0;col<8;col++)round(ctx,o.x+10+col*23,o.y+10+row*20,18,14,2,'#e4e5d8');}
 if(o.kind==='tray'){round(ctx,o.x+8,o.y+8,o.w-16,o.h-16,5,'#506560');ctx.fillStyle='#a9b4a9';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(o.x+22+i%3*23,o.y+22+Math.floor(i/3)*26,4,0,7);ctx.fill();}}
 if(o.kind==='note'){ctx.fillStyle='#5d5134';ctx.font='bold 12px monospace';ctx.fillText('TO FIX:',o.x+12,o.y+25);ctx.font='11px monospace';ctx.fillText('USB hub',o.x+12,o.y+45);ctx.fillText('Ticket #014',o.x+12,o.y+64);}ctx.restore();});
}
