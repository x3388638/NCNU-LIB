function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}
function ArrayToCSV(arr) {
    var s = '';
    var csvContent = "data:text/plain;charset=utf-8,";
    arr.forEach(function(rowArr, index){
        rowArr = rowArr.map(function(slice) {
            if(slice) {
                slice = slice.replace(/"/g, '""');
            }
            return '"' + slice + '"';
        });
        rowArr.join(',');
        // console.log(rowArr);
        csvContent += index < arr.length ? rowArr+ "\n" : rowArr;
    }); 
    csvData = new Blob([csvContent.replace('data:text/plain;charset=utf-8,', '')], { type: 'text/csv' }); 
    var csvUrl = URL.createObjectURL(csvData);
    // var encodedUri = encodeURI(csvContent);
    location.href = csvUrl;
}
function processData(arr) {
    var heads = arr[0];
    var targetIdx = 0;
    for(var i in heads) {
        if(heads[i] == '帶機構的作者') {
            targetIdx = i;
            break;
        }
    }
    for(var i = 1; i < arr.length; i++) { // iterate row
        if(!arr[i][targetIdx]) {
            continue;
        }
        var authorArr = arr[i][targetIdx].split('; ');
        var newAuthor = [];
        authorArr.forEach(function(author, idx) {
            var found = 0;
            var slice = author.split(', ');
            for(var j in slice) {
                if(slice[j].toLowerCase().indexOf('national chi nan university') > -1 ||
                    slice[j].toLowerCase().indexOf('national chi-nan university') > -1) {
                    found = 1; 
                    break;
                }
            }
            if(found) {
                newAuthor.push(author);
            }
        });
        var s = '';
        newAuthor.forEach(function(author, idx) {
            s += author;
            if(idx != newAuthor.length-1) {
                s += '; '
            }
        });
        arr[i][targetIdx] = s;
    }
    return arr;
}
$(document).ready(function() {
    $('#csv').on('change', function() {
        var uri = $(this).val().split('/');
        if(uri.length == 1) {
            uri = $(this).val().split('\\');
        }
        var file = uri[uri.length-1];
        // console.log(file);
        if(/.csv$/.test(file)) {
            var fr = new FileReader();
            fr.readAsText($('#csv')[0].files[0], 'BIG5');
            fr.onload = function() {
                var data = fr.result;
                var arr = CSVToArray(data);
                // console.log(arr);
                var newArr = processData(arr);
                // console.log(newArr);
                ArrayToCSV(newArr);
            }
        } else {
            alert('Please upload .csv');
            return;
        }
    });
});