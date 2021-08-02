#define MQTT_TOPIC_TO_WRITE_ENCODED_VALUES_TO "Home/carrera/track/Encoded/Value"

char lastPublishedValue[MAX_MESSAGE_LENGTH];

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
