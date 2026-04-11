
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

  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.resultsList = document.getElementById('results-list');

    this.setupListener();
    this.prefetch();
  }

  async prefetch() {
    await this.fetchResults('');
  };

  setupListener() {
    this.searchInput.addEventListener('input', async (e) => {
      if (this.timeoutId) {
        console.log('clear timeout');
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(async () => {
        this.timeoutId = null;

        const text = e.target.value;
        await this.fetchResults(text);
      }, 10);
    })
  }

  async fetchResults(text) {
    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController();

    console.log('fetching:', text);

    this.results = await fetchSuggestions(text, this.abortController.signal);
    console.log('render results:', this.results);

    this.updateDOM();
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



