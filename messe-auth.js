// Messe authentication and data management
// Sets window.MesseAuth
(function () {
  'use strict';

  const BUILTIN_USERS = [
    { username: 'erik.f', password: 'AtlantisApp213', name: 'Erik Fritsche', role: 'admin', initials: 'EF' }
  ];

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

  const MesseAuth = {
    getSession() {
      return load('messe_session', null);
    },
    login(username, password) {
      const users = MesseAuth.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) return null;
      const session = { username: user.username, name: user.name, role: user.role, initials: user.initials };
      save('messe_session', session);
      return session;
    },
    logout() {
      localStorage.removeItem('messe_session');
    },
    getUsers() {
      const stored = load('messe_users', []);
      // merge builtin (builtin always wins for erik.f)
      const merged = [...BUILTIN_USERS];
      stored.forEach(u => {
        if (!merged.find(b => b.username === u.username)) merged.push(u);
      });
      return merged;
    },
    saveUsers(users) {
      // don't store builtin users — they are always injected by getUsers
      const toStore = users.filter(u => !BUILTIN_USERS.find(b => b.username === u.username));
      save('messe_users', toStore);
    },
    getLagerplaetze() {
      const stored = load('messe_lagerplaetze', null);
      if (!stored) return [...DEFAULT_LAGERPLAETZE];
      return stored;
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
