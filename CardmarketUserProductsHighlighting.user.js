// ==UserScript==
// @name         CardmarketUserProductsHighlighting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlights products in user product browser according to price (and other parameters).
// @author       vsmoustakas@gmail.com
// @match        https://www.cardmarket.com/en/Magic/MainPage/browseUserProducts?idCategory=1&idUser=*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_addStyle
// ==/UserScript==

function getRemote(remote_url) {
    return $.ajax({
        type: "GET",
        url: remote_url,
        async: false
    }).responseText;
}

function cleanPPUStr(ppuStr) {
    return ppuStr.replace("(PPU: ", "").replace(" €)", "").replace(',', '.');
}

function cleanPriceStr(priceStr) {
    return priceStr.replace(" €", "").replace(',', '.');
}

$( document ).ready(function() {
    alert("Ready?");
//    var name = $(document).find('.MKMTable.MKMSortable.fullWidth').find('> tbody > tr').each.find("td:eq(2)");
//    console.log(name.text());
//   var links = name.find("div > div > a");
//    console.log(links.href);

    $(document).find('.MKMTable.MKMSortable.fullWidth').find('> tbody > tr').each(function() {
        var productName = jQuery(this).find("td:eq(2)").text();
        console.log(productName);
        var productPageURL = jQuery(this).find("td:eq(2) > div > div > a")[0].href;
        console.log(productPageURL);
        // Try getting getting the PPU price first
        var sellerProductPriceStr = cleanPPUStr(jQuery(this).find("td:eq(9) > div > .microFont.c-k6.f-w400.f-sIta.nowrap").text());
        // If empty get the normal price
        if (sellerProductPriceStr === "") {
            sellerProductPriceStr = cleanPriceStr(jQuery(this).find("td:eq(9) > div > .algn-r.nowrap").text());
        }
        var sellerProductPriceFloat = parseFloat(sellerProductPriceStr);
        console.log(sellerProductPriceFloat);

        var productPageHTML = getRemote(productPageURL);
        console.log(productName + '\'s info page HTML: ' + productPageHTML);
        var productInfo = $(productPageHTML).find('.info-list-container.col-12.col-md-8.col-lg-12.mx-auto.align-self-start');
        var productInfoData = productInfo.find(".labeled.row.no-gutters.mx-auto");
        var productPriceFromFloat = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('From')").next().text()));
        var productPriceTrendFloat = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('Price Trend')").next().text()));
        var productPriceAvg30Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('30-days average price')").next().text()));
        var productPriceAvg7Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('7-days average price')").next().text()));
        var productPriceAvg1Float = parseFloat(cleanPriceStr(productInfoData.find("dt:contains('1-day average price')").next().text()));
        console.log('From:' + productPriceFromFloat + '|Trend:' + productPriceTrendFloat + '|Avg30:' + productPriceAvg30Float + '|Avg7:' + productPriceAvg7Float + '|Avg1:' + productPriceAvg1Float);

        var totalItemsCount = 0;
        var totalItemsSumPriceFloat = 0.0;
        var itemsAvgPriceFloat = 0.0;
        var itemsMinPriceFloat = Number.MAX_VALUE;
        $(productPageHTML).find('.table-body > .row.no-gutters.article-row').each(function () {
            var offer = $(this).find(".col-offer");
            var offerPrice = $(offer).find(".price-container.d-none.d-md-flex.justify-content-end");
            //console.log(offerPrice);
            // Try getting getting the PPU price first
            var offerItemPriceStr = cleanPPUStr($(offerPrice).find(".extra-small.font-italic.text-muted.text-nowrap.d-none.d-md-inline").text());
            //console.log(offerItemPriceStr);
            // If empty get the normal price
            if (offerItemPriceStr === "" ) {
                offerItemPriceStr = cleanPriceStr($(offerPrice).find(".font-weight-bold.color-primary.small.text-right.text-nowrap").text());
            }
            //console.log(offerItemPriceStr);
            var offerItemPriceFloat = parseFloat(offerItemPriceStr);
            itemsMinPriceFloat = Math.min(itemsMinPriceFloat, offerItemPriceFloat)
            var offerItemsCount = parseInt($(offer).find('.amount-container.d-none.d-md-flex.justify-content-end.mr-3').text());
            var offerItemsSumPriceFloat = offerItemsCount * offerItemPriceFloat;
            console.log('Offer: ' + offerItemsCount + ' x ' + offerItemPriceFloat + ' = ' + offerItemsSumPriceFloat);
            totalItemsCount += offerItemsCount;
            totalItemsSumPriceFloat += offerItemsSumPriceFloat;
        });
        itemsAvgPriceFloat = totalItemsSumPriceFloat/totalItemsCount;
        console.log('count: ' + totalItemsCount + '| sum: ' + totalItemsSumPriceFloat + ' | avg: ' + itemsAvgPriceFloat + ' | min price: ' + itemsMinPriceFloat);

        if (sellerProductPriceFloat <= itemsMinPriceFloat) {
            jQuery(this).css("background-color", "limegreen");
        } else if (sellerProductPriceFloat <= itemsAvgPriceFloat) {
            jQuery(this).css("background-color", "lime");
        } else if (sellerProductPriceFloat <= productPriceAvg30Float) {
            jQuery(this).css("background-color", "greenyellow");
        } else if (sellerProductPriceFloat > productPriceFromFloat && sellerProductPriceFloat > productPriceTrendFloat && sellerProductPriceFloat > productPriceAvg30Float && sellerProductPriceFloat > productPriceAvg7Float && sellerProductPriceFloat > productPriceAvg1Float){
            jQuery(this).css("background-color", "red");
        } else {
            jQuery(this).css("background-color", "yellow");
        }
    });

//    $(document).find('.MKMTable.MKMSortable.fullWidth').find('> tbody > tr').each(function() {
//        var name = jQuery(this).find("td:eq(2)")
//        var link = name.add(".vAlignMiddle.dualTextDiv div a");
//        console.log(name.text());
//        console.log(link)
//        });
});

(function() {
    'use strict';

    // Your code here...
})();