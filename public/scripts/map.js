//first initialize the map as a global valuable//
let map;

//get mapid from route/
const pathname = window.location.pathname;
const mapId = pathname.split("/")[2];

$(document).ready(() => {
  fetchMap();

  // const $addPinButton = $('#floating-menu').children('.add-marker')
  // $addPinButton.on('click', console.log('YO YO YO'));
});

//Load fullsize google map//
const loadMap = (mapData) => {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: mapData.avg_lat, lng: mapData.avg_lng },
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  });

  // Listen for any clicks on the map
  map.addListener("click", onMapClick);
};

// Add a new marker when clicking map
const onMapClick = (event) => {
  const coordinates = event.latLng;
  addNewPin(coordinates);
};

// Add a new marker to map
const addNewPin = (position) => {
  const newPin = new google.maps.Marker({
    position,
    map,
  });

  const pinData = {
    map_id: mapId,
    title: "Untitled pin",
    description: "Enter description",
    image_url: "Image URL",
    latitude: newPin.getPosition().lat(),
    longitude: newPin.getPosition().lng(),
  };

  // New marker is automatically added to database
  $.ajax({
    url: "/pins/new",
    method: "POST",
    data: pinData,
  })
    .then(() => {
      console.log("new pin added!");
    })
    .catch((err) => console.log("OOPSIE DOOPSIE", err.message));
};

//For google map pins//
const mapPins = (pin) => {
  const marker = new google.maps.Marker({
    position: { lat: pin.lat, lng: pin.lng },
    map: map,
  });

  mapInfo(pin);

  marker.addListener("click", () => {
    infowindow.open({
      anchor: marker,
      map,
    });
  });
};

//For google map info//
const mapInfo = (pin) => {
  const content = `
  <div class='info-window'>
     <h3>${pin.title}</h3>
     <img src='${pin.image_url}'>
     <p>${pin.description}</p>
     <div class='info-buttons'>
       <img onClick="deletePin(${pin.id})" class='pin-trash' src='../docs/icons8-waste-50.png'>
       <img onClick="editPin(${pin.id})" class='pin-edit' src='../docs/icons8-pencil-50.png'>
     </div>
  </div>
  `;

  return (infowindow = new google.maps.InfoWindow({
    content: content,
  }));
};

//create HTML skeleton//
const createMapElement = (map) => {
  const mapName = map.name;
  const mapDesc = map.description;
  const $map = `
    <section id="list-of-locations">
      <a id="back-to-maps" href="/">Back to maps</a>
      <h2>${mapName}</h2>
      <p>${mapDesc}</p>
      <ul class='pin-list'>
      </ul>
    </section>
    <div id="map-buttons">
      <button class="add-marker">Add</button>
      <button class="share-btn">Share</button>
    </div>
 `;
  return $map;
};

const fetchMap = () => {
  // $("#pin-form").slideUp();
  $.get(`/maps/api/${mapId}`).then((map) => renderMap(map));
};

const renderMap = function (map) {
  const fetchPins = (mapId) => {
    $.get(`/pins/bymap/${mapId}`).then((pins) => {
      renderPins(pins);
    });
  };

  const renderPins = (pins) => {
    for (const pin of pins) {
      mapPins(pin);

      $(".pin-list").prepend(`<li>${pin.title}</li>`);
    }
  };

  loadMap(map);
  fetchPins(map.id);

  $("#floating-menu").empty();
  const $map = createMapElement(map);
  $("#floating-menu").append($map);
};

//delete pin when click the trash icon//
const deletePin = (pinId) => {
  $.get(`/pins/${pinId}/delete`).then(() => {
    alert("pin is deleted");
  });
  fetchMap();
};

//edit pin when click the pen icon
const editPin = (pinId) => {
  console.log("edit", pinId);
  $("#pin-form").toggle();
};
