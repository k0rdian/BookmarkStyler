# BookmarkStyler

BookmarkStyler to lekka aplikacja desktopowa (Electron) ułatwiająca projektowanie styli `userChrome.css` dla zakładek Firefoksa. Interfejs inspirowany narzędziami takimi jak Figma pozwala tworzyć własne zestawy folderów, podfolderów oraz zakładek, dopasowywać ich wygląd i natychmiast generować kod CSS do wklejenia w `userChrome.css`.

## Funkcje

- dodawanie elementów (folder, podfolder, zakładka) z gotowymi presetami,
- „scena” z podglądem wyglądu przypominającym figmowy canvas,
- panel właściwości z możliwością modyfikacji kolorów, cieni, promienia narożników, paddingów i dodatkowego CSS,
- szybkie przyciski kształtów (kwadrat, zaokrąglony, kółko) manipulujące promieniem narożników,
- edytowalne tokeny bazowe (kolory, padding, promienie) wraz z odpowiednikami dla trybu ciemnego,
- generator kodu CSS z komentarzami pozwalającymi na późniejszy import,
- import istniejących styli wygenerowanych przez BookmarkStyler (tokeny + elementy),
- kopiowanie CSS jednym kliknięciem.

## Wymagania

- Node.js 18+
- npm lub yarn (do instalacji zależności)

## Instalacja i uruchomienie

```bash
npm install
npm start
```

Polecenie `npm start` uruchomi aplikację Electron. W trybie developerskim możesz otworzyć DevTools (skrót `Cmd+Opt+I`).

## Import kodu

Jeżeli masz już fragment CSS wygenerowany przez BookmarkStyler, wklej go w panelu „Wklej istniejący kod” i kliknij **Zaimportuj**. Aplikacja odczyta tokeny bazowe, tryb ciemny oraz elementy (foldery/podfoldery/zakładki) i umożliwi dalszą edycję.

## Eksport kodu

Wygenerowany kod zawiera komentarze z metadanymi w formacie JSON, dzięki czemu późniejszy import zachowuje wszystkie właściwości. Skopiowany CSS można od razu wkleić do `userChrome.css`.
