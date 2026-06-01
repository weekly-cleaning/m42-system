// ⚠️ ลิงก์ CSV จาก Google Sheets ของคุณ
const sheet_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5QpU8KUCPKE8q-n47YpdDsfkjei8XfAFB0hYg-oQvXOp5IPDVF7pTGlpSFadelsv0NGINZ2iXXkEP/pub?output=csv'; 

async function fetchFinanceData() {
    try {
        const response = await fetch(sheet_url);
        const csvText = await response.text();
        
        const lines = csvText.split(/\r?\n/);
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const rows = lines.map(line => line.split(delimiter));
        
        // แถวที่ 2 (สรุปรวมยอดทั้งห้อง) [Index 1]
        const targetRow = rows[1]; 
        
        const cleanNum = (val) => {
            if (!val) return 0;
            let clean = val.replace(/[^0-9.-]/g, '');
            return parseFloat(clean) || 0;
        };

        if (targetRow && targetRow.length > 5) {
            // 🎯 ปรับ Index ให้ตรงกับ Google Sheets ล่าสุดของคุณเป๊ะ ๆ
            const incVal = cleanNum(targetRow[2]);  // คอลัมน์ C (ยอดเงินที่เก็บได้แล้ว)
            const expVal = cleanNum(targetRow[3]);  // คอลัมน์ D (ยอดรายจ่ายรวม)
            const netVal = cleanNum(targetRow[4]);  // คอลัมน์ E (ยอดเงินคงเหลือ)
            const unpVal = cleanNum(targetRow[5]);  // คอลัมน์ F (ยอดเงินที่ยังไม่ชำระ)

            // แสดงผลบนหน้าเว็บหลัก
            document.getElementById('net-balance').innerHTML = `${netVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span class="currency">THB</span>`;
            document.getElementById('total-income').innerText = `+ ${incVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
            document.getElementById('total-expense').innerText = `- ${expVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
            document.getElementById('unpaid-balance').innerHTML = `${unpVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <small>THB</small>`;
        }

        // ----------------------------------------------------
        // 1. รายละเอียดประวัติรายจ่าย (คอลัมน์ H และ I)
        // ----------------------------------------------------
        let expenseHTML = "";
        let hasExpense = false;

        for (let i = 2; i < rows.length; i++) {
            if (!rows[i] || rows[i].length < 9) continue;
            const itemTitle = rows[i][7] ? rows[i][7].trim() : ""; // คอลัมน์ H
            const itemPrice = rows[i][8] ? rows[i][8].trim() : ""; // คอลัมน์ I

            if (itemTitle !== "" && !itemTitle.includes("รายการรายจ่าย")) {
                const priceNum = cleanNum(itemPrice);
                expenseHTML += `
                    <div class="modal-log-item">
                        <span class="item-name">📌 ${itemTitle}</span>
                        <span class="item-price">-${priceNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.</span>
                    </div>
                `;
                hasExpense = true;
            }
        }
        if (!hasExpense) {
            expenseHTML = "<p style='text-align:center; color:#64748b;'>ยังไม่มีประวัติรายจ่ายในเทอมนี้</p>";
        }
        document.getElementById('expense-list').innerHTML = expenseHTML;

        // ----------------------------------------------------
        // 2. รายชื่อคนค้างชำระเงินห้อง (ดึงชื่อจาก คอลัมน์ A และ ยอดค้างจาก คอลัมน์ F)
        // ----------------------------------------------------
        let unpaidHTML = "";
        let hasUnpaid = false;

        for (let i = 2; i < rows.length; i++) {
            if (!rows[i] || rows[i].length < 6) continue;
            
            const studentName = rows[i][0] ? rows[i][0].trim() : ""; // คอลัมน์ A (ชื่อเพื่อน)
            const unpaidAmount = cleanNum(rows[i][5]);              // คอลัมน์ F (ยอดเงินที่ยังไม่ชำระรายคน)

            if (studentName !== "" && unpaidAmount > 0 && !studentName.includes("สรุปรวมทั้งห้อง")) {
                unpaidHTML += `
                    <div class="modal-log-item" style="border-left-color: #f5a623;">
                        <span class="item-name">👤 ${studentName}</span>
                        <span class="item-price" style="color: #f5a623;">ค้าง: ${unpaidAmount.toLocaleString('th-TH')} บ.</span>
                    </div>
                `;
                hasUnpaid = true;
            }
        }
        if (!hasUnpaid) {
            unpaidHTML = "<p style='text-align:center; color:#10b981; font-weight:bold;'>🎉 ยอดเยี่ยม! ทุกคนจ่ายเงินครบถ้วน ไม่มีคนค้างชำระ</p>";
        }
        document.getElementById('unpaid-list').innerHTML = unpaidHTML;
        
    } catch (error) {
        console.error('ระบบดึงข้อมูลผิดพลาด:', error);
    }
}

// ระบบเปิด-ปิด หน้าต่างป็อปอัป (Modal)
const expenseCard = document.getElementById('expense-card');
const expenseModal = document.getElementById('expense-modal');
const closeModal = document.getElementById('close-modal');

const unpaidCard = document.getElementById('unpaid-card');
const unpaidModal = document.getElementById('unpaid-modal');
const closeUnpaidModal = document.getElementById('close-unpaid-modal');

if (expenseCard && expenseModal && closeModal) {
    expenseCard.addEventListener('click', () => { expenseModal.classList.add('open'); });
    closeModal.addEventListener('click', () => { expenseModal.classList.remove('open'); });
}

if (unpaidCard && unpaidModal && closeUnpaidModal) {
    unpaidCard.addEventListener('click', () => { unpaidModal.classList.add('open'); });
    closeUnpaidModal.addEventListener('click', () => { unpaidModal.classList.remove('open'); });
}

window.addEventListener('click', (e) => {
    if (e.target === expenseModal) expenseModal.classList.remove('open');
    if (e.target === unpaidModal) unpaidModal.classList.remove('open');
});

fetchFinanceData();
