# TrackMate – Költségvetés-kezelő Rendszer Dokumentáció

## Technológiai összefoglaló

**Backend:** PHP 8.2 · Laravel 12 · Laravel Sanctum · MySQL  
**Frontend:** Angular 17+ · TypeScript · CSS3  
**Eszközök:** Visual Studio Code · Git

---

## Tartalomjegyzék

1. Bevezetés
2. Fejlesztői dokumentáció – Backend
   2.1. Fejlesztéshez használt eszközök és technológiák
   2.2. Adatbázis felépítés
   2.3. Mappa struktúra
   2.4. Környezeti változók (.env)
   2.5. API végpontok
   2.6. Kontrollerek és szervizek
   2.7. Autentikáció – Laravel Sanctum
   2.8. Továbbfejlesztési lehetőségek
3. Fejlesztői dokumentáció – Frontend
   3.1. Mappa struktúra
   3.2. Fejlesztéshez használt eszközök és technológiák
   3.3. Komponensek
   3.4. Szervizek
   3.5. Útvonalak és route-védők
   3.6. Adatmodellek (TypeScript interfészek)
   3.7. Továbbfejlesztési lehetőségek
4. Felhasználói kézikönyv
5. Telepítési útmutató
6. Összefoglalás

---

## 1. Bevezetés

A következő dokumentáció egy személyes költségvetés-kezelő alkalmazás, a TrackMate tervezését és megvalósítását mutatja be. A fejlesztés célja egy korszerű, webalapú platform létrehozása volt, amellyel a felhasználók nyomon követhetik havi bevételeiket és kiadásaikat, rögzíthetik a napi költéseiket, beállíthatják a fix kiadásaikat és értesítéseiket, valamint adminisztrátori felületen kezelhetik a rendszer felhasználóit.

A rendszer lehetővé teszi a havi fizetés rögzítését, fix kiadások (rezsi, albérlet, stb.) kezelését, napi költések rögzítését kategóriák szerint, értesítések beállítását (pl. számlafizetési emlékeztetők), valamint egy naptár nézetben áttekinthetővé teszi a költéseket. Az alkalmazás két jogosultsági szintet különböztet meg: **Admin** (super admin) és **Felhasználó** (normál bejelentkezett user).

Technikai összefoglaló: A backend Laravel 12 / PHP 8.2 alapon REST API-t biztosít MySQL adatbázissal, Laravel Sanctum token-alapú hitelesítéssel. A frontend Angular 17+ keretrendszerben készült, standalone komponens architektúrával, CSS3 stílusozással.

---

## 2. Fejlesztői dokumentáció – Backend

### 2.1. Fejlesztéshez használt eszközök és technológiák

| Eszköz / Technológia | Verzió | Felhasználás |
|---------------------|--------|--------------|
| PHP | 8.2+ | Szerveroldali programozási nyelv |
| Laravel | 12.x | PHP keretrendszer – routing, ORM, middleware |
| Laravel Sanctum | 4.x | Token-alapú API hitelesítés |
| MySQL | 8.0+ | Relációs adatbázis-kezelő rendszer |
| Composer | 2.x | PHP függőségkezelő |
| DBeaver | – | Adatbázis-kezelő GUI |
| Postman | – | API végpontok tesztelése |
| Visual Studio Code | – | Fejlesztői szövegszerkesztő |
| Git | – | Verziókezelő rendszer |

### 2.2. Adatbázis felépítés

Az adatbázis MySQL 8.0 alapon fut, a táblák és kapcsolataik Laravel migrációkon keresztül kerülnek létrehozásra. Az adatbázis öt fő táblából áll.

#### users – Felhasználók

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | bigint (PK) | Egyedi azonosító |
| name | string | Felhasználónév (belépéshez) |
| email | string (unique) | E-mail cím |
| password | string (hash) | Bcrypt-tel titkosított jelszó |
| salary | integer (default: 0) | Havi fizetés |
| is_admin | boolean (default: false) | Admin jogkör |
| email_verified_at | timestamp | E-mail megerősítés időpontja |
| created_at / updated_at | timestamp | Automatikus időbélyegek |

#### fixed_deductions – Fix kiadások

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | bigint (PK) | Egyedi azonosító |
| user_id | bigint (FK) | Kapcsolat a users táblával (cascade delete) |
| name | string | Kiadás megnevezése (pl. Rezsi) |
| amount | integer | Összeg forintban |
| created_at / updated_at | timestamp | Automatikus időbélyegek |

