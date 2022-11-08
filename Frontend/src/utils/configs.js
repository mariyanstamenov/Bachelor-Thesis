export const maps = [
    {
        label: "Kaiserslautern",
        map: "map1.png",
        options: {
            lngMin: 7.35,
            lngMax: 8.05,
            latMin: 49.30,
            latMax: 49.61
        },
        w: 2.261,
        d: 1.522
    },
    {
        label: "Tirschenreuth",
        map: "map2.png",
        options: {
            lngMin: 11.79,
            lngMax: 12.55,
            latMin: 49.73,
            latMax: 50.08
        },
        w: 2.09,
        d: 1.35
    }
];

export const apis = [
    {
        api: "residences",
        attributes: ["n_seniors", "walkscore"],
        type: "point",
        label: "Residences",
        limit: 4000
    },
    {
        api: "routes",
        attributes: ["id_wohnort", "id_einrichtung"],
        type: "line",
        label: "Routes",
        limit: 100
    },
    {
        api: "facilities",
        attributes: ["name", "type"],
        type: "point",
        label: "Facilities",
        limit: 4000
    },
]

export const sortByOptions = ["walkscore", "n_seniors"];
export const colorByOptions = ["walkscore", "n_seniors"];

// example url: https://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=OSM-WMS&HEIGHT=1024&WIDTH=786&SRS=EPSG:4326&STYLES=&BBOX=11.715951223,49.686003350,12.459549674,50.230286753

export const createMapUrl = (lngMin, latMin, lngMax, latMax) => {
    let url = "https://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=OSM-WMS&HEIGHT=1024&WIDTH=786&SRS=EPSG:4326&STYLES=";
    url += `&BBOX=${lngMin},${latMin},${lngMax},${latMax}`;

    return url;
}

export const percentColors = [
    { pct: 0.0, color: { r: 0x50, g: 0x00, b: 0 } },
    { pct: 0.1, color: { r: 0xcc, g: 0x00, b: 0 } },
    { pct: 0.2, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 0.7, color: { r: 0xff, g: 0xf0, b: 0 } },
    { pct: 0.9, color: { r: 0x00, g: 0x50, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } },
    { pct: 2.0, color: { r: 0x00, g: 0xff, b: 0xff } }
];
