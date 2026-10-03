"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface RekodBacaan {
  id: string;
  barcode: string;
  nama: string;
  kategori: string;
  muka_surat: number;
  xp_diperolehi: number;
  tarikh: any;
}

export default function SenaraiRekod() {
  const [rekodList, setRekodList] = useState<RekodBacaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tarik data rekod_bacaan secara Real-Time disusun ikut tarikh terkini
    const q = query(collection(db, "rekod_bacaan"), orderBy("tarikh", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RekodBacaan[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RekodBacaan);
      });
      setRekodList(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format Nama Kategori untuk Paparan
  function formatKategori(cat: string) {
    switch (cat) {
      case "buku_fiksyen": return "Buku Fiksyen";
      case "buku_bukan_fiksyen": return "Buku Bukan Fiksyen";
      case "sumber_digital": return "Sumber Digital";
      case "artikel_cerpen_komik": return "Artikel/Cerpen/Komik";
      case "poster_risalah_laporan": return "Poster/Risalah/Laporan";
      default: return cat;
    }
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2>📜 Log Transaksi & Sejarah Penambahan Mata NILAM</h2>
      <p style={{ color: "#666" }}>Semua rekod penambahan mata murid disimpan di sini sebagai bukti transaksi.</p>

      {loading ? (
        <p>Sedang memuat naik senarai transaksi...</p>
      ) : rekodList.length === 0 ? (
        <p>Belum ada sebarang rekod penambahan dimasukkan.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#0070f3", color: "#fff", textAlign: "left" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Tarikh & Masa</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Barcode / ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Nama Murid</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Kategori Bahan</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Muka Surat</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Mata (XP)</th>
            </tr>
          </thead>
          <tbody>
            {rekodList.map((rekod, index) => (
              <tr key={rekod.id} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontSize: "14px" }}>
                  {rekod.tarikh?.toDate ? rekod.tarikh.toDate().toLocaleString("ms-MY") : "Baru Sahaja"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold" }}>{rekod.barcode}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{rekod.nama}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{formatKategori(rekod.kategori)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{rekod.muka_surat}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", color: "green", fontWeight: "bold" }}>
                  +{rekod.xp_diperolehi} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}