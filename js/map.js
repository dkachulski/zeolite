document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('mouseenter', mapHighlight));
    document.querySelectorAll('.map-pin.fill').forEach(pin => pin.addEventListener('mouseleave', removeMapHighlight));

    document.addEventListener('click', clickMapHightlight);
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

function clickMapHightlight(ev) {
    // Remove all hightlighting
    document.querySelector('.map-pin.highlighted')?.classList.remove('highlighted');
    document.querySelector('.map-pin.clicked')?.classList.remove('clicked');
    document.querySelector('.map.highlighted')?.classList.remove('highlighted');
    document.querySelector('.map.clicked')?.classList.remove('clicked');

    // if area is clicked hightlight it + the pin
    if (ev.target.classList.contains('map-pin') || ev.target.classList.contains('pin-icon')) {
        // make sure the span is selected not the pin inside
        const elem = ev.target.dataset.map ? ev.target : ev.target.parentElement;

        elem.classList.add('clicked');
        document.querySelector(`.${elem.dataset.map}`).classList.add('clicked');
        ev.stopPropagation();
    }
}

// DROP DOWN MENU
