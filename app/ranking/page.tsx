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
    // Tarik data murid: Susun ikut total_xp dahulu, kemudian total_buku jika XP sama
    const q = query(
      collection(db, "murid"),
      orderBy("total_xp", "desc"),
      orderBy("total_buku", "desc")
    );

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
    <div style={{ padding: "16px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "4px" }}>🏆 Carta Ranking Nilam League</h2>
      <p style={{ color: "#666", fontSize: "14px", marginTop: "0" }}>
        Kedudukan rasmi murid mengikut jumlah markah (XP) &amp; bilangan buku terbanyak.
      </p>

      {loading ? (
        <p>Sedang memuat naik carta ranking...</p>
      ) : (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {muridList.map((murid, index) => {
            let badge = `${index + 1}`;
            let borderColor = "#e5e7eb";
            let badgeBg = "#f3f4f6";

            if (index === 0) { badge = "🥇 1"; borderColor = "#f59e0b"; badgeBg = "#fef3c7"; }
            if (index === 1) { badge = "🥈 2"; borderColor = "#9ca3af"; badgeBg = "#f3f4f6"; }
            if (index === 2) { badge = "🥉 3"; borderColor = "#d97706"; badgeBg = "#ffedd5"; }

            return (
              <div
                key={murid.barcode}
                style={{
                  borderLeft: `6px solid ${borderColor}`,
                  backgroundColor: "#ffffff",
                  padding: "14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                {/* Bahagian Kiri: Kedudukan & Maklumat Murid */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <div
                    style={{
                      backgroundColor: badgeBg,
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {badge}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "bold", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {murid.nama}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      {murid.kelas} • 📚 {murid.total_buku || 0} buku • 📄 {murid.total_muka_surat || 0} m/s
                    </div>
                  </div>
                </div>

                {/* Bahagian Kanan: Markah XP */}
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>
                    {murid.total_xp || 0}
                  </span>
                  <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", marginLeft: "2px" }}>XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}