// Detailansicht: CopyBtn, StandortChips, SiblingsNew, DetailView
/* global React, ATLANTIS, AUI */

function CopyBtn({ text, T }) {
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
}

function StandortChips({ locs, stockFallback = 0, darkBg = false, T, F, standort, standortAccent, STANDORTE, ALL_LOC_KEYS }) {
  const hasLocs = !!locs;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4 }}>
      {ALL_LOC_KEYS.map((locKey) => {
        const sd     = STANDORTE.find((s) => s.key === locKey) || { key: locKey, label: locKey };
        const home   = locKey === standort.key;
        const n      = hasLocs ? (locs[locKey] ?? 0) : (home ? stockFallback : null);
        const noData = !hasLocs && !home;
        const numCol = darkBg
          ? (noData ? 'rgba(255,255,255,0.35)' : n === 0 ? '#ff8a8a' : n <= 2 ? '#ffd080' : '#6ee7a0')
          : (noData ? T.mute : n === 0 ? T.stock.out : n <= 2 ? T.stock.low : T.stock.ok);
        const lc     = darkBg ? 'rgba(255,255,255,0.75)' : (home ? standortAccent : T.mute);
        const subCol = darkBg ? 'rgba(255,255,255,0.5)'  : (home ? standortAccent : T.mute);
        return (
          <div key={locKey} style={{
            background: darkBg
              ? (home ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)')
              : (home ? (T.dark ? `${standortAccent}28` : `${standortAccent}14`) : (T.dark ? 'rgba(255,255,255,0.06)' : 'var(--color-background-secondary)')),
            borderRadius: 6,
            border: darkBg
              ? (home ? '1.5px solid rgba(255,255,255,0.7)' : '0.5px solid rgba(255,255,255,0.2)')
              : (home ? `1.5px solid ${standortAccent}` : `0.5px solid ${T.border}`),
            padding: '4px 2px', textAlign: 'center', opacity: noData ? 0.45 : 1,
          }}>
            <div style={{ fontSize: 9, color: lc, fontWeight: home ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sd.shortLabel}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: noData ? subCol : numCol, lineHeight: 1.2, marginTop: 1 }}>{noData ? '–' : n}</div>
            <div style={{ fontSize: 9, color: subCol, marginTop: 0 }}>{noData ? 'n/a' : 'Stk'}</div>
          </div>
        );
      })}
    </div>
  );
}

function SiblingsNew({ siblings, currentEan, T, F, standort, standortAccent, STANDORTE, ALL_LOC_KEYS }) {
  if (!siblings || siblings.length === 0) return null;
  const { EUR } = ATLANTIS;

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
    const label   = [color, size].filter(Boolean).join(' · ') || sp.name;
    const onSale  = sp.sale != null && sp.sale > sp.price;
    const hasLocs = !!sp.locs;
    const stock   = hasLocs ? (sp.locs[standort.key] ?? 0) : (sp.stock ?? 0);
    const shopUrl = sp.shopUrl || null;
    return (
      <div style={{ padding: `${F(10)}px ${F(12)}px`, borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AUI.ProductPhoto product={sp} dark={T.dark} radius={8} style={{ width: F(48), height: F(48), flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: F(13), fontWeight: 500, color: T.ink }}>{label}</span>
            {sp.price > 0 && <span style={{ fontSize: F(12), fontWeight: 500, color: onSale ? T.red : standortAccent, flexShrink: 0 }}>{EUR(sp.price)}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: sp.aktionsangebote?.[standort.key] ? 4 : 7 }}>
            <span style={{ fontSize: F(10), color: T.mute, fontFamily: 'ui-monospace,Menlo,monospace' }}>{sp.art}</span>
            <CopyBtn text={sp.art} T={T} />
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
              <span style={{ fontSize: F(11), color: '#633806', fontWeight: 500 }}>{sp.aktionsangebote[standort.key]}</span>
            </div>
          )}
          <StandortChips locs={sp.locs} stockFallback={stock} T={T} F={F} standort={standort} standortAccent={standortAccent} STANDORTE={STANDORTE} ALL_LOC_KEYS={ALL_LOC_KEYS} />
        </div>
      </div>
    );
  };

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
          <StandortChips locs={currentSlave.locs} stockFallback={currentSlave.stock ?? 0} darkBg={true} T={T} F={F} standort={standort} standortAccent={standortAccent} STANDORTE={STANDORTE} ALL_LOC_KEYS={ALL_LOC_KEYS} />
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

