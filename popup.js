document.getElementById('scrapeButton').addEventListener('click', () => {
    const outputElement = document.getElementById('output');

    // Show loading indicator
    outputElement.textContent = 'Loading...';
    outputElement.style.display = 'block'; // Show output box
    // Clear the storage when Listing Builder is clicked
    chrome.storage.local.remove(['scrapedContent'], () => {
        console.log('Storage cleared.');
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getProductDetails' }, (response) => {
            let { newProductTitle, newProductDescription, trendingKeywordUsed } = response;
            try {
                newProductDescription = marked.parse(newProductDescription);
            } catch(err) {
                console.log(err);
            };
            const htmlContent = `
                <h3>New title: ${newProductTitle}</h3>
                <h3>About this product(description)</h3>
                <p>${newProductDescription}</p>
                <h3>Trending keyword used</h3>
                <p>${trendingKeywordUsed}</p>
            `;
            outputElement.innerHTML = htmlContent;
            chrome.storage.local.set({
                scrapedContent: htmlContent,
            });

        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('output');

    // Load stored content when the popup is opened
    chrome.storage.local.get(['scrapedContent'], (result) => {
        if (result && result.scrapedContent) {
            outputElement.innerHTML = result.scrapedContent;
            outputElement.style.display = 'block'; // Show output box if content exists
        }
    });
});