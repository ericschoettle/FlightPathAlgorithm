## Istallation

  * Using Terminal or your favorite bash shell, clone from github with `git clone `
  * To install the grouping algorithm, run `npm install`
  * To Install QGIS toolbox, open QGIS, open the processing toolbox, click on the python logo, and select 'create new script'
  * * Copy and paste the contents of AzimuthsFromShapefiles.py, and save with the same name. 


## Use

  * Run the script from QGIS. 
  * From the project directory run `./groupMissions.js`
  * Results will be in the `output.xlsx`

## A Note on Architecture

  It's a little weird to go from python to Javascript; this is a byproduct of the python seen here already being the plurality of python that I've written in my life, and an actual intelligent reason. Namely, extensibility: with Javascript being the language of the web, it would be easy to make a site/app (including offline mode) to allow the field worker to reprocess the azimuth file based on which missions had been run.  

## To do

  * Fix subprocess.call() so that python code triggers JS code
    * Pass in the name of the project for better file naming
    * Use STDIN/STDOUT to pass the results back to python/QGIS. 
      * Put assignment info back into shapefiles for visualization, and the big one:
  * Integrate with QGroundControl!!!! 
  * Package python script into QGIS module for easier installation. 