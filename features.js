// function extractFeatures(url) {
//     const a = document.createElement('a');
//     a.href = url;
//
//     const features = [];
//
//     // 1. having_ip_address
//     const ipPattern = /(\b\d{1,3}(\.\d{1,3}){3}\b)/;
//     features.push(ipPattern.test(a.hostname) ? -1 : 1);
//
//     // 2. url_length
//     if (url.length < 54) features.push(1);
//     else if (url.length <= 75) features.push(0);
//     else features.push(-1);
//
//     // 3. shortening_service
//     const shorteners = /(bit\.ly|goo\.gl|tinyurl\.com|ow\.ly|t\.co|bitly\.com|tinyurl)/i;
//     features.push(shorteners.test(url) ? -1 : 1);
//
//     // 4. having_at_symbol
//     features.push(url.includes('@') ? -1 : 1);
//
//     // 5. double_slash_redirecting
//     const lastDoubleSlash = url.lastIndexOf('//');
//     features.push(lastDoubleSlash > 7 ? -1 : 1);
//
//     // 6. prefix_suffix
//     features.push(a.hostname.includes('-') ? -1 : 1);
//
//     // 7. having_sub_domain
//     const dotsCount = a.hostname.split('.').length - 1;
//     if (dotsCount === 1) features.push(1);
//     else if (dotsCount === 2) features.push(-1);
//     else features.push(-1);
//
//     // 8. sslfinal_state
//     features.push(url.startsWith('https://') ? 1 : -1);
//
//     // 9. domain_registration_length
//     features.push(0);
//
//     // 10. favicon
//     features.push(checkFavicon());
//
//     // 11. port
//     features.push([80, 443, ''].includes(a.port) ? 1 : -1);
//
//     // 12. https_token
//     features.push(a.hostname.includes('https') ? -1 : 1);
//
//     // 13. request_url
//     features.push(0);
//
//     // 14. url_of_anchor
//     features.push(0);
//
//     // 15. links_in_tags
//     features.push(0);
//
//     // 16. sfh
//     features.push(0);
//
//     // 17. submitting_to_email
//     features.push(url.includes('mailto:') ? -1 : 1);
//
//     // 18. abnormal_url
//     features.push(url.includes(a.hostname) ? 1 : -1);
//
//     // 19. redirect
//     features.push(0);
//
//     // 20. on_mouseover
//     features.push(0);
//
//     // 21. rightclick
//     features.push(0);
//
//     // 22. popupwindow
//     features.push(0);
//
//     // 23. iframe
//     features.push(0);
//
//     // 24. age_of_domain
//     features.push(0);
//
//     // 25. dnsrecord
//     features.push(0);
//
//     // 26. web_traffic
//     features.push(0);
//
//     // 27. page_rank
//     features.push(0);
//
//     // 28. google_index
//     features.push(0);
//
//     // 29. links_pointing_to_page
//     features.push(0);
//
//     // 30. statistical_report
//     features.push(0);
//
//
//     return features;
// }
//
// function checkFavicon() {
//     const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
//     console.log(icon);
//     if (!icon) return -1; // treat missing favicon as suspicious
//
//     const iconUrl = new URL(icon.href, location.href);
//     return iconUrl.hostname === location.hostname ? 1 : -1;
// }
