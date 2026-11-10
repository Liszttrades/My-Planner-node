/* Account UI shares collaboration.js's single Supabase client. */
let accountReturnToShare=false, accountMode='signin', captchaWidget=null, captchaToken='', captchaLoader=null;
const accountDialog=document.createElement('dialog');accountDialog.id='accountDialog';
accountDialog.innerHTML='<div class="dialog-top"><strong>Forma account</strong><button type="button" class="close" aria-label="Close account">×</button></div><div id="accountBody"></div>';
document.body.append(accountDialog);
accountDialog.querySelector('.close').onclick=()=>accountDialog.close();
const accountButton=document.createElement('button');accountButton.id='formaAccount';accountButton.textContent='Sign in';
document.querySelector('.side-bottom').prepend(accountButton);
accountButton.onclick=()=>openFormaAccount();
function authStatus(message){const el=document.querySelector('#accountStatus');if(el)el.textContent=message}
function authRedirect(recovery=false){const url=new URL(location.href);url.hash='';url.searchParams.delete('code');url.searchParams.delete('recovery');if(recovery)url.searchParams.set('recovery','1');return url.href}
function paintAccount(){accountButton.textContent=cloudUser?'Account · '+(cloudUser.email||'Signed in'):'Sign in';accountButton.title=cloudUser?.email||'Sign in to Forma'}
async function formaAuthChanged(event){
 paintAccount();
 if(event==='SIGNED_OUT'){updateLiveRoom(null);paintLive();if(cloudDialog.open)cloudRun(showSharing);if(accountDialog.open)openFormaAccount();return}
 if(event==='PASSWORD_RECOVERY'){openFormaAccount('update');return}
 if(cloudUser&&event==='SIGNED_IN'&&accountMode!=='update'&&!new URL(location.href).searchParams.has('recovery')){
  if(accountDialog.open)accountDialog.close();
  if(accountReturnToShare||cloudDialog.open){accountReturnToShare=false;if(!cloudDialog.open)cloudDialog.showModal();cloudRun(showSharing)}
 }
}
function clearCaptcha(){if(captchaWidget!==null&&window.turnstile)window.turnstile.remove(captchaWidget);captchaWidget=null;captchaToken=''}
accountDialog.addEventListener('close',clearCaptcha);
async function mountCaptcha(container){
 const key=window.FORMA_CLOUD?.turnstileSiteKey;if(!key)return;
 if(!window.turnstile){if(!captchaLoader)captchaLoader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=resolve;script.onerror=()=>{captchaLoader=null;script.remove();reject(Error('Verification could not load. Check your connection and reopen Sign in.'))};document.head.append(script)});await captchaLoader}
 if(!container.isConnected||!accountDialog.open)return;
 captchaWidget=window.turnstile.render(container,{sitekey:key,theme:'auto',callback:token=>{captchaToken=token},'expired-callback':()=>{captchaToken=''},'error-callback':()=>{captchaToken='';authStatus('Verification failed. Please try again.')}});
}
async function openFormaAccount(mode='signin',share=false){
 accountMode=mode;accountReturnToShare=share||accountReturnToShare;clearCaptcha();
 if(!accountDialog.open)accountDialog.showModal();
 const body=document.querySelector('#accountBody');body.innerHTML='<p id="accountStatus" role="status">Connecting…</p>';
 let c;try{c=await getCloud()}catch(e){authStatus(e.message);return}paintAccount();
 if(cloudUser&&mode!=='update'){
  body.innerHTML=`<p>Signed in as <strong>${esc(cloudUser.email||'Forma member')}</strong></p><p id="accountStatus" role="status"></p><div class="cloud-row"><button id="accountShare">Shared boards</button><button id="accountPassword">Reset password</button><button id="accountLogout">Sign out</button></div>`;
  document.querySelector('#accountShare').onclick=()=>{accountDialog.close();document.querySelector('#shareBoard').click()};
  document.querySelector('#accountPassword').onclick=()=>openFormaAccount('reset');
  // Reset is also available to signed-in users without changing their password here.
  document.querySelector('#accountLogout').onclick=async()=>{const {error}=await c.auth.signOut({scope:'local'});if(error)authStatus(error.message);else{cloudUser=null;paintAccount();openFormaAccount()}};
  if(mode!=='reset')return;
 }
 const labels={signin:'Sign in',signup:'Create account',reset:'Send reset link',magic:'Email sign-in link',update:'Save new password'};
 body.innerHTML=`<h2>${labels[mode]}</h2><form id="accountForm">${mode==='update'?'':'<label>Email<input name="email" type="email" autocomplete="email" required></label>'}${['signin','signup','update'].includes(mode)?`<label>Password<input name="password" type="password" autocomplete="${mode==='signin'?'current-password':'new-password'}" ${mode==='signin'?'':'minlength="12"'} required></label>`:''}<div id="accountCaptcha"></div><button class="primary" type="submit">${labels[mode]}</button></form><p id="accountStatus" role="status" aria-live="polite"></p><div id="accountProviders" class="cloud-row"></div><div id="accountModes" class="cloud-row"></div>`;
 for(const [value,label] of [['signin','Sign in'],['signup','Create account'],['reset','Forgot password?'],['magic','Use email link']]){if(value===mode)continue;const btn=document.createElement('button');btn.textContent=label;btn.onclick=()=>openFormaAccount(value);document.querySelector('#accountModes').append(btn)}
 if(mode==='signin'||mode==='signup')for(const provider of (window.FORMA_CLOUD?.providers||[])){const names={google:'Google',github:'GitHub',azure:'Microsoft'};if(!names[provider])continue;const btn=document.createElement('button');btn.textContent='Continue with '+names[provider];btn.onclick=async()=>{btn.disabled=true;try{const {error}=await c.auth.signInWithOAuth({provider,options:{redirectTo:authRedirect(),...(provider==='azure'?{scopes:'email'}:{})}});if(error)throw error}catch(e){authStatus(e.message);btn.disabled=false}};document.querySelector('#accountProviders').append(btn)}
 if(mode!=='update')mountCaptcha(document.querySelector('#accountCaptcha')).catch(e=>authStatus(e.message));
 document.querySelector('#accountForm').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,submit=form.querySelector('[type=submit]');submit.disabled=true;authStatus('Working…');
  try{
   if(mode!=='update'&&window.FORMA_CLOUD?.turnstileSiteKey&&!captchaToken)throw Error('Complete the verification first.');
   const fields=new FormData(form),email=String(fields.get('email')||'').trim(),password=String(fields.get('password')||'');let result;
   if(mode==='signin')result=await c.auth.signInWithPassword({email,password,options:{captchaToken}});
   if(mode==='signup')result=await c.auth.signUp({email,password,options:{captchaToken,emailRedirectTo:authRedirect()}});
   if(mode==='reset')result=await c.auth.resetPasswordForEmail(email,{captchaToken,redirectTo:authRedirect(true)});
   if(mode==='magic')result=await c.auth.signInWithOtp({email,options:{captchaToken,emailRedirectTo:authRedirect()}});
   if(mode==='update'){if(!cloudUser)throw Error('Open the password reset link from your email first.');result=await c.auth.updateUser({password})}
   if(result.error)throw result.error;
   if(mode==='update'){const url=new URL(location.href);url.searchParams.delete('recovery');history.replaceState(null,'',url);accountDialog.close();toast('Password updated.');accountMode='signin'}
   else if(mode==='signin'||result.data?.session){cloudUser=result.data.session.user;paintAccount();accountDialog.close();if(accountReturnToShare){accountReturnToShare=false;document.querySelector('#shareBoard').click()}}
   else authStatus('If this address is eligible, an email will arrive with the next step. Check your inbox and spam folder.');
   const pw=form.querySelector('[name=password]');if(pw)pw.value='';
  }catch(error){authStatus(error.message||'Unable to sign in. Try again.')}finally{submit.disabled=false;captchaToken='';if(captchaWidget!==null&&window.turnstile)window.turnstile.reset(captchaWidget)}
 };
}
async function claimEmailInvites(){const {error}=await cloudClient.rpc('forma_claim_invites');if(error&&!['PGRST202','42883'].includes(error.code))throw error}
function renderEmailInvites(b){
 const section=document.createElement('section');section.innerHTML='<h3>Add people by email</h3><form class="cloud-row"><input name="email" type="email" required placeholder="friend@example.com" aria-label="Person’s email"><select name="role" aria-label="Permission"><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button>Add access</button></form><p>Access is reserved for this email. Copy and send the board link to them; Forma does not send invitation emails.</p><div class="pending-invites"></div>';
 document.querySelector('#cloudAccess').prepend(section);
 const list=async()=>{const {data,error}=await cloudClient.from('forma_invites').select('email,role').eq('board_id',b.cloud.id);if(error){cloudMessage('Email sharing needs account-sharing-migration.sql. Existing link sharing still works.');return}const box=section.querySelector('.pending-invites');box.replaceChildren();for(const invite of data){const row=document.createElement('div');row.className='access-row';const label=document.createElement('span');label.textContent=invite.email+' · '+invite.role+' · pending';const remove=document.createElement('button');remove.textContent='Revoke';remove.onclick=()=>cloudRun(async()=>{const {error}=await cloudClient.from('forma_invites').delete().eq('board_id',b.cloud.id).eq('email',invite.email);if(error)throw error;await list()});row.append(label,remove);box.append(row)}};
 cloudRun(list);
 section.querySelector('form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;cloudRun(async()=>{const button=form.querySelector('button');button.disabled=true;try{const fields=new FormData(form);const {error}=await cloudClient.rpc('forma_invite_email',{b:b.cloud.id,address:String(fields.get('email')).trim(),access_role:fields.get('role')});if(error)throw error;cloudMessage('Email access added. Copy the board link and send it to them.');form.reset();await list()}finally{button.disabled=false}})};
}
window.addEventListener('load',()=>{paintAccount();if(new URL(location.href).searchParams.has('recovery'))openFormaAccount('update')});
