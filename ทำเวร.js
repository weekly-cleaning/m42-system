// ข้อมูลรายชื่อเวรแต่ละวัน ม.4/2
const dutyData = {
    1: { day: "วันจันทร์", names: ["นายวิศรุต แขมคำ (จูเนียร์)", "นางสาวศุพัสษร นิลดวง (เก้า)", "นายจิรสิน วิทยารักษ์ (ขันติ)", "นายพงศกร ไชยรักษ์ (ออม)", "นางสาวจิราพัชร ผิวอ่อน (เห็ดหอม)", "นายวรินทร อัมพร (พร้อม)", "นายพัฒนศักดิ์ กองทุ่งมน (คริสตัล)"] },
    2: { day: "วันอังคาร", names: ["นางสาวนภัสวรรณ จงกลศรี (นิว)", "นางสาวอพินญา เตียวระสิงห์ (ยิ้ม)", "นางสาวสุพิชชา บุญอ่วม (ขวัญข้าว)", "นางสาวธวัลรัตน์ เป็นมงคล (ออก้า)", "นางสาวปาลิตา บุญด้วง (กิ๊บ)", "นางสาวปริยาภัทร วงศ์จีน (แฮคกี้)"] },
    3: { day: "วันพุธ", names: ["นายเจริญวัฒน์ สีบัว (ยอด)", "นายกวีวัธน์ บัวทอง (ไบเบิ้ล)", "นายชยพรรธน์ สุราราษฎร์ (เจา)", "นายธนาธิป วิริยะกูล (อั่งเปา)", "นายภัทรกร เทียมใสย (แมมมอธ)", "นายนพรุจ จันทร์ทรง (กีต้าร์)"] },
    4: { day: "วันพฤหัสบดี", names: ["นางสาวญาณิศา ชุมนุม (น้ำพั้น)", "นางสาวปิยะรัตน์ ภูมี (น้ำใส)", "นางสาวกาญจนา สิตวัน (กิ๊บ)", "นายฐิติวัฒน์ บุญศรี (ต๊ะ)", "นางสาวญาณิดา มุกดาวัฒนกิจ (เคท)"] },
    5: { day: "วันศุกร์", names: ["นางสาววรัญญา อุทัยศรี (ปุ๋ย)", "นางสาวปริณดา นาคประโคน (เนตร)", "นางสาวอัญรินทร์ วงษาชัย (แพรวา)", "นางสาวจิรัชยา ดาพันธ์ (แองเจิ้ล)", "นางสาวภัทรวดี ผ่องศรี (ใบเฟิร์น)", "นางสาวประภาวรรณ สุตาวงศ์ (ภา)", "นายบวรพจน์ ยืนสุข (อาชิ)"] }
};

const today = new Date().getDay();
const dutyListBody = document.getElementById('duty-list');

// สร้างแถวรายชื่อพร้อมสถานะ 3 แบบ
if (today >= 1 && today <= 5) {
    const currentDuty = dutyData[today];
    let html = "";
    currentDuty.names.forEach((name, index) => {
        html += `
        <tr class="fade-in-up" style="animation-delay: ${index * 0.1}s">
            <td><strong>${name}</strong></td>
            <td>
                <div class="status-group">
                    <label class="status-option label-present">
                        <input type="radio" name="status-${index}" value="มา" checked> <span>มา</span>
                    </label>
                    <label class="status-option label-leave">
                        <input type="radio" name="status-${index}" value="ลา"> <span>ลา</span>
                    </label>
                    <label class="status-option label-absent">
                        <input type="radio" name="status-${index}" value="ขาด"> <span>ขาด</span>
                    </label>
                    <input type="hidden" class="student-name" value="${name}">
                </div>
            </td>
        </tr>`;
    });
    dutyListBody.innerHTML = html;
} else {
    dutyListBody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:20px; color:#94a3b8;">🎉 วันนี้ไม่มีเวรครับ พักผ่อนให้เต็มที่!</td></tr>`;
}

async function sendReport() {
    const name = document.getElementById('senderName').value;
    const photoFiles = document.getElementById('photoInput').files;
    const statusDiv = document.getElementById('status');
    
    const token = "8664131894:AAH63X5-GjC8QkaIry-qvP5xwZ5IWgE-Nzo"; 
    const chatId = "-5269240224"; 

    if (!name || photoFiles.length === 0) {
        alert("กรุณาระบุชื่อผู้รายงานและแนบรูปภาพด้วยครับ");
        return;
    }

    let present = [];
    let leave = [];
    let absent = [];

    const rows = document.querySelectorAll('.status-group');
    rows.forEach((group, index) => {
        const studentName = group.querySelector('.student-name').value;
        const status = group.querySelector(`input[name="status-${index}"]:checked`).value;
        
        if (status === "มา") present.push(studentName);
        else if (status === "ลา") leave.push(studentName);
        else if (status === "ขาด") absent.push(studentName);
    });

    statusDiv.innerText = "กำลังทำงาน: กำลังส่งรายงานเข้ากลุ่ม...";
    statusDiv.style.color = "#00b894";

    // อัปเดตหัวข้อหัวรายงานให้ระบุ SMC-AI ชัดเจน
    let reportText = `📝 [SMC-AI] รายงานการปฏิบัติหน้าที่ ม.4/2\n`;
    reportText += `👤 ผู้ส่ง: ${name}\n\n`;
    reportText += `✅ มาทำเวร:\n\t${present.length > 0 ? present.join('\n\t') : '-'}\n\n`;
    reportText += `🟡 ลา:\n\t${leave.length > 0 ? leave.join('\n\t') : '-'}\n\n`;
    reportText += `❌ ไม่มาทำ (ขาด):\n\t${absent.length > 0 ? absent.join('\n\t') : '-'}\n\n`;
    reportText += `📅 วันที่: ${new Date().toLocaleDateString('th-TH')}\n`;
    reportText += `⏰ เวลา: ${new Date().toLocaleTimeString('th-TH')}`;

    const formData = new FormData();
    formData.append('chat_id', chatId);

    const media = [];
    for (let i = 0; i < photoFiles.length; i++) {
        const fileId = `img_${i}`;
        formData.append(fileId, photoFiles[i]);
        media.push({
            type: 'photo',
            media: `attach://${fileId}`,
            caption: i === 0 ? reportText : ''
        });
    }

    formData.append('media', JSON.stringify(media));

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            statusDiv.innerText = "สำเร็จ: ส่งรายงานเรียบร้อย";
            statusDiv.style.color = "#00b894";
            
            const popup = document.getElementById('custom-popup');
            popup.classList.add('active');
            
            setTimeout(() => {
                popup.classList.remove('active');
                location.reload();
            }, 3000);

        } else {
            statusDiv.innerText = "เกิดข้อผิดพลาด: ไม่สามารถส่งข้อมูลได้";
            statusDiv.style.color = "#ff7675";
        }
    } catch (error) {
        statusDiv.innerText = "เกิดข้อผิดพลาด: การเชื่อมต่อล้มเหลว";
        statusDiv.style.color = "#ff7675";
    }
}
