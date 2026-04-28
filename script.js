const funds = [];

const NAV_URL = "/api/nav";

const fundSelect = document.getElementById("fundSelect");
const unitsInput = document.getElementById("units");
const resultEl = document.getElementById("result");
const calcBtn = document.getElementById("calcBtn");

function setStatus(message, isError = false) {
    resultEl.textContent = message;
    resultEl.className = isError ? "error" : "";
}

async function loadFunds() {
    try {
        calcBtn.disabled = true;
        setStatus("Loading latest NAV data...");

        const response = await fetch(NAV_URL);

        if (!response.ok) {
            throw new Error(`Data request failed with status ${response.status}`);
        }

        const data = await response.text();

        const source = response.headers.get("X-NAV-Data-Source");
        if (source === "fallback") {
            setStatus("Live NAV feed is unavailable. Using fallback sample data.", true);
        }
        const lines = data.split("\n");

        lines.forEach((line) => {
            const parts = line.split(";");

            if (parts.length > 4) {
                const fundName = parts[3]?.trim();
                const nav = Number.parseFloat(parts[4]);

                if (fundName && Number.isFinite(nav)) {
                    funds.push({ name: fundName, nav });
                }
            }
        });

        if (funds.length === 0) {
            throw new Error("No fund data could be parsed from the AMFI feed.");
        }

        populateDropdown();
        calcBtn.disabled = false;

        if (response.headers.get("X-NAV-Data-Source") !== "fallback") {
            setStatus("Data loaded. Enter units to calculate portfolio value.");
        }
    } catch (error) {
        setStatus(
            "Unable to load live NAV data right now. Please try again in a minute.",
            true,
        );

        if (error?.message) {
            console.error(`NAV load failed: ${error.message}`);
        }
        console.error(error);
    }
}

function populateDropdown() {
    fundSelect.innerHTML = "";

    funds.forEach((fund, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = fund.name;
        fundSelect.appendChild(option);
    });
}

function calculateValue() {
    const selectedIndex = Number.parseInt(fundSelect.value, 10);
    const units = Number.parseFloat(unitsInput.value);

    if (!Number.isFinite(units) || units <= 0) {
        setStatus("Please enter units greater than 0.", true);
        return;
    }

    const fund = funds[selectedIndex];
    if (!fund) {
        setStatus("Please select a valid fund.", true);
        return;
    }

    const value = fund.nav * units;
    setStatus(`Portfolio Value: ₹ ${value.toFixed(2)}`);
}

calcBtn.addEventListener("click", calculateValue);
loadFunds();
