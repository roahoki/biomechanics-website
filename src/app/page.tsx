export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col h-screen bg-primary">
      <p>roahoki está cocinando 🍲...</p>
      <a href="/links">links</a>
      <a href="/admin/dashboard">admin dashboard</a>
      <a href="/admin/links">admin sortable links</a>
      <a href="/admin/migration">migrar datos a Supabase</a>
    </div>
  );
}
