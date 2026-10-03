"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ranking" | "profile">("ranking");
  const [rankingList, setRankingList] = useState<any[]>([]);
  const [currentMurid, setCurrentMurid] = useState<any>(null);

  const router = useRouter();

  // 1. Semak Login & Tarik Data Realtime
  useEffect(() => {
    const savedBarcode = localStorage.getItem("user_barcode");
    if (!savedBarcode) {
      router.push("/login");
      return;
    }

    // Tarik Profil Murid Terkini
    const fetchProfil = async () => {
      const docRef = doc(db, "murid", savedBarcode);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCurrentMurid(snap.data());
      }
    };
    fetchProfil();

    // Tarik Senarai Ranking Real-time dari Firebase
    const q = query(collection(db, "murid"), orderBy("total_xp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setRankingList(list);
    });

    return () => unsubscribe();
  }, [router]);

  // Logout
  function handleLogout() {
    localStorage.removeItem("user_barcode");
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f1f5f9" }}>
      {/* SIDEBAR NAVIGATION (GAYA BLOOKET) */}
      <div style={{ width: "240px", backgroundColor: "#0f172a", color: "white", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#38bdf8", textAlign: "center", marginBottom: "30px" }}>🏰 Nilam League</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => setActiveTab("ranking")}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === "ranking" ? "#0284c7" : "transparent",
                color: "white",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              🏆 Ranking Sekolah
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === "profile" ? "#0284c7" : "transparent",
                color: "white",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              👤 Profile
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: "10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          Log Out
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: "30px" }}>
        {/* TAB RANKING */}
        {activeTab === "ranking" && (
          <div>
            <h2>🏆 Carta Ranking NILAM Sekolah</h2>
            <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginTop: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>Kedudukan</th>
                    <th style={{ padding: "12px" }}>Nama Murid</th>
                    <th style={{ padding: "12px" }}>Kelas</th>
                    <th style={{ padding: "12px" }}>Mata NILAM (XP)</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingList.map((item, index) => (
                    <tr 
                      key={item.barcode} 
                      style={{ 
                        borderBottom: "1px solid #f1f5f9", 
                        backgroundColor: item.barcode === currentMurid?.barcode ? "#e0f2fe" : "transparent" 
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: "bold" }}>#{index + 1}</td>
                      <td style={{ padding: "12px" }}>{item.nama}</td>
                      <td style={{ padding: "12px" }}>{item.kelas}</td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: "#0284c7" }}>{item.total_xp || 0} Mata</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB PROFILE SAHAJA (BORANG BACAAN DAH DIBUANG) */}
        {activeTab === "profile" && currentMurid && (
          <div style={{ maxWidth: "450px", margin: "auto" }}>
            <h2>👤 Profil Saya</h2>
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "25px", marginTop: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#38bdf8", color: "white", fontSize: "32px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontWeight: "bold" }}>
                  {currentMurid.nama?.charAt(0)}
                </div>
                <h3 style={{ margin: "5px 0" }}>{currentMurid.nama}</h3>
                <span style={{ backgroundColor: "#e2e8f0", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                  Kelas {currentMurid.kelas}
                </span>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <span style={{ color: "#64748b" }}>Barcode ID:</span>
                  <span style={{ fontWeight: "bold" }}>{currentMurid.barcode}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f0fdf4", borderRadius: "8px" }}>
                  <span style={{ color: "#166534" }}>Jumlah Mata NILAM:</span>
                  <span style={{ fontWeight: "bold", color: "#15803d", fontSize: "18px" }}>{currentMurid.total_xp || 0} Mata</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <span style={{ color: "#64748b" }}>Jumlah Buku Dibaca:</span>
                  <span style={{ fontWeight: "bold" }}>{currentMurid.total_buku || 0} Buah</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <span style={{ color: "#64748b" }}>Jumlah Muka Surat:</span>
                  <span style={{ fontWeight: "bold" }}>{currentMurid.total_muka_surat || 0} Halaman</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}