#### notifications – Értesítések / Emlékeztetők

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | bigint (PK) | Egyedi azonosító |
| user_id | bigint (FK) | Kapcsolat a users táblával (cascade delete) |
| name | string | Értesítés megnevezése |
| amount | integer | Összeg |
| day | tinyint (1-31) | A hónap napja, amikor esedékes |
| recurring | boolean (default: true) | Ismétlődő-e minden hónapban |
| created_at / updated_at | timestamp | Automatikus időbélyegek |

#### expenses – Költések

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | bigint (PK) | Egyedi azonosító |
| user_id | bigint (FK) | Kapcsolat a users táblával (cascade delete) |
| date | date | Költés dátuma |
| amount | integer | Költés összege forintban |
| description | string (nullable) | Leírás, kategória |
| created_at / updated_at | timestamp | Automatikus időbélyegek |

### 2.3. Mappa struktúra

```
trackmate-fullstack/backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── ExpenseController.php
│   │   │   ├── FixedDeductionController.php
│   │   │   ├── NotificationController.php
│   │   │   └── AdminController.php
│   │   └── Middleware/
│   │       └── AdminMiddleware.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Expense.php
│   │   ├── FixedDeduction.php
│   │   └── Notification.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   └── ...
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_04_23_000001_add_salary_to_users_table.php
│   │   ├── 2026_04_23_000002_add_is_admin_to_users_table.php
│   │   ├── 2026_04_23_000003_create_fixed_deductions_table.php
│   │   ├── 2026_04_23_000004_create_notifications_table.php
│   │   └── 2026_04_23_000005_create_expenses_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   ├── api.php
│   └── web.php
├── public/
├── storage/
├── vendor/
├── artisan
├── composer.json
└── .env
```

### 2.4. Környezeti változók (.env)

Az alkalmazás konfigurációja a `.env` fájlból olvasódik be. A fájl sohasem kerül verziókezelésbe (`.gitignore`).

| Változó | Leírás |
|---------|--------|
| APP_KEY | Az alkalmazás titkosítási kulcsa (`php artisan key:generate`) |
| APP_URL | Az alkalmazás URL-je (`http://localhost:8000`) |
| DB_CONNECTION | Adatbázis driver (`mysql`) |
| DB_HOST | Adatbázis szerver host (`127.0.0.1`) |
| DB_PORT | Adatbázis port (`3306`) |
| DB_DATABASE | Adatbázis neve (`trackmate`) |
| DB_USERNAME / DB_PASSWORD | Adatbázis hitelesítési adatok |
| SANCTUM_STATEFUL_DOMAINS | Sanctum által engedélyezett domainek |

### 2.5. API végpontok

Minden védett végpont (`auth:sanctum` middleware) esetén az `Authorization` fejlécben Bearer token szükséges. A token a bejelentkezéskor kerül kiadásra.

#### Publikus végpontok (hitelesítés nélkül)

| Metódus | Végpont | Leírás | Hozzáférés |
|---------|---------|--------|------------|
| POST | `/api/register` | Regisztráció új felhasználónak | Publikus |
| POST | `/api/login` | Bejelentkezés, token visszaadása | Publikus |
| GET | `/api/ping` | Szerver státusz lekérdezése | Publikus |

#### Védett végpontok (Bearer token szükséges)

| Metódus | Végpont | Leírás | Hozzáférés |
|---------|---------|--------|------------|
| POST | `/api/logout` | Kijelentkezés, token törlése | Bejelentkezett |
| GET | `/api/me` | Bejelentkezett felhasználó adatai | Bejelentkezett |
| GET | `/api/user` | User profil (salary, deductions, notifications, expenses) | Bejelentkezett |
| POST | `/api/user` | User adatok mentése | Bejelentkezett |
| POST | `/api/user/salary` | Fizetés frissítése | Bejelentkezett |
| GET | `/api/expenses` | Költések listázása | Bejelentkezett |
| POST | `/api/expenses` | Új költés rögzítése | Bejelentkezett |
| PUT | `/api/expenses/{expense}` | Költés módosítása | Bejelentkezett (saját) |
| DELETE | `/api/expenses/{expense}` | Költés törlése | Bejelentkezett (saját) |
| GET | `/api/deductions` | Fix kiadások listázása | Bejelentkezett |
| POST | `/api/deductions` | Új fix kiadás | Bejelentkezett |
| PUT | `/api/deductions/{deduction}` | Fix kiadás módosítása | Bejelentkezett (saját) |
| DELETE | `/api/deductions/{deduction}` | Fix kiadás törlése | Bejelentkezett (saját) |
| GET | `/api/notifications` | Értesítések listázása | Bejelentkezett |
| POST | `/api/notifications` | Új értesítés | Bejelentkezett |
| PUT | `/api/notifications/{notification}` | Értesítés módosítása | Bejelentkezett (saját) |
| DELETE | `/api/notifications/{notification}` | Értesítés törlése | Bejelentkezett (saját) |