function DetailView({ detail, onClose, onScanNext, goToAktionen, T, F, standort, standortAccent, STANDORTE, ALL_LOC_KEYS, slaveToMaster, productByArt, getSiblings, getStock, getTotalStock, padTopDet, padBotBtn, messeMode = false, onAddToCart = null, messeStock = null }) {
  const { EUR, stockState } = ATLANTIS;
  const { Icon, ProductPhoto } = AUI;
  const [messeQty, setMesseQty] = React.useState(1);
  const [cartFeedback, setCartFeedback] = React.useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(detail, messeQty);
      setCartFeedback(true);
      setTimeout(() => setCartFeedback(false), 1200);
    }
  };

  const Tile      = ({ children }) => <div style={{ background: T.card, borderRadius: T.radius, padding: T.pad, border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>{children}</div>;
  const TileLabel = ({ icon, children }) => <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 5 }}>{icon(T.mute, 14)} {children}</div>;

  const onSale = detail.sale != null && detail.sale > detail.price;
  const save   = onSale ? Math.round((1 - detail.price / detail.sale) * 100) : 0;

  const stock      = getStock(detail);
  const stockTotal = getTotalStock(detail);
  const stockSt    = stockState(stock);

  const masterProduct = !detail.isMaster
    ? slaveToMaster[String(detail.art || '').trim().toLowerCase()]
      || (detail.masterArt ? productByArt[detail.masterArt.toLowerCase()] : null)
    : null;
  const masterShopUrl = masterProduct ? (masterProduct.shopUrl || null) : null;
  const siblings      = masterProduct ? getSiblings(masterProduct) : [];
  const shopBtnUrl    = detail.shopUrl || (!detail.isMaster ? masterShopUrl : null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>

      {/* Header */}
      <div style={{ background: T.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        paddingTop: padTopDet, paddingLeft: 12, paddingRight: 12, paddingBottom: 11,
        display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 11, border: 'none', cursor: 'pointer', background: `${standortAccent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.back(standortAccent, 22)}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: F(11), color: T.mute, textTransform: 'uppercase', letterSpacing: 1 }}>{detail.brand} · {detail.cat}</div>
          <div style={{ fontSize: F(15), fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{detail.name}</div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: standortAccent, flexShrink: 0 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: T.pad }}>

        {/* Foto + Name + IDs */}
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
                <span>Art. {detail.art}</span><CopyBtn text={detail.art || ''} T={T} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: F(11), color: T.mute }}>
                <span>EAN {detail.ean}</span><CopyBtn text={detail.ean || ''} T={T} />
              </div>
            </div>
          </div>
        </div>

        {/* Aktionsbanner */}
        {detail.aktionsangebote?.[standort.key] && (
          <div onClick={goToAktionen}
            style={{ marginTop: T.gap, borderRadius: T.radius, padding: '10px 14px', background: '#DAA520', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="7" y1="7" x2="7.01" y2="7" stroke="#3d2b00" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: F(10), fontWeight: 700, color: '#5a3e00', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Aktionsangebot</div>
              <div style={{ fontSize: F(13), fontWeight: 600, color: '#3d2b00', lineHeight: 1.3 }}>{detail.aktionsangebote[standort.key]}</div>
            </div>
            <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: F(11), color: '#3d2b00', fontWeight: 700 }}>Alle</span>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#3d2b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        )}

        {/* KPI: Preis + Bestand */}
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
                <div style={{ fontSize: F(24), fontWeight: 800, color: onSale ? T.red : standortAccent, marginTop: 6, lineHeight: 1 }}>{EUR(detail.price)}</div>
                {onSale
                  ? <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: F(12), color: T.mute, textDecoration: 'line-through' }}>{EUR(detail.sale)}</span>
                      <span style={{ fontSize: F(11), fontWeight: 700, color: '#fff', background: T.red, padding: '1px 6px', borderRadius: 5 }}>−{save}%</span>
                    </div>
                  : <div style={{ marginTop: 5, fontSize: F(12), color: T.mute }}>inkl. MwSt.</div>}
              </>
            )}
          </Tile>
          <Tile>
            {messeMode
              ? (<>
                  <TileLabel icon={Icon.box}>Messe-Lager</TileLabel>
                  <div style={{ fontSize: F(24), fontWeight: 800, color: messeStock > 0 ? '#b8860b' : T.stock.out, marginTop: 6, lineHeight: 1 }}>
                    {messeStock != null ? messeStock : '–'}<span style={{ fontSize: F(13), fontWeight: 600, color: T.mute }}> Stk</span>
                  </div>
                  <div style={{ marginTop: 5, fontSize: F(11), color: T.mute }}>Messe-Bestand</div>
                </>)
              : (<>
                  <TileLabel icon={Icon.box}>Bestand · {standort.label}</TileLabel>
                  <div style={{ fontSize: F(24), fontWeight: 800, color: T.stock[stockSt], marginTop: 6, lineHeight: 1 }}>
                    {stock}<span style={{ fontSize: F(13), fontWeight: 600, color: T.mute }}> Stk</span>
                  </div>
                  <div style={{ marginTop: 5, fontSize: F(11), color: T.mute }}>vor Ort · {stockTotal} gesamt</div>
                  <div style={{ marginTop: 7, height: 6, borderRadius: 6, background: T.dark ? 'rgba(255,255,255,0.1)' : '#e7ecf3', overflow: 'hidden' }}>
                    <div style={{ width: `${stockTotal ? Math.round((stock / stockTotal) * 100) : 0}%`, height: '100%', background: T.stock[stockSt], borderRadius: 6 }} />
                  </div>
                </>)
            }
          </Tile>
        </div>

        {/* Bestand nach Standort — nur für Einzelartikel ohne Geschwister */}
        {detail.locs && siblings.length === 0 && (
          <div style={{ background: T.card, borderRadius: T.radius, padding: T.pad, marginTop: T.gap, border: `1px solid ${T.border}`, boxShadow: T.tileShadow }}>
            <TileLabel icon={Icon.box}>Bestand nach Standort</TileLabel>
            <div style={{ marginTop: 10 }}>
              <StandortChips locs={detail.locs} stockFallback={getStock(detail)} T={T} F={F} standort={standort} standortAccent={standortAccent} STANDORTE={STANDORTE} ALL_LOC_KEYS={ALL_LOC_KEYS} />
            </div>
          </div>
        )}

        {/* Geschwister */}
        {siblings.length > 0 && (
          <SiblingsNew siblings={siblings} currentEan={detail._scannedEan} T={T} F={F} standort={standort} standortAccent={standortAccent} STANDORTE={STANDORTE} ALL_LOC_KEYS={ALL_LOC_KEYS} />
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
          {masterProduct && (
            masterShopUrl ? (
              <a href={masterShopUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: `${T.pad - 4}px ${T.pad}px`, borderTop: `1px solid ${T.border}`, textDecoration: 'none', cursor: 'pointer', background: T.dark ? `${standortAccent}0d` : `${standortAccent}07` }}>
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

      {/* Button-Leiste */}
      {messeMode ? (
        <div style={{ paddingTop: 11, paddingLeft: T.pad, paddingRight: T.pad, paddingBottom: padBotBtn, background: T.bg, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            {/* Qty stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(218,165,32,.1)', borderRadius: 12, border: '1.5px solid rgba(218,165,32,.35)', overflow: 'hidden', flexShrink: 0 }}>
              <button onClick={() => setMesseQty(q => Math.max(1, q - 1))}
                style={{ width: 40, height: 46, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#8a6000', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <input type="number" min={1} value={messeQty}
                onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setMesseQty(v); }}
                style={{ width: 44, height: 46, border: 'none', background: 'transparent', textAlign: 'center', fontSize: F(16), fontWeight: 800, color: '#8a6000', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => setMesseQty(q => q + 1)}
                style={{ width: 40, height: 46, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#8a6000', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button onClick={handleAddToCart}
              style={{ flex: 1, height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', background: cartFeedback ? '#1f8a4c' : '#DAA520', color: '#fff', fontSize: F(15), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'background 0.2s' }}>
              {cartFeedback
                ? <><svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Hinzugefügt</>
                : <>🛒 In den Warenkorb</>
              }
            </button>
          </div>
          <button onClick={onScanNext}
            style={{ width: '100%', height: 44, borderRadius: 14, border: '1.5px solid rgba(218,165,32,.4)', cursor: 'pointer', background: 'transparent', color: '#8a6000', fontSize: F(14), fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
            {Icon.scan('#8a6000', 18)} Weiter scannen
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 11, paddingLeft: T.pad, paddingRight: T.pad, paddingBottom: padBotBtn, background: T.bg, borderTop: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 10 }}>
          {shopBtnUrl && (
            <a href={shopBtnUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, height: 50, borderRadius: 14, border: `1.5px solid ${standortAccent}55`, background: `${standortAccent}0e`, color: standortAccent, fontSize: F(14), fontWeight: 800, textDecoration: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={standortAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3h6v6M10 14L21 3" stroke={standortAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Onlineshop
            </a>
          )}
          <button onClick={onScanNext}
            style={{ flex: shopBtnUrl ? 1 : undefined, width: shopBtnUrl ? undefined : '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', background: standortAccent, color: T.dark ? '#06131f' : '#fff', fontSize: F(16), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
            {Icon.scan(T.dark ? '#06131f' : '#fff', 20)} Nächsten Artikel scannen
          </button>
        </div>
      )}
    </div>
  );
}

window.DetailView = DetailView;
