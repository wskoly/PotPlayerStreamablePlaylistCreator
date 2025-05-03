chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeMedia") {
        chrome.scripting.executeScript({
            target: { tabId: request.tabId },
            func: scrapeMediaFiles
        }, (results) => {
            if (results && results[0] && results[0].result) {
                sendResponse({ mediaFiles: results[0].result });
            } else {
                sendResponse({ mediaFiles: [] });
            }
        });
        return true; // Keep the message channel open for sendResponse
    }
});

function scrapeMediaFiles() {
    const mediaFiles = [];
    const fullUrl = window.location.href;

    document.querySelectorAll('a[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        const fileName = href.split('/').pop();
        if (!fileName) return;
        if (!fileName.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm|mpeg|mpg|m4v|3gp|3g2|ts|mts|m2ts|vob|ogv|divx|xvid|rm|rmvb|asf|mp3|wav|ogg|m4a|aac|flac|alac|wma|aiff|ape|opus)$/i)) return;
        if (href.startsWith('http') || href.startsWith('https')) {
            mediaFiles.push(href);
            return;
        }
        mediaFiles.push(fullUrl + fileName);
    });

    return mediaFiles;
}