#### Admin végpontok (Bearer token + is_admin = true)

| Metódus | Végpont | Leírás | Hozzáférés |
|---------|---------|--------|------------|
| GET | `/api/admin/users` | Összes felhasználó listázása | Admin |
| GET | `/api/admin/users/{user}` | Egy felhasználó részletei | Admin |
| POST | `/api/admin/users` | Új felhasználó létrehozása | Admin |
| PUT | `/api/admin/users/{user}` | Felhasználó módosítása | Admin |
| DELETE | `/api/admin/users/{user}` | Felhasználó törlése | Admin |
| GET | `/api/admin/stats` | Statisztikák (összesített adatok) | Admin |

### 2.6. Kontrollerek és szervizek

#### AuthController
A regisztrációs és belépési folyamatot kezeli. A `register()` metódus validálja az adatokat, hash-eli a jelszót, majd létrehozza a felhasználót és visszaad egy Sanctum tokent. A `login()` metódus ellenőrzi a felhasználónevet és jelszót, majd szintén tokent ad vissza. A `logout()` törli az aktuális tokent. A `me()` visszaadja a bejelentkezett felhasználó teljes adatait a kapcsolódó rekordokkal (fixedDeductions, notifications, expenses) eager loading segítségével.

#### UserController
A felhasználói profil kezelését végzi. A `show()` metódus visszaadja az aktuális user salary, fixedDeductions, notifications és expenses adatait. A `update()` metódus szinkronizálja a kapcsolódó táblákat (törli a régieket és újra létrehozza a kapott adatok alapján). A `updateSalary()` külön végponton frissíti csak a fizetést.

#### ExpenseController
A költések teljes CRUD-ját biztosítja. Minden műveletnél ellenőrzi, hogy a kért expense a bejelentkezett felhasználóhoz tartozik-e, különben 403-as hibát ad vissza.

#### FixedDeductionController
A fix kiadások kezelését végzi. A `store()` metódus új fix kiadást hoz létre, az `update()` módosítja, a `destroy()` törli. Tulajdonosi ellenőrzés minden műveletnél.

#### NotificationController
Az értesítések és emlékeztetők kezelését végzi. Hasonló CRUD működés, mint a többi kontroller.

#### AdminController
Az adminisztrátori funkciókat kezeli. A `users()` metódus listázza az összes felhasználót expenses_count és expenses_sum aggregációval. A `createUser()` új felhasználót hoz létre, az `updateUser()` módosít, a `deleteUser()` törli (saját magát nem engedi törölni). A `stats()` összesített statisztikákat ad vissza.

### 2.7. Autentikáció – Laravel Sanctum

Az API hitelesítés Laravel Sanctum token-alapú módszerrel működik. A bejelentkezéskor a szerver egy plaintext tokent ad vissza, amelyet a kliens minden kérésnél az `Authorization: Bearer <token>` fejlécben küld el. A token a `personal_access_tokens` táblában kerül tárolásra, és kijelentkezéskor törlődik.

**Admin ellenőrzés:** Az `AdminMiddleware` ellenőrzi, hogy a bejelentkezett felhasználó `is_admin` mezője `true`-e. Ha nem, 403-as hibát ad vissza.

### 2.8. Továbbfejlesztési lehetőségek

- WebSocket / Server-Sent Events alapú valós idejű értesítések.
- Részletes audit log: ki, mikor, mit változtatott a rendszerben.
- PDF alapú havi költségvetési riport automatikus generálása.
- Kétfaktoros hitelesítés (2FA) bevezetése admin jogkörű felhasználóknak.
- Automatikus havi költési limit értesítések e-mailben.
- Teljes Policy-rendszer finomhangolása az összes erőforrásra.
- Csatolmányok kezelése (számlaképek feltöltése).

---

