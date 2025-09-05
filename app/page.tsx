import { redirect } from 'next/navigation';

export default function HomePage() {
  // Langsung alihkan pengguna ke halaman login
  redirect('/login');

  // Fungsi ini tidak akan pernah menampilkan apa pun karena sudah dialihkan
  return null;
}