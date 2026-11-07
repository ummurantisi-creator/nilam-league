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

      // Logik Tie-Breaker: 1. Total XP -> 2. Bilangan Buku Terbanyak
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
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "6px" }}>🏆 Carta Ranking NILAM Sekolah</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginTop: 0, marginBottom: "20px" }}>
        Kedudukan rasmi murid mengikut Mata NILAM (XP) & Bilangan Buku.
      </p>

      {loading ? (
        <p style={{ textAlign: "center" }}>Sedang memuat naik carta ranking...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "10px", padding: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#374151", textAlign: "left" }}>
                <th style={{ padding: "12px 8px", textAlign: "center", width: "100px" }}>Kedudukan</th>
                <th style={{ padding: "12px 8px" }}>Nama Murid</th>
                <th style={{ padding: "12px 8px" }}>Kelas</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>Bil. Buku 📚</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>Bil. MS 📄</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>Mata NILAM (XP)</th>
              </tr>
            </thead>
            <tbody>
              {muridList.map((murid, index) => {
                let badge = `#${index + 1}`;
                let rowBg = index % 2 === 0 ? "#ffffff" : "#f9fafb";

                if (index === 0) badge = "🥇 #1";
                else if (index === 1) badge = "🥈 #2";
                else if (index === 2) badge = "🥉 #3";

                return (
                  <tr key={murid.barcode} style={{ backgroundColor: rowBg, borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "bold" }}>{badge}</td>
                    <td style={{ padding: "12px 8px", fontWeight: "600", color: "#111827" }}>{murid.nama}</td>
                    <td style={{ padding: "12px 8px", color: "#4b5563" }}>{murid.kelas}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "bold", color: "#059669" }}>
                      {murid.total_buku || 0}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#4b5563" }}>
                      {murid.total_muka_surat || 0}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#2563eb", fontWeight: "bold" }}>
                      {murid.total_xp || 0} Mata
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}