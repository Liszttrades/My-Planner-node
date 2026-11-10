/* Optional authenticated collaboration. Local boards work without configuration. */
let cloudClient=null,cloudUser=null,cloudBusy=false;
const cloudDialog=document.createElement('dialog');cloudDialog.id='cloudDialog';cloudDialog.innerHTML='<div class="dialog-top"><strong>Share board</strong><button class="close" aria-label="Close sharing">×</button></div><div id="cloudBody"></div>';document.body.append(cloudDialog);cloudDialog.querySelector('.close').onclick=()=>cloudDialog.close();
const cloudBody=cloudDialog.querySelector('#cloudBody');
function cloudDoc(b=board()){return{title:b.title,nodes:b.nodes,edges:b.edges,project:b.project||null}}
function cloudFingerprint(b=board()){return JSON.stringify(cloudDoc(b))}
function cloudMessage(t){const el=$('#cloudMessage');if(el)el.textContent=t;else toast(t)}
let cloudInit=null;
function getCloud(){
 if(cloudInit)return cloudInit;
 cloudInit=(async()=>{
  const c=window.FORMA_CLOUD;
  if(!c?.url||!c?.anonKey)throw Error('Connect Supabase first using COLLABORATION_SETUP.md in the download. Your local boards still work.');
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(c.url))throw Error('Use your Supabase project HTTPS URL.');
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const client=createClient(c.url,c.anonKey);
  const {data,error}=await client.auth.getUser();
  if(!error)cloudUser=data.user;
  else {const {data}=await client.auth.getSession();cloudUser=data.session?.user||null}
  client.auth.onAuthStateChange((_event,session)=>{cloudUser=session?.user||null});
  cloudClient=client;
  return client;
 })().catch(error=>{cloudInit=null;throw error});
 return cloudInit;
}
async function cloudRun(fn){try{await fn()}catch(e){cloudMessage(e.message||'Unable to connect. Try again.')}}
$('#shareBoard').title='Share with permission';$('#shareBoard').onclick=()=>{cloudDialog.showModal();cloudRun(showSharing)};
async function showSharing(){cloudBody.innerHTML='<p>Connecting…</p>';let c;try{c=await getCloud()}catch(e){cloudBody.innerHTML='<p>'+esc(e.message)+'</p><p>Online access stays disabled until setup is complete.</p>';return}
if(!cloudUser){cloudBody.innerHTML='<p>Sign in to share or request access.</p><form id="cloudLogin"><label>Email<input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label><button class="primary">Email sign-in link</button></form><p id="cloudMessage" role="status"></p>';$('#cloudLogin').onsubmit=e=>{e.preventDefault();cloudRun(async()=>{const redirect=new URL(location.href);redirect.hash='';const {error}=await c.auth.signInWithOtp({email:new FormData(e.target).get('email'),options:{emailRedirectTo:redirect.href}});if(error)throw error;cloudMessage('Check your email for the sign-in link.')})};return}
cloudBody.innerHTML=`<div class="cloud-account"><span>${esc(cloudUser.email)}</span><button id="cloudSignOut">Sign out</button></div><p id="cloudMessage" role="status"></p><div id="cloudActions"></div><div id="cloudAccess"></div><hr><button id="cloudRefresh">Refresh shared boards</button><div id="cloudBoards"></div>`;
$('#cloudSignOut').onclick=()=>cloudRun(async()=>{await c.auth.signOut();cloudUser=null;updateLiveRoom(null);paintLive();showSharing()});$('#cloudRefresh').onclick=()=>cloudRun(loadCloudList);
const b=board(),target=new URL(location.href).searchParams.get('board');
if(!b.cloud){$('#cloudActions').innerHTML='<p>Share this board privately. People need your approval before they can view it.</p><button id="cloudPublish" class="primary">Enable sharing for this board</button>';$('#cloudPublish').onclick=()=>cloudRun(async()=>{const doc=cloudDoc();if(JSON.stringify(doc).length>12000000)throw Error('Board is too large to sync. Use smaller images.');const {data,error}=await c.from('forma_boards').insert({owner:cloudUser.id,document:doc}).select().single();if(error)throw error;b.cloud={id:data.id,revision:data.revision,owner:cloudUser.id,role:'owner',fingerprint:JSON.stringify(doc)};save();showSharing()})}
else{const url=new URL(location.href);url.hash='';url.searchParams.set('board',b.cloud.id);$('#cloudActions').innerHTML=`<label>Board link<input readonly id="cloudLink" value="${esc(url.href)}"></label><div class="cloud-row"><button id="copyCloudLink">Copy link</button><button id="pullCloud">Reload shared version</button></div><p>${b.cloud.role==='viewer'?'Viewer · Changes to your local copy are not shared.':'Approved editors can add and update cards. Copy the link, then approve requests below.'}</p>`;$('#copyCloudLink').onclick=()=>cloudRun(async()=>{await navigator.clipboard.writeText(url.href);cloudMessage('Link copied. New visitors must request access.')});$('#pullCloud').onclick=()=>cloudRun(async()=>{if(cloudFingerprint(b)!==b.cloud.fingerprint){remember();const backup=structuredClone(b);backup.id=uid();backup.title+=' · local backup';delete backup.cloud;state.boards.push(backup)}await cloudPull(b);liveConflicts.delete(b.cloud.id);paintLive();showSharing()});if(b.cloud.owner===cloudUser.id)await loadAccess(b)}
if(target&&b.cloud?.id!==target){const row=document.createElement('div');row.className='cloud-request';row.innerHTML='<p>You have a board invitation.</p><button id="openInvite">Open board / request access</button>';$('#cloudActions').append(row);$('#openInvite').onclick=()=>cloudRun(()=>openCloud(target))}await loadCloudList()}
async function loadCloudList(){const {data,error}=await cloudClient.from('forma_boards').select('id,owner,revision,title:document->>title');if(error)throw error;await refreshBoardMemberCounts();const el=$('#cloudBoards');if(!el)return;el.innerHTML='<h3>Shared with you</h3>';for(const row of data){const button=document.createElement('button');button.textContent=row.title||'Shared board';button.className='cloud-board';button.onclick=()=>cloudRun(()=>openCloud(row.id));el.append(button)}if(!data.length)el.append(document.createTextNode('No shared boards yet.'))}
async function openCloud(id){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error('Invalid board link');if(cloudBusy)throw Error('Wait for the current sync, then try again.');const {data,error}=await cloudClient.from('forma_boards').select('*').eq('id',id).maybeSingle();if(error)throw error;if(!data){const {error}=await cloudClient.from('forma_requests').upsert({board_id:id,user_id:cloudUser.id,email:cloudUser.email},{onConflict:'board_id,user_id',ignoreDuplicates:true});if(error)throw error;cloudMessage('Access requested. The owner must approve it before you can open this board.');return}let b=state.boards.find(b=>b.cloud?.id===id);if(!b){b=starter();state.boards.push(b)}if(b.cloud?.fingerprint&&cloudFingerprint(b)!==b.cloud.fingerprint){const backup=structuredClone(b);backup.id=uid();backup.title+=' · local backup';delete backup.cloud;state.boards.push(backup)}let role='owner';if(data.owner!==cloudUser.id){const res=await cloudClient.from('forma_members').select('role').eq('board_id',id).eq('user_id',cloudUser.id).single();if(res.error)throw res.error;role=res.data.role}b.cloud={id,revision:data.revision,owner:data.owner,role};applyCloudDoc(b,data.document);b.cloud.fingerprint=cloudFingerprint(b);cardActivity.set(id,data.card_activity||{});state.active=b.id;liveConflicts.delete(id);updateLiveRoom(b);render();fit();save();showSharing()}
function applyCloudDoc(b,doc){if(!Array.isArray(doc?.nodes)||!Array.isArray(doc?.edges)||doc.nodes.length>2000)throw Error('Invalid shared board');for(const n of doc.nodes){if(!n||typeof n.id!=='string'||!/^[\w-]{1,128}$/.test(n.id)||typeof n.color!=='string'||!['note','image','checklist','drawing'].includes(n.type)||![n.x,n.y,n.w].every(Number.isFinite)||!Object.hasOwn(palette,n.color)||(n.h!==undefined&&!Number.isFinite(n.h)))throw Error('Invalid shared card');if(n.type==='image'&&!/^data:image\/(png|jpeg|webp|gif);base64,/.test(n.src))throw Error('Invalid shared image');if(n.type==='checklist'&&typeof n.body!=='string')throw Error('Invalid shared checklist');if(n.type==='drawing')n.points=safePoints(n.points)}b.project=doc.project&&typeof doc.project==='object'?{client:String(doc.project.client||'').slice(0,120),budget:Number.isFinite(doc.project.budget)?doc.project.budget:null,spent:Number.isFinite(doc.project.spent)?doc.project.spent:null,currency:['PHP','USD','EUR','GBP','JPY'].includes(doc.project.currency)?doc.project.currency:'PHP'}:undefined;b.title=String(doc.title||'Shared board');b.nodes=doc.nodes;b.edges=doc.edges.filter(e=>e&&typeof e.id==='string'&&/^[\w-]{1,128}$/.test(e.id)&&b.nodes.some(n=>n.id===e.from)&&b.nodes.some(n=>n.id===e.to))}
async function loadAccess(b){const id=b.cloud.id;const [requests,members]=await Promise.all([cloudClient.from('forma_requests').select('*').eq('board_id',id),cloudClient.from('forma_members').select('*').eq('board_id',id)]);if(requests.error)throw requests.error;if(members.error)throw members.error;b.cloud.memberCount=members.data.length+1;renderProjectSidebar();save();const el=$('#cloudAccess');el.innerHTML='<h3>Access requests</h3>';if(!requests.data.length)el.append(document.createTextNode('No pending requests.'));for(const r of requests.data){const row=document.createElement('div');row.className='access-row';row.innerHTML=`<span>${esc(r.email)}</span><select aria-label="Access for ${esc(r.email)}"><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button>Approve</button><button>Decline</button>`;row.querySelectorAll('button')[0].onclick=()=>cloudRun(async()=>{const {error}=await cloudClient.rpc('forma_approve',{b:id,person:r.user_id,access_role:row.querySelector('select').value});if(error)throw error;loadAccess(b)});row.querySelectorAll('button')[1].onclick=()=>cloudRun(async()=>{const {error}=await cloudClient.from('forma_requests').delete().eq('board_id',id).eq('user_id',r.user_id);if(error)throw error;loadAccess(b)});el.append(row)}const heading=document.createElement('h3');heading.textContent='People with access';el.append(heading);for(const m of members.data){const row=document.createElement('div');row.className='access-row';row.innerHTML=`<span>${esc(m.email)} · ${esc(m.role)}</span><button>Remove access</button>`;row.querySelector('button').onclick=()=>cloudRun(async()=>{const {error}=await cloudClient.rpc('forma_revoke',{b:id,person:m.user_id});if(error)throw error;loadAccess(b)});el.append(row)}}
async function readCloudBoard(id){
 const {data,error}=await cloudClient.from('forma_boards').select('*').eq('id',id).single();
 if(error)throw error;
 return data;
}
async function cloudPull(b){
 if(cloudBusy)throw Error('Wait for the current sync, then try again.');
 const data=await readCloudBoard(b.cloud.id);
 applyCloudDoc(b,data.document);b.cloud.revision=data.revision;b.cloud.fingerprint=cloudFingerprint(b);
 cardActivity.set(b.cloud.id,data.card_activity||{});clearSharedHistory(b);render();save();
}
/* Each browser writes through the existing revision-checked RPC. Realtime
   carries board IDs/revisions only; authorized reads fetch the actual board. */
