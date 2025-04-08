//API and API-URLS
const discover_url = (pageNumber) =>`https://api.themoviedb.org/3/discover/movie?page=${pageNumber}&sort_by=popularity.desc`;
const top_rated_url = (pageNumber) =>`https://api.themoviedb.org/3/movie/top_rated?page=${pageNumber}`;
const upcoming_url = (pageNumber) =>`https://api.themoviedb.org/3/movie/upcoming?page=${pageNumber}`;
const search_url = 'https://api.themoviedb.org/3/search/movie?query='
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDg2YTgyZTZkZjNhOGNhNzQyMzYwYjUyYzA2MzRkYSIsIm5iZiI6MTc0Mzg3MDM4MS41MjQ5OTk5LCJzdWIiOiI2N2YxNTlhZGVkZThkODJmM2JhZDdhODMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2M5ohhca-v1-j-KIeR3zC45J8_Vp-UbwDum23OZqLfc'
  }
};
const img_path = 'https://image.tmdb.org/t/p/w780';
//---------------------------------------------------------------------------
//variables
const items_container = document.getElementById('item-container');
const search_suggestions = document.getElementById('search-suggestion');
const search = document.getElementById('search');
const ham_btn = document.getElementById('ham-btn');
const menu = document.getElementById('menu');
let ham_menu_is_open = false;
let current_discover_page = 1;
let current_upcoming_page = 1;
let current_top_rated_page = 1;
const favorites = new Set(JSON.parse(sessionStorage.getItem('favorites') || '[]'));


//---------------------------------------------------------------------------
ham_btn.addEventListener('click',function(){
    if(ham_menu_is_open){
        close_ham_menu();
    }
    else{
        open_ham_menu();
    }
    ham_menu_is_open = !ham_menu_is_open;
});

function open_ham_menu(){
    ham_btn.children[0].style.position = "absolute";
    ham_btn.children[2].style.position = "absolute";
    ham_btn.children[1].style.width = "0";
    ham_btn.children[0].style.transform = "rotateZ(45deg)";
    ham_btn.children[2].style.transform = "rotateZ(-45deg)";
    menu.style.display = 'flex';
    menu.classList.add('open');
}

function close_ham_menu(){
    ham_btn.children[0].style.transform = "rotateZ(0deg)";
    ham_btn.children[1].style.width = "35px";
    ham_btn.children[2].style.transform = "rotateZ(0deg)";
    ham_btn.children[0].style.position = "static";
    ham_btn.children[2].style.position = "static";
    menu.style.display = 'none';
    menu.classList.remove('open');
}

//---------------------------------------------------------------------------
//templates
function insert_data_to_item_template(img_src, name, date, vote, overview, id) {
    return `<div class="item" id="${id}">
        <img src="${img_src}" alt="" width="200px" height="250px">
        <h3>${name}</h3>
        <h4>${date}</h4>
        <div class="movie-rating">${vote}</div>
        <button onclick="toggle_favorite(this)">
            <i class="fa-solid fa-heart-circle-plus fa-2xl ${favorites.has(String(id))?'active-favorite':''}"></i>
        </button>
        <div class="movie-overview">${overview}</div>
    </div>`;
}

// Generate the search result HTML
function insert_data_to_search_template(img_src, name, date) {
    return `<div class="search-item">
        <h4>${name} (${date})</h4>
        <img src="${img_src}" alt="" width="100px" height="auto">
    </div>`;
}

// Toggle favorite based on movie ID
function toggle_favorite(buttonElem) {
    const id = buttonElem.parentElement.id;
    const icon = buttonElem.querySelector('i');
    icon.classList.toggle('active-favorite');
    favorites.has(id)?favorites.delete(id):favorites.add(id);
    sessionStorage.setItem('favorites', JSON.stringify([...favorites]));
}
//---------------------------------------------------------------------------
async function show_items(url){
    try{
        items_container.innerHTML = '<div class=loading>Loading . . . </div>';
        const response  = await fetch(url , options);
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json();
        result = '';
        data.results.forEach(item => {
            result+=insert_data_to_item_template(
                img_path+item.poster_path ,
                item.title ,item.release_date.split('-')[0] ,
                Math.round(item.vote_average*10)/10,
                item.overview ,
                item.id );
        });
    }
    catch(error){
        result = error;
    }
    items_container.innerHTML = result;
}

//---------------------------------------------------------------------------

