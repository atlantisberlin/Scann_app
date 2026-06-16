// Atlantis Scanner — Direction C "Regal", theme-aware.
// Tab bar (Scannen / Verlauf / Anleitung) + integrierte Suche + Vollbild-Scanner.
/* global React, ATLANTIS, AUI, DetailView, InfoTab */

const ACCENTS = {
  navy:    { light: '#1a3c6e', dark: '#6ea4ea', label: 'Atlantis Navy' },
  tiefsee: { light: '#0e7c8b', dark: '#34c8da', label: 'Tiefsee' },
  koralle: { light: '#b4533a', dark: '#f08c6f', label: 'Koralle' },
};

const STANDORTE = [
  { key: 'coppi',    label: 'Coppi',        shortLabel: 'Coppi',        accent: '#1a3c6e', accentDark: '#6ea4ea', emoji: '🔵' },
  { key: 'zentral',  label: 'Zentrallager', shortLabel: 'Zentrallager', accent: '#374151', accentDark: '#9ca3af', emoji: '⚫' },
  { key: 'steglitz', label: 'Steglitz',     shortLabel: 'Steglitz',     accent: '#166534', accentDark: '#4ade80', emoji: '🟢' },
  { key: 'freiburg', label: 'Freiburg',     shortLabel: 'Freiburg',     accent: '#7c2d12', accentDark: '#fb923c', emoji: '🟠' },
  { key: 'hamburg',  label: 'Hamburg',      shortLabel: 'Hamburg',      accent: '#581c87', accentDark: '#c084fc', emoji: '🟣' },
];

const ALL_LOC_KEYS = STANDORTE.map((s) => s.key);

function tokens({ accent: accentLight, dark = false, density = 'komfortabel', big = false }) {
  const acc = Object.values(ACCENTS).find((a) => a.light === accentLight) || ACCENTS.navy;
  const accent = dark ? acc.dark : acc.light;
  const D = density === 'kompakt';
  const fs = big ? 1.12 : 1;
  return {
    accent,
    accentSoft: dark ? `${acc.dark}26` : `${acc.light}14`,
    red:      dark ? '#ff6274' : '#c8102e',
    bg:       dark ? '#0b1726' : '#eef2f7',
    card:     dark ? '#13243a' : '#ffffff',
    headerBg: dark ? 'rgba(11,23,38,0.86)' : 'rgba(255,255,255,0.92)',
    ink:      dark ? '#f3f7fb' : '#1b2733',
    mute:     dark ? 'rgba(231,239,247,0.58)' : '#64748b',
    border:   dark ? 'rgba(255,255,255,0.09)' : 'rgba(26,60,110,0.09)',
    field:    dark ? 'rgba(255,255,255,0.06)' : '#fff',
    tileShadow: dark ? 'none' : '0 1px 2px rgba(26,60,110,0.06)',
    stock: { ok: dark ? '#37d27e' : '#1f8a4c', low: dark ? '#ffc44d' : '#bb7d00', out: dark ? '#ff6274' : '#c8102e' },
    chipLow: dark ? 'rgba(255,196,77,0.12)' : '#fff7ec',
    pad: D ? 11 : 16, gap: D ? 8 : 12, radius: D ? 12 : 14, fs, dark,
  };
}

