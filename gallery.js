// গ্লোবাল ভেরিয়েবল
let galleryData = { gallery: [], videos: [] };
let currentTab = 'photo';
let currentCategory = 'all';
let currentYear = 'all';
let currentPage = 1;
const itemsPerPage = 10;
let currentFilteredList = []; 
let currentIndex = 0;

// ডাটা লোড করা (উভয় ফাইল থেকে ডাটা আনা)
document.addEventListener('DOMContentLoaded', () => {
    // image.json এবং video.json উভয় ফাইল থেকে ডাটা একসাথে লোড করা হচ্ছে
    const imageLoad = fetch('image.json').then(res => res.json());
    const videoLoad = fetch('video.json').then(res => res.json());

    Promise.all([imageLoad, videoLoad])
        .then(([imageData, videoData]) => {
            // ডাটাগুলোকে galleryData গ্লোবাল ভেরিয়েবলে নির্দিষ্ট জায়গায় রাখা
            galleryData.gallery = imageData.gallery || [];
            galleryData.videos = videoData.videos || [];

            // লোড হওয়ার পর ফাংশনগুলো রান করা
            generateCategoryFilters();
            updateYearFilters();
            renderGallery();
        })
        .catch(err => {
            console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
            // যদি কোনো একটি ফাইল মিসিং থাকে তবে অন্তত অন্যটি দেখানোর চেষ্টা
            grid.innerHTML = `<p style="text-align: center; padding: 50px;">ডাটা লোড করতে ব্যর্থ হয়েছে।</p>`;
        });
});

// ১. ডায়নামিক ক্যাটাগরি ফিল্টার তৈরি
function generateCategoryFilters() {
    const categoryList = document.getElementById('dynamic-categories');
    if (!categoryList) return;

    const categories = [...new Set(galleryData.gallery.map(item => item.category))];
    let catHtml = `<li class="active" onclick="filterCategory('all', this)">সবগুলো</li>`;
    categories.forEach(cat => {
        if(cat) catHtml += `<li onclick="filterCategory('${cat}', this)">${cat}</li>`;
    });
    categoryList.innerHTML = catHtml;
}

// ২. ক্যাটাগরি অনুযায়ী বছর আপডেট (আপনার চাহিদা অনুযায়ী ফিল্টার করা)
function updateYearFilters() {
    const yearContainer = document.getElementById('dynamic-years');
    if (!yearContainer) return;

    // বর্তমান ক্যাটাগরি অনুযায়ী ডাটা ফিল্টার করে বছর বের করা
    let items = currentCategory === 'all' 
        ? galleryData.gallery 
        : galleryData.gallery.filter(i => i.category === currentCategory);

    const years = [...new Set(items.map(i => i.year))].sort((a, b) => b - a);
    
    let yearHtml = `<button class="year-btn active" onclick="filterYear('all', this)">সবগুলো</button>`;
    years.forEach(y => {
        if(y) yearHtml += `<button class="year-btn" onclick="filterYear('${y}', this)">${y}</button>`;
    });
    yearContainer.innerHTML = yearHtml;
    
    // যদি আগের সিলেক্ট করা বছর নতুন লিস্টে না থাকে, তবে অল সেট করা
    if (currentYear !== 'all' && !years.includes(currentYear)) {
        currentYear = 'all';
    }
}

// ৩. মেইন রেন্ডার ফাংশন (পেজিনেশনসহ)
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    // ছবি অথবা ভিডিওর লিস্ট তৈরি
    if (currentTab === 'photo') {
        currentFilteredList = galleryData.gallery.filter(item => {
            return (currentCategory === 'all' || item.category === currentCategory) && 
                   (currentYear === 'all' || item.year === currentYear);
        });
    } else {
        currentFilteredList = galleryData.videos || [];
    }

    // পেজিনেশন হিসাব
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = currentFilteredList.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 50px;">কোনো তথ্য পাওয়া যায়নি।</p>`;
    }

    paginatedItems.forEach((item, index) => {
        const div = document.createElement('div');
        const globalIndex = start + index; // পুরো লিস্টের সাপেক্ষে ইনডেক্স

        if (currentTab === 'photo') {
            div.className = 'photo-card loading'; // লোডিং এনিমেশন ক্লাস
            div.innerHTML = `<img src="${item.url}" 
                             onload="this.parentElement.classList.remove('loading')" 
                             onclick="openLightbox(${globalIndex})">`;
        } else {
            div.className = 'video-card';
            const vidId = extractID(item.youtubeUrl);
            div.innerHTML = `
                <div class="video-box"><iframe src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe></div>
                <div class="video-info"><h4>${item.title}</h4></div>`;
        }
        grid.appendChild(div);
    });

    renderPagination();
}

