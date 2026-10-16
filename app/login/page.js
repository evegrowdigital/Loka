"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { loadDB, saveDB } from "@/lib/db";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const db = loadDB();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === pw);
    if (!u) return setErr("Email atau kata sandi salah.");
    if (u.suspended) return setErr("Akun ini sedang dinonaktifkan. Hubungi admin LOKA.");
    db.session = u.id; saveDB(db);
    router.push(u.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="authwrap">
      <div className="authbox">
        <Logo />
        <h1>Masuk ke LOKA</h1>
        <p className="muted" style={{ marginBottom: 18 }}>Kelola toko, produk, dan penghasilanmu.</p>
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="field"><label htmlFor="pw">Kata sandi</label><input id="pw" className="input" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></div>
          {err && <div className="err" style={{ marginTop: 14 }} role="alert">{err}</div>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }}>Masuk</button>
        </form>
        <p className="small muted" style={{ marginTop: 16 }}>Belum punya akun? <Link href="/register" style={{ color: "var(--blue-d)", fontWeight: 700 }}>Daftar gratis</Link></p>
        <div className="okmsg small" style={{ marginTop: 16 }}>
          Mode demo. Akun contoh: <b>demo@loka.id</b> / <b>demo123</b> (penjual), <b>admin@loka.id</b> / <b>admin123</b> (admin).
        </div>
      </div>
    </div>
  );
}
