var restUtil = require('./restUtil.js');
var geolib = require('geolib');
var bunyan = require('bunyan');

var logger = bunyan.createLogger(
    {
        name : 'getswift',
        streams : [
            {
                stream : process.stderr,
                level : "error"
            },
            {
                path : 'getswift.log',
                level : "info"
            }
        ]
    }
    );

var drones = null;
var packages = null;

//depo coordinate for "303 Collins Street, Melbourne, VIC 3000"
var depoCoordinate =
{
    latitude : -37.816562,
    longitude : 144.963846
};

var output =
{
    assignments : [],
    unassignedPackageIds : []
};

/**
Check for a "test" parameter. If present, drones and packages
will get the data from offlines files in "test" folder.
 */
if (process.argv.slice(2).length > 0)
{
    if (process.argv.slice(2)[0] == 'test')
    {
        logger.info("Data from offline Test json files");

        drones = require('./testdata/drones.json');
        packages = require('./testdata/packages.json');

        //logger.info(JSON.stringify(drones));

        processPackages(drones, packages);

    }
    else
    {
        logger.error("Unrecognized arguments");
    }

}
else
{
    logger.info("Data from API");
    restUtil.performRequest('/drones', 'GET', {}, function (data)
    {
        drones = data;

        restUtil.performRequest('/packages', 'GET', {}, function (data)
        {
            packages = data;

            processPackages(drones, packages);

        }
        );

    }
    );

}

/*
Start processing on the given drones and packages
 */
function processPackages(drones, packages)
{

    sortPackgesByDeadline(packages);

    sortFreeDronesByDistance(drones);

    assignTheDrone(packages, drones);
    
}

/**
Sorts the packages by deadline
 */
function sortPackgesByDeadline(packages)
{
    packages.sort(function (a, b)
    {
        return a.deadline - b.deadline;
    }
    );
}

/*
Sorts Drones by distance back to the depo
 */
function sortFreeDronesByDistance(availableDrones)
{
    availableDrones.sort(function (a, b)
    {
        return (
            (a.packages.length > 0 ?
                (geolib.getDistance(a.location, a.packages[0].destination) + geolib.getDistance(a.packages[0].destination, depoCoordinate))
                 :
                geolib.getDistance(a.location, depoCoordinate))
             - (b.packages.length > 0 ?
                (geolib.getDistance(b.location, b.packages[0].destination) + geolib.getDistance(b.packages[0].destination, depoCoordinate))
                 :
                geolib.getDistance(b.location, depoCoordinate)));
    }
    );
}

/*
Assigns the drones to the packages
 */
function assignTheDrone(packages, availableDrones)
{
    for (var i = 0; i < packages.length; i++)
    {
        var package = packages[i];
        logger.info('Working on Package ID: ' + package.packageId);

        if (availableDrones.length > 0)
        {

            // pick the drone that is closest to the depo
            var drone = availableDrones[0];

            var canMakeIt = canTheDroneMakeIt(package, drone);

            if (canMakeIt)
            {
                // remove the drone from the availableDrones
                availableDrones.shift();

                logger.info(package.packageId + " assigned to " + drone.droneId);
                output.assignments.push(
                {
                    "droneId" : drone.droneId,
                    "packageId" : package.packageId
                }
                );
            }
            else
            {
                logger.info('Drones cannot handle the package ID: ' + package.packageId);
                // assign to the unassigned package id list
                output.unassignedPackageIds.push(package.packageId);
            }
        }
        else
        {
            logger.info('Drones cannot handle the package ID: ' + package.packageId);
            output.unassignedPackageIds.push(package.packageId);
        }

    }

    logger.info("\n\n\n");
    logger.info(output);
    console.log(output);

}

/*
Checks to see if a package can be assigned to a drone
 */
function canTheDroneMakeIt(package, drone)
{
    var droneDistanceBackToDepo = (drone.packages.length > 0 ? geolib.getDistance(drone.location, drone.packages[0].destination) + geolib.getDistance(drone.packages[0].destination, depoCoordinate) : geolib.getDistance(depoCoordinate, drone.location));
    logger.info("Drone distance to depot: " + droneDistanceBackToDepo);
    logger.info("Package destination distance from depo: " + geolib.getDistance(depoCoordinate, package.destination));
    var totalDistanceToCover = droneDistanceBackToDepo + geolib.getDistance(depoCoordinate, package.destination);
    logger.info("Total Distance To Cover in meter: " + totalDistanceToCover);
    var totalTimeTakenToDeliverThePackage = ((totalDistanceToCover / 1000) / 50) * 3600;
    logger.info("Total Time Taken To Deliver The Package in seconds: " + totalTimeTakenToDeliverThePackage);
    var timeAvailable = package.deadline - (new Date().getTime() / 1000);
    logger.info("Time Available (deadline - now): " + timeAvailable);
    if (totalTimeTakenToDeliverThePackage < timeAvailable)
    {
        return true;
    }
    else
    {
        return false;
    }
}

module.exports.processPackages = processPackages;
module.exports.canTheDroneMakeIt = canTheDroneMakeIt;