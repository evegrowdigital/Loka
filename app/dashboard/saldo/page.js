"use client";
import { useState } from "react";
import DashShell from "@/components/DashShell";
import { rupiah, balanceFor, feeRate, uid, fullDate, loadDB, MIN_WITHDRAW } from "@/lib/db";

function View({ s }) {
  const { db, user, update } = s;
  const bal = balanceFor(db, user.id);
  const rate = feeRate(db, user);
  const [f, setF] = useState({ amount: "", bank: "", account: "", holder: "" });
  const [msg, setMsg] = useState(null);
  const amt = Number(f.amount) || 0;
  const fee = Math.round(amt * rate);
  const hist = db.withdrawals.filter((w) => w.sellerId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  const submit = (e) => {
    e.preventDefault();
    const cur = balanceFor(loadDB(), user.id); // baca ulang untuk mencegah penarikan ganda
    if (amt < MIN_WITHDRAW) return setMsg({ bad: `Penarikan minimal ${rupiah(MIN_WITHDRAW)}.` });
    if (amt > cur.available) return setMsg({ bad: "Saldo tidak mencukupi." });
    if (!/^[0-9]{6,20}$/.test(f.account)) return setMsg({ bad: "Nomor rekening harus 6-20 digit angka." });
    update((d) => {
      const latest = balanceFor(d, user.id);
      if (amt > latest.available) return;
      d.withdrawals.push({ id: uid("w"), sellerId: user.id, amount: amt, fee, net: amt - fee, rate, bank: f.bank, account: f.account, holder: f.holder, status: "diproses", createdAt: Date.now() });
    });
    setF({ amount: "", bank: "", account: "", holder: "" });
    setMsg({ ok: "Permintaan penarikan dikirim dan sedang diproses." });
  };

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi hl"><div className="l">Saldo tersedia</div><div className="v">{rupiah(bal.available)}</div></div>
        <div className="kpi"><div className="l">Sedang diproses</div><div className="v">{rupiah(bal.processing)}</div></div>
        <div className="kpi"><div className="l">Total pendapatan</div><div className="v">{rupiah(bal.earned)}</div></div>
        <div className="kpi"><div className="l">Total biaya penarikan</div><div className="v">{rupiah(bal.feePaid)}</div></div>
        <div className="kpi"><div className="l">Dana tercairkan (bersih)</div><div className="v">{rupiah(bal.netPaid)}</div></div>
      </div>

      <div className="card">
        <div className="row between wrap"><h3>Tarik saldo</h3><span className={"badge " + (user.plan === "pro" ? "pro" : "")}>Paket {user.plan === "pro" ? "Pro" : "Free"} · biaya {rate * 100}%</span></div>
        <form onSubmit={submit}>
          <div className="grid2">
            <div className="field"><label htmlFor="wa">Nominal (Rp)</label><input id="wa" className="input" type="number" min={MIN_WITHDRAW} step="1000" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
            <div className="field"><label htmlFor="wb">Bank atau e-wallet</label><input id="wb" className="input" required placeholder="BCA, BRI, DANA, ..." value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
            <div className="field"><label htmlFor="wn">Nomor rekening</label><input id="wn" className="input" inputMode="numeric" required value={f.account} onChange={(e) => setF({ ...f, account: e.target.value.replace(/\D/g, "") })} /></div>
            <div className="field"><label htmlFor="wh">Nama pemilik rekening</label><input id="wh" className="input" required value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} /></div>
          </div>
          {amt > 0 && <div className="okmsg" style={{ marginTop: 14 }}>Biaya penarikan {rate * 100}%: <b>{rupiah(fee)}</b>. Dana yang kamu terima: <b>{rupiah(amt - fee)}</b>.</div>}
          {msg?.bad && <div className="err" style={{ marginTop: 14 }} role="alert">{msg.bad}</div>}
          {msg?.ok && <div className="okmsg" style={{ marginTop: 14 }} role="status">{msg.ok}</div>}
          <div className="row wrap" style={{ marginTop: 16 }}>
            <button className="btn btn-primary">Ajukan penarikan</button>
            {user.plan !== "pro" && <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Upgrade ke Pro (demo)? Biaya penarikan turun menjadi ${db.settings.feePro * 100}%.`)) update((d) => { d.users.find((u) => u.id === user.id).plan = "pro"; }); }}>Upgrade ke Pro</button>}
          </div>
          <p className="hint">Penarikan minimal {rupiah(MIN_WITHDRAW)}. Biaya ini adalah biaya layanan pencairan LOKA.</p>
        </form>
      </div>

      <div className="card tablewrap">
        <h3>Riwayat penarikan</h3>
        {hist.length === 0 ? <div className="empty">Belum ada penarikan.</div> : (
          <table>
            <thead><tr><th>Tanggal</th><th>Nominal</th><th>Biaya</th><th>Diterima</th><th>Rekening</th><th>Status</th></tr></thead>
            <tbody>{hist.map((w) => <tr key={w.id}><td>{fullDate(w.createdAt)}</td><td>{rupiah(w.amount)}</td><td>{rupiah(w.fee)}</td><td><b>{rupiah(w.net)}</b></td><td>{w.bank} {w.account}</td><td><span className={"badge " + (w.status === "berhasil" ? "ok" : w.status === "ditolak" ? "bad" : "wait")}>{w.status}</span></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default function Saldo() { return <DashShell title="Saldo" subtitle="Kelola penghasilan dan penarikan dana.">{(s) => <View s={s} />}</DashShell>; }
