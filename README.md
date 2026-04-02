# Laravel React Chat App

A real-time chat application built with Laravel, Inertia.js, React, and Reverb.

## Requirements

- PHP `^8.3`
- Composer
- Node.js and npm
- SQLite (default) or another supported database

## Installation

1. Clone the repository and move into it:

```bash
git clone https://github.com/Nor1318/laravel-react-chatapp
cd chatapp
```

2. Install PHP and JavaScript dependencies:

```bash
composer install
npm install
```

3. Create your environment file and app key:

```bash
cp .env.example .env
php artisan key:generate
```

4. Configure your database in `.env`.
   By default, this project uses SQLite (`DB_CONNECTION=sqlite`).

5. Run database migrations:

```bash
php artisan migrate
```

## Reverb Setup (WebSockets)

Set these values in your `.env` file:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=chatapp
REVERB_APP_KEY=local-app-key
REVERB_APP_SECRET=local-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

For local development, any random string values work for `REVERB_APP_KEY` and `REVERB_APP_SECRET` as long as backend and frontend use the same values.

Start Reverb in a separate terminal:

```bash
php artisan reverb:start
```

## Run The App

For local development (Laravel server, queue listener, logs, and Vite in one command):

```bash
composer run dev
```

Then open the app at [http://localhost:8000](http://localhost:8000).

Note: Keep both `composer run dev` and `php artisan reverb:start` running while testing real-time chat updates.

## Frontend Commands

```bash
npm run dev
npm run build
```

## Testing

```bash
composer run test