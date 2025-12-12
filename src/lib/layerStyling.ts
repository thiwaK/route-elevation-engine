const vectorTileStyling = {
  admin: [],
  aeroway: [],
  airport_label: [],
  building: [],
  landuse_overlay: [],
  landuse: [],
  motorway_junction: [],
  natural_label: [],
  structure: [],
  transit_stop_label: [],
  water: [],
  waterway: [],
  country_label: [],
  marine_label: [],
  state_label: [],
  place_label: [],
  waterway_label: [],
  poi_label: [],
  road_label: [],
  housenum_label: [],
  road: function (properties: any, zoom: number) {},
};

vectorTileStyling.road = function (properties: any, zoom: number) {
  const c = properties.class;
  const primary_road = [
    "primary",
    "primary_link",
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
  ];

  const tracks_and_paths = [
    "street",
    "street_limited",
    "pedestrian",
    "track",
    "service",
    "path",
  ];

  if (primary_road.includes(c)) {
    return {
      weight: 2,
      color: "#EF1F1FFF",
      opacity: 0.8,
    };
  }

  if (["secondary", "secondary_link"].includes(c) && zoom >= 10) {
    return {
      weight: 2,
      color: "#EFB113FF",
      opacity: 0.8,
    };
  }

  if (["tertiary", "tertiary_link"].includes(c) && zoom >= 12) {
    return {
      weight: 2,
      dashArray: "2, 6",
      color: "#B5AC97FF",
      opacity: 0.8,
    };
  }

  if (tracks_and_paths.includes(c) && zoom >= 15) {
    return {
      weight: 1,
      dashArray: "2, 10",
      color: "#B5AC97FF",
      opacity: 0.8,
    };
  }

  return [];
};

export default vectorTileStyling;