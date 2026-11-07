"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Murid {
  id: string;
  barcode: string;
  nama: string;
  kelas: string;
  total_xp?: number;
  total_buku?: number;
}

export default function DashboardPage() {
  const [senaraiMurid, setSenaraiMurid] = useState<Murid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tarik data murid tersusun mengikut Total XP terbanyak
    const q = query(collection(db, "murid"), orderBy("total_xp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Murid[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Murid, "id">),
      }));
      setSenaraiMurid(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Lencana Warna mengikut Kedudukan Top 3
  function getBadgeColor(index: number) {
    if (index === 0) return { bg: "#f59e0b", color: "#000", label: "🥇 Emas" };
    if (index === 1) return { bg: "#94a3b8", color: "#000", label: "🥈 Perak" };
    if (index === 2) return { bg: "#b45309", color: "#fff", label: "🥉 Gangsa" };
    return { bg: "#334155", color: "#f8fafc", label: `#${index + 1}` };
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a", // Latar gelap kekal
      color: "#f8fafc",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2rem", color: "#38bdf8", marginBottom: "8px" }}>
            🏆 Carta Ranking NILAM Sekolah
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Kedudukan Terkini Murid Berdasarkan Mata NILAM (XP)
          </p>
        </div>

        {/* Jadual Carta Leaderboard */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "15px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          border: "1px solid #334155"
        }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
              ⏳ Memuat turun carta kedudukan...
            </p>
          ) : senaraiMurid.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
              Tiada data murid dijumpai.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8", fontSize: "0.85rem" }}>
                    <th style={{ padding: "12px 8px" }}>KEDUDUKAN</th>
                    <th style={{ padding: "12px 8px" }}>NAMA MURID</th>
                    <th style={{ padding: "12px 8px" }}>KELAS</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>MATA NILAM (XP)</th>
                  </tr>
                </thead>
                <tbody>
                  {senaraiMurid.map((m, index) => {
                    const badge = getBadgeColor(index);
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: "1px solid #334155",
                          backgroundColor: index % 2 === 0 ? "transparent" : "#0f172a33"
                        }}
                      >
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "0.85rem"
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", fontWeight: "600", color: "#f8fafc" }}>
                          {m.nama}
                        </td>
                        <td style={{ padding: "12px 8px", color: "#cbd5e1" }}>
                          {m.kelas}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "bold", color: "#38bdf8", fontSize: "1.1rem" }}>
                          {m.total_xp || 0} <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Mata</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}