// connect <select> element to language controller

languageController.subscribeElement('header .lang-select');

// chnage position of dropdown depending on width of screen (so it looks nice, but it does not come off screen)
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const width = entry.contentBoxSize[0].inlineSize;
        if (
            (width > 752 && width < 1116) ||
            (width > 1183 && width < 1308) ||
            (width > 1383 && width < 1500)
        )
            document.querySelector('header .dropdown-menu').classList.add('dropdown-menu-end');
        else document.querySelector('header .dropdown-menu').classList.remove('dropdown-menu-end');
    }
});

resizeObserver.observe(document.querySelector('header'));