## 3. Fejlesztői dokumentáció – Frontend

### 3.1. Mappa struktúra

```
src/
├── app/
│   ├── calendar-calculator/        # Fő alkalmazás (naptár + költések)
│   ├── dashboard/                  # Admin felület
│   ├── login/                      # Bejelentkezés / regisztráció / beállítások
│   ├── welcome/                    # Kezdőlap
│   ├── components/
│   │   └── toast/                  # Értesítési komponens
│   ├── interceptors/
│   │   ├── auth.interceptor.ts     # Bearer token automatikus küldése
│   │   ├── error.interceptor.ts    # Hibakezelés
│   │   └── loading.interceptor.ts  # Betöltésjelző
│   ├── models/
│   │   ├── user.model.ts           # TypeScript interfészek
│   │   ├── theme.model.ts
│   │   └── api.model.ts
│   ├── services/
│   │   ├── budget.service.ts       # Fő szolgáltatás (API hívások)
│   │   ├── auth.guard.ts           # Route-védők
│   │   ├── theme.service.ts        # Témaváltás
│   │   ├── error.service.ts        # Hibakezelés
│   │   └── loading.service.ts      # Betöltésjelző
│   ├── app.component.ts
│   ├── app.config.ts               # Alkalmazás konfiguráció
│   └── app.routes.ts               # Útvonalak
├── environments/
│   ├── environment.ts              # Dev API URL: http://localhost:8000/api
│   └── environment.prod.ts         # Prod API URL: http://localhost:8000/api
├── index.html
├── main.ts
└── styles.css
```

### 3.2. Fejlesztéshez használt eszközök és technológiák

| Eszköz | Verzió | Felhasználás |
|--------|--------|--------------|
| Angular | 17+ | Frontend SPA keretrendszer (standalone komponensek) |
| TypeScript | 5.x | Erősen típusos JavaScript szuperhalmaz |
| CSS3 | – | Reszponzív stílusozás |
| RxJS | 7.x | Reaktív programozás, Observable-alapú adatfolyamok |
| Angular HttpClient | – | HTTP kérések kezelése, interceptorok |
| localStorage | – | Auth token és user adatok tárolása |
| Visual Studio Code | – | Fejlesztői szövegszerkesztő |

### 3.3. Komponensek

#### TrackyComponent (calendar-calculator) – /main
- A felhasználó fő felülete, ahol a naptár és a költések kezelése történik.
- Naptár nézet a hónap napjaival, hétfővel kezdődő hetek.
- Napi költések megtekintése, hozzáadása, szerkesztése és törlése nap szerint.
- Kategóriák szerinti költésrögzítés (Étel, Bolt, Cigi, Szórakozás, Kávé, Utazás, Ruházat, Egészség, Számlák, Egyéb).
- Havi összesítések: összköltés, napi keret, heti limit státusz.
- Diagramok: kategóriánkénti költés megoszlás (kördiagram), top 5 költés.
- Szerver státusz ellenőrzése (`/api/ping`).

#### DashboardComponent – /admin
- Az adminisztrátori felület, kizárólag `is_admin = true` felhasználóknak érhető el.
- Összes felhasználó listázása: név, e-mail, fizetés, költések száma, költött összeg.
- Új felhasználó létrehozása (username, password, e-mail, salary).
- Felhasználó szerkesztése (salary, e-mail módosítása).
- Felhasználó törlése: megerősítő dialógus után véglegesen törölhető.
- Statisztikák megtekintése.
- Szerver státusz ellenőrzése.

#### LoginComponent – /login
- Bejelentkezési és regisztrációs űrlap.
- Sikeres belépés esetén a token és user adatok `localStorage`-ba kerülnek.
- Bejelentkezés után automatikus átirányítás a `/main` oldalra.
- Első bejelentkezéskor fizetés, fix kiadások és értesítések beállítása.
- Témaváltási lehetőség.

#### WelcomeComponent – /
- Kezdőlap, rövid bemutatkozás.
- Bejelentkezés és regisztráció gombok.

#### ToastComponent
- Értesítések megjelenítése sikeres és hibás műveletekhez.

### 3.4. Szervizek

#### BudgetService
Az összes backend API kommunikációt és üzleti logikát összefogja. Főbb metódusai:

