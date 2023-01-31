const data = [
  {
    coords: [45.224621, 147.876862],
    name: "Аврора Авиакомпания",
    address_first: "Курильск, Сахалинская область, 694530",
    address_second: "Кооперативная улица, 1А",
    phone: "+7-000-000-00-00",
    hours: "тут будет какая-то информация",
  },
];

ymaps.ready(init);

function init() {
  const myMap = new ymaps.Map("YMapsID", {
      center: [45.22, 147.88],
      zoom: 4,
      controls: [],
    }),
    myCollection = new ymaps.GeoObjectCollection(),
    myPoints = data;

  for (let i = 0, l = myPoints.length; i < l; i++) {
    const point = myPoints[i];
    myCollection.add(
      new ymaps.Placemark(
        point.coords,
        {
          balloonContentHeader: `<span class="description">${point.name}</span>`,
          balloonContentBody:
            '<a href="tel:+7-800-000-00-00">+7 (800) 000-00-00</a><br/>' +
            `<b>${point.address_first}</b><br/>${point.address_second}`,
          balloonContentFooter: `${point.hours}`,
        },
        {
          iconColor: "#87ceeb",
        }
      )
    );
  }

  myMap.geoObjects.add(myCollection);

  const mySearchControl = new ymaps.control.SearchControl({
    options: {
      provider: new CustomSearchProvider(myPoints),
      noPlacemark: true,
      resultsPerPage: 5,
    },
  });

  myMap.controls.add(mySearchControl, { float: "left" });
}

function CustomSearchProvider(points) {
  this.points = points;
}

CustomSearchProvider.prototype.geocode = function (request, options) {
  const deferred = new ymaps.vow.defer(),
    geoObjects = new ymaps.GeoObjectCollection(),
    offset = options.skip || 0,
    limit = options.results || 20;

  let points = [];

  for (let i = 0, l = this.points.length; i < l; i++) {
    const point = this.points[i];
    if (
      point.address_first.toLowerCase().indexOf(request.toLowerCase()) != -1
    ) {
      points.push(point);
    }
  }
  points = points.splice(offset, limit);
  for (let i = 0, l = points.length; i < l; i++) {
    const point = points[i],
      coords = point.coords,
      text = point.address_first;

    geoObjects.add(
      new ymaps.Placemark(coords, {
        name: text + " name",
        description: text + " description",
        balloonContentBody: "<p>" + text + "</p>",
        boundedBy: [coords, coords],
      })
    );
  }

  deferred.resolve({
    geoObjects: geoObjects,
    metaData: {
      geocoder: {
        request: request,
        found: geoObjects.getLength(),
        results: limit,
        skip: offset,
      },
    },
  });

  return deferred.promise();
};
