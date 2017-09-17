# getswift

Project to assign packages to drones under following constraints: 

* The depo is located at 303 Collins Street, Melbourne, VIC 3000
* Drones might already be carrying a package. The time to deliver this package should be taken into account when comparing drones.
* Once a drone is assigned a package, it will fly in a straight line to its current destination (if it already has a package), then to the depo, then to the new destination
* Packages must only be assigned to a drone that can complete the delivery by the package's delivery deadline
* Packages should be assigned to the drone that can deliver it soonest
* A drone should only appear in the assignment list at most once; this is a dispatching problem, not a routing problem. 

And the following are the assumptions: 
* Drones have unlimited range
* Drones travel at a fixed speed of 50km/h
* Packages are all the same weight and volume
* Packages can be delivered early
* Drones can only carry one item at a time

# Requirements
node.js (Install from https://nodejs.org/en/)

# Installation
1. Clone this project (git clone https://github.com/sriramkannan/getswift.git)
1. cd to the folder (cd getswift)
1. Install dependencies (npm install)
1. Run the project (node index.js)

The output will be the last line on console and the log file in the following format: 

eg. 

{
  assignments: [{droneId: 1593, packageId: 1029438}, {droneId: 1251, packageId: 1029439}]
  unassignedPackageIds: [109533, 109350, 109353]
}

## Test

run the test as "npm test". If it doesn't work, install mocha globally as "npm install -g mocha" and then try test again - "npm test".  
