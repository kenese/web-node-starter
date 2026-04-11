
function fetchSuggestions(query, signal) {
    return new Promise((resolve, reject) => {
        const suggestions = ["Poster", "Instagram Post", "Presentation", "Video", "Resume", "Logo", "Flyer"]
            .filter(item => item.toLowerCase().includes(query.toLowerCase()));

        const timeoutId = setTimeout(() => {
            resolve(suggestions);
        }, Math.random() * 900 + 100);

        signal.onabort = () => {
            clearTimeout(timeoutId);
            reject({ query, aborted: true });
        };
    });
}

class SearchController {
    timeoutId = null;
    abortController = null;
    allResults = new Map();

    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.resultsList = document.getElementById('results-list');

        this.setupListener();
        this.prefetch();
    }

    async prefetch ()  {
        await this.fetchResults('');
    };

    setupListener() {
        this.searchInput.addEventListener('input', async (e) => {
            if (this.timeoutId) {
                console.log('clear timeout');
                clearTimeout(timeoutId);
            }
            this.timeoutId = setTimeout(async () => {
                this.timeoutId = null;

                const text = e.target.value;
                if (this.allResults.has(text)) {
                    console.log('rendering from cache', text);
                    this.currentResults = this.allResults.get(text);
                    this.updateDOM();
                    return;
                }
                await this.fetchResults(text);
            }, 10);
        })
    }

    async fetchResults(text) {
        if (this.abortController) {
            this.abortController.abort()
        }
        this.abortController = new AbortController();

        try {
            console.log('fetching:', text);
            this.currentResults = await fetchSuggestions(text, this.abortController.signal);
            this.allResults.set(text, this.currentResults);
        } catch (error) {
            if (error.aborted) {
                console.log('aborted:', error.query)
                return
            }
            console.error(error);
        }

        console.log('render results:', text, this.currentResults);
        this.updateDOM();
    }

    updateDOM() {
        const fragment = document.createDocumentFragment();

        this.currentResults.forEach(item => {
            const el = document.createElement('div');
            el.textContent = item;
            fragment.appendChild(el);
        });
        this.resultsList.innerHTML = '';
        this.resultsList.appendChild(fragment);
    }
}

new SearchController();



