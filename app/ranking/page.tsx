"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

interface Murid {
  barcode: string;
  nama: string;
  kelas: string;
  total_xp: number;
  total_buku: number;
  total_muka_surat: number;
}

export default function RankingPage() {
  const [muridList, setMuridList] = useState<Murid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "murid"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Murid[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Murid);
      });

      // Tie-breaker: XP terbanyak -> Jika sama, Bilangan Buku terbanyak
      list.sort((a, b) => {
        const xpA = a.total_xp || 0;
        const xpB = b.total_xp || 0;

        if (xpB !== xpA) {
          return xpB - xpA;
        }

        const bukuA = a.total_buku || 0;
        const bukuB = b.total_buku || 0;
        return bukuB - bukuA;
      });

      setMuridList(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "16px", maxWidth: "800px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "6px" }}>🏆 Carta Ranking Nilam League</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginTop: 0, marginBottom: "20px" }}>
        Kedudukan rasmi murid mengikut XP & Bilangan Buku.
      </p>

      {loading ? (
        <p style={{ textAlign: "center" }}>Sedang memuat naik carta ranking...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {muridList.map((murid, index) => {
            let badge = `#${index + 1}`;
            let borderColor = "#e5e7eb";
            let badgeBg = "#f3f4f6";

            if (index === 0) {
              badge = "🥇 1";
              borderColor = "#f59e0b";
              badgeBg = "#fef3c7";
            } else if (index === 1) {
              badge = "🥈 2";
              borderColor = "#9ca3af";
              badgeBg = "#f3f4f6";
            } else if (index === 2) {
              badge = "🥉 3";
              borderColor = "#d97706";
              badgeBg = "#ffedd5";
            }

            return (
              <div
                key={murid.barcode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  border: `2px solid ${borderColor}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                {/* Kedudukan & Nama */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      backgroundColor: badgeBg,
                      fontWeight: "bold",
                      fontSize: "14px",
                      minWidth: "40px",
                      textAlign: "center"
                    }}
                  >
                    {badge}
                  </span>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "15px", color: "#111827" }}>{murid.nama}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Kelas: {murid.kelas} | 📚 <b>{murid.total_buku || 0}</b> Buku | 📄 {murid.total_muka_surat || 0} ms
                    </div>
                  </div>
                </div>

                {/* Total Markah (XP) */}
                <div style={{ textAlign: "right", minWidth: "70px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>
                    {murid.total_xp || 0}
                  </span>
                  <span style={{ fontSize: "11px", display: "block", color: "#6b7280" }}>XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}