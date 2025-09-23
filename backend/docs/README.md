# API Documentation

## Swagger UI

Dự án này sử dụng Swagger/OpenAPI 3.0 để tài liệu hóa API.

### Truy cập Swagger UI

1. **Khởi động server backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Truy cập Swagger UI:**
   ```
   http://localhost:3000/docs
   ```

### Cấu trúc Documentation

#### 1. File `swagger.yaml` (Primary)
- Chứa toàn bộ API specification theo chuẩn OpenAPI 3.0
- Single source of truth cho API documentation
- Bao gồm schemas, paths, components, security
- Dễ dàng chỉnh sửa và maintain

#### 2. Simple Comments trong Routes
- Các route files có comment đơn giản cho developers
- Không duplicate với YAML documentation
- Giữ code clean và readable

### API Endpoints

#### Authentication
- `POST /api/users/register` - Đăng ký user mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Lấy thông tin profile (cần token)

#### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có filter)
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `GET /api/products/best-seller` - Sản phẩm bán chạy
- `GET /api/products/new-arrivals` - Sản phẩm mới
- `POST /api/products` - Tạo sản phẩm mới (Admin only)

#### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm sản phẩm vào giỏ
- `PUT /api/cart` - Cập nhật số lượng
- `DELETE /api/cart` - Xóa giỏ hàng

#### Orders
- `GET /api/orders/my-orders` - Lấy đơn hàng của user
- `GET /api/orders/{id}` - Chi tiết đơn hàng

#### Upload
- `POST /api/upload` - Upload hình ảnh (Cloudinary)

#### Admin APIs
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/products` - Quản lý products
- `GET /api/admin/orders` - Quản lý orders

### Authentication

API sử dụng JWT Bearer Token authentication:

```javascript
Authorization: Bearer <your-jwt-token>
```

### Test API

1. **Đăng nhập với admin account:**
   ```json
   {
     "email": "admin@example.com",
     "password": "8di0ha66"
   }
   ```

2. **Sử dụng token nhận được** để test các protected endpoints

3. **Authorize trong Swagger UI:**
   - Click nút "Authorize" 
   - Nhập: `Bearer <your-token>`
   - Click "Authorize"

### Environment Variables

Đảm bảo file `.env` có đầy đủ:

```env
PORT=3000
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
NODE_ENV=development
```

### Dependencies

Package `yamljs` đã được thêm vào dependencies. Chỉ cần:

```bash
npm install
```

### Cấu trúc Files

```
backend/
├── docs/
│   ├── swagger.yaml      # Main API documentation
│   └── README.md         # This file
├── swagger.js            # Swagger configuration
├── routes/               # Route files with JSDoc
└── server.js             # Main server file
```

### Mở rộng Documentation

1. **Thêm API mới vào `swagger.yaml`**
2. **Thêm simple comment vào route file cho developers**
3. **Restart server để cập nhật**

### Troubleshooting

1. **"No operations defined in spec!"**
   - Kiểm tra file `swagger.yaml` syntax
   - Kiểm tra đường dẫn tới file YAML

2. **Cannot load swagger.yaml**
   - Đảm bảo file `yamljs` đã được cài: `npm install`
   - Kiểm tra file `docs/swagger.yaml` tồn tại

3. **Authentication không hoạt động**
   - Kiểm tra JWT_SECRET trong `.env`
   - Đảm bảo token format: `Bearer <token>`