| Metódus | Leírás |
|---------|--------|
| `login(username, password)` | Bejelentkezés, token + userId mentése localStorage-ba |
| `register(username, password, email)` | Regisztráció |
| `logout()` | Kijelentkezés, token törlése, backend logout hívás |
| `loadUserData()` | User adatok betöltése `/api/user` végpointról |
| `saveUserData()` | User adatok mentése `/api/user` végpontba |
| `addExpense(expense)` | Új költés rögzítése |
| `updateSalary(salary)` | Fizetés frissítése |
| `addFixedDeduction(deduction)` | Új fix kiadás |
| `updateFixedDeduction(id, deduction)` | Fix kiadás módosítása |
| `removeFixedDeduction(id)` | Fix kiadás törlése |
| `addNotification(notification)` | Új értesítés |
| `removeNotification(id)` | Értesítés törlése |
| `getDailyBudget()` | Napi keret számítása |
| `getSpentThisMonth()` | Havi összköltés |
| `getWeeklyLimitStatus()` | Heti limit státusz (warning/exceeded) |
| `checkAndResetMonthlyExpenses()` | Havi költések nullázása új hónapban |

#### AuthGuard (autoLoginGuard)
Ellenőrzi, hogy érvényes token van-e a `localStorage`-ban. Ha nincs, átirányít a `/login` oldalra.

#### AdminGuard (adminGuard)
Ellenőrzi, hogy a bejelentkezett felhasználónak admin jogköre van-e (`is_admin = true`). Ha nem, átirányít a `/main` oldalra.

#### ThemeService
Témaváltási logikát biztosít. Több előre definiált téma közül választhat a felhasználó.

#### ErrorService
Hibák és sikeres műveletek megjelenítését kezeli toast értesítések formájában.

#### LoadingService
HTTP kérések közötti betöltésjelzőt kezel.

### 3.5. Útvonalak és route-védők

| Útvonal | Komponens | Védő |
|---------|-----------|------|
| `/` | WelcomeComponent | – |
| `/login` | LoginComponent | – |
| `/main` | TrackyComponent | autoLoginGuard |
| `/admin` | DashboardComponent | autoLoginGuard + adminGuard |
| `**` | WelcomeComponent | – |

**authInterceptor:** Minden HTTP kéréshez automatikusan hozzáadja az `Authorization: Bearer <token>` fejlécet, ha van token a `localStorage`-ban.

### 3.6. Adatmodellek (TypeScript interfészek)

A `user.model.ts` fájlban definiált interfészek:

```typescript
interface FixedDeduction {
  id?: number;
  name: string;
  amount: number;
}

interface Notification {
  id?: number;
  name: string;
  amount: number;
  day: number;
  recurring: boolean;
}

interface Expense {
  id?: number;
  date: string;      // YYYY-MM-DD
  amount: number;
  description: string;
}

interface UserData {
  email?: string;
  salary: number;
  fixedDeductions: FixedDeduction[];
  notifications: Notification[];
  expenses: Expense[];
}

interface LoginResponse {
  success: boolean;
  userId?: string;
  token?: string;
  is_admin?: boolean;
  message?: string;
}
```

### 3.7. Továbbfejlesztési lehetőségek

- WebSocket / Server-Sent Events alapú valós idejű értesítések.
- PWA (Progressive Web App) támogatás – offline használat, push értesítések.
- Exportálás: havi költségvetés PDF-be vagy Excel-be mentése.
- Sötét mód teljes körű megvalósítása.
- Többnyelvűsítés (i18n) bevezetése Angular ngx-translate segítségével.
- Egységtesztek (Jasmine/Karma) és end-to-end tesztek (Cypress / Playwright) bővítése.
- Grafikonok bővítése (trendvonalak, előző havi összehasonlítás).

---

## 4. Felhasználói kézikönyv

### 4.1. Regisztráció és első belépés

Új felhasználó a `/login` oldalon tud regisztrálni a "Regisztráció" módra váltva. A regisztrációhoz szükséges egy felhasználónév, jelszó (min. 4 karakter) és opcionálisan e-mail cím megadása. Sikeres regisztráció után a felhasználó automatikusan bejelentkezik, és megjelennek a kezdeti beállítások (fizetés, fix kiadások, értesítések).

### 4.2. Bejelentkezés

A bejelentkezési oldalon a felhasználónév és jelszó megadása szükséges. Sikeres bejelentkezés után a rendszer automatikusan a megfelelő főoldalra irányít:
- Admin (super admin) → `/admin` felület
- Normál felhasználó → `/main` felület

