console.log('content script running')

function checkFavicon() {
    const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!icon) return -1;
    const iconUrl = new URL(icon.href, location.href);
    return iconUrl.hostname === location.hostname ? 1 : -1;
}

function extractFeatures(url) {
    const a = document.createElement('a');
    a.href = url;

    const features = [];

    const ipPattern = /(\b\d{1,3}(\.\d{1,3}){3}\b)/;
    features.push(ipPattern.test(a.hostname) ? -1 : 1);

    if (url.length < 54) features.push(1);
    else if (url.length <= 75) features.push(0);
    else features.push(-1);

    const shorteners = /(bit\.ly|goo\.gl|tinyurl\.com|ow\.ly|t\.co|bitly\.com|tinyurl)/i;
    features.push(shorteners.test(url) ? -1 : 1);

    features.push(url.includes('@') ? -1 : 1);

    const lastDoubleSlash = url.lastIndexOf('//');
    features.push(lastDoubleSlash > 7 ? -1 : 1);

    features.push(a.hostname.includes('-') ? -1 : 1);

    const dotsCount = a.hostname.split('.').length - 1;
    if (dotsCount === 1) features.push(1);
    else if (dotsCount === 2) features.push(-1);
    else features.push(-1);

    features.push(url.startsWith('https://') ? 1 : -1);

    features.push(0); // domain_registration_length placeholder

    features.push(checkFavicon());

    features.push([80, 443, ''].includes(a.port) ? 1 : -1);

    features.push(a.hostname.includes('https') ? -1 : 1);

    features.push(0); // request_url placeholder
    features.push(0); // url_of_anchor placeholder
    features.push(0); // links_in_tags placeholder
    features.push(0); // sfh placeholder
    features.push(url.includes('mailto:') ? -1 : 1);
    features.push(url.includes(a.hostname) ? 1 : -1);
    features.push(0); // redirect placeholder
    features.push(0); // on_mouseover placeholder
    features.push(0); // rightclick placeholder
    features.push(0); // popupwindow placeholder
    features.push(0); // iframe placeholder
    features.push(0); // age_of_domain placeholder
    features.push(0); // dnsrecord placeholder
    features.push(0); // web_traffic placeholder
    features.push(0); // page_rank placeholder
    features.push(0); // google_index placeholder
    features.push(0); // links_pointing_to_page placeholder
    features.push(0); // statistical_report placeholder

    return features;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "extractFeatures") {
        const features = extractFeatures(window.location.href);
        sendResponse({ features });
    }
});
