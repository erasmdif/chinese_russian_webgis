export async function fetchGeoJson(path, label) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Impossibile caricare ${label} (${response.status}).`);
  }

  return response.json();
}

export async function loadDatasets(paths) {
  const [china, russia, places] = await Promise.all([
    fetchGeoJson(paths.china, 'china_1820.geojson'),
    fetchGeoJson(paths.russia, 'russia_1820.geojson'),
    fetchGeoJson(paths.places, 'places.geojson'),
  ]);

  return { china, russia, places };
}
