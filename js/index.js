var map,heatmap;
function loadMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: -26.191, lng: 28.032},
    mapTypeId: 'hybrid'
  });
}
