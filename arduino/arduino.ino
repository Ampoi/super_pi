void setup() {
  // シリアル通信を開始
  Serial.begin(9600);
}

void loop() {
  // シリアルポートからデータが利用可能かチェック
  if (Serial.available() > 0) {
    // メッセージを読み取る
    String message = Serial.readStringUntil('\n');
    
    // メッセージをシリアルモニターに表示
    Serial.println("Received: " + message);
  }
}