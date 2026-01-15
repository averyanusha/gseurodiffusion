import Chart from "chart.js/auto";
import { validateForm } from "./formValidation.js";

const nav = document.getElementById('nav');
const header = document.getElementById('header');
const hamburgerButton = document.getElementById('mobile');
const ctx = document.getElementById('yearlyChart');
const sticky = nav.offsetTop;
const form = document.getElementById('form');
let searchQuery = document.querySelector('.search__input');
let searchResult = document.querySelector('.search__list');
let monthsChart;
let lastSearchResult = [];
const products = document.querySelectorAll('.product');
const productButtons = document.querySelectorAll('.product__button');
const cards = document.querySelectorAll('.card');
const closeButtons = document.querySelectorAll('.card__close');
const kabloButton = document.querySelector(".kablo__button");
const alcobreButton = document.querySelector(".alcobre__button");

fetchRateFromServer();

function clearSearch(resultsContainer) {
  if (!resultsContainer) {
    console.error('clearSearch: resultsContainer is undefined');
    return;
  }
  while (resultsContainer.firstChild) {
    resultsContainer.removeChild(resultsContainer.firstChild);
  }
  resultsContainer.style.display = 'none';
}

searchQuery.addEventListener("input", () => {
  const query = searchQuery.value.trim();
  if (query.length >= 2) {
    performSearch(query, searchResult);
  } else {
    clearSearch(searchResult);
    searchResult.style.display = "none";
    lastSearchResult = [];
  }
})

searchQuery.addEventListener("focus", () => {
  if(lastSearchResult.length > 0) {
    searchResult.style.display = "block";
  }
})

// Hide on outside click
document.addEventListener("click", (event) => {
  const isClickInside = searchQuery.contains(event.target) || searchResult.contains(event.target);
  if (!isClickInside) {
    searchResult.style.display = "none";
  }
});

async function performSearch(query, resultsContainer) {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    clearSearch(resultsContainer);

    if (data.error) {
      const li = document.createElement("li");
      li.className = "search__result";
      li.textContent = data.error;
      resultsContainer.appendChild(li);
      return;
    }

    if (!data.results || data.results.length === 0) {
      const li = document.createElement("li");
      li.className = "search__result";
      li.textContent = "Aucun résultat trouvé.";
      resultsContainer.appendChild(li);
      lastSearchResult = [];
      resultsContainer.style.display = "block";
      return;
    }

    data.results.forEach(result => {
      const li = document.createElement("li");
      li.className = "search__result";

      const a = document.createElement("a");
      a.href = result.url;
      a.textContent = result.title;
      a.className = "result-title";

      const preview = document.createElement("p");
      preview.textContent = result.preview;
      preview.className = "result-preview";

      li.appendChild(a);
      li.appendChild(preview);
      resultsContainer.appendChild(li);
    });

    lastSearchResult = data.results.slice();
    resultsContainer.style.display = "block";

  } catch (err) {

    console.error(err);

    clearSearch(resultsContainer);

    const li = document.createElement("li");
    li.className = "search__result";
    li.textContent = "Erreur serveur"
    resultsContainer.appendChild(li);


    lastSearchResult = [ { error: true, message: 'Erreur serveur'}];
    resultsContainer.style.display = "block";
  }
}
form.addEventListener("submit", validateForm);

// Scroll animation produits page 

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    };
  })
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  }
);

products.forEach(product => {
  observer.observe(product)
});

function isMobile (){
  return window.innerWidth <= 768;
}
const mobileSearchContainer = document.createElement('div');
mobileSearchContainer.classList.add('mobile-search');
const closeSearch = document.createElement('button');
closeSearch.classList.add('mobile-search__close');
closeSearch.textContent = 'x';
const mobileSearch = searchQuery.cloneNode(true);
const mobileSearchResults = searchResult.cloneNode(true);

mobileSearchContainer.appendChild(closeSearch);
mobileSearchContainer.appendChild(mobileSearch);
mobileSearchContainer.appendChild(mobileSearchResults);
header.appendChild(mobileSearchContainer);

function isMobileSearch (){
  if(!isMobile()) return
  const searchIcon = document.getElementById('search');
  
  toggleHandler([searchIcon, closeSearch], [mobileSearchContainer, mobileSearchContainer], { activeClass: 'show-search', closeClickOutside: true, onOpen: () => { mobileSearch.focus();},
  onClose: () => {
    mobileSearch.value = ''; // Clear input when closing
    clearSearch(mobileSearchResults);
  }
  });
  mobileSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length === 0) {
      clearSearch(mobileSearchResults); // Use it here!
      return;
    }
    
    clearTimeout(mobileSearch.searchTimeout);
    mobileSearch.searchTimeout = setTimeout(() => {
      performSearch(query, mobileSearchResults);
    }, 300);
  });

  // Close modal when clicking a search result
  mobileSearchResults.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mobileSearchContainer.classList.remove('show-search');
      mobileSearch.value = '';
      clearSearch(mobileSearchResults);
    }
  });
}


function isMobileLabels(labels) {
  if (!isMobile) return labels;
  return labels.map(label => {
  // "Janvier 2025" -> "Jan"
  const monthName = label.split(' ')[0];
  const monthAbbreviations = {
    'Janvier': 'Jan',
    'Fevrier': 'Fév',
    'Mars': 'Mar',
    'Avril': 'Avr',
    'Mai': 'Mai',
    'Juin': 'Juin',
    'Juillet': 'Juil',
    'Août': 'Aoû',
    'Septembre': 'Sep',
    'Octobre': 'Oct',
    'November': 'Nov',
    'Decembre': 'Déc'
  };
  return monthAbbreviations[monthName] || monthName.substring(0, 3);
});
}

