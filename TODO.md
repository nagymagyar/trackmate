# TODO - Laravel + MySQL + Super Admin

## Laravel Backend
- [x] 1. Update `bootstrap/app.php` - API routing bekötése
- [x] 2. Create `routes/api.php` - API végpontok
- [x] 3. Update `config/auth.php` - sanctum guard API-hoz
- [x] 4. Update `AuthController.php` - me() végpont
- [x] 5. Create `UserController.php`
- [x] 6. Create `ExpenseController.php`
- [x] 7. Create `FixedDeductionController.php`
- [x] 8. Create `NotificationController.php`
- [x] 9. Create `AdminController.php`
- [x] 10. Update `DatabaseSeeder.php` - super admin
- [x] 11. Create `AdminMiddleware.php`

## Angular Frontend
- [x] 12. Update `environment.ts` - Laravel API URL
- [x] 13. Update `user.model.ts` - token, is_admin mezők
- [x] 14. Create `auth.interceptor.ts`
- [x] 15. Update `app.config.ts` - auth interceptor bekötés
- [x] 16. Update `budget.service.ts` - token + Laravel API
- [x] 17. Update `auth.guard.ts` - token ellenőrzés + adminGuard
- [x] 18. Update `dashboard.ts` + `dashboard.html` - admin végpontok
- [x] 19. Update `calendar-calculator.ts` - ping endpoint
- [x] 20. Update `app.routes.ts` - adminGuard

## Telepítés (kézi lépések)
- [ ] 21. `.env` MySQL konfigurálása
- [ ] 22. `php artisan migrate --seed`
- [ ] 23. Laravel szerver indítása
- [ ] 24. Angular frontend indítása

