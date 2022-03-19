document.addEventListener('DOMContentLoaded', () => {
    // connect <select> element to language controller
    languageController.subscribeElement('header .lang-select');

    // change position of dropdown depending on width of screen (so it looks nice, but it does not come off screen)
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const width = entry.contentBoxSize[0].inlineSize;
            if (width > 992 && width < 1800)
                document.querySelector('header .dropdown-menu').classList.add('dropdown-menu-end');
            else document.querySelector('header .dropdown-menu').classList.remove('dropdown-menu-end');

            // move navigation button on mobile in a different position not to clash with social buttons
            const button = document.getElementById('offcanvas-navigation-button');
            if (width < 576) {
                const smParent = document.getElementById('nav-button-container-small-mobile');
                if (button.parentElement !== smParent) smParent.appendChild(button);
            } else {
                const lgParent = document.getElementById('nav-button-container-above-small-mobile');
                if (button.parentElement !== lgParent) lgParent.appendChild(button);
            }
        }
    });
    resizeObserver.observe(document.querySelector('header'));

    // Connect map to navigation links in header
    document.querySelectorAll('header .link-to-map').forEach(link =>
        link.addEventListener('click', ev => {
            const mapArea = ev.target.dataset.mapArea;
            // click on map if not clicked
            document.querySelector(`.map-pin.fill.map-pin${mapArea}:not(.clicked)`)?.click();
        })
    );
    // Close OffCanvas Button to be clicked on mobile when clicked to navigation to scroll down
    let timer;
    document.querySelectorAll('header .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                document.getElementById('offcanvas-navigation-close-button').click();
            }, 600);
            timer();
        });
    });

    // Navigation menu prevent scrolling up
    const myOffcanvas = document.getElementById('navmenu');
    const bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
    const offCanvasButton = document.querySelector('#offcanvas-navigation-button');
    offCanvasButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        bsOffcanvas.toggle();
    });
});
