#!/bin/env python

import processing
import string
import subprocess
import os
from qgis.utils import iface

from qgis.core import (
    QgsExpression,
    QgsProcessing,
    QgsProcessingAlgorithm,
    QgsProcessingParameterField,
    QgsProcessingParameterFolderDestination,
    QgsProcessingParameterVectorLayer
)


class Test(QgsProcessingAlgorithm):

    def __init__(self):
        super().__init__()

    def createInstance(self):
        return type(self)()

    def displayName(self):
        return "TEST"

    def name(self):
        name = "".join([
            character for character in self.displayName().lower()
            if character in string.ascii_letters
        ])
        return name

    def initAlgorithm(self, config=None):
        self.addParameter(
            QgsProcessingParameterVectorLayer(
                name="LandingZone",
                description="Landing Zone",
                types=[QgsProcessing.SourceType.TypeVectorPoint]
            )
        )
        self.addParameter(
            QgsProcessingParameterFolderDestination(
                name="OutputFolder",
                description="Folder with index.js in it"
            )
        )
        pass

    def processAlgorithm(self, parameters, context, feedback):
        
        outputFolder =  parameters["OutputFolder"]
        # create destination directory
        os.makedirs(
            outputFolder,
            exist_ok=True
        )
        
        # Grab landing Zone Coordinates. 
        landingZone = parameters['LandingZone']
        for feature in landingZone.getFeatures():
            vertices = feature.geometry().vertices()
            
            for vertex in vertices:
                lzX = str(vertex.x())
                lzY = str(vertex.y())
                
        # Grab Layers. 
        # TODO: Figure out how to add all the layers, without making the user select each one, from the parameters
        #layers = QgsMapLayerRegistry.instance().mapLayers()

        layers = iface.mapCanvas().layers()
        print(layers)
        
        # Open file to write to
        # TODO: Make dynamic (use parameters)

        file = open(outputFolder + "/missionsWithAzimuths.csv","w") 
        
        # find missions
        missions = []
        for layer in layers:
            if layer.geometryType() == 1:
                missions.append(layer)
        
        
        #Find min and max azimuth for vertices on each flight path
        for mission in missions:
                features = mission.getFeatures()
                minAz = None
                maxAz = None

                for feature in features:
            
                    vertices = feature.geometry().vertices()
                    for vertex in vertices:
                        x = str(vertex.x())
                        y = str(vertex.y())
                        expression = QgsExpression('degrees(azimuth(make_point(' + x + ',' + y + '), make_point(' + lzX + ',' + lzY + ')))')

                        azimuth = expression.evaluate()
                        if minAz == None or azimuth < minAz :
                            minAz = azimuth
                        if maxAz == None or azimuth > maxAz:
                            maxAz = azimuth
                            
                    missionName = feature['Missn_Name']
                string = missionName + ',' +  str(minAz) + ',' + str(maxAz) + '\n'
                file.write(string)
                
        file.close() 
        print('.' + outputFolder  + '/index.js')
        subprocess.call(['.' + outputFolder  + '/index.js'])
        subprocess.call(['.' + outputFolder  + '/index.js'])
        
        return {}