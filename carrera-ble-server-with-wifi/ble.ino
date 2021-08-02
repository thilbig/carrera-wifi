#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define UUID_OF_SERVICE_TO_ADVERTISE_AS            "0000180d-0000-1000-8000-00805f9b34fb"
#define UUID_OF_SERVICE_TO_ADVERTISE_AS_2          "0000180f-0000-1000-8000-00805f9b34fb"
#define UUID_OF_SERVICE_TO_ADVERTISE_AS_3          "0000180a-0000-1000-8000-00805f9b34fb"
#define UUID_OF_SERVICE_TO_ALLOW_CONNECTIONS_TO    "39DF7777-B1B4-B90B-57F1-7144AE4E4A6A"
#define UUID_OF_CHARACTERISTIC_TO_ALLOW_WRITE_TO   "39DF8888-B1B4-B90B-57F1-7144AE4E4A6A"
#define UUID_OF_CHARACTERISTIC_TO_SEND_NOTIFIES_TO "39DF9999-B1B4-B90B-57F1-7144AE4E4A6A"

BLEServer* pServer = NULL;
BLECharacteristic* pNotifyCharacteristic = NULL;
BLECharacteristic* pWriteableCharacteristic = NULL;
bool oldDeviceConnected = false;
uint32_t value = 0;

void generateBLEMessageFromSerialMessage(char const* serialMessage, char *bleMessage) {
  strcpy(bleMessage, serialMessage);

  if (serialMessage[0] == '0') { 
    //Antwort auf Abfrage der Version ohne führende 0 senden
    memmove(bleMessage, bleMessage + 1, strlen(bleMessage));
  } else if (serialMessage[0] == '?') {
    //Antwort auf Abfrage des Rennzustands ohne führendes ? senden
    memmove(bleMessage, bleMessage + 1, strlen(bleMessage));
  } else {
    //soweit ich verstehe, ist der von der Bahn gelesene String sowieso immer nur 2 Zeichen lang (Bestätigung des Befehls und "$")
    bleMessage[strlen(bleMessage) - 1] = 0;
  }
}

void writeToBLE(char* message) {
  //Serial.print("Sending message to BLE: ");
  //Serial.println(message);

  pNotifyCharacteristic->setValue(message);
  pNotifyCharacteristic->notify();
}

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      Serial.println("a client connected");
      bleConnected = true;

      BLEDevice::startAdvertising();
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.println("a client disconnected");
      bleConnected = false;
    }
};

class MyWriteableCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      //Serial.print("BLE message received: ");
      //Serial.println(pCharacteristic->getValue().c_str());

      char serialMessage[MAX_MESSAGE_LENGTH];

      generateSerialMessageFromBLEMessage(pCharacteristic->getValue().c_str(), serialMessage);
      writeToCarrera(serialMessage);
    }
};

void initBLE() {
  BLEDevice::init("Control_Unit"); 

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(UUID_OF_SERVICE_TO_ALLOW_CONNECTIONS_TO);

  // Create a BLE Characteristic
  pNotifyCharacteristic = pService->createCharacteristic(
                      UUID_OF_CHARACTERISTIC_TO_SEND_NOTIFIES_TO,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );


  pWriteableCharacteristic = pService->createCharacteristic(
                    UUID_OF_CHARACTERISTIC_TO_ALLOW_WRITE_TO,
                    BLECharacteristic::PROPERTY_WRITE_NR 
                  );
  
  pNotifyCharacteristic->addDescriptor(new BLE2902());
  pWriteableCharacteristic->setCallbacks(new MyWriteableCharacteristicCallbacks());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(UUID_OF_SERVICE_TO_ADVERTISE_AS); 
  pAdvertising->addServiceUUID(UUID_OF_SERVICE_TO_ADVERTISE_AS_2);
  pAdvertising->addServiceUUID(UUID_OF_SERVICE_TO_ADVERTISE_AS_3);
  pAdvertising->setScanResponse(false);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}