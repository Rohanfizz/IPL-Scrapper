let fs = require('fs');
let path = require('path');
let cheerio = require('cheerio');
let request = require('request');
let xlsx = require('xlsx');


// fn('https://www.espncricinfo.com/series/ipl-2019-1165643/chennai-super-kings-vs-mumbai-indians-final-1181768/full-scorecard');
// fn(`https://www.espncricinfo.com/series/ipl-2019-1165643/royal-challengers-bangalore-vs-kolkata-knight-riders-17th-match-1175372/full-scorecard`);

function fn(url){
    request(url,cb);
    let teamWork = 0;
    function cb(err,response,html){
        if(err) console.log(err);
        else{
            if(fs.existsSync(path.join(__dirname,'Results')) == false){
                fs.mkdirSync(path.join(__dirname,'Results'));
            }
            let cheerioSelector = cheerio.load(html);
            let teams = cheerioSelector('.match-header .teams').find('.team');
            let team1 = cheerioSelector(teams[0]).find('.name').text();
            let team2 = cheerioSelector(teams[1]).find('.name').text();
            let winner = cheerioSelector('.match-header .teams>div [class="team"] .name').text();
            let date = cheerioSelector('.w-100.table.match-details-table').find('tr');
            let dateIdx = 0;
            // console.log(date.length);
            for(let i = 0;i<date.length;i++) {
                if(cheerioSelector(cheerioSelector(date[i]).find('.font-weight-bold.border-right')[0]).text() == 'Match days'){
                    // console.log(cheerioSelector(date[i]).text());
                    dateIdx = i; break;
                }
            }
            
            date = cheerioSelector(date[dateIdx]).find('td');
            console.log(date.length);
            console.log(cheerioSelector(date[0]).text());
            date = cheerioSelector(date[1]).text().split(" ");
            date = date[0] +" "+date[1] + " "+date[2];
            console.log(date);
            
            let team1Folder = path.join(__dirname, 'Results',team1);
            let team2Folder = path.join(__dirname, 'Results',team2);

            if(fs.existsSync(team1Folder) == false){
                fs.mkdirSync(team1Folder);
            }
            if(fs.existsSync(team2Folder) == false){
                fs.mkdirSync(team2Folder);
            }

            let tables = cheerioSelector('.table.batsman tbody');

            // work for team 1
            let rows = cheerioSelector(tables[0]).find('tr');
            for(let i = 0;i<rows.length;i++){
                let cols = cheerioSelector(rows[i]).find('td');
                if(cols.length != 8) continue;
                let name = cheerioSelector(cols[0]).text().trim();
                let runs = cheerioSelector(cols[2]).text();
                let balls = cheerioSelector(cols[3]).text();
                let fours = cheerioSelector(cols[5]).text();
                let sixes = cheerioSelector(cols[6]).text();
                let sr = cheerioSelector(cols[7]).text();
                let obj = {
                    Date : date,
                    Opponent: team2,
                    Runs: runs,
                    Balls: balls,
                    Fours: fours,
                    Sixes: sixes,
                    SR: sr,
                    Result: (team1 == winner?"Win":"Lose")
                };
                
                let excelFile = path.join(team1Folder,(name+'.xlsx'));
                // console.log(jsonFile);
                if(fs.existsSync(excelFile) == false){
                    let jarr = []; jarr.push(obj);
                    // let content = excelReader(excelFile,'Sheet1');
                    // fs.writeFileSync(excelFile)){},content);
                    excelWriter(excelFile, jarr,'Sheet1');
                }else{
                    let content =  excelReader(excelFile,'Sheet1');
                    // let arr = JSON.parse(content);
                    content.push(obj);
                    // let contentToBePushed = JSON.stringify(arr);
                    // fs.writeFileSync(jsonFile,contentToBePushed);
                    excelWriter(excelFile, content,'Sheet1')
                }
            }
            rows = cheerioSelector(tables[1]).find('tr');
            for(let i = 0;i<rows.length;i++){
                let cols = cheerioSelector(rows[i]).find('td');
                if(cols.length != 8) continue;
                let name = cheerioSelector(cols[0]).text().trim();
                let runs = cheerioSelector(cols[2]).text();
                let balls = cheerioSelector(cols[3]).text();
                let fours = cheerioSelector(cols[5]).text();
                let sixes = cheerioSelector(cols[6]).text();
                let sr = cheerioSelector(cols[7]).text();
                let obj = {
                    Date : date,
                    Opponent: team1,
                    Runs: runs,
                    Balls: balls,
                    Fours: fours,
                    Sixes: sixes,
                    SR: sr,
                    Result: (team2 == winner?"Win":"Lose")
                };
                
                let excelFile = path.join(team2Folder,(name+'.xlsx'));
                // console.log(jsonFile);
                if(fs.existsSync(excelFile) == false){
                    let jarr = []; jarr.push(obj);
                    // let content = excelReader(excelFile,'Sheet1');
                    // fs.writeFileSync(excelFile)){},content);
                    excelWriter(excelFile, jarr,'Sheet1');
                }else{
                    let content =  excelReader(excelFile,'Sheet1');
                    // let arr = JSON.parse(content);
                    content.push(obj);
                    // let contentToBePushed = JSON.stringify(arr);
                    // fs.writeFileSync(jsonFile,contentToBePushed);
                    excelWriter(excelFile, content,'Sheet1')
                }
                // teamWork++;
                console.log(team1, team2,winner,'Done Processing');
            }
        }

    }
}

function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    } else {
        // workbook => excel
        let wt = xlsx.readFile(filePath);
        // csk -> msd
        // get data from workbook
        let excelData = wt.Sheets[name];
        // convert excel format to json => array of obj
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx-> msd
    xlsx.utils.book_append_sheet(newWB, newWS, name);  //workbook name as param
    //   file => create , replace
    xlsx.writeFile(newWB, filePath);
}
module.exports = {
    fn:fn
}