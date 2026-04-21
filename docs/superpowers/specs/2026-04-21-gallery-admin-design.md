# Galeria + Panel Admin — Specyfikacja

**Data:** 2026-04-21  
**Projekt:** AC-Drill landing page  
**Stack:** React + TypeScript + Vite + Tailwind + shadcn/ui + react-router-dom  
**Serwer:** home.pl (Apache + PHP, 100 GB dysk)

---

## 1. Cel

Dodanie dwóch nowych podstron do istniejącej strony:

- `/galeria` — publiczna galeria zdjęć z realizacji AC-Drill
- `/admin` — prywatny panel do samodzielnego zarządzania zdjęciami przez właściciela

---

## 2. Architektura

### Backend (PHP)

Nowe pliki w katalogu `public/api/`:

| Plik | Metoda | Opis |
|------|--------|------|
| `gallery.php` | GET | Zwraca JSON z listą zdjęć + statystyki dysku (nie wymaga sesji) |
| `auth-check.php` | GET | Zwraca `{authenticated: bool}` (nie wymaga sesji) |
| `upload.php` | POST multipart | Wgrywa zdjęcie, generuje miniaturę, aktualizuje `gallery.json` (wymaga sesji) |
| `delete.php` | POST | Usuwa zdjęcie + miniaturę + wpis w `gallery.json` (wymaga sesji) |
| `login.php` | POST | Weryfikuje login/hasło, tworzy sesję PHP |
| `logout.php` | POST | Niszczy sesję PHP |

Plik konfiguracyjny `public/api/config.php` — przechowuje zahashowane hasło (password_hash) i login admina. Nie jest dostępny przez HTTP (zabezpieczony przez `.htaccess` lub przeniesiony poza web root).

**Magazyn danych:**

```
public/
  uploads/
    gallery/           ← oryginalne zdjęcia
    gallery/thumbs/    ← miniatury 400×300px (auto, PHP GD)
  api/
    gallery.json       ← lista metadanych zdjęć
```

Format odpowiedzi `GET /api/gallery.php`:
```json
{
  "images": [
    {
      "filename": "wiercenie-hdd-01.jpg",
      "url": "/uploads/gallery/wiercenie-hdd-01.jpg",
      "thumb": "/uploads/gallery/thumbs/wiercenie-hdd-01.jpg",
      "uploaded_at": "2026-04-18T10:32:00"
    }
  ],
  "stats": {
    "count": 4,
    "used_mb": 26,
    "total_gb": 100
  }
}
```

`stats.used_mb` — suma rozmiarów plików w `uploads/gallery/` (bez thumbs).  
`stats.total_gb` — stała zapisana w `config.php` (właściciel aktualizuje ręcznie w razie zmiany planu hostingowego).

**Walidacja uploadu (PHP):**
- Dozwolone MIME typy: `image/jpeg`, `image/png`, `image/webp`
- Maksymalny rozmiar: 20 MB
- Nazwa pliku sanitizowana (slugify + uniqid prefix)
- Miniatura generowana przez PHP GD: max 400×300px, zachowane proporcje

**Sesja admina:**
- Login + hasło (password_hash/password_verify)
- Sesja PHP (`session_start()`)
- Każdy endpoint wymagający autoryzacji sprawdza `$_SESSION['admin'] === true`
- Brak ograniczenia liczby prób logowania (wystarczające dla małej strony firmowej)

### Frontend (React)

**Routing** — nowe trasy w `src/App.tsx`:

```
/galeria       → <GaleriaPage />
/admin/login   → <AdminLoginPage />
/admin         → <AdminPage /> (chroniony — redirect do /admin/login jeśli brak sesji)
```

**Nowe pliki:**

```
src/
  pages/
    Galeria.tsx          ← publiczna galeria
    AdminLogin.tsx       ← formularz logowania
    Admin.tsx            ← panel admina
  components/
    gallery/
      GalleryGrid.tsx    ← siatka zdjęć
      Lightbox.tsx       ← powiększenie po kliknięciu
    admin/
      UploadZone.tsx     ← drag & drop + wybór pliku
      PhotoGrid.tsx      ← siatka z przyciskami usuwania
  hooks/
    useAdminAuth.ts      ← sprawdzanie sesji admina
```

