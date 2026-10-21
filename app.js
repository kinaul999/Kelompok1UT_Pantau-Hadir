/* ============================================================
   Pantau Hadir — Shared Application Logic
   Client-side app: localStorage as database, no backend needed.
   ============================================================ */
(function () {
  'use strict';

  var KEYS = {
    workers: 'ph_workers',
    attendance: 'ph_attendance',
    admin: 'ph_admin',
    session: 'ph_session',
    seeded: 'ph_seeded_v1',
    company: 'ph_company'
  };

  var SITES = ['Site A - Kalimalang', 'Site B - Bekasi', 'Site C - Cikarang', 'Site D - Karawang'];
  var WORK_START_HOUR = 7, WORK_START_MIN = 30; // batas keterlambatan 07:30

  /* ---------------- Storage helpers ---------------- */
  function get(key, def) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) { return def; }
  }
  function set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------------- Seed default data ---------------- */
  function seed() {
    if (localStorage.getItem(KEYS.seeded)) return;
    set(KEYS.company, { name: 'PT. Jalan Baru', id: 'PTJB01' });
    set(KEYS.admin, { companyId: 'PTJB01', userId: 'admin', password: 'admin123' });

    var names = [
      'Bambang Cahyadi', 'Budiharso Supriando', 'Alexander Hamilton', 'Thomas Jefferson',
      'Ahmad Supriyadi', 'Dedi Rahmadi', 'Budi Santoso', 'Suryo Nugroho', 'Eko Prasetyo',
      'Reza Kurniawan', 'Hendra Wijaya', 'Muhammad Agung', 'Rizky Ramadhan', 'Agus Setiawan',
      'Fajar Hidayat', 'Gilang Gemilang', 'Hadi Pratama', 'Indra Lesmana', 'Joko Susilo', 'Lukman Hakim'
    ];
    var workers = names.map(function (n, i) {
      return {
        id: 'w' + (i + 1),
        nik: 'P' + String(i + 1).padStart(4, '0'),
        nama: n,
        site: SITES[i % SITES.length],
        password: '123456',
        createdAt: new Date(Date.now() - (30 - i) * 86400000).toISOString()
      };
    });
    set(KEYS.workers, workers);

    // Generate attendance history for the last 14 days (skip weekends)
    var att = [];
    var now = new Date();
    for (var d = 14; d >= 1; d--) {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      var dow = day.getDay();
      if (dow === 0 || dow === 6) continue; // libur akhir pekan
      workers.forEach(function (w, wi) {
        var r = Math.random();
        if (r < 0.08) return; // alpha
        var late = Math.random() < 0.18;
        var inMin = 5 + Math.floor(Math.random() * (late ? 55 : 22));
        var inH = late ? 8 : 7;
        var chkIn = new Date(day.getFullYear(), day.getMonth(), day.getDate(), inH, inMin, Math.floor(Math.random() * 50));
        var outH = 16, outMin = Math.floor(Math.random() * 45);
        var chkOut = new Date(day.getFullYear(), day.getMonth(), day.getDate(), outH, outMin, Math.floor(Math.random() * 50));
        att.push({
          id: uid(),
          workerId: w.id, nik: w.nik, nama: w.nama, site: w.site,
          date: fmtDateKey(day),
          checkIn: chkIn.toISOString(),
          checkOut: chkOut.toISOString(),
          status: late ? 'Terlambat' : 'Hadir',
          photoIn: null, photoOut: null, lat: null, lng: null
        });
      });
    }
    set(KEYS.attendance, att);
    localStorage.setItem(KEYS.seeded, '1');
  }

  /* ---------------- Workers CRUD ---------------- */
  function getWorkers() { return get(KEYS.workers, []); }
  function saveWorkers(list) { set(KEYS.workers, list); }
  function addWorker(w) {
    var list = getWorkers();
    w.id = uid();
    w.createdAt = new Date().toISOString();
    list.push(w);
    saveWorkers(list);
    return w;
  }
  function updateWorker(id, patch) {
    var list = getWorkers();
    var i = list.findIndex(function (x) { return x.id === id; });
    if (i > -1) { list[i] = Object.assign({}, list[i], patch); saveWorkers(list); return list[i]; }
    return null;
  }
  function deleteWorker(id) {
    saveWorkers(getWorkers().filter(function (x) { return x.id !== id; }));
    // keep attendance history
  }
  function nextNik() {
    var max = 0;
    getWorkers().forEach(function (w) {
      var m = /^P(\d+)$/.exec(w.nik || '');
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'P' + String(max + 1).padStart(4, '0');
  }

  /* ---------------- Attendance ---------------- */
  function getAttendance() { return get(KEYS.attendance, []); }
  function saveAttendance(list) { set(KEYS.attendance, list); }
  function todayKey() { return fmtDateKey(new Date()); }
  function fmtDateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function todayRecord(workerId) {
    var tk = todayKey();
    return getAttendance().find(function (a) { return a.workerId === workerId && a.date === tk; }) || null;
  }
  function computeStatus(checkInDate) {
    var limit = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate(), WORK_START_HOUR, WORK_START_MIN, 0);
    return checkInDate > limit ? 'Terlambat' : 'Hadir';
  }
  function checkIn(worker, photoData, lat, lng) {
    var now = new Date();
    var rec = {
      id: uid(), workerId: worker.id, nik: worker.nik, nama: worker.nama, site: worker.site,
      date: todayKey(), checkIn: now.toISOString(), checkOut: null,
      status: computeStatus(now), photoIn: photoData || null, photoOut: null,
      lat: lat != null ? lat : null, lng: lng != null ? lng : null
    };
    var list = getAttendance();
    list.push(rec);
    saveAttendance(list);
    return rec;
  }
  function checkOut(recId, photoData) {
    var list = getAttendance();
    var i = list.findIndex(function (a) { return a.id === recId; });
    if (i > -1) {
      list[i].checkOut = new Date().toISOString();
      if (photoData) list[i].photoOut = photoData;
      saveAttendance(list);
      return list[i];
    }
    return null;
  }
  function workerHistory(workerId, limit) {
    return getAttendance()
      .filter(function (a) { return a.workerId === workerId; })
      .sort(function (a, b) { return (b.checkIn || '').localeCompare(a.checkIn || ''); })
      .slice(0, limit || 10);
  }

  /* ---------------- Session ---------------- */
  function getSession() { return get(KEYS.session, null); }
  function setSession(s) { set(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function requireRole(role) {
    var s = getSession();
    if (!s || s.role !== role) {
      window.location.href = 'index.html?err=silakan-masuk';
      return null;
    }
    return s;
  }
  function logout(e) {
    if (e) e.preventDefault();
    clearSession();
    window.location.href = 'index.html';
  }

  /* ---------------- Icons (inline SVG, lucide-style) ---------------- */
  var PATHS = {
    'hard-hat': '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
    'layout': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'clipboard': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'edit': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    'trash': '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'scan-face': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'chevrons-left': '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
    'chevrons-right': '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
    'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
    'file-spreadsheet': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    'alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'building': '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    'id-card': '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect width="18" height="14" x="3" y="5" rx="2"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'image-off': '<path d="m2 2 20 20"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><path d="M13.5 13.5 6 21"/><path d="M18 12V8a2 2 0 0 0-2-2H8.5"/><path d="M21 15v-3a2 2 0 0 0-2-2"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/>'
  };
  function icon(name, cls) {
    var p = PATHS[name] || PATHS.alert;
    return '<svg class="' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ---------------- Formatting ---------------- */
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function fmtTanggal(isoOrDate) {
    var d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtTanggalSingkat(isoOrDate) {
    var d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    return String(d.getDate()).padStart(2, '0') + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtWaktu(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }
  function initials(nama) {
    return nama.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  }

  /* ---------------- Live clock ---------------- */
  function startClock(dateEl, timeEl) {
    function tick() {
      var n = new Date();
      if (dateEl) dateEl.textContent = fmtTanggal(n);
      if (timeEl) timeEl.textContent = fmtWaktu(n.toISOString()) + ' WIB';
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, type) {
    var wrap = document.getElementById('toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = icon(type === 'error' ? 'x' : 'check') + '<span>' + msg + '</span>';
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(function () { t.remove(); }, 3000);
  }

  /* ---------------- Modal ---------------- */
  function modal(html) {
    var bd = document.createElement('div');
    bd.className = 'modal-backdrop show';
    bd.innerHTML = '<div class="modal">' + html + '</div>';
    bd.addEventListener('click', function (e) { if (e.target === bd) bd.remove(); });
    document.body.appendChild(bd);
    return { el: bd, close: function () { bd.remove(); } };
  }
  function confirmDialog(title, text, onYes) {
    var m = modal(
      '<h3>' + title + '</h3><p>' + text + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" data-no>Batal</button>' +
      '<button class="btn btn-danger" data-yes>' + icon('trash') + ' Hapus</button>' +
      '</div>'
    );
    m.el.querySelector('[data-no]').onclick = m.close;
    m.el.querySelector('[data-yes]').onclick = function () { m.close(); onYes(); };
  }

  /* ---------------- CSV export ---------------- */
  function exportCSV(filename, headers, rows) {
    var esc = function (v) {
      v = v == null ? '' : String(v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var csv = '\uFEFF' + headers.map(esc).join(',') + '\n' +
      rows.map(function (r) { return r.map(esc).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------------- Sidebar toggle (mobile) ---------------- */
  function initSidebar() {
    var toggle = document.querySelector('.menu-toggle');
    var side = document.querySelector('.sidebar');
    var overlay = document.querySelector('.overlay');
    if (!toggle || !side) return;
    function close() { side.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }
    toggle.addEventListener('click', function () {
      side.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
    if (overlay) overlay.addEventListener('click', close);
    document.querySelectorAll('.sidebar nav a').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ---------------- Password toggle ---------------- */
  function initPasswordToggles() {
    document.querySelectorAll('[data-toggle-pass]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.querySelector(btn.getAttribute('data-toggle-pass'));
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = icon(show ? 'eye-off' : 'eye');
      });
    });
  }

  /* ---------------- URL params ---------------- */
  function param(name) {
    var u = new URLSearchParams(window.location.search);
    return u.get(name);
  }

  // Auto-run on every page
  seed();
  document.addEventListener('DOMContentLoaded', function () {
    initSidebar();
    initPasswordToggles();
    document.querySelectorAll('[data-logout]').forEach(function (a) { a.addEventListener('click', logout); });
    var err = param('err');
    if (err) toast(decodeURIComponent(err), 'error');
    var ok = param('ok');
    if (ok) toast(decodeURIComponent(ok), 'success');
  });

  // Expose API
  window.PH = {
    KEYS: KEYS, SITES: SITES, WORK_START: { h: WORK_START_HOUR, m: WORK_START_MIN },
    seed: seed,
    getWorkers: getWorkers, addWorker: addWorker, updateWorker: updateWorker, deleteWorker: deleteWorker, nextNik: nextNik,
    getAttendance: getAttendance, todayRecord: todayRecord, checkIn: checkIn, checkOut: checkOut, workerHistory: workerHistory, todayKey: todayKey, fmtDateKey: fmtDateKey,
    getSession: getSession, setSession: setSession, clearSession: clearSession, requireRole: requireRole, logout: logout,
    icon: icon, fmtTanggal: fmtTanggal, fmtTanggalSingkat: fmtTanggalSingkat, fmtWaktu: fmtWaktu, initials: initials,
    startClock: startClock, toast: toast, modal: modal, confirmDialog: confirmDialog, exportCSV: exportCSV, param: param,
    getCompany: function () { return get(KEYS.company, { name: 'PT. Jalan Baru', id: 'PTJB01' }); },
    getAdmin: function () { return get(KEYS.admin, null); }
  };
})();
