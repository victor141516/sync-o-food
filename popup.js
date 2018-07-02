'use strict';

function showAndHideSavedAndReload() {
    const div = document.querySelector('.saved-text');
    div.classList.remove('hidden');
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function changeView(id) {
    const allDivs = document.querySelector('body').querySelectorAll('div');
    Array.from(allDivs).forEach(div => {
        if (div.id) {
            if (div.id === id) {
                div.classList.remove('hidden');
            } else {
                div.classList.add('hidden');
            }
        }
    })
}

function setIsRyan() {
    chrome.storage.sync.set({
        isRyan: true
    }, showAndHideSavedAndReload)
};

function setNotIsRyan() {
    chrome.storage.sync.set({
        isRyan: false
    }, showAndHideSavedAndReload)
};

function setOrg() {
    const org = document.getElementById('set-org-input').value;
    if (org.length && org.length > 0) {
        chrome.storage.sync.set({'org': org}, () => location.reload);
    }
};

chrome.storage.sync.get('org', orgData => {
    if (orgData.org === undefined) {
        changeView('if-not-org');
        document.getElementById('set-org-btn').addEventListener('click', setOrg);
    } else {
        chrome.storage.sync.get("isRyan", res => {
            if (res.isRyan === true) {
                changeView('if-ryan');
                document.getElementById('set-not-ryan').addEventListener('click', setNotIsRyan);
            } else if (res.isRyan === false ) {
                changeView('if-not-ryan');
                document.getElementById('set-ryan').addEventListener('click', setIsRyan);
            } else {
                changeView('else');
                document.getElementById('i-ryan').addEventListener('click', setIsRyan);
                document.getElementById('not-ryan').addEventListener('click', setNotIsRyan);
            }
        });
    }
});
