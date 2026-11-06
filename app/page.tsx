"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  // LOGIK SECRET TAP (TEKAN 3 KALI LAJU)
  function handleSecretTap() {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastTapTimeRef.current;

    // Jika jeda lebih 0.5 detik, reset hitungan
    if (timeDifference > 500) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }

    lastTapTimeRef.current = currentTime;

    // Tekan 3 kali berturut-turut
    if (tapCountRef.current === 3) {
      tapCountRef.current = 0;

      const pilihan = prompt(
        "🔑 AKSES PENTADBIR (PPS) DETECTED!\n\nPilih Destinasi:\n1. Borang Input Rekod Bacaan\n2. Muat Naik Data Murid (/seed)\n\nMasukkan nombor (1 atau 2):"
      );

      if (pilihan === "1") {
        router.push("/input-rekod-bacaan");
      } else if (pilihan === "2") {
        router.push("/seed");
      }
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode) return;
    router.push(`/dashboard?barcode=${barcode.trim()}`);
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#0f172a", 
      fontFamily: "sans-serif" 
    }}>
      <div style={{ 
        backgroundColor: "#1e293b", 
        padding: "30px", 
        borderRadius: "12px", 
        width: "100%", 
        maxWidth: "360px", 
        textAlign: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        {/* TAJUK DENGAN UN-SELECTABLE TEXT (TAK BOLEH HIGHLIGHT BIRU) */}
        <div 
          onClick={handleSecretTap}
          style={{ 
            cursor: "pointer", 
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none", // Menghalang teks daripada bertukar jadi biru
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px",
            marginBottom: "10px" 
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🏰</span>
          <span style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "1.2rem" }}>
            Nilam League
          </span>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0", marginBottom: "20px" }}>
          Masukkan Barcode Murid untuk Masuk
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Contoh: 0014AK"
            style={{
              width: "100%",
              padding: "12px",
              boxSizing: "border-box",
              borderRadius: "6px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "#fff",
              textAlign: "center",
              fontSize: "1rem",
              marginBottom: "15px"
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            LOG IN
          </button>
        </form>
      </div>
    </div>
  );
}