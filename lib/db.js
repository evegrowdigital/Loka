"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/*
  MODE DEMO: seluruh data disimpan di localStorage browser.
  Untuk produksi, ganti isi file ini dengan pemanggilan database (lihat README, tahap 2).
  Nama fungsi sengaja dibuat sederhana supaya halaman-halaman tidak perlu diubah banyak.
*/
const KEY = "loka_db_v1";
export const MIN_WITHDRAW = 50000;
export const PRODUCT_TYPES = ["E-book", "Template", "Worksheet", "Preset", "Desain digital", "E-course", "Kelas online", "Jasa", "Lainnya"];
export const RESERVED = ["dashboard", "admin", "login", "register", "api", "checkout", "_next", "favicon.ico", "logo.png"];
export const THEMES = { Biru: "#2B9BE6", Laut: "#1678BE", Langit: "#67BAEB", Navy: "#0B2540", Tosca: "#14A3A3" };

export const rupiah = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");
export const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);
export const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dateLabel = (t) => { const d = new Date(t); return d.getDate() + "/" + (d.getMonth() + 1); };
export const fullDate = (t) => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const inputDate = (t) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

function seed() {
  const now = Date.now(), day = 86400000;
  const products = [
    { id: "p_1", sellerId: "u_demo", name: "Template Konten Instagram 30 Hari", type: "Template", description: "30 template feed dan story siap edit di Canva.", price: 49000, fileUrl: "https://example.com/template.zip", active: true },
    { id: "p_2", sellerId: "u_demo", name: "E-book Mulai Jualan Online", type: "E-book", description: "Panduan langkah demi langkah dari nol sampai order pertama.", price: 79000, fileUrl: "https://example.com/ebook.pdf", active: true },
    { id: "p_3", sellerId: "u_demo", name: "Kelas Foto Produk dengan HP", type: "Kelas online", description: "6 video pendek tentang cahaya, sudut, dan editing.", price: 149000, fileUrl: "https://example.com/kelas", active: true },
  ];
  const sources = ["Instagram", "TikTok", "WhatsApp", "Langsung"];
  const visits = [], orders = [];
  for (let d = 13; d >= 0; d--) {
    const n = 6 + Math.floor(Math.random() * 18);
    for (let i = 0; i < n; i++) {
      visits.push({ id: uid("v"), sellerId: "u_demo", productId: Math.random() < 0.45 ? products[Math.floor(Math.random() * 3)].id : null, source: sources[Math.floor(Math.random() * 4)], ts: now - d * day - Math.floor(Math.random() * day * 0.9) });
    }
    const o = Math.floor(Math.random() * 3);
    for (let i = 0; i < o; i++) {
      const p = products[Math.floor(Math.random() * 3)];
      orders.push({ id: "LK-" + Math.random().toString(36).slice(2, 8).toUpperCase(), sellerId: "u_demo", productId: p.id, productName: p.name, buyerName: "Pembeli " + (orders.length + 1), buyerEmail: "pembeli" + (orders.length + 1) + "@contoh.id", amount: p.price, status: "paid", createdAt: now - d * day - Math.floor(Math.random() * day * 0.9) });
    }
  }
  return {
    session: null,
    settings: { feeFree: 0.05, feePro: 0.02, proPrice: 49000 },
    users: [
      { id: "u_admin", name: "Admin LOKA", email: "admin@loka.id", password: "admin123", role: "admin", plan: "pro", suspended: false, createdAt: now - 60 * day },
      { id: "u_demo", name: "Rara Kreatif", email: "demo@loka.id", password: "demo123", role: "seller", plan: "free", suspended: false, createdAt: now - 30 * day },
    ],
    stores: [{ userId: "u_demo", username: "rara", name: "Rara Kreatif", bio: "Template dan panduan untuk kreator pemula.", color: "#2B9BE6", socials: { instagram: "https://instagram.com", tiktok: "https://tiktok.com", whatsapp: "https://wa.me/6281234567890" }, links: [{ id: "l_1", title: "Grup belajar gratis", url: "https://example.com/grup" }] }],
    products, orders, visits,
    withdrawals: [],
  };
}

