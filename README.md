# Belajar Vibe Coding - User Authentication API

Aplikasi ini adalah sebuah backend API (Application Programming Interface) untuk sistem autentikasi pengguna (*User Authentication*). Aplikasi ini menyediakan fitur bagi pengguna untuk mendaftar akun, melakukan login, melihat profil mereka saat ini, dan melakukan logout.

## 🏗️ Arsitektur & Struktur Folder

Proyek ini menggunakan arsitektur modular yang memisahkan antara *routing/controller*, *business logic* (service), dan konfigurasi database. Penamaan file (kecuali beberapa file entry) direkomendasikan menggunakan gaya `kebab-case` (misalnya `users-service.ts`).

Berikut adalah struktur folder utama dari proyek ini:
- `src/` - Folder utama untuk kode sumber backend aplikasi.
  - `app.ts` - Titik masuk aplikasi ElysiaJS dimana rute utama didefinisikan.
  - `db/` - File terkait konfigurasi dan skema database.
    - `index.ts` - Konfigurasi koneksi MySQL2 dan Drizzle ORM.
    - `schema.ts` - Berisi definisi tabel Drizzle Schema.
  - `routes/` - Tempat mendefinisikan *endpoint* API (mirip dengan tugas controller). Contoh: `users-route.ts`.
  - `services/` - Tempat untuk meletakkan *business logic*. Rute akan memanggil service ini untuk melakukan operasi database dan menangani logika yang kompleks. Contoh: `users-service.ts`.
- `tests/` - Folder untuk meletakkan file testing (contoh: `users.test.ts`).
- `drizzle/` - Folder *output* khusus yang dihasilkan saat meng-generate migrasi database lewat Drizzle.
- `index.ts` - *Entry point* server untuk menjalankan aplikasi penuh menggunakan Bun.
- `drizzle.config.ts` - File konfigurasi untuk *Drizzle-kit* (alat pembuat skema tabel dan migrasi database ke MySQL).

## 🔌 API yang Tersedia

Seluruh request/response (terutama pada rute API `/api/*`) menggunakan format JSON. Beberapa rute juga diamankan dan hanya dapat diakses dengan mengirimkan *Authorization Header* dalam format: `Authorization: Bearer <token>`.

- `GET /` - Endpoint *Hello World* standard.
- `GET /health` - Endpoint *Health check* untuk memastikan server menyala. Menghasilkan response `{"status": "ok"}`.
- `POST /api/users` - Endpoint untuk **Registrasi** *user* baru.
  - **Body (JSON):** Membutuhkan payload berupa field `name`, `email`, dan `password`.
- `POST /api/users/login` - Endpoint untuk **Login** pengguna.
  - **Body (JSON):** Membutuhkan payload berupa field `email` dan `password`.
  - **Response:** Jika sukses, akan mengembalikan token sesi (session token) yang akan digunakan untuk mengakses API terproteksi.
- `GET /api/users/current` - Endpoint untuk mendapatkan data profil *user* yang sedang *login*.
  - **Header:** Wajib menyertakan *Authorization Bearer token*.
  - **Response:** Data profil lengkap pengguna.
- `DELETE /api/logout` - Endpoint untuk melakukan proses **logout** dan menghapus token sesi di database.
  - **Header:** Wajib menyertakan *Authorization Bearer token*.

## 🗄️ Skema Database

Sistem ini didukung oleh 2 tabel utama di dalam database MySQL, yaitu:

1. **Tabel `users`:**
   - `id`: Integer, Primary Key, Auto Increment.
   - `name`: Varchar(255), Not Null.
   - `email`: Varchar(255), Not Null, Unique (Tidak boleh sama antar user).
   - `password`: Varchar(255), Not Null (Disimpan setelah di-hash).
   - `createdAt`: Timestamp, Default Current Time (Kapan user terdaftar).

2. **Tabel `sessions`:**
   - `id`: Integer, Primary Key, Auto Increment.
   - `token`: Varchar(255), Not Null (Token unik untuk menandakan session / login status).
   - `userId`: Integer, Foreign Key (Merujuk dan berelasi ke kolom `users.id`).
   - `createdAt`: Timestamp, Default Current Time.

## 🛠️ Technology Stack & Library

**Technology Stack Utama:**
- **Runtime:** [Bun](https://bun.sh/) (Runtime JavaScript *all-in-one* yang luar biasa cepat)
- **Framework Web:** [ElysiaJS](https://elysiajs.com/)
- **Bahasa Pemrograman:** TypeScript
- **Database Relasional:** MySQL
- **ORM (Object-Relational Mapping):** Drizzle ORM

**Library / Dependency yang Digunakan:**
- `elysia` - Core library untuk menyalakan web server (berjalan di atas Bun).
- `drizzle-orm` - Library ORM modern untuk berinteraksi dengan database SQL secara kuat (*Type-Safe*).
- `drizzle-kit` - Alat eksekusi (*Command Line Interface* / CLI) dari Drizzle untuk melakukan *push schema* dan manajemen database.
- `mysql2` - *Driver* Node.js / Bun standar untuk mengakses server MySQL.

## 🚀 Cara Setup Project

Untuk mengembangkan proyek ini secara mandiri (*local dev*), ikuti langkah-langkah di bawah ini:

1. Pastikan Anda sudah menginstal **[Bun](https://bun.sh/)** di laptop/komputer Anda dan menyiapkan **MySQL** Server yang sudah berjalan.
2. Lakukan clone ke repositori aplikasi ini.
3. Buka aplikasi Terminal favorit Anda, ubah *directory* ke dalam folder proyek.
4. Lakukan instalasi semua dependensi (*libraries*) dengan menjalankan perintah:
   ```bash
   bun install
   ```
5. Siapkan konfigurasi kredensial koneksi Database dengan membuat file environment variables:
   Buat file bernama `.env` di *root* direktori proyek, dan isikan informasi berikut (sesuaikan username/password dan nama DB Anda):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password_database_anda
   DB_NAME=belajar_vibe_coding
   PORT=3000
   ```
6. Lakukan penyesuaian/pembuatan (*generate*) database dan dorong tabel (skema) ke dalam MySQL menggunakan Drizzle lewat perintah di bawah:
   ```bash
   bun run db:generate
   bun run db:push
   ```

## ▶️ Cara Run Aplikasi

Untuk menjalankan *local server* pada mode *development* (dilengkapi dengan *live-reloading*/*watch mode* yang dapat memantau perubahan file kode), jalankan:

```bash
bun run dev
```

Aplikasi akan berjalan dan bisa diakses. Secara default ada di `http://localhost:3000` (atau port alternatif lain yang berhasil Anda definisikan lewat variabel `PORT` di file `.env`).

## 🧪 Cara Test Aplikasi

Karena arsitekturnya sepenuhnya menggunakan ekosistem Bun, pengujian otomatis (Testing) dimanfaatkan melalui fitur bawaan test runner dari `bun test`, terintegrasi tanpa perlu meng-install *Jest* atau sejenisnya. Anda bisa menempatkan seluruh file pengujian di folder `tests/`.

Untuk mengeksekusi semua *test case* bawaan, jalankan perintah di bawah ini dari terminal:

```bash
bun test
```