async function get_suggestions(name) {
    try {
        search_suggestions.innerHTML = '<div class="loading">Loading . . . </div>';
        const response = await fetch(search_url + name.split(' ').join('+'), options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        result = '';
        data.results.forEach(item => {
            result += insert_data_to_search_template(
                img_path + item.poster_path,
                item.title,
                item.release_date.split('-')[0]);
        });
        search_suggestions.innerHTML = result;

        const search_items = document.querySelectorAll('.search-item');
        search_items.forEach((search_item, idx) => {
            search_item.addEventListener('click', () => {
                show_selected_item(data.results[idx]);
            });
        });
    } catch (error) {
        search_suggestions.innerHTML  = error;
    }
}

function show_selected_item(item) {
    const result = insert_data_to_item_template(
        img_path + item.poster_path,
        item.title,
        item.release_date.split('-')[0],
        Math.round(item.vote_average * 10) / 10,
        item.overview,
        item.id
    );
    items_container.innerHTML = result;
}

document.addEventListener('click', (event) => {
    if (!search_suggestions.contains(event.target) && !search.contains(event.target) ) {
        hide_suggestions();
    }
});

//-----------------------------------------------------------------------------
function hide_suggestions(){
    search_suggestions.style.display = 'none';
}
function show_suggestions(){
    search_suggestions.style.display = 'block';
}
search.addEventListener('keydown' , function(event){
    if(event.key == 'Enter'){
        show_suggestions_in_items();
    }
})
function show_suggestions_in_items(){
    show_items(search_url+search.value.trim());
    search_suggestions.style.display = 'none';
    highlight_tap(0);
}
//----------------------------------------------------------------------------

function highlight_tap(num){
    const tabs = document.querySelectorAll('#menu li');
    tabs.forEach((tab,idx) => {
        if(idx !=num)
            tab.classList.remove('active');
        else
            tab.classList.add('active');
    });
}

function show_discover(){
    show_buttons();
    highlight_tap(0);
    show_items(discover_url(current_discover_page));
}

function show_top_rated(){
    show_buttons();
    highlight_tap(1);
    show_items(top_rated_url(current_top_rated_page));
}
function show_upcoming(){
    show_buttons();
    highlight_tap(2);
    show_items(upcoming_url(current_upcoming_page));
}
async function show_favorites() {
    remove_buttons();
    highlight_tap(3);
    items_container.innerHTML = '<div class="loading">Loading favorites...</div>';
    let result = '';

    for (const id of favorites) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const item = await response.json();

            result += insert_data_to_item_template(
                img_path + item.poster_path,
                item.title,
                item.release_date.split('-')[0],
                Math.round(item.vote_average * 10) / 10,
                item.overview,
                item.id
            );
        } catch (error) {
            console.error(`Error fetching favorite with ID ${id}:`, error);
        }
    }

    items_container.innerHTML = result || '<p>No favorites yet.</p>';
}



//-----------------------------------------------------------------------------

function Next(){
    const tab = document.querySelector('.active');
    console.log(tab.innerText);
    if(tab.innerText=='Discover'){
        current_discover_page++;
        show_discover();
    }
    else if(tab.innerText == 'Top Rated'){
        current_top_rated_page++;
        show_top_rated();
    }
    else if(tab.innerText == 'Up Coming'){
        current_upcoming_page++;
        show_upcoming();
    }
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function Back(){
    const tab = document.querySelector('.active');
    console.log(tab.innerText);
    if(tab.innerText=='Discover'){
        if(current_discover_page!=1){
            current_discover_page--;
            show_discover();
        }
        else no_back_option();
    }
    else if(tab.innerText == 'Top Rated'){
        if(current_top_rated_page!=1){
            current_top_rated_page--;
            show_top_rated();
        }
        else no_back_option();
    }
    else{
        if(current_upcoming_page!=1){
            current_upcoming_page--;
            show_upcoming();
        }
        else no_back_option();
    }
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function remove_buttons(){
    document.getElementById('buttons').style.display= 'none';
}
function show_buttons(){
    document.getElementById('buttons').style.display= 'flex';
}

//-----------------------------------------------------------------------------
function no_back_option(){
    show_alert(`You're on the first page — there is no back option available on this page`);
}
function no_next_option(){
    show_alert(`You're on the last page — there is no next option available on this page`);
}
//-----------------------------------------------------------------------------
function show_alert(message,alert_type='warning'){
    const alert = document.getElementById('alert');
    const alert_message = document.getElementById('alert-message');
    alert_message.innerHTML = message;
    if(alert_type=='error'){
        alert.style.borderLeftColor = 'red';
    }
    else if(alert_type == 'success'){
        alert.style.borderLeftColor = 'green';
    }
    alert.style.transform = 'translateX(0)';
}
//-----------------------------------------------------------------------------
show_items(discover_url(current_discover_page),options);
