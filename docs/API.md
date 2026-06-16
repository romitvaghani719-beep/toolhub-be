# API Documentation

Base URL: `/api`

All responses follow:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Error message" }
```

## Auth

### POST /api/auth/login
Body: `{ "email": "string", "password": "string" }`

### POST /api/auth/logout
Headers: `Authorization: Bearer <token>`

### GET /api/auth/me
Headers: `Authorization: Bearer <token>`

## Tools

### GET /api/tools
Query: `page`, `limit`, `search`, `category`, `sort` (`newest`|`name`|`votes`)

### GET /api/tools/:id
Returns tool, creator, related tools, activities.

### POST /api/tools
Auth required. Body: `{ name, description?, website_url?, category, image_url? }`

### PUT /api/tools/:id
Auth required. Owner or admin.

### DELETE /api/tools/:id
Auth required. Owner or admin.

## Activities

### GET /api/activities
Auth required. Query: `page`, `limit`, `user_id`, `tool_id`, `action`

### POST /api/activities
Admin only.

## Admin Users

### GET /api/admin/users
Admin only. Query: `page`, `limit`, `search`

### POST /api/admin/users
Admin only. Body: `{ email, password, name, role? }`

### PUT /api/admin/users/:id
Admin only.

### DELETE /api/admin/users/:id
Admin only.
