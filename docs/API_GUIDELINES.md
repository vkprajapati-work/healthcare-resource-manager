# API Guidelines

> The REST contract for the backend. Every endpoint must conform to this document; the frontend may rely on it.

## 1. REST Conventions

- Base path: **`/api/v1`**.
- Resources are **plural nouns**: `/api/v1/resources`. No verbs in URLs (`/getResources` ❌).
- Nesting only when a true parent-child relationship exists; otherwise flat + query params.
- Query parameters use `camelCase`; route params are `:id` (MongoDB ObjectId).
- JSON in, JSON out. `Content-Type: application/json`.

### Endpoint map (resources module)

| Method   | Path                    | Purpose                                | Success |
| -------- | ----------------------- | -------------------------------------- | ------- |
| `GET`    | `/api/v1/resources`     | List resources (paginated, filterable) | `200`   |
| `GET`    | `/api/v1/resources/:id` | Get one resource                       | `200`   |
| `POST`   | `/api/v1/resources`     | Create a resource                      | `201`   |
| `PATCH`  | `/api/v1/resources/:id` | Partially update a resource            | `200`   |
| `DELETE` | `/api/v1/resources/:id` | Delete a resource                      | `200`   |
| `GET`    | `/api/v1/health`        | Liveness check                         | `200`   |

`PATCH` is the standard update verb (partial updates). Do not add `PUT` unless full-replace semantics are truly needed.

## 2. Response Format (success envelope)

Every successful response:

```json
{
  "success": true,
  "data": { "...": "..." }
}
```

List responses add a `meta` object:

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1c2e8b3e2a0012345678",
      "type": "ambulance",
      "title": "City Ambulance Service",
      "description": "24/7 emergency response",
      "location": "Berlin, DE",
      "imageUrl": "https://example.com/ambulance.jpg",
      "createdAt": "2026-07-10T09:00:00.000Z",
      "updatedAt": "2026-07-10T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "counts": { "ambulance": 25, "doctor": 17 }
  }
}
```

- Entities always expose `id` (string), never `_id`; `__v` is stripped (model-level `toJSON` transform).
- Timestamps are ISO 8601 UTC strings.
- `meta.counts` serves FR-4 (total ambulances and doctors) without an extra request.

## 3. Error Format (error envelope)

Every error response, no exceptions:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "title", "message": "Title is required" }]
  }
}
```

- `code` is a stable, machine-readable `SCREAMING_SNAKE_CASE` string; `message` is human-readable.
- `details` is optional — present only for validation errors.
- Stack traces and internal messages are **never** exposed in production responses.

### Standard error codes

| Code               | Status | When                                       |
| ------------------ | ------ | ------------------------------------------ |
| `VALIDATION_ERROR` | 400    | Zod validation of body/query/params failed |
| `NOT_FOUND`        | 404    | Unknown route or missing document          |
| `CONFLICT`         | 409    | Duplicate/conflicting state                |
| `INTERNAL_ERROR`   | 500    | Anything unhandled                         |

## 4. Pagination

- Query params: `?page=1&limit=10`.
- Defaults: `page=1`, `limit=10`. Bounds: `page ≥ 1`, `1 ≤ limit ≤ 100` (enforced by Zod with coercion).
- Implementation: `skip((page - 1) * limit)` + `limit(limit)` alongside `countDocuments()` for `meta`.
- Out-of-range pages return `200` with an empty `data` array and correct `meta` — not an error.

## 5. Validation Rules

- Every route validates its input with Zod **before** the controller runs (shared `validateRequest` middleware).
- Validate all three channels as needed: `body`, `query`, `params` (`:id` must be a valid ObjectId → otherwise `VALIDATION_ERROR`, not a Mongoose cast crash).
- Unknown body fields are **stripped** (`.strip()`), not errors.
- Reference field rules for a resource: `type` ∈ {`ambulance`, `doctor`}; `title` 1–200 chars; `description` 1–2000 chars; `location` 1–200 chars; `imageUrl` optional, valid URL.

## 6. Status Codes

| Code                        | Use                                            |
| --------------------------- | ---------------------------------------------- |
| `200 OK`                    | Successful read, update, delete                |
| `201 Created`               | Successful create (returns the created entity) |
| `400 Bad Request`           | Validation failure                             |
| `404 Not Found`             | Missing document or unknown route              |
| `409 Conflict`              | State conflict                                 |
| `500 Internal Server Error` | Unhandled error                                |

Do not invent additional codes without updating this table.

## 7. CRUD Conventions

- **Create** returns the full created entity (`201`) so the client can update its cache without refetching.
- **Update** returns the full updated entity (`200`); updating a missing id → `404 NOT_FOUND`.
- **Delete** returns `200` with `data: { "id": "<deleted id>" }`; deleting a missing id → `404` (idempotency at the client's discretion via error handling).
- **Read one** of a missing id → `404`, never `200` with `null`.

## 8. API Versioning Strategy

- URI versioning: `/api/v1/...`. The version is part of the route prefix mounted in `app.ts`.
- **Breaking changes** (removing/renaming fields, changing envelope shape, changing semantics) require a new version prefix (`/api/v2`) with a deprecation window for the old one.
- **Additive changes** (new optional fields, new endpoints, new query params) do not bump the version.
- The frontend pins the version in its axios base URL configuration.
