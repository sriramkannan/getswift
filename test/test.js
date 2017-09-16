var restUtil = require('../restUtil');
var canTheDroneMakeIt = require('../index').canTheDroneMakeIt;

var assert = require('assert');

describe('Check API', function ()
{
    it('should connect and get some data for drones', function (done)
    {
        this.timeout(5000);
        restUtil.performRequest('/drones', 'GET', {}, function (data)
        {
            assert.notEqual(data.length, 0);
            done();
        }
        );
    }
    );
    it('should connect and get some data for packages', function (done)
    {
        restUtil.performRequest('/packages', 'GET', {}, function (data)
        {
            assert.notEqual(data.length, 0);
            done();
        }
        );
    }
    );

    it('should check if the drone can make it', function ()
    {
        var canMakeIt = canTheDroneMakeIt(
            {
                "destination" :
                {
                    "latitude" : -37.78404125474984,
                    "longitude" : 144.85238118232522
                },
                "packageId" : 8041,
                "deadline" : (new Date().getTime() / 1000 + 2000)
            },
            {
                "droneId" : 493959,
                "location" :
                {
                    "latitude" : -37.77718638788778,
                    "longitude" : 144.8603578487479
                },
                "packages" : []
            }
            );

        assert.equal(canMakeIt, true);
    }
    );

}
);
