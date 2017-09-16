var querystring = require('querystring');
var https = require('https');

var host = 'codetest.kube.getswift.co';

module.exports.performRequest = function (endpoint, method, data, success, token)
{
    //console.log(endpoint);
    var dataString = JSON.stringify(data);
    var headers = {};

    // if (method == 'GET')
    // {
    //     endpoint += '?' + querystring.stringify(data);
    // }
    // else
    // {
    headers =
    {
        'Content-Type' : 'application/json',
        'X-Auth-Token' : '' + token,
        'Content-Length' : dataString.length
    };
    // }
    var options =
    {
        host : host,
        path : endpoint,
        method : method,
        headers : headers,
        port : 443
    };

    var req = https.request(options, function (res)
        {
            //res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function (data)
            {
                responseString += data;
            }
            );

            res.on('end', function ()
            {
                //console.log(responseString);
                var responseObject = JSON.parse(responseString);
                success(responseObject);
            }
            );

            res.on('err', function (err)
            {
                console.err('ERROR WHILE ACCESSING THE URL ', err);
            }
            );
        }
        );

    req.write(dataString);
    req.end();
}
