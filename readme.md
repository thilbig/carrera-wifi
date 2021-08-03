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
- Arduino source code that will run on an ESP32 micro controller communicating with the Carrera track and a MQTT Broker
- A nodejs script that receives encrypted Carrera messages, decrypts them and publishes the decoded data using MQTT
- A circuit diagram that shows how to connect the ESP32 to the Carrera track

![diagram of components](<./images/architecture.png>)

# Project setup

## MQTT Broker
Setup a MQTT Broker like [mosquitto](https://mosquitto.org/) using their guides.
No special settings (security, encryption, ...) are needed.

## Hardware
Of course, you need the hardware to communicate with the Carrera track using their serial protocol.
The needed circuit diagrams can be found as [fritzing](https://fritzing.org/) files in the `pcb` folder.
I love to use ESP32 controllers for my projects, especially the `Wemos Mini D1 ESP32 Kit`.
To avoid the additional and unneeded drill holes there is a second diagram using placeholders instead the ESP32 kit.
I don't have much experience designing circuit diagrams, so I like to use separated modules for the single tasks.
So this is why I used a kit to level shift the logical signals from 3.3V to 5V.
I am sure there are better and more efficient ways to accomplish that. But hey, it works.

TODO were to get the fritzing parts
TODO p2c cable
TODO attention 

![layout](<./images/breadboard.png>)

![pcb](<./images/pcb.png>)

## Arduino Code
The code for the ESP32 can be found in the `carrera-ble-server-with-wifi` folder.
To provide the WIFI credentials and the location of your MQTT broker create a file called `credentials.h` with the following content:

``` 
#define SSID         "your_ssid"
#define PASSWORD     "your_wifi_password"
#define MQTT_SERVER  "ip_of_broker"
#define MQTT_NAME    "mqtt_name"
```

 TODO additional libraries 

## Message decoder
TODO Typescript, nodejs, winserv, tests, additional database, ...

# Conclusion
Database using openhab and influxdb.

# Thanks
Link to protocol page