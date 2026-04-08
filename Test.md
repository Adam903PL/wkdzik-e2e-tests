# Scenariusze Testów – Strona WKDZIK.PL

**URL testowanej strony:** https://wkdzik.pl/
**Data wykonania testów:** 17.03.2026
**Tester:** Adam
**Narzędzia:** Playwright (automatyzacja)

---

## TC_WKD_001 – Ładowanie strony głównej
**Tytuł:** Poprawne załadowanie strony głównej
**Warunki wstępne:**
* Działające połączenie z internetem
* Przeglądarka internetowa (Chrome / Firefox / Edge)
* Strona https://wkdzik.pl/ jest dostępna

**Kroki:**
1. Otwórz przeglądarkę internetową.
2. W pasku adresu wpisz: **https://wkdzik.pl/**
3. Naciśnij Enter i poczekaj na pełne załadowanie strony.

**Oczekiwany Rezultat:**
* Strona ładuje się poprawnie (kod HTTP 200).
* Widoczny jest tytuł strony zawierający słowo **„WKDZIK”**.
* W nawigacji widoczne są przyciski: **NOWOŚCI, UBRANIA, SUPLEMENTY, AKCESORIA**.
* Brak błędów w konsoli przeglądarki.

---

## TC_WKD_002 – Logowanie użytkownika sukces
**Tytuł:** Poprawne logowanie użytkownika do panelu klienta
**Warunki wstępne:**
* Działające połączenie z internetem
* Strona główna https://wkdzik.pl/ jest załadowana
* Konto użytkownika (**pukaluk.adam505@gmail.com**) istnieje w systemie

**Kroki:**
1. Kliknij przycisk **„Zaloguj się”** w prawym górnym rogu strony.
2. W polu **„E-mail:”** wpisz adres: `pukaluk.adam505@gmail.com`
3. W polu **„Hasło:”** wpisz `h.LgYdYef6jK$d_`.
4. Kliknij przycisk **„Zaloguj się”** pod polami formularza.

**Oczekiwany Rezultat:**
* Użytkownik zostaje pomyślnie zalogowany do systemu.
* W nagłówku zamiast „Zaloguj się” pojawia się link **„Moje konto”**.
* Brak komunikatu o niepoprawnych danych.

---

## TC_WKD_003 – Dodanie produktu do koszyka
**Tytuł:** Weryfikacja dodawania produktu do koszyka z kategorii UBRANIA
**Warunki wstępne:**
* Użytkownik znajduje się na stronie głównej.
* Kategoria **„UBRANIA”** jest dostępna.

**Kroki:**
1. Kliknij w zakładkę **„UBRANIA”** w górnym menu nawigacyjnym.
2. Wybierz pierwszy produkt z listy wyświetlonych ubrań klikając w jego nazwę.
3. Na stronie produktu wybierz rozmiar **„M”** klikając w odpowiedni kwadrat.
4. Kliknij przycisk **„Do koszyka”**.

**Oczekiwany Rezultat:**
* Produkt zostaje pomyślnie dodany do koszyka zakupowego.
* Pojawia się komunikat lub modal potwierdzający dodanie (np. **„Dodano do koszyka”**).
* Ikona koszyka w nagłówku aktualizuje swoją wartość (wyświetla liczbę produktów).

---

## TC_WKD_004 – Usunięcie produktu z koszyka
**Tytuł:** Weryfikacja funkcjonalności usuwania produktów z koszyka
**Warunki wstępne:**
* Co najmniej jeden produkt znajduje się już w koszyku.
* Użytkownik przebywa na stronie: **https://wkdzik.pl/pl/basket**

**Kroki:**
1. Zlokalizuj produkt na liście w koszyku.
2. Kliknij przycisk usuwania (ikona kosza na śmieci lub napis **„usuń”**) przy produkcie.

**Oczekiwany Rezultat:**
* Produkt zostaje natychmiastowo usunięty z koszyka.
* Lista produktów w koszyku zostaje odświeżona.
* Jeśli to był jedyny produkt, pojawia się informacja **„Twój koszyk jest pusty”**.

---

## TC_WKD_005 – Przejdź do kasy
**Tytuł:** Weryfikacja przekierowania do procesu finalizacji zamówienia
**Warunki wstępne:**
* Produkt znajduje się w koszyku.
* Użytkownik znajduje się na stronie koszyka.

**Kroki:**
1. Kliknij przycisk **„Przejdź do kasy”**.

**Oczekiwany Rezultat:**
* Użytkownik zostaje przekierowany na stronę wyboru metody dostawy i płatności.
* URL strony zmienia się na proces checkoutu (brak słowa „basket”).
* Widoczny jest formularz wprowadzania danych do wysyłki.

