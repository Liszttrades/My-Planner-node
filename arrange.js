/* Deterministic chronological layouts; grouped items move as one unit. */
function planCardLayout(units,edges,pattern,obstacles=[]){
 if(!units.length)return new Map();
 const ordered=[...units].sort((a,b)=>a.created-b.created||a.order-b.order),index=new Map(ordered.map((u,i)=>[u.id,i])),rank=ordered.map(()=>0),parents=ordered.map(()=>[]);
 for(const e of edges){let a=index.get(e.from),b=index.get(e.to);if(a===undefined||b===undefined||a===b)continue;if(a>b)[a,b]=[b,a];parents[b].push(a)}
 for(let i=0;i<ordered.length;i++)for(const p of parents[i])rank[i]=Math.max(rank[i],rank[p]+1);
 const hasLinks=parents.some(p=>p.length),cols=new Map(),columns=pattern==='vertical'?1:Math.ceil(Math.sqrt(ordered.length));
 ordered.forEach((u,i)=>{const col=pattern==='flow'&&hasLinks?rank[i]:pattern==='vertical'?0:i%columns;if(!cols.has(col))cols.set(col,[]);cols.get(col).push(u)});
 const gapX=120,gapY=64,origin={x:ordered[0].x,y:ordered[0].y},placed=[...obstacles],result=new Map();let x=origin.x;
 const overlap=(a,b)=>a.x<b.x+b.w+24&&a.x+a.w+24>b.x&&a.y<b.y+b.h+24&&a.y+a.h+24>b.y;
 // Lay out branches from their leaves back to their parents.
 if(pattern==='flow'&&hasLinks){
  const levels=[...cols].sort((a,b)=>a[0]-b[0]),xs=new Map();let columnX=origin.x;
  for(const [level,list] of levels){xs.set(level,columnX);columnX+=Math.max(...list.map(u=>u.w))+gapX}
  const children=ordered.map(()=>[]);parents.forEach((ps,i)=>ps.forEach(parent=>children[parent].push(i)));
  for(const [level,list] of [...levels].reverse()){let floor=origin.y;for(const u of list){const descendants=children[index.get(u.id)].map(i=>ordered[i]).filter(child=>result.has(child.id));const center=descendants.length?descendants.reduce((sum,child)=>sum+result.get(child.id).y+child.h/2,0)/descendants.length:null;const rect={x:xs.get(level),y:Math.max(floor,center===null?floor:center-u.h/2),w:u.w,h:u.h};let hits;while((hits=placed.filter(p=>overlap(rect,p))).length)rect.y=Math.max(...hits.map(p=>p.y+p.h))+gapY;result.set(u.id,{x:rect.x,y:rect.y});placed.push(rect);floor=rect.y+u.h+gapY}}
  return result;
 }
 // Grid rows use their tallest unit, preserving chronological reading order.
 const rows=[];if(pattern!=='flow'||!hasLinks)for(let i=0;i<ordered.length;i+=columns)rows.push(Math.max(...ordered.slice(i,i+columns).map(u=>u.h)));
 for(const [col,list] of [...cols].sort((a,b)=>a[0]-b[0])){let y=origin.y;for(const u of list){if(pattern!=='flow'||!hasLinks){const row=Math.floor(index.get(u.id)/columns);y=origin.y+rows.slice(0,row).reduce((sum,h)=>sum+h+gapY,0)}let rect={x,y,w:u.w,h:u.h};let hits;while((hits=placed.filter(p=>overlap(rect,p))).length)rect.y=Math.max(...hits.map(p=>p.y+p.h))+gapY;result.set(u.id,{x:rect.x,y:rect.y});placed.push(rect);y=rect.y+u.h+gapY}x+=Math.max(...list.map(u=>u.w))+gapX}
 return result;
}
(() => {
 const button=document.createElement('button');button.id='arrangeCards';button.dataset.tooltip='Arrange cards';button.setAttribute('aria-label','Arrange cards');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 7h3v11h3M12 6h3"/></svg>';$('#planningUtilities').prepend(button);
 const dialog=document.createElement('dialog');dialog.id='arrangeDialog';dialog.setAttribute('aria-labelledby','arrangeTitle');dialog.innerHTML='<form method="dialog"><div class="arrange-heading"><h2 id="arrangeTitle">Arrange cards</h2><button value="cancel" aria-label="Close arrange cards">×</button></div><p>Give your board a clear order, from oldest to newest.</p><label>Pattern<select id="arrangePattern"><option value="flow">Branching flow · left to right</option><option value="grid">Grid · oldest first</option><option value="vertical">Vertical · oldest at the top</option></select></label><label>Arrange<select id="arrangeScope"><option value="all">All cards</option><option value="selection">Selected cards</option></select></label><p class="arrange-hint">Groups stay together. Locked items stay in place. Existing cards use their original order when a creation date is unavailable.</p><div class="arrange-footer"><button value="cancel">Cancel</button><button type="button" id="applyArrange">Arrange</button></div></form>';document.body.append(dialog);
 const chooser=document.createElement('fieldset');chooser.className='arrange-patterns';chooser.innerHTML='<legend>Layout</legend>'+[['flow','Branching','<path d="M22 28h20M42 12v32M42 12h18M42 28h18M42 44h18"/><rect x="6" y="21" width="16" height="14" rx="3"/><rect x="60" y="5" width="16" height="14" rx="3"/><rect x="60" y="21" width="16" height="14" rx="3"/><rect x="60" y="37" width="16" height="14" rx="3"/>'],['grid','Grid','<rect x="15" y="9" width="20" height="14" rx="3"/><rect x="47" y="9" width="20" height="14" rx="3"/><rect x="15" y="33" width="20" height="14" rx="3"/><rect x="47" y="33" width="20" height="14" rx="3"/>'],['vertical','Vertical','<rect x="30" y="3" width="22" height="12" rx="3"/><path d="M41 15v6M41 33v6"/><rect x="30" y="21" width="22" height="12" rx="3"/><rect x="30" y="39" width="22" height="12" rx="3"/>']].map(([value,label,path])=>`<button type="button" data-layout-choice="${value}" aria-pressed="${value==='flow'}"><svg viewBox="0 0 82 56" aria-hidden="true">${path}</svg><span>${label}</span></button>`).join('');const patternLabel=$('#arrangePattern').closest('label');patternLabel.hidden=true;patternLabel.before(chooser);chooser.onclick=e=>{const option=e.target.closest('[data-layout-choice]');if(!option)return;$('#arrangePattern').value=option.dataset.layoutChoice;chooser.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===option)))};
 button.onclick=()=>{if(liveEdit)finishLive();$('#arrangeScope').value=selectionIds().length?'selection':'all';dialog.showModal()};
 $('#applyArrange').onclick=()=>{
  if(board().cloud?.role==='viewer')return toast('This shared board is view-only');
  const b=board(),scope=$('#arrangeScope').value,chosen=new Set(scope==='selection'?expandGroups(selectionIds()):b.nodes.map(n=>n.id)),groups=new Map(),nodeUnit=new Map();
  b.nodes.forEach((n,i)=>{const key=n.groupId?'group:'+n.groupId:n.id;if(!groups.has(key))groups.set(key,{id:key,members:[],order:i,created:creationTime(n)});groups.get(key).members.push(n);nodeUnit.set(n.id,key)});
  const units=[],obstacles=[];
  for(const group of groups.values()){const rects=group.members.map(itemRect),x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y)),unit={...group,x,y,w:Math.max(...rects.map(r=>r.x+r.w))-x,h:Math.max(...rects.map(r=>r.y+r.h))-y};if(group.members.some(n=>chosen.has(n.id))&&group.members.some(n=>n.type!=='drawing')&&!group.members.some(n=>n.locked))units.push(unit);else obstacles.push(unit)}
  if(!units.length)return toast('Select an unlocked card to arrange');
  const links=b.edges.map(e=>({from:nodeUnit.get(e.from),to:nodeUnit.get(e.to)})),positions=planCardLayout(units,links,$('#arrangePattern').value,obstacles);
  if(!units.some(u=>{const p=positions.get(u.id);return p.x!==u.x||p.y!==u.y})){dialog.close();return toast('Cards are already arranged')}
  const previous=captureLayoutPositions();remember();for(const u of units){const p=positions.get(u.id);for(const n of u.members){n.x+=p.x-u.x;n.y+=p.y-u.y}}
  dialog.close();render();save();showCardSelection();animateLayoutTransition(previous,()=>revealItems(units.flatMap(u=>u.members.map(n=>n.id))));toast('Cards arranged · Ctrl/⌘ Z to undo');
 };
})();
