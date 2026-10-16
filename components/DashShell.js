"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { useSession } from "@/lib/db";

const NAV = [
  ["/dashboard", "Ringkasan"],
  ["/dashboard/produk", "Produk"],
  ["/dashboard/pesanan", "Pesanan"],
  ["/dashboard/toko", "Toko"],
  ["/dashboard/statistik", "Statistik"],
  ["/dashboard/saldo", "Saldo"],
];

export default function DashShell({ title, subtitle, children, actions }) {
  const s = useSession("seller");
  const path = usePathname();
  const router = useRouter();
  if (!s.ready) return <div className="main muted">Memuat…</div>;
  const out = () => { s.update((d) => { d.session = null; }); router.push("/"); };
  const on = (h) => (h === "/dashboard" ? path === h : path.startsWith(h));
  return (
    <div className="shell">
      <aside className="side">
        <Logo href="/dashboard" />
        {NAV.map(([h, l]) => <Link key={h} href={h} className={"nav" + (on(h) ? " on" : "")}>{l}</Link>)}
        <div style={{ marginTop: "auto" }} className="stack">
          <div className="small muted" style={{ padding: "0 8px" }}>{s.user.name}<br />Paket <b>{s.user.plan === "pro" ? "Pro" : "Free"}</b></div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={out}>Keluar</button>
        </div>
      </aside>
      <main className="main">
        <div className="pagehead row between wrap">
          <div><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>
          <div className="row">{actions}<button className="btn btn-ghost btn-sm mobonly" onClick={out}>Keluar</button></div>
        </div>
        {typeof children === "function" ? children(s) : children}
      </main>
      <nav className="mobbar" aria-label="Menu utama">
        {NAV.map(([h, l]) => <Link key={h} href={h} className={on(h) ? "on" : ""}>{l}</Link>)}
      </nav>
    </div>
  );
}
