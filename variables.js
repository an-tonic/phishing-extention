export const featureExplanations = [
    "The URL contains an IP address instead of a domain name.",                       // having_ip_address
    "The URL is unusually long.",                                                    // url_length
    "The URL uses a shortening service.",                                            // shortining_service
    "The URL contains an '@' symbol, which may redirect to a different site.",       // having_at_symbol
    "The URL uses '//' in an unusual position, which may indicate redirection.",     // double_slash_redirecting
    "The domain name contains a dash, which is uncommon for legitimate sites.",      // prefix_suffix
    "The domain has too many subdomains, which is suspicious.",                      // having_sub_domain
    "The site has no valid or trusted SSL certificate.",                             // sslfinal_state
    "The domain registration length is short, indicating potential phishing.",       // domain_registration_length
    "The favicon is loaded from an external domain.",                                // favicon
    "The site is using a non-standard port.",                                        // port
    "The domain part of the URL includes a misleading HTTPS token.",                 // https_token
    "A high percentage of external resources in the page indicates phishing.",       // request_url
    "Too many anchor URLs lead to different domains.",                               // url_of_anchor
    "Too many links are found in meta/script/link tags, often used for tracking.",   // links_in_tags
    "The form handler is blank or refers to an unrelated domain.",                   // sfh
    "The site submits information to an email address.",                             // submitting_to_email
    "The host name is not included in the URL.",                                     // abnormal_url
    "The page redirects more than once.",                                            // redirect
    "The onMouseOver event hides the real link destination.",                        // on_mouseover
    "Right-click functionality is disabled.",                                        // rightclick
    "A popup window with text fields is used.",                                      // popupwindow
    "An iframe is used to load external content.",                                   // iframe
    "The domain is very new.",                                                       // age_of_domain
    "No DNS record is found for the domain.",                                        // dnsrecord
    "The site has very low web traffic.",                                            // web_traffic
    "The page has a very low PageRank.",                                             // page_rank
    "The site is not indexed by Google.",                                            // google_index
    "Few or no links point to the page.",                                            // links_pointing_to_page
    "The host is listed in phishing reports."                                        // statistical_report
];
