# TrackMate - Laravel + MySQL + Angular Fullstack

## Projekt áttekintés

A TrackMate egy költségvetés-kezelő alkalmazás **Angular 17+** frontenddel és **Laravel 12+** backenddel, **MySQL** adatbázissal.

**Korábbi verzió**: Node.js + JSON fájl alapú tárolás  
**Jelenlegi verzió**: Laravel + MySQL + Sanctum token alapú autentikáció

---

## Mappa szerkezet

```
c:/ge/trackmate/
├── src/                              # Angular frontend
│   ├── app/
│   │   ├── calendar-calculator/      # Fő alkalmazás (naptár + költések)
│   │   ├── dashboard/                # Admin felület
│   │   ├── login/                    # Bejelentkezés / regisztráció
│   │   ├── welcome/                  # Kezdőlap
│   │   ├── components/
│   │   │   └── toast/                # Értesítések
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts   # Bearer token automatikus küldése
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── theme.model.ts
│   │   │   └── api.model.ts
│   │   ├── services/
│   │   │   ├── budget.service.ts     # Fő szolgáltatás (API hívások)
│   │   │   ├── auth.guard.ts         # Bejelentkezés védelem
│   │   │   ├── theme.service.ts
│   │   │   ├── error.service.ts
│   │   │   └── loading.service.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts            # Dev API URL: http://localhost:8000/api
│   │   └── environment.prod.ts       # Prod API URL: http://localhost:8000/api
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── trackmate-fullstack/
│   └── backend/                      # Laravel backend
│       ├── app/
│       │   ├── Http/
│       │   │   ├── Controllers/
│       │   │   │   ├── AuthController.php
│       │   │   │   ├── UserController.php
│       │   │   │   ├── ExpenseController.php
│       │   │   │   ├── FixedDeductionController.php
│       │   │   │   ├── NotificationController.php
│       │   │   │   └── AdminController.php
│       │   │   └── Middleware/
│       │   │       └── AdminMiddleware.php
│       │   └── Models/
│       │       ├── User.php
│       │       ├── Expense.php
│       │       ├── FixedDeduction.php
│       │       └── Notification.php
│       ├── bootstrap/
│       ├── config/
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       │       └── DatabaseSeeder.php
│       ├── routes/
│       │   ├── api.php               # API végpontok
│       │   └── web.php
│       ├── public/
│       ├── storage/
│       ├── vendor/                   # Composer csomagok
│       ├── artisan
│       ├── composer.json
│       └── .env                      # Környezeti változók (mysql beállítás!)
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Követelmények

### Szerver (gépre telepítendő)

| Szoftver | Min. verzió | Letöltés |
|----------|-------------|----------|
| PHP | 8.2 | https://windows.php.net/download |
| Composer | 2.x | https://getcomposer.org/download/ |
| MySQL / MariaDB | 8.0+ | XAMPP, WAMP vagy önálló |
| Node.js | 18+ | https://nodejs.org/ |
| Angular CLI | 17+ | `npm install -g @angular/cli` |

### PHP kiterjesztések (php.ini)

Győződj meg róla, hogy a következő kiterjesztések engedélyezve vannak a `php.ini`-ben:

```ini
extension=pdo_mysql
extension=zip
extension=fileinfo
extension=openssl
```

---

## API Végpontok

### Publikus (nem kell token)

| Módszer | Végpont | Leírás |
|---------|---------|--------|
| POST | `/api/register` | Regisztráció |
| POST | `/api/login` | Bejelentkezés |
| GET | `/api/ping` | Szerver státusz |

### Védett (Bearer token szükséges)

| Módszer | Végpont | Leírás |
|---------|---------|--------|
| POST | `/api/logout` | Kijelentkezés |
| GET | `/api/me` | Bejelentkezett felhasználó adatai |
| GET | `/api/user` | User profil |
| POST | `/api/user` | User adatok mentése |
| POST | `/api/user/salary` | Fizetés frissítése |
| GET | `/api/expenses` | Költések listázása |
| POST | `/api/expenses` | Új költés |
| PUT | `/api/expenses/{id}` | Költés módosítása |
| DELETE | `/api/expenses/{id}` | Költés törlése |
| GET | `/api/deductions` | Fix kiadások |
| POST | `/api/deductions` | Új fix kiadás |
| PUT | `/api/deductions/{id}` | Fix kiadás módosítása |
| DELETE | `/api/deductions/{id}` | Fix kiadás törlése |
| GET | `/api/notifications` | Értesítések |
| POST | `/api/notifications` | Új értesítés |
| PUT | `/api/notifications/{id}` | Értesítés módosítása |
| DELETE | `/api/notifications/{id}` | Értesítés törlése |

### Admin (Bearer token + is_admin = true)

| Módszer | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/admin/users` | Összes felhasználó |
| POST | `/api/admin/users` | Új felhasználó létrehozása |
| GET | `/api/admin/users/{id}` | Felhasználó részletei |
| PUT | `/api/admin/users/{id}` | Felhasználó módosítása |
| DELETE | `/api/admin/users/{id}` | Felhasználó törlése |
| GET | `/api/admin/stats` | Statisztikák |

