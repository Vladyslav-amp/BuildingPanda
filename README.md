# Strona firmy budowlanej (React + Vite + SCSS + BEM + mixiny)

✅ Każdy komponent ma własny folder:  
`Header/Header.jsx` + `Header.scss`, `StatsSkills/StatsSkills.jsx` + `StatsSkills.scss`, itd.  

✅ Dodane globalne **zmienne i mixiny SCSS**:

- `src/styles/_variables.scss` – kolory, promienie, breakpointy
- `src/styles/_mixins.scss` – podstawowe mixiny (`flex-center`, `card`, `shadow-soft`, `respond-md`)

W każdym pliku SCSS możesz z nich korzystać przez:

```scss
@use "../../styles/variables" as *;
@use "../../styles/mixins" as *;
```

Potem normalnie:

```scss
background-color: $color-primary;
@include card;
@include respond-md {
  // style mobile
}
```

## Jak uruchomić

```bash
npm install
npm run dev
```

Wejdź na adres z terminala, np. `http://localhost:5173`.

## Gdzie dodać swoje mixiny

Plik: `src/styles/_mixins.scss`  
Po prostu dopisz własne:

```scss
@mixin my-button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
}
```

I używaj w dowolnym komponencie (`@use "../../styles/mixins" as *;` + `@include my-button;`).