---

## 3. Strona /galeria

**Layout:**
- Nagłówek Hero: etykieta "Portfolio", tytuł "Nasze **Realizacje**", linia pomarańczowa, podtytuł
- Siatka 3 kolumny (desktop) → 2 (tablet ≤768px) → 1 (mobile ≤480px)
- Proporcje zdjęć: 4:3
- Hover: pomarańczowa nakładka + ikona powiększenia
- Kliknięcie otwiera Lightbox (pełny ekran + nawigacja strzałkami / klawiatura)

**Pobieranie danych:**
- `fetch('/api/gallery.php')` przy montowaniu komponentu
- Stan ładowania: skeleton placeholder (szare kwadraty)
- Błąd: komunikat "Nie udało się wczytać galerii"
- Galeria pusta: komunikat "Brak zdjęć w galerii"

**Nawigacja:**
- Link "Galeria" dodany do `navItems` w `Header.tsx` — nawiguje do `/galeria` (react-router Link, nie scroll)

---

## 4. Panel /admin

### /admin/login

- Karta wyśrodkowana na stronie
- Pola: Login, Hasło
- POST do `/api/login.php` → po sukcesie redirect do `/admin`
- Błąd logowania: komunikat pod formularzem
- Styl: spójny z landing page (białe tło, pomarańczowy przycisk, cień karty)

### /admin (chroniony)

**Sprawdzanie sesji:**
- Przy wejściu na `/admin`: GET `/api/gallery.php` z `credentials: 'include'`; osobny endpoint `GET /api/auth-check.php` zwraca `{authenticated: bool}`
- Jeśli nie zalogowany → redirect `/admin/login`

**Sekcje panelu:**

1. **Nagłówek** — tytuł "Panel galerii", podtytuł, przycisk "Wyloguj"
2. **Statystyki** — 3 karty: liczba zdjęć, zajęte miejsce (MB), dostępne miejsce (GB)
3. **Strefa uploadu** — drag & drop + przycisk "Wybierz pliki"; po wyborze pliku upload automatyczny; pasek postępu podczas wysyłania
4. **Pasek miejsca na serwerze** — wizualny wskaźnik zajętości dysku (dane z `gallery.php`)
5. **Siatka zdjęć** — 4 kolumny (desktop) → 3 → 2; każde zdjęcie: miniatura + nazwa pliku + data dodania + przycisk usuwania (czerwony ✕); usunięcie wymaga potwierdzenia (confirm dialog)

---

## 5. Design

- **Motyw:** wyłącznie light mode (bez dark mode)
- **Kolory:** zgodne z istniejącym CSS — `--primary: 24 95% 53%` (pomarańczowy #f97316), białe tło, `--foreground: 215 25% 15%`
- **Font:** Inter (już załadowany)
- **Komponenty:** shadcn/ui (`Button`, `Input`, `Toast`) tam gdzie pasuje
- **RWD:** mobile-first, breakpointy Tailwind (`sm`, `md`, `lg`)

---

## 6. Bezpieczeństwo

- Hasło przechowywane jako hash (`password_hash` PHP)
- Upload: walidacja MIME po treści pliku (nie tylko rozszerzenie), limit rozmiaru
- Nazwy plików sanitizowane przed zapisem
- Wszystkie endpointy modyfikujące dane sprawdzają sesję
- `config.php` niedostępny przez HTTP
- CSRF: nie implementujemy (wystarczające dla panelu jednego użytkownika)

---

## 7. Poza zakresem

- Kategorie zdjęć
- Dark mode dla galerii / admina
- Paginacja (implementacja gdy liczba zdjęć przekroczy ~50)
- Zmiana kolejności zdjęć (drag & drop reorder)
- Edycja nazwy/opisu zdjęcia po wgraniu
