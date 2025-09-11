# 🔐 **Auth & User Routes**

1. **Registration**

   - `POST /auth/register` → Create user (player/organizer). controller
   - `POST /auth/register/organizer` (optional if you separate roles). controller

2. **Login**

   - `POST /auth/login` → Login using `email | username | gameTag + password`. controller
   - `POST /auth/password-less-login` → passwordless signin controller
   - `POST /auth/logout` → Invalidate refresh token. controller

3. **Refresh Tokens**

   - `POST /auth/refresh` → Issue new access token using refresh token. controller

4. **Email & OTP**

   - `POST /auth/send-otp` → Send verification OTP. controller
   - `POST /auth/verify-otp` → Verify OTP. controller

5. **Password Management**

   - `POST /auth/forgot-password` → Send reset link/OTP. controller
   - `POST /auth/verify-otp` → Reset using token/OTP. controller
   - `PATCH /auth/change-password` → Authenticated password change. controller

---

# 👤 **User Routes**

1. `GET /users/me` → Get logged-in user profile.
2. `PATCH /users/me` → Update profile details.
3. `GET /users/:id` → View another user’s profile.
4. `PATCH /users/block/:id` (admin only) → Block/unblock user.
5. `GET /users/:id/teams` → Get teams user is part of.
6. `GET /users/:id/tournaments` → Get tournaments user organized/joined.

---

# 🏆 **Tournament Routes**

1. `POST /tournaments` (organizer only) → Create tournament.
2. `PATCH /tournaments/:id` → Update tournament details.
3. `DELETE /tournaments/:id` → Delete tournament.
4. `POST /tournaments/:id/lock` → Lock tournament (no more edits/entries).
5. `POST /tournaments/:id/postpone` → Postpone with new date.
6. `GET /tournaments` → List all tournaments (filters: status, game type, organizer).
7. `GET /tournaments/:id` → Get tournament details.

---

# 👥 **Team Routes**

1. `POST /teams` (player only) → Create team for tournament.
2. `PATCH /teams/:id` (captain only) → Update team info.
3. `POST /teams/:id/join` → Request to join team.
4. `POST /teams/:id/approve/:userId` (captain) → Approve player.
5. `DELETE /teams/:id/kick/:userId` (captain) → Kick member.
6. `DELETE /teams/:id` (captain) → Disband team.
7. `GET /teams/:id` → Get team details.
8. `GET /tournaments/:id/teams` → List all teams in tournament.

---

# ⚔️ **Match Routes**

1. `POST /tournaments/:id/matches` (organizer) → Create matches.
2. `PATCH /matches/:id` (organizer) → Update match (status, results).
3. `GET /matches/:id` → Get match details.
4. `GET /tournaments/:id/matches` → List matches of tournament.

---

# 💰 **Wallet & Transaction Routes**

1. `GET /wallets/me` → Get logged-in user’s wallet.
2. `POST /wallets/deposit` → Add balance (via gateway).
3. `POST /wallets/withdraw` → Withdraw balance.
4. `GET /wallets/me/transactions` → List user transactions.
5. `GET /transactions/:id` → Get transaction detail.

---

# 🎁 **Prize Distribution Routes**

1. `POST /tournaments/:id/prizes` (organizer) → Set prize distribution (rank-wise).
2. `PATCH /tournaments/:id/prizes` → Update distribution.
3. `GET /tournaments/:id/prizes` → Get prize distribution.
4. `PATCH /tournaments/:id/prizes/assign` (system/organizer) → Assign winners after results.

---

# 🛠️ **Admin/Moderator Routes (Optional)**

1. `GET /admin/users` → List all users.
2. `GET /admin/tournaments` → List all tournaments.
3. `PATCH /admin/tournaments/:id/block` → Suspend a tournament.
4. `DELETE /admin/users/:id` → Remove user.

---

# 🌐 **Public Routes (No Auth)**

1. `GET /leaderboard/:tournamentId` → Public leaderboard.
2. `GET /matches/live/:tournamentId` → Live match status.
3. `GET /tournaments` → Browse tournaments.

---

👉 That gives you a full **route map** covering **auth, user, tournament, team, match, wallet, prize distribution, and admin operations**.

Would you like me to **draft a folder structure (controllers, routes, middlewares)** for this project so it’s plug-and-play with your boilerplate? That way you don’t just have the route list, but the skeleton ready to implement.
