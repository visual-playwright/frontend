// Nama run untuk tampilan: tanpa ekstensi internal (.json).
// Run lama di DB masih berekstensi — helper ini membersihkannya saat dirender,
// sehingga user tidak pernah melihat format simpan internal.
export function displayName(name) {
  return String(name || "").replace(/\.json$/i, "");
}
