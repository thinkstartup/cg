
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123) {
     return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
     return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
     return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
     return false;
    }

    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)){
     return false;
    }      
 }

document.addEventListener('DOMContentLoaded', function() {
    const cacheKey = 'userCertificates';
    const cacheExpiry = 12 * 60 * 60 * 1000; // 12 hours
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlzZ-d8uLuIMRzCefWUsxUjS8W5CCLPjG7Ssmi-UzN00ZL7fHSEB-r0RseD1mMojo0rnH_ycjyuOZj/pub?output=csv';
    const certificateDir = 'certificates/'; // Directory where certificates are stored

    // Function to fetch and cache data
    const fetchAndCacheData = async () => {
        try {
            const response = await fetch(googleSheetURL);
            const csvData = await response.text();
            const data = parseCSV(csvData);
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
            console.log('Data fetched and cached:', data);
            return data;
        } catch (error) {
            console.error('Error fetching the CSV data:', error);
            return null;
        }
    };

    // Function to get cached data
    const getCachedData = () => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheExpiry) {
                console.log('Using cached data:', data);
                return data;
            } else {
                console.log('Cache expired');
                localStorage.removeItem(cacheKey);
            }
        } else {
            console.log('No cached data found');
        }
        return null;
    };

    // Function to parse CSV data
    const parseCSV = (csvData) => {
        const rows = csvData.split('\n').map(row => row.split(','));
        console.log('Parsed CSV Data:', rows);
        return rows.slice(1); // Remove header row
    };

    // Function to validate the user by name and UID
    const validateUser = (data, name, uid) => {
        // Validate based on name (column 1) and UID (column 3)
        return data.find(row => row[0].trim().toLowerCase() === name.trim().toLowerCase() && row[2].trim() === uid);
    };

    // Function to generate the certificate
    const generateCertificate = (name, school, certificateFileName, textColor) => {
        const canvas = document.getElementById('certificate-canvas');
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.src = `${certificateDir}${certificateFileName}`; // Load the certificate template from the local directory
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            // Set font properties
            ctx.font = 'bold 60px Charm, cursive';
            ctx.fillStyle = textColor;  // Use the dynamic text color
            ctx.textAlign = 'center';

            // Render the name and school name on the certificate
            ctx.fillText(name, canvas.width / 2, 1100);
            ctx.fillText(school, canvas.width / 2, 1325);

            // Trigger certificate download
            const link = document.createElement('a');
            link.download = 'certificate.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    };

    // Form submit event listener
    document.getElementById('certificate-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const school = document.getElementById('school').value;
        const workshop = document.getElementById('workshop').value;
        const uid = document.getElementById('uid').value;

        console.log('Form Submitted:', { name, school, workshop, uid });

        // Load cached data or fetch new data
        let data = getCachedData();
        if (!data) {
            data = await fetchAndCacheData();
        }

        // Validate user by name and UID
        const user = validateUser(data, name, uid);
        if (!user) {
            alert('You are not authorized to download the certificate.');
            return;
        }

        // Determine the certificate file based on the workshop
        let certificateFileName = '';
        let textColor = '';  // Variable for dynamic text color

        switch(workshop) {
            case 'Workshop1':
                certificateFileName = user[3]?.trim(); // Workshop1 certificate file in the 4th column
                // textColor = '#ffffff';  // White text for Workshop1
                break;
            case 'Workshop2':
                certificateFileName = user[4]?.trim(); // Workshop2 certificate file in the 5th column
                // textColor = '#000000';  // Black text for Workshop2
                break;
            case 'Workshop3':
                certificateFileName = user[5]?.trim(); // Workshop3 certificate file in the 6th column
                // textColor = '#ffffff';  // Black text for Workshop3
                break;
            case 'Workshop4':
                certificateFileName = user[6]?.trim(); // Workshop4 certificate file in the 7th column
                // textColor = '#000000';  // Black text for Workshop4
                break;
            case 'Workshop5':
                certificateFileName = user[7]?.trim(); // Workshop5 certificate file in the 8th column
                // textColor = '#000000';  // Black text for Workshop5
                break;
            case 'Workshop6':
                certificateFileName = user[8]?.trim(); // Workshop5 certificate file in the 9th column
                // textColor = '#000000';  // Black text for Workshop5
                break;
            case 'Workshop7':
                certificateFileName = user[9]?.trim(); // Workshop5 certificate file in the 10th column
                // textColor = '#000000';  // Black text for Workshop5
                break;
            default:
                alert('Invalid workshop selected.');
                return;
        }

        // Check if certificateFileName is either undefined, null, or an empty string
        if (!certificateFileName) {
            alert('No certificate found for this workshop.');
            return;
        }

        console.log('Selected Workshop:', workshop);
        console.log('Certificate File Name:', certificateFileName);
        console.log('Text Color:', textColor);

        generateCertificate(name, school, certificateFileName, textColor);
    });

    // Initialize
    async function init() {
        const cachedData = getCachedData();
        if (!cachedData) {
            await fetchAndCacheData();
        }
    }

    init();
});
