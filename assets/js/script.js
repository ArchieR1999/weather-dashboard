function initPage() {
    const cityEl = document.getElementById("enter-city");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const nameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    const historyEl = document.getElementById("history");
    const fivedayEl = document.getElementById("fiveday-header");
    const todayweatherEl = document.getElementById("today-weather");
    const canadianCities = [
        "Winnipeg", "Montreal", "Toronto", "Vancouver", 
        "Quebec City", "Saint John", "Calgary", "Thunder Bay"
    ];
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    
    // Assigning a unique API to a variable
    const APIKey = "c63a93e45c0ff05d91fd8b5708787d12";

    function getWeather(cityName) {
        // Execute a current weather get request from open weather api
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        axios.get(queryURL)
            .then(function (response) {
                todayweatherEl.classList.remove("d-none");
                // Parse response to display current weather
                const currentDate = new Date(response.data.dt * 1000);
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                let weatherPic = response.data.weather[0].icon;
                currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentPicEl.setAttribute("alt", response.data.weather[0].description);
                currentTempEl.innerHTML = "Temperature: " + k2c(response.data.main.temp) + " &#176C"; // Celsius
                currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                currentWindEl.innerHTML = "Wind Speed: " + k2k(response.data.wind.speed) + " KM"; // Kilometers
                
                // Get UV Index
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function (response) {
                        let UVIndex = document.createElement("span");
                        if (response.data[0].value < 4) {
                            UVIndex.setAttribute("class", "badge badge-success");
                        } else if (response.data[0].value < 8) {
                            UVIndex.setAttribute("class", "badge badge-warning");
                        } else {
                            UVIndex.setAttribute("class", "badge badge-danger");
                        }
                        UVIndex.innerHTML = response.data[0].value;
                        currentUVEl.innerHTML = "UV Index: ";
                        currentUVEl.append(UVIndex);
                    });
                
                // Get 5-day forecast for this city
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        fivedayEl.classList.remove("d-none");
                        // Parse response to display forecast for next 5 days
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (let i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);
                            
                            // Icon for current weather
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2c(response.data.list[forecastIndex].main.temp) + " &#176C"; // Celsius
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    });
            })
            .catch(function () {
                alert("Invalid city name. Please try again.");
            });
    }

    function k2c(K) {
        return Math.floor(K - 273.15);
    }

    function k2k(mph) {
        return Math.floor(mph * 1.60934); // Convert miles to kilometers
    }

    // Get history from local storage if any
    searchEl.addEventListener("click", function () {
        const searchTerm = cityEl.value.trim();
        if (searchTerm) {
            getWeather(searchTerm);
            if (!searchHistory.includes(searchTerm)) {
                searchHistory.push(searchTerm);
                localStorage.setItem("search", JSON.stringify(searchHistory));
                renderSearchHistory();
            }
        }
    });

    // Clear History button
    clearEl.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    });

    function renderSearchHistory() {
        historyEl.innerHTML = "";
        
        // Create buttons for existing Canadian cities
        canadianCities.forEach(city => {
            const cityButton = document.getElementById(city.toLowerCase().replace(" ", "-"));
            cityButton.addEventListener("click", function () {
                getWeather(city);
            });
        });

        // Create buttons for searched cities from history
        searchHistory.forEach(city => {
            const historyButton = document.createElement("button");
            historyButton.innerHTML = city;
            historyButton.classList.add("btn", "btn-secondary", "mb-3", "w-100");
            historyButton.addEventListener("click", function () {
                getWeather(city);
            });
            historyEl.append(historyButton);
        });
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}

initPage();
