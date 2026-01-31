class PortAllocator {
  constructor(portServices) {
    // Inisialisasi dengan data port service
    this.portServices = portServices;
    this.usedPortsMap = {}; // Peta untuk menyimpan daftar port yang sudah terpakai
    this.allocations = {}; // Menyimpan hasil alokasi port
  }

  // Metode untuk menetapkan peta port yang sudah terpakai
  setUsedPortsMap(map) {
    this.usedPortsMap = map;
    return this; // Agar bisa chaining
  }

  // Fungsi untuk alokasikan port
  allocate() {
    for (const svc of this.portServices) {
      const { service_name, base_port, end_port, last_used_port } = svc;

      // Ambil daftar port yang sudah terpakai
      const usedPorts = new Set(this.usedPortsMap[service_name] || []);
      
      // Tentukan titik awal alokasi (port terakhir + 1 atau base_port)
      let start = last_used_port != null ? last_used_port + 1 : base_port;

      // Mencari port yang tersedia di dalam range
      let allocatedPort = null;
      for (let port = start; port <= end_port; port++) {
        if (!usedPorts.has(port)) {
          allocatedPort = port;
          break;
        }
      }

      // Jika tidak ada port tersedia dalam range, coba dari base_port lagi
      if (!allocatedPort) {
        for (let port = base_port; port < start; port++) {
          if (!usedPorts.has(port)) {
            allocatedPort = port;
            break;
          }
        }
      }

      // Jika tidak ada port yang tersedia, lemparkan error
      if (!allocatedPort) {
        throw new Error(`No available port for service: ${service_name}`);
      }

      // Simpan hasil alokasi untuk service ini
      this.allocations[service_name] = {
        port: allocatedPort,
        service_id: svc.id
      };
    }

    return this; // Agar bisa chaining lebih lanjut jika perlu
  }

  // Mengambil hasil alokasi port
  get() {
    return this.allocations;
  }
}

module.exports = PortAllocator;
