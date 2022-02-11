class LanguageController {
    constructor() {
        this.langElements = [];
        this.currentLanguage =
            localStorage.getItem('preferred-language') || navigator.language.substring(0, 2);

        // applyLangToPage page upon loading all elements
        document.addEventListener('DOMContentLoaded', () => {
            this.applyLangToPage();
        });
    }

    // fetch content and apply on page based on language
    async applyLangToPage() {
        const language = this.currentLanguage;
        let content;
        // in preferred language does not exist in our database - fetch english
        try {
            content = await fetch(`./languages/${language}.json`).then(resp => resp.json());
            document.querySelectorAll('[data-key]').forEach(container => {
                container.textContent = content[language][container.dataset.key];
            });
        } catch {
            content = await fetch(`./languages/en.json`).then(resp => resp.json());
            document.querySelectorAll('[data-key]').forEach(container => {
                container.textContent = content.en[container.dataset.key];
            });
        }
    }

    subscribeElement(selector) {
        const element = document.querySelector(selector);
        element
            .querySelectorAll('li')
            .forEach(li => li.addEventListener('click', ev => this.changeLanguage(ev)));

        // // add spans inside button
        const btn = element.querySelector('.lang-select-button');
        console.log(btn);

        btn.textContent = '';
        btn.innerHTML = element.querySelector(`[data-lang="${this.currentLanguage}"]`).innerHTML;
        // spans2.forEach(span => btn.appendChild(span));
        this.langElements.push(element);
    }
    changeLanguage(ev) {
        localStorage.setItem('preferred-language', ev.currentTarget.dataset.lang);
        this.currentLanguage = ev.currentTarget.dataset.lang;
        this.applyLangToPage();
        this.syncElements(ev);
    }
    syncElements(ev) {
        ev.preventDefault();

        this.langElements.forEach(
            elem =>
                (elem.querySelector('.lang-select-button').innerHTML = ev.currentTarget.innerHTML)
        );
    }
}

const languageController = new LanguageController();
