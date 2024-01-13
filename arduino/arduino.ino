/*struct Position {
  float x;
  float y;
};

Position pivots[10];
10|1.25,0.32:42.23,423.42345
*/

void setup() {
  Serial.begin(9600);
}

void splitString(String input, char delimiter, String output[], int maxParts) {
    int partIndex = 0;
    int startIndex = 0;
    int endIndex;

    while ((endIndex = input.indexOf(delimiter, startIndex)) != -1) {
        if (partIndex >= maxParts - 1) break; // 配列のサイズを超えないようにする
        output[partIndex++] = input.substring(startIndex, endIndex);
        startIndex = endIndex + 1;
    }

    if (startIndex < input.length() && partIndex < maxParts) {
        output[partIndex++] = input.substring(startIndex);
    }
}

void loop() {
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');

    String parts[2];
    splitString(message, '|', parts, 2);
    int k = parts[0].toInt();
    float blackRate = 0;
    String pivotsText = parts[1];
    String pivotTexts[10];
    splitString(pivotsText, ':', pivotTexts, 10);

    for( int i = 0; i < 10; i++ ){
      String pivotText = pivotTexts[i];
      String positionText[2];
      splitString(pivotText, ',', positionText, 2);
      float x = positionText[0].toFloat();
      float y = positionText[1].toFloat();
      float length = 1 / pow(2, k);
      bool rb_in = pow(x, 2) + pow(y, 2) <= 1;
      bool lt_in = pow(x+length, 2) + pow(y+length, 2) <= 1;

      Serial.println(rb_in, lt_in);
      if( rb_in && lt_in ){
        float size = pow(length, 2);
        if( x == y ){
          blackRate += size;
        }else{
          blackRate += size * 2;
        }
      }else if( rb_in ){
        //境界
      }
    }

    Serial.println("blackRate: " + String(blackRate));
  }
}