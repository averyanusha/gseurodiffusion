import dotenv from "dotenv";
dotenv.config();
const MY_API_KEY = process.env.MY_API_KEY;
let cachedDailyRate = null;
let cachedCurrentDate = null;

let cachedEurToUsd = null;
let cachedEurToUsdDate = null; 

let cachedMonthlyRate = null;
let cachedMonthlyDateMarker = null;

let cachedCalendarRate = {};

const TROY_OZ_PER_TONNE = 31150.75;

// export async function getEurToUsdExchangeRate() {
//   const today = new Date();
//   const todayDateString = today.toISOString().split("T")[0];
//   if (cachedEurToUsd !== null && cachedEurToUsdDate === todayDateString) {
//     return cachedEurToUsd;
//   }

//   try {
//     const url = `https://api.metalpriceapi.com/v1/latest?api_key=${METALPRICE_API_KEY}&base=USD&currencies=EUR`;
//     const response = await fetch (url, {mode: 'cors'});
//     if (!response.ok) {
//       console.error(`API response for EUR to USD is not OK`, response.status, response.statusText);
//       throw new Error(`API response error: ${response.status}`);
//     }
//     const data = await response.json();
//     console.log(data)
//     if (data && data.rates && typeof data.rates.EUR === 'number'){
//       cachedEurToUsd = data.rates.EUR;
//       cachedEurToUsdDate = todayDateString;
//       console.log(`Fetched and cached new rate ${cachedEurToUsd}`)
//       return cachedEurToUsd;
//     }  else {
//         console.error("[getEurToUsdExchangeRate] Invalid response format from API:");
//         throw new Error("Invalid API response format for current rate.");
//     }
//   } catch (error) {
//     console.error("Error in the getEurToUsdExchangeRate");
//     cachedEurToUsd = null;
//     return null;
//   }
// }

export async function getCurrentExchangeRate(){
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const todayDateString = today.toISOString().split("T")[0];
      // const yesterday = new Date(today);
      // yesterday.setDate(today.getDate() - 1);
      // const yesterdayDateString = yesterday.toISOString().split("T")[0];

      // const dayOfTheWeek = today.getDay();
      if (cachedDailyRate !== null && cachedCurrentDate === todayDateString) {
        return cachedDailyRate;
      } else {
          try {
            const url = `https://api.metalpriceapi.com/v1/latest?api_key=${MY_API_KEY}&base=EUR&currencies=XCU`;
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
              console.error(`API response not OK for ${today}:`, response.status, response.statusText);
              throw new Error(`API response error: ${response.status}`);
            }
            const data = await response.json();
            if(data && data.rates.XCU && typeof data.rates.XCU === 'number'){
              const pricePerTroyOz = data.rates.XCU;
              const pricePerTonne = pricePerTroyOz * TROY_OZ_PER_TONNE;
            cachedDailyRate = Math.round(pricePerTonne * 100) / 1000; // Round to 2 decimals
            cachedCurrentDate = todayDateString;
            console.log("Calculated EUR/tonne:", cachedDailyRate);
            return cachedDailyRate;
            } else {
                console.error("[getCurrentExchangeRate] Invalid response format from API:");
                throw new Error("Invalid API response format for current rate.");
            }
          } catch (error) {
            console.error("Error in getCurrentExchangeRate:", error);
            return { cachedDailyDate: null }; // Return nulls on overall failure
          }
        }
    }

export function generateLast12Months() {
  const today = new Date();
  const monthsNames = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","November","Decembre"];
  let apiDates = [];
  let labels = [];
  for (let i = 0; i < 12; i++){
    const date = new Date(today.getFullYear(), today.getMonth() - i, 15);
    const month = date.getMonth();
    const year = date.getFullYear();
    const label = `${monthsNames[month]} ${year}`;
    labels.push(label);
    const apiMonth = String(month + 1).padStart(2, '0'); // +1 because months are 0-indexed, padstart adds 0 to ensure the month is 2 digits 
    const apiDate = `${year}-${apiMonth}-01`;
    apiDates.push(apiDate);
  }
  return {labels, apiDates};
}

