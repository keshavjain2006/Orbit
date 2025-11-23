# Proximity App Backend API

Node.js + Express + TypeScript + Prisma backend for the proximity-based social networking app.

## Features

- ✅ **Type-safe** with TypeScript
- ✅ **ORM** using Prisma
- ✅ **Validation** with Zod
- ✅ **Error handling** middleware
- ✅ **RESTful API** design
- ✅ **PostgreSQL** database support
- ✅ **Supabase** compatible

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **Database**: PostgreSQL

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Supabase)
- Database schema deployed (see `/database` folder)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env`:

```env
# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/proximity_app?schema=public"

# For Supabase:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. (Optional) Push Prisma Schema

If you want Prisma to manage migrations:

```bash
npm run prisma:push
```

**Note**: The database schema should already be deployed using the SQL files in `/database`. Prisma is used here for type-safe database access, not schema management.

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

### Encounters

#### Record an Encounter
```
POST /api/encounters
Body: {
  "user1Id": "uuid",
  "user2Id": "uuid",
  "latitude": 40.7128,  // optional
  "longitude": -74.0060  // optional
}
```

#### Check for Connection Requests
```
GET /api/encounters/check-requests
```

Returns pairs that qualify for connection requests (3+ encounters in 14 days).

#### Get User Encounters
```
GET /api/encounters?userId=uuid
```

### Connections

#### Create Connection Requests
```
POST /api/connections/create-requests
```

Automatically creates connection requests for qualifying pairs. Should be run as a scheduled job.

#### Respond to Connection Request
```
PATCH /api/connections/requests/:requestId/respond
Body: {
  "userId": "uuid",
  "accept": true  // or false
}
```

#### Get User Connections
```
GET /api/connections/user/:userId
```

Returns all active connections for a user.

#### Get Pending Requests
```
GET /api/connections/pending/:userId
```

Returns all pending connection requests for a user.

### Messages

#### Send Message
```
POST /api/messages
Body: {
  "conversationId": "uuid",
  "senderId": "uuid",
  "content": "Hello!",
  "messageType": "text"  // optional: text, image, video, location, system
}
```

#### Get Conversation Messages
```
GET /api/messages/conversation/:conversationId?limit=50&offset=0
```

Returns paginated chat history.

#### Mark Messages as Read
```
PATCH /api/messages/conversation/:conversationId/read
Body: {
  "userId": "uuid"
}
```

## Example Usage

### Using cURL

```bash
# Record an encounter
curl -X POST http://localhost:3000/api/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "user1Id": "user-uuid-1",
    "user2Id": "user-uuid-2",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'

# Get user connections
curl http://localhost:3000/api/connections/user/user-uuid

# Send a message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conversation-uuid",
    "senderId": "user-uuid",
    "content": "Hello!"
  }'
```

### Using JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:3000/api';

// Record encounter
const encounter = await fetch(`${API_BASE}/encounters`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user1Id: 'user-uuid-1',
    user2Id: 'user-uuid-2',
    latitude: 40.7128,
    longitude: -74.0060,
  }),
});

// Get connections
const connections = await fetch(`${API_BASE}/connections/user/user-uuid`);

// Send message
const message = await fetch(`${API_BASE}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId: 'conversation-uuid',
    senderId: 'user-uuid',
    content: 'Hello!',
  }),
});
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma schema (matches database)
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── encounterController.ts
│   │   ├── connectionController.ts
│   │   └── messageController.ts
│   ├── routes/                # API routes
│   │   ├── encounters.ts
│   │   ├── connections.ts
│   │   └── messages.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── db.ts                  # Prisma client
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Run in Development Mode

```bash
npm run dev
```

Uses `tsx` for hot reloading.

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Prisma Studio

View and edit database data:

```bash
npm run prisma:studio
```

## Database Functions

The backend uses Prisma for type-safe database access. However, the database also has PostgreSQL functions defined in `/database/03_example_queries.sql`. You can call these directly using Prisma's `$queryRaw`:

```typescript
// Example: Call database function
const result = await prisma.$queryRaw`
  SELECT * FROM get_user_connections(${userId}::uuid)
`;
```

## Error Handling

All errors are handled by the `errorHandler` middleware:

- **400**: Validation errors (Zod)
- **403**: Forbidden (user not authorized)
- **404**: Not found
- **409**: Conflict (duplicate entries)
- **500**: Internal server error

## Security Considerations

⚠️ **Important**: This is a development setup. For production:

1. **Add Authentication**: Use JWT, OAuth, or Supabase Auth
2. **Add Authorization**: Verify users can only access their own data
3. **Rate Limiting**: Prevent abuse
4. **Input Sanitization**: Additional validation beyond Zod
5. **HTTPS**: Use SSL/TLS
6. **Environment Variables**: Never commit `.env` files

## Scheduled Jobs

The `create_connection_requests` endpoint should be called periodically (e.g., every 10 minutes) to automatically generate connection requests. You can:

1. Use a cron job
2. Use a task scheduler (node-cron)
3. Use Supabase Edge Functions
4. Use a cloud scheduler (AWS EventBridge, etc.)

Example with node-cron:

```typescript
import cron from 'node-cron';

// Run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await fetch('http://localhost:3000/api/connections/create-requests', {
    method: 'POST',
  });
});
```

## Testing

After setting up the database and running the server, you can test the API using:

1. **cURL** (see examples above)
2. **Postman** or **Insomnia**
3. **The test suite** in `/database/test_database.sql`

## Troubleshooting

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env`
- Verify database is running
- Check network/firewall settings

### "Table does not exist"
- Make sure you've run the database migrations from `/database`
- Run `npm run prisma:push` if using Prisma migrations

### "Port already in use"
Change `PORT` in `.env` or kill the process using port 3000.

## Next Steps

1. Add authentication middleware
2. Add request logging
3. Add API documentation (Swagger/OpenAPI)
4. Add unit and integration tests
5. Set up CI/CD
6. Deploy to production (Vercel, Railway, etc.)

## License

MIT

