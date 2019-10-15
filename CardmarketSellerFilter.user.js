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
MY_CITIES.add("Dublin");
MY_CITIES.add("Leeds");
MY_CITIES.add("Llobregat"); // BCN
MY_CITIES.add("Malgrat de Mar"); // BCN
MY_CITIES.add("Munich");
MY_CITIES.add("München");
MY_CITIES.add("Muenchen");
MY_CITIES.add("Pireaus");

function sellerNameOrCityIncludesMyCity(sellerNameOrCity) {
    var sellerNameOrCityCopy = sellerNameOrCity.toLowerCase();
    for (let myCity of MY_CITIES) {
        myCity = myCity.toLowerCase();
        if (sellerNameOrCityCopy.includes(myCity)) {
            return true;
        }
    }
    return false;
}

function loadAllSellers() {
    //alert("Number of elements is: " + $(".article-row").length);
    let interval = window.setInterval(() => {
        var loadMoreButton = document.getElementById("loadMoreButton");
        if (!!loadMoreButton && loadMoreButton.style.display !== 'none') {
            loadMoreButton.click();
        } else {
            if (!!interval) {
                window.clearInterval(interval);
            }
        }
    },3000);
}

function sellerFilter() {
    var elements = $(".article-row"); //document.getElementsByClassName("article-row");
    for(let element of elements)
    {
        var sellerInfoPageURL = element.querySelector('a').href;
        var sellerName = element.querySelector('a').text;
        if (element.style.display === 'none') {
            console.log('Seller ' + sellerName + ' already removed...');
            continue;
        } else if (sellerNameOrCityIncludesMyCity(sellerName)) {
            console.log('Keeping seller ' + sellerName + 'because her name includes one of my cities!');
            continue;
        }
        console.log(sellerName + '\'s info page URL: ' + sellerInfoPageURL);
        var sellerInfoPageHTML = getRemote(sellerInfoPageURL);
        console.log(sellerName + '\'s info page HTML: ' + sellerInfoPageHTML);
        $(sellerInfoPageHTML).find('.MKMTable.sellerInfo-table').find('> tbody > tr').each(function() {
            var col1 = jQuery(this).find("td:eq(0)").text();
            if (col1 === 'City') {
                var sellerCity = jQuery(this).find("td:eq(1)").text();
                console.log(sellerName + '\'s city: ' + sellerCity);
                var sellerIsInMyCities = false;
                sellerCity = sellerCity.toLowerCase();
                if (sellerNameOrCityIncludesMyCity(sellerCity)) {
                    console.log('Keeping seller ' + sellerName + 'from ' + sellerCity + '!');
                } else {
                    console.log('Removing seller ' + sellerName + ' from ' + sellerCity + '...');
                    element.style.display = 'none';
                }
            }
        });
    }
}

$( document ).ready(function() {
    // TODO: Make buttons clickable only if user is logged in because filtering works well only in that case.
    $(`
<div id="loadAllSellersDiv" class="p-0">
    <button type="submit" id="loadAllSellersButton" class="btn btn-primary btn-sm btn-block">
        <span class="fonticon-plus mr-2"></span>
        <span>Load all sellers</span>
    </button>
    <br />
    <button type="submit" id="sellerFilterButton" class="btn btn-primary btn-sm btn-block">
        <span class="fonticon-filter cursor-pointer"></span>
        <span>Filter sellers</span>
    </button>
    <br />
</div>
`).prependTo( $( ".table.article-table.table-striped" ) );
    $("#loadAllSellersButton").click(loadAllSellers);
    $("#sellerFilterButton").click(sellerFilter);
});

(function() {
    'use strict';

    // Your code here...
})();
