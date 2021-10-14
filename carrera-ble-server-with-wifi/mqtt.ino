#define MQTT_TOPIC_TO_WRITE_ENCODED_VALUES_TO "Home/carrera/track/Encoded/Value"
#define MQTT_TOPIC_TO_WRITE_PING_TO           "Home/carrera/track/Ping/Value"

char lastPublishedValue[MAX_MESSAGE_LENGTH];
int timeOfLastPing = 0;
int pingCounter = 0;

void writeToMqtt(char const* encodedValue) {
  if (mqttClient.isConnected()) {
    if (strcmp(encodedValue, lastPublishedValue) != 0) {
      //Serial.print("Writeing new value to topic " + String(MQTT_TOPIC_TO_WRITE_ENCODED_VALUES_TO) + ": ");
      //Serial.println(encodedValue);

      mqttClient.publish(MQTT_TOPIC_TO_WRITE_ENCODED_VALUES_TO, String(encodedValue));
      strcpy(lastPublishedValue, encodedValue);
    } else {
      //Serial.println("Value did not change, not publishing it again");
    }
  } else {
    //Serial.println("Not conencted to mqtt");
  }
}

void sendPingIfNeccessary() {
  int now = millis();

  if (now - timeOfLastPing > 1000) { //more than one second ago
    sendPing(now);
  }
}

void sendPing(int currentMillis) {
  if (mqttClient.isConnected()) {
    mqttClient.publish(MQTT_TOPIC_TO_WRITE_PING_TO, String(++pingCounter));
    timeOfLastPing = currentMillis;
  }
}