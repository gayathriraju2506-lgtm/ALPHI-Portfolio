let funds = [];

const NAV_URL = "https://api.allorigins.win/raw?url=https://www.amfiindia.com/spages/NAVAll.txt";

// Fetch and parse NAV data
async function loadFunds() {
    const response = await fetch(NAV_URL);
    const data = await response.text();

    const lines = data.split("\n");

    lines.forEach(line => {
        const parts = line.split(";");
        if (parts.length > 4) {
            const fundName = parts[3];
            const nav = parseFloat(parts[4]);

            if (!isNaN(nav)) {
                funds.push({
                    name: fundName,
                    nav: nav
                });
            }
        }
    });

    populateDropdown();
}

function populateDropdown() {
    const select = document.getElementById("fundSelect");
    select.innerHTML = "";

    funds.forEach((fund, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = fund.name;
        select.appendChild(option);
    });
}

function calculateValue() {
    const selectedIndex = document.getElementById("fundSelect").value;
    const units = parseFloat(document.getElementById("units").value);

    if (isNaN(units)) {
        alert("Please enter valid units");
        return;
    }

    const fund = funds[selectedIndex];
    const value = fund.nav * units;

    document.getElementById("result").innerText =
        `Portfolio Value: ₹ ${value.toFixed(2)}`;
}

// Load data on start
loadFunds();
