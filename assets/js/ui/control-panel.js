function createButton({ label, icon, isActive = false }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `toolbar-btn${isActive ? ' is-active' : ''}`;
  button.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i><span>${label}</span>`;
  return button;
}

export function addMapToolbar({
  map,
  baseMaps,
  defaultBaseKey,
  overlays,
  initialBounds,
  onBaseChange,
}) {
  const state = {
    currentBaseKey: defaultBaseKey,
  };

  function setActive(button, isActive) {
    button.classList.toggle('is-active', Boolean(isActive));
  }

  function switchBase(nextKey) {
    if (!baseMaps[nextKey] || state.currentBaseKey === nextKey) {
      return;
    }

    const current = baseMaps[state.currentBaseKey];
    if (current?.layer && map.hasLayer(current.layer)) {
      map.removeLayer(current.layer);
    }

    baseMaps[nextKey].layer.addTo(map);
    state.currentBaseKey = nextKey;
    onBaseChange?.(nextKey);

    for (const [key, entry] of Object.entries(baseButtonMap)) {
      setActive(entry.button, key === nextKey);
    }
  }

  function toggleOverlay(key) {
    const entry = overlays[key];
    if (!entry?.layer) {
      return;
    }

    if (map.hasLayer(entry.layer)) {
      map.removeLayer(entry.layer);
      setActive(entry.button, false);
    } else {
      entry.layer.addTo(map);
      setActive(entry.button, true);
    }
  }

  const Control = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const container = L.DomUtil.create('div', 'map-toolbar leaflet-control');
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      container.innerHTML = `
        <section class="map-toolbar__section">
          <div class="map-toolbar__header">
            <h3 class="map-toolbar__title">Base raster</h3>
          </div>
          <div class="map-toolbar__body">
            <div class="map-toolbar__grid map-toolbar__grid--bases" data-base-grid></div>
          </div>
        </section>
        <section class="map-toolbar__section">
          <div class="map-toolbar__header">
            <h3 class="map-toolbar__title">Livelli</h3>
          </div>
          <div class="map-toolbar__body">
            <div class="map-toolbar__grid map-toolbar__grid--layers" data-overlay-grid></div>
          </div>
          <div class="map-toolbar__footer">
            <button type="button" class="toolbar-btn toolbar-btn--ghost" data-action="home">
              <i class="bi bi-house-door-fill" aria-hidden="true"></i><span>Vista iniziale</span>
            </button>
            <button type="button" class="toolbar-btn toolbar-btn--ghost" data-action="close-modal">
              <i class="bi bi-x-lg" aria-hidden="true"></i><span>Chiudi pannello</span>
            </button>
          </div>
        </section>
      `;

      const baseGrid = container.querySelector('[data-base-grid]');
      const overlayGrid = container.querySelector('[data-overlay-grid]');

      for (const [key, base] of Object.entries(baseMaps)) {
        const button = createButton({
          label: base.label,
          icon: base.icon,
          isActive: key === defaultBaseKey,
        });
        button.addEventListener('click', () => switchBase(key));
        baseGrid.appendChild(button);
        baseButtonMap[key] = { button, layer: base.layer };
      }

      for (const [key, overlay] of Object.entries(overlays)) {
        const button = createButton({
          label: overlay.label,
          icon: overlay.icon,
          isActive: map.hasLayer(overlay.layer),
        });
        button.addEventListener('click', () => toggleOverlay(key));
        overlayGrid.appendChild(button);
        overlays[key].button = button;
      }

      container.querySelector('[data-action="home"]').addEventListener('click', () => {
        if (initialBounds?.isValid?.()) {
          map.fitBounds(initialBounds, { padding: [40, 40] });
        }
      });

      container.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
        document.getElementById('info-close')?.click();
      });

      return container;
    },
  });

  const baseButtonMap = {};
  const control = new Control();
  control.addTo(map);

  return {
    switchBase,
    toggleOverlay,
  };
}
