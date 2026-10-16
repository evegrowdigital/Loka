import Link from "next/link";
export default function Logo({ href = "/", height = 36 }) {
  return (
    <Link href={href} className="logo" aria-label="LOKA beranda">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="LOKA" style={{ height }} />
    </Link>
  );
}
