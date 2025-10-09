// Leaflet icon fix - hanya dijalankan di client-side
if (typeof window !== "undefined") {
  const L = require("leaflet");
  const icon = require("leaflet/dist/images/marker-icon.png");
  const iconShadow = require("leaflet/dist/images/marker-shadow.png");
  const iconRetina = require("leaflet/dist/images/marker-icon-2x.png");

  // Hapus properti default yang mungkin salah dikonfigurasi oleh bundler
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  // Gabungkan kembali dengan path yang sudah diimpor secara eksplisit
  L.Icon.Default.mergeOptions({
    iconUrl: icon.src || icon.default || icon,
    iconRetinaUrl: iconRetina.src || iconRetina.default || iconRetina,
    shadowUrl: iconShadow.src || iconShadow.default || iconShadow,
  });
}

// Export untuk make sebagai modul
export default {};