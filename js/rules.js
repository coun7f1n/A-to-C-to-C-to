export const opposite = gender => gender === 'M' ? 'F' : 'M';
export const fits = (a, b) => a.type === b.type && a.gender !== b.gender;
export function matchEnd(port, adapter) { return adapter.ends.findIndex(end => fits(port, end)); }
export function connectionPoints(seconds) { return Math.round(100 * (1 + Math.max(0, 1 - seconds / 6) * 2)); }
export function makeAdapter(type = Math.random() < .5 ? 'A' : 'C', gender = Math.random() < .5 ? 'M' : 'F') {
  return { ends: [{type, gender}, {type: type === 'A' ? 'C' : 'A', gender: Math.random() < .5 ? 'M' : 'F'}], bent: Math.random() < .5 };
}
export function hitChain(chain, strikes) { if (chain.length > 1) chain.pop(); return {strikes: strikes + 1, dead: strikes + 1 >= 2}; }

// These tip positions also drive rendering, so visible ports and docking agree.
export function portPose(a, end, x = a.x, y = a.y, angle = a.angle || 0) {
  const bent = end === 1 && a.bent;
  const px = end === 0 ? -40 : bent ? 11 : 34;
  const py = bent ? 33 : 0;
  const direction = angle + (end === 0 ? Math.PI : bent ? Math.PI / 2 : 0);
  return {x:x + px*Math.cos(angle)-py*Math.sin(angle), y:y + px*Math.sin(angle)+py*Math.cos(angle), dx:Math.cos(direction), dy:Math.sin(direction)};
}
export function headAngle(a, heading) {
  return heading - (a.openEnd === 0 ? Math.PI : a.bent ? Math.PI / 2 : 0);
}

// Walk back from the active adapter. Each previous open port meets the
// next adapter's consumed port, with their outward normals opposing.
export function chainPoses(chain, x, y, heading) {
  if (!chain.length) return [];
  const poses = new Array(chain.length);
  const last = chain.length - 1;
  poses[last] = {x, y, angle: headAngle(chain[last], heading)};
  for (let i = last - 1; i >= 0; i--) {
    const next = chain[i + 1], pose = poses[i + 1];
    const joint = portPose(next, 1 - (next.openEnd ?? 1), pose.x, pose.y, pose.angle);
    const angle = headAngle(chain[i], Math.atan2(-joint.dy, -joint.dx));
    const offset = portPose(chain[i], chain[i].openEnd ?? 1, 0, 0, angle);
    poses[i] = {x: joint.x - offset.x, y: joint.y - offset.y, angle};
  }
  return poses;
}
export function dockingEnd(port, a, tip, movement) {
  return a.ends.findIndex((end,i)=>{
    if(!fits(port,end))return false;
    const target=portPose(a,i), x=tip.x-target.x, y=tip.y-target.y;
    const gap=x*target.dx+y*target.dy;
    const lateral=Math.abs(x*target.dy-y*target.dx);
    return gap>=-4 && gap<=10 && lateral<=10 &&
      tip.dx*target.dx+tip.dy*target.dy < -.99 &&
      movement.x*target.dx+movement.y*target.dy < 0;
  });
}
