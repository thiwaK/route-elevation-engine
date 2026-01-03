const tileStyling = {
  landcover: [],
  hillshade: [],
  contour: function (properties: any, zoom: number) {},
};

tileStyling.contour = function (properties: any, zoom: number) {
  const c = properties.class;
  
  return {
    weight: 3,
    color: "#A86507FF",
    opacity: 0.8,
  };
};

export default tileStyling;