---

## TC_WKD_006 – Nawigacja do zakładki NOWOŚCI
**Tytuł:** Sprawdzenie poprawności linku „NOWOŚCI”
**Warunki wstępne:**
* Strona główna załadowana.

**Kroki:**
1. Kliknij przycisk **„NOWOŚCI”** w głównym menu.

**Oczekiwany Rezultat:**
* Strona z nowymi produktami ładuje się poprawnie.
* Adres URL zawiera frazę **„nowosci”** lub **„news”**.
* Widoczna jest lista najnowszych produktów w sklepie.

---

## TC_WKD_007 – Nawigacja do zakładki UBRANIA
**Tytuł:** Sprawdzenie poprawności linku „UBRANIA”
**Warunki wstępne:**
* Strona główna załadowana.

**Kroki:**
1. Kliknij przycisk **„UBRANIA”** w głównym menu.

**Oczekiwany Rezultat:**
* Przekierowanie na stronę z odzieżą.
* URL zawiera słowo **„ubrania”**.
* Wyświetlone zostają kategorie odzieży lub lista ubrań.

---

## TC_WKD_008 – Link Regulamin w stopce
**Tytuł:** Weryfikacja dostępu do regulaminu sklepu
**Warunki wstępne:**
* Użytkownik znajduje się na dowolnej stronie serwisu.

**Kroki:**
1. Przewiń stronę na sam dół (sekcja footer).
2. Kliknij w link o nazwie **„Regulamin”**.

**Oczekiwany Rezultat:**
* Otwiera się podstrona z pełną treścią regulaminu sklepu.
* Adres URL zmienia się na zawierający frazę **„regulamin”**.
* Strona jest czytelna i poprawnie sformatowana.

---

## TC_WKD_009 – Wyszukiwanie produktu „Białko”
**Tytuł:** Weryfikacja działania wyszukiwarki sklepowej
**Warunki wstępne:**
* Dostęp do internetu.
* Strona główna załadowana.

**Kroki:**
1. Kliknij ikonę **lupy** (wyszukiwania) w nagłówku strony.
2. W polu, które się pojawi, wpisz słowo: **„Białko”**.
3. Naciśnij klawisz **Enter** na klawiaturze.

**Oczekiwany Rezultat:**
* System wyświetla listę produktów pasujących do frazy „Białko”.
* URL strony zawiera parametr wyszukiwania (np. `s=Białko`).
* Liczba znalezionych produktów jest wyświetlona na górze listy.

---

## TC_WKD_010 – Wyświetlanie ceny produktu
**Tytuł:** Weryfikacja obecności ceny na stronie konkretnego produktu
**Warunki wstępne:**
* Otwarta dowolna karta produktu.

**Kroki:**
1. Zlokalizuj sekcję ceny obok zdjęcia produktu i przycisku dodawania do koszyka.

**Oczekiwany Rezultat:**
* Cena produktu jest wyraźnie widoczna i czytelna.
* Cena jest podana w walucie **zł**.
* Widoczna jest informacja o podatku VAT.

---

## TC_WKD_011 – Linki do Social Media (Instagram)
**Tytuł:** Weryfikacja odnośnika do profilu Instagram
**Warunki wstępne:**
* Stopka strony jest widoczna.

**Kroki:**
1. Znajdź ikonę aparatu (**Instagram**) w dolnej części strony.
2. Kliknij w tę ikonę (lub sprawdź dokąd prowadzi link).

**Oczekiwany Rezultat:**
* Link prowadzi do oficjalnego profilu **wkdzik** na Instagramie.
* Adres zawiera domenę `instagram.com`.
* Ikona jest poprawnie wyświetlana i reaguje na najechanie myszką.

---

## TC_WKD_012 – Podstrona Kontakt
**Tytuł:** Weryfikacja przejścia do formularza kontaktowego
**Warunki wstępne:**
* Stopka strony jest widoczna.

**Kroki:**
1. Kliknij w link **„Kontakt”** w stopce sklepu.

**Oczekiwany Rezultat:**
* Pojawia się strona z pełnymi danymi kontaktowymi firmy.
* Widoczny jest formularz kontaktowy lub adres e-mail do kontaktu.
* Tytuł strony to **„Kontakt”**.

---

## TC_WKD_013 – Logowanie błąd (Niepoprawne dane)
**Tytuł:** Weryfikacja obsługi błędnych danych logowania
**Warunki wstępne:**
* Strona logowania jest otwarta.

