---
name: design
description: Kierunek wizualny i system designu ReachSky. Czytaj przed każdą zmianą dotyczącą wyglądu, układu, typografii, kolorów lub nowego widoku.
---

# ReachSky — system designu

## Rozstrzygnięcie konfliktu kolorów (obowiązuje zawsze)

Brief (`FRONTEND-THEME-PROMPT.md`) i ten skill były sprzeczne w kwestii kolorów.
Obowiązuje poniższe rozstrzygnięcie — nie wracaj do sprzeczności:

- **Niebieski (`--color-primary`)**: tożsamość, nawigacja, linki, focus ring,
  przyciski drugorzędne. Nigdzie indziej.
- **Pomarańcz (`--color-price`)**: WYŁĄCZNIE rzeczy żywe — cena bieżąca,
  odliczanie, status RUNNING, główne CTA akcji licytacji. Nigdzie indziej.
  Jeśli pomarańcz jest na ekranie w pięciu miejscach, cztery są błędem.
- **Typ aukcji NIE jest kodowany kolorem.** Strzałka ↑ dla angielskiej
  (cena rośnie), strzałka ↓ dla holenderskiej (cena spada), obie w kolorze
  tekstu (`--color-ink-2`). Kierunek niesie informację lepiej niż barwa
  i działa przy daltonizmie.

## Czym jest ten produkt

Dom aukcyjny zasobów, które tracą wartość z upływem czasu: pokoje na jutro,
miejsca w busie, terminy, wycieczki last-minute. Dwie publiczności: kupujący
polujący na okazję i sprzedawca upłynniający zapas.

**Główne zadanie interfejsu: wiarygodnie pokazać ruch ceny i upływający czas.**
Wszystko inne jest drugorzędne. Jeśli element nie służy temu zadaniu albo
nawigacji do niego, nie ma go.

## Kierunek wizualny

Punkt odniesienia to **tablica odlotów i terminal transakcyjny**, nie strona
marketingowa i nie pulpit SaaS. Gęsto, rzędowo, dużo danych, zero ozdobników.
Użytkownik ma skanować, porównywać i podejmować decyzję pod presją czasu.

Ciepło zamiast chłodu: baza jest głęboko granatowa, nie czarna. Produkt
dotyczy podróży i wypoczynku, nie handlu instrumentami.

### Czego nie robimy

Te rzeczy są zakazane, bo są domyślne, nie wybrane:

- przyciemniona czerń (`#0B0B0B`, `#111`) jako tło — używamy granatu
- jeden jaskrawy akcent kwasowej zieleni albo wermilionu na czerni
- siatka identycznych zaokrąglonych kart z tym samym cieniem na wszystkim
- wersaliki w etykietach i nadlinie nad każdym nagłówkiem
- numerowanie `01 / 02 / 03` tam, gdzie treść nie jest sekwencją
- strzałka `→` doklejona do tekstu przycisków i linków
- metadane sklejane środkową kropką (`A · B · C`)
- wyróżnianie jednego słowa w nagłówku innym kolorem lub kursywą
- gradienty jako dekoracja
- animacje wejścia sekcji przy scrollu

### Tokeny koloru

```css
--surface-base:    #0E1428;  /* granat, tło aplikacji */
--surface-raised:  #161E3A;  /* panele, wiersze tabel */
--surface-sunken:  #0A0F1F;  /* wgłębienia, tło pól */
--ink-primary:     #EDEFF5;  /* tekst główny */
--ink-secondary:   #8A93AD;  /* tekst pomocniczy, etykiety */
--signal-live:     #F2A93B;  /* bursztyn — cena żyje, czas biegnie */
--signal-settled:  #4FA68B;  /* stonowana zieleń — rozstrzygnięte, opłacone */
--signal-stopped:  #C4556B;  /* przygaszona czerwień — anulowane, przepadłe */
--rule:            #25304F;  /* linie podziału */
```

Bursztyn jest **jedynym** kolorem akcentu i należy wyłącznie do rzeczy żywych:
cena bieżąca, odliczanie, status trwającej aukcji. Nie używamy go na przyciskach
nawigacji, linkach ani nagłówkach. Jeśli bursztyn jest na ekranie w pięciu
miejscach, cztery są błędem.

### Typografia

Jedna rodzina bezszeryfowa z porządnym zestawem cyfr. Preferowana kolejność:
Inter Tight, Söhne, IBM Plex Sans. Ładowana lokalnie, nie z CDN.

