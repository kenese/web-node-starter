
function fetchSuggestions(query, signal) {
    return new Promise((resolve) => {
        const suggestions = ["Poster", "Instagram Post", "Presentation", "Video", "Resume", "Logo", "Flyer"]
            .filter(item => item.toLowerCase().includes(query.toLowerCase()));

        const timeoutId = setTimeout(() => {
            resolve(suggestions);
        }, Math.random() * 900 + 100);

        signal.onabort = () => {
            console.log('aborting', query);
            clearTimeout(timeoutId);
        };
    });
}

class SearchController {
    timeoutId = null;
    abortController = null;

    constructor(props) {
        this.searchInput = document.getElementById('search-input');
        this.resultsList = document.getElementById('results-list');

        this.setupListener();
    }

    setupListener() {
        this.searchInput.addEventListener('input', async (e) => {
            if (this.timeoutId) {
                console.log('clear timeout');
                clearTimeout(timeoutId);
            }
            this.timeoutId = setTimeout(async () => {

                if (this.abortController) {
                    this.abortController.abort()
                }
                this.timeoutId = null;
                this.abortController = new AbortController();

                const text = e.target.value;
                console.log('fetching:', text);

                this.results = await fetchSuggestions(text, this.abortController.signal);
                console.log('render results:', this.results);

                this.updateDOM();
            }, 10);
        })
    }

    updateDOM() {
        const fragment = document.createDocumentFragment();

        this.results.forEach(item => {
            const el = document.createElement('div');
            el.textContent = item;
            fragment.appendChild(el);
        });
        this.resultsList.innerHTML = '';
        this.resultsList.appendChild(fragment);
    }
}

new SearchController();