**Kroki:**
1. W polu **„E-mail:”** wpisz nieistniejący adres (np. `zle@email.pl`).
2. W polu **„Hasło:”** wpisz dowolne hasło.
3. Kliknij przycisk **„Zaloguj się”**.

**Oczekiwany Rezultat:**
* Logowanie nie dochodzi do skutku.
* Pojawia się komunikat o błędzie (np. czerwony napis: **„Niepoprawne dane logowania”**).
* Użytkownik pozostaje na stronie logowania.

---

## TC_WKD_014 – Nawigacja do zakładki SUPLEMENTY
**Tytuł:** Sprawdzenie poprawności linku „SUPLEMENTY”
**Warunki wstępne:**
* Strona główna załadowana.

**Kroki:**
1. Kliknij przycisk **„SUPLEMENTY”** w głównym menu.

**Oczekiwany Rezultat:**
* Przekierowanie na stronę z suplementami diety.
* URL zawiera słowo **„suplementy”**.
* Widoczna jest lista produktów (białka, kreatyny, witaminy).

---

## TC_WKD_015 – Nawigacja do zakładki AKCESORIA
**Tytuł:** Sprawdzenie poprawności linku „AKCESORIA”
**Warunki wstępne:**
* Strona główna załadowana.

**Kroki:**
1. Kliknij przycisk **„AKCESORIA”** w głównym menu.

**Oczekiwany Rezultat:**
* Przekierowanie na stronę z akcesoriami treningowymi.
* URL zawiera słowo **„akcesoria”**.
* Widoczna jest lista produktów (shakery, pasy treningowe itp.).

---

## TC_WKD_016 – Sortowanie po cenie rosnąco
**Tytuł:** Weryfikacja sortowania produktów od najniższej ceny
**Warunki wstępne:**
* Otwarta dowolna kategoria produktów (np. **UBRANIA**).

**Kroki:**
1. Znajdź listę rozwijaną (select) służącą do sortowania.
2. Wybierz z listy opcję **„Cena rosnąco”**.

**Oczekiwany Rezultat:**
* Produkty na liście przeładowują się automatycznie.
* Pierwszy produkt na liście ma najniższą możliwą cenę w tej kategorii.
* URL strony aktualizuje się o parametr sortowania (`sort=price_asc`).

---

## TC_WKD_017 – Sortowanie po cenie malejąco
**Tytuł:** Weryfikacja sortowania produktów od najwyższej ceny
**Warunki wstępne:**
* Otwarta dowolna kategoria produktów (np. **UBRANIA**).

**Kroki:**
1. Znajdź listę rozwijaną (select) służącą do sortowania.
2. Wybierz z listy opcję **„Cena malejąco”**.

**Oczekiwany Rezultat:**
* Produkty na liście przeładowują się automatycznie.
* Pierwszy produkt na liście ma najwyższą cenę w tej kategorii.
* URL strony aktualizuje się o parametr sortowania (`sort=price_desc`).

---

## TC_WKD_018 – Filtrowanie po rozmiarze L
**Tytuł:** Weryfikacja działania filtrów bocznych dla ubrań
**Warunki wstępne:**
* Otwarta kategoria **„UBRANIA”**.
* Filtry są widoczne (po lewej stronie lub pod przyciskiem filtra).

**Kroki:**
1. Rozwiń sekcję filtra o nazwie **„Rozmiar”**.
2. Zaznacz pole wyboru (checkbox) przy rozmiarze **„L”**.

**Oczekiwany Rezultat:**
* Lista produktów zostaje natychmiast odfiltrowana.
* Wyświetlane są wyłącznie ubrania dostępne w rozmiarze L.
* Widoczny jest licznik produktów pasujących do filtra.

---

## TC_WKD_019 – Newsletter walidacja pustego pola
**Tytuł:** Sprawdzenie walidacji formularza zapisu do newslettera
**Warunki wstępne:**
* Użytkownik przebywa na stronie głównej (newsletter jest na dole).

**Kroki:**
1. Pozostaw pole e-mail puste.
2. Kliknij przycisk **„Zapisz się”**.

**Oczekiwany Rezultat:**
* Przeglądarka blokuje wysłanie formularza.
* Pojawia się ostrzeżenie o braku danych (np. **„Proszę wypełnić to pole”**).
* Użytkownik nie zostaje zapisany bez podania adresu email.

---

## TC_WKD_020 – Link Polityka Prywatności
**Tytuł:** Weryfikacja dostępu do polityki prywatności firmy
**Warunki wstępne:**
* Stopka strony jest dostępna.

