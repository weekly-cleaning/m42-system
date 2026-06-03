function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('บอร์ดข่าวสารประจำห้อง ม.4/2')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ฟังก์ชันส่งรายงานเวรและรูปภาพหลายรูปเข้า Telegram
function sendToTelegram(formData) {
  var token = "8664131894:AAH63X5-GjC8QkaIry-qvP5xwZ5IWgE-Nzo"; // Token บอทของคุณ
  var chatId = "-5269240224"; // ID กลุ่มของคุณ
  
  // 1. จัดหน้าข้อความเวรประจำวัน
  var message = "📝 [SMC-AI] รายงานการปฏิบัติหน้าที่ " + formData.day + "\n";
  message += "👤 ผู้ส่ง: " + formData.sender + "\n\n";
  
  message += "✅ มาทำเวร:\n" + (formData.present.length > 0 ? "• " + formData.present.join("\n• ") : "-\n");
  message += "\n🟡 ลา:\n" + (formData.leave.length > 0 ? "• " + formData.leave.join("\n• ") : "-\n");
  message += "\n❌ ไม่มาทำ (ขาด):\n" + (formData.absent.length > 0 ? "• " + formData.absent.join("\n• ") : "-\n");
  
  var now = new Date();
  var dateStr = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy");
  var timeStr = Utilities.formatDate(now, "GMT+7", "HH:mm:ss");
  
  message += "\n📅 วันที่: " + dateStr;
  message += "\n⏰ เวลา: " + timeStr + " น.";

  // 2. ตรวจสอบและสร้างชุดข้อมูล Media Group สำหรับส่งหลายรูป
  var mediaArray = [];
  var payload = { "chat_id": chatId };

  formData.images.forEach(function(base64Str, index) {
    var keyName = "photo_" + index;
    // แปลง Base64 เป็นไฟล์รูปภาพ (Blob)
    var imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Str), 'image/jpeg', keyName + '.jpg');
    
    // ใส่ไฟล์ลงใน Payload หลัก
    payload[keyName] = imageBlob;

    // สร้างโครงสร้างข้อกำหนดของแผงมีเดียใน Telegram
    var mediaItem = {
      "type": "photo",
      "media": "attach://" + keyName
    };
    
    // ใส่ข้อความสรุปไว้ที่รูปภาพรูปแรกสุดของอัลบั้ม
    if (index === 0) {
      mediaItem.caption = message;
    }
    
    mediaArray.push(mediaItem);
  });

  payload["media"] = JSON.stringify(mediaArray);

  // 3. ยิง API sendMediaGroup เข้า Telegram (ส่งแบบอัลบั้มกลุ่มรูปภาพ)
  var url = "https://api.telegram.org/bot" + token + "/sendMediaGroup";
  var options = {
    "method": "post",
    "payload": payload,
    "muteHttpExceptions": true
  };
  
  UrlFetchApp.fetch(url, options);
  
  return "ส่งรายงานพร้อมภาพถ่ายเข้ากลุ่มเรียบร้อยแล้ว!";
}
