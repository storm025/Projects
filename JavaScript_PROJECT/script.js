const API_URL = "http://www.omdbapi.com/?apikey=26adbf44"; // Replace with your API Key
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieResults = document.getElementById("movieResults");
const favorites = document.getElementById("favorites");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

let currentPage = 1;
let totalPages = 1;
let currentQuery = "";

// Load Favorites from Local Storage
let favoriteMovies = JSON.parse(localStorage.getItem("favorites")) || [];

document.addEventListener("DOMContentLoaded", () => {
  displayFavorites();
});

// Fetch Movies with Pagination
async function fetchMovies(query, page = 1) {
  try {
    const response = await fetch(`${API_URL}&s=${query}&page=${page}`);
    const data = await response.json();

    if (data.Response === "True") {
      totalPages = Math.min(5, Math.ceil(data.totalResults / 10)); // Limit max pages to 5
      displayMovies(data.Search);
      updatePaginationButtons();
    } else {
      movieResults.innerHTML = `<p>No movies found for "${query}".</p>`;
      prevPageBtn.style.display = "none";
      nextPageBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// Display Movies in the Results Section
function displayMovies(movies) {
  movieResults.innerHTML = "";
  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Poster}', '${movie.Year}')">Add to Favorites</button>
    `;
    movieResults.appendChild(movieCard);
  });
}

// Add Movie to Favorites
function addToFavorites(id, title, poster, year) {
  if (!favoriteMovies.some((movie) => movie.id === id)) {
    favoriteMovies.push({ id, title, poster, year });
    localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
    displayFavorites();
  }
}

// Display Favorites
function displayFavorites() {
  favorites.innerHTML = "";
  favoriteMovies.forEach((movie) => {
    const favoriteCard = document.createElement("div");
    favoriteCard.classList.add("movie-card");
    favoriteCard.innerHTML = `
      <img src="${movie.poster !== "N/A" ? movie.poster : "placeholder.jpg"}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
      <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
    `;
    favorites.appendChild(favoriteCard);
  });
}

// Remove Movie from Favorites
function removeFromFavorites(id) {
  favoriteMovies = favoriteMovies.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
  displayFavorites();
}

// Update Pagination Buttons
function updatePaginationButtons() {
  prevPageBtn.style.display = currentPage > 1 ? "inline-block" : "none";
  nextPageBtn.style.display = currentPage < totalPages ? "inline-block" : "none";
}

// Search Button Click Event
searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  if (currentQuery) {
    currentPage = 1;
    fetchMovies(currentQuery, currentPage);
  }
});

// Pagination Button Click Events
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(currentQuery, currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies(currentQuery, currentPage);
  }
});