---

## Telepítési lépések

### 1. MySQL adatbázis létrehozása

Hozd létre a `trackmate` adatbázist MySQL-ben (phpMyAdmin, MySQL Workbench vagy parancssor):

```sql
CREATE DATABASE trackmate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Laravel backend beállítása

Nyisd meg a `trackmate-fullstack/backend/.env` fájlt, és állítsd be a MySQL kapcsolatot:

```env
APP_NAME=TrackMate
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackmate
DB_USERNAME=root
DB_PASSWORD=
```

**FONTOS**: A `DB_PASSWORD` mezőt töltsd ki a saját MySQL jelszavad szerint (XAMPP-nál általában üres).

### 3. Composer függőségek telepítése

```powershell
cd C:\ge\trackmate\trackmate-fullstack\backend
composer install
```

Ha hibát kapsz a `zip extension`-nel kapcsolatban, engedélyezd a `php.ini`-ben:

```ini
extension=zip
```

### 4. Migráció és seedelés

```powershell
cd C:\ge\trackmate\trackmate-fullstack\backend
php artisan migrate --seed
```

Ez létrehozza az összes táblát és feltölti a super admin felhasználót.

### 5. Laravel szerver indítása

```powershell
cd C:\ge\trackmate\trackmate-fullstack\backend
php artisan serve
```

A szerver elérhető lesz: **http://localhost:8000**

### 6. Angular frontend függőségek telepítése

Nyiss egy **új** terminált:

```powershell
cd C:\ge\trackmate
npm install
```

### 7. Angular szerver indítása

```powershell
cd C:\ge\trackmate
ng serve
```

A frontend elérhető lesz: **http://localhost:4200**

---

## Belépési adatok (seedelés után)

| Szerep | Felhasználónév | Jelszó |
|--------|---------------|--------|
| Super Admin | `admin` | `admin123` |
| Teszt user | `test` | `test1234` |

---

## Fejlesztői parancsok

### Laravel

```powershell
# Szerver indítása
php artisan serve

# Új migráció
php artisan make:migration create_tabla_neve

# Migráció futtatása
php artisan migrate

# Adatbázis újraseedelése
php artisan migrate:fresh --seed

# Route-ok listázása
php artisan route:list
```

### Angular

```powershell
# Szerver indítása
ng serve

# Build (fejlesztői)
ng build

# Build (produkciós)
ng build --configuration production

# Új komponens
ng generate component komponens-neve

# Új szolgáltatás
ng generate service services/szolgaltatas-neve
```

---

## Hibaelhárítás

### CORS hiba

Ha a böngésző CORS hibát jelez, ellenőrizd, hogy a Laravel `.env`-ben:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200
```

### "No such file or directory" vendor mappában

```powershell
composer install
```

### Token érvénytelenség

Töröld a böngésző `localStorage`-át (`F12 → Application → Local Storage → Clear`) és jelentkezz be újra.

### MySQL kapcsolat sikertelen

Ellenőrizd a `trackmate-fullstack/backend/.env` fájlt, és győződj meg róla, hogy:
- A MySQL szerver fut (XAMPP Control Panel)
- A `DB_DATABASE=trackmate` adatbázis létezik
- A `DB_USERNAME` és `DB_PASSWORD` helyes

---

## Technológiai stack

| Réteg | Technológia |
|-------|-------------|
| Frontend | Angular 17+, TypeScript, Standalone Components |
| Styling | CSS3, Responsive |
| HTTP Client | Angular HttpClient + RxJS |
| Backend | Laravel 12+ (PHP 8.2+) |
| Autentikáció | Laravel Sanctum (Bearer Token) |
| Adatbázis | MySQL 8.0+ |
| ORM | Eloquent |
| API | REST JSON |

---

## Jogi információ

Ez egy oktatási/fejlesztési projekt. A super admin jelszót (`admin123`) éles környezetben mindenképp változtasd meg!

