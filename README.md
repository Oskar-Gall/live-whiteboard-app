# Wspólna Tablica (Real-time Whiteboard)

Interaktywna aplikacja typu Whiteboard umożliwiająca rysowanie w czasie rzeczywistym. Projekt wykorzystuje **HTML5 Canvas API** do rysowania oraz **Firebase Firestore** do natychmiastowej synchronizacji obiektów (prostokąty, koła) między użytkownikami.

---

### 🛑 Jak uruchomić projekt

W pliku `script.js` znajdują się zastępcze klucze API (`YOUR_API_KEY`). Aby aplikacja połączyła się z bazą danych:

1.  Sklonuj repozytorium.
2.  Utwórz darmowy projekt w [Firebase Console](https://console.firebase.google.com/).
3.  Stwórz bazę **Firestore Database**.
4.  Otwórz plik `script.js` i w obiekcie `firebaseConfig` (na samej górze) podmień wartości `YOUR_...` na swoje klucze z Firebase.
5.  Otwórz `index.html`.

---

## 🚀 Funkcje

* **Synchronizacja w czasie rzeczywistym:** Dzięki `onSnapshot` z Firestore, każdy narysowany kształt pojawia się natychmiast u wszystkich użytkowników.
* **Narzędzia:** Rysowanie prostokątów i kół, zmiana kolorów.
* **Edycja:** Narzędzie "Przesuń" (Move) pozwala chwycić i przestawić dowolny obiekt na tablicy.
* **Usuwanie:** Możliwość usuwania obiektów.
* **Bezpieczny rendering:** Aplikacja rysuje po elemencie `<canvas>`, co jest wydajne i bezpieczne.

---

## 🛠️ Technologie

* **JavaScript (ES6 Modules)**
* **HTML5 Canvas API** (`getContext('2d')`)
* **Firebase Firestore** (jako baza NoSQL Realtime)
* **CSS3** (Zmienne, Flexbox)