let liveRoom=null,cloudPollAt=0,cloudSyncTimer=null,cloudDirtyAt=0;
const cardActivity=new Map(),liveConflicts=new Set();
const liveBar=document.createElement('details');
liveBar.id='formaLiveBar';liveBar.hidden=true;
liveBar.onpointerdown=e=>e.stopPropagation();liveBar.onwheel=e=>e.stopPropagation();
liveBar.innerHTML='<summary>Shared board</summary><div class="live-board-panel"></div>';
$('#canvas').append(liveBar);
const livePanel=liveBar.querySelector('.live-board-panel');
const liveColors=['#71bce4','#cf9df5','#edb373','#7bd4ad','#ef9dba','#c8ca7a'];
function liveColor(id=''){let hash=0;for(const char of String(id))hash=(hash*31+char.charCodeAt(0))>>>0;return liveColors[hash%liveColors.length]}
function liveLine(text,person){const el=document.createElement('div');el.className='live-board-line';el.textContent=text;if(person)el.style.setProperty('--live-color',liveColor(person));return el}
function paintLive(){
 const b=state&&board(),room=liveRoom;
 $('#nodes').querySelectorAll('.node > .live-card-badge').forEach(el=>el.remove());
 liveBar.hidden=!b?.cloud||!cloudUser;
 if(liveBar.hidden)return;
 const editing=new Map(),people=room?.id===b.cloud.id?[...room.people.values()].filter(p=>p.user_id!==cloudUser.id&&Date.now()-Date.parse(p.seen_at)<45000):[];
 const activity=Object.entries(cardActivity.get(b.cloud.id)||{}).filter(([,a])=>a&&['added','updated'].includes(a.kind)&&typeof a.name==='string'&&Number.isFinite(Date.parse(a.at))).sort((a,c)=>Date.parse(c[1].at)-Date.parse(a[1].at));
 for(const p of people)if(p.card_id){if(!editing.has(p.card_id))editing.set(p.card_id,[]);editing.get(p.card_id).push(p)}
 const status=liveConflicts.has(b.cloud.id)?'Sync paused':room?.status==='SUBSCRIBED'&&room.available===true?'Live':'Shared';
 liveBar.querySelector('summary').textContent=status+' · '+(people.length+1)+' here';
 livePanel.replaceChildren(liveLine('You · '+(b.cloud.role||'member'),cloudUser.id));
 for(const p of people)livePanel.append(liveLine(p.name+(p.card_id?' · editing':''),p.user_id));
 if(liveConflicts.has(b.cloud.id))livePanel.append(liveLine('Open Share → Reload shared version. Forma keeps your unsynced work as a local backup.'));
 if(activity.length){
  const h=document.createElement('strong');h.textContent='Recent card changes';livePanel.append(h);
  for(const [id,a] of activity.slice(0,8)){
   const n=b.nodes.find(n=>n.id===id);if(!n)continue;
   livePanel.append(liveLine(a.name+' '+a.kind+' '+(n.title||n.label||'a card'),a.user_id));
  }
 }
 const badges=new Map(activity.filter(([,a])=>a.user_id!==cloudUser.id&&Date.now()-Date.parse(a.at)<120000));
 for(const [id] of editing)if(!badges.has(id))badges.set(id,null);
 for(const [id,a] of badges){
  const el=cardDOM.get(id)?.el;if(!el)continue;
  const active=editing.get(id),badge=document.createElement('span');
  badge.className='live-card-badge';
  badge.textContent=active?.length?active.map(p=>p.name).join(', ')+' · editing':a.name+' · '+(a.kind==='added'?'new card':'updated');
  badge.style.setProperty('--live-color',liveColor(active?.[0]?.user_id||a.user_id));el.append(badge);
 }
}
const renderBeforeLive=render;
render=function(){renderBeforeLive();paintLive()};
function updateLiveRoom(b){
 const id=cloudUser&&b?.cloud?.id, user=cloudUser?.id;
 if(liveRoom?.id===id&&liveRoom?.user===user)return;
 if(liveRoom){cloudClient?.removeChannel(liveRoom.channel);liveRoom=null}
 cloudPollAt=0;
 if(!id||!cloudClient)return;
 const room={id,user,people:new Map(),heartbeatAt:0,peopleAt:0,status:'',available:null,card:null};
 const filter='board_id=eq.'+id;
 room.channel=cloudClient.channel('forma-live-'+id+'-'+uid())
 .on('postgres_changes',{event:'*',schema:'public',table:'forma_live_revisions',filter},()=>{
  if(liveRoom!==room)return;cloudPollAt=0;queueCloudSync();
 })
 .on('postgres_changes',{event:'*',schema:'public',table:'forma_live_people',filter},event=>{
  if(liveRoom!==room||event.eventType==='DELETE')return;
  const p=event.new;if(p?.board_id===id&&p.user_id)room.people.set(p.user_id,p);
  paintLive();
 })
 .subscribe(status=>{if(liveRoom===room){room.status=status;cloudPollAt=0;queueCloudSync();paintLive()}});
 liveRoom=room;paintLive();
}
async function refreshLivePeople(b){
 const room=liveRoom;if(!room||room.available===false||room.busy||document.hidden)return;
 const now=Date.now(),card=b.cloud.role==='viewer'?null:(liveEdit||$('#nodes .node.title-editing, #nodes [data-label][contenteditable]')?.closest('.node')?.dataset.id||null);
 if(now-room.heartbeatAt<14000&&card===room.card&&now-room.peopleAt<22000)return;
 room.busy=true;
 try{
  if(now-room.heartbeatAt>=14000||card!==room.card){
   const {error}=await cloudClient.rpc('forma_live_heartbeat',{b:room.id,card});
   if(error){if(['PGRST202','PGRST205','42P01'].includes(error.code))room.available=false;return}
   room.available=true;room.heartbeatAt=now;room.card=card;
  }
  if(now-room.peopleAt>=22000){
   const before=now,{data,error}=await cloudClient.from('forma_live_people').select('user_id,name,card_id,seen_at').eq('board_id',room.id);
   if(!error&&liveRoom===room){
    const map=new Map(data.map(p=>[p.user_id,p]));
    for(const [id,p] of room.people)if(Date.parse(p.seen_at)>=before&&(!map.has(id)||Date.parse(p.seen_at)>Date.parse(map.get(id).seen_at)))map.set(id,p);
    room.people=map;room.peopleAt=now;
   }
  }
 }finally{room.busy=false;if(liveRoom===room)paintLive()}
}
function cloudEqual(a,b){
 if(a===b)return true;
 if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&cloudEqual(a[k],b[k]));
}
function mergeCloudDocs(base,mine,theirs){
 const pick=(before,a,b)=>{
  if(cloudEqual(a,b)||cloudEqual(b,before))return a;
  if(cloudEqual(a,before))return b;
  throw Error('You and another person changed the same card or board setting.');
 };
 const mergeList=(old,local,remote)=>{
  const maps=[old,local,remote].map(items=>new Map(items.map(item=>[item.id,item])));
  return [...new Set([...maps[2].keys(),...maps[1].keys()])].map(id=>pick(...maps.map(map=>map.get(id)))).filter(Boolean);
 };
 const doc={title:pick(base.title,mine.title,theirs.title),project:pick(base.project,mine.project,theirs.project),
  nodes:mergeList(base.nodes,mine.nodes,theirs.nodes),edges:mergeList(base.edges,mine.edges,theirs.edges)};
 const ids=new Set(doc.nodes.map(n=>n.id));
 if(doc.edges.some(e=>!ids.has(e.from)||!ids.has(e.to)))throw Error('A connection changed while another person removed its card.');
 return doc;
}
function clearSharedHistory(b){scopedHistories.delete('board:'+b.id);pruneHistoryImages()}
function cloudGesture(){return liveEdit||drag||middlePan||inkResize||erasing||sizing||marquee||inkStroke||$('#nodes .node.title-editing')||$('#nodes [contenteditable="plaintext-only"]')||document.activeElement?.id==='boardTitle'||$('[role=dialog][open], #taskEditor[open], #boardDialog[open]')}
function queueCloudSync(delay=0){
 if(cloudSyncTimer!==null)return;
 cloudSyncTimer=setTimeout(()=>{cloudSyncTimer=null;syncCloudBoard()},delay);
}
async function syncCloudBoard(){
 if(!cloudClient||!cloudUser||!state||document.hidden)return;
 const b=board();updateLiveRoom(b);
 if(!b?.cloud)return;
 refreshLivePeople(b).catch(()=>{});
 if(cloudBusy||cloudGesture()||liveConflicts.has(b.cloud.id))return;
 const {id,revision,fingerprint,role}=b.cloud;
 const local=cloudFingerprint(b),changed=local!==fingerprint,now=Date.now();
 if(!changed&&now<cloudPollAt)return;
 if(changed&&role!=='viewer'&&now<cloudDirtyAt){queueCloudSync(cloudDirtyAt-now);return}
 if(changed&&role==='viewer'&&now<cloudPollAt)return;
 cloudBusy=true;cloudPollAt=now+4000;
 try{
  if(changed&&role!=='viewer'){
   if(local.length>12000000)throw Error('Board too large to sync. Save a local backup.');
   const doc=JSON.parse(local);
   let res=await cloudClient.rpc('forma_save',{b:id,expected:revision,doc});
   if(res.error&&res.error.message?.includes('Another person changed')){
    const remote=await readCloudBoard(id);
    if(!state.boards.includes(b)||b.cloud?.id!==id||cloudGesture()||cloudFingerprint(b)!==local){cloudPollAt=0;return}
    const merged=mergeCloudDocs(JSON.parse(fingerprint),doc,remote.document);
    res=await cloudClient.rpc('forma_save',{b:id,expected:remote.revision,doc:merged});
    if(res.error){if(res.error.message?.includes('Another person changed')){cloudPollAt=0;return}throw res.error}
    // The local snapshot sent to the server is the base for edits made
    // while the merged save was in flight. If any overlap, keep them local.
    const latest=JSON.parse(cloudFingerprint(b));
    b.cloud.revision=res.data;b.cloud.fingerprint=JSON.stringify(merged);
    if(cloudGesture()){save();throw Error('A shared update arrived while you were editing. Your local changes are kept.')}
    const combined=mergeCloudDocs(doc,latest,merged);
    if(!cloudEqual(combined,latest)){applyCloudDoc(b,combined);clearSharedHistory(b);render()}save();
    cloudPollAt=0;
   }else{
    if(res.error)throw res.error;
    b.cloud.revision=res.data;b.cloud.fingerprint=local;save();cloudPollAt=0;
   }
  }else{
   const data=await readCloudBoard(id);
   if(!state.boards.includes(b)||b.cloud?.id!==id||cloudGesture()||cloudFingerprint(b)!==local){cloudPollAt=0;return}
   cardActivity.set(id,data.card_activity||{});
   if(data.revision!==revision){
    if(changed&&role==='viewer')throw Error('The shared board changed while you were editing your local copy.');
    applyCloudDoc(b,data.document);b.cloud.revision=data.revision;b.cloud.fingerprint=cloudFingerprint(b);clearSharedHistory(b);render();save();
   }else paintLive();
  }
 }catch(e){
  if(e instanceof TypeError||!navigator.onLine){cloudPollAt=Date.now()+4000;cloudDirtyAt=cloudPollAt;return}
  liveConflicts.add(id);paintLive();toast((e.message||'Sync paused.')+' Open Share to reload the shared version.');
 }finally{cloudBusy=false}
}
const saveBeforeLive=save;
save=function(...args){const result=saveBeforeLive(...args);if(cloudClient&&cloudUser&&state&&board()?.cloud){cloudDirtyAt=Date.now()+650;queueCloudSync(650)}return result};
setInterval(()=>{if(cloudClient&&cloudUser)syncCloudBoard();else if(liveRoom){updateLiveRoom(null);paintLive()}},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){cloudPollAt=0;queueCloudSync()}});
window.addEventListener('online',()=>{cloudPollAt=0;queueCloudSync()});
// Only initialize authentication automatically when cloud settings are configured.
if(window.FORMA_CLOUD?.url&&window.FORMA_CLOUD?.anonKey)getCloud().then(()=>refreshBoardMemberCounts()).catch(()=>{});

function openBoardInvitation(){if(new URL(location.href).searchParams.has('board'))$('#shareBoard').click()}
if(window.formaReady)openBoardInvitation();else document.addEventListener('forma-ready',openBoardInvitation,{once:true});
async function refreshBoardMemberCounts(){if(!cloudClient||!cloudUser||!state)return;let changed=false;await Promise.all(state.boards.filter(b=>b.cloud).map(async b=>{const {data,error}=await cloudClient.rpc('forma_member_count',{b:b.cloud.id});if(!error&&Number.isInteger(data)&&data>=1&&b.cloud.memberCount!==data){b.cloud.memberCount=data;changed=true}}));if(changed){renderProjectSidebar();save()}}