export async function getMonthsRates(){
  const today = new Date();
  const currentMonthYear = `${today.getFullYear()}, ${today.getMonth()}`;

  if(cachedMonthlyRate !== null && cachedMonthlyDateMarker === currentMonthYear) {
    return cachedMonthlyRate;
  }
  let monthlyData = [];
  let {labels, apiDates} = generateLast12Months();
  for (const dateString of apiDates){
    try {
      const url = `https://api.metalpriceapi.com/v1/${dateString}?api_key=${MY_API_KEY}&base=EUR&currencies=XCU`;
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      if (data && data.rates && typeof data.rates.XCU === 'number') {
        const pricePerTroyOz = data.rates.XCU;
        const pricePerTonne = Math.round(pricePerTroyOz * TROY_OZ_PER_TONNE) * 100 / 1000;
        monthlyData.push(pricePerTonne);
      } else {
        console.warn(`[getMonthsRates] No valid rate data for ${dateString}, pushing null.`);
        monthlyData.push(null);
      }
    }
    catch (error) {
      console.error(`Error fetching data for ${today}:`, error);
      monthlyData.push(null);
    }
  }
  cachedMonthlyRate = { labels, rates: monthlyData };
  cachedMonthlyDateMarker = currentMonthYear; 
  console.log("[getMonthsRates] Fetched and cached new monthly data:", cachedMonthlyRate);
  return cachedMonthlyRate;
}

// export function generateDates (start, end){
//   const calendarDates = []
//   const current = new Date(start);
//   while (current <= end) {
//     const apiDate = current.toISOString().split('T')[0];
//     calendarDates.push(apiDate);
//     current.setDate(current.getDate() + 1);
//   }
//   return calendarDates;
// }

function* dateRange(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    yield new Date(d);
  }
}

export async function getCalendarRates(startDateStr, endDateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const result = {};
  const uncachedDates = [];

  const allDates = [];
  for (const d of dateRange(startDateStr, endDateStr)) {
    d.setHours(0,0,0,0);
    if (d > today) continue;
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const ds = d.toISOString().slice(0,10);
    allDates.push(ds);
    if (cachedCalendarRate[ds] !== undefined) {
      result[ds] = cachedCalendarRate[ds];
    } else {
      uncachedDates.push(ds);
    }
  }

  if (uncachedDates.length === 0) 
    return result;

  const uncachedDatesStart = uncachedDates[0];
  const uncachedDatesEnd = uncachedDates[uncachedDates.length - 1];

  const url = `https://api.metalpriceapi.com/v1/timeframe?api_key=${MY_API_KEY}&start_date=${uncachedDatesStart}&end_date=${uncachedDatesEnd}&base=EUR&currencies=XCU&`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MetalPrice API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const rates = data?.rates || {};

  for (const ds of uncachedDates) {
    if (rates[ds] && typeof rates[ds].XCU === "number"){
      const pricePerTroyOz = 1 / rates[ds].XCU;
      const pricePerTonne = Math.round(pricePerTroyOz * TROY_OZ_PER_TONNE) * 100 / 100;
      cachedCalendarRate[ds] = pricePerTonne;
      result[ds] = pricePerTonne;
    } else {
      cachedCalendarRate[ds] = null;
      result[ds] = null;
    }
  }

  return result; // { '2025-08-01': 4.17, ... } USD/lb
}

// export async function getCalendarRates(dates) {
//   const calendarRates = {};
//   const uncachedDates = [];

//   for (const date of dates) {
//     if (cachedCalendarRate[date]) {
//       calendarRates[date] = cachedCalendarRate[date];
//     } else {
//       uncachedDates.push(date);
//     }
//   }

//   if (uncachedDates.length === 0) return calendarRates;

//   const sorted = uncachedDates.slice().sort();
//   const start_date = sorted[0];
//   const end_date = sorted[sorted.length - 1];

//   try {
//     const url = `https://api.metalpriceapi.com/v1/timeframe?api_key=${MY_API_KEY}&base=USD&currencies=XCU&start_date=${start_date}&end_date=${end_date}`;
//     const response = await fetch(url, { mode: 'cors' });
//     if (!response.ok) {
//       throw new Error(`API Error: ${response.statusText}`);
//     }
//     const data = await response.json();
//     const rates = data?.rates
//     if (!rates || typeof rates !== "object") {
//       throw new Error('Invalid or missing rates in API response');
//     }
//     for (const date of uncachedDates) {
//       if(rates[date] && typeof rates[date].XCU === "number") {
//         calendarRates[date] = rates[date].XCU;
//         cachedCalendarRate[date] = rates[date].XCU;
//       } else {
//         calendarRates[date] = null;
//       }
//     }
//     console.log("[getCurrentExchangeRate] Raw API response:", data);
//   } catch (err) {
//       console.error(`[getCalendarRates] Error`, err);
//       for (const date of uncachedDates) {
//         calendarRates[date] = null;
//       }
//     }
//   return calendarRates;
// }