**Kroki:**
1. Znajdź i kliknij w link **„Polityka prywatności”** w stopce.

**Oczekiwany Rezultat:**
* Przekierowanie do strony z polityką prywatności i zasadami RODO.
* Adres URL zawiera frazę **„polityka-prywatnosci”**.
* Treść strony jest czytelna i poprawnie wyświetlona.

---

## TC_WKD_021 – Link FAQ w stopce
**Tytuł:** Weryfikacja sekcji najczęściej zadawanych pytań
**Warunki wstępne:**
* Stopka strony jest dostępna.

**Kroki:**
1. Znajdź link **„FAQ”** w sekcji pomoc w stopce.
2. Kliknij w ten link.

**Oczekiwany Rezultat:**
* Otwiera się strona z zestawem najczęstszych pytań i odpowiedzi.
* URL strony zawiera słowo **„faq”**.
* Strona zawiera pomocne informacje dla klientów sklepu.

---

## TC_WKD_022 – Zmiana rozmiaru na karcie produktu
**Tytuł:** Weryfikacja możliwości przełączania wybranego rozmiaru
**Warunki wstępne:**
* Otwarta karta produktu odzieżowego (np. koszulka) z wieloma rozmiarami.

**Kroki:**
1. Kliknij w przycisk/kwadrat z rozmiarem **„S”**.
2. Następnie kliknij w przycisk z rozmiarem **„L”**.

**Oczekiwany Rezultat:**
* Aktywny wybór płynnie zmienia się z S na L.
* Wybrany rozmiar (L) zostaje graficznie podświetlony lub obramowany.
* Poprzedni wybór przestaje być wyróżniony.

---

## TC_WKD_023 – Zmiana ilości produktu w koszyku
**Tytuł:** Weryfikacja aktualizacji liczby sztuk produktu w koszyku
**Warunki wstępne:**
* Produkt znajduje się w koszyku.
* Użytkownik przebywa na stronie koszyka.

**Kroki:**
1. W polu ilości (okienko z cyfrą) przy produkcie wpisz cyfrę **„2”** zamiast domyślnej „1”.
2. Kliknij poza polem lub naciśnij Enter, aby system załadował zmianę.

**Oczekiwany Rezultat:**
* Liczba sztuk produktu w koszyku zostaje zmieniona na 2.
* Strona koszyka odświeża wartości bez żadnych błędów.
* Wartość w okienku ilości to teraz „2”.

---

## TC_WKD_024 – Przeliczenie sumy zamówienia
**Tytuł:** Weryfikacja automatycznego przeliczania łącznej kwoty do zapłaty
**Warunki wstępne:**
* Użytkownik zmienił ilość produktu na 2 (z kroku TC_WKD_023).

**Kroki:**
1. Sprawdź kwotę wyświetlaną w polu **„Suma”** lub **„Razem”** pod listą produktów.

**Oczekiwany Rezultat:**
* Kwota łączna zostaje automatycznie przeliczona.
* Suma końcowa odpowiada cenie dwóch sztuk produktu.
* Obliczenia są poprawne matematycznie.

---

## TC_WKD_025 – Powrót do strony głównej przez logo
**Tytuł:** Weryfikacja logo jako głównego odnośnika do strony startowej
**Warunki wstępne:**
* Użytkownik znajduje się na dowolnej podstronie serwisu (np. kontakt lub koszyk).

**Kroki:**
1. Kliknij w główne logo **„WK DZIK”** znajdujące się w nagłówku (górna część strony).

**Oczekiwany Rezultat:**
* Użytkownik zostaje natychmiastowo przekierowany na stronę główną.
* URL zmienia się na **https://wkdzik.pl/**.
* Wszystkie sekcje strony głównej są poprawnie widoczne.
ta łączna zostaje automatycznie zaktualizowana
Suma końcowa jest teraz dwa razy większa niż dla pojedynczej sztuki
Brak błędów w obliczeniach

TC_WKD_025 – Powrót do strony głównej przez logoTC_WKD_025 – Powrót do strony głównej przez logo
Tytuł:Tytuł: Weryfikacja logo jako odnośnika do strony startowej
Warunki wstępne:Warunki wstępne:
Użytkownik znajduje się na dowolnej podstronie (np. /nowosci)
Kroki:Kroki:
1. Kliknij w główne logo WK DZIK znajdujące się na samym środku lub po lewej w nagłówku
Oczekiwany Rezultat:Oczekiwany Rezultat:
Użytkownik zostaje natychmiastowo przekierowany na stronę główną
URL zmienia się na https://wkdzik.pl/
Wszystkie elementy strony głównej są poprawnie załadowane
