// Loads different components into the page

// Container selector + paths for html, css, js
async function loadComponent(container, html, css, js) {
    // Fetch all
    const [htmlTxt, cssTxt, jsTxt] = await Promise.all([
        fetch(html).then(resp => resp.text()),
        css && fetch(css).then(resp => resp.text()),
        js && fetch(js).then(resp => resp.text()),
    ]);

    // append component
    const div = document.createElement('div');
    div.innerHTML = htmlTxt;
    document.querySelector(container).appendChild(div);

    const style = document.createElement('style');
    style.textContent = cssTxt;
    document.head.insertAdjacentElement('beforeend', style);

    const script = document.createElement('script');
    script.textContent = jsTxt;
    script.type = 'module';
    document.head.insertAdjacentElement('beforeend', script);
}
