"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import { rupiah, uid, PRODUCT_TYPES } from "@/lib/db";

const BLANK = { name: "", type: "E-book", description: "", price: "", fileUrl: "", active: true };

export default function Produk() {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");

  return (
    <DashShell title="Produk" subtitle="Kelola produk yang dijual di tokomu." actions={<button className="btn btn-primary btn-sm" onClick={() => { setErr(""); setForm({ ...BLANK }); }}>Tambah produk</button>}>
      {({ db, user, update }) => {
        const list = db.products.filter((p) => p.sellerId === user.id);
        const save = (e) => {
          e.preventDefault();
          const price = Number(form.price);
          if (!(price >= 1000)) return setErr("Harga minimal Rp1.000.");
          update((d) => {
            if (form.id) { const i = d.products.findIndex((p) => p.id === form.id); d.products[i] = { ...d.products[i], ...form, price }; }
            else d.products.push({ ...form, id: uid("p"), sellerId: user.id, price });
          });
          setForm(null);
        };
        return (
          <div className="stack">
            {form && (
              <form className="card" onSubmit={save}>
                <h3>{form.id ? "Ubah produk" : "Produk baru"}</h3>
                <div className="field"><label htmlFor="pn">Nama produk</label><input id="pn" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid2">
                  <div className="field"><label htmlFor="pt">Jenis</label><select id="pt" className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div className="field"><label htmlFor="pp">Harga (Rp)</label><input id="pp" className="input" type="number" min="1000" step="1000" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                <div className="field"><label htmlFor="pd">Deskripsi</label><textarea id="pd" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="field"><label htmlFor="pf">Tautan file atau akses produk</label><input id="pf" className="input" type="url" placeholder="https://" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /><div className="hint">Pembeli menerima tautan ini setelah pembayaran berhasil.</div></div>
                {err && <div className="err" style={{ marginTop: 12 }} role="alert">{err}</div>}
                <div className="row" style={{ marginTop: 16 }}><button className="btn btn-primary">Simpan produk</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Batal</button></div>
              </form>
            )}
            <div className="card">
              {list.length === 0 ? <div className="empty">Belum ada produk. Tambahkan produk pertamamu.</div> : list.map((p) => (
                <div className="listrow wrap" key={p.id}>
                  <div style={{ flex: 1, minWidth: 180 }}><b>{p.name}</b> {!p.active && <span className="badge wait">Disembunyikan</span>}<div className="small muted">{p.type} · {rupiah(p.price)}</div></div>
                  <div className="row wrap">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setErr(""); setForm({ ...p }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Ubah</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => update((d) => { const x = d.products.find((q) => q.id === p.id); x.active = !x.active; })}>{p.active ? "Sembunyikan" : "Tampilkan"}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Hapus produk ini?")) update((d) => { d.products = d.products.filter((q) => q.id !== p.id); }); }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </DashShell>
  );
}
