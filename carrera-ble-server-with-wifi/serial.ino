#include <HardwareSerial.h>

#define BAUD_RATE        19200 
#define PARITY      SERIAL_8N1
#define RX_PORT              5
#define TX_PORT             23
#define MESSAGE_TERMINATOR  '$'

#define SERIAL_TIMEOUT_MILLIS 1000

HardwareSerial carreraSerial(1);
char inputBuffer[MAX_MESSAGE_LENGTH];
int currentInputBufferIndex = 0;
unsigned long timeWhenLastMessageWasReceived = 0;

void generateSerialMessageFromBLEMessage(char const* bleMessage, char *serialMessage) {
  //append a " to the front
  memset(serialMessage, 0, MAX_MESSAGE_LENGTH);
  serialMessage[0] = '"';
  strncat(serialMessage, bleMessage, strlen(bleMessage));
}

void writeToCarrera(char *message) {
  //Serial.print("Writeing message to carrera: ");
  //Serial.println(message);

  carreraSerial.println(message);
}

void serialLoop() {
  bool somethingReceived = decodeSerialInput();

  if (somethingReceived) {
    timeWhenLastMessageWasReceived = millis();
    carreraConnected = true;
  } else if (timeWhenLastMessageWasReceived > 0 && millis() - timeWhenLastMessageWasReceived > SERIAL_TIMEOUT_MILLIS) {
    carreraConnected = false;
  }
}

bool decodeSerialInput() {
  bool ret = false;

  while(carreraSerial.available() > 0) {
    if (currentInputBufferIndex < MAX_MESSAGE_LENGTH) {
      byte currentInput = carreraSerial.read();
      inputBuffer[currentInputBufferIndex] = currentInput;
      currentInputBufferIndex++;

      if (currentInput == MESSAGE_TERMINATOR) {
        String received = String((char *)inputBuffer);
        char bleMessage[MAX_MESSAGE_LENGTH];

        //Serial.print("serial message received: ");
        //Serial.println(inputBuffer);

        generateBLEMessageFromSerialMessage(inputBuffer, bleMessage);
        writeToBLE(bleMessage);
        writeToMqtt(inputBuffer);

        resetSerialBuffer();
      }
    } else {
      Serial.println("Message overflow, resetting buffer");
      resetSerialBuffer();
    }

    ret = true;
  }

  return ret;
}

void resetSerialBuffer() {
  memset(inputBuffer, 0, MAX_MESSAGE_LENGTH);
  currentInputBufferIndex = 0;
}

void initCarreraSerial() {
  carreraSerial.begin(BAUD_RATE, PARITY, RX_PORT, TX_PORT);
}