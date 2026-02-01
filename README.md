## MON JAWARA

monitor jaringan jawara

## update 01/02/2026
menambah catatan piutang, closingan, cek redaman onu, maping odp, whatsapp bot

## update 24/10/2025
tambah telnet, olt hisfocus, cek detail onu

## update 04/04/2025
```
Perbaiki logika login
```
## create app 03/04/2025
## pembuatan database

name database = db_mon_jawara

```
CREATE TABLE tbl_users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- ID user yang unik
    telegram_id VARCHAR(255) DEFAULT NULL,  -- ID Telegram, bisa null
    username VARCHAR(255) NOT NULL,  -- Username pengguna
    password VARCHAR(255) NOT NULL,  -- Password pengguna
    fullname VARCHAR(255),  -- Nama lengkap pengguna
    telepon VARCHAR(15),  -- Nomor telepon pengguna
    email VARCHAR(255),  -- Email pengguna
    alamat TEXT,  -- Alamat pengguna
    api_key VARCHAR(64) NOT NULL,  -- API Key untuk autentikasi pengguna
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Tanggal dan waktu pembuatan
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Tanggal dan waktu pembaruan
);
data dumy
INSERT INTO tbl_users (telegram_id, username, password, fullname, telepon, email, alamat, api_key, created_at, updated_at)
VALUES
  (NULL, 'admin', '$2a$10$OojXy5D4yfRmrIo5ZCjlDe82Xn1L69sJYm6zzsGpKUEuZRjJ.qRra', 'Admin User', '081234567890', 'admin@example.com', 'Jl. Admin No. 1', 'Testing1234', NOW(), NOW());

```

# request log api curl
`validasi dengan apikey yang ada di tbl_users.api_key`
curl -X POST http://localhost:3000/log/jawara -H "Content-Type: application/json" -H "x-api-key: d643b321fe51c359d6b1d045407a2de2916d1c9db0f0c2c8f43c59d5c0b1558a" -d "{"log": "Testing Log Client, OK\"}"

#buat bash script
```
#!/bin/bash

# Baca log dari rsyslog (STDIN)
while read log; do
    # Membersihkan log untuk memastikan format JSON yang valid
    clean_log=$(echo "$log" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

    # Kirim log ke server Node.js dengan curl
    response=$(curl -X POST "http://localhost:3000/log/jawara" \
        -H "Content-Type: application/json" \
        -H "x-api-key: d643b321fe51c359d6b1d045407a2de2916d1c9db0f0c2c8f43c59d5c0b1558a" \
        -d "{\"log\": \"$clean_log\"}" 2>&1)

    # Cek apakah curl gagal dan log hasilnya jika gagal
    if [ $? -ne 0 ]; then
        echo "$(date) - Gagal kirim log: $log" >> /home/jawara/log_gagal.log
        echo "$response" >> /home/jawara/log_gagal.log
    fi
done
```

