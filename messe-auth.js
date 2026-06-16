// Messe authentication — users managed via Google Sheets / Apps Script
// Sets window.MesseAuth
(function () {
  'use strict';

  const API = 'https://script.google.com/macros/s/AKfycbwIkKv8GUtc5WsQsvlMCFaujif_jizWPebNoDRD_kSzenGeWec_whWvOhxTZW2ZZCfj/exec';

  const DEFAULT_LAGERPLAETZE = [
    { id: 'halle-a', name: 'Halle A – Eingang',  color: '#b8860b' },
    { id: 'halle-b', name: 'Halle B – Mitte',    color: '#a16207' },
    { id: 'lager-b', name: 'Lager B – Hinten',   color: '#78350f' },
    { id: 'service', name: 'Service-Bereich',     color: '#92400e' },
  ];

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  function apiFetch(params) {
    const url = API + '?' + new URLSearchParams(params).toString();
    return fetch(url).then(r => r.json());
  }

  const MesseAuth = {
    getSession() {
      return load('messe_session', null);
    },

    // Returns Promise<session|null> — async because it hits Google Sheets
    async login(username, password) {
      const res = await apiFetch({ action: 'login', username, password });
      if (!res.ok) return null;
      const session = { ...res.user, password }; // keep password for API calls
      save('messe_session', session);
      return session;
    },

    logout() {
      localStorage.removeItem('messe_session');
    },

    // Returns Promise<user[]>
    async getUsers(callerUsername) {
      const res = await apiFetch({ action: 'list', caller: callerUsername });
      if (!res.ok) return [];
      return res.users;
    },

    // Returns Promise<{ok, error?}>
    async addUser(caller, newUser) {
      const session = MesseAuth.getSession();
      return apiFetch({
        action:     'add',
        caller:     caller,
        callerPass: session?.password || '',
        username:   newUser.username,
        password:   newUser.password,
        name:       newUser.name,
        role:       newUser.role,
        initials:   newUser.initials,
      });
    },

    // Returns Promise<{ok, error?}>
    async delUser(caller, targetUsername) {
      const session = MesseAuth.getSession();
      return apiFetch({
        action:     'del',
        caller:     caller,
        callerPass: session?.password || '',
        target:     targetUsername,
      });
    },

    getLagerplaetze() {
      const stored = load('messe_lagerplaetze', null);
      return stored || [...DEFAULT_LAGERPLAETZE];
    },
    saveLagerplaetze(list) {
      save('messe_lagerplaetze', list);
    },
    getMesseBestand() {
      return load('messe_bestand', {});
    },
    setMesseBestand(ean, qty) {
      const b = MesseAuth.getMesseBestand();
      b[String(ean)] = qty;
      save('messe_bestand', b);
    },
    getOrders() {
      return load('messe_orders', []);
    },
    addOrder(order) {
      const orders = MesseAuth.getOrders();
      orders.unshift(order);
      save('messe_orders', orders);
      return order;
    },
  };

  window.MesseAuth = MesseAuth;
})();
