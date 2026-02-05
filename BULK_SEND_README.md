# Bulk subscription emails (emailnew.csv)

Send subscription emails to all addresses in `emailnew.csv` (630+).

## Quick start

1. **Start the frontend** (dev or production):

   ```bash
   cd yookatale-app/frontend && npm run dev
   ```

   Note the port (e.g. `http://localhost:3003` if 3000–3002 are in use).

2. **Run the Node script** (recommended; logs to `bulk-send-log-*.txt`):

   ```bash
   node bulk-send.js http://localhost:3003
   ```

   Or against production:

   ```bash
   node bulk-send.js https://www.yookatle.app
   ```

3. **Optional**

   - `--limit N` — send only first N emails (e.g. `--limit 50`).
   - `--with-newsletter` — also subscribe each email via backend newsletter API (slower).

## PowerShell

```powershell
.\bulk-send.ps1 -BaseUrl "http://localhost:3003"
.\bulk-send.ps1 -BaseUrl "https://www.yookatle.app" -WithNewsletter
```

## API

- **Email-only (default):** `POST /api/subscription/bulk-email-only` — sends subscription emails only. Faster.
- **With newsletter:** `POST /api/subscription/bulk` — subscribes each email then sends. Slower.

## CSV format

`emailnew.csv` must have a header row with an `Email` column (or first column used).

## Duration

Emails are sent in parallel (5 concurrent per batch, 20 per request). ~1–1.5 min per batch. For 631 emails (32 batches): ~45–55 min total. Run in background and check `bulk-send-log-*.txt` for progress.

## Resume

If the run stops partway, resume from a given index (0-based):

```bash
node bulk-send.js http://localhost:3004 --start-from 400
```

This skips the first 400 emails and sends the rest.