// ── Swipeable history row (defined outside ScannerC to prevent unmount on parent re-render) ──
function SwipeableHistoryRow({ h, onDelete, onOpen, T, F, standortAccent, fmtTime, getStock }) {
  const { useState, useRef } = React;
  const { EUR, stockState } = ATLANTIS;
  const { ProductPhoto, Icon } = AUI;
  const [offsetX, setOffsetX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startX = useRef(null);
  const startOffset = useRef(0);
  const DELETE_W = 76;

  const p = h.p;
  if (p.isMaster) return null;

  const stock = getStock(p);
  const st = stockState(stock);
  const onSale = p.sale != null && p.sale > p.price;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startOffset.current = offsetX;
    setAnimating(false);
  };
  const handleTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const next = startOffset.current + dx;
    setOffsetX(Math.max(-DELETE_W, Math.min(0, next)));
  };
  const handleTouchEnd = () => {
    startX.current = null;
    setAnimating(true);
    if (offsetX < -DELETE_W * 0.35) setOffsetX(-DELETE_W);
    else setOffsetX(0);
  };

  return (
    <div style={{ position: 'relative', borderRadius: T.radius, overflow: 'hidden' }}>
      {/* Delete button behind */}
      <div onClick={onDelete}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_W,
          background: '#c8102e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: `0 ${T.radius}px ${T.radius}px 0`, cursor: 'pointer' }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11v6M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Swipeable row */}
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${offsetX}px)`, transition: animating ? 'transform 0.2s ease' : 'none', position: 'relative', zIndex: 1 }}>
        <button onClick={onOpen} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: T.card,
          border: `1px solid ${T.border}`, borderRadius: T.radius, padding: T.pad - 2, display: 'flex', gap: 12,
          alignItems: 'center', boxShadow: T.tileShadow, fontFamily: 'inherit' }}>
          <ProductPhoto product={p} dark={T.dark} radius={10} style={{ width: F(52), height: F(52), flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.brand} · {fmtTime(h.at)}</div>
            <div style={{ fontSize: F(14), fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: F(14), fontWeight: 800, color: onSale ? T.red : standortAccent }}>{p.noPrice ? '– Preis folgt' : EUR(p.price)}</span>
              <span style={{ width: 7, height: 7, borderRadius: 7, background: T.stock[st], display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: F(12), color: T.mute }}>{stock} Stk</span>
            </div>
          </div>
          {Icon.chevron(T.mute, 20)}
        </button>
      </div>
    </div>
  );
}

function ScannerC({ tw, products, fit = 'device', meta }) {
  const { useState, useRef, useEffect, useMemo, useCallback } = React;
  const { EUR, stockState } = ATLANTIS;
  const PRODUCTS = products || ATLANTIS.PRODUCTS;
  const { ProductPhoto, Icon } = AUI;
  const T = tokens(tw);
  const screen = fit === 'screen';
  const padTopHdr  = screen ? 'calc(env(safe-area-inset-top, 12px) + 16px)' : 56;
  const padTopDet  = screen ? 'calc(env(safe-area-inset-top, 12px) + 14px)' : 54;
  const padBotTabs = screen ? 'calc(env(safe-area-inset-bottom, 10px) + 12px)' : 22;
  const padBotBtn  = screen ? 'calc(env(safe-area-inset-bottom, 10px) + 14px)' : 30;

  // ── State ─────────────────────────────────────────────────────
  const [tab, setTab]         = useState('scan');
  const [detail, setDetail]   = useState(null);
  const [history, setHistory] = useState([]);
  const [standort, setStandort] = useState(STANDORTE[0]);
  const [showStandortPicker, setShowStandortPicker] = useState(false);

  // Kamera
  const [cam, setCam]           = useState('idle');
  const [camOverlay, setCamOverlay] = useState(false);
  const [camMsg, setCamMsg]     = useState('');
  const [notFound, setNotFound] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchOn, setTorchOn]   = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [manual, setManual]     = useState('');
  const camRef      = useRef(null);
  const nfTimer     = useRef(0);
  const lastCode    = useRef('');
  const lastCodeAt  = useRef(0);

  // Suche (integriert in Scan-Tab)
  const [searchActive, setSearchActive] = useState(false);
  const [q, setQ]               = useState('');
  const [filterBrand, setFilterBrand]   = useState(null);
  const [filterCat,   setFilterCat]     = useState(null);
  const [filterAktion, setFilterAktion] = useState(false);
  const [visibleCap, setVisibleCap]     = useState(40);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atlantis_search_history') || '[]'); }
    catch { return []; }
  });

  const standortAccent = T.dark ? standort.accentDark : standort.accent;

  // ── Bestandshelfer ────────────────────────────────────────────
  const getStock      = (p) => p.locs ? (p.locs[standort.key] ?? 0) : (p.stock ?? 0);
  const getTotalStock = (p) => p.locs
    ? ALL_LOC_KEYS.reduce((s, k) => s + (p.locs[k] ?? 0), 0)
    : (p.stockTotal ?? p.stock ?? 0);

  // ── Produkt-Indizes ───────────────────────────────────────────
  const codeIndex = useMemo(() => {
    const ei = {}, ai = {};
    (PRODUCTS || []).forEach((p) => {
      if (p.ean) ei[String(p.ean).trim()] = p;
      (p.allEans || []).forEach((e) => { if (e) ei[String(e).trim()] = p; });
      if (p.art) ai[String(p.art).trim().toLowerCase()] = p;
      (p.allArts || []).forEach((a) => { if (a) ai[String(a).trim().toLowerCase()] = p; });
    });
    return { ei, ai };
  }, [PRODUCTS]);

  const productByArt = useMemo(() => {
    const m = {};
    (PRODUCTS || []).forEach((p) => { if (p.art) m[String(p.art).trim().toLowerCase()] = p; });
    return m;
  }, [PRODUCTS]);

  const slaveToMaster = useMemo(() => {
    const m = {};
    (PRODUCTS || []).forEach((p) => {
      if (!p.isMaster) return;
      (p.slaveArts || []).forEach((a) => { if (a) m[String(a).trim().toLowerCase()] = p; });
    });
    return m;
  }, [PRODUCTS]);

  const getSiblings = useCallback((masterProduct) => {
    if (!masterProduct || !masterProduct.isMaster) return [];
    return (masterProduct.slaveArts || [])
      .map((a) => productByArt[String(a).trim().toLowerCase()])
      .filter(Boolean);
  }, [productByArt]);

  const lookup = (code) => {
    const c = String(code).trim();
    return codeIndex.ei[c] || codeIndex.ai[c.toLowerCase()] || null;
  };

  // ── Kamera ────────────────────────────────────────────────────
  const CAM = typeof Html5Qrcode !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.mediaDevices;

  const stopCamera = useCallback(() => {
    const inst = camRef.current; camRef.current = null;
    if (inst) { try { inst.stop().then(() => inst.clear()).catch(() => {}); } catch (e) {} }
    setCam((c) => (c === 'live' ? 'idle' : c));
    setTorchOn(false);
  }, []);

  const startCamera = useCallback((facing = 'environment') => {
    if (!CAM || camRef.current) return;
    setNotFound(null); setScanSuccess(false); setCamMsg(''); setCam('live');
    const F2 = (typeof Html5QrcodeSupportedFormats !== 'undefined')
      ? [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8,
         Html5QrcodeSupportedFormats.CODE_128]
      : undefined;
    let inst;
    try { inst = new Html5Qrcode('scanner-cam', { formatsToSupport: F2, verbose: false }); }
    catch (e) { setCam('error'); setCamMsg('Scanner konnte nicht gestartet werden.'); return; }
    camRef.current = inst;
    const qrboxFn = (w, h) => ({ width: Math.round(w * 0.92), height: Math.round(h * 0.38) });
    inst.start(
      { facingMode: facing },
      { fps: 30, qrbox: qrboxFn,
        videoConstraints: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 }, focusMode: 'continuous' } },
      (text) => handleCode(text), () => {}
    ).catch((e) => {
      camRef.current = null; setCam('error');
      setCamMsg(/permission|denied|notallowed|notfounderror/i.test(String(e))
        ? 'Kein Kamerazugriff. Erlaube die Kamera in den Browser-Einstellungen (HTTPS erforderlich).'
        : 'Keine Kamera gefunden.');
    });
  }, [CAM]); // eslint-disable-line

  const lockOrientation = () => {
    try { screen.orientation?.lock('portrait').catch(() => {}); } catch (_) {}
  };
  const unlockOrientation = () => {
    try { screen.orientation?.unlock(); } catch (_) {}
  };

  // Kamera starten: overlay zeigen, dann nach einem Tick camera starten
  const handleStartCamera = () => {
    if (!CAM) { setCam('error'); setCamMsg('Kein Kamerazugriff auf diesem Gerät.'); return; }
    lockOrientation();
    setCamOverlay(true);
  };

  const handleStopCamera = useCallback(() => {
    stopCamera();
    unlockOrientation();
    setCamOverlay(false);
    setNotFound(null);
    setScanSuccess(false);
  }, [stopCamera]);

  // Overlay sichtbar → Kamera starten (nach DOM-Update)
  useEffect(() => {
    if (!camOverlay) return;
    const t = setTimeout(() => startCamera(facingMode), 80);
    return () => clearTimeout(t);
  }, [camOverlay]); // eslint-disable-line

  const handleCode = (code) => {
    const c = String(code).trim();
    // Debounce: gleichen Code nicht öfter als alle 1.5s verarbeiten
    const now = Date.now();
    if (c === lastCode.current && now - lastCodeAt.current < 1500) return;
    lastCode.current = c;
    lastCodeAt.current = now;

    const product = lookup(c);
    if (product) {
      setNotFound(null);
      setScanSuccess(true);
      navigator.vibrate?.(60);
      const scannedEan = /^\d{8,14}$/.test(c) ? c : product.ean;
      setTimeout(() => {
        setScanSuccess(false);
        handleStopCamera();
        open(product, scannedEan);
      }, 500);
    } else {
      setNotFound(c);
      clearTimeout(nfTimer.current);
      nfTimer.current = setTimeout(() => setNotFound(null), 3500);
    }
  };

  const toggleTorch = async () => {
    if (!camRef.current) return;
    const next = !torchOn;
    setTorchOn(next);
    try { await camRef.current.applyVideoConstraints({ advanced: [{ torch: next }] }); }
    catch (_) { /* torch nicht unterstützt */ }
  };

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    stopCamera();
    setTimeout(() => startCamera(next), 300);
  };

  useEffect(() => {
    if (tab !== 'scan' || detail) { handleStopCamera(); setSearchActive(false); }
  }, [tab, detail]); // eslint-disable-line
  useEffect(() => () => stopCamera(), [stopCamera]);

  const F = (px) => Math.round(px * T.fs);

  const open = (p, scannedEan = null) => {
    setDetail({ ...p, _scannedEan: scannedEan || p.ean });
    setHistory((h) => [{ p, at: Date.now() }, ...h.filter((x) => x.p.ean !== p.ean)].slice(0, 20));
  };

  // ── Standort-Picker ───────────────────────────────────────────
  const StandortPicker = () => (
    <div onClick={() => setShowStandortPicker(false)}
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', background: T.card, borderRadius: '20px 20px 0 0', padding: '20px 16px',
          paddingBottom: screen ? 'calc(env(safe-area-inset-bottom,16px) + 16px)' : 28, boxShadow: '0 -4px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: T.border, margin: '0 auto 18px' }} />
        <div style={{ fontSize: F(17), fontWeight: 800, color: T.ink, marginBottom: 16 }}>Standort auswählen</div>
        {STANDORTE.map((s) => {
          const isActive = s.key === standort.key;
          const color = T.dark ? s.accentDark : s.accent;
          return (
            <button key={s.key} onClick={() => { setStandort(s); setShowStandortPicker(false); }}
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: isActive ? `${color}14` : 'transparent', borderRadius: 12, padding: '12px 14px',
                marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12,
                outline: isActive ? `2px solid ${color}` : 'none' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 0 3px ${color}28` }} />
              <span style={{ fontSize: F(15), fontWeight: isActive ? 700 : 500, color: isActive ? color : T.ink }}>{s.label}</span>
              {isActive && <span style={{ marginLeft: 'auto', fontSize: F(12), fontWeight: 700, color, background: `${color}18`, padding: '2px 9px', borderRadius: 20 }}>aktiv</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Shared UI ─────────────────────────────────────────────────
  const StandortBadge = () => (
    <button onClick={() => setShowStandortPicker(true)}
      style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: `${standortAccent}18`,
        borderRadius: 20, padding: '5px 12px 5px 10px', display: 'flex', alignItems: 'center', gap: 7,
        outline: `1.5px solid ${standortAccent}44` }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: standortAccent, flexShrink: 0 }} />
      <span style={{ fontSize: F(12), fontWeight: 700, color: standortAccent, whiteSpace: 'nowrap' }}>{standort.shortLabel}</span>
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
        <path d="M6 9l6 6 6-6" stroke={standortAccent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  const Header = ({ title, sub, right }) => (
    <div style={{ background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      paddingTop: padTopHdr, paddingLeft: T.pad + 4, paddingRight: T.pad + 4, paddingBottom: 13,
      borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: F(26), fontWeight: 800, color: T.ink, letterSpacing: -0.3, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: F(13), color: T.mute, marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 2 }}>
        {right}<StandortBadge />
      </div>
    </div>
  );

  const StockDot = ({ st, size = 8 }) =>
    <span style={{ width: size, height: size, borderRadius: size, background: T.stock[st], flexShrink: 0, display: 'inline-block' }} />;

  const ListRow = ({ p, time }) => {
    const stock  = getStock(p);
    const st     = stockState(stock);
    const onSale = p.sale != null && p.sale > p.price;
    if (p.isMaster) return null;
    return (
      <button onClick={() => open(p)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: T.card,
        border: `1px solid ${T.border}`, borderRadius: T.radius, padding: T.pad - 2, display: 'flex', gap: 12,
        alignItems: 'center', boxShadow: T.tileShadow, fontFamily: 'inherit' }}>
        <ProductPhoto product={p} dark={T.dark} radius={10} style={{ width: F(52), height: F(52), flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.brand}{time ? ` · ${time}` : ''}</div>
          <div style={{ fontSize: F(14), fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: F(14), fontWeight: 800, color: onSale ? T.red : standortAccent }}>{p.noPrice ? '– Preis folgt' : EUR(p.price)}</span>
            <StockDot st={st} size={7} />
            <span style={{ fontSize: F(12), color: T.mute }}>{stock} Stk</span>
            {p.inactive   && <span style={{ fontSize: F(10), fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '1px 5px', borderRadius: 4 }}>inaktiv</span>}
            {p.restposten && <span style={{ fontSize: F(10), fontWeight: 700, color: '#7c2d12', background: '#ffedd5', padding: '1px 5px', borderRadius: 4 }}>Restposten</span>}
            {p.aktionsangebote?.[standort.key] && <span onClick={(e) => { e.stopPropagation(); goToAktionen(); }} style={{ fontSize: F(10), fontWeight: 700, color: '#3d2b00', background: 'linear-gradient(90deg, #daa520, #ffd700, #daa520)', padding: '1px 7px', borderRadius: 4, cursor: 'pointer' }}>🏷 Aktion</span>}
          </div>
        </div>
        {Icon.chevron(T.mute, 20)}
      </button>
    );
  };

  // ── Navigation: Aktionen-Filter ───────────────────────────────
  const goToAktionen = () => {
    setFilterBrand(null); setFilterCat(null); setFilterAktion(true); setQ('');
    setDetail(null); setSearchActive(true);
    setTimeout(() => setTab('scan'), 50);
  };

  // ── Suche-Logik ───────────────────────────────────────────────
  const aktionenCount = useMemo(() =>
    PRODUCTS.filter((p) => !p.isMaster && !!p.aktionsangebote?.[standort.key]).length,
  [PRODUCTS, standort]);

  const q2 = q.trim().toLowerCase();
  const tokenMatch = (s, toks) => toks.every((t) => s.includes(t));

  const TOP_BRANDS = [
    { value: 'Mares',                              label: 'Mares' },
    { value: 'ScubaPro',                           label: 'ScubaPro' },
    { value: 'Waterproof Diving International AB', label: 'Waterproof' },
    { value: 'Aqualung',                           label: 'Aqualung' },
    { value: 'Divevolk',                           label: 'Divevolk' },
    { value: 'Tusa',                               label: 'Tusa' },
    { value: 'Cressi Sub',                         label: 'Cressi' },
    { value: 'Polaris',                            label: 'Polaris' },
    { value: 'Scuba Force',                        label: 'Scuba Force' },
    { value: 'Bare Sports Holding Malta',          label: 'Bare' },
  ];
  const TOP_CATS = [
    { value: 'Neoprenanzüge',                 label: 'Neoprenanzüge' },
    { value: 'Neopren',                       label: 'Neopren' },
    { value: 'Trockentauchen',                label: 'Trockentauchen' },
    { value: 'Zubehör',                       label: 'Zubehör' },
    { value: 'Geräteflossen',                 label: 'Geräteflossen' },
    { value: 'Tarierjackets',                 label: 'Tarierjackets' },
    { value: 'Masken',                        label: 'Masken' },
    { value: 'Masken mit opt. Gläsern',       label: 'Opt. Masken' },
    { value: 'UV-Schutz',                     label: 'UV-Schutz' },
    { value: 'Trilaminat Trockentauchanzüge', label: 'Trilaminat' },
  ];

  useEffect(() => {
    if (q.trim().length < 2) return;
    const id = setTimeout(() => {
      setSearchHistory((prev) => {
        const next = [q.trim(), ...prev.filter((s) => s !== q.trim())].slice(0, 8);
        try { localStorage.setItem('atlantis_search_history', JSON.stringify(next)); } catch {}
        return next;
      });
    }, 800);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setVisibleCap(40); }, [q, filterBrand, filterCat, filterAktion]);
  const toks = q2.length >= 2 ? q2.split(/\s+/).filter(Boolean) : [];

  const matches = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.isMaster) return false;
      const s = p._s || (p.name + ' ' + p.brand + ' ' + p.art + ' ' + p.cat + ' ' + p.ean).toLowerCase();
      return (toks.length === 0 || tokenMatch(s, toks))
        && (!filterBrand  || p.brand === filterBrand)
        && (!filterCat    || p.cat   === filterCat)
        && (!filterAktion || !!p.aktionsangebote?.[standort.key]);
    });
  }, [PRODUCTS, toks, filterBrand, filterCat, filterAktion]);

  const shown        = matches.slice(0, visibleCap);
  const activeFilters = (filterBrand ? 1 : 0) + (filterCat ? 1 : 0) + (filterAktion ? 1 : 0);
  const totalActive  = useMemo(() => PRODUCTS.filter((p) => !p.isMaster).length, [PRODUCTS]);

  const activeBrandLabel = filterBrand ? (TOP_BRANDS.find((b) => b.value === filterBrand)?.label || filterBrand) : null;
  const activeCatLabel   = filterCat   ? (TOP_CATS.find((c) => c.value === filterCat)?.label   || filterCat)   : null;

  const closeSearch = () => {
    setSearchActive(false);
    setQ(''); setFilterBrand(null); setFilterCat(null); setFilterAktion(false);
  };

  const Chip = ({ label, active, onPress }) => (
    <button onClick={onPress} style={{ flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 20,
      border: `1.5px solid ${active ? standortAccent : T.border}`, background: active ? standortAccent : T.card,
      color: active ? (T.dark ? '#06131f' : '#fff') : T.ink, fontSize: F(12), fontWeight: active ? 700 : 500,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {label}{active ? ' ×' : ''}
    </button>
  );

  // ── Scan-Tab ──────────────────────────────────────────────────
  const scanTab = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header title="Scannen" sub={meta || 'Artikel-Etikett erfassen'} />

      {aktionenCount > 0 && (
        <div onClick={goToAktionen}
          style={{ margin: `${T.gap}px ${T.pad}px 0`, background: '#DAA520', borderRadius: T.radius,
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: F(10), fontWeight: 700, color: '#5a3e00', textTransform: 'uppercase', letterSpacing: 0.5 }}>Aktuelle Aktionsangebote</div>
            <div style={{ fontSize: F(13), fontWeight: 600, color: '#3d2b00' }}>{aktionenCount} Artikel mit Sonderpreisen in {standort.label}</div>
          </div>
          <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: F(11), color: '#3d2b00', fontWeight: 700 }}>Alle</span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: T.pad, display: 'flex', flexDirection: 'column', gap: T.gap }}>

        {/* Kamera-Kachel: der dunkle Bereich IST der Button */}
        <div style={{ background: T.card, borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>

          {/* Klickbares Kamera-Vorschau-Feld */}
          <button onClick={handleStartCamera}
            style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer', padding: 0, background: 'none', fontFamily: 'inherit' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9',
              background: T.dark ? '#16283f' : '#0d1f36',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {/* Eck-Markierungen */}
              {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h], i) => (
                <div key={i} style={{ position: 'absolute', [v]: 14, [h]: 14, width: 22, height: 22, pointerEvents: 'none',
                  [`border${v[0].toUpperCase()+v.slice(1)}`]: `2.5px solid ${standortAccent}`,
                  [`border${h[0].toUpperCase()+h.slice(1)}`]: `2.5px solid ${standortAccent}`,
                  borderRadius: v === 'top' ? (h === 'left' ? '6px 0 0 0' : '0 6px 0 0') : (h === 'left' ? '0 0 0 6px' : '0 0 6px 0') }} />
              ))}
              {/* Icon + Label */}
              <div style={{ opacity: 0.7 }}>{Icon.scan(standortAccent, 38)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${standortAccent}22`, border: `1px solid ${standortAccent}55`, borderRadius: 20, padding: '6px 16px' }}>
                <span style={{ fontSize: F(13), fontWeight: 700, color: standortAccent }}>Antippen zum Scannen</span>
              </div>
              {cam === 'error' && (
                <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(200,16,46,0.85)', borderRadius: 8, padding: '6px 10px', fontSize: F(11), color: '#fff', textAlign: 'center', fontWeight: 600 }}>
                  {camMsg || 'Kein Kamerazugriff'}
                </div>
              )}
            </div>
          </button>

          {/* Suchfeld direkt darunter — optisch im gleichen Block */}
          <button onClick={() => setSearchActive(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 'none', cursor: 'pointer',
              background: 'none', fontFamily: 'inherit', padding: `12px ${T.pad}px`,
              borderTop: `1px solid ${T.border}` }}>
            {Icon.search(T.mute, 18)}
            <span style={{ fontSize: F(15), color: T.mute, flex: 1, textAlign: 'left' }}>Name, Marke, EAN oder Art.-Nr.</span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
              <path d="M9 18l6-6-6-6" stroke={T.mute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Zuletzt gescannt */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: F(12), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 700 }}>Zuletzt gescannt</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: T.gap - 2 }}>
              {history.slice(0, 3).map((h) => <ListRow key={h.p.ean || h.p.id} p={h.p} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Vollbild-Kamera-Overlay ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: '#000', display: camOverlay ? 'block' : 'none' }}>

        {/* Layer 1: Kamera-Stream — html5-qrcode darf hier nach Belieben machen */}
        <div id="scanner-cam" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Layer 2: UI-Controls — komplett unabhängig als eigene absolute Schicht */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>

          {/* Oben: Torch + Flip */}
          <div style={{ pointerEvents: 'auto', paddingTop: screen ? 'calc(env(safe-area-inset-top,12px) + 12px)' : 52,
            paddingLeft: 20, paddingRight: 20, paddingBottom: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={toggleTorch}
              style={{ width: 44, height: 44, borderRadius: 22, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: torchOn ? 'rgba(255,220,0,0.35)' : 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path d="M9 2l-1 7H4l8 13 2-8h4L9 2z" stroke={torchOn ? '#ffe066' : '#fff'} fill={torchOn ? '#ffe066' : 'none'} strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: F(12), fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Scannen</span>
            <button onClick={flipCamera}
              style={{ width: 44, height: 44, borderRadius: 22, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path d="M20 7h-3.17L15 5H9L7.17 7H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="14" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M10 11a2.5 2.5 0 015 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Mitte: Platzhalter damit Bottom an den unteren Rand gedrückt wird */}
          <div style={{ flex: 1 }} />

          {/* Unten: manuelle Eingabe + Abbrechen */}
          <div style={{ pointerEvents: 'auto', padding: '16px 20px',
            paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom, 16px) + 16px))',
            display: 'flex', gap: 10, alignItems: 'center',
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '0 12px' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M11 17h2M3 8h18M5 12h6M5 16h3" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/></svg>
              <input value={manual} onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && manual.trim()) { handleCode(manual.trim()); setManual(''); } }}
                placeholder="Art.-Nr. oder EAN manuell"
                style={{ flex: 1, height: 44, border: 'none', outline: 'none', background: 'transparent', color: '#fff', fontSize: F(14), fontFamily: 'inherit' }} />
              {manual.trim() && (
                <button onClick={() => { handleCode(manual.trim()); setManual(''); }}
                  style={{ border: 'none', background: `${standortAccent}cc`, borderRadius: 8, padding: '4px 10px', color: '#fff', fontSize: F(12), fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                  Suchen
                </button>
              )}
            </div>
            <button onClick={handleStopCamera}
              style={{ flexShrink: 0, height: 44, padding: '0 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)',
                background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: F(14), fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Abbrechen
            </button>
          </div>
        </div>

        {/* Layer 3: Erfolgs-Flash */}
        {scanSuccess && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 11, background: 'rgba(0,60,20,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(55,210,126,0.2)', border: '2px solid #37d27e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#37d27e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ color: '#37d27e', fontSize: F(16), fontWeight: 700 }}>Gefunden!</span>
          </div>
        )}

        {/* Layer 3: Nicht-gefunden Toast */}
        {notFound && !scanSuccess && (
          <div style={{ position: 'absolute', bottom: 'max(100px, calc(env(safe-area-inset-bottom,10px) + 90px))', left: 20, right: 20, zIndex: 11,
            background: 'rgba(200,16,46,0.9)', backdropFilter: 'blur(8px)', borderRadius: 12,
            padding: '10px 14px', color: '#fff', fontSize: F(13), fontWeight: 600, textAlign: 'center' }}>
            Kein Artikel zu „{notFound}" gefunden
          </div>
        )}

        {/* Layer 3: Kamera-Fehler */}
        {cam === 'error' && (
          <div style={{ position: 'absolute', bottom: 'max(100px, calc(env(safe-area-inset-bottom,10px) + 90px))', left: 20, right: 20, zIndex: 11,
            background: 'rgba(200,16,46,0.85)', borderRadius: 12, padding: '10px 14px',
            color: '#fff', fontSize: F(13), fontWeight: 600, textAlign: 'center' }}>
            {camMsg || 'Kein Kamerazugriff'}
          </div>
        )}
      </div>

      {/* ── Suche-Overlay (über Scan-Tab) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 12,
        background: T.bg,
        transform: searchActive ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.28s cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column' }}>

        {/* Such-Header */}
        <div style={{ background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          paddingTop: padTopHdr, paddingLeft: T.pad, paddingRight: T.pad, paddingBottom: 10,
          borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Input-Feld */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
              background: T.field, borderRadius: 12, padding: filterAktion ? '8px 12px' : '10px 12px',
              border: filterAktion ? `1.5px solid #DAA520` : `1.5px solid ${standortAccent}`,
              boxShadow: `0 0 0 3px ${standortAccent}18` }}>
              {Icon.search(standortAccent, 18)}
              {filterAktion && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#DAA520',
                  color: '#3d2b00', borderRadius: 6, padding: '3px 8px 3px 7px', fontSize: F(13), fontWeight: 700, flexShrink: 0 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Aktionen
                  <span onClick={() => setFilterAktion(false)} style={{ fontSize: 16, lineHeight: 1, opacity: 0.6, marginLeft: 1, cursor: 'pointer' }}>×</span>
                </span>
              )}
              <input autoFocus={searchActive} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={filterAktion ? 'Suche verfeinern…' : 'Name, Marke, EAN…'}
                style={{ border: 'none', outline: 'none', flex: 1, minWidth: 0, fontSize: F(15), color: T.ink, background: 'transparent', fontFamily: 'inherit' }} />
              {(q || activeFilters > 0) && (
                <button onClick={() => { setQ(''); setFilterBrand(null); setFilterCat(null); setFilterAktion(false); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>{Icon.close(T.mute, 18)}</button>
              )}
            </div>
            {/* Abbrechen außerhalb des Feldes */}
            <button onClick={closeSearch} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 2px', fontSize: F(14), fontWeight: 600, color: standortAccent, fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}>Abbrechen</button>
          </div>
        </div>

        {/* Chips */}
        <div style={{ padding: `8px ${T.pad}px 0`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <Chip label="Alle Marken" active={!filterBrand} onPress={() => setFilterBrand(null)} />
            {TOP_BRANDS.map((b) => <Chip key={b.value} label={b.label} active={filterBrand === b.value} onPress={() => setFilterBrand(filterBrand === b.value ? null : b.value)} />)}
            {filterBrand && !TOP_BRANDS.find((b) => b.value === filterBrand) && <Chip label={activeBrandLabel} active={true} onPress={() => setFilterBrand(null)} />}
          </div>
        </div>
        <div style={{ padding: `4px ${T.pad}px 6px`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <Chip label="Alle Kategorien" active={!filterCat} onPress={() => setFilterCat(null)} />
            {TOP_CATS.map((c) => <Chip key={c.value} label={c.label} active={filterCat === c.value} onPress={() => setFilterCat(filterCat === c.value ? null : c.value)} />)}
            {filterCat && !TOP_CATS.find((c) => c.value === filterCat) && <Chip label={activeCatLabel} active={true} onPress={() => setFilterCat(null)} />}
          </div>
        </div>

        {/* Ergebnisse */}
        <div style={{ flex: 1, overflow: 'auto', padding: `0 ${T.pad}px ${T.pad}px`, display: 'flex', flexDirection: 'column', gap: T.gap - 2 }}>
          {toks.length === 0 && !filterBrand && !filterCat && !filterAktion ? (
            searchHistory.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: F(12), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.history(T.mute, 14)} Zuletzt gesucht</span>
                  <button onClick={() => { setSearchHistory([]); try { localStorage.removeItem('atlantis_search_history'); } catch {} }} style={{ border: 'none', background: 'none', color: T.mute, fontSize: F(12), cursor: 'pointer', fontFamily: 'inherit' }}>Löschen</button>
                </div>
                {searchHistory.map((s) => (
                  <button key={s} onClick={() => setQ(s)}
                    style={{ width: '100%', textAlign: 'left', border: `1px solid ${T.border}`, cursor: 'pointer',
                      background: T.card, borderRadius: T.radius, padding: '10px 14px', marginBottom: 6,
                      display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.tileShadow, fontFamily: 'inherit' }}>
                    {Icon.history(T.mute, 16)}
                    <span style={{ fontSize: F(14), color: T.ink, flex: 1 }}>{s}</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M7 7h10v10" stroke={T.mute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: T.mute, marginTop: 40, fontSize: F(14), lineHeight: 1.5 }}>Mindestens 2 Zeichen eingeben<br />oder Marke / Kategorie antippen</div>
            )
          ) : shown.length ? (
            <>
              <div style={{ fontSize: F(12), color: T.mute, paddingTop: 8 }}>{matches.length} Treffer{activeFilters > 0 ? ` · ${activeFilters} Filter aktiv` : ''}</div>
              {shown.map((p, i) => <ListRow key={(p.ean || p.id) + '_' + i} p={p} />)}
              {matches.length > visibleCap && (
                <button onClick={() => setVisibleCap((c) => c + 40)}
                  style={{ width: '100%', padding: '13px', background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.ink, fontSize: F(14), fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: T.tileShadow }}>
                  {Icon.chevron(standortAccent, 18)} Mehr laden
                  <span style={{ color: T.mute, fontSize: F(12) }}>(+{(matches.length - visibleCap).toLocaleString('de-DE')} weitere)</span>
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: T.mute, marginTop: 50, fontSize: F(14) }}>Keine Treffer{q ? ` für „${q}"` : ''}{activeFilters > 0 ? ' mit diesen Filtern' : ''}</div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Verlauf-Tab ───────────────────────────────────────────────
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const historyTab = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header title="Verlauf" sub={history.length ? `${history.length} Artikel gescannt` : 'Noch nichts gescannt'}
        right={history.length ? <button onClick={() => setHistory([])} style={{ border: 'none', background: 'none', color: standortAccent, fontSize: F(14), fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', paddingBottom: 2 }}>Leeren</button> : null} />
      <div style={{ flex: 1, overflow: 'auto', padding: T.pad, display: 'flex', flexDirection: 'column', gap: T.gap - 2 }}>
        {history.length ? history.map((h) => (
          <SwipeableHistoryRow
            key={h.p.ean || h.p.id}
            h={h}
            onDelete={() => setHistory((prev) => prev.filter((x) => x.p.ean !== h.p.ean))}
            onOpen={() => open(h.p)}
            T={T} F={F} standortAccent={standortAccent} fmtTime={fmtTime} getStock={getStock}
          />
        )) : (
          <div style={{ textAlign: 'center', color: T.mute, marginTop: 60 }}>
            <div style={{ display: 'inline-flex', opacity: 0.4 }}>{Icon.history(T.mute, 44)}</div>
            <div style={{ marginTop: 12, fontSize: F(14) }}>Gescannte Artikel erscheinen hier</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Tab-Bar (3 Tabs) ──────────────────────────────────────────
  const TabBtn = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
        {icon(active ? standortAccent : T.mute, 24)}
        <span style={{ fontSize: F(11), fontWeight: active ? 700 : 500, color: active ? standortAccent : T.mute }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ height: '100%', position: 'relative', background: T.bg, color: T.ink }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 64 }}>
          {tab === 'scan'    && scanTab}
          {tab === 'history' && historyTab}
          {tab === 'info'    && <InfoTab T={T} F={F} standort={standort} standortAccent={standortAccent} STANDORTE={STANDORTE} Header={Header} />}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9, background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `1px solid ${T.border}`, paddingBottom: padBotTabs, display: 'flex' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: standortAccent, borderRadius: '3px 3px 0 0' }} />
        <TabBtn id="scan"    label="Scannen"   icon={Icon.scan} />
        <TabBtn id="history" label="Verlauf"   icon={Icon.history} />
        <TabBtn id="info"    label="Anleitung" icon={(c, s) => (
          <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"/>
            <path d="M12 11v5M12 8h.01" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )} />
      </div>
      {/* Detail-View Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 30, transform: detail ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s cubic-bezier(.22,1,.36,1)', pointerEvents: detail ? 'auto' : 'none' }}>
        {detail && (
          <DetailView
            detail={detail}
            onClose={() => setDetail(null)}
            onScanNext={() => { setDetail(null); setTab('scan'); setCamOverlay(true); }}
            goToAktionen={goToAktionen}
            T={T} F={F}
            standort={standort} standortAccent={standortAccent}
            STANDORTE={STANDORTE} ALL_LOC_KEYS={ALL_LOC_KEYS}
            slaveToMaster={slaveToMaster} productByArt={productByArt} getSiblings={getSiblings}
            getStock={getStock} getTotalStock={getTotalStock}
            padTopDet={padTopDet} padBotBtn={padBotBtn}
          />
        )}
      </div>
      {showStandortPicker && <StandortPicker />}
    </div>
  );
}

window.ScannerC = ScannerC;
window.SCANNER_ACCENTS = ACCENTS;
window.SCANNER_STANDORTE = STANDORTE;