Ha a token lejárt vagy érvénytelen, a rendszer automatikusan a bejelentkezési oldalra irányít.

### 4.3. Felhasználói felület (/main)

A fő felület a naptár és a költések kezelésére szolgál.

**Naptár nézet**
- A hónap napjai hétfővel kezdődő hetekben jelennek meg.
- A mai nap kiemelten jelenik meg.
- Minden napra rákattintva megtekinthetők az aznapi költések.

**Költés rögzítése**
- Válassz dátumot, összeget, leírást és kategóriát.
- A kategória automatikusan beépül a leírásba.
- A "Hozzáadás" gombbal rögzíthető a költés.

**Napi költések kezelése**
- Rákattintva egy napra megnyílik a napi részletező nézet.
- Itt lehet költéseket törölni vagy szerkeszteni.
- A napi összköltés automatikusan számítódik.

**Statisztikák**
- **Havi összköltés:** az aktuális hónap összes rögzített költése.
- **Napi keret:** (fizetés - fix kiadások - havi költés) / hátralévő napok.
- **Heti limit státusz:** figyelmeztetés, ha a heti költés eléri a 70%-ot vagy 100%-ot.
- **Kategóriánkénti megoszlás:** kördiagram a költések eloszlásáról.
- **Top 5 költés:** a legnagyobb összegű költések listája.

**Értesítések**
- A mai napra eső értesítések automatikusan megjelennek.
- Az értesítések a bejelentkezési/beállítások oldalon kezelhetők.

### 4.4. Admin felület (/admin)

Az admin felület kizárólag a super admin (`is_admin = true`) felhasználóknak érhető el. Az admin felhasználó: `admin` / `admin123`.

**Felhasználók kezelése**
- Összes regisztrált felhasználó listázása névvel, e-mail címmel, fizetéssel, költések számával és összegével.
- Új felhasználó létrehozása: felhasználónév, jelszó, e-mail, fizetés megadásával.
- Meglévő felhasználó szerkesztése: fizetés és e-mail módosítása.
- Felhasználó törlése: megerősítő dialógus után véglegesen törölhető.

**Statisztikák**
- Összes felhasználó száma.
- Összes regisztrált költés száma.
- Összes költött összeg.
- Átlagos fizetés.

### 4.5. Beállítások kezelése

A `/login` oldalon, bejelentkezés után érhetők el a következő beállítások:

**Fizetés**
- A havi nettó fizetés megadása forintban.

