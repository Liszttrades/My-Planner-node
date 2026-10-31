/* Personal sidebar organization; folder membership stays intact in either view. */
(() => {
  const settings = document.createElement('button');
  settings.id = 'sidebarOptions';
  settings.setAttribute('aria-label', 'Sidebar options');
  settings.setAttribute('aria-haspopup', 'menu');
  settings.setAttribute('aria-expanded', 'false');
  settings.dataset.tooltip = 'Organize and sort boards';
  settings.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
  $('#createProject').before(settings);
  const menu = document.createElement('div');
  menu.id = 'sidebarOptionsMenu'; menu.className = 'canvas-menu'; menu.hidden = true;
  menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Sidebar organization');
  menu.innerHTML = '<div class="sidebar-option-branch"><button data-sidebar-branch="layout" aria-haspopup="menu" aria-expanded="false"><span>Organize sidebar</span><span>›</span></button><div class="sidebar-submenu" data-sidebar-submenu="layout" role="menu" hidden></div></div><div class="sidebar-option-branch"><button data-sidebar-branch="sort" aria-haspopup="menu" aria-expanded="false"><span>Sort boards by</span><span>›</span></button><div class="sidebar-submenu" data-sidebar-submenu="sort" role="menu" hidden></div></div>';
  document.body.append(menu);
  function fillOptions() {
    menu.querySelector('[data-sidebar-submenu="layout"]').innerHTML = [['project','By project'],['list','In one list']].map(([value,label])=>`<button role="menuitemradio" aria-checked="${(state.sidebarLayout||'project')===value}" data-sidebar-layout="${value}"><span>${label}</span><span>${(state.sidebarLayout||'project')===value?'✓':''}</span></button>`).join('');
    menu.querySelector('[data-sidebar-submenu="sort"]').innerHTML = [['original','Original order'],['name','Name A–Z'],['recent','Recently opened']].map(([value,label])=>`<button role="menuitemradio" aria-checked="${(state.sidebarSort||'original')===value}" data-sidebar-sort="${value}"><span>${label}</span><span>${(state.sidebarSort||'original')===value?'✓':''}</span></button>`).join('');
  }
  function close() { menu.hidden=true;settings.setAttribute('aria-expanded','false'); }
  function branch(name, focus=false) {
    menu.querySelectorAll('[data-sidebar-submenu]').forEach(el=>el.hidden=el.dataset.sidebarSubmenu!==name);
    menu.querySelectorAll('[data-sidebar-branch]').forEach(el=>el.setAttribute('aria-expanded',String(el.dataset.sidebarBranch===name)));
    if(focus)menu.querySelector(`[data-sidebar-submenu="${name}"] button`)?.focus();
  }
  settings.onclick=()=>{if(!menu.hidden)return close();closeBoardMenu();closeProjectMenu();fillOptions();menu.querySelectorAll('[data-sidebar-submenu]').forEach(el=>el.hidden=true);menu.hidden=false;settings.setAttribute('aria-expanded','true');const r=settings.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(r.left,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,r.top-menu.offsetHeight-8)+'px';menu.querySelector('[data-sidebar-branch]').focus();};
  menu.querySelectorAll('[data-sidebar-branch]').forEach(button=>button.onpointerenter=()=>branch(button.dataset.sidebarBranch));
  menu.onclick=e=>{const layout=e.target.closest('[data-sidebar-layout]'),sort=e.target.closest('[data-sidebar-sort]'),group=e.target.closest('[data-sidebar-branch]');if(layout||sort){if(layout)state.sidebarLayout=layout.dataset.sidebarLayout;if(sort)state.sidebarSort=sort.dataset.sidebarSort;renderProjectSidebar();save(false);close();settings.focus();return}if(group)branch(group.dataset.sidebarBranch,true);};
  menu.onkeydown=e=>{const buttons=[...menu.querySelectorAll('button')].filter(el=>!el.closest('[hidden]')),index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}if(e.key==='ArrowRight'&&document.activeElement.dataset.sidebarBranch){e.preventDefault();branch(document.activeElement.dataset.sidebarBranch,true)}if(e.key==='ArrowLeft'){e.preventDefault();const sub=document.activeElement.closest('[data-sidebar-submenu]');if(sub){menu.querySelector(`[data-sidebar-branch="${sub.dataset.sidebarSubmenu}"]`).focus();sub.hidden=true}}if(e.key==='Escape'){e.preventDefault();close();settings.focus()}};
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#sidebarOptionsMenu,#sidebarOptions'))close()});window.addEventListener('resize',close);
  document.addEventListener('keydown',e=>{if(!['Delete','Backspace'].includes(e.key)||!e.target.closest('#sidebar')||e.target.closest('input,textarea,[contenteditable]')||document.querySelector('dialog[open]')||!selectedBoardIds.size)return;e.preventDefault();e.stopImmediatePropagation();const ids=[...selectedBoardIds].filter(id=>state.boards.some(b=>b.id===id));if(!ids.length)return;openBoardMenu(ids[0],20,100);$('#boardMenu [data-action="delete"]').click();},true);
})();
