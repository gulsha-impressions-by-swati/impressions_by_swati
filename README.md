# Lavender Artist Gallery — React

A polished React/Vite artist portfolio with:

- Lavender visual theme
- Category-wise artwork browsing
- Artwork details in a full-screen easel-style viewer
- Zoom in / zoom out / reset
- Sold-out status
- Admin login
- Admin category creation
- Admin artwork photo upload
- Artwork title, description and price
- Browser persistence using localStorage
- Responsive mobile layout
- Artist logo support through `public/logo.png`

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Logo

Put the artist logo at:

`public/logo.png`

## Demo admin

Password:

`artist123`

### Important for production

This starter uses browser localStorage and a demo password so the application can run immediately without a backend. For a real public website, replace this with proper authentication and cloud image/database storage (for example Supabase, Firebase, or your own API).