export function loadDB() {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  const d = seed(); localStorage.setItem(KEY, JSON.stringify(d)); return d;
}
export function saveDB(db) { localStorage.setItem(KEY, JSON.stringify(db)); window.dispatchEvent(new Event("loka-db")); }
export function resetDB() { localStorage.removeItem(KEY); window.dispatchEvent(new Event("loka-db")); }

export function useDB() {
  const [db, setDb] = useState(null);
  useEffect(() => {
    const r = () => setDb(loadDB());
    r();
    window.addEventListener("loka-db", r); window.addEventListener("storage", r);
    return () => { window.removeEventListener("loka-db", r); window.removeEventListener("storage", r); };
  }, []);
  const update = useCallback((fn) => { const copy = JSON.parse(JSON.stringify(loadDB())); fn(copy); saveDB(copy); }, []);
  return [db, update];
}

export function useSession(role) {
  const [db, update] = useDB();
  const router = useRouter();
  const user = db ? db.users.find((u) => u.id === db.session && !u.suspended) : null;
  useEffect(() => {
    if (!db) return;
    if (!user) router.replace("/login");
    else if (role && user.role !== role) router.replace(user.role === "admin" ? "/admin" : "/dashboard");
  }, [db, user, role, router]);
  const store = db && user ? db.stores.find((s) => s.userId === user.id) : null;
  return { db, update, user, store, ready: !!(db && user && (!role || user.role === role)) };
}

export const feeRate = (db, user) => (user.plan === "pro" ? db.settings.feePro : db.settings.feeFree);

export function balanceFor(db, sellerId) {
  const earned = db.orders.filter((o) => o.sellerId === sellerId && o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const ws = db.withdrawals.filter((w) => w.sellerId === sellerId);
  const processing = ws.filter((w) => w.status === "diproses").reduce((s, w) => s + w.amount, 0);
  const paidOut = ws.filter((w) => w.status === "berhasil").reduce((s, w) => s + w.amount, 0);
  const feePaid = ws.filter((w) => w.status !== "ditolak").reduce((s, w) => s + w.fee, 0);
  const netPaid = ws.filter((w) => w.status === "berhasil").reduce((s, w) => s + w.net, 0);
  const available = earned - processing - paidOut;
  return { earned, processing, paidOut, feePaid, netPaid, available };
}

export function statsFor(db, sellerId, from, to) {
  const inR = (t) => t >= from && t <= to;
  const orders = db.orders.filter((o) => o.sellerId === sellerId && o.status === "paid" && inR(o.createdAt));
  const visits = db.visits.filter((v) => v.sellerId === sellerId && inR(v.ts));
  const wds = db.withdrawals.filter((w) => w.sellerId === sellerId && w.status !== "ditolak" && inR(w.createdAt));
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  const fees = wds.reduce((s, w) => s + w.fee, 0);
  const visitors = visits.filter((v) => !v.productId).length;
  const productViews = visits.filter((v) => v.productId).length;
  const series = [];
  for (let t = dayStart(from); t <= to && series.length < 62; t += 86400000) {
    const e = t + 86400000;
    series.push({
      label: dateLabel(t),
      value: orders.filter((o) => o.createdAt >= t && o.createdAt < e).reduce((s, o) => s + o.amount, 0),
      orders: orders.filter((o) => o.createdAt >= t && o.createdAt < e).length,
      visits: visits.filter((v) => v.ts >= t && v.ts < e).length,
    });
  }
  const top = db.products.filter((p) => p.sellerId === sellerId).map((p) => {
    const po = orders.filter((o) => o.productId === p.id);
    return { id: p.id, name: p.name, sold: po.length, revenue: po.reduce((s, o) => s + o.amount, 0), views: visits.filter((v) => v.productId === p.id).length };
  }).sort((a, b) => b.sold - a.sold || b.revenue - a.revenue);
  const sources = {}; visits.forEach((v) => { sources[v.source] = (sources[v.source] || 0) + 1; });
  return {
    revenue, fees, net: revenue - fees, orders: orders.length, units: orders.length,
    avg: orders.length ? revenue / orders.length : 0, visitors, productViews,
    conversion: visitors ? (orders.length / visitors) * 100 : 0,
    series, top, sources: Object.entries(sources).sort((a, b) => b[1] - a[1]),
  };
}
