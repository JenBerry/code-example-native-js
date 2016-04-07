// usage
// node page-builder.js {template_file} {content_file} {file_name} {country_code}
// # Some notes:
// # - Make sure the content file is saved out from Excel as UTF-16 Unicode Text, tab delimited
// # - The second column must contain the country codes to be used as file extentions.
// # - Put indexes in <span id="translation-n"> in the template file to correspond to columns in the content-file
// # - If a country code is supplied as the 4th argument, it will only translate that language, otherwise it will translate them all
// # - The script can use any pre-translated file as a template, as long as the <span id="translation-n"> tags are still intact

var fs = require('fs');
var csv = require('fast-csv');

var arg = process.argv.slice(2);

var template_file = arg[0]; //eg '_eva-pdp-template.html'
var content_file = arg[1]; //eg 'EVA_CONTENT.txt'
var file_name = arg[2]; // eg 'eva-pdp'
var country_code = arg[3]; // eg 'fr'

//load the template file
fs.readFile(template_file, 'utf8', function(err, template) {
    if (err) throw err;
    var index = 0;
    // read the content file, row by row
    fs.createReadStream(__dirname+'/'+content_file, {encoding: 'utf16le'})
        .pipe(csv({delimiter:'\t'}))
        .on('data', function(data){
            // for  each row, check if it's a valid translation by looking for a country code
            var this_country_code = data[1];
            var this_country_code_valid = this_country_code.match(/\w\w/);
            // if a country code was supplied to the function, only translate that one
            var only_use_supplied_country_code = typeof country_code !== 'undefined' && country_code.match(/\w\w/);
            var country_codes_match = this_country_code === country_code;

            if (this_country_code_valid){
                if (!only_use_supplied_country_code || country_codes_match)
                {
                    console.log('translating', this_country_code);
                    var this_template = template;
                    //search for the "{n}" tags in the template and replace with relevent translation
                    data.forEach(function(value, index){
                        var regex = new RegExp('<span id="translation-' + index + '">.*</span>', 'g');
                        this_template = this_template.replace(regex, '<span id="translation-'+ index +'">'+value+'</span>');
                    });
                    //write the file
                    this_file_name = file_name + '-' + this_country_code + '.html';
                    fs.writeFile(this_file_name, this_template, function(err) {
                        if (err) throw err;
                        console.log('It\'s saved!', this_country_code);
                    });
                }
            }
            index++;
        })
        .on('end', function(){
            console.log('end');
        });
});