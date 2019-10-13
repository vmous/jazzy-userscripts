// ==UserScript==
// @name         CardmarketSellerFilter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Vassilis S. Moustakas (vsmoustakas@gmail.com)
// @match        https://www.cardmarket.com/en/Magic/Products/Singles/*/*
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

var MY_CITIES = new Set();
MY_CITIES.add("Athens");
MY_CITIES.add("Barcelona");
MY_CITIES.add("BCN");
MY_CITIES.add("Berlin");
MY_CITIES.add("Munich");
MY_CITIES.add("München");
MY_CITIES.add("Muenchen");
MY_CITIES.add("Pireaus");

function sellerFilterFunction() {
    var elements = $(".article-row"); //document.getElementsByClassName("article-row");
    for(let element of elements)
    {
        if (element.style.display === 'none') {
            continue;
        }
        var sellerInfoPageURL = element.querySelector('a').href;
        console.log('seller info page URL: ' + sellerInfoPageURL);
        var sellerInfoPageHTML = getRemote(sellerInfoPageURL);
        console.log('seller info page HTML: ' + sellerInfoPageHTML);
        $(sellerInfoPageHTML).find('.MKMTable.sellerInfo-table').find('> tbody > tr').each(function() {
            var col1 = jQuery(this).find("td:eq(0)").text();
            if (col1 === "City") {
                var sellerCity = jQuery(this).find("td:eq(1)").text();
                console.log("seller city: " + sellerCity);
                var sellerIsInMyCities = false;
                sellerCity = sellerCity.toLowerCase();
                for (let myCity of MY_CITIES) {
                    myCity = myCity.toLowerCase();
                    if (sellerCity.includes(myCity)) {
                        console.log("sellerCity: " + sellerCity + " includes myCity: " + myCity + "! Keeping :)");
                        sellerIsInMyCities = true;
                        break;
                    }
                }
                if (!sellerIsInMyCities) {
                    element.style.display = 'none';
                }
            }
        });
    }
}

$( document ).ready(function() {
    $(`
<div id="sellerFilter" class="p-0">
    <button type="submit" id="sellerFilterButton" class="btn btn-primary btn-sm btn-block">
        <span class="fonticon-filter cursor-pointer"></span>
        <span>Filter sellers</span>
    </button>
    <br />
</div>
`).prependTo( $( ".table.article-table.table-striped" ) );
    $("#sellerFilterButton").click(sellerFilterFunction);
});

(function() {
    'use strict';

    // Your code here...
})();