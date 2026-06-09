#  Expense Tracker Application

Full-stack personal finance manager built with **Java 17 + Spring Boot 3 + MySQL + React (Vite)**.

---

##  Project Structure

```
expense-tracker/
├── backend/                    ← Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/expensetracker/
│       ├── ExpenseTrackerApplication.java
│       ├── config/
│       │   └── SecurityConfig.java         ← JWT + CORS config
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── IncomeController.java
│       │   ├── ExpenseController.java
│       │   └── DashboardController.java
│       ├── dto/
│       │   ├── request/   (RegisterRequest, LoginRequest, IncomeRequest, ExpenseRequest)
│       │   └── response/  (AuthResponse, IncomeResponse, ExpenseResponse, DashboardResponse, ApiResponse)
│       ├── entity/
│       │   ├── User.java
│       │   ├── Income.java
│       │   └── Expense.java
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ResourceNotFoundException.java
│       │   ├── BadRequestException.java
│       │   └── UnauthorizedException.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── IncomeRepository.java
│       │   └── ExpenseRepository.java
│       ├── security/
│       │   ├── JwtUtils.java
│       │   ├── JwtAuthFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── service/
│           ├── AuthService.java
│           ├── IncomeService.java
│           ├── ExpenseService.java
│           └── DashboardService.java
│
└── frontend/                   ← React + Vite UI
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        └── App.jsx             ← Full single-file React app
```

---

##  Prerequisites

| Tool        | Version   | Download |
|-------------|-----------|----------|
| Java        | 17+       | https://adoptium.net |
| Maven       | 3.8+      | https://maven.apache.org |
| MySQL       | 8.0+      | https://dev.mysql.com/downloads |
| Node.js     | 18+       | https://nodejs.org |
| npm         | 9+        | Bundled with Node |

---

##  Database Setup

```sql
-- Run in MySQL Workbench or CLI
CREATE DATABASE expense_tracker_db;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON expense_tracker_db.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
```

> Hibernate auto-creates tables on first run (`ddl-auto=update`). No SQL scripts needed.

---

##  Backend Setup

### 1. Configure Database

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root          # ← change to your MySQL username
spring.datasource.password=root          # ← change to your MySQL password

# JWT Secret — change this in production!
app.jwt.secret=MyExpenseTrackerSuperSecretKeyForJWT2024!ChangeInProd
app.jwt.expiration-ms=86400000           # 24 hours
```

### 2. Build & Run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend starts on: **http://localhost:8080**

---

##  Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on: **http://localhost:3000**

> The Vite dev server proxies `/api` calls to `http://localhost:8080` automatically.

---

##  API Endpoints

### Auth (Public)
| Method | Endpoint              | Body                          | Description         |
|--------|-----------------------|-------------------------------|---------------------|
| POST   | `/api/auth/register`  | `{name, email, password}`     | Register new user   |
| POST   | `/api/auth/login`     | `{email, password}`           | Login, returns JWT  |

### Income ( JWT Required)
| Method | Endpoint              | Body                                    | Description         |
|--------|-----------------------|-----------------------------------------|---------------------|
| GET    | `/api/incomes`        | —                                       | Get all incomes     |
| GET    | `/api/incomes/{id}`   | —                                       | Get income by ID    |
| POST   | `/api/incomes`        | `{amount, source, date, description}`   | Add income          |
| PUT    | `/api/incomes/{id}`   | `{amount, source, date, description}`   | Update income       |
| DELETE | `/api/incomes/{id}`   | —                                       | Delete income       |

### Expenses ( JWT Required)
| Method | Endpoint              | Body                                      | Description         |
|--------|-----------------------|-------------------------------------------|---------------------|
| GET    | `/api/expenses`       | —                                         | Get all expenses    |
| GET    | `/api/expenses/{id}`  | —                                         | Get expense by ID   |
| POST   | `/api/expenses`       | `{amount, category, date, description}`   | Add expense         |
| PUT    | `/api/expenses/{id}`  | `{amount, category, date, description}`   | Update expense      |
| DELETE | `/api/expenses/{id}`  | —                                         | Delete expense      |

### Dashboard ( JWT Required)
| Method | Endpoint         | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/api/dashboard` | Total income, expense, balance, monthly summary, recent transactions |

---

##  Testing with Postman

### Step 1 — Register
```json
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Step 2 — Login (copy the token)
```json
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Step 3 — Use the token
Add header to all protected requests:
```
Authorization: Bearer <your-jwt-token>
```

### Step 4 — Add Income
```json
POST http://localhost:8080/api/incomes
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000.00,
  "source": "Salary",
  "date": "2026-06-01",
  "description": "Monthly salary"
}
```

### Step 5 — Add Expense
```json
POST http://localhost:8080/api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.00,
  "category": "Food",
  "date": "2026-06-05",
  "description": "Groceries"
}
```

---

##  Frontend Features

| Page       | Features                                                                 |
|------------|--------------------------------------------------------------------------|
| Auth       | Register / Login with validation, JWT stored in localStorage             |
| Dashboard  | Total income, expense, balance, monthly summary, 8 recent transactions   |
| Income     | List all, Add, Edit, Delete with source selector                         |
| Expenses   | List all, Add, Edit, Delete with category selector                       |

---

##  Architecture

```
React (Vite)  →  Spring Boot Controller  →  Service  →  Repository (JPA)  →  MySQL
     ↑                   ↑
  JWT Token        Spring Security Filter
```

### Security Flow
1. Client sends `POST /api/auth/login` → receives JWT token
2. Client includes `Authorization: Bearer <token>` on all subsequent requests
3. `JwtAuthFilter` intercepts every request, validates token
4. If valid, sets `SecurityContext` → request proceeds
5. If invalid/missing → 401 Unauthorized

---

##  Security Notes

- Passwords hashed with **BCrypt** (Spring Security default strength)
- JWT signed with **HS256** (HMAC-SHA256)
- Token expires in **24 hours**
- All endpoints except `/api/auth/**` require authentication
- Each user can only access **their own data** (owner validation in service layer)

---

##  Production Checklist

- [ ] Change `app.jwt.secret` to a strong random secret (32+ chars)
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (never `update` in production)
- [ ] Use environment variables for DB credentials
- [ ] Enable HTTPS
- [ ] Run `npm run build` and serve the `dist/` folder via Nginx or Spring Boot static resources
- [ ] Set `spring.jpa.show-sql=false`

---

##  Tech Stack Summary

| Layer          | Technology                      |
|----------------|---------------------------------|
| Language       | Java 17                         |
| Framework      | Spring Boot 3.2.5               |
| Security       | Spring Security 6 + JWT (jjwt)  |
| ORM            | Spring Data JPA + Hibernate 6   |
| Database       | MySQL 8                         |
| Build Tool     | Maven 3                         |
| Frontend       | React 18 + Vite 5               |
| Styling        | Pure CSS-in-JS (no dependencies)|

---

*Built with — Expense Tracker v1.0*
