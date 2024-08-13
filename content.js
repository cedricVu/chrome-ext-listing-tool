function getProductDetailsFromEtsy() {
    const title = document.querySelector('h1[data-buy-box-listing-title]').innerText;
    // Get content from the specific <ul> tag
    const highlightsElement = document.querySelector('ul[data-selector="product-details-highlights"]');
    let highlights = [];
    if (highlightsElement) {
        highlights = Array.from(highlightsElement.querySelectorAll('li')).map(li => {
            let text = li.querySelector('.wt-ml-xs-1').innerText.trim(); // Extract the associated text
            return text;
        });
        // Note: We don't need gift wrapping available
        highlights.filter(item => !item.includes('Gift'));
    }
    const description = document.querySelector('p[data-product-details-description-text-content]').innerText;
    const images = Array.from(document.querySelectorAll('ul[data-carousel-pane-list] img')).map(img => img.src);

    return {
        title,
        highlights,
        description,
        images
    };
}

function getAmazonProductDetails() {
    let title = document.getElementById('productTitle')?.innerText.trim() || "Title not found";
    let description = document.getElementById('feature-bullets')?.innerText.trim() || "Description not found";
    let images = [];

    // Collect all product images (thumbnails)
    let imageElements = document.querySelectorAll('#altImages img');
    if (imageElements.length === 0) {
        imageElements = document.querySelectorAll('#imgTagWrapperId img');
    }
    images = Array.from(imageElements).map(img => img.src);

    // Extract "Product details" section and convert it to a paragraph
    let productDetailsArray = [];
    document.querySelectorAll('.product-facts-detail').forEach(detail => {
        let key = detail.querySelector('.a-col-left span')?.innerText.trim();
        let value = detail.querySelector('.a-col-right span')?.innerText.trim();
        if (key && value) {
            productDetailsArray.push(`${key}: ${value}`);
        }
    });
    let productDetails = productDetailsArray.join('. ') + '.';

    // Extract "About this item" section and convert it to a paragraph
    let aboutThisItemArray = [];
    document.querySelectorAll('.a-unordered-list.a-vertical.a-spacing-small li').forEach(item => {
        let text = item.innerText.trim();
        if (text) {
            aboutThisItemArray.push(text);
        }
    });
    let aboutThisItem = aboutThisItemArray.join(' ');
    return {
        title,
        description: `
            Description: ${description}.
            Detail: ${productDetails}.
            About item: ${aboutThisItem}
        `,
        images
    };
}

function getAlibabaProductDetails() {
    let title = document.querySelector('div.product-title-container h1')?.innerText.trim() || "Title not found";
    let description = document.querySelector('.product-attributes')?.innerText.trim() || "Description not found";
    let images = [];
    // Collect all product images
    let imageElements = document.querySelectorAll('.main-image-container img');
    images = Array.from(imageElements).map(img => img.src);

    return {
        title,
        description,
        images
    };
}

function sendProductDetailsToApi({ title, description, images, productDetails, aboutThisItem }) {
    return fetch('https://api.sformer.tech/api/product-listing-builder?version=2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productTitle: title,
            productDescription: description
        })
    })
        .then(response => response.json())
        .then(data => data?.answer || 'No content returned from AI')
        .catch(error => `Error: ${error.message}`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getProductDetails') {
        switch (true) {
            case window.location.hostname.includes('etsy.com') && window.location.pathname.includes('/listing/'): {
                const details = getProductDetailsFromEtsy();
                sendProductDetailsToApi(details).then(apiContent => {
                    sendResponse(apiContent);
                });
                break;
            }
            case window.location.hostname.includes('amazon.com') && window.location.pathname.includes('/dp/'): {
                const details = getAmazonProductDetails();
                sendProductDetailsToApi(details).then(apiContent => {
                    sendResponse(apiContent);
                });
                break;
            }
            case window.location.hostname.includes('alibaba.com') && window.location.pathname.includes('/product-detail/'): {
                return sendResponse('Todo...');
                // const details = getAlibabaProductDetails();
                // sendResponse(details);
                // break;
            }
            default: {
                sendResponse("Please go to the detail product page of Etsy, amazon, Alibaba");
            }
        }
        return true;
    }
});
