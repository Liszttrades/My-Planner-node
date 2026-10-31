/* Personal sidebar organization; folder membership stays intact in either view. */
(() => {
  const settings = document.createElement('button');
  settings.id = 'sidebarOptions';
  settings.setAttribute('aria-label', 'Sidebar options');
  settings.setAttribute('aria-haspopup', 'menu');
  settings.setAttribute('aria-expanded', 'false');
  settings.dataset.tooltip = 'Organize and sort boards';
  settings.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
  settings.dataset.sidebarOptions='all';
  let activeTrigger=settings;
  const createProject=$('#createProject');createProject.classList.add('new-project-action');createProject.innerHTML=sidebarIcon('plus')+'<span>New project</span>';projectsHeader.replaceChildren(createProject);
  const menu = document.createElement('div');
  menu.id = 'sidebarOptionsMenu'; menu.className = 'canvas-menu'; menu.hidden = true;
  menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Sidebar organization');
  menu.innerHTML = '<div class="sidebar-option-branch"><button data-sidebar-branch="layout" aria-haspopup="menu" aria-expanded="false"><span>Organize sidebar</span><span>›</span></button><div class="sidebar-submenu" data-sidebar-submenu="layout" role="menu" hidden></div></div><div class="sidebar-option-branch"><button data-sidebar-branch="sort" aria-haspopup="menu" aria-expanded="false"><span>Sort boards by</span><span>›</span></button><div class="sidebar-submenu" data-sidebar-submenu="sort" role="menu" hidden></div></div>';
  document.body.append(menu);
  function fillOptions() {
    menu.querySelector('[data-sidebar-submenu="layout"]').innerHTML = [['project','By project'],['list','In one list']].map(([value,label])=>`<button role="menuitemradio" aria-checked="${(state.sidebarLayout||'project')===value}" data-sidebar-layout="${value}"><span>${label}</span><span>${(state.sidebarLayout||'project')===value?'✓':''}</span></button>`).join('');
    const projectScope=activeTrigger.dataset.sidebarOptions==='projects',sortValue=(projectScope?state.projectSort:state.sidebarSort)||'original';menu.querySelector('[data-sidebar-branch="sort"] span').textContent=projectScope?'Sort projects by':'Sort boards by';const sortChoices=projectScope?[['original','Original order'],['name','Name A–Z']]:[['original','Original order'],['name','Name A–Z'],['recent','Recently opened']];menu.querySelector('[data-sidebar-submenu="sort"]').innerHTML=sortChoices.map(([value,label])=>`<button role="menuitemradio" aria-checked="${sortValue===value}" data-sidebar-sort="${value}"><span>${label}</span><span>${sortValue===value?'✓':''}</span></button>`).join('');
  }
  function close() { menu.hidden=true;document.querySelectorAll('[data-sidebar-options]').forEach(el=>el.setAttribute('aria-expanded','false')); }
  function focusTrigger(){(document.getElementById(activeTrigger.id)||settings).focus();}
  function branch(name, focus=false) {
    menu.querySelectorAll('[data-sidebar-submenu]').forEach(el=>el.hidden=el.dataset.sidebarSubmenu!==name);
    menu.querySelectorAll('[data-sidebar-branch]').forEach(el=>el.setAttribute('aria-expanded',String(el.dataset.sidebarBranch===name)));
    if(focus)menu.querySelector(`[data-sidebar-submenu="${name}"] button`)?.focus();
  }
  function toggleOptions(trigger){if(!menu.hidden&&activeTrigger===trigger)return close();activeTrigger=trigger;closeBoardMenu();closeProjectMenu();fillOptions();menu.querySelectorAll('[data-sidebar-submenu]').forEach(el=>el.hidden=true);menu.hidden=false;document.querySelectorAll('[data-sidebar-options]').forEach(el=>el.setAttribute('aria-expanded',String(el===trigger)));const r=trigger.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(r.left,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=r.bottom+menu.offsetHeight+8<innerHeight?r.bottom+5+'px':Math.max(8,r.top-menu.offsetHeight-8)+'px';menu.querySelector('[data-sidebar-branch]').focus();}
  settings.onclick=()=>toggleOptions(settings);

  menu.querySelectorAll('[data-sidebar-branch]').forEach(button=>button.onpointerenter=()=>branch(button.dataset.sidebarBranch));
  menu.onclick=e=>{const layout=e.target.closest('[data-sidebar-layout]'),sort=e.target.closest('[data-sidebar-sort]'),group=e.target.closest('[data-sidebar-branch]');if(layout||sort){if(layout)state.sidebarLayout=layout.dataset.sidebarLayout;if(sort){if(activeTrigger.dataset.sidebarOptions==='projects')state.projectSort=sort.dataset.sidebarSort;else state.sidebarSort=sort.dataset.sidebarSort;}renderProjectSidebar();save(false);close();focusTrigger();return}if(group)branch(group.dataset.sidebarBranch,true);};
  menu.onkeydown=e=>{const buttons=[...menu.querySelectorAll('button')].filter(el=>!el.closest('[hidden]')),index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}if(e.key==='ArrowRight'&&document.activeElement.dataset.sidebarBranch){e.preventDefault();branch(document.activeElement.dataset.sidebarBranch,true)}if(e.key==='ArrowLeft'){e.preventDefault();const sub=document.activeElement.closest('[data-sidebar-submenu]');if(sub){menu.querySelector(`[data-sidebar-branch="${sub.dataset.sidebarSubmenu}"]`).focus();sub.hidden=true}}if(e.key==='Escape'){e.preventDefault();close();focusTrigger()}};
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#sidebarOptionsMenu,[data-sidebar-options]'))close()});window.addEventListener('resize',close);
  document.addEventListener('keydown',e=>{if(!['Delete','Backspace'].includes(e.key)||!e.target.closest('#sidebar')||e.target.closest('input,textarea,[contenteditable]')||document.querySelector('dialog[open]')||!selectedBoardIds.size)return;e.preventDefault();e.stopImmediatePropagation();const ids=[...selectedBoardIds].filter(id=>state.boards.some(b=>b.id===id));if(!ids.length)return;openBoardMenu(ids[0],20,100);$('#boardMenu [data-action="delete"]').click();},true);
  function sectionHeaders(){
    const root=$('#boards .project-root');if(!root)return;root.classList.add('sidebar-section-header');root.removeAttribute('data-tooltip');const allLabel=document.createElement('span');allLabel.textContent=showArchive?'Archived boards':'All boards';allLabel.dataset.tooltip=state.sidebarLayout==='list'?'All boards in one list':'Boards outside project folders';root.replaceChildren(allLabel,settings);settings.setAttribute('aria-label','All boards options');settings.dataset.tooltip='Organize and sort boards';
    if(state.sidebarLayout!=='list'&&!showArchive){const divider=document.createElement('div');divider.className='sidebar-section-header project-section-divider';const label=document.createElement('span');label.textContent='Projects';label.dataset.tooltip='Project folders';const options=settings.cloneNode(true);options.id='projectSidebarOptions';options.dataset.sidebarOptions='projects';options.dataset.tooltip='Organize and sort projects';options.setAttribute('aria-label','Projects options');options.setAttribute('aria-expanded','false');options.onclick=()=>toggleOptions(options);divider.append(label,options);const first=$('#boards .project-folder');if(first)first.before(divider);else $('#boards').append(divider);}
  }
  const baseSidebarSections=renderProjectSidebar;renderProjectSidebar=function(){baseSidebarSections();sectionHeaders()};
  if(state)sectionHeaders();
})();
