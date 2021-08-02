# What is this?
Using these resources it is possible to build a small module that translates serial data transmitted by a Carrera Control Unit into mqtt messages.

## Motivation
I was already using an app called [SmartRace](https://www.smartrace.de/) to communicate with the Carrera track using their bluetooth module.
The main purpose of the app is to organize races and to track lap times.
There are additional features that are very useful, e.g. providing driver, car and track management and a lot of settings for the cars.
The drawback is that you always have to start the app to record lap times, access to the raw historical data is difficult.

So I decided to look for an alternative.
My requirements were:
- Management features like the ones SmartRaces already provides
- Record lap times without starting additional hard- or software
- Store historical data

After playing around some time I tried to implement some kind of "man-in-the-middle-hardware".
This piece of hardware should act like the normal bluetooth adapter sold by Carrera to still use the SmartRace app.
In addition, my custom module should send the raw data received by the carrera track to some kind of database to store historical data.
The module itself should be directly connected to the carrera track, so no additional power supply is necessary.

This is the result of my work.

# Architecture
This project consists of three parts:
- Arduino source code that will run on an ESP32 micro controller communicating with the Carrera track and a mqtt broker
- A nodejs script that receives encrypted Carrera messages, decrypts them and publishes the decoded data using mqtt
- A circuit diagram that shows how to connect the ESP32 to the Carrera track

## TODO diagram of components

## TODO project setup (broker, arduino, node, typescript, credentials...)