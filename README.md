# Authentic Reach — Frontend

Social media organic & paid engagement analysis web application (BCA minor project).

This frontend is built from the **Google Stitch** UI/UX designs (design tokens, sidebar, cards, typography, and color system preserved). It is a plain **HTML / CSS / JavaScript** app with **Chart.js** and is ready to connect to a **Python Flask** REST API backed by **Supabase PostgreSQL**.

## Features

- Dashboard with KPI cards, organic vs paid charts, trends, platform distribution, top posts
- Add Social Media Data form (validated)
- CSV upload with drag-and-drop, schema validation, preview, and import
- Analytics: overview, organic analysis, paid analysis, campaign rankings
- Reports: filters, generate, Export CSV, Export PDF (print-to-PDF)
- Profile & password UI
- Login / Register (demo mode when API is offline)
- Responsive sidebar (collapses on mobile)
- Configurable API base URL

## Project structure

```
authentic-reach/
├── index.html              # Redirects to login
├── login.html
├── register.html
├── dashboard.html
├── add-data.html
├── upload-csv.html
├── analytics.html
├── reports.html
├── profile.html
├── css/style.css
├── js/
│   ├── config.js           # API_BASE_URL
│   ├── api.js              # Fetch layer + auth helpers
│   ├── demo-data.js        # Labeled demonstration data
│   ├── app.js              # Shared UI (toasts, sidebar, formatters)
│   ├── auth.js
│   ├── dashboard.js
│   ├── add-data.js
│   ├── upload-csv.js
│   ├── analytics.js
│   ├── reports.js
│   └── profile.js
└── README.md
```

## Run locally

No build step required.

```bash
cd authentic-reach
# Option A: Python
python3 -m http.server 8080
# Option B: npx
npx serve .
```

Open `http://localhost:8080` (or the port shown). Start at **login.html**.

**Demo mode:** If the Flask API is not running, any email/password signs you in locally and the UI uses clearly labeled **demonstration data**.

## Configure Flask API URL

Default: `http://127.0.0.1:5000`

Override:

1. Edit `js/config.js` → `API_BASE_URL`
2. Or in the browser console:  
   `localStorage.setItem('ar_api_base', 'https://your-api.onrender.com')`
3. Or query string: `?api=https://your-api.onrender.com`

Production frontend (Vercel) should point `API_BASE_URL` at your Render Flask URL. Ensure CORS allows your Vercel origin.

## Backend endpoints expected

Implement these on Flask (adjust paths as needed; keep `api.js` in sync):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | `{ full_name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/dashboard/summary` | KPI aggregates (+ optional chart payloads) |
| GET | `/api/analytics` | Organic / paid breakdowns |
| GET | `/api/social-data` | List posts (query filters) |
| POST | `/api/social-data` | Create one record |
| POST | `/api/social-data/import-csv` | `{ records: [...] }` |
| GET | `/api/reports` | Filtered report data |
| GET | `/api/profile` | Current user |
| PUT | `/api/profile` | Update profile |

Auth: prefer `Authorization: Bearer <token>` (or HTTP-only cookies if you configure credentials + CORS).

**Never** put Supabase service-role keys or Flask secrets in this frontend.

## Supabase

Use Supabase from the **Flask backend** only (connection string / service role). The frontend should not embed database credentials. Optional: Supabase Auth via backend-issued JWTs only—do not mix two independent client-side auth systems.

## Design system (from Stitch)

- Font: Inter  
- Primary / Paid: `#2563EB`  
- Tertiary / Organic: `#14B8A6` / `#006056`  
- Surfaces: `#f8f9ff`, cards white  
- Icons: Material Symbols Outlined  
- Tailwind CDN with project color tokens  

## Testing checklist

- [ ] Login / register (API up and demo offline path)
- [ ] Sidebar navigation + active state
- [ ] Mobile menu open/close
- [ ] Dashboard KPIs and all four charts render
- [ ] Organic / Paid / All attribution filters
- [ ] Add Data validation (required, non-negative, ad spend for Paid)
- [ ] CSV sample download, invalid file rejection, preview, import disabled when 0 valid
- [ ] Analytics metrics and tables
- [ ] Reports generate + CSV download + print PDF
- [ ] Profile save (local fallback)
- [ ] Logout confirmation modal
- [ ] No secrets in client source

## Deployment

- **Frontend:** Vercel (static) — set production `API_BASE_URL` before deploy or inject via build step.
- **Backend:** Render (Flask + gunicorn) + Supabase Postgres.

## License / academic use

Built for BCA minor project **Authentic Reach**. Demo data is fictional.
