#include <WiFi.h>
#include <PubSubClient.h>
#include "EspMQTTClient.h"
#include "credentials.h"

//19: red | 18: yellow | 26: green
#define BLE_CONNECTED_DEBUG_LED_PIN     26
#define MQTT_CONNECTED_DEBUG_LED_PIN    18
#define CARRERA_CONNECTED_DEBUG_LED_PIN 19

#define MAX_MESSAGE_LENGTH   20

bool carreraConnected = false;
bool bleConnected = false;

EspMQTTClient mqttClient(
  SSID,
  PASSWORD,
  MQTT_SERVER,
  MQTT_NAME
);

void onConnectionEstablished() {
  Serial.println("Connected to mqtt broker.");
}


void setup() {
  Serial.begin(115200);

  pinMode(BLE_CONNECTED_DEBUG_LED_PIN, OUTPUT);
  pinMode(MQTT_CONNECTED_DEBUG_LED_PIN, OUTPUT);
  pinMode(CARRERA_CONNECTED_DEBUG_LED_PIN, OUTPUT);
  
  initBLE();
  initCarreraSerial();
}

void loop() {
  sendPingIfNeccessary();
  mqttClient.loop();
  serialLoop();

  digitalWrite(BLE_CONNECTED_DEBUG_LED_PIN, bleConnected);
  digitalWrite(MQTT_CONNECTED_DEBUG_LED_PIN, mqttClient.isConnected());
  digitalWrite(CARRERA_CONNECTED_DEBUG_LED_PIN, carreraConnected);

  if (!mqttClient.isConnected()) {
    Serial.println("isWifiConnected: " + String(mqttClient.isWifiConnected()));
    Serial.println("isMqttConnected: " + String(mqttClient.isMqttConnected()));
    Serial.println("getConnectionEstablishedCount:" + String(mqttClient.getConnectionEstablishedCount()));
    delay(500);
  }

  //if no device is connected using ble we have to ask for race time on our own
  if (!bleConnected) { 
    writeToCarrera("\"?"); 
    delay(5);
  }
}

