mapboxgl.accessToken = token;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 8, // starting zoom
projection: 'globe' // display the map as a 3D globe
});
map.addControl(new mapboxgl.NavigationControl(),'bottom-left');

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25})
    .setHTML(
        `<h4>${campground.title}</h4><p>${campground.location}</p>`
    )
)
.addTo(map);
map.on('style.load', () => {
map.setFog({}); // Set the default atmosphere style
});                                                                         