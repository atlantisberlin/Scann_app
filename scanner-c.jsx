// Atlantis Scanner — Direction C "Regal", theme-aware.
// Tab bar (Scannen / Suche / Verlauf) + data-dense detail.
// Jedes Produkt-Objekt ist eine einzelne Sheet-Zeile (kein Gruppieren mehr).
// Geschwister-Artikel werden live über masterArt / slaveArts nachgeschlagen.
/* global React, ATLANTIS, AUI */

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

  const [tab, setTab]   = useState('scan');
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [q, setQ] = useState('');
  const [standort, setStandort] = useState(STANDORTE[0]);
  const [showStandortPicker, setShowStandortPicker] = useState(false);
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
  // EAN / Art.-Nr. → Produkt
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

  // Art.-Nr. → Produkt (für Geschwister-Lookup)
  const productByArt = useMemo(() => {
    const m = {};
    (PRODUCTS || []).forEach((p) => {
      if (p.art) m[String(p.art).trim().toLowerCase()] = p;
    });
    return m;
  }, [PRODUCTS]);

  // SlaveArt → Master-Produkt
  const slaveToMaster = useMemo(() => {
    const m = {};
    (PRODUCTS || []).forEach((p) => {
      if (!p.isMaster) return;
      (p.slaveArts || []).forEach((a) => { if (a) m[String(a).trim().toLowerCase()] = p; });
    });
    return m;
  }, [PRODUCTS]);

  // Alle Slaves eines Masters
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
  const camRef = useRef(null);
  const [cam, setCam]     = useState('idle');
  const [camMsg, setCamMsg] = useState('');
  const [notFound, setNotFound] = useState(null);
  const [manual, setManual]   = useState('');
  const nfTimer = useRef(0);

  const open = (p, scannedEan = null) => {
    setDetail({ ...p, _scannedEan: scannedEan || p.ean });
    setHistory((h) => [{ p, at: Date.now() }, ...h.filter((x) => x.p.ean !== p.ean)].slice(0, 20));
  };

  const stopCamera = useCallback(() => {
    const inst = camRef.current; camRef.current = null;
    if (inst) { try { inst.stop().then(() => inst.clear()).catch(() => {}); } catch (e) {} }
    setCam((c) => (c === 'live' ? 'idle' : c));
  }, []);

  const handleCode = (code) => {
    const product = lookup(code);
    if (product) {
      setNotFound(null); stopCamera();
      const scannedEan = /^\d{8,14}$/.test(String(code).trim()) ? String(code).trim() : product.ean;
      open(product, scannedEan);
    } else {
      setNotFound(String(code).trim());
      clearTimeout(nfTimer.current);
      nfTimer.current = setTimeout(() => setNotFound(null), 3500);
    }
  };

  const startCamera = () => {
    if (!CAM || camRef.current) return;
    setNotFound(null); setCamMsg(''); setCam('live');
    const F2 = (typeof Html5QrcodeSupportedFormats !== 'undefined')
      ? [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8,
         Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E,
         Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39,
         Html5QrcodeSupportedFormats.CODE_93, Html5QrcodeSupportedFormats.ITF,
         Html5QrcodeSupportedFormats.CODABAR, Html5QrcodeSupportedFormats.DATA_MATRIX,
         Html5QrcodeSupportedFormats.QR_CODE]
      : undefined;
    let inst;
    try { inst = new Html5Qrcode('scanner-cam', { formatsToSupport: F2, verbose: false }); }
    catch (e) { setCam('error'); setCamMsg('Scanner konnte nicht gestartet werden.'); return; }
    camRef.current = inst;
    inst.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: { width: 250, height: 120 }, aspectRatio: 1.7778,
        videoConstraints: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 }, focusMode: 'continuous' } },
      (text) => handleCode(text), () => {}
    ).catch((e) => {
      camRef.current = null; setCam('error');
      setCamMsg(/permission|denied|notallowed|notfounderror/i.test(String(e))
        ? 'Kein Kamerazugriff. Erlaube die Kamera in den Browser-Einstellungen (HTTPS erforderlich).'
        : 'Keine Kamera gefunden.');
    });
  };

  useEffect(() => { if (tab !== 'scan' || detail) stopCamera(); }, [tab, detail, stopCamera]);
  useEffect(() => () => stopCamera(), [stopCamera]);

  const F = (px) => Math.round(px * T.fs);

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
    const stock = getStock(p);
    const st    = stockState(stock);
    const onSale = p.sale != null && p.sale > p.price;
    if (p.isMaster) return null; // Master-Zeilen nicht in Listen anzeigen
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

  // ── StandortChips: Bestand-Chips für alle Standorte ───────────
  // hasLocs=false → Variante B: aktueller Standort zeigt stock, andere ausgegraut mit "–"
  const StandortChips = ({ locs, stockFallback = 0, darkBg = false }) => {
    const hasLocs = !!locs;
    const labelCol = darkBg ? 'rgba(255,255,255,0.75)' : (home2) => home2 ? standortAccent : T.mute;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4 }}>
        {ALL_LOC_KEYS.map((locKey) => {
          const sd   = STANDORTE.find((s) => s.key === locKey) || { key: locKey, label: locKey };
          const home = locKey === standort.key;
          const n    = hasLocs ? (locs[locKey] ?? 0) : (home ? stockFallback : null);
          const noData = !hasLocs && !home;
          const numCol = darkBg
            ? (noData ? 'rgba(255,255,255,0.35)' : n === 0 ? '#ff8a8a' : n <= 2 ? '#ffd080' : '#6ee7a0')
            : (noData ? T.mute : n === 0 ? T.stock.out : n <= 2 ? T.stock.low : T.stock.ok);
          const lc = darkBg ? 'rgba(255,255,255,0.75)' : (home ? standortAccent : T.mute);
          const subCol = darkBg ? 'rgba(255,255,255,0.5)' : (home ? standortAccent : T.mute);
          return (
            <div key={locKey} style={{
              background: darkBg
                ? (home ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)')
                : (home ? (T.dark ? `${standortAccent}28` : `${standortAccent}14`) : (T.dark ? 'rgba(255,255,255,0.06)' : 'var(--color-background-secondary)')),
              borderRadius: 6,
              border: darkBg
                ? (home ? '1.5px solid rgba(255,255,255,0.7)' : '0.5px solid rgba(255,255,255,0.2)')
                : (home ? `1.5px solid ${standortAccent}` : `0.5px solid ${T.border}`),
              padding: '4px 2px', textAlign: 'center',
              opacity: noData ? 0.45 : 1,
            }}>
              <div style={{ fontSize: 9, color: lc, fontWeight: home ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sd.shortLabel}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: noData ? subCol : numCol, lineHeight: 1.2, marginTop: 1 }}>{noData ? '–' : n}</div>
              <div style={{ fontSize: 9, color: subCol, marginTop: 0 }}>{noData ? 'n/a' : 'Stk'}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── CopyBtn: kleiner Kopier-Button ────────────────────────────
  const CopyBtn = ({ text }) => {
    const [copied, setCopied] = React.useState(false);
    const copy = (e) => {
      e.stopPropagation();
      const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (_) {}
          document.body.removeChild(ta); done();
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta); done();
      }
    };
    return (
      <button onClick={copy} title="Kopieren" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '1px 3px', color: copied ? T.stock.ok : T.mute, lineHeight: 1, flexShrink: 0 }}>
        {copied
          ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>
        }
      </button>
    );
  };

  // ── SiblingsNew: neues Layout ohne Accordion ──────────────────
  // Gescannter Artikel: blauer Kasten oben (nur Chips, kein Art.-Nr./Shop-Link)
  // Alle anderen Slaves: aufgeklappt mit Bild, Art.-Nr., Shop-Link, Chips
  function SiblingsNew({ siblings, currentEan, T, F }) {
    if (!siblings || siblings.length === 0) return null;

    // Namen-Parser (Farbe + Größe) — gleiche Logik wie vorher
    const parseAttrs = (name) => {
      const colorColon = (name.match(/Farbe\s*:\s*([^-–·]+?)(?:\s*[-–·]|$)/i) || [])[1];
      const sizeColon  = (name.match(/Gr(?:ö|oe|o)(?:ß|ss|s)e\s*:\s*([^-–·]+?)(?:\s*[-–·]|$)/i) || [])[1];
      if (colorColon || sizeColon) return { color: (colorColon || '').trim() || null, size: (sizeColon || '').trim() || null };
      const parts = name.split(/\s+-\s+/);
      if (parts.length >= 2) {
        const last = parts[parts.length - 1].trim();
        const prev = parts[parts.length - 2].trim();
        const sizeMatch = last.match(/^Gr\.?\s*(.+)/i);
        if (sizeMatch) return { color: prev, size: sizeMatch[1].trim() };
        if (/^(XS|S|M|L|XL|XXL|\d[\d/,.\-–]+)$/i.test(last)) return { color: prev, size: last };
        return { color: last, size: null };
      }
      return { color: null, size: null };
    };

    const currentSlave = siblings.find((sp) => sp.ean === currentEan) || null;
    const otherSlaves  = siblings.filter((sp) => sp.ean !== currentEan);

    const SlaveCard = ({ sp }) => {
      const { color, size } = parseAttrs(sp.name);
      const label    = [color, size].filter(Boolean).join(' · ') || sp.name;
      const onSale   = sp.sale != null && sp.sale > sp.price;
      const hasLocs  = !!sp.locs;
      const stock    = hasLocs ? (sp.locs[standort.key] ?? 0) : (sp.stock ?? 0);
      const shopUrl  = sp.shopUrl || null;
      return (
        <div style={{ padding: `${F(10)}px ${F(12)}px`, borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AUI.ProductPhoto product={sp} dark={T.dark} radius={8} style={{ width: F(48), height: F(48), flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: F(13), fontWeight: 500, color: T.ink }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                {sp.price > 0 && <span style={{ fontSize: F(12), fontWeight: 500, color: onSale ? T.red : standortAccent }}>{EUR(sp.price)}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: sp.aktionsangebote?.[standort.key] ? 4 : 7 }}>
              <span style={{ fontSize: F(10), color: T.mute, fontFamily: 'ui-monospace,Menlo,monospace' }}>{sp.art}</span>
              <CopyBtn text={sp.art} />
              {shopUrl && (
                <a href={shopUrl} target="_blank" rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', fontSize: F(11), color: standortAccent, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Shop
                </a>
              )}
            </div>
            {sp.aktionsangebote?.[standort.key] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, background: '#DAA52018', border: '0.5px solid #DAA52066', borderRadius: 5, padding: '3px 7px' }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="7" y1="7" x2="7.01" y2="7" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: F(11), color: '#633806', fontWeight: 500 }}>{sp.aktionsangebote?.[standort.key]}</span>
              </div>
            )}
            <StandortChips locs={sp.locs} stockFallback={stock} />
          </div>
        </div>
      );
    };

    // Gescannter Artikel — Label + Chips, ohne Art.-Nr./Shop (steht oben)
    const currentAttrs = currentSlave ? parseAttrs(currentSlave.name) : null;
    const currentLabel = currentAttrs ? [currentAttrs.color, currentAttrs.size].filter(Boolean).join(' · ') : '';

    return (
      <div style={{ marginTop: T.gap }}>
        {currentSlave && (
          <div style={{ background: standortAccent, borderRadius: T.radius, padding: `${F(10)}px ${F(12)}px`, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: T.dark ? standortAccent : '#fff', background: 'rgba(255,255,255,0.25)', padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gescannt</span>
              <span style={{ fontSize: F(13), fontWeight: 500, color: '#fff' }}>{currentLabel}</span>
            </div>
            <StandortChips locs={currentSlave.locs} stockFallback={currentSlave.stock ?? 0} darkBg={true} />
          </div>
        )}

        {otherSlaves.length > 0 && (
          <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.tileShadow, overflow: 'hidden' }}>
            <div style={{ fontSize: F(10), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 5, padding: `${F(8)}px ${F(12)}px`, borderBottom: `1px solid ${T.border}`, background: T.dark ? 'rgba(255,255,255,0.03)' : '#f7f9fc' }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke={T.mute} strokeWidth="2" strokeLinejoin="round"/><path d="M3 7l9 4 9-4M12 11v10" stroke={T.mute} strokeWidth="2" strokeLinejoin="round"/></svg>
              Weitere Ausführungen
            </div>
            {otherSlaves.map((sp) => <SlaveCard key={sp.ean || sp.art} sp={sp} />)}
          </div>
        )}
      </div>
    );
  }

  // ── Geschwister-Accordion (ALT — wird nicht mehr verwendet) ───
  function SiblingsAccordion({ siblings, currentEan, T, F }) {
    if (!siblings || siblings.length === 0) return null;
    const stockColor = (n) => n <= 0 ? T.stock.out : n <= 2 ? T.stock.low : T.stock.ok;

    // Farbe und Größe aus dem Produktnamen extrahieren
    const parseAttrs = (name) => {
      // Doppelpunkt-Format: "Farbe: Orange-Black/Grey" / "Größe: S"
      const colorColon = (name.match(/Farbe\s*:\s*([^-–·]+?)(?:\s*[-–·]|$)/i) || [])[1];
      const sizeColon  = (name.match(/Gr(?:ö|oe|o)(?:ß|ss|s)e\s*:\s*([^-–·]+?)(?:\s*[-–·]|$)/i) || [])[1];
      if (colorColon || sizeColon) {
        return { color: (colorColon || '').trim() || null, size: (sizeColon || '').trim() || null };
      }
      // Bindestrich-Format: letztes Segment nach " - Gr. " ist die Größe,
      // vorletztes Segment ist die Farbe
      const parts = name.split(/\s+-\s+/);
      if (parts.length >= 2) {
        const last = parts[parts.length - 1].trim();
        const prev = parts[parts.length - 2].trim();
        const sizeMatch = last.match(/^Gr\.?\s*(.+)/i);
        if (sizeMatch) return { color: prev, size: sizeMatch[1].trim() };
        // Kein "Gr." — letztes Segment könnte Größe sein (z.B. "S", "M", "L", "39/40")
        if (/^(XS|S|M|L|XL|XXL|\d[\d/,.\-–]+)$/i.test(last)) {
          return { color: prev, size: last };
        }
        // Nur eine Variante (z.B. nur Farbe, keine Größe)
        return { color: last, size: null };
      }
      return { color: null, size: null };
    };

    // Größen numerisch sortieren: "39/40" → 39, "S/M" → Buchstaben ans Ende
    const sizeOrder = (s) => {
      if (!s) return 9999;
      const sizeMap = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, XXXL: 7 };
      const upper = s.toUpperCase().trim();
      if (sizeMap[upper]) return sizeMap[upper];
      const n = parseFloat(String(s).replace(',', '.'));
      return Number.isFinite(n) ? n : 9998;
    };

    // Gruppieren nach Farbe, innerhalb nach Größe sortieren
    const grouped = React.useMemo(() => {
      const map = {};
      siblings.forEach((sp) => {
        const { color, size } = parseAttrs(sp.name);
        const key = color || '—';
        if (!map[key]) map[key] = [];
        map[key].push({ sp, size });
      });
      // Innerhalb jeder Farbe nach Größe sortieren
      Object.values(map).forEach((items) => {
        items.sort((a, b) => sizeOrder(a.size) - sizeOrder(b.size));
      });
      return map;
    }, [siblings]);

    const groupKeys   = Object.keys(grouped);
    const multiGroup  = groupKeys.length > 1;

    // Finde die Farb-Gruppe des aktuell gescannten Artikels
    const currentGroup = React.useMemo(() => {
      if (!currentEan) return null;
      return groupKeys.find((gk) => grouped[gk].some((x) => x.sp.ean === currentEan)) || null;
    }, [currentEan, grouped, groupKeys]);

    const [openGroups, setOpenGroups] = React.useState(() => {
      const init = {};
      if (currentGroup) init[currentGroup] = true;
      else if (groupKeys.length === 1) init[groupKeys[0]] = true;
      return init;
    });
    const [openEans, setOpenEans] = React.useState(() =>
      currentEan ? { [currentEan]: true } : {}
    );
    const toggleGroup = (key) => setOpenGroups((o) => ({ ...o, [key]: !o[key] }));
    const toggleEan   = (ean) => setOpenEans((o) => ({ ...o, [ean]: !o[ean] }));

    // Bestandssumme für eine Farbgruppe
    const groupStock = (items) => items.reduce((sum, { sp }) =>
      sum + (sp.locs ? (sp.locs[standort.key] ?? 0) : (sp.stock ?? 0)), 0);
    const groupTotal = (items) => items.reduce((sum, { sp }) =>
      sum + (sp.locs ? ALL_LOC_KEYS.reduce((s, k) => s + (sp.locs[k] ?? 0), 0) : (sp.stockTotal ?? 0)), 0);

    const SizeRow = ({ sp, size }) => {
      const isCurrent = sp.ean === currentEan;
      const stock     = sp.locs ? (sp.locs[standort.key] ?? 0) : (sp.stock ?? 0);
      const total     = sp.locs ? ALL_LOC_KEYS.reduce((s, k) => s + (sp.locs[k] ?? 0), 0) : (sp.stockTotal ?? 0);
      const isOpen    = openEans[sp.ean];
      const hasLocs   = !!sp.locs;
      const onSale    = sp.sale != null && sp.sale > sp.price;
      const locMax    = hasLocs ? Math.max(1, ...ALL_LOC_KEYS.map((k) => sp.locs[k] ?? 0)) : 1;
      const label     = size || sp.name;

      return (
        <div>
          <button onClick={() => hasLocs && toggleEan(sp.ean)}
            style={{ width: '100%', textAlign: 'left', border: 'none', fontFamily: 'inherit',
              cursor: hasLocs ? 'pointer' : 'default', padding: `${F(9)}px ${F(14)}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              background: isCurrent ? (T.dark ? `${standortAccent}1a` : `${standortAccent}0d`) : 'transparent',
              borderLeft: isCurrent ? `3px solid ${standortAccent}` : '3px solid transparent',
              borderTop: `1px solid ${T.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {isCurrent && <span style={{ fontSize: F(9), fontWeight: 700, color: standortAccent, background: `${standortAccent}18`, border: `1px solid ${standortAccent}44`, padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.4, marginRight: 6 }}>gescannt</span>}
              <span style={{ fontSize: F(13), fontWeight: isCurrent ? 700 : 500, color: T.ink }}>{label}</span>
              {sp.art && <span style={{ display: 'block', fontSize: F(10), color: T.mute, fontFamily: 'ui-monospace, Menlo, monospace', marginTop: 1 }}>{sp.art}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {sp.price > 0 && <span style={{ fontSize: F(12), fontWeight: 700, color: onSale ? T.red : standortAccent, whiteSpace: 'nowrap' }}>{EUR(sp.price)}</span>}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: F(14), fontWeight: 700, color: stockColor(stock), lineHeight: 1 }}>{stock} <span style={{ fontSize: F(10), fontWeight: 500, color: T.mute }}>{standort.shortLabel}</span></div>
                {total !== stock && <div style={{ fontSize: F(10), color: T.mute, marginTop: 1 }}>{total} ges.</div>}
              </div>
              {hasLocs && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', opacity: 0.5 }}><path d="M6 9l6 6 6-6" stroke={T.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </button>
          {isOpen && hasLocs && (
            <div style={{ background: T.dark ? 'rgba(255,255,255,0.03)' : '#f7f9fc', borderTop: `1px solid ${T.border}`, padding: `${F(7)}px ${F(14)}px ${F(7)}px ${F(28)}px` }}>
              {ALL_LOC_KEYS.map((locKey) => {
                const sd   = STANDORTE.find((s) => s.key === locKey) || { key: locKey, label: locKey };
                const n    = sp.locs[locKey] ?? 0;
                const pct  = Math.round((n / locMax) * 100);
                const home = locKey === standort.key;
                return (
                  <div key={locKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: F(74), flexShrink: 0, fontSize: F(11), fontWeight: home ? 700 : 400, color: home ? standortAccent : T.mute }}>
                      {sd.label}
                      {home && <span style={{ marginLeft: 4, fontSize: F(8), fontWeight: 700, color: standortAccent, background: `${standortAccent}18`, padding: '1px 4px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>hier</span>}
                    </span>
                    <div style={{ flex: 1, height: 5, borderRadius: 5, background: T.dark ? 'rgba(255,255,255,0.08)' : '#dde4ee', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 5, background: n === 0 ? 'transparent' : home ? standortAccent : (T.dark ? 'rgba(231,239,247,0.35)' : '#9fb0c6') }} />
                    </div>
                    <span style={{ width: F(22), textAlign: 'right', fontSize: F(12), fontWeight: 700, color: n ? T.ink : T.mute }}>{n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    const GroupHeader = ({ gk }) => {
      const items      = grouped[gk];
      const isOpen     = openGroups[gk];
      const isCurrent  = gk === currentGroup;
      const stk        = groupStock(items);
      const tot        = groupTotal(items);
      return (
        <button onClick={() => toggleGroup(gk)}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
            padding: `${F(10)}px ${F(14)}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            background: isCurrent ? (T.dark ? `${standortAccent}1a` : `${standortAccent}0f`) : (T.dark ? 'rgba(255,255,255,0.03)' : '#f7f9fc'),
            borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isCurrent && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3M3 12h18" stroke={standortAccent} strokeWidth="2" strokeLinecap="round"/></svg>}
            <span style={{ fontSize: F(13), fontWeight: 700, color: isCurrent ? standortAccent : T.ink }}>{gk}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: F(11), color: T.mute }}>
              <span style={{ color: stockColor(stk), fontWeight: 700 }}>{stk}</span> vor Ort · {tot} ges.
            </span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', opacity: 0.5 }}><path d="M6 9l6 6 6-6" stroke={T.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>
      );
    };

    return (
      <div style={{ background: T.card, borderRadius: T.radius, marginTop: T.gap, border: `1px solid ${T.border}`, boxShadow: T.tileShadow, overflow: 'hidden' }}>
        <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 5, padding: `${F(10)}px ${F(14)}px`, borderBottom: `1px solid ${T.border}` }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke={T.mute} strokeWidth="2" strokeLinejoin="round"/><path d="M3 7l9 4 9-4M12 11v10" stroke={T.mute} strokeWidth="2" strokeLinejoin="round"/></svg>
          Alle Ausführungen
        </div>
        {!multiGroup && grouped[groupKeys[0]].map(({ sp, size }) => <SizeRow key={sp.ean || sp.art} sp={sp} size={size} />)}
        {multiGroup && groupKeys.map((gk) => (
          <div key={gk}>
            <GroupHeader gk={gk} />
            {openGroups[gk] && grouped[gk].map(({ sp, size }) => <SizeRow key={sp.ean || sp.art} sp={sp} size={size} />)}
          </div>
        ))}
      </div>
    );
  }

  // Hilfsfunktion: zum Suche-Tab springen und Aktionsfilter setzen
  // Muss VOR detailScreen stehen damit der Banner darauf zugreifen kann
  const goToAktionen = () => {
    setFilterBrand(null); setFilterCat(null); setFilterAktion(true); setQ('');
    setDetail(null);
    setTimeout(() => setTab('search'), 50);
  };

  // ── Detailansicht ─────────────────────────────────────────────
  const detailScreen = detail && (() => {
    const Tile      = ({ children }) => <div style={{ background: T.card, borderRadius: T.radius, padding: T.pad, border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>{children}</div>;
    const TileLabel = ({ icon, children }) => <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 5 }}>{icon(T.mute, 14)} {children}</div>;

    // Preis direkt aus dem Artikel-Objekt — jetzt immer vorhanden
    const onSale = detail.sale != null && detail.sale > detail.price;
    const save   = onSale ? Math.round((1 - detail.price / detail.sale) * 100) : 0;

    // Bestand
    const stock      = getStock(detail);
    const stockTotal = getTotalStock(detail);
    const stockSt    = stockState(stock);
    const locMax     = Math.max(1, ...ALL_LOC_KEYS.map((k) => detail.locs ? (detail.locs[k] ?? 0) : 0));

    // Master-Lookup (für Slave-Artikel)
    const masterProduct = !detail.isMaster
      ? slaveToMaster[String(detail.art || '').trim().toLowerCase()]
        || (detail.masterArt ? productByArt[detail.masterArt.toLowerCase()] : null)
      : null;
    const masterShopUrl = masterProduct ? (masterProduct.shopUrl || null) : null;

    // Geschwister (alle Slaves desselben Masters)
    const siblings = masterProduct ? getSiblings(masterProduct) : [];

    // Shop-URL: eigene URL bevorzugt, sonst Master-URL als Fallback
    const shopBtnUrl = detail.shopUrl || (!detail.isMaster ? masterShopUrl : null);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>

        {/* Header */}
        <div style={{ background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          paddingTop: padTopDet, paddingLeft: 12, paddingRight: 12, paddingBottom: 11,
          display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={() => setDetail(null)} style={{ width: 38, height: 38, borderRadius: 11, border: 'none', cursor: 'pointer', background: `${standortAccent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.back(standortAccent, 22)}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 1 }}>{detail.brand} · {detail.cat}</div>
            <div style={{ fontSize: F(15), fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{detail.name}</div>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: standortAccent, flexShrink: 0 }} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: T.pad }}>

          {/* Foto + Name */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <ProductPhoto product={detail} dark={T.dark} radius={T.radius} style={{ width: F(96), height: F(96), flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: F(18), fontWeight: 800, color: T.ink, lineHeight: 1.2, textWrap: 'pretty' }}>{detail.name}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {detail.inactive   && <span style={{ fontSize: F(11), fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b55', padding: '2px 8px', borderRadius: 6 }}>⚠ Artikel inaktiv</span>}
                {detail.restposten && <span style={{ fontSize: F(11), fontWeight: 700, color: '#7c2d12', background: '#ffedd5', border: '1px solid #f9731655', padding: '2px 8px', borderRadius: 6 }}>🏷 Restposten</span>}
              </div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: F(11), color: T.mute }}>
                  <span>Art. {detail.art}</span>
                  <CopyBtn text={detail.art || ''} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: F(11), color: T.mute }}>
                  <span>EAN {detail.ean}</span>
                  <CopyBtn text={detail.ean || ''} />
                </div>
              </div>
            </div>
          </div>

          {/* Aktionsbanner */}
          {detail.aktionsangebote?.[standort.key] && (
            <div onClick={goToAktionen}
              style={{
                marginTop: T.gap, borderRadius: T.radius, padding: '10px 14px',
                background: '#DAA520',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: F(10), fontWeight: 700, color: '#5a3e00', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Aktionsangebot</div>
                <div style={{ fontSize: F(13), fontWeight: 600, color: '#3d2b00', lineHeight: 1.3 }}>{detail.aktionsangebote?.[standort.key]}</div>
              </div>
              <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: F(11), color: '#3d2b00', fontWeight: 700 }}>Alle</span>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}

          {/* KPI tiles: Preis + Bestand */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: T.gap, marginTop: T.gap + 4 }}>
            <Tile>
              <TileLabel icon={Icon.tag}>Preis</TileLabel>
              {detail.noPrice ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: F(13), fontWeight: 700, color: '#b45309' }}>Preis wird aktualisiert</div>
                  <div style={{ marginTop: 4, fontSize: F(11), color: T.mute, lineHeight: 1.4 }}>Wir arbeiten daran. Aktuellen Preis bitte im Onlineshop prüfen.</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: F(24), fontWeight: 800, color: onSale ? T.red : standortAccent, marginTop: 6, lineHeight: 1 }}>
                    {EUR(detail.price)}
                  </div>
                  {onSale ? (
                    <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: F(12), color: T.mute, textDecoration: 'line-through' }}>{EUR(detail.sale)}</span>
                      <span style={{ fontSize: F(11), fontWeight: 700, color: '#fff', background: T.red, padding: '1px 6px', borderRadius: 5 }}>−{save}%</span>
                    </div>
                  ) : <div style={{ marginTop: 5, fontSize: F(12), color: T.mute }}>inkl. MwSt.</div>}
                </>
              )}
            </Tile>
            <Tile>
              <TileLabel icon={Icon.box}>Bestand · {standort.label}</TileLabel>
              <div style={{ fontSize: F(24), fontWeight: 800, color: T.stock[stockSt], marginTop: 6, lineHeight: 1 }}>
                {stock}<span style={{ fontSize: F(13), fontWeight: 600, color: T.mute }}> Stk</span>
              </div>
              <div style={{ marginTop: 5, fontSize: F(11), color: T.mute }}>vor Ort · {stockTotal} gesamt</div>
              <div style={{ marginTop: 7, height: 6, borderRadius: 6, background: T.dark ? 'rgba(255,255,255,0.1)' : '#e7ecf3', overflow: 'hidden' }}>
                <div style={{ width: `${stockTotal ? Math.round((stock / stockTotal) * 100) : 0}%`, height: '100%', background: T.stock[stockSt], borderRadius: 6 }} />
              </div>
            </Tile>
          </div>

          {/* Bestand nach Standort — nur für Einzelartikel ohne Geschwister */}
          {detail.locs && siblings.length === 0 && (
            <div style={{ background: T.card, borderRadius: T.radius, padding: T.pad, marginTop: T.gap, border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>
              <TileLabel icon={Icon.box}>Bestand nach Standort</TileLabel>
              <div style={{ marginTop: 10 }}>
                <StandortChips locs={detail.locs} stockFallback={getStock(detail)} />
              </div>
            </div>
          )}

          {/* Geschwister — neues Layout */}
          {siblings.length > 0 && (
            <SiblingsNew siblings={siblings} currentEan={detail._scannedEan} T={T} F={F} />
          )}

          {/* Spec-Tabelle */}
          <div style={{ background: T.card, borderRadius: T.radius, marginTop: T.gap, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>
            {[
              detail.brand ? ['Hersteller', detail.brand] : null,
              detail.cat   ? ['Kategorie',  detail.cat]   : null,
            ].filter(Boolean).map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: `${T.pad - 4}px ${T.pad}px`, background: i % 2 && !T.dark ? '#fafbfd' : 'transparent', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
                <span style={{ color: T.mute, fontSize: F(13) }}>{k}</span>
                <span style={{ color: T.ink, fontSize: F(13), fontWeight: 600, textAlign: 'right' }}>{v}</span>
              </div>
            ))}

            {/* Master-Link (nur für Slave-Artikel) */}
            {masterProduct && (
              masterShopUrl ? (
                <a href={masterShopUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    padding: `${T.pad - 4}px ${T.pad}px`, borderTop: `1px solid ${T.border}`,
                    textDecoration: 'none', cursor: 'pointer',
                    background: T.dark ? `${standortAccent}0d` : `${standortAccent}07` }}>
                  <span style={{ color: T.mute, fontSize: F(13) }}>Masterartikel im Shop</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: standortAccent, fontSize: F(13), fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace' }}>
                    {masterProduct.art}
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={standortAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 3h6v6M10 14L21 3" stroke={standortAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </a>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: `${T.pad - 4}px ${T.pad}px`, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ color: T.mute, fontSize: F(13) }}>Masterartikel</span>
                  <span style={{ color: T.ink, fontSize: F(13), fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>{masterProduct.art}</span>
                </div>
              )
            )}
          </div>

          {!shopBtnUrl && (
            <div style={{ textAlign: 'center', fontSize: F(11), color: T.mute, marginBottom: T.gap }}>Kein Onlineshop-Eintrag gefunden</div>
          )}
        </div>

        {/* Button-Leiste: Onlineshop + Nächsten Artikel scannen nebeneinander */}
        <div style={{ paddingTop: 11, paddingLeft: T.pad, paddingRight: T.pad, paddingBottom: padBotBtn, background: T.bg, borderTop: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 10 }}>
          {shopBtnUrl && (
            <a href={shopBtnUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, height: 50, borderRadius: 14, border: `1.5px solid ${standortAccent}55`,
                background: `${standortAccent}0e`, color: standortAccent,
                fontSize: F(14), fontWeight: 800, textDecoration: 'none', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={standortAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3h6v6M10 14L21 3" stroke={standortAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Onlineshop
            </a>
          )}
          <button onClick={() => { setDetail(null); setTab('scan'); }}
            style={{ flex: shopBtnUrl ? 1 : undefined, width: shopBtnUrl ? undefined : '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', background: standortAccent,
              color: T.dark ? '#06131f' : '#fff', fontSize: F(16), fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
            {Icon.scan(T.dark ? '#06131f' : '#fff', 20)} Nächsten Artikel scannen
          </button>
        </div>
      </div>
    );
  })();

  // ── Scan-Tab ──────────────────────────────────────────────────
  // Anzahl Aktionsartikel für den Banner + Suggestion (muss vor scanTab stehen)
  const aktionenCount = useMemo(() =>
    PRODUCTS.filter((p) => !p.isMaster && !!p.aktionsangebote?.[standort.key]).length,
  [PRODUCTS, standort]);

  const onText = T.dark ? '#06131f' : '#fff';
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
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto', padding: T.pad }}>
        <div style={{ background: T.card, borderRadius: 18, padding: 18, border: `1px solid ${T.border}`, boxShadow: T.tileShadow, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '1 / 1', borderRadius: 18, background: '#06131f', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div id="scanner-cam" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            {cam !== 'live' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.dark ? '#16283f' : '#eaf1f9' }}>
                <div style={{ opacity: 0.55, display: 'flex' }}>{Icon.qr(standortAccent, 58)}</div>
              </div>
            )}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h], i) => (
              <div key={i} style={{ position: 'absolute', [v]: 16, [h]: 16, width: 28, height: 28, pointerEvents: 'none',
                [`border${v[0].toUpperCase()+v.slice(1)}`]: `3px solid ${cam === 'live' ? '#fff' : standortAccent}`,
                [`border${h[0].toUpperCase()+h.slice(1)}`]: `3px solid ${cam === 'live' ? '#fff' : standortAccent}`,
                borderRadius: v === 'top' ? (h === 'left' ? '8px 0 0 0' : '0 8px 0 0') : (h === 'left' ? '0 0 0 8px' : '0 0 8px 0') }} />
            ))}
            {cam === 'live' && <div className="scanline" style={{ position: 'absolute', left: 16, right: 16, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,#fff,transparent)', boxShadow: '0 0 12px #fff' }} />}
          </div>

          <div style={{ marginTop: 14, fontWeight: 700, color: T.ink, fontSize: F(16) }}>
            {cam === 'live' ? 'Kamera aktiv' : cam === 'error' ? 'Kamera nicht verfügbar' : 'Bereit zum Scannen'}
          </div>
          <div style={{ marginTop: 3, fontSize: F(13), color: cam === 'error' ? T.stock.out : T.mute, textAlign: 'center', lineHeight: 1.4 }}>
            {cam === 'live' ? 'Barcode / EAN in den Rahmen halten' : cam === 'error' ? camMsg : 'Kamera auf Barcode oder QR richten'}
          </div>

          {notFound && <div style={{ marginTop: 12, width: '100%', boxSizing: 'border-box', background: T.chipLow, color: T.stock.out, border: `1px solid ${T.stock.out}55`, borderRadius: 10, padding: '9px 12px', fontSize: F(13), fontWeight: 600, textAlign: 'center' }}>Kein Artikel zu „{notFound}" (EAN/Art.-Nr.)</div>}

          {cam === 'live'
            ? <button onClick={stopCamera} style={{ marginTop: 14, width: '100%', height: 52, borderRadius: 14, border: `1.5px solid ${T.border}`, cursor: 'pointer', background: 'transparent', color: T.ink, fontSize: F(16), fontWeight: 700, fontFamily: 'inherit' }}>Stopp</button>
            : <button onClick={startCamera} style={{ marginTop: 14, width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: 'pointer', background: standortAccent, color: onText, fontSize: F(16), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>{Icon.scan(onText, 20)} Kamera starten</button>}

          <div style={{ marginTop: 10, width: '100%', display: 'flex', gap: 8 }}>
            <input value={manual} onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && manual.trim()) { handleCode(manual.trim()); setManual(''); } }}
              placeholder="EAN oder Art.-Nr. eingeben"
              style={{ flex: 1, minWidth: 0, height: 44, borderRadius: 11, border: `1px solid ${T.border}`, background: T.field, color: T.ink, padding: '0 12px', fontSize: F(15), fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={() => { if (manual.trim()) { handleCode(manual.trim()); setManual(''); } }}
              style={{ flexShrink: 0, height: 44, padding: '0 16px', borderRadius: 11, border: 'none', cursor: 'pointer', background: `${standortAccent}18`, color: standortAccent, fontSize: F(15), fontWeight: 700, fontFamily: 'inherit' }}>Suchen</button>
          </div>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: F(12), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 700 }}>Zuletzt gescannt</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: T.gap - 2 }}>
              {history.slice(0, 3).map((h) => <ListRow key={h.p.ean || h.p.id} p={h.p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Suche-Tab ─────────────────────────────────────────────────
  const q2 = q.trim().toLowerCase();
  const tokenMatch = (s, toks) => toks.every((t) => s.includes(t));

  // Top-10-Marken und -Kategorien aus echten Daten (gezählt aus dem Sheet).
  // Reihenfolge = Häufigkeit. Gekürzte Anzeigenamen für die Chips.
  // Deaktivierte Artikel werden grundsätzlich herausgefiltert.
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
    { value: 'Neoprenanzüge',                    label: 'Neoprenanzüge' },
    { value: 'Neopren',                          label: 'Neopren' },
    { value: 'Trockentauchen',                   label: 'Trockentauchen' },
    { value: 'Zubehör',                          label: 'Zubehör' },
    { value: 'Geräteflossen',                    label: 'Geräteflossen' },
    { value: 'Tarierjackets',                    label: 'Tarierjackets' },
    { value: 'Masken',                           label: 'Masken' },
    { value: 'Masken mit opt. Gläsern',          label: 'Opt. Masken' },
    { value: 'UV-Schutz',                        label: 'UV-Schutz' },
    { value: 'Trilaminat Trockentauchanzüge',    label: 'Trilaminat' },
  ];

  const [filterBrand, setFilterBrand] = useState(null);
  const [filterCat,   setFilterCat]   = useState(null);
  const [filterAktion, setFilterAktion] = useState(false);
  const [visibleCap, setVisibleCap] = useState(40);

  // Suchverlauf speichern (debounced: erst wenn mind. 2 Zeichen & 800ms keine Eingabe)
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

  // visibleCap zurücksetzen bei neuer Suche/Filter
  useEffect(() => { setVisibleCap(40); }, [q, filterBrand, filterCat, filterAktion]);
  const toks = q2.length >= 2 ? q2.split(/\s+/).filter(Boolean) : [];
  const SEARCH_CAP = 40;

  const matches = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.isMaster) return false;
      const s = p._s || (p.name + ' ' + p.brand + ' ' + p.art + ' ' + p.cat + ' ' + p.ean).toLowerCase();
      const textOk   = toks.length === 0 || tokenMatch(s, toks);
      const brandOk  = !filterBrand  || p.brand === filterBrand;
      const catOk    = !filterCat    || p.cat   === filterCat;
      const aktionOk = !filterAktion || !!p.aktionsangebote?.[standort.key];
      return textOk && brandOk && catOk && aktionOk;
    });
  }, [PRODUCTS, toks, filterBrand, filterCat, filterAktion]);

  const shown = matches.slice(0, visibleCap);
  const activeFilters = (filterBrand ? 1 : 0) + (filterCat ? 1 : 0) + (filterAktion ? 1 : 0);

  // Aktiven Chip-Label für die Anzeige finden
  const activeBrandLabel = filterBrand
    ? (TOP_BRANDS.find((b) => b.value === filterBrand)?.label || filterBrand)
    : null;
  const activeCatLabel = filterCat
    ? (TOP_CATS.find((c) => c.value === filterCat)?.label || filterCat)
    : null;

  const Chip = ({ label, active, onPress }) => (
    <button onClick={onPress} style={{ flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 20,
      border: `1.5px solid ${active ? standortAccent : T.border}`, background: active ? standortAccent : T.card,
      color: active ? (T.dark ? '#06131f' : '#fff') : T.ink, fontSize: F(12), fontWeight: active ? 700 : 500,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
      {label}{active ? ' ×' : ''}
    </button>
  );

  // Zeige Aktions-Suggestion wenn Eingabe auf "aktion" matcht
  const showAktionSuggestion = q.trim().length >= 2
    && 'aktionsangebote'.startsWith(q.trim().toLowerCase())
    && !filterAktion;

  // Gesamtzahl aktiver Artikel
  const totalActive = useMemo(() =>
    PRODUCTS.filter((p) => !p.isMaster).length,
  [PRODUCTS]);

  const searchTab = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header title="Suche" sub={`${totalActive.toLocaleString('de-DE')} Artikel im Sortiment`} />
      <div style={{ padding: `12px ${T.pad}px 0`, position: 'relative' }}>
        {/* Suchfeld — zeigt Aktions-Tag wenn Filter aktiv, sonst normales Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.field, borderRadius: 12,
          padding: filterAktion ? '8px 14px' : '10px 14px',
          border: filterAktion ? `1.5px solid #DAA520` : `1px solid ${T.border}`,
          boxShadow: T.tileShadow }}>
          {Icon.search(T.mute, 18)}
          {/* Aktions-Tag im Suchfeld */}
          {filterAktion && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#DAA520',
              color: '#3d2b00', borderRadius: 6, padding: '3px 8px 3px 7px', fontSize: F(13),
              fontWeight: 700, flexShrink: 0 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Aktionen
              <span onClick={() => setFilterAktion(false)}
                style={{ fontSize: 16, lineHeight: 1, opacity: 0.6, marginLeft: 1, cursor: 'pointer' }}>×</span>
            </span>
          )}
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={filterAktion ? 'Suche verfeinern…' : 'Name, Marke, Art.-Nr. oder EAN'}
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: F(15), color: T.ink, background: 'transparent', fontFamily: 'inherit' }} />
          {(q || activeFilters > 0) && (
            <button onClick={() => { setQ(''); setFilterBrand(null); setFilterCat(null); setFilterAktion(false); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              {Icon.close(T.mute, 18)}
            </button>
          )}
        </div>
        {/* Autocomplete-Dropdown: Aktions-Suggestion */}
        {showAktionSuggestion && (
          <div style={{ position: 'absolute', left: T.pad, right: T.pad, top: '100%', zIndex: 50,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)', marginTop: 4 }}>
            <button
              onClick={() => { setFilterAktion(true); setQ(''); }}
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                background: T.dark ? 'rgba(218,165,32,0.12)' : '#DAA52012' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#DAA520',
                color: '#3d2b00', borderRadius: 6, padding: '3px 8px 3px 7px', fontSize: F(13), fontWeight: 700, flexShrink: 0 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Aktionen
              </span>
              <span style={{ fontSize: F(13), color: T.mute }}>{aktionenCount} Aktionsartikel anzeigen</span>
            </button>
            <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${T.border}` }}>
              {Icon.search(T.mute, 14)}
              <span style={{ fontSize: F(13), color: T.mute }}>nach „{q}" suchen…</span>
            </div>
          </div>
        )}
      </div>
      {/* Marken-Chips */}
      <div style={{ padding: `8px ${T.pad}px 0` }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip label="Alle Marken" active={!filterBrand} onPress={() => setFilterBrand(null)} />
          {TOP_BRANDS.map((b) => (
            <Chip key={b.value} label={b.label} active={filterBrand === b.value}
              onPress={() => setFilterBrand(filterBrand === b.value ? null : b.value)} />
          ))}
          {filterBrand && !TOP_BRANDS.find((b) => b.value === filterBrand) && (
            <Chip label={activeBrandLabel} active={true} onPress={() => setFilterBrand(null)} />
          )}
        </div>
      </div>
      {/* Kategorien-Chips */}
      <div style={{ padding: `4px ${T.pad}px 6px` }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip label="Alle Kategorien" active={!filterCat} onPress={() => setFilterCat(null)} />
          {TOP_CATS.map((c) => (
            <Chip key={c.value} label={c.label} active={filterCat === c.value}
              onPress={() => setFilterCat(filterCat === c.value ? null : c.value)} />
          ))}
          {filterCat && !TOP_CATS.find((c) => c.value === filterCat) && (
            <Chip label={activeCatLabel} active={true} onPress={() => setFilterCat(null)} />
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: `0 ${T.pad}px ${T.pad}px`, display: 'flex', flexDirection: 'column', gap: T.gap - 2 }}>
        {toks.length === 0 && !filterBrand && !filterCat && !filterAktion ? (
          searchHistory.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: F(12), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icon.history(T.mute, 14)} Zuletzt gesucht</span>
                <button onClick={() => { setSearchHistory([]); try { localStorage.removeItem('atlantis_search_history'); } catch {} }}
                  style={{ border: 'none', background: 'none', color: T.mute, fontSize: F(12), cursor: 'pointer', fontFamily: 'inherit' }}>Löschen</button>
              </div>
              {searchHistory.map((s) => (
                <button key={s} onClick={() => setQ(s)}
                  style={{ width: '100%', textAlign: 'left', border: `1px solid ${T.border}`, cursor: 'pointer',
                    background: T.card, borderRadius: T.radius, padding: '10px 14px',
                    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: T.tileShadow, fontFamily: 'inherit' }}>
                  {Icon.history(T.mute, 16)}
                  <span style={{ fontSize: F(14), color: T.ink, flex: 1 }}>{s}</span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M7 7h10v10" stroke={T.mute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
                style={{ width: '100%', padding: '13px', background: T.card,
                  border: `1px solid ${T.border}`, borderRadius: T.radius,
                  color: T.ink, fontSize: F(14), fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, boxShadow: T.tileShadow }}>
                {Icon.chevron(standortAccent, 18)}
                Mehr laden
                <span style={{ color: T.mute, fontSize: F(12) }}>(+{(matches.length - visibleCap).toLocaleString('de-DE')} weitere)</span>
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: T.mute, marginTop: 50, fontSize: F(14) }}>Keine Treffer{q ? ` für „${q}"` : ''}{activeFilters > 0 ? ' mit diesen Filtern' : ''}</div>
        )}
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
        {history.length ? history.map((h) => <ListRow key={h.p.ean || h.p.id} p={h.p} time={fmtTime(h.at)} />) : (
          <div style={{ textAlign: 'center', color: T.mute, marginTop: 60 }}>
            <div style={{ display: 'inline-flex', opacity: 0.4 }}>{Icon.history(T.mute, 44)}</div>
            <div style={{ marginTop: 12, fontSize: F(14) }}>Gescannte Artikel erscheinen hier</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Info-Tab ──────────────────────────────────────────────────
  const [infoOS, setInfoOS] = React.useState('ios');
  const infoTab = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header title="Anleitung" sub="Atlantis Scan · Kurzguide" />
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: T.pad }}>

        {/* Hinweis-Box */}
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b55', borderLeft: `4px solid #f59e0b`, borderRadius: T.radius, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: T.gap * 2 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>☀️</span>
          <p style={{ fontSize: F(13), color: '#78350f', lineHeight: 1.55 }}><strong>Sommerfest-Premiere!</strong> Wir testen die App heute zum ersten Mal gemeinsam im Alltagseinsatz. Einfach ausprobieren, Fragen stellen und Feedback geben — so machen wir sie noch besser.</p>
        </div>

        {/* 0 — Einrichtung */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: '#0e7c8b', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>0</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Einmalige Einrichtung</span>
        </div>
        <p style={{ fontSize: F(13), color: T.mute, marginBottom: 10, lineHeight: 1.55 }}>Die App läuft im Browser und kann wie eine echte App zum Startbildschirm hinzugefügt werden.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={() => setInfoOS('ios')} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: infoOS === 'ios' ? `2px solid ${standortAccent}` : `1.5px solid ${T.border}`, background: infoOS === 'ios' ? standortAccent : T.card, color: infoOS === 'ios' ? '#fff' : T.mute, fontSize: F(13), fontWeight: infoOS === 'ios' ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>
             iPhone (Safari)
          </button>
          <button onClick={() => setInfoOS('android')} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: infoOS === 'android' ? `2px solid ${standortAccent}` : `1.5px solid ${T.border}`, background: infoOS === 'android' ? standortAccent : T.card, color: infoOS === 'android' ? '#fff' : T.mute, fontSize: F(13), fontWeight: infoOS === 'android' ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            🤖 Android (Chrome)
          </button>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: T.gap * 2 }}>
          {(infoOS === 'ios' ? [
            ['1', 'Safari öffnen', 'Safari aufrufen (nicht Chrome) und scanner.atlantis-berlin.de eingeben.'],
            ['2', 'Teilen-Button antippen', 'Unten in der Mitte auf das Teilen-Symbol tippen — Viereck mit Pfeil nach oben ⬆'],
            ['3', '„Zum Home-Bildschirm" wählen', 'Im Menü nach unten scrollen und antippen.'],
            ['4', 'Bestätigen', 'Namen so lassen und oben rechts auf „Hinzufügen" tippen.'],
            ['5', 'Fertig!', 'App-Icon erscheint auf dem Startbildschirm. Einmalig Kamerazugriff erlauben.'],
          ] : [
            ['1', 'Chrome öffnen', 'Chrome aufrufen und scanner.atlantis-berlin.de eingeben.'],
            ['2', 'Menü öffnen', 'Oben rechts auf die drei Punkte ⋮ tippen.'],
            ['3', '„App installieren"', 'Auf „App installieren" oder „Zum Startbildschirm hinzufügen" tippen und bestätigen.'],
            ['4', 'Fertig!', 'App-Icon erscheint. Beim ersten Start Kamerazugriff mit „Zulassen" bestätigen.'],
          ]).map(([n, title, desc], i, arr) => (
            <div key={n} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px dashed ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, background: T.dark ? 'rgba(255,255,255,0.1)' : '#eef3fb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: F(12), fontWeight: 700, color: standortAccent }}>{n}</div>
              <div>
                <div style={{ fontSize: F(13), fontWeight: 700, color: T.ink, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 1 — Was kann die App */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: standortAccent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>1</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Was kann die App?</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 10 }}>
          <p style={{ fontSize: F(13), color: T.ink, lineHeight: 1.65, marginBottom: 10 }}><strong>Atlantis Scan</strong> ist unser internes Tool zum schnellen Nachschlagen von Artikeln. Barcodes scannen oder nach Produkten suchen — sofort Preis und Lagerbestand nach Standort.</p>
          <div style={{ background: '#fff5f5', border: '1px solid #fca5a555', borderLeft: `4px solid ${T.red}`, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: F(12), color: '#7f1d1d', lineHeight: 1.5 }}><strong>Nur lesen, nicht schreiben:</strong> Bestände können in der App nicht geändert werden. Sie ist ein Nachschlage-Tool, kein Warenwirtschaftssystem.</p>
          </div>
        </div>

        {/* 2 — Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: standortAccent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>2</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Aufbau: 4 Tabs</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 10 }}>
          <p style={{ fontSize: F(13), color: T.mute, lineHeight: 1.6, marginBottom: 10 }}>Die App ist in vier Bereiche aufgeteilt, zwischen denen du jederzeit über die <strong style={{ color: T.ink }}>Tab-Leiste unten</strong> wechselst.</p>
          {[['📷', 'Scannen', 'Barcode per Kamera oder manuelle Eingabe'], ['🔍', 'Suche', 'Nach Name, Marke, Art.-Nr. oder EAN suchen'], ['🕐', 'Verlauf', 'Zuletzt gescannte Artikel (bis zu 20)'], ['ℹ️', 'Anleitung', 'Diese Hilfe-Seite']].map(([ico, name, desc], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{ico}</span>
              <div>
                <div style={{ fontSize: F(13), fontWeight: 700, color: T.ink }}>{name}</div>
                <div style={{ fontSize: F(12), color: T.mute }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 — Scannen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#0e7c8b', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>3</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Tab „Scannen"</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['📷', 'Kamera starten', 'Auf den blauen Button tippen. Barcode mittig im Rahmen halten — wird automatisch erkannt.'], ['⌨️', 'Manuell eingeben', 'Kein Barcode lesbar? EAN oder Artikelnummer eintippen und auf „Suchen" tippen.'], ['🕐', 'Zuletzt gescannt', 'Die letzten 3 Artikel erscheinen direkt unter der Kamera.']].map(([ico, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: standortAccent, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* 4 — Suche */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#166534', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>4</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Tab „Suche"</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['✏️', 'Wonach suchen?', 'Produktname, Marke, Artikelnummer oder EAN. Mindestens 2 Zeichen eingeben.'], ['🏷️', 'Marke filtern', 'Horizontale Scroll-Leiste mit Marken — antippen zum Aktivieren, nochmal zum Aufheben.'], ['📂', 'Kategorie filtern', 'Zweite Leiste mit Kategorien (Schnorchel, Masken, Flossen …).'], ['📊', 'Ergebnisse', 'Zeigt bis zu 40 Treffer. Mehr? „Mehr laden"-Button antippen oder Suche verfeinern.']].map(([ico, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: standortAccent, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* 5 — Detailansicht */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#7c2d12', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>5</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Artikeldetails</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['💰', 'Preis & Rabatt', 'Regulärer Preis oder Aktionspreis (rot, mit durchgestrichenem Original und Prozentbadge).'], ['📦', 'Bestand nach Standort', 'Chips für alle 5 Standorte — der aktive Standort ist farbig hervorgehoben.'], ['📐', 'Ausführungen', 'Bei Varianten (Größen/Farben) werden alle Ausführungen mit Bestand angezeigt. Gescannte Variante wird oben blau hervorgehoben.'], ['🌐', 'Onlineshop-Button', 'Unten: „Onlineshop" öffnet den Artikel direkt auf atlantis-onlineshop.de.']].map(([ico, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: standortAccent, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* 6 — Verlauf */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#581c87', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>6</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Tab „Verlauf"</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['📋', 'Was wird gespeichert?', 'Alle gescannten und angesehenen Artikel — bis zu 20, neueste zuerst, mit Uhrzeit-Stempel.'], ['🗑️', 'Verlauf leeren', 'Oben rechts gibt es einen „Leeren"-Button.']].map(([ico, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: standortAccent, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* 7 — Standort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#374151', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>7</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Standort wechseln</span>
        </div>
        <div style={{ background: T.dark ? `${standortAccent}18` : '#eef3fb', border: `1px solid ${standortAccent}44`, borderRadius: T.radius, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📍</span>
          <div>
            <div style={{ fontSize: F(13), fontWeight: 700, color: T.ink, marginBottom: 3 }}>Immer oben rechts sichtbar</div>
            <p style={{ fontSize: F(12), color: T.mute, lineHeight: 1.55 }}>Farbiger Standort-Badge oben rechts in jedem Tab. Antippen zum Wechseln — der Bestand passt sich überall automatisch an.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
          {STANDORTE.map((s) => {
            const col = T.dark ? s.accentDark : s.accent;
            return (
              <div key={s.key} style={{ background: T.dark ? `${col}18` : `${col}0a`, border: `1.5px solid ${col}44`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, flexShrink: 0 }} />
                <span style={{ fontSize: F(13), fontWeight: 700, color: col }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* 8 — Bestandsampel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: standortAccent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>8</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Bestandsampel</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['🟢', T.stock.ok, 'Grün — genug da', 'Mehr als 2 Stück an diesem Standort.'], ['🟡', T.stock.low, 'Gelb — wenig Bestand', '1 oder 2 Stück — bald ausverkauft.'], ['🔴', T.stock.out, 'Rot — nicht verfügbar', '0 Stück. Ggf. andere Standorte oder Gesamtbestand prüfen.']].map(([ico, col, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: col, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* Schnellstart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: T.gap * 2 }}>
          <div style={{ width: 32, height: 32, background: '#0e7c8b', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: F(13), fontWeight: 700 }}>✓</span>
          </div>
          <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>Schnellstart für heute</span>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: T.gap * 2 }}>
          {[['1', 'App öffnen', 'Im Browser scanner.atlantis-berlin.de aufrufen — oder App-Icon antippen.'], ['2', 'Standort prüfen', 'Oben rechts sollte der richtige Standort angezeigt sein. Falls nicht: antippen und wechseln.'], ['3', 'Kamera erlauben', 'Beim ersten Start einmalig „Erlauben" antippen wenn der Browser nach Kamerazugriff fragt.'], ['4', 'Artikel scannen oder suchen', 'Barcode vor die Kamera halten oder Tab „Suche" öffnen und lostippen. Fertig!']].map(([n, title, desc], i) => (
            <div key={n} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px dashed ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, background: T.dark ? 'rgba(255,255,255,0.1)' : '#eef3fb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: F(12), fontWeight: 700, color: standortAccent }}>{n}</div>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: T.ink, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: F(11), color: T.mute, paddingBottom: 8, lineHeight: 1.6 }}>
          Atlantis Berlin Wassersport &amp; Mee(h)r · Interne App-Anleitung<br />
          <a href="mailto:developer@atlantis-berlin.de" style={{ color: standortAccent, textDecoration: 'none' }}>developer@atlantis-berlin.de</a>
        </div>

      </div>
    </div>
  );

  // ── Tab-Bar ───────────────────────────────────────────────────
  const TabBtn = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
        {icon(active ? standortAccent : T.mute, 24)}
        <span style={{ fontSize: F(11), fontWeight: active ? 700 : 500, color: active ? standortAccent : T.mute }}>{label}</span>
      </button>
    );
  };

  const AccentStrip = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: standortAccent, borderRadius: '3px 3px 0 0' }} />
  );

  return (
    <div style={{ height: '100%', position: 'relative', background: T.bg, color: T.ink }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 64 }}>
          {tab === 'scan'    && scanTab}
          {tab === 'search'  && searchTab}
          {tab === 'history' && historyTab}
          {tab === 'info'    && infoTab}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9, background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `1px solid ${T.border}`, paddingBottom: padBotTabs, display: 'flex' }}>
        <AccentStrip />
        <TabBtn id="scan"    label="Scannen"   icon={Icon.scan} />
        <TabBtn id="search"  label="Suche"     icon={Icon.search} />
        <TabBtn id="history" label="Verlauf"   icon={Icon.history} />
        <TabBtn id="info"    label="Anleitung" icon={(c, s) => (
          <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"/>
            <path d="M12 11v5M12 8h.01" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, transform: detail ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s cubic-bezier(.22,1,.36,1)', pointerEvents: detail ? 'auto' : 'none' }}>
        {detailScreen}
      </div>
      {showStandortPicker && <StandortPicker />}
    </div>
  );
}

window.ScannerC = ScannerC;
window.SCANNER_ACCENTS = ACCENTS;
window.SCANNER_STANDORTE = STANDORTE;