function renderPagination() {
    let paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination';
        paginationContainer.className = 'pagination';
        document.querySelector('.content-area').appendChild(paginationContainer);
    }
    
    const totalPages = Math.ceil(currentFilteredList.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Arrow Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if(currentPage > 1) { currentPage--; renderGallery(); window.scrollTo({top: 300, behavior: 'smooth'}); }};
    paginationContainer.appendChild(prevBtn);

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.onclick = () => {
            currentPage = i;
            renderGallery();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        };
        paginationContainer.appendChild(btn);
    }

    // Next Arrow Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if(currentPage < totalPages) { currentPage++; renderGallery(); window.scrollTo({top: 300, behavior: 'smooth'}); }};
    paginationContainer.appendChild(nextBtn);
}


// --- gallery.js ---

// ১. লাইটবক্স ওপেন করার ফাংশন আপডেট
function openLightbox(index) {
    currentIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');

    // হিস্ট্রিতে একটি স্টেট পুশ করা (যাতে ব্যাক বাটন কাজ করে)
    window.history.pushState({ modalOpen: true }, "");

    if (!document.querySelector('.modal-controls')) {
        const controls = document.createElement('div');
        controls.className = 'modal-controls';
        controls.innerHTML = `
            <button class="nav-btn prev-btn" onclick="changeImg(-1, event)"><i class="fas fa-chevron-left"></i></button>
            <button class="nav-btn next-btn" onclick="changeImg(1, event)"><i class="fas fa-chevron-right"></i></button>
        `;
        modal.appendChild(controls);
    }
    
    modalImg.style.opacity = '0';
    modalImg.src = currentFilteredList[currentIndex].url;
    
    modalImg.onload = function() {
        modalImg.style.opacity = '1';
        modalImg.classList.add('loaded');
    };

    modal.style.display = "flex";
}

// ২. মোডাল বন্ধ করার ফাংশন (এটি আলাদা করে রাখা ভালো)
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === "flex") {
        modal.style.display = "none";
        // যদি ইউজার ক্রস বাটনে ক্লিক করে বন্ধ করে, তবে হিস্ট্রি থেকে স্টেট সরিয়ে ফেলা
        if (window.history.state && window.history.state.modalOpen) {
            window.history.back();
        }
    }
}

// ৩. ব্রাউজারের ব্যাক বাটন ইভেন্ট লিসেনার (সবচেয়ে গুরুত্বপূর্ণ)
window.onpopstate = function(event) {
    const modal = document.getElementById('imageModal');
    // যদি ব্যাক বাটন চাপা হয় এবং মোডাল খোলা থাকে, তবে শুধু মোডাল বন্ধ করো
    if (modal.style.display === "flex") {
        modal.style.display = "none";
    }
};

// ৪. এইচটিএমএল এর ক্লোজ বাটনে বা বাইরে ক্লিক করলে closeModal কল করা নিশ্চিত করুন
document.querySelector('.close').onclick = function() {
    closeModal();
};

// মোডালের বাইরে ক্লিক করলে বন্ধ হবে
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        closeModal();
    }
};

// ইমেজ পরিবর্তনের ফাংশন
function changeImg(step, event) {
    if(event) event.stopPropagation(); // মোডাল বন্ধ হওয়া আটকানো
    
    currentIndex += step;
    if (currentIndex < 0) currentIndex = currentFilteredList.length - 1;
    if (currentIndex >= currentFilteredList.length) currentIndex = 0;
    
    const modalImg = document.getElementById('modalImg');
    modalImg.style.opacity = '0';
    modalImg.src = currentFilteredList[currentIndex].url;
}

