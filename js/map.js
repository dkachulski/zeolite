document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('mouseenter', mapHighlight));
    document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('mouseleave', removeMapHighlight));

    // Click on map or outside map
    document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('click', mapExpandController));

    // One dropdown on map clicks
    // document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('click', showContent));
});

// MAP DECORATIONS
function mapHighlight(ev) {
    const map = ev.target.dataset.map;
    document.querySelector(`.${map}`).classList.add('highlighted');
    ev.target.classList.add('highlighted');
}
function removeMapHighlight(ev) {
    const map = ev.target.dataset.map;
    document.querySelector(`.${map}`).classList.remove('highlighted');
    ev.target.classList.remove('highlighted');
}

// function clickMapHightlight(ev) {
//     // Remove all hightlighting
//     document.querySelector('.map-pin.highlighted')?.classList.remove('highlighted');
//     document.querySelector('.map-pin.clicked')?.classList.remove('clicked');
//     document.querySelector('.map.highlighted')?.classList.remove('highlighted');
//     document.querySelector('.map.clicked')?.classList.remove('clicked');

//     // if area is clicked hightlight it + the pin
//     if (ev.target.classList.contains('map-pin') || ev.target.classList.contains('pin-icon')) {
//         // make sure the span is selected not the pin inside
//         const elem = ev.target.dataset.map ? ev.target : ev.target.parentElement;

//         elem.classList.add('clicked');
//         document.querySelector(`.${elem.dataset.map}`).classList.add('clicked');
//         ev.stopPropagation();
//     }
// }
function mapExpandController(ev) {
    // select the <span> (not the <i>)
    const span = ev.target.dataset.map ? ev.target : ev.target.parentElement;

    // If button opened and different from button clicked - swap the contents
    if (document.querySelector('.map-pin.clicked') && document.querySelector('.map-pin.clicked') !== span)
        swapMapContents(span);
    // If nothing opened - open the clicked one
    else if (!document.querySelector('.map-pin.clicked')) openMapContents(span);
    // If same map is opened - close it
    else if (span.classList.contains('clicked')) closeMapContents(span);

    function openMapContents(span) {
        const map = span.dataset.map;
        // Make map clicked
        document.querySelector(`.${map}`).classList.add('clicked');
        // Make pin clicked
        span.classList.add('clicked');
        // Hide previous content if it was shown
        document.querySelectorAll(`.map-content`).forEach(box => box.classList.add('map-content-hidden'));
        // Show content
        document.querySelector(`.map-content.content-${map}`).classList.remove('map-content-hidden');
        document.getElementById('map-dropdown-button').click();
    }

    function closeMapContents(span) {
        const map = span.dataset.map;
        // Remove clicked class from map
        document.querySelector(`.${map}`).classList.remove('clicked');
        // Remove clicked class from pin
        span.classList.remove('clicked');
        // Hide content
        document.getElementById('map-dropdown-button').click();
    }

    function swapMapContents(span) {
        const map = span.dataset.map;

        // Clear previous contents
        document.querySelector('.map-pin.clicked')?.classList.remove('clicked');
        document.querySelector('.map.clicked')?.classList.remove('clicked');
        // Make map clicked
        document.querySelector(`.${map}`).classList.add('clicked');
        // Make pin clicked
        span.classList.add('clicked');
        // Hide previous content
        document.querySelectorAll(`.map-content`).forEach(box => box.classList.add('map-content-hidden'));
        // Show new content
        document.querySelector(`.map-content.content-${map}`).classList.remove('map-content-hidden');
    }
}
