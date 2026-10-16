"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDB, rupiah, uid, saveDB, loadDB } from "@/lib/db";

export default function StorePage() {
  const { username } = useParams();
  const [db] = useDB();
  const [pick, setPick] = useState(null);
  const store = db ? db.stores.find((s) => s.username === username) : null;
  const seller = store ? db.users.find((u) => u.id === store.userId) : null;

  useEffect(() => {
    if (!store) return;
    const k = "loka_seen_" + store.userId;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    const ref = (new URLSearchParams(window.location.search).get("ref") || "Langsung");
    const d = loadDB();
    d.visits.push({ id: uid("v"), sellerId: store.userId, productId: null, source: ref, ts: Date.now() });
    saveDB(d);
  }, [store]);

  if (!db) return <div className="storepage" />;
  if (!store || seller?.suspended) {
    return (
      <div className="authwrap"><div className="authbox" style={{ textAlign: "center" }}>
        <h1>Toko tidak ditemukan</h1>
        <p className="muted" style={{ margin: "8px 0 18px" }}>Periksa kembali link tokonya, atau buat tokomu sendiri.</p>
        <Link href="/register" className="btn btn-primary">Buat toko gratis</Link>
      </div></div>
    );
  }

  const products = db.products.filter((p) => p.sellerId === store.userId && p.active);
  const openProduct = (p) => {
    const d = loadDB();
    d.visits.push({ id: uid("v"), sellerId: store.userId, productId: p.id, source: new URLSearchParams(window.location.search).get("ref") || "Langsung", ts: Date.now() });
    saveDB(d);
    setPick(p);
  };
  const soc = store.socials || {};

  return (
    <div className="storepage" style={{ "--store": store.color }}>
      <div className="storebox">
        <div className="storehead">
          <div className="av">{store.name.charAt(0).toUpperCase()}</div>
          <h1>{store.name} {seller?.plan === "pro" && <span className="badge pro" style={{ verticalAlign: "middle" }}>Pro</span>}</h1>
          {store.bio && <p className="muted" style={{ marginTop: 6 }}>{store.bio}</p>}
          <div className="socials">
            {soc.instagram && <a href={soc.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {soc.tiktok && <a href={soc.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
            {soc.whatsapp && <a href={soc.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </div>
        {(store.links || []).map((l) => <a key={l.id} className="sl" href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a>)}
        {products.length === 0 && <div className="card empty">Belum ada produk.</div>}
        {products.map((p) => (
          <button key={p.id} className="sp" onClick={() => openProduct(p)}>
            <div className="th">{p.type.charAt(0)}</div>
            <div><div className="t">{p.name}</div><div className="small muted">{p.type}</div></div>
            <div className="pr">{rupiah(p.price)}</div>
          </button>
        ))}
        <div className="poweredby">Dibuat dengan <Link href="/" style={{ fontWeight: 700, color: "var(--blue-d)" }}>LOKA</Link></div>
      </div>
      {pick && <Checkout product={pick} store={store} onClose={() => setPick(null)} />}
    </div>
  );
}

function Checkout({ product, store, onClose }) {
  const [f, setF] = useState({ name: "", email: "", method: "QRIS" });
  const [done, setDone] = useState(null);
  const pay = (e) => {
    e.preventDefault();
    // SIMULASI. Di produksi: buat invoice di penyedia pembayaran, lalu tunggu webhook sebelum status "paid".
    const d = loadDB();
    const order = { id: "LK-" + Math.random().toString(36).slice(2, 8).toUpperCase(), sellerId: store.userId, productId: product.id, productName: product.name, buyerName: f.name.trim(), buyerEmail: f.email.trim(), amount: product.price, status: "paid", method: f.method, createdAt: Date.now() };
    d.orders.push(order); saveDB(d); setDone(order);
  };
  return (
    <div className="modalbg" onClick={onClose} role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {!done ? (
          <form onSubmit={pay}>
            <div className="row between"><h2 style={{ fontSize: 24 }}>Checkout</h2><button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button></div>
            <div className="card" style={{ margin: "16px 0", background: "var(--mist)" }}>
              <b>{product.name}</b><p className="small muted">{product.description}</p>
              <div style={{ font: "700 22px var(--fd)", marginTop: 6 }}>{rupiah(product.price)}</div>
            </div>
            <div className="field"><label htmlFor="bn">Nama</label><input id="bn" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="be">Email</label><input id="be" className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /><div className="hint">Bukti pembelian dikirim ke email ini.</div></div>
            <div className="field"><label htmlFor="bm">Metode pembayaran</label>
              <select id="bm" className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}><option>QRIS</option><option>Virtual Account</option><option>E-wallet</option></select></div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 18 }}>Bayar {rupiah(product.price)}</button>
            <p className="hint" style={{ textAlign: "center" }}>Mode demo: pembayaran disimulasikan.</p>
          </form>
        ) : (
          <div className="stack" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 26 }}>Pembayaran berhasil</h2>
            <p className="muted">Nomor pesanan <b>{done.id}</b></p>
            <a className="btn btn-primary btn-block" href={product.fileUrl} target="_blank" rel="noopener noreferrer">Buka produk</a>
            <button className="btn btn-ghost btn-block" onClick={onClose}>Selesai</button>
          </div>
        )}
      </div>
    </div>
  );
}
