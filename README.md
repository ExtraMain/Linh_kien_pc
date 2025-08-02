
# BaiTapNhom

##### *Thay đổi tên thư mục thành BaiTapNhom

# Hướng Dẫn Chạy Dự Án ReactJS Trên Windows và XAMPP

## Bước 1: Cài đặt Node.js

1. Truy cập trang [https://nodejs.org/](https://nodejs.org/)
2. Tải phiên bản **LTS** phù hợp với Windows
3. Cài đặt như phần mềm thông thường (Next → Next → Finish)

> Sau khi cài đặt xong, mở **Command Prompt** (cmd) và kiểm tra:

```bash
node -v
npm -v
```

Nếu cả hai lệnh đều trả về phiên bản (ví dụ `v20.x.x`), bạn đã cài thành công.

---

## Bước 2: Tải Dự Án Về

Bạn có thể tải code bằng Git hoặc tải file ZIP:

### ✅ Cách 1: Clone bằng Git

```bash
https://github.com/Theghost6/BaiTapNhom.git
cd BaiTapNhom
```

### ✅ Cách 2: Tải file ZIP

1. Truy cập GitHub → bấm nút **Code** → chọn **Download ZIP**
2. Giải nén ra thư mục ra `BaiTapNhom`
3. Và di chuyển vào thư mục đó:

Nếu dùng linux thì
```bash
cd BaiTapNhom
```
 
---

## Bước 3: Cài đặt thư viện với npm

Trong thư mục dự án, chạy lệnh:

```bash
npm install
```
Trong terminal(`linux`) hoặc command prompt (`Windows`)


Lệnh này sẽ tự động tải tất cả các thư viện phụ thuộc từ file `package.json`.

---

## Bước 4: Chạy dự án React

Tùy theo công nghệ dùng trong dự án, chạy lệnh sau:

### 👉 Dự án dùng **Vite**:

```bash
npm run dev
```

> Mặc định chạy ở địa chỉ: [http://localhost:5173](http://localhost:5173)

## Bước 5: Đưa Dự Án Vào Thư Mục XAMPP (htdocs)

1. Mở thư mục cài đặt XAMPP (mặc định là `C:\xampp\htdocs`)
2. Di chuyển thư mục dự án (`BaiTapNhom`) vào `htdocs` (Lưu ý phải là `BaiTapNhom`)

```
C:\xampp\htdocs\BaiTapNhom\
```

---
Muốn chạy chat tư vấn thì

vào folder \BaiTapNhom\src\page\chat

```
 node server.cjs
```
## 🎉 Hoàn Thành!

Bạn đã:
- ✅ Cài đặt Node.js
- ✅ Tải project về và cài thư viện
- ✅ Chạy project với `npm run dev`
- ✅ (Tuỳ chọn) Deploy vào XAMPP nếu cần

---

By NTS
