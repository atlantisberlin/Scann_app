// Anleitung-Tab
/* global React */

function InfoTab({ T, F, standort, standortAccent, STANDORTE, Header }) {
  const [infoOS, setInfoOS] = React.useState('ios');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header title="Anleitung" sub="Atlantis Scan · Kurzguide" />
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: T.pad }}>

        {/* Hinweis-Box */}
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b55', borderLeft: `4px solid #f59e0b`, borderRadius: T.radius, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: T.gap * 2 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>☀️</span>
          <p style={{ fontSize: F(13), color: '#78350f', lineHeight: 1.55 }}><strong>Sommerfest-Premiere!</strong> Wir testen die App heute zum ersten Mal gemeinsam im Alltagseinsatz. Einfach ausprobieren, Fragen stellen und Feedback geben — so machen wir sie noch besser.</p>
        </div>

        {/* 0 — Einrichtung */}
        <SectionHeader number="0" color="#0e7c8b" title="Einmalige Einrichtung" standortAccent={standortAccent} F={F} />
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
          ]).map(([n, title, desc], i) => (
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
        <SectionHeader number="1" color={standortAccent} title="Was kann die App?" standortAccent={standortAccent} F={F} />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 10 }}>
          <p style={{ fontSize: F(13), color: T.ink, lineHeight: 1.65, marginBottom: 10 }}><strong>Atlantis Scan</strong> ist unser internes Tool zum schnellen Nachschlagen von Artikeln. Barcodes scannen oder nach Produkten suchen — sofort Preis und Lagerbestand nach Standort.</p>
          <div style={{ background: '#fff5f5', border: '1px solid #fca5a555', borderLeft: `4px solid ${T.red}`, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: F(12), color: '#7f1d1d', lineHeight: 1.5 }}><strong>Nur lesen, nicht schreiben:</strong> Bestände können in der App nicht geändert werden. Sie ist ein Nachschlage-Tool, kein Warenwirtschaftssystem.</p>
          </div>
        </div>

        {/* 2 — Tabs */}
        <SectionHeader number="2" color={standortAccent} title="Aufbau: 4 Tabs" standortAccent={standortAccent} F={F} top={T.gap * 2} />
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
        <SectionHeader number="3" color="#0e7c8b" title={'Tab „Scannen"'} standortAccent={standortAccent} F={F} top={T.gap * 2} />
        <InfoList T={T} F={F} items={[
          ['📷', 'Kamera starten', 'Auf den blauen Button tippen. Barcode mittig im Rahmen halten — wird automatisch erkannt.'],
          ['⌨️', 'Manuell eingeben', 'Kein Barcode lesbar? EAN oder Artikelnummer eintippen und auf „Suchen" tippen.'],
          ['🕐', 'Zuletzt gescannt', 'Die letzten 3 Artikel erscheinen direkt unter der Kamera.'],
        ]} standortAccent={standortAccent} />

        {/* 4 — Suche */}
        <SectionHeader number="4" color="#166534" title={'Tab „Suche"'} standortAccent={standortAccent} F={F} top={T.gap * 2} />
        <InfoList T={T} F={F} items={[
          ['✏️', 'Wonach suchen?', 'Produktname, Marke, Artikelnummer oder EAN. Mindestens 2 Zeichen eingeben.'],
          ['🏷️', 'Marke filtern', 'Horizontale Scroll-Leiste mit Marken — antippen zum Aktivieren, nochmal zum Aufheben.'],
          ['📂', 'Kategorie filtern', 'Zweite Leiste mit Kategorien (Schnorchel, Masken, Flossen …).'],
          ['📊', 'Ergebnisse', 'Zeigt bis zu 40 Treffer. Mehr? „Mehr laden"-Button antippen oder Suche verfeinern.'],
        ]} standortAccent={standortAccent} />

        {/* 5 — Detailansicht */}
        <SectionHeader number="5" color="#7c2d12" title="Artikeldetails" standortAccent={standortAccent} F={F} top={T.gap * 2} />
        <InfoList T={T} F={F} items={[
          ['💰', 'Preis & Rabatt', 'Regulärer Preis oder Aktionspreis (rot, mit durchgestrichenem Original und Prozentbadge).'],
          ['📦', 'Bestand nach Standort', 'Chips für alle 5 Standorte — der aktive Standort ist farbig hervorgehoben.'],
          ['📐', 'Ausführungen', 'Bei Varianten (Größen/Farben) werden alle Ausführungen mit Bestand angezeigt. Gescannte Variante wird oben blau hervorgehoben.'],
          ['🌐', 'Onlineshop-Button', 'Unten: „Onlineshop" öffnet den Artikel direkt auf atlantis-onlineshop.de.'],
        ]} standortAccent={standortAccent} />

        {/* 6 — Verlauf */}
        <SectionHeader number="6" color="#581c87" title={'Tab „Verlauf"'} standortAccent={standortAccent} F={F} top={T.gap * 2} />
        <InfoList T={T} F={F} items={[
          ['📋', 'Was wird gespeichert?', 'Alle gescannten und angesehenen Artikel — bis zu 20, neueste zuerst, mit Uhrzeit-Stempel.'],
          ['🗑️', 'Verlauf leeren', 'Oben rechts gibt es einen „Leeren"-Button.'],
        ]} standortAccent={standortAccent} />

        {/* 7 — Standort */}
        <SectionHeader number="7" color="#374151" title="Standort wechseln" standortAccent={standortAccent} F={F} top={T.gap * 2} />
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
        <SectionHeader number="8" color={standortAccent} title="Bestandsampel" standortAccent={standortAccent} F={F} top={T.gap * 2} />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
          {[['🟢', T.stock.ok, 'Grün — genug da', 'Mehr als 2 Stück an diesem Standort.'], ['🟡', T.stock.low, 'Gelb — wenig Bestand', '1 oder 2 Stück — bald ausverkauft.'], ['🔴', T.stock.out, 'Rot — nicht verfügbar', '0 Stück. Ggf. andere Standorte oder Gesamtbestand prüfen.']].map(([ico, col, title, desc], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
              <div><div style={{ fontSize: F(13), fontWeight: 700, color: col, marginBottom: 2 }}>{title}</div><div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>

        {/* Schnellstart */}
        <SectionHeader number="✓" color="#0e7c8b" title="Schnellstart für heute" standortAccent={standortAccent} F={F} top={T.gap * 2} />
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
}

function SectionHeader({ number, color, title, standortAccent, F, top = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: top }}>
      <div style={{ width: 32, height: 32, background: color, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: F(14), fontWeight: 700 }}>{number}</span>
      </div>
      <span style={{ fontSize: F(17), fontWeight: 800, color: standortAccent }}>{title}</span>
    </div>
  );
}

function InfoList({ T, F, items, standortAccent }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', marginBottom: 10 }}>
      {items.map(([ico, title, desc], i) => (
        <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center', marginTop: 2 }}>{ico}</span>
          <div>
            <div style={{ fontSize: F(13), fontWeight: 700, color: standortAccent, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: F(12), color: T.mute, lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

window.InfoTab = InfoTab;
