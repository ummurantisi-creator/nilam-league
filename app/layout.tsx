import "./globals.css";

export const metadata = {
  title: "Nilam League",
  description: "Sistem Rekod & Leaderboard NILAM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <head>
        {/* Memaksa Chrome menggunakan font standar sistem */}
        <style>{`
          * {
            font-family: Arial, Helvetica, sans-serif !important;
          }
        `}</style>
      </head>
      <body style={{ backgroundColor: "#0f172a", color: "#f8fafc", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}