let fs = require('fs');
let path = require('path');
let cheerio = require('cheerio');
let request = require('request');
let scoreCardWork = require('./ScoreCardWork');
let url = 'https://www.espncricinfo.com/series/ipl-2019-1165643';

request(url,cb1);
function cb1(err,response,html){
    if(err) console.log(err);
    else{
        let cheerioSelector = cheerio.load(html);
        // console.log(html);
        let resultsUrl ="https://www.espncricinfo.com"+ cheerioSelector('.widget-items.cta-link a').attr('href');
        request(resultsUrl,cb2);
    }
}

function cb2(err,response,html){
    if(err) console.log(err);
    else{
        let cheerioSelector = cheerio.load(html);
        let allMatches = cheerioSelector('.col-md-8.col-16');
        for(let i = 0;i<allMatches.length;i++){
            let buttons = cheerioSelector(allMatches[i]).find('.btn.btn-sm.btn-outline-dark.match-cta');
            let scorecard ="https://www.espncricinfo.com" + cheerioSelector(buttons[2]).attr('href');
            console.log(scorecard); // done till step 2 in poc
            scoreCardWork.fn(scorecard);
        }
    }
}
