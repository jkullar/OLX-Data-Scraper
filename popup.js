document.getElementById("scrape").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: startScraping
    });
});

// Function to initiate scraping
function startScraping() {
    let allData = []; // Local array to store scraped data

    const scrapeData = () => {
        console.log("Scraping data...");

        const items = document.querySelectorAll('li[data-aut-id="itemBox3"]'); // Select the list items

        items.forEach(item => {
            const url = item.querySelector('a')?.href; // Get the URL
            const price = item.querySelector('span[data-aut-id="itemPrice"]')?.innerText; // Get the price
            const itemDetails = item.querySelector('span[data-aut-id="itemDetails"]')?.innerText; // Get item details
            const description = item.querySelector('span[data-aut-id="itemTitle"]')?.innerText; // Get item description
            const location = item.querySelector('span[data-aut-id="item-location"]')?.innerText; // Get item location

            // Only add if URL is present
            if (url) {
                allData.push([url, price, itemDetails, description, location]);
            }
        });

        console.log(`Captured ${allData.length} items so far.`); // Log the number of items captured

        // Check if there's a "Load More" button and click it to load more items
        const loadMoreButton = document.querySelector('button[data-aut-id="btnLoadMore"]');
        if (loadMoreButton) {
            console.log("Clicking 'Load More' button.");
            loadMoreButton.click(); // Click the "Load More" button to load additional items

            // Use a timeout to allow more items to load before scraping again
            setTimeout(scrapeData, 2000); // Call the function again after a delay
        } else {
            console.log("No 'Load More' button found or no more items to load. Saving data...");
            saveData(allData); // Save data when all items have been captured
        }
    };

    // Function to save data to an Excel file
    const saveData = (data) => {
        // Create a new workbook and add the data
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "OLX Data");

        // Generate a download link and trigger it
        XLSX.writeFile(wb, "olx_data.xlsx");
    };

    scrapeData(); // Start the scraping process
}
