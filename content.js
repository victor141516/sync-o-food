"use strict";

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function addButtonNextToBasket(buttonHtml) {
    let buttonNode = document.createElement('div');
    buttonNode.innerHTML = buttonHtml;
    buttonNode = buttonNode.children[0];
    const basketButtons = document.querySelector('.menu-index-page .menu-nav .basket-overview-panel');
    basketButtons.appendChild(buttonNode);
    basketButtons.style = 'flex-wrap: unset;'
}

function getBasketItems() {
    const basket = document.querySelector('.basket-contents--active .basket-contents__item-list').querySelectorAll('li');
    class Item {
        constructor() {
            this.quantity = null;
            this.name = null;
            this.extras = null;
            this.price = null
        }
    }

    const items = Array.from(basket).map(el => {
        const item = new Item();
        item.quantity = parseInt(el.querySelector('.quantity-control > .quantity').innerHTML);
        item.price = parseFloat(el.querySelector('.price').innerHTML.replace(',', '.'));
        item.name = el.querySelector('.item > .name > span').innerHTML.trim();
        item.extras = Array.from(el.querySelectorAll('.item > .modifiers > span')).map(extraEl => extraEl.innerHTML.replace(/(^[,\s]+)|([,\s]+$)/g, ''));
        return item;
    });
    return items;
}

function getElementByText(text, element) {
    if (!element) element = document;
    const path = ".//*[text()='" + text + "']";
    return document.evaluate(path, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function addToBasket(items, index) {
    function repeatUntil(quantity) {
        if (!quantity) return;
        setTimeout(() => {
            document.querySelector('.basket-contents--active .basket-contents__item-list > li:last-of-type .increase').click();
            repeatUntil(quantity - 1)
        }, 1500);
    }
    if (index === undefined) {
        index = 0;
    } else {
        index += 1;
    }
    if (index >= items.length) {
        return;
    }
    const item = items[index];
    const lastItem = index === 0 ? {
        quantity: 1
    } : items[index - 1]
    setTimeout(() => {
        const el = getElementByText(item.name, document.querySelector('.menu-index-page__menu-wrapper'));
        if (!el) return;
        el.click();
        item.extras.forEach(extra => {
            const extraEl = getElementByText(extra);
            if (!extraEl) return;
            extraEl.click();
        });
        document.querySelector('.menu-modifier__footer > div:nth-child(2) > button').click();
        repeatUntil(item.quantity - 1)
        addToBasket(items, index);
    }, lastItem.quantity * 1000);
}


const buttonHtmls = {
    ryan: '<a \
    id="ryan-button" \
    style="margin-left: 0.5rem; background-color: lightgrey;" \
    class="btn-component btn-component--primary btn-component--teal btn-component--block"><span class="checkout">\
    Receiving orders...</span>\</a>',
    notRyan: '<a \
    id="ryan-button" \
    style="margin-left: 0.5rem; background-color: orange;" \
    class="btn-component btn-component--primary btn-component--teal btn-component--block"><span class="checkout">\
    Send to Ryan</span>\</a>',
    else: '<a \
    id="ryan-button" \
    style="margin-left: 0.5rem; background-color: lightgrey; height: 48px; padding: 0px;" \
    class="btn-component btn-component--primary btn-component--teal btn-component--block"><span class="checkout">\
    Select your ryaness clicking on the extension icon</span>\</a>'
}

chrome.storage.sync.get("isRyan", res => {
    let buttonHtml = null;
    firebase.initializeApp({
        apiKey: "",
        authDomain: "",
        projectId: ""
    });
    const db = firebase.firestore();
    chrome.storage.sync.get('myId', id => {
        if (id === undefined) {
            chrome.storage.sync.set('myId', uuidv4());
        }
    })
    if (res.isRyan === true) {
        buttonHtml = buttonHtmls.ryan;
        addButtonNextToBasket(buttonHtml);
        chrome.storage.sync.get('org', orgData => {
            const dbName = orgData.org;
            db.collection(dbName).where("todo", "==", true).onSnapshot(querySnapshot => {
                querySnapshot.forEach(function (doc) {
                    const items = JSON.parse(doc.data().order);
                    addToBasket(items);
                    db.collection(dbName).doc(doc.id).update({
                        todo: false
                    });
                });
            });
        });
    } else if (res.isRyan === false) {
        buttonHtml = buttonHtmls.notRyan;
        addButtonNextToBasket(buttonHtml);
        document.getElementById('ryan-button').addEventListener('click', () => {
            const items = getBasketItems();
            chrome.storage.sync.get('myId', data => {
                chrome.storage.sync.get('org', orgData => {
                    const dbName = orgData.org;
                    db.collection(dbName).doc(data.myId).set({
                        order: JSON.stringify(items),
                        todo: true
                    });
                });
            });
        });
    } else {
        buttonHtml = buttonHtmls.else;
        addButtonNextToBasket(buttonHtml);
    }
});
