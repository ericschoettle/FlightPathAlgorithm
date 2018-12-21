var assert = require('assert');
var { processFile, Item, Response }= require('../index');

describe('Item', function() {
  describe('#addPoints()', function() {
    it('should start at 0', function() {
      let testItem = new Item('test');
      assert.equal(testItem.points, 0)
    });
    it('should add points to the item', function() {
      let testItem = new Item('test');
      testItem.addPoints(3);
      assert.equal(testItem.points, 3)
    });
  });
  describe('#rank()', function() {
    it('should rank items in descending order by points', function() {
      let rankedItems = Item.rank({
        testItem1: {name: 'name1', points: 0 }, 
        testItem2: {name: 'name2', points: 1 }
      });
      assert.deepEqual(rankedItems, [
        {name: 'name2', points: 1 },
        {name: 'name1', points: 0 }
      ]);
    });
    it('should rank by length of name (ascending) when points are the same', function() {
      let rankedItems = Item.rank({
        testItem1: {name: 'long name', points: 1 }, 
        testItem2: {name: 'name', points: 1 }
      });
      assert.deepEqual(rankedItems, [
        {name: 'name', points: 1 },
        {name: 'long name', points: 1 }
      ]);
    });
  });
  describe('#format()', function() {
    it('should format items as, eg. "1. Banana Cabana, 10 pts", where 1 is the rank', function() {
      let rankedItems = Item.format([
        {name: 'Banana Cabana', points: 10 },
        {name: 'Grape Escape', points: 8 }
      ]);
      assert.equal(rankedItems, '1. Banana Cabana, 10 pts\n2. Grape Escape, 8 pts');
    });
    it('should handle singular and plural point numbers correctly', function() {
      let rankedItems = Item.format([
        {name: 'Banana Cabana', points: 1 },
        {name: 'Grape Escape', points: 0 }
      ]);
      assert.equal(rankedItems, '1. Banana Cabana, 1 pt\n2. Grape Escape, 0 pts');
    });
  });
});

describe('Response', function() {
  describe('#parse()', function() {
    it('should parse strings of the format "Banana Cabana 1"', function() {
      let testResponse = new Response('Banana Cabana 1');
      testResponse.parse();
      assert.equal(testResponse.name, "Banana Cabana");
      assert.equal(testResponse.rawScore, "1")
    });
  });
  describe('#weightPoints()', function() {
    it('should transform a raw score into weighted points, inverting the scale', function() {
      let rankedItems = Item.rank({
        testItem1: {name: 'name1', points: 0 }, 
        testItem2: {name: 'name2', points: 1 }
      });
      assert.deepEqual(rankedItems, [
        {name: 'name2', points: 1 },
        {name: 'name1', points: 0 }
      ]);
    });
    it('should rank by length of name (ascending) when points are the same', function() {
      let rankedItems = Item.rank({
        testItem1: {name: 'long name', points: 1 }, 
        testItem2: {name: 'name', points: 1 }
      });
      assert.deepEqual(rankedItems, [
        {name: 'name', points: 1 },
        {name: 'long name', points: 1 }
      ]);
    });
  });
  describe('#format()', function() {
    it('should format items as, eg. "1. Banana Cabana, 10 pts", where 1 is the rank', function() {
      let rankedItems = Item.format([
        {name: 'Banana Cabana', points: 10 },
        {name: 'Grape Escape', points: 8 }
      ]);
      assert.equal(rankedItems, '1. Banana Cabana, 10 pts\n2. Grape Escape, 8 pts');
    });
    it('should handle singular and plural point numbers correctly', function() {
      let rankedItems = Item.format([
        {name: 'Banana Cabana', points: 1 },
        {name: 'Grape Escape', points: 0 }
      ]);
      assert.equal(rankedItems, '1. Banana Cabana, 1 pt\n2. Grape Escape, 0 pts');
    });
  });
});

describe('processFile', function() {
  it('should should manage the process from raw data to output data, calling all other funcitons.', function() {
    let result = processFile(
      "Banana Cabana 1\nGrape Escape 2\nStar Fruit Salute 3\nGuava Java 4\nBlackberry Fairy 5\nGuava Java 1\nGrape Escape 2\nStar Fruit Salute 3\nBlackberry Fairy 4\nBanana Cabana 5\nBanana Cabana 1\nStar Fruit Salute 2\nGrape Escape 3\nGuava Java 4\nBlackberry Fairy 5"
      );
      assert.equal(result, "1. Banana Cabana, 10 pts\n2. Grape Escape, 8 pts\n3. Guava Java, 7 pts\n4. Star Fruit Salute, 7 pts\n5. Blackberry Fairy, 1 pt");
  });
});

