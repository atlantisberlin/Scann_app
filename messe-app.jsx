// Messe mode – full UI
/* global React, MesseAuth, ATLANTIS, AUI, DetailView */
(function () {
  'use strict';

  const GOLD        = '#DAA520';
  const GOLD_DARK   = '#8a6000';
  const GOLD_BG     = 'rgba(218,165,32,.1)';
  const GOLD_BORDER = 'rgba(218,165,32,.32)';
  const CARD_BG     = '#fff';
  const APP_BG      = '#eef2f7';
  const BORDER      = 'rgba(26,60,110,.09)';
  const HDR_BG      = 'rgba(255,249,220,.96)';

  // ── small helpers ──────────────────────────────────────────────
  const F = (px) => px; // no scaling needed in Messe UI

  function GoldBtn({ onClick, children, style = {} }) {
    return (
      <button onClick={onClick} style={{
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        background: GOLD, color: '#fff', borderRadius: 14,
        height: 50, fontSize: 15, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', ...style
      }}>{children}</button>
    );
  }

  function GhostBtn({ onClick, children, style = {} }) {
    return (
      <button onClick={onClick} style={{
        border: `1.5px solid ${GOLD_BORDER}`, cursor: 'pointer', fontFamily: 'inherit',
        background: 'transparent', color: GOLD_DARK, borderRadius: 14,
        height: 44, fontSize: 14, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', ...style
      }}>{children}</button>
    );
  }

  function Avatar({ initials, size = 32 }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: GOLD, color: '#fff', fontWeight: 800,
        fontSize: size * 0.38, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>{initials}</div>
    );
  }

  // ── MesseLoginSheet ────────────────────────────────────────────
  function MesseLoginSheet({ onLogin, onExit }) {
    const [user, setUser]   = React.useState('');
    const [pass, setPass]   = React.useState('');
    const [err,  setErr]    = React.useState('');
    const [busy, setBusy]   = React.useState(false);

    const submit = () => {
      if (!user || !pass) { setErr('Bitte Benutzername und Passwort eingeben.'); return; }
      setBusy(true);
      const session = MesseAuth.login(user.trim(), pass);
      setBusy(false);
      if (session) { setErr(''); onLogin(session); }
      else setErr('Falscher Benutzername oder Passwort.');
    };

    const inputStyle = {
      width: '100%', height: 48, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`,
      padding: '0 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
      background: GOLD_BG, color: '#1b2733'
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: APP_BG, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: GOLD_DARK }}>Messe-Modus</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Nur für Messe-Mitarbeiter</div>
          </div>
          <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}`, boxShadow: '0 2px 16px rgba(218,165,32,.1)' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Benutzername</div>
              <input value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="z. B. erik.f" style={inputStyle} autoCapitalize="none" autoCorrect="off" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Passwort</div>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="••••••••" style={inputStyle} />
            </div>
            {err && <div style={{ fontSize: 13, color: '#c8102e', marginBottom: 12, textAlign: 'center' }}>{err}</div>}
            <GoldBtn onClick={submit} style={{ opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Wird angemeldet …' : 'Anmelden'}
            </GoldBtn>
          </div>
          <button onClick={onExit} style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14, fontFamily: 'inherit' }}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  // ── Messe Header ───────────────────────────────────────────────
  function MesseHeader({ session, onUserChipClick }) {
    return (
      <div style={{
        background: HDR_BG, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        paddingTop: 'calc(env(safe-area-inset-top, 12px) + 16px)', paddingBottom: 12,
        paddingLeft: 16, paddingRight: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${GOLD_BORDER}`, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: GOLD_DARK, background: GOLD_BG, borderRadius: 20, padding: '5px 12px', border: `1.5px solid ${GOLD_BORDER}` }}>⭐ Messe</span>
        </div>
        <button onClick={onUserChipClick} style={{ border: 'none', background: GOLD_BG, borderRadius: 20, padding: '5px 10px 5px 6px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, outline: `1.5px solid ${GOLD_BORDER}` }}>
          <Avatar initials={session.initials} size={24} />
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD_DARK }}>{session.name.split(' ')[0]}</span>
        </button>
      </div>
    );
  }

  // ── User Menu Sheet ────────────────────────────────────────────
  function UserMenuSheet({ session, onClose, onAdmin, onLogout }) {
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: CARD_BG, borderRadius: '20px 20px 0 0', padding: '20px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom,16px) + 16px)', boxShadow: '0 -4px 32px rgba(0,0,0,.18)' }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: BORDER, margin: '0 auto 18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Avatar initials={session.initials} size={48} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1b2733' }}>{session.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>@{session.username}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: session.role === 'admin' ? GOLD_DARK : '#1a3c6e', background: session.role === 'admin' ? GOLD_BG : 'rgba(26,60,110,.1)', padding: '2px 8px', borderRadius: 6, marginTop: 4, display: 'inline-block' }}>{session.role === 'admin' ? 'Admin' : session.role === 'messe' ? 'Messe' : 'Mitarbeiter'}</span>
            </div>
          </div>
          {session.role === 'admin' && (
            <button onClick={onAdmin} style={{ width: '100%', height: 48, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, background: GOLD_BG, color: GOLD_DARK, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
              ⚙ Admin-Einstellungen
            </button>
          )}
          <button onClick={onLogout} style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid rgba(200,16,46,.25)', background: 'rgba(200,16,46,.06)', color: '#c8102e', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  // ── Messe Tab Bar ──────────────────────────────────────────────
  function MesseTabBar({ tab, setTab, cartCount }) {
    const TABS = [
      { key: 'scan',    label: 'Scannen',   icon: '📷' },
      { key: 'cart',    label: 'Warenkorb', icon: '🛒', badge: cartCount },
      { key: 'history', label: 'Verlauf',   icon: '🕐' },
      { key: 'lager',   label: 'Lager',     icon: '📦' },
    ];
    return (
      <div style={{
        display: 'flex', background: CARD_BG, borderTop: `1px solid ${BORDER}`,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 10px) + 8px)', flexShrink: 0
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
              paddingTop: 0, paddingBottom: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ height: 3, width: '100%', background: active ? GOLD : 'transparent', borderRadius: '0 0 3px 3px', marginBottom: 6 }} />
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              {t.badge > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 'calc(50% - 18px)', background: '#c8102e', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{t.badge}</span>
              )}
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? GOLD_DARK : '#64748b', marginTop: 2, marginBottom: 4 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Scan Tab ───────────────────────────────────────────────────
  function MesseScanTab({ products, messeHistory, onProductOpen, onProductScanned, cart, setCart }) {
    const { useState, useRef, useEffect, useCallback, useMemo } = React;
    const { EUR } = ATLANTIS;
    const { ProductPhoto, Icon } = AUI;

    const [cam, setCam]             = useState('idle');
    const [camOverlay, setCamOverlay] = useState(false);
    const [camMsg, setCamMsg]       = useState('');
    const [notFound, setNotFound]   = useState(null);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [torchOn, setTorchOn]     = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [searchActive, setSearchActive] = useState(false);
    const [q, setQ]                 = useState('');
    const [filterBrand, setFilterBrand] = useState(null);
    const [filterCat, setFilterCat] = useState(null);
    const [visibleCap, setVisibleCap] = useState(40);
    const [detailSheet, setDetailSheet] = useState(null);

    const camRef      = useRef(null);
    const nfTimer     = useRef(0);
    const lastCode    = useRef('');
    const lastCodeAt  = useRef(0);

    const CAM = typeof Html5Qrcode !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.mediaDevices;

    // build EAN index
    const codeIndex = useMemo(() => {
      const ei = {}, ai = {};
      (products || []).forEach(p => {
        if (p.ean) ei[String(p.ean).trim()] = p;
        (p.allEans || []).forEach(e => { if (e) ei[String(e).trim()] = p; });
        if (p.art) ai[String(p.art).trim().toLowerCase()] = p;
      });
      return { ei, ai };
    }, [products]);

    const lookup = useCallback(code => {
      const c = String(code).trim();
      return codeIndex.ei[c] || codeIndex.ai[c.toLowerCase()] || null;
    }, [codeIndex]);

    const stopCamera = useCallback(() => {
      const inst = camRef.current; camRef.current = null;
      if (inst) { try { inst.stop().then(() => inst.clear()).catch(() => {}); } catch (e) {} }
      setCam(c => (c === 'live' ? 'idle' : c));
      setTorchOn(false);
    }, []);

    const handleStopCamera = useCallback(() => {
      stopCamera();
      setCamOverlay(false);
      setNotFound(null);
      setScanSuccess(false);
    }, [stopCamera]);

    const handleCode = useCallback(code => {
      const c = String(code).trim();
      const now = Date.now();
      if (c === lastCode.current && now - lastCodeAt.current < 1500) return;
      lastCode.current = c;
      lastCodeAt.current = now;
      const product = lookup(c);
      if (product) {
        setNotFound(null);
        setScanSuccess(true);
        navigator.vibrate && navigator.vibrate(60);
        setTimeout(() => {
          setScanSuccess(false);
          handleStopCamera();
          onProductScanned(product, c);
          setDetailSheet(product);
        }, 500);
      } else {
        setNotFound(c);
        clearTimeout(nfTimer.current);
        nfTimer.current = setTimeout(() => setNotFound(null), 3500);
      }
    }, [lookup, handleStopCamera, onProductScanned]);

    const startCamera = useCallback((facing = 'environment') => {
      if (!CAM || camRef.current) return;
      setNotFound(null); setScanSuccess(false); setCamMsg(''); setCam('live');
      let inst;
      try { inst = new Html5Qrcode('scanner-cam', { verbose: false }); }
      catch (e) { setCam('error'); setCamMsg('Scanner konnte nicht gestartet werden.'); return; }
      camRef.current = inst;
      inst.start(
        { facingMode: facing },
        { fps: 30, qrbox: (w, h) => ({ width: Math.round(w * 0.92), height: Math.round(h * 0.38) }),
          videoConstraints: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
        text => handleCode(text), () => {}
      ).catch(e => {
        camRef.current = null; setCam('error');
        setCamMsg(/permission|denied|notallowed|notfounderror/i.test(String(e))
          ? 'Kein Kamerazugriff. Erlaube die Kamera in den Browser-Einstellungen.'
          : 'Keine Kamera gefunden.');
      });
    }, [CAM, handleCode]);

    useEffect(() => {
      if (!camOverlay) return;
      const t = setTimeout(() => startCamera(facingMode), 80);
      return () => clearTimeout(t);
    }, [camOverlay]); // eslint-disable-line

    useEffect(() => () => stopCamera(), [stopCamera]);

    const messeBestand = MesseAuth.getMesseBestand();

    // search
    const q2 = q.trim().toLowerCase();
    const toks = q2.length >= 2 ? q2.split(/\s+/).filter(Boolean) : [];
    const tokenMatch = (s, ts) => ts.every(t => s.includes(t));

    const matches = useMemo(() => {
      return (products || []).filter(p => {
        if (p.isMaster) return false;
        const s = (p.name + ' ' + p.brand + ' ' + p.art + ' ' + p.cat + ' ' + p.ean).toLowerCase();
        return (toks.length === 0 || tokenMatch(s, toks))
          && (!filterBrand || p.brand === filterBrand)
          && (!filterCat   || p.cat   === filterCat);
      });
    }, [products, toks, filterBrand, filterCat]);

    useEffect(() => { setVisibleCap(40); }, [q, filterBrand, filterCat]);

    const fmtTime = at => {
      const d = new Date(at);
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    // Camera overlay
    const CamBox = () => (
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0b1726', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
        <div id="scanner-cam" style={{ position: 'absolute', inset: 0 }} />
        {/* corner markers */}
        {[['0%','0%','right','bottom'],['0%','auto','right','top'],['auto','0%','left','bottom'],['auto','auto','left','top']].map(([t,b,br,tl],i) => (
          <div key={i} style={{ position: 'absolute', top: t, bottom: b, left: tl === 'left' ? 12 : undefined, right: br === 'right' ? 12 : undefined, width: 20, height: 20, pointerEvents: 'none',
            borderTop: (tl === 'left' && b === 'auto') || (tl === 'right' && b === 'auto') ? `3px solid ${GOLD}` : 'none',
            borderBottom: (b !== 'auto') ? `3px solid ${GOLD}` : 'none',
            borderLeft: (tl === 'left') ? `3px solid ${GOLD}` : 'none',
            borderRight: (tl === 'right') ? `3px solid ${GOLD}` : 'none',
          }} />
        ))}
        {/* scan success flash */}
        {scanSuccess && <div style={{ position: 'absolute', inset: 0, background: 'rgba(218,165,32,0.25)', borderRadius: 16, pointerEvents: 'none' }} />}
        {/* not found */}
        {notFound && <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(200,16,46,.9)', color: '#fff', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Nicht gefunden: {notFound}</div>}
        {/* error / idle */}
        {cam === 'error' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: '#ff8a8a', fontSize: 13, textAlign: 'center', padding: 16 }}>{camMsg}</div>
        </div>}
        {/* top bar */}
        {cam === 'live' && (
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => { const next = facingMode === 'environment' ? 'user' : 'environment'; setFacingMode(next); stopCamera(); setTimeout(() => startCamera(next), 300); }}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔄</button>
          </div>
        )}
      </div>
    );

    if (detailSheet) {
      const mStock = messeBestand[String(detailSheet.ean)] != null ? messeBestand[String(detailSheet.ean)] : 0;
      return (
        <MesseDetailSheet
          product={detailSheet}
          messeStock={mStock}
          cart={cart}
          setCart={setCart}
          onClose={() => setDetailSheet(null)}
        />
      );
    }

    if (searchActive) {
      const brands = [...new Set((products || []).filter(p => !p.isMaster && p.brand).map(p => p.brand))].slice(0, 8);
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 8px', background: CARD_BG, borderBottom: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center' }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Suche nach Name, EAN, Art.-Nr. …"
              style={{ flex: 1, height: 42, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, padding: '0 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: GOLD_BG }} />
            <button onClick={() => { setSearchActive(false); setQ(''); setFilterBrand(null); setFilterCat(null); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}>Abbrechen</button>
          </div>
          <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', flexShrink: 0 }}>
            {brands.map(b => (
              <button key={b} onClick={() => setFilterBrand(filterBrand === b ? null : b)}
                style={{ border: `1px solid ${filterBrand === b ? GOLD : BORDER}`, background: filterBrand === b ? GOLD_BG : CARD_BG, color: filterBrand === b ? GOLD_DARK : '#1b2733', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{b}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 16px' }}>
            {matches.slice(0, visibleCap).map(p => (
              <button key={p.ean || p.art} onClick={() => { setDetailSheet(p); onProductScanned(p, p.ean); }} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, fontFamily: 'inherit'
              }}>
                <AUI.ProductPhoto product={p} dark={false} radius={8} style={{ width: 48, height: 48, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.brand}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1b2733', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: GOLD_DARK, marginTop: 2 }}>{p.noPrice ? '–' : ATLANTIS.EUR(p.price)}</div>
                </div>
              </button>
            ))}
            {matches.length > visibleCap && (
              <button onClick={() => setVisibleCap(v => v + 40)} style={{ width: '100%', height: 44, borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD_BG, color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>
                +{matches.length - visibleCap} weitere laden
              </button>
            )}
            {matches.length === 0 && q2.length >= 2 && (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 40 }}>Keine Artikel gefunden</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
          {/* Camera box */}
          <div style={{ marginBottom: 12 }}>
            {camOverlay ? (
              <div style={{ position: 'relative' }}>
                <CamBox />
                <button onClick={handleStopCamera} style={{ marginTop: 10, width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, background: GOLD_BG, color: GOLD_DARK, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✕ Kamera schließen
                </button>
              </div>
            ) : (
              <button onClick={() => { if (!CAM) { setCam('error'); setCamMsg('Kein Kamerazugriff auf diesem Gerät.'); return; } setCamOverlay(true); }}
                style={{ width: '100%', paddingTop: '56.25%', position: 'relative', background: '#1b2733', borderRadius: 16, border: 'none', cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ fontSize: 36 }}>📷</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>Kamera starten</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Tippen um zu scannen</div>
                </div>
              </button>
            )}
          </div>

          {/* Search bar */}
          <button onClick={() => setSearchActive(true)} style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, background: CARD_BG, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>Artikel suchen …</span>
          </button>

          {/* Recent */}
          {messeHistory.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>Zuletzt gescannt</div>
              {messeHistory.slice(0, 5).map((h, i) => (
                <button key={`${h.product.ean}-${i}`} onClick={() => setDetailSheet(h.product)} style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer', background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, fontFamily: 'inherit'
                }}>
                  <AUI.ProductPhoto product={h.product} dark={false} radius={8} style={{ width: 48, height: 48, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h.product.brand} · {new Date(h.at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1b2733', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.product.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: GOLD_DARK, marginTop: 2 }}>{h.product.noPrice ? '–' : ATLANTIS.EUR(h.product.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {messeHistory.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div>Noch keine Artikel gescannt</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Messe Detail Sheet ─────────────────────────────────────────
  function MesseDetailSheet({ product, messeStock, cart, setCart, onClose }) {
    const [qty, setQty]       = React.useState(1);
    const [added, setAdded]   = React.useState(false);

    const addToCart = () => {
      setCart(prev => {
        const existing = prev.find(i => i.product.ean === product.ean);
        if (existing) return prev.map(i => i.product.ean === product.ean ? { ...i, qty: i.qty + qty } : i);
        return [...prev, { product, qty, note: '' }];
      });
      setAdded(true);
      setTimeout(() => { setAdded(false); onClose(); }, 800);
    };

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <AUI.ProductPhoto product={product} dark={false} radius={12} style={{ width: 80, height: 80, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{product.brand}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1b2733', lineHeight: 1.2 }}>{product.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: GOLD_DARK, marginTop: 4 }}>{product.noPrice ? '–' : ATLANTIS.EUR(product.price)}</div>
            </div>
          </div>
          <div style={{ background: GOLD_BG, borderRadius: 12, border: `1px solid ${GOLD_BORDER}`, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: GOLD_DARK, fontWeight: 600 }}>Messe-Lager</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: messeStock > 0 ? GOLD_DARK : '#c8102e' }}>{messeStock} Stk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1b2733', flexShrink: 0 }}>Menge:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: GOLD_BG, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, overflow: 'hidden', flex: 1 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 44, height: 44, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: GOLD_DARK, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, color: GOLD_DARK }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 44, height: 44, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: GOLD_DARK, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 10px) + 12px)', borderTop: `1px solid ${BORDER}`, background: CARD_BG, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GoldBtn onClick={addToCart} style={{ background: added ? '#1f8a4c' : GOLD }}>
            {added ? '✓ Hinzugefügt' : '🛒 In den Warenkorb'}
          </GoldBtn>
          <GhostBtn onClick={onClose}>Weiter scannen</GhostBtn>
        </div>
      </div>
    );
  }

  // ── Cart Tab ───────────────────────────────────────────────────
  function CartTab({ cart, setCart, onOrderSent }) {
    const { EUR } = ATLANTIS;
    const [confirming, setConfirming] = React.useState(false);
    const [orderDone, setOrderDone]   = React.useState(null);

    const updateQty = (ean, delta) => {
      setCart(prev => prev.map(i => i.product.ean === ean ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    };
    const removeItem = (ean) => setCart(prev => prev.filter(i => i.product.ean !== ean));
    const updateNote = (ean, note) => setCart(prev => prev.map(i => i.product.ean === ean ? { ...i, note } : i));

    const totalStk = cart.reduce((s, i) => s + i.qty, 0);
    const totalEUR = cart.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0);

    const sendOrder = () => {
      const order = {
        id: `M-${Date.now()}`,
        at: new Date().toISOString(),
        items: cart.map(i => ({ ean: i.product.ean, name: i.product.name, qty: i.qty, price: i.product.price, note: i.note })),
        totalStk, totalEUR
      };
      MesseAuth.addOrder(order);
      setOrderDone(order);
      setCart([]);
    };

    if (orderDone) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1f8a4c', marginBottom: 8 }}>Bestellung gesendet</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Bestell-Nr.: {orderDone.id}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{orderDone.items.length} Pos. · {totalStk} Stk · {EUR(totalEUR)}</div>
          <GoldBtn onClick={() => { setOrderDone(null); onOrderSent(); }} style={{ maxWidth: 280 }}>Weiterscannen</GoldBtn>
        </div>
      );
    }

    if (cart.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1b2733', marginBottom: 8 }}>Noch keine Artikel</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Scanne Artikel um sie hinzuzufügen</div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
          {cart.map(item => (
            <div key={item.product.ean} style={{ background: CARD_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <AUI.ProductPhoto product={item.product} dark={false} radius={8} style={{ width: 52, height: 52, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.product.brand}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1b2733', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GOLD_DARK }}>{item.product.noPrice ? '–' : EUR(item.product.price)}</div>
                </div>
                <button onClick={() => removeItem(item.product.ean)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c8102e', fontSize: 20, padding: 4 }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${GOLD_BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => updateQty(item.product.ean, -1)} style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: GOLD_DARK, fontFamily: 'inherit' }}>−</button>
                  <span style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: 800, color: GOLD_DARK }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.product.ean, 1)} style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: GOLD_DARK, fontFamily: 'inherit' }}>+</button>
                </div>
                <input value={item.note} onChange={e => updateNote(item.product.ean, e.target.value)}
                  placeholder="Notiz …" style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`, padding: '0 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8fafc' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom,10px) + 12px)', borderTop: `1px solid ${BORDER}`, background: CARD_BG }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{cart.length} Pos. · {totalStk} Stk</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: GOLD_DARK }}>{EUR(totalEUR)}</span>
          </div>
          <GoldBtn onClick={sendOrder}>📋 Bestellung absenden</GoldBtn>
        </div>
      </div>
    );
  }

  // ── Verlauf Tab ────────────────────────────────────────────────
  function VerlaufTab({ messeHistory }) {
    const { EUR } = ATLANTIS;
    if (messeHistory.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🕐</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1b2733', marginBottom: 8 }}>Noch keine Artikel gescannt</div>
        </div>
      );
    }
    return (
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {[...messeHistory].reverse().map((h, i) => (
          <div key={`${h.product.ean}-${i}`} style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: '10px 12px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <AUI.ProductPhoto product={h.product} dark={false} radius={8} style={{ width: 52, height: 52, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h.product.brand} · {new Date(h.at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1b2733', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.product.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: GOLD_DARK, marginTop: 2 }}>{h.product.noPrice ? '–' : EUR(h.product.price)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Lager Tab ──────────────────────────────────────────────────
  function LagerTab() {
    const [lagerView, setLagerView] = React.useState('overview');
    const [lagerLog, setLagerLog]   = React.useState(() => {
      try { return JSON.parse(localStorage.getItem('messe_lager_log') || '[]'); }
      catch { return []; }
    });
    const lagerplaetze = MesseAuth.getLagerplaetze();

    const saveLog = (entry) => {
      const next = [entry, ...lagerLog].slice(0, 50);
      setLagerLog(next);
      try { localStorage.setItem('messe_lager_log', JSON.stringify(next)); } catch {}
    };

    const FLOWS = [
      { key: 'we', label: 'Wareneingang', icon: '📥', color: '#1a3c6e', steps: ['Lagerplatz wählen', 'EAN / Menge', 'Bestätigung'] },
      { key: 'inv', label: 'Inventur', icon: '📋', color: '#166534', steps: ['Lagerplatz wählen', 'Bestand erfassen', 'Bestätigung'] },
      { key: 'bk', label: 'Bestandskorrektur', icon: '✏️', color: '#854d0e', steps: ['Artikel wählen', 'Neue Menge', 'Bestätigung'] },
      { key: 'uml', label: 'Umlagerung', icon: '🔄', color: '#5b21b6', steps: ['Von', 'Nach / Menge', 'Bestätigung'] },
    ];

    const FlowScreen = ({ flowKey }) => {
      const flow = FLOWS.find(f => f.key === flowKey);
      const [step, setStep] = React.useState(1);
      const [vals, setVals] = React.useState({ from: '', to: '', ean: '', qty: 1, note: '' });

      const maxStep = flow.steps.length;
      const update = (k, v) => setVals(p => ({ ...p, [k]: v }));

      const LPSelect = ({ label, valKey }) => (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{label}</div>
          <select value={vals[valKey]} onChange={e => update(valKey, e.target.value)}
            style={{ width: '100%', height: 46, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, padding: '0 12px', fontSize: 15, fontFamily: 'inherit', background: CARD_BG, outline: 'none' }}>
            <option value="">Bitte wählen …</option>
            {lagerplaetze.map(lp => <option key={lp.id} value={lp.id}>{lp.name}</option>)}
          </select>
        </div>
      );

      const Field = ({ label, valKey, type = 'text', placeholder = '' }) => (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{label}</div>
          <input type={type} value={vals[valKey]} onChange={e => update(valKey, type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', height: 46, borderRadius: 12, border: `1.5px solid ${GOLD_BORDER}`, padding: '0 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: GOLD_BG }} />
        </div>
      );

      const book = () => {
        const entry = { type: flowKey, at: new Date().toISOString(), ...vals };
        saveLog(entry);
        setLagerView('overview');
      };

      const renderStep = () => {
        if (flowKey === 'we') {
          if (step === 1) return <><LPSelect label="Lagerplatz" valKey="to" /></>;
          if (step === 2) return <><Field label="EAN / Artikel-Nr." valKey="ean" placeholder="4711…" /><Field label="Menge" valKey="qty" type="number" /></>;
          return <SummaryStep />;
        }
        if (flowKey === 'inv') {
          if (step === 1) return <><LPSelect label="Lagerplatz" valKey="from" /></>;
          if (step === 2) return <><Field label="EAN / Artikel-Nr." valKey="ean" placeholder="4711…" /><Field label="Gezählte Menge" valKey="qty" type="number" /></>;
          return <SummaryStep />;
        }
        if (flowKey === 'bk') {
          if (step === 1) return <><Field label="EAN / Artikel-Nr." valKey="ean" placeholder="4711…" /></>;
          if (step === 2) return <><Field label="Neue Menge" valKey="qty" type="number" /><Field label="Notiz" valKey="note" placeholder="Grund …" /></>;
          return <SummaryStep />;
        }
        if (flowKey === 'uml') {
          if (step === 1) return <><LPSelect label="Von Lagerplatz" valKey="from" /></>;
          if (step === 2) return <><LPSelect label="Nach Lagerplatz" valKey="to" /><Field label="Menge" valKey="qty" type="number" /></>;
          return <SummaryStep />;
        }
      };

      const SummaryStep = () => (
        <div style={{ background: GOLD_BG, borderRadius: 12, border: `1px solid ${GOLD_BORDER}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD_DARK, marginBottom: 8 }}>Zusammenfassung</div>
          {Object.entries(vals).filter(([, v]) => v !== '' && v !== 0).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1b2733', marginBottom: 4 }}>
              <span style={{ color: '#64748b' }}>{k}</span><span style={{ fontWeight: 600 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      );

      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: CARD_BG, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setLagerView('overview')} style={{ border: 'none', background: GOLD_BG, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke={GOLD_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1b2733' }}>{flow.icon} {flow.label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Schritt {step} von {maxStep}: {flow.steps[step - 1]}</div>
            </div>
          </div>
          {/* step indicator */}
          <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6, flexShrink: 0 }}>
            {flow.steps.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? GOLD : '#e2e8f0' }} />
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
            {renderStep()}
          </div>
          <div style={{ padding: '12px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom,10px) + 12px)', borderTop: `1px solid ${BORDER}`, background: CARD_BG, display: 'flex', gap: 10 }}>
            {step > 1 && (
              <GhostBtn onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>Zurück</GhostBtn>
            )}
            {step < maxStep
              ? <GoldBtn onClick={() => setStep(s => s + 1)} style={{ flex: 1 }}>Weiter</GoldBtn>
              : <GoldBtn onClick={book} style={{ flex: 1 }}>✓ Buchen</GoldBtn>
            }
          </div>
        </div>
      );
    };

    if (lagerView !== 'overview') {
      return <FlowScreen flowKey={lagerView} />;
    }

    return (
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {FLOWS.map(f => (
            <button key={f.key} onClick={() => setLagerView(f.key)} style={{
              border: `1px solid ${BORDER}`, background: CARD_BG, borderRadius: 14, padding: 16,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1b2733' }}>{f.label}</div>
            </button>
          ))}
        </div>
        {lagerLog.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>Letzte Aktivitäten</div>
            {lagerLog.slice(0, 10).map((entry, i) => {
              const flow = FLOWS.find(f => f.key === entry.type);
              return (
                <div key={i} style={{ background: CARD_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{flow ? flow.icon : '📦'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1b2733' }}>{flow ? flow.label : entry.type}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(entry.at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Admin Screen ───────────────────────────────────────────────
  function AdminScreen({ session, adminView, setAdminView, onExitAdmin, onLogout }) {
    const [users, setUsers]     = React.useState(() => MesseAuth.getUsers());
    const [lps, setLps]         = React.useState(() => MesseAuth.getLagerplaetze());
    const [newUser, setNewUser] = React.useState({ vorname: '', nachname: '', username: '', password: '', role: 'messe' });
    const [newLp, setNewLp]     = React.useState({ name: '', color: GOLD });
    const orders = MesseAuth.getOrders();

    const COLORS = [GOLD, '#b8860b', '#a16207', '#78350f', '#92400e', '#1a3c6e'];

    const inputS = { width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', padding: '0 12px', fontSize: 14, fontFamily: 'inherit', background: 'rgba(255,255,255,0.08)', color: '#f3f7fb', outline: 'none', marginBottom: 10 };

    if (adminView === 'users') {
      const addUser = () => {
        if (!newUser.vorname || !newUser.nachname || !newUser.username || !newUser.password) return;
        const initials = (newUser.vorname[0] + newUser.nachname[0]).toUpperCase();
        const u = { ...newUser, name: `${newUser.vorname} ${newUser.nachname}`, initials };
        const next = [...users, u];
        MesseAuth.saveUsers(next);
        setUsers(MesseAuth.getUsers());
        setNewUser({ vorname: '', nachname: '', username: '', password: '', role: 'messe' });
      };
      const delUser = (username) => {
        const next = users.filter(u => u.username !== username);
        MesseAuth.saveUsers(next);
        setUsers(MesseAuth.getUsers());
      };
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e293b', color: '#f3f7fb' }}>
          <div style={{ padding: 'calc(env(safe-area-inset-top,12px) + 16px) 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setAdminView('dash')} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#f3f7fb', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Benutzerverwaltung</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 600 }}>Neuen Benutzer anlegen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <input value={newUser.vorname} onChange={e => setNewUser(p => ({ ...p, vorname: e.target.value }))} placeholder="Vorname" style={{ ...inputS, borderRadius: '10px 10px 0 0', gridColumn: '1' }} />
              <input value={newUser.nachname} onChange={e => setNewUser(p => ({ ...p, nachname: e.target.value }))} placeholder="Nachname" style={{ ...inputS, borderRadius: '10px 10px 0 0', gridColumn: '2' }} />
            </div>
            <input value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="Benutzername" style={inputS} />
            <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Passwort" style={inputS} />
            <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ ...inputS }}>
              <option value="messe">Messe</option>
              <option value="mitarbeiter">Mitarbeiter</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={addUser} style={{ width: '100%', height: 46, borderRadius: 12, border: 'none', background: GOLD, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }}>Anlegen</button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 600 }}>Bestehende Benutzer</div>
            {users.map(u => (
              <div key={u.username} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar initials={u.initials} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>@{u.username} · {u.role}</div>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => delUser(u.username)} style={{ border: 'none', background: 'rgba(200,16,46,.3)', borderRadius: 8, color: '#ff8a8a', cursor: 'pointer', fontSize: 13, padding: '4px 10px', fontFamily: 'inherit' }}>Löschen</button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (adminView === 'lagerplaetze') {
      const addLp = () => {
        if (!newLp.name) return;
        const lp = { id: `lp-${Date.now()}`, ...newLp };
        const next = [...lps, lp];
        MesseAuth.saveLagerplaetze(next);
        setLps(MesseAuth.getLagerplaetze());
        setNewLp({ name: '', color: GOLD });
      };
      const delLp = (id) => {
        const next = lps.filter(l => l.id !== id);
        MesseAuth.saveLagerplaetze(next);
        setLps(MesseAuth.getLagerplaetze());
      };
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e293b', color: '#f3f7fb' }}>
          <div style={{ padding: 'calc(env(safe-area-inset-top,12px) + 16px) 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setAdminView('dash')} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#f3f7fb', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Lagerplätze</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 600 }}>Neuen Lagerplatz anlegen</div>
            <input value={newLp.name} onChange={e => setNewLp(p => ({ ...p, name: e.target.value }))} placeholder="Name des Lagerplatzes" style={inputS} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewLp(p => ({ ...p, color: c }))} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: newLp.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
            <button onClick={addLp} style={{ width: '100%', height: 46, borderRadius: 12, border: 'none', background: GOLD, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }}>Anlegen</button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 600 }}>Bestehende Lagerplätze</div>
            {lps.map(lp => (
              <div key={lp.id} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: lp.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{lp.name}</div>
                <button onClick={() => delLp(lp.id)} style={{ border: 'none', background: 'rgba(200,16,46,.3)', borderRadius: 8, color: '#ff8a8a', cursor: 'pointer', fontSize: 13, padding: '4px 10px', fontFamily: 'inherit' }}>Löschen</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // dash
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e293b', color: '#f3f7fb' }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top,12px) + 16px) 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>⚙ Admin</div>
          <button onClick={onExitAdmin} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', color: '#f3f7fb', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>← Zurück</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Mitarbeiter', val: users.length, icon: '👤' },
              { label: 'Lagerplätze', val: lps.length, icon: '📦' },
              { label: 'Bestellungen', val: orders.length, icon: '📋' },
              { label: 'Bestand', val: Object.keys(MesseAuth.getMesseBestand()).length + ' Pos.', icon: '📊' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOLD }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setAdminView('users')} style={{ width: '100%', height: 52, borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#f3f7fb', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            👤 Benutzerverwaltung
          </button>
          <button onClick={() => setAdminView('lagerplaetze')} style={{ width: '100%', height: 52, borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#f3f7fb', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            📦 Lagerplätze
          </button>
          <button onClick={onLogout} style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid rgba(200,16,46,.4)', background: 'rgba(200,16,46,.1)', color: '#ff8a8a', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  // ── Main MesseApp ──────────────────────────────────────────────
  function MesseApp({ products, meta, onExit }) {
    const { useState, useEffect } = React;
    const [session, setSession]           = useState(() => MesseAuth.getSession());
    const [tab, setTab]                   = useState('scan');
    const [cart, setCart]                 = useState(() => {
      try { return JSON.parse(localStorage.getItem('messe_cart') || '[]'); } catch { return []; }
    });
    const [messeHistory, setMesseHistory] = useState(() => {
      try { return JSON.parse(localStorage.getItem('messe_history') || '[]'); } catch { return []; }
    });
    const [adminView, setAdminView]       = useState(null);

    // Persist cart and scan history on every change
    useEffect(() => {
      try { localStorage.setItem('messe_cart', JSON.stringify(cart)); } catch {}
    }, [cart]);
    useEffect(() => {
      try { localStorage.setItem('messe_history', JSON.stringify(messeHistory)); } catch {}
    }, [messeHistory]);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogin = (sess) => setSession(sess);

    const handleLogout = () => {
      MesseAuth.logout();
      setSession(null);
      setAdminView(null);
      setShowUserMenu(false);
    };

    const onProductScanned = (product) => {
      setMesseHistory(h => [{ product, at: Date.now() }, ...h.filter(x => x.product.ean !== product.ean)].slice(0, 50));
    };

    if (!session) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <MesseLoginSheet onLogin={handleLogin} onExit={onExit} />
        </div>
      );
    }

    if (adminView) {
      return (
        <div style={{ height: '100%' }}>
          <AdminScreen
            session={session}
            adminView={adminView}
            setAdminView={setAdminView}
            onExitAdmin={() => setAdminView(null)}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: APP_BG, position: 'relative' }}>
        <MesseHeader session={session} onUserChipClick={() => setShowUserMenu(true)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {tab === 'scan' && (
            <MesseScanTab
              products={products}
              messeHistory={messeHistory}
              onProductOpen={() => {}}
              onProductScanned={onProductScanned}
              cart={cart}
              setCart={setCart}
            />
          )}
          {tab === 'cart' && (
            <CartTab cart={cart} setCart={setCart} onOrderSent={() => setTab('scan')} />
          )}
          {tab === 'history' && (
            <VerlaufTab messeHistory={messeHistory} />
          )}
          {tab === 'lager' && (
            <LagerTab />
          )}
        </div>

        <MesseTabBar tab={tab} setTab={setTab} cartCount={cart.length} />

        {showUserMenu && (
          <UserMenuSheet
            session={session}
            onClose={() => setShowUserMenu(false)}
            onAdmin={() => { setShowUserMenu(false); setAdminView('dash'); }}
            onLogout={() => { setShowUserMenu(false); handleLogout(); }}
          />
        )}
      </div>
    );
  }

  window.MesseApp = MesseApp;
})();
