# Analytics Platform — Backend (NestJS)

REST API với PostgreSQL, TypeORM, JWT (`Bearer`), bcrypt (12 rounds), validation toàn cục và lỗi JSON thống nhất.

## Biến môi trường

Xem `.env.example`. Tối thiểu cần:

- `PORT` (mặc định `3001` nếu không set)
- `DATABASE_URL` **hoặc** `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`
- `JWT_SECRET` — **ít nhất 32 ký tự ngẫu nhiên** trên production
- `JWT_EXPIRES_IN` — ví dụ `7d`, `12h`, `3600s` (chuỗi `ms` format của jsonwebtoken)
- `CORS_ORIGIN` hoặc `FRONTEND_URL` — có thể **danh sách URL cách nhau bởi dấu phẩy** (production + preview Vercel). Express không hỗ trợ wildcard `*.vercel.app`; hãy thêm từng origin preview nếu cần.

### TypeORM `synchronize`

- **Development:** mặc định `synchronize: true` khi `NODE_ENV !== production` (tạo/cập nhật schema theo entity).
- **Production (Render):** đặt `NODE_ENV=production` → `synchronize: false` mặc định. **Bắt buộc** chạy migration (hoặc tạo schema một lần có kiểm soát) — **không** bật `synchronize` trên DB production.

Ghi đè tùy chọn:

- `TYPEORM_SYNCHRONIZE=true|false`
- `TYPEORM_LOGGING=true` để bật log SQL

### Migration (khuyến nghị production)

1. Cài CLI TypeORM và tạo migration từ entity (một lần khi đã ổn định schema).
2. Trên Render: chạy migration trong release command hoặc job một lần trước khi traffic vào.

Ít nhất hãy giữ `synchronize: false` trên production và có quy trình migration rõ ràng; repo này ưu tiên dev nhanh với sync, production an toàn với sync tắt.

## Chạy local

```bash
cd backend
cp .env.example .env
# chỉnh DATABASE_URL / JWT_SECRET
npm install
npm run start:dev
```

Cần PostgreSQL (Docker ví dụ ở README gốc repo).

## Health check

`GET /health` → `{ "status": "ok" }` (HTTP 200) — dùng cho Render Health Check / Uptime.

## API Auth

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/auth/register` | Body: `{ "email", "password", "name?" }` — không trả hash |
| POST | `/auth/login` | Body: `{ "email", "password" }` → `{ accessToken, user }` |
| GET | `/auth/me` | Header `Authorization: Bearer <token>` — profile user |

## Ví dụ `curl`

```bash
BASE=http://localhost:3001

curl -sS -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123","name":"Demo"}'

curl -sS -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

TOKEN=... # accessToken từ login

curl -sS "$BASE/auth/me" -H "Authorization: Bearer $TOKEN"
```

Lỗi trả dạng JSON: `{ "statusCode", "message", "error" }` (401 / 400 / 409, …).

## Deploy Render.com

1. **PostgreSQL** trên Render → copy **Internal Database URL** hoặc **External** vào `DATABASE_URL` của Web Service.
2. **Web Service** (Node):
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start:prod` (chạy `node dist/main`)
   - **Health check path:** `/health`
3. **Environment:** `NODE_ENV=production`, `JWT_SECRET` (dài, ngẫu nhiên), `JWT_EXPIRES_IN`, `CORS_ORIGIN` trỏ tới domain Vercel (prod + các preview URL cụ thể).
4. **Cold start:** gói free có thể “ngủ” sau idle; request đầu có thể chậm vài giây — bình thường trên tier miễn phí.

## CORS & cookie BFF

Backend nhận `Authorization: Bearer` từ **server** Next.js (Route Handler), không nhất thiết cần cookie. `credentials: true` + origin đúng giúp nếu sau này gọi trực tiếp từ browser có cookie session.
