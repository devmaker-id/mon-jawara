class KeuanganController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const summary = {
      today: 1500000,
      week: 8700000,
      month: 32950000
    };
    
    const transactions = [
      { date: "2025-07-14", name: "Ahmad", type: "Pembayaran Paket", amount: 250000, status: "berhasil" },
      { date: "2025-07-13", name: "Budi", type: "Pembayaran Paket", amount: 300000, status: "berhasil" },
      { date: "2025-07-13", name: "Siti", type: "Deposit", amount: 1000000, status: "pending" },
      { date: "2025-07-12", name: "Joko", type: "Pembayaran Paket", amount: 275000, status: "berhasil" },
      { date: "2025-07-11", name: "Rina", type: "Pembayaran Paket", amount: 500000, status: "berhasil" }
    ];

      
    res.render("keuangan/index", {
      title: "Manajemen Keuangan",
      summary,
      transactions,
      flashData
    });
  }
  static async pengeluaran(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const expenses = [
      {
        id: 1,
        date: "2025-07-14",
        category: "Operasional",
        description: "Pembelian kabel UTP",
        amount: 250000
      },
      {
        id: 2,
        date: "2025-07-13",
        category: "Listrik",
        description: "Pembayaran PLN kantor",
        amount: 750000
      },
      {
        id: 3,
        date: "2025-07-13",
        category: "Perawatan",
        description: "Perbaikan server OLT",
        amount: 1000000
      },
      {
        id: 4,
        date: "2025-07-12",
        category: "Gaji Karyawan",
        description: "Gaji teknisi lapangan",
        amount: 3200000
      },
      {
        id: 5,
        date: "2025-07-11",
        category: "Lainnya",
        description: "Biaya operasional tidak terduga",
        amount: 200000
      }
    ];
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.render("keuangan/pengeluaran", {
      title: "Uang Keluar",
      expenses,
      total,
      flashData
    });
  }
  static async piutang(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const records = [
      { id: 1, name: 'Ahmad', type: 'hutang', date: '2025-07-14', amount: 500000, status: 'belum', note: 'Bayar nanti minggu depan' },
      { id: 2, name: 'Budi', type: 'piutang', date: '2025-07-13', amount: 800000, status: 'lunas', note: 'Pembayaran customer' },
      { id: 3, name: 'Siti', type: 'hutang', date: '2025-07-12', amount: 300000, status: 'lunas', note: 'Pinjaman karyawan' },
      { id: 4, name: 'Joko', type: 'piutang', date: '2025-07-11', amount: 1200000, status: 'belum', note: 'Customer telat bayar' },
      { id: 5, name: 'Rina', type: 'hutang', date: '2025-07-10', amount: 450000, status: 'belum', note: 'Operasional kasbon' },
    ];
    
    const totalHutang = records
      .filter(r => r.type === 'hutang')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const totalPiutang = records
      .filter(r => r.type === 'piutang')
      .reduce((sum, r) => sum + r.amount, 0);


    res.render("keuangan/piutang", {
      title: "Hutang Piutang",
      records,
      totalHutang,
      totalPiutang,
      flashData
    });
  }
  
}

module.exports = KeuanganController;