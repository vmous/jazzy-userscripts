// ==UserScript==
// @name         CardmarketUserProductsHighlighting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlights products in user product browser according to price (and other parameters).
// @author       vsmoustakas@gmail.com
// @match        https://www.cardmarket.com/en/Magic/Users/*/Offers/*?*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_addStyle
// ==/UserScript==

function ajaxAsyncCall(remote_url) {
    return $.ajax({
        type: "GET",
        url: remote_url,
        async: true
    });
}

function manipulateProductOfferElement(productOfferElement, productPageHTML, textStatus, jqXHR) {
//    console.log(productOfferElement)

    // Product information
    var product = productOfferElement.find('> div.col-sellerProductInfo.col > div.row.no-gutters > div.col-seller.col-12.col-lg-auto');
    var productName = product.text();
    var productPageURL = product.find('> a')[0].href;
    console.log(productName + ' @ ' + productPageURL + ': ' + textStatus);
    //console.log( jqXHR ); // Alerts 200

    // Offer price (or playset PPU)
    var offer = productOfferElement.find('> div.col-offer > div.price-container.d-none.d-md-flex.justify-content-end > div.d-flex.flex-column');
    var offerPrice = offer.find('> div.d-flex.align-items-center.justify-content-end');
    var offerPricePlaysetPPU = offer.find('> span.extra-small.font-italic.text-muted.text-nowrap.d-none.d-md-inline');

    var offerPriceStr = cleanPriceStr(offerPrice.text());
    if (offerPricePlaysetPPU.length !== 0) {
        offerPriceStr = cleanPPUStr(offerPricePlaysetPPU.text());
    }
    var offerPriceFloat = parseFloat(offerPriceStr);

    var productInfo = $(productPageHTML).find('.info-list-container.col-12.col-md-8.col-lg-12.mx-auto.align-self-start');
    var productInfoData = productInfo.find(".labeled.row.no-gutters.mx-auto");
    var productPriceFromFloat = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('From')").next().text()));
    var productPriceTrendFloat = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('Price Trend')").next().text()));
    var productPriceAvg30Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('30-days average price')").next().text()));
    var productPriceAvg7Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('7-days average price')").next().text()));
    var productPriceAvg1Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('1-day average price')").next().text()));
//    console.log('From:' + productPriceFromFloat + '|Trend:' + productPriceTrendFloat + '|Avg30:' + productPriceAvg30Float + '|Avg7:' + productPriceAvg7Float + '|Avg1:' + productPriceAvg1Float);

    var productPageOffersCount = 0;
    var productPageOffersPriceSumFloat = 0.0;
    var productPageOffersPriceAvgFloat = 0.0;
    var productPageOffersPriceMinFloat = Number.MAX_VALUE;
    $(productPageHTML).find('.table-body > .row.no-gutters.article-row').each(function () {
        // Offer price (or playset PPU)
        var productPageOffer = jQuery(this).find('> div.col-offer');
        var productPageOfferPrices = productPageOffer.find('> div.price-container.d-none.d-md-flex.justify-content-end > div.d-flex.flex-column');
        var productPageOfferPrice = productPageOfferPrices.find('> div.d-flex.align-items-center.justify-content-end');
        var productPageOfferPricePlaysetPPU = productPageOfferPrices.find('> span.extra-small.font-italic.text-muted.text-nowrap.d-none.d-md-inline');
        var productPageOfferItemsCount = parseInt(productPageOffer.find('> div.amount-container.d-none.d-md-flex.justify-content-end.mr-3').text());

        var productPageOfferPriceStr = cleanPriceStr(productPageOfferPrice.text());
        if (productPageOfferPricePlaysetPPU.length !== 0) {
            productPageOfferPriceStr = cleanPPUStr(productPageOfferPricePlaysetPPU.text());
            productPageOfferItemsCount = 4 * productPageOfferItemsCount;
        }
        var productPageOfferPriceFloat = parseFloat(productPageOfferPriceStr);

        productPageOffersPriceMinFloat = Math.min(productPageOffersPriceMinFloat, productPageOfferPriceFloat);
        var productPageOfferItemsPriceSumFloat = productPageOfferItemsCount * productPageOfferPriceFloat;

        productPageOffersCount += productPageOfferItemsCount;
        productPageOffersPriceSumFloat += productPageOfferItemsPriceSumFloat;
    });
    productPageOffersPriceAvgFloat = productPageOffersPriceSumFloat/productPageOffersCount;
//    console.log('count: ' + productPageOffersCount + '| sum: ' + productPageOffersPriceSumFloat + ' | avg: ' + productPageOffersPriceAvgFloat + ' | min price: ' + productPageOffersPriceMinFloat);

    productOfferElement.css('border-style', 'solid');
    productOfferElement.css('border-width', 'thick');
    if (offerPriceFloat <= productPageOffersPriceMinFloat) {
        productOfferElement.css("border-color", "limegreen");
    } else if (offerPriceFloat <= productPageOffersPriceAvgFloat) {
        productOfferElement.css("border-color", "lime");
    } else if (offerPriceFloat <= productPriceAvg30Float) {
        productOfferElement.css("border-color", "greenyellow");
    } else if (offerPriceFloat > productPriceFromFloat && offerPriceFloat > productPriceTrendFloat && offerPriceFloat > productPriceAvg30Float && offerPriceFloat > productPriceAvg7Float && offerPriceFloat > productPriceAvg1Float){
        productOfferElement.css("border-color", "red");
    } else {
        productOfferElement.css("border-color", "yellow");
    }
}

function cleanPPUStr(ppuStr) {
    return ppuStr.replace("(PPU: ", "").replace(" €)", "").replace(',', '.');
}

function cleanPriceStr(priceStr) {
    return priceStr.replace(" €", "").replace(',', '.');
}

$( document ).ready(function() {
    if (confirm("Skip product highligthing?") == true) {
        return
    }

    $(document).find('div.table.article-table.table-striped').find('> div.table-body > div').each(function() {
        productOfferElement = jQuery(this)
        var productPageURL = productOfferElement.find('> div.col-sellerProductInfo.col > div.row.no-gutters > div.col-seller.col-12.col-lg-auto').find('> a')[0].href;

        $.when(ajaxAsyncCall(productPageURL)).then(manipulateProductOfferElement.bind(null, productOfferElement));
    });
});

(function() {
    'use strict';

    // Your code here...
})();