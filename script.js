/* Google authorization stays in memory; no student records are stored locally. */
(() => {
'use strict';
const c=window.ASSEMBLY_CONFIG, $=id=>document.getElementById(id);
let token='',expiry=0,client,students=new Map(),attendance=new Map(),busy=false,ready=false,generation=0;
const idInput=$('ga-id'), manual=$('ga-manual'), check=$('ga-check'), result=$('ga-result');
const normalize=v=>String(v??'').replace(/\D/g,'').slice(0,11);
function format(v){const d=normalize(v);return d.slice(0,4)+(d.length>4?'-'+d.slice(4,6):'')+(d.length>6?'-'+d.slice(6):'');}
const complete=v=>/^\d{4}-\d{2}-\d{5}$/.test(v);
function quote(v){return "'"+v.replace(/'/g,"''")+"'";}
function notice(s){$('ga-notice').textContent=s;}
function clock(){const now=new Date();$('ga-date').textContent=now.toLocaleDateString('en-PH',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'});$('ga-time').textContent=now.toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',second:'2-digit'});}
function timestamp(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(new Date()).map(p=>[p.type,p.value]));return `${parts.month}/${parts.day}/${parts.year} - ${parts.hour}:${parts.minute} ${parts.dayPeriod.toLowerCase()}`;}
function controls(){check.querySelectorAll('input,button').forEach(e=>e.disabled=!ready||busy);manual.querySelectorAll('input,select,button').forEach(e=>e.disabled=!ready||busy);$('ga-connect').disabled=busy;$('ga-logout').disabled=busy;}
function disconnect(message='Disconnected. Connect Google to continue.'){generation++;token='';expiry=0;ready=false;students.clear();attendance.clear();$('ga-count').textContent='—';document.querySelector('.connected').textContent='Not connected';$('ga-connect').hidden=false;$('ga-logout').hidden=true;manual.hidden=true;check.hidden=false;result.hidden=true;notice(message);controls();}
async function api(path,options={}){
 if(!token||Date.now()>=expiry){disconnect('Your Google session expired. Connect Google again.');throw Error('Please reconnect Google.');}
 const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(c.spreadsheetId)+path+(path.includes('?')?'&':'?')+'key='+encodeURIComponent(c.apiKey),{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}});
 const data=await response.json();if(!response.ok){if(response.status===401)disconnect('Google session expired. Connect again.');throw Error(data.error?.message||'Google Sheets request failed.');}return data;
}
async function read(sheet,range){return (await api('/values/'+encodeURIComponent(quote(sheet)+'!'+range))).values||[];}
async function refreshAttendance(){const rows=await read(c.attendanceSheet,'A2:E');attendance=new Map();for(const r of rows){if(normalize(r[1]))attendance.set(normalize(r[1]),{date:r[0],name:r[2],course:r[3],year:r[4]});}$('ga-count').textContent=attendance.size;}
async function load(){const rows=await read(c.recordsSheet,'A2:D');students=new Map();const courses=new Set();for(const r of rows){const key=normalize(r[0]);if(key){if(students.has(key))throw Error('Duplicate student ID in ALL RECORDS: '+format(key)+'. Please correct the sheet.');students.set(key,{name:r[1]||'',course:r[2]||'',year:r[3]||''});}if(r[2])courses.add(String(r[2]).trim());}
 const select=$('ga-course');select.replaceChildren(new Option('Select course',''));[...courses].sort().forEach(v=>select.add(new Option(v,v)));await refreshAttendance();
}
function add(text,tag='p'){const e=document.createElement(tag);e.textContent=text;result.append(e);return e;}
function error(message){result.replaceChildren();result.hidden=false;add(message);}
function success(s,id,duplicate,date){manual.hidden=true;check.hidden=false;result.replaceChildren();result.hidden=false;add(duplicate?'✓ Attendance already recorded':'✓ Attendance recorded','strong').className='success';add(s.name,'h3');add([format(id),s.course,s.year?String(s.year).toLowerCase().includes('year')?s.year:'Year '+s.year:''].filter(Boolean).join(' · '));add('Welcome to General Assembly!');add('You’ve come a long way. Make this final chapter count—your graduation journey is almost complete.');add(date||'');const next=document.createElement('button');next.type='button';next.className='secondary cursor-interaction';next.textContent='Next student';next.onclick=()=>{result.hidden=true;idInput.value='';idInput.focus();};result.append(next);idInput.value='';}
async function record(s,id){
 await refreshAttendance();const previous=attendance.get(normalize(id));if(previous){success(previous,id,true,previous.date);return;}
 const date=timestamp();
 try{await api('/values/'+encodeURIComponent(quote(c.attendanceSheet)+'!A:E')+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:JSON.stringify({values:[[date,format(id),s.name,s.course,s.year]]})});}
 catch(e){throw Error(e.message+' If the connection dropped, check ATTENDANCE before trying again; the entry may already have saved.');}
 attendance.set(normalize(id),{...s,date});$('ga-count').textContent=attendance.size;success(s,id,false,date);
}
async function run(action){if(busy||!ready)return;busy=true;controls();try{await action();}catch(e){error(e.message);}finally{busy=false;controls();}}
check.addEventListener('submit',e=>{e.preventDefault();run(async()=>{const id=idInput.value;if(!complete(id))throw Error('Enter a complete ID, such as 2021-07-00227.');const student=students.get(normalize(id));if(student){await record(student,id);return;}result.replaceChildren();result.hidden=false;add('We couldn’t find your student ID.','h3');const b=document.createElement('button');b.type='button';b.className='secondary cursor-interaction';b.textContent='It seems we can’t find you. Do you want to enter attendance manually?';b.onclick=()=>{manual.hidden=false;check.hidden=true;result.hidden=true;$('ga-mid').value=id;$('ga-name').focus();};result.append(b);});});
manual.addEventListener('submit',e=>{e.preventDefault();run(async()=>{const id=$('ga-mid').value,name=$('ga-name').value.trim(),course=$('ga-course').value;if(!complete(id)||!name||!course)throw Error('Enter a complete student ID, name, and course.');const existing=students.get(normalize(id));await record(existing||{name,course,year:$('ga-year').value},id);manual.reset();});});
$('ga-cancel').onclick=()=>{manual.hidden=true;check.hidden=false;idInput.focus();};
[idInput,$('ga-mid')].forEach(el=>el.addEventListener('input',()=>{const before=el.value,position=el.selectionStart,digits=before.slice(0,position).replace(/\D/g,'').length;el.value=format(before);let p=0,n=0;while(p<el.value.length&&n<digits){if(/\d/.test(el.value[p]))n++;p++;}el.setSelectionRange(p,p);result.hidden=true;}));
$('ga-connect').onclick=()=>{
 if(c.spreadsheetId.includes('PASTE_')){notice('Setup needed: add your new spreadsheet ID in config.js.');return;}
 if(!window.google?.accounts?.oauth2){notice('Google sign-in is still loading. Check your connection and try again.');return;}
 client=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope:'https://www.googleapis.com/auth/spreadsheets',error_callback:()=>notice('Google sign-in was closed or blocked. Try Connect Google again.'),callback:async r=>{
 if(r.error){notice(r.error_description||r.error);return;}const current=++generation;token=r.access_token;expiry=Date.now()+(Number(r.expires_in)-60)*1000;busy=true;ready=false;controls();notice('Loading student records…');try{await load();if(current!==generation)return;ready=true;document.querySelector('.connected').textContent='● Google connected';$('ga-connect').hidden=true;$('ga-logout').hidden=false;notice('Ready. Enter a student ID to record attendance.');}catch(e){disconnect('Could not load your sheet: '+e.message);}finally{busy=false;controls();}
 }});client.requestAccessToken({prompt:'select_account'});
};
$('ga-logout').onclick=()=>disconnect();
document.querySelector('.logo').addEventListener('error',e=>{e.target.hidden=true;});
clock();setInterval(clock,1000);controls();
// Refresh the counter across stations without interrupting an active submission.
setInterval(()=>{if(ready&&!busy){run(refreshAttendance);}},60000);
})();
