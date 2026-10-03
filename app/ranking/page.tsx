"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

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
    // Tarik data murid secara real-time, disusun mengikut total_xp tertinggi
    const q = query(collection(db, "murid"), orderBy("total_xp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Murid[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Murid);
      });
      setMuridList(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2>🏆 Carta Ranking Nilam League</h2>
      <p style={{ color: "#666" }}>Kedudukan rasmi murid mengikut jumlah markah (XP) terkumpul.</p>

      {loading ? (
        <p>Sedang memuat naik carta ranking...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#111827", color: "#fff", textAlign: "left" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center", width: "60px" }}>No</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Nama Murid</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Kelas</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Bil. Buku</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Bil. Muka Surat</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Total Markah (XP)</th>
            </tr>
          </thead>
          <tbody>
            {muridList.map((murid, index) => {
              let rankBg = index % 2 === 0 ? "#f9f9f9" : "#fff";
              let badge = `${index + 1}`;

              if (index === 0) badge = "🥇 1";
              if (index === 1) badge = "🥈 2";
              if (index === 2) badge = "🥉 3";

              return (
                <tr key={murid.barcode} style={{ backgroundColor: rankBg }}>
                  <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                    {badge}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "600" }}>{murid.nama}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{murid.kelas}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{murid.total_buku || 0}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{murid.total_muka_surat || 0}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center", color: "#2563eb", fontWeight: "bold", fontSize: "16px" }}>
                    {murid.total_xp || 0} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}