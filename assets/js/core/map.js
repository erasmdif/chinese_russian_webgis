export function createMap(config) {
  const map = L.map('map', {
    zoomControl: false,
    preferCanvas: false,
    attributionControl: true,
    worldCopyJump: false,
    minZoom: 2,
  }).setView(config.initialView.center, config.initialView.zoom);

  map.createPane('historicalProvinces');
  map.createPane('historicalStates');
  map.createPane('sharedBorderGlow');
  map.createPane('sharedBorder');
  map.createPane('route');
  map.createPane('markers');

  map.getPane('historicalProvinces').style.zIndex = 410;
  map.getPane('historicalStates').style.zIndex = 420;
  map.getPane('sharedBorderGlow').style.zIndex = 470;
  map.getPane('sharedBorder').style.zIndex = 480;
  map.getPane('route').style.zIndex = 520;
  map.getPane('markers').style.zIndex = 620;

  L.control.zoom({ position: 'topright' }).addTo(map);

  return map;
}
