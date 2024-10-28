let allData = [];
const loggedInWorkerId = localStorage.getItem('loggedInWorkerId');

// Function to fetch data from Google Sheets using Apps Script URL
function fetchDataFromGoogleSheets(sheetName, spreadsheetId, scriptUrl) {
    const url = `${scriptUrl}?sheetName=${encodeURIComponent(sheetName)}&spreadsheetId=${spreadsheetId}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                console.warn('No data found for the requested sheet:', sheetName);
                return []; // Return an empty array if no data is found
            }

            const headers = data[0];
            const rowData = data.slice(1).map(row => {
                const rowObject = {};
                headers.forEach((header, index) => {
                    rowObject[header] = row[index];
                });
                return rowObject;
            });
            return rowData;
        })
        .catch(error => {
            console.error('Error fetching data from Google Sheets:', error);
            return [];
        });
}

function renderTable(data, tableHeadId, tableBodyId) {
    const tableHead = document.getElementById(tableHeadId);
    const tableBody = document.getElementById(tableBodyId);

    // Clear previous table data
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (data.length > 0) {
        const headers = Object.keys(data[0]);

        // Create header row
        const headerRow = document.createElement('tr');
        const thField = document.createElement('th');
        thField.textContent = 'Field';
        headerRow.appendChild(thField);

        // Create column headers for each record, labeled Record 1, Record 2, etc.
        data.forEach((_, index) => {
            const th = document.createElement('th');
            th.textContent = `Record ${index + 1}`;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);

        // Populate each row with a field name and values across records
        headers.forEach((header) => {
            const rowElement = document.createElement('tr');

            // Field name column
            const th = document.createElement('th');
            th.textContent = header;
            rowElement.appendChild(th);

            // Populate values for this field across each record
            data.forEach((row, index) => {
                const td = document.createElement('td');

                // Check if the field is a date
                if (header.toLowerCase().includes('date') && row[header]) {
                    const dateValue = new Date(row[header]);

                    // Check if conversion to date is valid
                    if (!isNaN(dateValue.getTime())) {
                        // Check if we are on the first column (index 0) and the fourth row (index 3)
                        if (index === 4) { // Fourth row (index 3)
                            dateValue.setDate(dateValue.getDate() - 1); // Subtract one day
                        }
                        td.textContent = dateValue.toLocaleDateString(); // Display only the date part
                    } else {
                        td.textContent = row[header]; // Display as-is if invalid date
                    }
                } else {
                    td.textContent = row[header] || ''; // Display the field's value or empty if undefined
                }

                rowElement.appendChild(td);
            });

            // Append each row to the table body
            tableBody.appendChild(rowElement);
        });
    }
}



function filterData(data) {
    return data.filter(row => row['EMP CODE'] === loggedInWorkerId);
}

function loadSheetData(type) {
    let selectedSheet;
    let tableHeadId, tableBodyId;
    let selectedSpreadsheetId;
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwpKsC8Y9jKofYftX3TfpIwxWFyeDMAOj7LXo4h17Jqhcok-fm0oTgfhR2gMd7GInv4Xg/exec';

    switch (type) {
        case 'attendance':
            selectedSpreadsheetId = '1icO4rsduRQBH1M5XkFQz-44ZPWdsl6om3AObbMdFr50';
            selectedSheet = document.getElementById('attendance-sheet-select').value;
            tableHeadId = 'attendance-table-head';
            tableBodyId = 'attendance-table-body';
            break;
        case 'piecerate':
            selectedSpreadsheetId = '1DYMw087ZAIt3YXyWE3lAv9UoD4dUbHA9OAY98PTayqM';
            const selectedMonth = document.getElementById('piecerate-sheet-select').value;
            const selectedMachine = document.getElementById('worker-combo-select').value;

            // Ensure both month and machine are selected before proceeding
            if (selectedMonth && selectedMachine) {
                selectedSheet = `${selectedMonth}_${selectedMachine}`;
            } else {
                alert("Please select both Month and Machine.");
                return;
            }

            tableHeadId = 'piecerate-table-head';
            tableBodyId = 'piecerate-table-body';

            // Filter data for the selected month
            fetchDataFromGoogleSheets(`${selectedMonth}_${selectedMachine}`, selectedSpreadsheetId, scriptUrl).then(data => {
                const filteredData = data.filter(row => {
                    const rowDate = new Date(row['Date']); // Assuming 'Date' column exists
                    const selectedMonthIndex = parseInt(selectedMonth) - 1; // Adjust for 0-based indexing
                    return rowDate.getMonth() === selectedMonthIndex;
                });

                allData = filterData(filteredData);
                renderTable(allData, tableHeadId, tableBodyId);
            });
            break;
        case 'workingIncentive':
            selectedSpreadsheetId = '1oh2HWWZvlv0uUixtrAAKOQ4iU8MpmBlC8TCahozMyJA';
            selectedSheet = document.getElementById('working-incentive-sheet-select').value;
            tableHeadId = 'working-incentive-table-head';
            tableBodyId = 'working-incentive-table-body';
            break;
    }

    if (selectedSheet.trim()) {
        fetchDataFromGoogleSheets(selectedSheet, selectedSpreadsheetId, scriptUrl).then(data => {
            allData = filterData(data);
            renderTable(allData, tableHeadId, tableBodyId);
        });
    
    }
}

function showAttendance() {
    document.getElementById('attendance-container').style.display = 'block';
    document.getElementById('piecerate-container').style.display = 'none';
    document.getElementById('working-incentive-container').style.display = 'none';
    loadSheetData('attendance');
}

function showPiecerate() {
    document.getElementById('attendance-container').style.display = 'none';
    document.getElementById('piecerate-container').style.display = 'block';
    document.getElementById('working-incentive-container').style.display = 'none';
    loadSheetData('piecerate');
}

function showWorkingIncentive() {
    document.getElementById('attendance-container').style.display = 'none';
    document.getElementById('piecerate-container').style.display = 'none';
    document.getElementById('working-incentive-container').style.display = 'block';
    loadSheetData('workingIncentive');
}