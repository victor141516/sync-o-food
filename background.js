chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        myId: 'victor'
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'deliveroo.es'
                },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
