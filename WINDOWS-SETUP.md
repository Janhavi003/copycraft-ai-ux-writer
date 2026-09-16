# Windows setup

Use PowerShell.

```powershell
cd E:\Projects\copycraft-production
npm install
npm run dev
```

If Next cache needs clearing:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Do not paste CSS directly into PowerShell. CSS belongs in `app/globals.css`.
