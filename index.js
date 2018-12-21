#!/usr/bin/env node

const fs = require('fs');

const filepath = process.env.FILEPATH || process.env.PWD;
const inputFileName = process.env.INPUTFILENAME || 'sample-input.txt';
const outputFileName = process.env.OUTPUTFILENAME || 'results.txt'
const pointWeights = process.env.POINTWEIGHTS || {
  1: 5,
  2: 3,
  3: 2,
  4: 1,
  5: 0
}
console.log(process.env)


// One per unique item being surveyed
class Item {
  constructor(name) {
    this.name = name;
    this.points = 0;
  }
  addPoints(newPoints) {
    this.points += newPoints;
  }

  static rank(items) {
    const itemArray = Object.keys(items).map((key)=> {return items[key]})
    return itemArray.sort((curr, prev) => {
      return (curr.points === prev.points) ? curr.name.length - prev.name.length : prev.points - curr.points;
    });
  }

  static format(rankedItems) {
    const strings = rankedItems.map((item, index) => {
      return `${index + 1}. ${item.name}, ${item.points} ${(item.points === 1) ? 'pt' : 'pts'}`
    })
    return strings.join('\n')
  }
}

// One per survey response
class Response {
  constructor(originalString) {
    this.originalString = originalString;
  }
  parse() {
    this.name = this.originalString.slice(0,this.originalString.length-2)
    this.rawScore = parseInt(this.originalString.slice(-1));
  }
  weightPoints() {
    this.weightedPoints = pointWeights[this.rawScore];
  }
}

function processFile(data) {
  // Split into individual survey responses
  const strings = data.split("\n");
  let items = {};

  strings.forEach(string => {
    // Create, parse and weight points for each response
    const response = new Response(string);
    response.parse();
    response.weightPoints();

    // Add item if it doesn't exist
    if (!items[response.name]) {
      items[response.name] = new Item(response.name);
    }
    // Add points from response to item. 
    items[response.name].addPoints(response.weightedPoints);
  })

  //Rank and format
  const ranked = Item.rank(items);
  const formatted = Item.format(ranked);
  return formatted;
}

// Read and write files - starting point for app. 
fs.readFile(inputFileName, 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file: ${err}`)
  } else {
    console.log(`Processing ${filepath}/${inputFileName}`)
    const processedFile = processFile(data);
    fs.writeFile('results.txt', processedFile, 'utf8', err => {
      if (err) {
        console.log(`Error writing file: ${err}`)
      } else {
        console.log(`Success! Results at ${filepath}/${outputFileName}`)
      }
    });
  }
});

module.exports = {
  processFile: processFile,
  Item: Item,
  Response, Response
};

