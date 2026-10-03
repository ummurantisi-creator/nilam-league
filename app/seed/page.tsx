"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { murid } from "../../data/murid";

export default function SeedPage() {
  const [status, setStatus] = useState("");

  async function uploadData() {
    setStatus("Sedang memuat naik data murid ke Firebase...");
    try {
      for (const m of murid) {
        // Simpan data murid menggunakan ID barcode supaya mudah dicari
        await setDoc(doc(db, "murid", m.barcode), {
          barcode: m.barcode,
          nama: m.nama,
          kelas: m.kelas,
          total_xp: 0,
          total_buku: 0,
          total_muka_surat: 0,
        });
      }
      setStatus("✅ SELESAI! Semua data murid berjaya dimasukkan ke Firebase.");
    } catch (error) {
      console.error(error);
      setStatus("❌ Ralat berlaku semasa muat naik data.");
    }
  }

  return (
    <div style={{ padding: "50px", fontFamily: "Arial" }}>
      <h1>🌱 Seed Data Murid Ke Firebase</h1>
      <button 
        onClick={uploadData}
        style={{ padding: "15px 30px", backgroundColor: "#198754", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer" }}
      >
        TEKAN SINI UNTUK MUAT NAIK DATA MURID
      </button>
      <h3 style={{ marginTop: "20px" }}>{status}</h3>
    </div>
  );
}