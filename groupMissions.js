#!/usr/bin/env node

const fs = require('fs');
const csv = require('csv-parse');
const xlsx = require('xlsx');

const filepath = process.env.FILEPATH || process.env.PWD;
const inputFileName = process.env.INPUTFILENAME || 'missionsWithAzimuths.csv';

// Assing missions to drones
function assign(missions, numDrones, buffer = 0) {
  let flights = [];

  // Loop until all missions assigned:
  while (missions.some(mission => mission.drone === null)) {
    let flight = []
    let prevMission = null;
    // loop through drones
    for (let droneIndex = 0; droneIndex < numDrones; droneIndex++) {

      let nextMission = missions.find(mission => {
        if (prevMission === null) { // If empty flight, grab first unassigned mission
          return mission.drone === null
        } else {    // Grab first mission that doesn't overlap. 
          return mission.drone === null && mission.start > (prevMission.end + buffer)
        }
      });

      if (nextMission) {
        // Modify Mission
        missions[nextMission.index].drone = droneIndex;
        missions[nextMission.index].flight = flights.length;

        // Add to flight
        flight.push({
          drone: droneIndex, 
          mission: nextMission.missionName
        });
      }
      prevMission = nextMission;
    }
    flights.push(flight)
  }

  return {
    missions: missions,
    flights: flights,
  }
}


// PyQGIS code exports with the convention that mission.start is the azimuth with a smaller number, 
// this uses the convention that mission.start to mission.end is the part of the circle reserved for a mission, 
// whereas end to start is where every other mission can go. 
const correctFor360 = (missions) => {
  corrected = missions.map((mission)=> {
    if (mission.end - mission.start > 180) {
      return {
        ...mission,
        start: mission.end,
        end: mission.start
      };
    } else {
      return mission;
    }
  });
  return corrected
} 

//
const preProcess = (data)=> {
  let rawMissions = data.map((array)=>{
    return {
      missionName: array[0],
      start: parseFloat(array[1]),
      end: parseFloat(array[2])
    }
  });

  let correctedFor360 = correctFor360(rawMissions);

  // sort
  let sortedMissions = correctedFor360.sort((prev, next) => {
    return prev.start - next.start});

  // Add index
  let missions = sortedMissions.map((mission, index)=> {
    return {...mission, index: index, drone: null}});
  return missions
}

const exportMissions = (assigned) => {
  let workbook = xlsx.utils.book_new();
    
    // Consolidate to object for proper excel formatting
    let preparedFlights = assigned.flights.map((flight, index)=>{
      let flightObj = {flightIndex: index};
      flight.forEach((drone)=>{
        flightObj[`drone${drone.drone}`] = drone.mission;
      });
      return flightObj
    });

    // Make sheets
    let missions = xlsx.utils.json_to_sheet(assigned.missions);
    let flights = xlsx.utils.json_to_sheet(preparedFlights);

    /* add to workbook */
    xlsx.utils.book_append_sheet(workbook, missions, "missions");
    xlsx.utils.book_append_sheet(workbook, flights, `flights`);
    

    /* write workbook and force a download */
    xlsx.writeFile(workbook, `output.xlsx`);
}

// Entry and exit point. 
let results = [];
fs.createReadStream(`/Users/ericschoettle/Dropbox/repositories/FlightPathAlgorithm/missionsWithAzimuths.csv`) //`${filepath}/${inputFileName}`
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const preProcessed = preProcess(results);
    const assigned = assign(preProcessed, 2, 1);

    exportMissions(assigned);
  });


