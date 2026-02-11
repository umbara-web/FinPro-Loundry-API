# Backend API - Address Management

Backend Express.js dengan Prisma untuk mengelola data alamat.

## 📁 Struktur Folder

```
src/
├── config/          # Konfigurasi (env, prisma client)
├── controllers/     # Controller untuk handle request/response
├── lib/            # Library (Prisma client)
├── router/         # Route definitions
├── services/       # Business logic
└── main.ts         # Entry point aplikasi
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat file `.env` di root folder dengan isi:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
NODE_ENV="development"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

atau jika sudah ada database:

```bash
npx prisma db push
```

### 5. Jalankan Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Server akan berjalan di `http://localhost:8000`

## 📡 API Endpoints

### POST `/api/addresses`
Membuat alamat baru

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "081234567890",
  "address": "Jl. Contoh No. 123, RT 01/RW 02",
  "city": "Jakarta",
  "postalCode": "12345"
}
```

**Response (201):**
```json
{
  "message": "Alamat berhasil disimpan",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "081234567890",
    "address": "Jl. Contoh No. 123, RT 01/RW 02",
    "city": "Jakarta",
    "postalCode": "12345",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/addresses`
Mendapatkan semua alamat

**Response (200):**
```json
{
  "message": "Data alamat berhasil diambil",
  "data": [...]
}
```

### GET `/api/addresses/:id`
Mendapatkan alamat berdasarkan ID

**Response (200):**
```json
{
  "message": "Data alamat berhasil diambil",
  "data": {...}
}
```

## 🔗 Koneksi dengan Frontend

### Opsi 1: Frontend Next.js dengan API Route Proxy

Jika frontend Next.js, buat file `pages/api/addresses.ts` atau `app/api/addresses/route.ts`:

```typescript
// app/api/addresses/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
```

### Opsi 2: Frontend Langsung ke Backend

Ubah URL di frontend menjadi:

```typescript
const response = await fetch('http://localhost:8000/api/addresses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});
```

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **Prisma** - ORM untuk database
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## 📝 Notes

- Pastikan database sudah running sebelum menjalankan server
- CORS sudah dikonfigurasi untuk development (allow all origins)
- Untuk production, ubah CORS origin ke domain spesifik

