"use client";
import { useState } from "react";
import { rupiah } from "@/lib/db";

export default function FeeCalc() {
  const [amt, setAmt] = useState(100000);
  const a = Number(amt) || 0;
  return (
    <div className="calc">
      <h3 style={{ fontSize: 22, marginBottom: 12 }}>Hitung biaya penarikan</h3>
      <label htmlFor="calc-amt">Nominal yang ingin ditarik (Rp)</label>
      <input id="calc-amt" className="input" type="number" min="0" step="10000" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ maxWidth: 280 }} />
      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="kpi"><div className="l">Paket Free, biaya 5%</div><div className="v">{rupiah(a * 0.95)}</div><div className="small muted">Potongan {rupiah(a * 0.05)}</div></div>
        <div className="kpi hl"><div className="l">Paket Pro, biaya 2%</div><div className="v">{rupiah(a * 0.98)}</div><div className="small" style={{ color: "#e3f3fd" }}>Potongan {rupiah(a * 0.02)}</div></div>
      </div>
    </div>
  );
}
