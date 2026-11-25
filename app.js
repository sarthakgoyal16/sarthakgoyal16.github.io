const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLORS = [['#2B2A28','#6B675F'],['#6B675F','#2B2A28'],['#57534c','#8c867c'],['#7a6f64','#4a4741'],['#4a4741','#7a756c'],['#2B2A28','#8c867c']]; // neutral palette
const col = id => COLORS[id % COLORS.length];
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const nowT = () => new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

// ---------- State (saved in localStorage) ----------
const KEY = 'studymate_v1';
let S = JSON.parse(localStorage.getItem(KEY) || 'null');
if (!S) {
  S = { me: null, custom: [], reqs: [], msgs: {}, unread: {}, nid: 1 };
  [3, 11, 17].forEach(pid => S.reqs.push({ id: S.nid++, pid, dir: 'received', status: 'pending', t: nowT() })); // demo incoming requests
}
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const all = () => [...PEOPLE, ...S.custom];
const person = id => all().find(p => p.id === id);
const reqFor = pid => S.reqs.find(r => r.pid === pid);
const connected = pid => (reqFor(pid) || {}).status === 'accepted';

function matchPct(p) {
  const mine = S.me ? S.me.subjects.map(s => s.toLowerCase()) : null;
  if (!mine) return 55 + (p.id * 7) % 40;
  const common = p.subjects.filter(s => mine.includes(s.toLowerCase())).length;
  let sc = 40 + common * 20 + (p.time === S.me.time ? 12 : 0) + (p.mode === S.me.mode || p.mode === 'Both' ? 8 : 0);
  return Math.min(99, sc);
}

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800); }

// ---------- Navigation ----------
function go(page) {
  $$('.page').forEach(p => p.classList.toggle('active', p.id === page));
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  if (page === 'discover') renderGrid();
  if (page === 'requests') renderReqs();
  if (page === 'chat') renderChatList();
  if (page === 'create') renderPreview();
  updateBadges();
}
$$('#nav button').forEach(b => b.onclick = () => go(b.dataset.page));

function updateBadges() {
  const pend = S.reqs.filter(r => r.dir === 'received' && r.status === 'pending').length;
  const unread = Object.values(S.unread).reduce((a, b) => a + b, 0);
  $('#reqBadge').textContent = pend; $('#reqBadge').classList.toggle('hidden', !pend);
  $('#chatBadge').textContent = unread; $('#chatBadge').classList.toggle('hidden', !unread);
  $('#stTotal').textContent = all().length;
  $('#stConn').textContent = S.reqs.filter(r => r.status === 'accepted').length;
  $('#stPend').textContent = S.reqs.filter(r => r.status === 'pending').length;
}

// ---------- Discover ----------
const subjects = [...new Set(PEOPLE.flatMap(p => p.subjects))].sort();
subjects.forEach(s => $('#fSubject').insertAdjacentHTML('beforeend', `<option>${esc(s)}</option>`));
['fSearch', 'fSubject', 'fYear', 'fMode', 'fTime', 'fSort'].forEach(id => $('#' + id).addEventListener('input', renderGrid));

function actionBtn(p) {
  const r = reqFor(p.id);
  if (!r) return `<button class="btn" onclick="connect(${p.id})">🤝 Connect</button>`;
  if (r.status === 'pending' && r.dir === 'sent') return `<button class="btn orange" onclick="cancelReq(${r.id})">⏳ Pending – Cancel</button>`;
  if (r.status === 'pending') return `<button class="btn green" onclick="respond(${r.id},'accepted')">✔ Accept</button><button class="btn red" onclick="respond(${r.id},'declined')">✖</button>`;
  if (r.status === 'accepted') return `<button class="btn green" onclick="openChat(${p.id})">💬 Chat</button>`;
  return `<button class="btn gray">Declined</button>`;
}

function card(p) {
  const [c, c2] = col(p.id);
  return `<div class="card pcard" style="--c:${c};--c2:${c2}">
    <div class="ph"><div class="av">${initials(p.name)}</div><div><h3>${esc(p.name)}</h3><small>${esc(p.course)} · Year ${p.year}</small><small>${esc(p.college)}</small></div><span class="match">${matchPct(p)}% match</span></div>
    <div class="pills">${p.subjects.map(s => `<span class="pill">${esc(s)}</span>`).join('')}</div>
    <div class="pills"><span class="pill info">🕒 ${p.time}</span><span class="pill info">📍 ${p.mode}</span></div>
    <div class="goal">🎯 ${esc(p.goal)}</div>
    <div class="actions">${actionBtn(p)}</div></div>`;
}

