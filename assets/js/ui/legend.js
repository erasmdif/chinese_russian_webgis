export function addLegend(map) {
  const legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function onAdd() {
    const div = L.DomUtil.create('div', 'legend-control legend-control--expanded');
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    div.innerHTML = `
      <div class="legend-control__header">
        <h3>Legenda</h3>
        <button type="button" class="toolbar-toggle legend-control__toggle" aria-expanded="true" aria-label="Comprimi legenda">
          <i class="bi bi-chevron-up"></i>
        </button>
      </div>
      <div class="legend-control__body">
        <ul>
          <li><span class="legend-swatch" style="background: rgba(237,237,237,0.22);"></span> Province storiche</li>
          <li><span class="legend-swatch" style="background: rgba(255,255,255,0.04); border-radius: 999px;"></span> Contorno statale</li>
          <li><span class="legend-line"></span> Frontiera condivisa</li>
          <li><span class="legend-route legend-route--fluvial"></span> Percorso fluviale</li>
          <li><span class="legend-route legend-route--road"></span> Percorso terrestre</li>
          <li><span class="legend-route legend-route--other"></span> Altri tratti</li>
          <li><span class="legend-river"></span> Fiumi</li>
          <li><span class="legend-marker"></span> Città / tappe</li>
          <li><span class="legend-secondary"></span> Toponimi secondari</li>
        </ul>
      </div>
    `;

    div.querySelector('.legend-control__toggle').addEventListener('click', () => {
      const collapsed = div.classList.toggle('is-collapsed');
      div.querySelector('.legend-control__toggle').setAttribute('aria-expanded', String(!collapsed));
    });

    return div;
  };

  legend.addTo(map);
}
