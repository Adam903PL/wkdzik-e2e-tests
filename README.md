# WKDZIK E2E Tests

Zestaw testow end-to-end napisanych w Playwright dla [wkdzik.pl](https://wkdzik.pl/).

Repo zawiera automatyczne scenariusze dla najwazniejszych flow sklepu:
- ladowanie strony glownej
- logowanie uzytkownika
- dodawanie produktu do koszyka
- przejscie przez checkout
- nawigacja po glownej strukturze sklepu
- sortowanie, filtrowanie i wyszukiwanie
- walidacje formularzy
- operacje w koszyku

Testy sa oparte o scenariusze z pliku [Test.md](./Test.md), ale zostaly dopasowane do aktualnego UI i realnego zachowania sklepu.

## Stack

- Node.js
- Playwright
- TypeScript

## Struktura

```text
tests/example.spec.ts     glowne scenariusze E2E
playwright.config.ts      konfiguracja runnera i przegladarek
Test.md                   zrodlo scenariuszy testowych
.env                      lokalne dane logowania do testow
playwright-report/        raport HTML po wykonaniu testow
test-results/             artefakty, trace i bledy z runow
```

## Co sprawdzaja testy

Suite obejmuje 25 scenariuszy uruchamianych na:
- Chromium
- Firefox
- WebKit

Najwazniejsze zalozenia:
- testy nie koncza sie na samej zmianie URL, tylko sprawdzaja realny wynik akcji
- asercje sa wzmocnione pod aktualny layout strony
- checkout jest testowany bez skladania prawdziwego zamowienia
- dane logowania sa pobierane z `.env`
- jesli scenariusz wymaga tylko zalogowanej sesji, test moze skorzystac z bezpiecznego fallbacku na konto jednorazowe

## Wymagania

- Node.js 20+ lub nowszy
- zainstalowane zaleznosci z `package-lock.json`
- Playwright browsers zainstalowane lokalnie

## Instalacja

```bash
npm install
npx playwright install
```

## Konfiguracja `.env`

Utworz lokalny plik `.env` w katalogu repo:

```env
WKDZIK_LOGIN_EMAIL=twoj_email
WKDZIK_LOGIN_PASSWORD=twoje_haslo
```

Plik `.env` jest ignorowany przez git i nie powinien trafic do repozytorium.

## Uruchamianie testow

Pelna suite:

```bash
npm test
```

Run z otwieraniem przegladarki:

```bash
npm run test:headed
```

Tylko Chromium:

```bash
npm run test:chromium
```

Pojedynczy scenariusz po ID:

```bash
npx playwright test tests/example.spec.ts --grep "TC_WKD_005"
```

## Raporty

Po wykonaniu testow Playwright generuje raport HTML w katalogu `playwright-report/`.

Podglad raportu:

```bash
npm run test:report
```

## Bezpieczenstwo checkoutu

Scenariusz checkoutu klika finalny przycisk zamowienia, ale request POST odpowiedzialny za faktyczne zlozenie zamowienia jest przechwytywany i przerywany. Dzięki temu:
- test przechodzi przez realny flow
- waliduje formularz i payload
- nie tworzy prawdziwego zamowienia w sklepie

## Dobre praktyki w tym repo

- nie commitujemy `.env`
- nie commitujemy `playwright-report/` ani `test-results/`
- przed mocniejszym refactorem najlepiej odpalic calosc lokalnie
- przy zmianach UI warto najpierw porownac test z aktualnym flow strony, a dopiero potem poprawiac selektory

## Aktualny status

Ostatnia pelna weryfikacja lokalna:

```text
75 passed
3 browsers
0 failed
```

## Autor

Projekt przygotowany pod automatyzacje testow E2E dla WKDZIK.