**Fix kiadások**
- Rezsi, albérlet, biztosítás és egyéb rendszeres kiadások rögzítése.
- Minden kiadáshoz név és össz
e g   t a r t o z i k . 
 
 -   G y o r s   h o z z �a d �s   e l 9 r e   d e f i n i �l t   s a b l o n o k k a l   ( R e z s i ,   A l b � r l e t ,   B i z t o s � t �s ,   T e l e f o n ,   I n t e r n e t ,   S p o t i f y ,   E g y � b ) . 
 
 
 
 * * 0 r t e s � t � s e k   /   E m l � k e z t e t 9 k * * 
 
 -   S z �m l a f i z e t � s i   e m l � k e z t e t 9 k   b e �l l � t �s a . 
 
 -   N � v ,   � s s z e g   � s   a   h Bn a p   n a p j �n a k   m e g a d �s a . 
 
 -   I s m � t l 9 d 9   � r t e s � t � s e k   m i n d e n   h Bn a p b a n   u g y a n a z o n   a   n a p o n . 
 
 
 
 - - - 
 
 
 
 # #   5 .   T e l e p � t � s i   _t m u t a t B
 
 
 
 # # #   5 . 1 .   K � v e t e l m � n y e k 
 
 
 
 |   S z o f t v e r   |   M i n .   v e r z i B  |   L e t � l t � s   | 
 
 | - - - - - - - - - - | - - - - - - - - - - - - - | - - - - - - - - - - | 
 
 |   P H P   |   8 . 2   |   h t t p s : / / w i n d o w s . p h p . n e t / d o w n l o a d   | 
 
 |   C o m p o s e r   |   2 . x   |   h t t p s : / / g e t c o m p o s e r . o r g / d o w n l o a d /   | 
 
 |   M y S Q L   /   M a r i a D B   |   8 . 0 +   |   X A M P P ,   W A M P   v a g y   � n �l l B  | 
 
 |   N o d e . j s   |   1 8 +   |   h t t p s : / / n o d e j s . o r g /   | 
 
 |   A n g u l a r   C L I   |   1 7 +   |   ` n p m   i n s t a l l   - g   @ a n g u l a r / c l i `   | 
 
 
 
 * * P H P   k i t e r j e s z t � s e k   ( p h p . i n i ) : * * 
 
 ` ` ` i n i 
 
 e x t e n s i o n = p d o _ m y s q l 
 
 e x t e n s i o n = z i p 
 
 e x t e n s i o n = f i l e i n f o 
 
 e x t e n s i o n = o p e n s s l 
 
 ` ` ` 
 
 
 
 # # #   5 . 2 .   L � p � s r 9 l   l � p � s r e   t e l e p � t � s 
 
 
 
 * * 1 .   M y S Q L   a d a t b �z i s   l � t r e h o z �s a * * 
 
 ` ` ` s q l 
 
 C R E A T E   D A T A B A S E   t r a c k m a t e   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 ` ` ` 
 
 
 
 * * 2 .   B a c k e n d   k o n f i g u r �c i B* * 
 
 N y i s d   m e g   a   ` t r a c k m a t e - f u l l s t a c k / b a c k e n d / . e n v `   f �j l t : 
 
 ` ` ` e n v 
 
 D B _ C O N N E C T I O N = m y s q l 
 
 D B _ H O S T = 1 2 7 . 0 . 0 . 1 
 
 D B _ P O R T = 3 3 0 6 
 
 D B _ D A T A B A S E = t r a c k m a t e 
 
 D B _ U S E R N A M E = r o o t 
 
 D B _ P A S S W O R D = 
 
 ` ` ` 
 
 
 
 * * 3 .   C o m p o s e r   f =g g 9 s � g e k   t e l e p � t � s e * * 
 
 ` ` ` p o w e r s h e l l 
 
 c d   C : \ g e \ t r a c k m a t e \ t r a c k m a t e - f u l l s t a c k \ b a c k e n d 
 
 c o m p o s e r   i n s t a l l 
 
 ` ` ` 
 
 
 
 * * 4 .   M i g r �c i B  � s   s e e d e l � s * * 
 
 ` ` ` p o w e r s h e l l 
 
 c d   C : \ g e \ t r a c k m a t e \ t r a c k m a t e - f u l l s t a c k \ b a c k e n d 
 
 p h p   a r t i s a n   m i g r a t e   - - s e e d 
 
 ` ` ` 
 
 
 
 * * 5 .   L a r a v e l   s z e r v e r   i n d � t �s a * * 
 
 ` ` ` p o w e r s h e l l 
 
 c d   C : \ g e \ t r a c k m a t e \ t r a c k m a t e - f u l l s t a c k \ b a c k e n d 
 
 p h p   a r t i s a n   s e r v e 
 
 ` ` ` 
 
 
 
 * * 6 .   F r o n t e n d   f =g g 9 s � g e k   t e l e p � t � s e * *   ( _j   t e r m i n �l ) 
 
 ` ` ` p o w e r s h e l l 
 
 c d   C : \ g e \ t r a c k m a t e 
 
 n p m   i n s t a l l 
 
 ` ` ` 
 
 
 
 * * 7 .   A n g u l a r   s z e r v e r   i n d � t �s a * * 
 
 ` ` ` p o w e r s h e l l 
 
 c d   C : \ g e \ t r a c k m a t e 
 
 n g   s e r v e 
 
 ` ` ` 
 
 
 
 # # #   5 . 3 .   E l � r h e t 9 s � g e k 
 
 
 
 -   B a c k e n d   A P I :   h t t p : / / l o c a l h o s t : 8 0 0 0 
 
 -   F r o n t e n d   a l k a l m a z �s :   h t t p : / / l o c a l h o s t : 4 2 0 0 
 
 
 
 # # #   5 . 4 .   A l a p � r t e l m e z e t t   f e l h a s z n �l Bk 
 
 
 
 |   S z e r e p   |   F e l h a s z n �l Bn � v   |   J e l s z B  | 
 
 | - - - - - - - - | - - - - - - - - - - - - - - - | - - - - - - - - | 
 
 |   S u p e r   A d m i n   |   ` a d m i n `   |   ` a d m i n 1 2 3 `   | 
 
 |   T e s z t   f e l h a s z n �l B  |   ` t e s t `   |   ` t e s t 1 2 3 4 `   | 
 
 
 
 - - - 
 
 
 
 # #   6 .    s s z e f o g l a l �s 
 
 
 
 A   p r o j e k t   c � l j a   e g y   s z e m � l y e s   k � l t s � g v e t � s - k e z e l 9   a l k a l m a z �s   e l k � s z � t � s e   v o l t ,   a m e l y   s e g � t   a   f e l h a s z n �l Bk n a k   n y o m o n   k � v e t n i   h a v i   b e v � t e l e i k e t   � s   k i a d �s a i k a t .   A   f e j l e s z t � s   s o r �n   k i e m e l t   f i g y e l m e t   f o r d � t o t t u n k   a   b i z t o n s �g r a   ( t o k e n - a l a p _  h i t e l e s � t � s   L a r a v e l   S a n c t u m m a l ) ,   a z   a d a t o k   p e r z i s z t e n s   t �r o l �s �r a   ( M y S Q L   r e l �c i Bs   a d a t b �z i s ) ,   v a l a m i n t   a z   �t l �t h a t B,   j o g k � r - a l a p _  h o z z �f � r � s - k e z e l � s r e   ( A d m i n M i d d l e w a r e ) . 
 
 
 
 A   b a c k e n d   L a r a v e l   1 2   /   P H P   8 . 2   a l a p o n   R E S T   A P I - t   b i z t o s � t ,   a m e l y e t   L a r a v e l   S a n c t u m   v � d .   A   f r o n t e n d   A n g u l a r   1 7 +   s t a n d a l o n e   k o m p o n e n s - a r c h i t e k t _r �v a l   k � s z =l t ,   C S S 3   s t � l u s o z �s s a l .   A   k � t   r � t e g   k � z � t t   t i s z t �n   d e f i n i �l t   A P I - n   k e r e s z t =l   f o l y i k   a   k o m m u n i k �c i B,   B e a r e r   t o k e n   a l a p _  a u t e n t i k �c i Bv a l . 
 
 
 
 * * M e g v a l Bs � t o t t   f u n k c i o n a l i t �s o k : * * 
 
 -   J o g k � r   a l a p _  h o z z �f � r � s   ( a d m i n   /   n o r m �l   f e l h a s z n �l B) 
 
 -   R e g i s z t r �c i B  � s   b e j e l e n t k e z � s   t o k e n - a l a p _  h i t e l e s � t � s s e l 
 
 -   H a v i   f i z e t � s   r � g z � t � s e   � s   k e z e l � s e 
 
 -   F i x   k i a d �s o k   t e l j e s   C R U D - j a 
 
 -   N a p i   k � l t � s e k   r � g z � t � s e   k a t e g Br i �k   s z e r i n t   n a p t �r   n � z e t b e n 
 
 -   0 r t e s � t � s e k   � s   e m l � k e z t e t 9 k   b e �l l � t �s a 
 
 -   A d m i n   f e l =l e t   f e l h a s z n �l Bk   k e z e l � s � r e 
 
 -   S t a t i s z t i k �k   � s   d i a g r a m o k   ( k a t e g Br i �n k � n t i   m e g o s z l �s ,   t o p   k � l t � s e k ) 
 
 -   H a v i   a u t o m a t i k u s   k � l t � s n u l l �z �s   _j   h Bn a p   k e z d e t e k o r 
 
 -   S z e r v e r   s t �t u s z   e l l e n 9 r z � s 
 
 
 
 * * J � v 9 b e l i   f e j l e s z t � s i   i r �n y o k : * * 
 
 -   W e b S o c k e t - a l a p _  v a l Bs   i d e j 9�   � r t e s � t � s e k 
 
 -   P D F   a l a p _  h a v i   r i p o r t   g e n e r �l �s 
 
 -   K � t f a k t o r o s   h i t e l e s � t � s   a d m i n o k n a k 
 
 -   E - m a i l   � r t e s � t � s e k   ( s z �m l a f i z e t � s i   e m l � k e z t e t 9 k ) 
 
 -   M o b i l a l k a l m a z �s   ( P W A   v a g y   n a t � v ) 
 
 -   I m p o r t �l �s / e x p o r t �l �s   C S V / E x c e l   f o r m �t u m b a n 
 
 -   T � b b n y e l v 9� s � g   ( i 1 8 n )   t �m o g a t �s a 
 
 -   T e l j e s   k � r 9�   P o l i c y - r e n d s z e r   f i n o m h a n g o l �s a 
 
 