// ৬. ফিল্টার হ্যান্ডলার
function filterCategory(cat, el) {
    currentCategory = cat;
    currentPage = 1;
    document.querySelectorAll('#dynamic-categories li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    updateYearFilters();
    renderGallery();
}

function filterYear(year, el) {
    currentYear = year;
    currentPage = 1;
    document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    renderGallery();
}

function switchTab(tab, element) {
    currentTab = tab;
    currentPage = 1;

    // সব বাটন থেকে active ক্লাস সরানো
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // বর্তমান বাটনে active ক্লাস যোগ করা
    element.classList.add('active');

    // স্লাইডার মুভ করা
    const slider = document.getElementById('tab-slider');
    if (tab === 'photo') {
        slider.style.transform = 'translateX(0)';
    } else {
        // দ্বিতীয় বাটনের দূরত্বে সরিয়ে নেওয়া
        slider.style.transform = 'translateX(100%)';
    }

    // আগের ফিল্টার ও গ্রিড রেন্ডার ফাংশনগুলো কল করুন
    const sidebar = document.getElementById('sidebar');
    const yearFilter = document.getElementById('year-filter-container');
    
    if (tab === 'video') {
        if(sidebar) sidebar.style.display = 'none';
        if(yearFilter) yearFilter.style.display = 'none';
    } else {
        if(sidebar) sidebar.style.display = 'block';
        if(yearFilter) yearFilter.style.display = 'block';
    }

    renderGallery();
}

// ইউটিউব আইডি বের করা
function extractID(url) {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// কিবোর্ড সাপোর্ট
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === "flex") {
        if (e.key === "ArrowLeft") changeImg(-1);
        if (e.key === "ArrowRight") changeImg(1);
        if (e.key === "Escape") modal.style.display = 'none';
    }
});
// ৬. সাবস্ক্রিপশন ফর্ম (সংশোধিত)
const scriptURL = 'https://script.google.com/macros/s/AKfycbwZ8TqEirnXS5mEb0OjKYPh0mrayq6W5ssW5ScwF-KseoatGetpGuNI5j3Hr2LqzMSt/exec';
const subscriptionForm = document.getElementById('subscription-form');
const statusMsg = document.getElementById('status-message'); // এটি যোগ করা হয়েছে

if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', e => {
        e.preventDefault();
        const btn = subscriptionForm.querySelector('.subscribe-btn');
        const modal = document.getElementById('success-modal');

        // রিসেট স্টেট
        btn.innerHTML = "যাচাই করা হচ্ছে...";
        btn.disabled = true;
        if(statusMsg) statusMsg.style.display = 'none'; 

        fetch(scriptURL, { method: 'POST', body: new FormData(subscriptionForm)})
            .then(response => response.json())
            .then(data => {
                btn.disabled = false;
                btn.innerHTML = "সাবস্ক্রাইব";

                // যদি ইমেইল আগে থেকেই থাকে
                if(data.result === 'exists') {
                    if(statusMsg) {
                        statusMsg.style.display = 'flex'; // লাল সতর্কবার্তা দেখাবে
                    }
                } 
                // যদি নতুন সাবস্ক্রিপশন সফল হয়
                else if(data.result === 'success') {
                    if (modal) modal.style.display = 'flex'; // ধন্যবাদ পপ-আপ দেখাবে
                    subscriptionForm.reset();
                }
            })
            .catch(error => {
                btn.innerHTML = "আবার চেষ্টা করুন";
                btn.disabled = false;
                console.error('Error!', error.message);
            });
    });
}
// আপনার closeModal ফাংশন এবং অ্যাক্টিভ লিঙ্ক লজিক এভাবে গুছিয়ে লিখুন:

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.style.display = 'none';
} // এখানে ব্র্যাকেট শেষ করা জরুরি ছিল

document.addEventListener('DOMContentLoaded', () => {
    // ১. বর্তমান পেজের ফাইল নেম এবং URL প্যারামিটার বের করা
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const urlParams = new URLSearchParams(window.location.search);

    // ২. সব মেনু লিঙ্কগুলো ধরা
    const navLinks = document.querySelectorAll('.overlay-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // কন্ডিশন ১: সরাসরি ফাইল নেম মিলে গেলে
        if (linkPath === currentPath) {
            setActive(link);
        }
        // কন্ডিশন ২: ব্লগ ডিটেইলস পেজে থাকলে 'blogs.html' হাইলাইট
        else if (currentPath.includes('blog-details.html') && linkPath === 'blogs.html') {
            setActive(link);
        }
        // কন্ডিশন ৩: ডোনেশন ফর্মে থাকলে 'donation.html' হাইলাইট
        else if (currentPath.includes('donate-form.html') && linkPath === 'donation.html') {
            setActive(link);
        }
    });

    function setActive(el) {
        el.classList.add('active-link');
        el.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleMenu(); // মেনু বন্ধ করার জন্য
        });
    }
});
