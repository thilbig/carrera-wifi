# What is this?
Using these resources it is possible to build a small module that translates serial data transmitted by a Carrera Control Unit (CCU) into mqtt messages.

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
- Arduino source code that will run on an ESP32 micro controller communicating with the CCU a MQTT Broker
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
I love to use ESP32 controllers for my projects, especially the Wemos Mini D1 ESP32 Kit.
To avoid the additional and unneeded drill holes there is a second diagram using placeholders instead the ESP32 kit.
I don't have much experience designing circuit diagrams, but I like to use separated modules for the single tasks.
So this is why I used a kit to level shift the logical signals from 3.3V to 5V.
I am sure there are better and more efficient ways to accomplish that. But hey, it works.

To connect the board to the CCU a so called "mini din connector" is needed, they look similar to the ps2 cables used by old keyboards ore mouses but differ in the number of connected pins.
A very good description of the connector and the usages of each of the pins can be found [here](http://slotbaer.de/carrera-digital-124-132/10-cu-rundenzaehler-protokoll.html) (german).
This excellent page also describes the serial and the bluetooth protocol, so my work is based on the researches described by Stephan Heß aka slotbaer.
Slotbaer also warns that if the wrong pins are used it may happen that the serial pin gets directly connected to the supply voltage which will damage the Control Unit.
So pay attention when wiring the hardware, I am not responsible if anything goes wrong! 

I used some parts that do not belong to the default fritzing library. 
It may be necessary to add them to your library on your own. 
They can be found here:

* Wemos ESP32: [here](https://forum.fritzing.org/t/doit-esp32-devkit-v1-30-pin/8443/4)
* Level converter: [here](https://forum.fritzing.org/t/4-x-5v-to-3-3v-logic-level-converter/3395)

![layout](<./images/breadboard.png>)

![pcb](<./images/final_hardware.jpg>)

## Arduino Code
The code for the ESP32 can be found in the `carrera-ble-server-with-wifi` folder.
To provide the WIFI credentials and the location of your MQTT broker create a file called `credentials.h` with the following content:

``` 
#define SSID         "your_ssid"
#define PASSWORD     "your_wifi_password"
#define MQTT_SERVER  "ip_of_broker"
#define MQTT_NAME    "mqtt_name"
```

To build the arduino code you need to install the library `EspMQTTClient` using the build in library manager or from [here](https://github.com/plapointe6/EspMQTTClient). 
This library is responsible for the communication with the MQTT Broker and simplifies the code a lot.

I had some problems with my mqtt broker resetting the connection. Increasing the keepalive time by calling the method `setKeepAlive` did not work, so I decided to implement a ping that is send every second.

## Message decoder
The serial messages received from the CCU are not decoded directly on the hardware, instead I implemented a service that takes care of that.
This service is implemented as a node script and written in Typescript, the source code can be found in the `carrera-mqtt` folder.
To run and build this service a standard nodejs environment is needed and all the dependencies must be installed.
After the nodejs environment works a typical `npm install` should take care of resolving all the dependencies. 

The `carrera-mqtt` decoder receives encoded messages via MQTT, decodes them and publishes the decoded results.
For example our custom hardware receives the message `?20000<4551=$` from the CCU. 
This message means that the car with the id `2` crossed the start/finish line `19541` after the race was started.
The decoder received this data package using the topic `Home/carrera/track/Encoded/#` and publishes the decoded data using the topic `Home/carrera/Car/2/LastLapTime`.
More examples can be found in the `*.spec` files that test the code, a description of the single messages and their meanings can again be found on [slotbaer's page](http://slotbaer.de/carrera-digital-124-132/10-cu-rundenzaehler-protokoll.html).

The Carrera Control Unit does NOT provide information about the current leader or the last lap time. 
Only information *which* care crossed the start/finish line *when* (relative to the start of the race).
To gather this additional information (and to publish it using MQTT) some additional processing is required. 
A full list of available information and the corresponding topics can be found in the spec file `race-manager.spec.ts` in the `initialMqttMessages` area.

The decoder service is designed to run as a service on a Windows machine, using a library called `winser`.
To install the decoder as a Windows service call the command `install-windows-service` with admin privileges.

For demo purposes and initial testing I collected some encoded messages in a database (using the package lowdb).
This approach can be continued to store the decoded values as well, but I am using a different approach described in the next section.

# Visualization
To store and visualize the data I am using my smart home central ([openhab](https://www.openhab.org/)) and the connected database ([influxdb](https://www.influxdata.com/)).
This lead to a simple (and very ugly) overview page displaying some basic information:

![openhab](<./images/openhab.png>)

For a far better visualization of a race I am using [grafana](https://grafana.com/).
This makes graphs like the following one visualizing the lap times of a race against my son (and a ghostcar) possible.

![openhab](<./images/grafana_lap_times.png>)

# Improvements
There is always room for improvements. Some ideas immediately come to my mind:
* A better hardware using smaller parts
* Design and build a case for the hardware
* Finish the open TODOs in the arduino and nodejs code
* Enable two way communication with the Carrera track; e.g. start a race using MQTT messages

# Thanks
Without slotbaer's work this wouldn't be possible. 
So many thanks for reverse engineering the protocol and sharing it!