isMobileSearch(); 

function toggleHandler(triggers, targets, options){
  const {
    activeClass = "show",
    onOpen = null,
    onClose = null,
    closeClickOutside = false
  } = options;

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = targets[index];
      const isActive = target.classList.contains(activeClass);
      if (isActive) {
        target.classList.remove(activeClass);
        if (onClose) onClose(index);
      } else {
        target.classList.add(activeClass);
        if(onOpen) onOpen(index);
      }
    })
  })

  if (closeClickOutside) {
    document.addEventListener('click', (e) => {
      targets.forEach((target, index) => {
        if (target.classList.contains(activeClass) && !target.contains(e.target) && !triggers[index].contains(e.target)){
          target.classList.remove(activeClass);
          if(onClose) onClose(index);
        }
      })
    })
  }
}

toggleHandler(productButtons, cards, {closeClickOutside: true, onOpen: (index) => {
    products.forEach(product => {
      product.classList.remove('visible');
      observer.unobserve(product);
  })}, onClose: (index) => {
      products.forEach(product => {
      product.classList.add('visible');
      observer.observe(product);
    });
  }
})

closeButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    cards[index].classList.remove('show');
    products.forEach(product => {
      product.classList.add('visible');
      observer.observe(product);
    });
  });
});

toggleHandler([hamburgerButton], [nav], {activeClass: 'show-menu', closeClickOutside: true, onOpen: (index) => {
  hamburgerButton.classList.add('active');
}, onClose: (index) => {
  hamburgerButton.classList.remove('active');
}});



window.addEventListener('scroll', () => {
  const isMobile = window.innerWidth <= 768;
  if(!isMobile) {
    if (window.scrollY > 0) {
      nav.classList.add('sticky')
    } else {
      nav.classList.remove('sticky');
    }
  } else {
    nav.classList.remove('sticky');
  }

  if (isMobile && nav.classList.contains('show-menu')) {
    nav.classList.remove('show-menu');
    hamburgerButton.classList.remove('active');
  }
})

// The page for rate of copper


async function fetchRateFromServer() {
  let rateHeader = document.querySelector('#rateHeader a');
  let ratePage = document.getElementById("rate");
  try {
    const response = await fetch("/exchange-rate");
    if (!response.ok) {
      throw new Error (`HTTP Error, status: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data.data === 'number') {
      const displayRate = (data.data);
      if (rateHeader) {
        rateHeader.textContent = `${displayRate.toFixed(2)} eur/Ton`;
      }
      if (ratePage) {
        ratePage.textContent = `${displayRate.toFixed(2)} EUR/TONNE`;
      }
    } else {
        console.error("[script.js] Invalid rate data received:", data);
    }
  } catch (error) {
    console.error("Couldnt fetch the data", error);
  }
}

async function fetchYearlyRates() {
  try {
    const response = await fetch("/exchange-rate/last-12-months");
    if (!response.ok) {
      throw new Error(`HTTP errror! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data && Array.isArray(data.labels) && Array.isArray(data.rates)) {
      const convertedRates = data.rates.map(rate => rate ? parseFloat(rate.toFixed(2)) : null);
      yearlyChart(data.labels, convertedRates);
    } else {
      console.error("Invalid data structure for yearly rates:", data);
    }
  } catch (error) {
    console.error("Erreur de chargement des données:", error);
  }
}

function yearlyChart (labels, fetchedData) {
  if (monthsChart) {
    monthsChart.destroy();
  }
  const mobile = isMobile();
  const mobileLabels = isMobileLabels(labels);
  monthsChart = new Chart(ctx, {
    type: 'line',
    data: {
      backgroundColor: '',
      labels: mobileLabels.reverse(),
      datasets: [{
        label: mobile ? 'Prix EUR/Ton' : `Prix d'une tonne de cuivre au cours de la dernière année`,
        backgroundColor: '#2C5499',
        data: fetchedData.reverse(),
        fill: false,
        tension: 0.1,
        pointRadius: mobile ? 3 : 5,
        pointHoverRadius: mobile ? 6 : 8
      }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Allow canvas to resize freely
        plugins: {
          legend: {
            display: !mobile,
            position: 'top',
            labels: {
                color: '#333' // Legend text color
            },
            font: {
              size: mobile ? 10 : 12
            }
          },
          tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y) + '/Ton';
                    }
                    return label;
                }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: '#666',
              font: {
                size: mobile ? 10 : 12
              },
              callback: function(value) {
                return mobile 
                  ? `${(value / 1000).toFixed(1)}k €` 
                  : `${value.toFixed(0)} €`;
              }
            },
            title: {
              display: !mobile,
              text: 'Prix (EUR/Ton)',
              color: '#333',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
  });
}

fetchYearlyRates();

if (kabloButton) {
  kabloButton.addEventListener('mouseenter', () => {
    kabloButton.classList.add('show-kablo', 'hide-text');
  });
  kabloButton.addEventListener('mouseleave', () => {
    kabloButton.classList.remove('show-kablo', 'hide-text');
  });
}

if (alcobreButton) {
  alcobreButton.addEventListener('mouseenter', () => {
    alcobreButton.classList.add('show-alcobre', 'hide-text');
  });
  alcobreButton.addEventListener('mouseleave', () => {
    alcobreButton.classList.remove('show-alcobre', 'hide-text');
  });
}