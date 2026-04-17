function emptyFeatureCollection() {
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchGeoJson(path, label, { optional = true } = {}) {
  try {
    const response = await fetch(path, { cache: 'default' });
    if (!response.ok) {
      if (optional) {
        return emptyFeatureCollection();
      }
      throw new Error(`Impossibile caricare ${label} (${response.status}).`);
    }

    return response.json();
  } catch (error) {
    if (optional) {
      return emptyFeatureCollection();
    }
    throw error;
  }
}

export async function loadDatasets(paths) {
  const [china, russia, places, missionaryPath, rivers, otherTopo] = await Promise.all([
    fetchGeoJson(paths.china, 'china_1820.geojson'),
    fetchGeoJson(paths.russia, 'russia_1820.geojson'),
    fetchGeoJson(paths.places, 'places.geojson'),
    fetchGeoJson(paths.missionaryPath, 'missionary_path.geojson'),
    fetchGeoJson(paths.rivers, 'rivers.geojson'),
    fetchGeoJson(paths.otherTopo, 'other_topo.geojson'),
  ]);

  return { china, russia, places, missionaryPath, rivers, otherTopo };
}
