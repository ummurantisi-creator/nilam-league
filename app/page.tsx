export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "50px",
      fontFamily: "Arial"
    }}>
<h1 style={{fontSize:"42px"}}>
🏆 NILAM LEAGUE PPS
</h1>
      <input
        type="text"
        placeholder="Nama Murid"
        style={{
          padding: "15px",
          margin: "10px",
          width: "500px",
          fontSize: "24px"
        }}
      />

      <input
        type="number"
        placeholder="Muka Surat"
        style={{
          padding: "15px",
          margin: "10px",
          width: "500px",
          fontSize: "24px"
        }}
        
      />

      <button
        style={{
          padding: "10px 20px",
          marginTop: "10px"
        }}
      >
        HANTAR
      </button>
    </div>
  );
}