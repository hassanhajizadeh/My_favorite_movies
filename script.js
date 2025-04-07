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
const img_path = 'https://image.tmdb.org/t/p/w1280'
//---------------------------------------------------------------------------
//variables
const items_container = document.getElementById('item-container');
const search_suggestions = document.getElementById('search-suggestion');
const search = document.getElementById('search');
let current_discover_page = 1;
let current_upcoming_page = 1;
let current_top_rated_page = 1;

//---------------------------------------------------------------------------
//templates
function insert_data_to_item_template(img_src,name ,date,vote,overview){
    return `<div class="item">
        <img src="${img_src}" alt="" width="180px" heigh="220px">
        <h3>${name}</h3>
        <h4>${date}</h4>
        <div class="movie-rating">${vote}</div>
        <div class="movie-overview">${overview}</div>
    </div>
    `;
}

function insert_data_to_search_template(img_src,name,date){
    return `<div class="search-item">
                <h4>${name} (${date})</h4>
                <img src="${img_src}" alt="" width="100px" height="auto">
            </div>
            `;
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
        console.log(data);
        data.results.forEach(item => {
            result+=insert_data_to_item_template(img_path+item.poster_path , item.title ,item.release_date.split('-')[0] , Math.round(item.vote_average*10)/10, item.overview );
        });
    }
    catch(error){
        result = error;
    }
    items_container.innerHTML = result;
}

//---------------------------------------------------------------------------

async function get_suggestions(name){
    try{
        search_suggestions.innerHTML = '<div class=loading>Loading . . . </div>';
        const response = await fetch(search_url+name.split(' ').join('+'),options);
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        result = '';
        data.results.forEach(item =>{
            result+=insert_data_to_search_template(img_path+item.poster_path,item.title , item.release_date.split('-')[0]);
        })
    }
    catch(error){
        result = error;
    }
    search_suggestions.innerHTML = result;
    const search_items = document.querySelectorAll('.search-item');
    search_items.forEach(search_item => search_item.addEventListener('click',));
}

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
    console.log(tabs);
    tabs.forEach((tab,idx) => {
        if(idx !=num)
            tab.classList.remove('active');
        else
            tab.classList.add('active');
    });
}

function show_discover(){
    highlight_tap(0);
    show_items(discover_url(current_discover_page));
}

function show_top_rated(){
    highlight_tap(1);
    show_items(top_rated_url(current_top_rated_page));


}
function show_upcoming(){
    highlight_tap(2);
    show_items(upcoming_url(current_upcoming_page));
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
    else{
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

//-----------------------------------------------------------------------------
function no_back_option(){
    show_alert(`You're on the first page — there is no back option available on this page`);
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
