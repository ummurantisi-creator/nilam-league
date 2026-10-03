"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode) return;

    setLoading(true);
    setError("");

    try {
      const docRef = doc(db, "murid", barcode.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Simpan barcode di localStorage untuk sesi login
        localStorage.setItem("user_barcode", barcode.trim());
        router.push("/dashboard");
      } else {
        setError("❌ Barcode tidak terdaftar dalam sistem!");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "sans-serif" }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", color: "white", textAlign: "center" }}>
        <h1 style={{ color: "#38bdf8", marginBottom: "10px" }}>🏰 Nilam League</h1>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Masukkan Barcode Murid untuk Masuk</p>

        {error && <p style={{ color: "#ef4444", backgroundColor: "#450a0a", padding: "8px", borderRadius: "6px" }}>{error}</p>}

        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Contoh: 0014AK"
          required
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "white", marginBottom: "20px", fontSize: "16px", textAlign: "center" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "Memverifikasi..." : "LOG IN"}
        </button>
      </form>
    </div>
  );
}