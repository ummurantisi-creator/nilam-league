"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function InputRekodBacaan() {
  // STATUS KEBENARAN AKSES (PIN DI AWAL)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPinAwal, setInputPinAwal] = useState("");

  // LOGIK KESELAMATAN BERPERINGKAT
  const [salahCount, setSalahCount] = useState(0);
  const [securityLevel, setSecurityLevel] = useState<"DAILY" | "HOURLY" | "HARD_LOCK">("DAILY");
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // DATA BORANG BACAAN
  const [barcode, setBarcode] = useState("");
  const [muridData, setMuridData] = useState<any>(null);
  const [kategori, setKategori] = useState("buku_fiksyen");
  const [mukaSurat, setMukaSurat] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const MASTER_PREFIX = "126926";

  // PEMANTAUAN TIMEOUT LOCKOUT (1 MINIT)
  useEffect(() => {
    let timer: any;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  // JANA PIN SAH
  function janaKodSah() {
    const d = new Date();
    const hari = String(d.getDate()).padStart(2, "0");
    const bulan = String(d.getMonth() + 1).padStart(2, "0");
    const jam = String(d.getHours()).padStart(2, "0");

    if (securityLevel === "DAILY") {
      return `${MASTER_PREFIX}${hari}${bulan}`;
    } else {
      return `${MASTER_PREFIX}${hari}${bulan}${jam}`;
    }
  }

  // OVERRIDE DINAMIK PENCIPTA (MINIT SEMASA)
  function isDynamicCreatorOverride(pin: string) {
    const d = new Date();
    const jam = String(d.getHours()).padStart(2, "0");
    const minit = String(d.getMinutes()).padStart(2, "0");
    return pin === `${MASTER_PREFIX}${jam}${minit}`;
  }

  // 1. SEMAKAN PIN SEBELUM MASUK SYSTEM
  function sahkanPinAwal(e: React.FormEvent) {
    e.preventDefault();

    if (lockoutTimer > 0) {
      alert(`⛔ SISTEM TERKUNCI! Sila tunggu ${lockoutTimer} saat.`);
      return;
    }

    if (isDynamicCreatorOverride(inputPinAwal)) {
      alert("🔓 OVERRIDE PENCIPTA DITERIMA! Akses dibuka & sistem di-reset.");
      setSecurityLevel("DAILY");
      setSalahCount(0);
      setLockoutTimer(0);
      setIsAuthenticated(true);
      setInputPinAwal("");
      return;
    }

    if (securityLevel === "HARD_LOCK") {
      alert("🚨 SISTEM HARD LOCK! Sila guna Kod Override Minit Pencipta.");
      return;
    }

    const validPIN = janaKodSah();

    if (inputPinAwal === validPIN) {
      setIsAuthenticated(true);
      setSalahCount(0);
      setInputPinAwal("");
    } else {
      const newSalah = salahCount + 1;
      setSalahCount(newSalah);

      if (securityLevel === "DAILY") {
        if (newSalah >= 3) {
          setLockoutTimer(60);
          setSecurityLevel("HOURLY");
          setSalahCount(0);
          alert("⛔ 3 KALI SALAH! Sistem dikunci 1 minit. Mod keselamatan dinaik taraf ke LOGIK JAM.");
        } else {
          alert(`❌ PIN SALAH! Percubaan ${newSalah}/3 (Mod Harian).`);
        }
      } else if (securityLevel === "HOURLY") {
        if (newSalah >= 5) {
          setSecurityLevel("HARD_LOCK");
          alert("🚨 5 KALI SALAH DALAM MOD JAM! Sistem TERKUNCI KEKAL. Sila guna Override Pencipta!");
        } else {
          alert(`❌ PIN SALAH! Percubaan ${newSalah}/5 (Mod Jam).`);
        }
      }
    }
  }

  // 2. CARI MURID DALAM FIREBASE
  async function cariMurid() {
    if (!barcode) return;
    setLoading(true);
    setStatus("Mencari data murid...");

    try {
      const docRef = doc(db, "murid", barcode.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMuridData(docSnap.data());
        setStatus("✅ Murid dijumpai!");
      } else {
        setMuridData(null);
        setStatus("❌ Barcode murid tidak dijumpai.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Ralat semasa menarik data murid.");
    } finally {
      setLoading(false);
    }
  }

  // 3. FUNGSI LOGIK PENGIRAAN MARKAH (NILAM RASMI KPM)
  function kiraMataNILAM(cat: string, ms: number) {
    // A. Mata Sumber Bacaan
    let mataSumber = 1;
    if (cat === "buku_bukan_fiksyen" || cat === "poster_risalah_laporan") {
      mataSumber = 2; // Mata Sumber = 2
    }

    // B. Mata Pemberat (Muka Surat)
    let mataPemberat = 1;
    if (ms >= 11 && ms <= 25) mataPemberat = 3;
    else if (ms >= 26 && ms <= 50) mataPemberat = 5;
    else if (ms >= 51 && ms <= 100) mataPemberat = 7;
    else if (ms >= 101) mataPemberat = 10;

    // Jumlah Mata = Mata Sumber x Mata Pemberat
    return mataSumber * mataPemberat;
  }

  // 4. SIMPAN REKOD BACAAN KE FIREBASE
  async function simpanRekod(e: React.FormEvent) {
    e.preventDefault();

    if (!muridData || !mukaSurat) {
      alert("Sila isi jumlah muka surat.");
      return;
    }

    setLoading(true);
    setStatus("Sedang menyimpan rekod ke Firebase...");

    const ms = parseInt(mukaSurat);
    const jumlahXP = kiraMataNILAM(kategori, ms);

    try {
      await addDoc(collection(db, "rekod_bacaan"), {
        barcode: muridData.barcode,
        nama: muridData.nama,
        kategori: kategori,
        muka_surat: ms,
        xp_diperolehi: jumlahXP,
        tarikh: serverTimestamp()
      });

      const muridRef = doc(db, "murid", muridData.barcode);
      await updateDoc(muridRef, {
        total_xp: increment(jumlahXP),
        total_buku: increment(1),
        total_muka_surat: increment(ms)
      });

      setStatus(`🎉 BERJAYA! +${jumlahXP} Mata NILAM (XP) telah ditambah untuk ${muridData.nama}.`);
      setMukaSurat("");
      setBarcode("");
      setMuridData(null);

    } catch (err) {
      console.error(err);
      setStatus("❌ Ralat semasa menyimpan rekod ke Firebase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2>📖 Input Rekod Bacaan NILAM</h2>

      {!isAuthenticated ? (
        <form onSubmit={sahkanPinAwal} style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>🔒 Sila Masukkan Kunci Keselamatan</h3>
          
          {securityLevel === "HOURLY" && (
            <p style={{ color: "#856404", background: "#fff3cd", padding: "8px", borderRadius: "4px" }}>
              ⚠️ Mod Jam Aktif (PIN + Jam 24H)
            </p>
          )}

          {securityLevel === "HARD_LOCK" && (
            <p style={{ color: "#721c24", background: "#f8d7da", padding: "8px", borderRadius: "4px" }}>
              🚨 HARD LOCK! Sila guna Kod Override Pencipta.
            </p>
          )}

          {lockoutTimer > 0 && (
            <p style={{ color: "#721c24", background: "#f8d7da", padding: "8px", borderRadius: "4px" }}>
              ⏳ Lockout: {lockoutTimer} saat
            </p>
          )}

          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              value={inputPinAwal}
              onChange={(e) => setInputPinAwal(e.target.value)}
              placeholder="Masukkan PIN Keselamatan"
              required
              disabled={lockoutTimer > 0 && securityLevel !== "HARD_LOCK"}
              style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <button
            type="submit"
            disabled={lockoutTimer > 0 && securityLevel !== "HARD_LOCK"}
            style={{ width: "100%", padding: "10px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            BUKA BORANG REKOD
          </button>
        </form>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ color: "green", fontWeight: "bold" }}>🔓 Akses Dibenarkan</span>
            <button onClick={() => setIsAuthenticated(false)} style={{ padding: "4px 8px", cursor: "pointer" }}>Kunci Semula</button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label><b>Scan / Taip Barcode Murid:</b></label>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Contoh: 0014AK"
                style={{ flex: 1, padding: "8px" }}
              />
              <button onClick={cariMurid} disabled={loading} style={{ padding: "8px 15px", cursor: "pointer" }}>
                Cari
              </button>
            </div>
          </div>

          {muridData && (
            <form onSubmit={simpanRekod} style={{ background: "#f0f0f0", padding: "15px", borderRadius: "8px" }}>
              <p><b>Nama:</b> {muridData.nama}</p>
              <p><b>Kelas:</b> {muridData.kelas}</p>
              <p><b>Mata NILAM Semasa:</b> {muridData.total_xp || 0} Mata</p>
              <hr />

              <div style={{ marginBottom: "10px" }}>
                <label><b>Sumber Bacaan (Kategori):</b></label>
                <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }}>
                  <option value="buku_fiksyen">Buku Fiksyen (Mata Sumber = 1)</option>
                  <option value="buku_bukan_fiksyen">Buku Bukan Fiksyen (Mata Sumber = 2)</option>
                  <option value="sumber_digital">Sumber Digital / Blog / Web / Video (Mata Sumber = 1)</option>
                  <option value="artikel_cerpen_komik">Artikel / Buletin / Cerpen / Komik / Jurnal (Mata Sumber = 1)</option>
                  <option value="poster_risalah_laporan">Poster / Peta / Risalah / Laporan / Surat Khabar (Mata Sumber = 2)</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label><b>Jumlah Muka Surat (Halaman):</b></label>
                <input
                  type="number"
                  value={mukaSurat}
                  onChange={(e) => setMukaSurat(e.target.value)}
                  placeholder="Contoh: 35"
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                {loading ? "Menyimpan..." : "SIMPAN REKOD & TAMBAH MATA"}
              </button>
            </form>
          )}

          {status && <p style={{ marginTop: "15px", fontWeight: "bold" }}>{status}</p>}
        </div>
      )}
    </div>
  );
}