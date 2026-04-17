export function createMap(config) {
  const map = L.map('map', {
    zoomControl: false,
    preferCanvas: true,
    attributionControl: true,
    worldCopyJump: false,
    minZoom: 2,
  }).setView(config.initialView.center, config.initialView.zoom);

  map.createPane('historicalProvinces');
  map.createPane('historicalStates');
  map.createPane('rivers');
  map.createPane('sharedBorderGlow');
  map.createPane('sharedBorder');
  map.createPane('route');
  map.createPane('routeSymbols');
  map.createPane('secondaryTopo');
  map.createPane('markers');

  map.getPane('historicalProvinces').style.zIndex = 410;
  map.getPane('historicalStates').style.zIndex = 420;
  map.getPane('rivers').style.zIndex = 455;
  map.getPane('sharedBorderGlow').style.zIndex = 470;
  map.getPane('sharedBorder').style.zIndex = 480;
  map.getPane('route').style.zIndex = 520;
  map.getPane('routeSymbols').style.zIndex = 530;
  map.getPane('secondaryTopo').style.zIndex = 600;
  map.getPane('markers').style.zIndex = 620;

  map.appRenderers = {
    historicalProvinces: L.canvas({ pane: 'historicalProvinces', padding: 0.35 }),
    historicalStates: L.canvas({ pane: 'historicalStates', padding: 0.25 }),
    rivers: L.canvas({ pane: 'rivers', padding: 0.2 }),
    route: L.canvas({ pane: 'route', padding: 0.2 }),
    secondaryTopo: L.svg({ pane: 'secondaryTopo', padding: 0.2 }),
    sharedBorder: L.svg({ pane: 'sharedBorder', padding: 0.2 }),
  };

  L.control.zoom({ position: 'topright' }).addTo(map);

  return map;
}
