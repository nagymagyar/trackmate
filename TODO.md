# TrackMate Edit Expense Feature Implementation Plan

## Status: ✅ In Progress

## Step 1: Create TODO.md [COMPLETED]

## Step 2: Update calendar-calculator.ts ✅ COMPLETED

## Step 3: Update calendar-calculator.html ✅ COMPLETED

## Step 4: Update budget.service.ts ✅ COMPLETED (frontend direct + service ready)

## Step 5: Update server/index.js
- [ ] Add PUT endpoint /api/user/:userId/expense/:expIndex
- [ ] Implement update handler

## Step 6: Test Implementation
- [ ] Test add → edit → save flow
- [ ] Test edit → cancel
- [ ] Test delete during edit
- [ ] Verify backend data.json updates
- [ ] Attempt completion

## Step 6: Test Implementation [IN PROGRESS]

✅ Frontend edit UI + logic complete
✅ Backend PUT endpoint added  
✅ Data persistence via saveUserData()

To test:
1. `ng serve` (if not running)
2. `node server/index.js` (if not running) 
3. Login → Calendar → Add expense → Open day editor → Edit amount/desc → Verify save
4. Check server/data.json confirms update
