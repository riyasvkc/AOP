const scriptUrl = 'https://script.google.com/macros/s/AKfycbx6AVn-xqp-7vp4MH_u4_kOFYczqxU14i1cEDIfoYg_JNwAaRChFm0U0-_FGQSIRzaZWg/exec'; // Replace with your script URL

// Function to fetch data from Google Sheets using the script URL
function fetchDataFromGoogleSheets(sheetName) {
    const url = `${scriptUrl}?sheetName=${sheetName}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.values || data.values.length === 0) {
                console.error('No data found or data is undefined:', data);
                return []; // Return an empty array if no data is found
            }
            return data.values;
        })
        .catch(error => {
            console.error('Error fetching data from Google Sheets:', error);
            return [];
        });
}

function login() {
    const workerId = "VKCWP" + document.getElementById('login-worker-id').value.trim();
    const name = document.getElementById('login-name').value.trim();

    fetchDataFromGoogleSheets('Employee').then(data => {
        console.log('Employee Data:', data); // Log all fetched employee data

        // Log inputs to verify
        console.log('Entered Worker ID:', workerId);
        console.log('Entered Mobile No:', name);

        // Ensure keys match the exact structure in fetched data
        const user = data.find(row => {
            // Log each row to verify its structure
            console.log('Checking row:', row);
            
            // Convert all comparison values to strings and trim them
            return (row['EMP CODE'].toString().trim() === workerId) && (row['MOBILE No'].toString().trim() === name);
        });

        if (user) {
            console.log('User found:', user); // Log the matched user
            localStorage.setItem('loggedInWorkerId', workerId);
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            alert('Invalid EMP Code or Password');
        }
    });
}

