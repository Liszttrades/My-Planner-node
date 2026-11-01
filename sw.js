/* Cache only this app's public shell. Board edits remain in IndexedDB. */
const CACHE='forma-shell-v53';
const SHELL=['./','index.html','style.css?v=53','app.js?v=53','collaboration.js?v=53','planning.js?v=53','sidebar.js?v=53','cloud-config.js?v=53','assets/InterVariable.woff2'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('forma-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const relative=url.pathname.slice(scope.pathname.length),isShell=event.request.mode==='navigate'||SHELL.some(path=>path.split('?')[0]===relative);
 if(!isShell)return;
 const refresh=fetch(event.request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}return response});
 event.waitUntil(refresh.catch(()=>{}));
 event.respondWith((async()=>{
  const cached=await caches.match(event.request);if(cached)return cached;
  try{return await refresh}catch{
   if(event.request.mode==='navigate')return (await caches.match(new URL('index.html',scope).href))||Response.error();
   return Response.error();
  }
 })());
});
