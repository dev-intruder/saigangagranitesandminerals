// =============================================
// SAI GANGA GRANITES — Google Apps Script
// Paste this entire code into Google Apps Script
// and deploy as a Web App (see instructions)
// =============================================

function doGet(e) {
    try {
        var action = e && e.parameter && e.parameter.action;
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // ---------- GET ENQUIRIES ----------
        if (action === 'getEnquiries') {
            var sheet = ss.getActiveSheet();
            var data = sheet.getDataRange().getValues();
            if (data.length <= 1) {
                return jsonResponse({ status: 'success', data: [] });
            }
            var headers = ['timestamp', 'name', 'phone', 'email', 'product', 'message'];
            var rows = [];
            for (var i = 1; i < data.length; i++) {
                var row = {};
                for (var j = 0; j < headers.length; j++) {
                    row[headers[j]] = data[i][j] ? String(data[i][j]) : '';
                }
                rows.push(row);
            }
            rows.reverse();
            return jsonResponse({ status: 'success', data: rows });
        }

        // ---------- GET SETTINGS (prices) ----------
        if (action === 'getSettings') {
            var settingsSheet = getOrCreateSettingsSheet(ss);
            var val = settingsSheet.getRange('B1').getValue();
            if (val) {
                return jsonResponse({ status: 'success', settings: JSON.parse(val) });
            }
            return jsonResponse({ status: 'success', settings: null });
        }

        return jsonResponse({ status: 'error', message: 'Unknown action' });

    } catch (err) {
        return jsonResponse({ status: 'error', message: err.toString() });
    }
}

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // ---------- SAVE SETTINGS (prices) ----------
        if (data.action === 'saveSettings') {
            var settingsSheet = getOrCreateSettingsSheet(ss);
            settingsSheet.getRange('A1').setValue('prices');
            settingsSheet.getRange('B1').setValue(JSON.stringify(data.settings));
            settingsSheet.getRange('C1').setValue(new Date().toLocaleString());
            return jsonResponse({ status: 'success' });
        }

        // ---------- SAVE ENQUIRY (contact form) ----------
        var sheet = ss.getActiveSheet();
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Granite Type', 'Message']);
            sheet.getRange(1, 1, 1, 6).setFontWeight('bold')
                .setBackground('#d4a017').setFontColor('#ffffff');
            sheet.setFrozenRows(1);
        }
        sheet.appendRow([
            data.timestamp || new Date().toLocaleString(),
            data.name || '',
            data.phone || '',
            data.email || '',
            data.product || '',
            data.message || ''
        ]);
        return jsonResponse({ status: 'success' });

    } catch (err) {
        return jsonResponse({ status: 'error', message: err.toString() });
    }
}

// ---- Helper: get or create Settings sheet ----
function getOrCreateSettingsSheet(ss) {
    var sheet = ss.getSheetByName('Settings');
    if (!sheet) {
        sheet = ss.insertSheet('Settings');
        sheet.getRange('A1').setValue('prices');
        sheet.getRange('B1').setValue('');
        sheet.getRange('C1').setValue('Last Updated');
        sheet.getRange(1, 1, 1, 3).setFontWeight('bold')
            .setBackground('#1a1d27').setFontColor('#d4a017');
    }
    return sheet;
}

function jsonResponse(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// Test function — run this once manually to verify sheet access
function testSetup() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow(['TEST', 'Test User', '9999999999', 'test@test.com', 'Black Pearl', 'This is a test.']);
    Logger.log('Test row added successfully!');
}