**Cyfry tabelaryczne są obowiązkowe** wszędzie, gdzie pojawia się cena,
czas lub odliczanie:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1;
```

Bez tego cena skacze w poziomie przy każdym odświeżeniu i wygląda jak usterka.
To jest najważniejszy detal typograficzny w tym projekcie.

Skala: 12 / 14 / 16 / 20 / 28 / 40 / 64. Cena bieżąca na karcie aukcji to 64,
waga 600, światło liter ujemne. Reszta interfejsu 14 i 16, waga 400–500.
Nagłówki 20 i 28, waga 500 — nie 700, nie potrzebujemy krzyku.

Długość wiersza tekstu ciągłego poniżej 72 znaków.

### Układ

Siatka 12-kolumnowa, maksymalna szerokość treści 1200 px, wyrównanie do lewej.
Wyśrodkowany tekst nigdzie poza stanem pustym i stroną błędu.

Skala odstępów oparta na 4: 4, 8, 12, 16, 24, 32, 48, 64.

**Listy aukcji są wierszami, nie kafelkami.** Wiersz niesie więcej danych
na tej samej powierzchni i pozwala porównać ceny wzrokiem w pionie.
Kolumny: zasób, typ aukcji, cena bieżąca, pozostały czas, status.
Kafelki dopuszczalne wyłącznie na stronie głównej dla wyróżnionych pozycji,
maksymalnie trzy.

Promień zaokrąglenia: 2 px na elementach sterujących, 4 px na panelach.
Zero zaokrągleń na wierszach tabeli. Jeden cień w całej aplikacji, używany
tylko na warstwach nakładanych.

Podziały robimy linią `--rule`, nie odstępem i nie cieniem.

### Ruch

Jedno miejsce z animacją: **zmiana ceny**. Gdy cena holenderska spada o krok,
wartość przeskakuje z krótkim przyciemnieniem bursztynu (160 ms). To ma być
zauważalne, bo niesie informację.

Poza tym: przejścia stanów elementów sterujących 120 ms, nic więcej.
Zero animacji wejścia, zero efektów przy przewijaniu.
`prefers-reduced-motion` wyłącza wszystko łącznie z błyskiem ceny.

## Reguły domenowe w interfejsie

**Cena holenderska jest schodkowa.** Nigdy jej nie interpolujemy, nie animujemy
płynnie i nie opisujemy słowem „interpolowana". Pokazujemy wartość z backendu
i czas do następnego kroku.

**Status pochodzi z backendu.** Nigdy nie wyliczamy go z porównania dat po
stronie klienta. Odliczanie służy wyłącznie wyświetlaniu pozostałego czasu.

**Ukryta cena minimalna nie istnieje w interfejsie.** Żadnego pola, żadnej
podpowiedzi, żadnego „blisko progu".

**Czas zawsze ze strefą.** Backend podaje `Instant`, front konwertuje na strefę
przeglądarki i wyświetla ją jawnie. Przy terminach podróży to nie jest detal.

## Stany

Każdy widok pobierający dane ma cztery stany i wszystkie są projektowane,
nie domyślne:

- **Ładowanie** — szkielet w kształcie docelowej treści, nie kręciołek
- **Pusto** — mówi, co zrobić dalej, a nie że „brak danych"
- **Błąd** — co się stało i co można zrobić, plus przycisk ponowienia.
  Bez przepraszania i bez kodów technicznych
- **Treść**

## Teksty

Polski, zdaniowo, bez wersalików. Czasowniki czynne. Przycisk nazywa
skutek: „Złóż ofertę", nie „Wyślij". Nazwa akcji nie zmienia się między
przyciskiem a potwierdzeniem.

Słownictwo spójne w całej aplikacji: *oferta* to listing wystawiony przez
sprzedawcę, *aukcja* to licytacja na nim, *stawka* to to, co składa kupujący.
Nie mieszamy tych trzech słów.

## Zanim uznasz widok za gotowy

- [ ] ceny i czasy mają cyfry tabelaryczne
- [ ] bursztyn występuje tylko przy rzeczach żywych
- [ ] cztery stany obsłużone
- [ ] działa przy 375 px bez poziomego przewijania
- [ ] fokus klawiatury widoczny na każdym elemencie sterującym
- [ ] kontrast tekstu pomocniczego co najmniej 4.5:1 wobec tła
- [ ] nic z listy zakazanej nie trafiło na ekran
- [ ] usuń jeden element, który nie służy zadaniu
