# Security Specification: InvestIQ Firestore Database

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId`.
2. **Namespace Isolation Invariant**: All portfolio subcollections (`/users/{userId}/portfolio/...`, `/users/{userId}/holdings/...`, `/users/{userId}/transactions/...`, `/users/{userId}/watchlist/...`, `/users/{userId}/portfolioSnapshots/...`) can strictly only be accessed by the authenticated user whose `request.auth.uid == userId`.
3. **No Cross-User Access**: It is mathematically impossible for user A (`uid_A`) to read, list, create, update, or delete any holdings, balances, transactions, or profile data belonging to user B (`uid_B`).
4. **Valid Path ID Invariant**: Every document ID path parameter (`userId`, `portfolioId`, `holdingId`, `transactionId`, `itemId`, `snapshotId`) must be a valid alphanumeric string bounded to <= 128 characters.
5. **No Negative Cash / Holdings Invariant**: Holdings quantities must be integers greater than 0 (`quantity is int && quantity > 0`). Cash balances must be positive numbers.
6. **Transaction Immutability Invariant**: Transactions once created can never be modified or overwritten (`allow update: if false`).

## 2. The Dirty Dozen Payloads (Designed to Fail with PERMISSION_DENIED)

1. **Unauthenticated Read User Profile**: `GET /users/victim123` with `auth = null`. Expected: PERMISSION_DENIED.
2. **Cross-User Read Profile**: `GET /users/victim123` with `auth = { uid: "attacker456" }`. Expected: PERMISSION_DENIED.
3. **Cross-User Steal Holdings**: `GET /users/victim123/holdings/RELIANCE` with `auth = { uid: "attacker456" }`. Expected: PERMISSION_DENIED.
4. **Cross-User Fake Transaction Injection**: `POST /users/victim123/transactions/tx999` with `auth = { uid: "attacker456" }`. Expected: PERMISSION_DENIED.
5. **Path ID Poisoning**: `GET /users/..%2F..%2Fhack` with invalid character injection. Expected: PERMISSION_DENIED.
6. **Unauthenticated Transaction History Listing**: `LIST /users/victim123/transactions` with `auth = null`. Expected: PERMISSION_DENIED.
7. **Negative Quantity Holding Creation**: `POST /users/user123/holdings/INFY` with `quantity: -50`. Expected: PERMISSION_DENIED.
8. **Impersonated User Creation**: `POST /users/victim123` with `auth = { uid: "attacker456" }, data: { uid: "victim123" }`. Expected: PERMISSION_DENIED.
9. **Tampering With Historical Transactions**: `UPDATE /users/user123/transactions/tx001` with modified price. Expected: PERMISSION_DENIED.
10. **Blanket Query Across All Users**: `LIST /users` or collection group queries without userId isolation. Expected: PERMISSION_DENIED.
11. **Negative Cash Injection**: `POST /users/user123/portfolio/default` with `cashBalance: -1000`. Expected: PERMISSION_DENIED.
12. **Oversized Junk Data Injection**: `POST /users/user123/watchlist/toolong` with 2MB string. Expected: PERMISSION_DENIED.