function renderGrid() {
  const q = $('#fSearch').value.toLowerCase(), sub = $('#fSubject').value, yr = $('#fYear').value, md = $('#fMode').value, tm = $('#fTime').value;
  let list = all().filter(p => (!S.me || p.id !== S.me.id) &&
    (!q || (p.name + p.college + p.course + p.subjects.join(' ')).toLowerCase().includes(q)) &&
    (!sub || p.subjects.includes(sub)) && (!yr || p.year == yr) && (!md || p.mode === md) && (!tm || p.time === tm));
  list.sort($('#fSort').value === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => matchPct(b) - matchPct(a));
  $('#count').textContent = `Showing ${list.length} students` + (S.me ? ' – sorted by match with your profile' : ' – create a profile for personalised matches');
  $('#grid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No students match these filters. Try clearing one.</div>';
  updateBadges();
}

// ---------- Requests logic ----------
function connect(pid) {
  const r = { id: S.nid++, pid, dir: 'sent', status: 'pending', t: nowT() };
  S.reqs.push(r); save(); toast(`Request sent to ${person(pid).name} 📨`); refresh();
  // Demo: partner responds after a few seconds
  setTimeout(() => simulateReply(r.id), 4000 + Math.random() * 4000);
}
function simulateReply(id) {
  const r = S.reqs.find(x => x.id === id);
  if (!r || r.status !== 'pending') return;
  r.status = Math.random() < 0.8 ? 'accepted' : 'declined'; save();
  const n = person(r.pid).name;
  toast(r.status === 'accepted' ? `🎉 ${n} accepted your request!` : `${n} declined your request`);
  if (r.status === 'accepted') pushMsg(r.pid, 'them', `Hi! Thanks for connecting. What are you studying this week?`, true);
  refresh();
}
function cancelReq(id) { S.reqs = S.reqs.filter(r => r.id !== id); save(); toast('Request cancelled'); refresh(); }
function respond(id, st) {
  const r = S.reqs.find(x => x.id === id); r.status = st; save();
  toast(st === 'accepted' ? `You are now connected with ${person(r.pid).name} ✅` : 'Request declined');
  refresh();
}
function refresh() {
  const cur = $('.page.active').id; go(cur);
}
let rf = 'all';
$$('#reqTabs button').forEach(b => b.onclick = () => { rf = b.dataset.f; $$('#reqTabs button').forEach(x => x.classList.toggle('active', x === b)); renderReqs(); });
function renderReqs() {
  const list = S.reqs.filter(r => rf === 'all' || r.dir === rf || r.status === rf).slice().reverse();
  $('#reqList').innerHTML = list.length ? list.map(r => {
    const p = person(r.pid), [c, c2] = col(p.id);
    let btns = '';
    if (r.status === 'pending' && r.dir === 'received') btns = `<button class="btn sm green" onclick="respond(${r.id},'accepted')">Accept</button><button class="btn sm red" onclick="respond(${r.id},'declined')">Decline</button>`;
    else if (r.status === 'pending') btns = `<button class="btn sm orange" onclick="cancelReq(${r.id})">Cancel</button>`;
    else if (r.status === 'accepted') btns = `<button class="btn sm" onclick="openChat(${p.id})">💬 Chat</button>`;
    return `<div class="card rcard" style="--c:${c};--c2:${c2}"><div class="av">${initials(p.name)}</div>
      <div class="info"><b>${esc(p.name)}</b><br><small>${esc(p.college)} · ${r.dir === 'sent' ? 'Sent by you' : 'Received'} at ${r.t}</small></div>
      <span class="status ${r.status}">${r.status === 'pending' ? '⏳ Pending' : r.status === 'accepted' ? '✔ Accepted' : '✖ Declined'}</span>${btns}</div>`;
  }).join('') : '<div class="empty">No requests here yet. Head to Discover and connect with someone!</div>';
}

// ---------- Chat ----------
let activeChat = null;
const REPLIES = ["Sounds great! When are you free?", "Let's solve some previous year papers together 📝", "I can explain that topic, it's my strong area 💪", "Can we do a quick call tonight?", "Haha yes, same here!", "Let's make a study schedule for the week 📅", "Nice! Share your notes if you have any 🙌", "Okay, I'll set a reminder. See you then!", "Let's start with the hardest chapter first."];
function pushMsg(pid, from, text, unread) {
  (S.msgs[pid] = S.msgs[pid] || []).push({ from, text, t: nowT() });
  if (unread && activeChat !== pid) S.unread[pid] = (S.unread[pid] || 0) + 1;
  save();
}
function openChat(pid) { activeChat = pid; S.unread[pid] = 0; save(); go('chat'); renderChat(); }
function renderChatList() {
  const list = S.reqs.filter(r => r.status === 'accepted').map(r => person(r.pid));
  $('#chatList').innerHTML = list.length ? list.map(p => {
    const ms = S.msgs[p.id] || [], last = ms[ms.length - 1], [c, c2] = col(p.id), u = S.unread[p.id];
    return `<div class="ci ${p.id === activeChat ? 'sel' : ''}" style="--c:${c};--c2:${c2}" onclick="openChat(${p.id})"><div class="av">${initials(p.name)}</div>
      <div><b>${esc(p.name)}</b> ${u ? `<span class="badge">${u}</span>` : ''}<small>${last ? esc(last.text) : 'Say hello 👋'}</small></div></div>`;
  }).join('') : '<div class="empty">Chat unlocks after a request is accepted.</div>';
  if (activeChat && !connected(activeChat)) activeChat = null;
  renderChat();
}
function renderChat() {
  const on = !!activeChat;
  $('#msgInput').disabled = !on; $('#msgForm button').disabled = !on;
  if (!on) { $('#chatHead').textContent = 'Select a partner to start chatting'; $('#msgs').innerHTML = ''; return; }
  const p = person(activeChat), [c, c2] = col(p.id);
  $('#chatHead').innerHTML = `<div class="av" style="--c:${c};--c2:${c2}">${initials(p.name)}</div><div>${esc(p.name)}<br><small class="muted">${esc(p.college)}</small></div>`;
  const ms = S.msgs[activeChat] || [];
  $('#msgs').innerHTML = ms.length ? ms.map(m => `<div class="m ${m.from}">${esc(m.text)}<small>${m.t}</small></div>`).join('') : '<div class="empty">No messages yet. Say hi! 👋</div>';
  $('#msgs').scrollTop = 1e9;
}
$('#msgForm').onsubmit = e => {
  e.preventDefault();
  const v = $('#msgInput').value.trim(); if (!v || !activeChat) return;
  const pid = activeChat; $('#msgInput').value = '';
  pushMsg(pid, 'me', v); renderChat(); renderChatList();
  $('#msgs').insertAdjacentHTML('beforeend', `<div class="typing" id="typ">${esc(person(pid).name.split(' ')[0])} is typing...</div>`); $('#msgs').scrollTop = 1e9;
  setTimeout(() => {
    pushMsg(pid, 'them', REPLIES[Math.floor(Math.random() * REPLIES.length)], true);
    if (activeChat === pid && $('#chat').classList.contains('active')) { renderChat(); renderChatList(); } else updateBadges();
  }, 1200 + Math.random() * 1200);
};

// ---------- Create profile ----------
const form = $('#profForm');
function formData() {
  const f = Object.fromEntries(new FormData(form));
  return { name: f.name || 'Your Name', course: f.course || 'Your Course', college: f.college || 'Your College', year: +f.year, mode: f.mode, time: f.time,
    subjects: (f.subjects || 'Subject').split(',').map(s => s.trim()).filter(Boolean).slice(0, 5), goal: f.goal || 'Your study goal', bio: f.bio };
}
function renderPreview() { $('#preview').innerHTML = card({ id: S.me ? S.me.id : 99, ...formData() }).replace(/<div class="actions">.*<\/div>/s, ''); }
form.addEventListener('input', renderPreview);
form.onsubmit = e => {
  e.preventDefault();
  const id = S.me ? S.me.id : 1000 + S.custom.length;
  const p = { id, ...formData() };
  S.custom = S.custom.filter(x => x.id !== id); S.custom.push(p); S.me = p; save();
  toast('Profile saved! Matches are now personalised 🎯'); go('discover');
};
if (S.me) { Object.entries(S.me).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = Array.isArray(v) ? v.join(', ') : v; }); }
$('#resetBtn').onclick = () => { if (confirm('Reset profile, requests and chats?')) { localStorage.removeItem(KEY); location.reload(); } };

// resume pending sent requests after reload
S.reqs.filter(r => r.dir === 'sent' && r.status === 'pending').forEach(r => setTimeout(() => simulateReply(r.id), 3000));
go('discover');
