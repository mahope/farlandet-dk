# Supabase URL Konfiguration for Password Reset

For at password reset skal fungere korrekt, skal du konfigurere redirect URLs i Supabase Dashboard:

## 1. Gå til Supabase Dashboard
- Åbn dit Supabase projekt: https://app.supabase.com/project/[dit-projekt-id]

## 2. Naviger til Authentication → URL Configuration
- Gå til Authentication → Settings → URL Configuration

## 3. Tilføj Redirect URLs
Tilføj følgende URLs til "Redirect URLs" listen:

**For development:**
```
http://localhost:5173/auth/reset-password
http://localhost:5174/auth/reset-password  
http://localhost:5175/auth/reset-password
```

**For production:**
```
https://farlandet.dk/auth/reset-password
https://www.farlandet.dk/auth/reset-password
```

## 4. Site URL
Sæt "Site URL" til:
- **Development:** `http://localhost:5173`
- **Production:** `https://farlandet.dk`

## 5. Gem ændringerne
Klik "Save" for at gemme konfigurationen.

## Hvordan det virker nu:
1. Bruger anmoder om password reset
2. Supabase sender email med link til `/auth/reset-password`
3. Brugeren klikker på linket og bliver dirigeret til vores ResetPasswordPage
4. Siden validerer session og lader brugeren indtaste ny adgangskode
5. Efter succesful opdatering redirectes brugeren til forsiden

## Test flow:
1. Gå til login siden
2. Klik "Glemt adgangskode?"
3. Indtast din email
4. Tjek din email for reset link
5. Klik på linket
6. Indtast ny adgangskode
7. Bekræft at du bliver redirected til forsiden og er logget ind