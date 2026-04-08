export function addLegend(map) {
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function onAdd() {
    const div = L.DomUtil.create('div', 'legend-control');
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    div.innerHTML = `
      <h3>Legenda</h3>
      <ul>
        <li><span class="legend-swatch" style="background: rgba(237,237,237,0.22);"></span> Province storiche</li>
        <li><span class="legend-swatch" style="background: rgba(255,255,255,0.04); border-radius: 999px;"></span> Contorno statale</li>
        <li><span class="legend-line"></span> Frontiera condivisa</li>
        <li><span class="legend-marker"></span> Città / tappe</li>
      </ul>
    `;
    return div;
  };

  legend.addTo(map);
}
