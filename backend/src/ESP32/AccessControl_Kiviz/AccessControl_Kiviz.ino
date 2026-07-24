#include <Wire.h>
#include <SPI.h>
#include <RTClib.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Keypad.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================= NETWORK =================

const char* WIFI_SSID = "Ultra-Violet";
const char* WIFI_PASSWORD = "Kiviz_IoT@Final26";

const char* BACKEND_URL = "http://192.168.8.101:3001";
const char* DEVICE_API_KEY = "kiviz_ad_1d5880fa01ab3ed0abe2b433";



// ======= BACKEND CONNECTION ENDS HERE ============

// ================= OLED =================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);


// ================= RTC ==================
RTC_DS3231 rtc;

// ================= KEYPAD =================

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] =
{
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte rowPins[ROWS] = {32, 33, 25, 26};
byte colPins[COLS] = {27, 14, 12, 13};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);


// ================= OUTPUTS ==============
#define RELAY_PIN  15
#define BUZZER_PIN 17


void showMessage(String msg)
{
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 20);
  display.println(msg);
  display.display();
}

String readAccessPin()
{
  String enteredPIN = "";

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("ENTER PIN");
  display.display();

  while (enteredPIN.length() < 6)
  {
    char key = keypad.getKey();

    if (key)
    {
      // Accept only numbers
      if (key >= '0' && key <= '9')
      {
        enteredPIN += key;

        // Display *
        display.setCursor((enteredPIN.length() - 1) * 18, 35);
        display.print("*");
        display.display();
      }
    }
  }

  delay(300);

  return enteredPIN;
}

void accessGranted()
{
  showMessage("GRANTED");
  delay(900); // show granted on the screen for 1sec

  Serial.println("================================");
  Serial.println("ACCESS GRANTED");

  DateTime now = rtc.now();

  Serial.print("Access Time: ");
  Serial.print(now.year());
  Serial.print("/");
  Serial.print(now.month());
  Serial.print("/");
  Serial.print(now.day());
  Serial.print(" ");

  Serial.print(now.hour());
  Serial.print(":");
  Serial.print(now.minute());
  Serial.print(":");
  Serial.println(now.second());

  // Unlock the door
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("Door Unlocked");
  showMessage("DOOR OPEN");

  // Keep unlocked for 5 seconds
  delay(5000);

  // Lock the door
  digitalWrite(RELAY_PIN, HIGH);

  Serial.println("Door Locked");

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("ENTER PIN");
  display.setCursor(0, 35);
  display.println("TO UNLOCK");
  display.display();

  Serial.println("================================");
}


void accessDenied()
{
  showMessage("ACCESS DENIED");

  Serial.println("ACCESS DENIED");

  digitalWrite(BUZZER_PIN, HIGH);
  delay(150);
  digitalWrite(BUZZER_PIN, LOW);
  delay(150);

  digitalWrite(BUZZER_PIN, HIGH);
  delay(150);
  digitalWrite(BUZZER_PIN, LOW);

  delay(1000);

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("ENTER PIN");
  display.setCursor(0, 35);
  display.println("TO UNLOCK");
  display.display();
}



// ==========================================
// CONNECT TO WIFI
// ==========================================
void connectToWiFi()
{
  Serial.print("Connecting to WiFi");

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 20);
  display.println("Connecting");
  display.display();

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");

  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  display.clearDisplay();
  display.setCursor(0, 20);
  display.println("WiFi OK");
  display.display();

  delay(1000);
}

// ==========================================
// TEST BACKEND CONNECTION
// ==========================================
void testBackendConnection()
{
  HTTPClient http;

  String url =
    String(BACKEND_URL) +
    "/access/ping";

  http.begin(url);

  http.addHeader(
    "x-device-key",
    DEVICE_API_KEY
  );

  int httpCode = http.GET();

  Serial.print("HTTP Code: ");
  Serial.println(httpCode);

  if (httpCode == HTTP_CODE_OK)
  {
    Serial.println(http.getString());

    display.clearDisplay();
    display.setCursor(0, 20);
    display.println("Backend OK");
    display.display();
  }
  else
  {
    Serial.println(http.getString());

    display.clearDisplay();
    display.setCursor(0, 20);
    display.println("Backend Fail");
    display.display();
  }

  delay(1000);

  http.end();
}

// ==========================================
// VERIFY PIN WITH BACKEND
// ==========================================
bool verifyPin(String pin)
{
    HTTPClient http;

    String url =
        String(BACKEND_URL) +
        "/access/verify";

    http.begin(url);

    http.addHeader(
        "Content-Type",
        "application/json"
    );

    http.addHeader(
        "x-device-key",
        DEVICE_API_KEY
    );

    StaticJsonDocument<200> request;

    request["method"] = "PIN";
    request["pin"] = pin;

    String body;

    serializeJson(request, body);

    int httpCode = http.POST(body);

    Serial.print("HTTP Code: ");
    Serial.println(httpCode);

    String response = http.getString();

    Serial.println(response);

    if (httpCode != HTTP_CODE_OK)
    {
        http.end();
        return false;
    }

    StaticJsonDocument<200> document;

    if (deserializeJson(document, response))
    {
        http.end();
        return false;
    }

    bool granted =
        document["granted"];

    http.end();

    return granted;
}

void setup()
{
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  

  // Active LOW relay OFF
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(BUZZER_PIN, LOW);

  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println("OLED FAILED");
    while (1);
  }

  if (!rtc.begin())
  {
    Serial.println("RTC NOT FOUND");
    while (1);
  }



  connectToWiFi();
  testBackendConnection();

  Serial.println("SYSTEM READY");

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("ENTER PIN");
  display.setCursor(0, 35);
  display.println("TO UNLOCK");
  display.display();
}


void loop()
{
  // ================= PIN FIRST =================
char firstKey = keypad.getKey();

if (firstKey)
{
    if (firstKey >= '0' && firstKey <= '9')
    {
        String enteredPIN = "";
        enteredPIN += firstKey;

        display.clearDisplay();
        display.setTextSize(2);
        display.setCursor(0, 0);
        display.println("ENTER PIN");
        display.setCursor(0, 35);
        display.print("*");
        display.display();

        while (enteredPIN.length() < 6)
        {
            char key = keypad.getKey();

            if (key)
            {
                if (key >= '0' && key <= '9')
                {
                    enteredPIN += key;

                    display.print("*");
                    display.display();
                }
            }
        }

        if (verifyPin(enteredPIN))
        {
            accessGranted();
        }
        else
        {
            showMessage("WRONG PIN");

            Serial.println("WRONG PIN");

            digitalWrite(BUZZER_PIN, HIGH);
            delay(150);
            digitalWrite(BUZZER_PIN, LOW);
            delay(150);

            digitalWrite(BUZZER_PIN, HIGH);
            delay(150);
            digitalWrite(BUZZER_PIN, LOW);

            delay(1000);

            display.clearDisplay();
            display.setTextSize(2);
            display.setCursor(0, 0);
            display.println("ENTER PIN");
            display.setCursor(0, 35);
            display.println("TO UNLOCK");
            display.display();
        }

        return;
    }
}

}