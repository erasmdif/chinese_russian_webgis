# Missionary Frontier Map

Piccola web app statica pensata per GitHub Pages.

## Struttura

- `index.html` — entry point
- `assets/css/styles.css` — stile globale
- `assets/js/` — moduli JavaScript divisi per responsabilità
- `data/` — GeoJSON
- `images/` — icone SVG dei marker
- `.nojekyll` — utile per GitHub Pages

## File da sostituire / aggiungere

Nella cartella `data/`:
- `china_1820.geojson`
- `russia_1820.geojson`
- `places.geojson` è già incluso

Nella cartella `images/`:
- `china.svg`
- `russia.svg`

## Record statali esterni

I record che rappresentano il poligono statale devono avere uno dei valori di proprietà uguale a:
- `China_1820_state`
- `Russia_1820_state`

Questo è configurato in `assets/js/config.js`.

## Cosa include questa versione

- solo le province sono cliccabili e aprono il pannello informativo
- i poligoni statali restano visibili come contorni, ma non sono interattivi
- cluster leggero per città molto vicine
- styling vettoriale differenziato per `dark`, `light`, `political`, `satellite`
- controllo raster/livelli in alto a destra
- niente headline sopra la mappa: il viewport parte subito dall’alto

## Basemap incluse

- Dark
- Light
- Political
- Satellite

## Note utili

- La frontiera condivisa viene calcolata lato client con Turf usando l’overlap delle linee di confine statale.
- Se il bordo rosso non compare, aumenta `sharedBorder.tolerance` in `assets/js/config.js` oppure pulisci i due poligoni statali.
- Per rendere il clustering più o meno aggressivo, modifica `places.clustering.maxClusterRadius` in `assets/js/config.js`.
- I percorsi sono tutti relativi, quindi la pubblicazione su GitHub Pages è diretta.
