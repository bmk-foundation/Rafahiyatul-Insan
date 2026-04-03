    // --- ১. নেভবার হাইড/শো লজিক ---
let lastScrollY = window.scrollY;
let scrollDistance = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    // ১. নিচে স্ক্রল করলে হাইড হবে (১৫০ পিক্সেল পার হওয়ার পর)
    if (delta > 0 && currentScrollY > 100) {
        navbar.classList.add("navbar--hidden");
        scrollDistance = 20; // নিচে যাওয়ার সময় ডিস্ট্যান্স রিসেট
    } 
    
    // ২. উপরে স্ক্রল করার সময় লজিক
    else if (delta < -5) { // অন্তত ১০ পিক্সেল উপরে টান দিলে হিসাব শুরু হবে
        scrollDistance += Math.abs(delta);
        
        // অন্তত ৬০ পিক্সেল উপরে স্ক্রল করলে অথবা পেজের একদম টপে থাকলে শো হবে
        if (scrollDistance > 60 || currentScrollY < 100) {
            navbar.classList.remove("navbar--hidden");
        }
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// --- ২. মেনু টগল লজিক ---
function toggleMenu() {
    const overlay = document.getElementById('navOverlay');
    overlay.classList.toggle('active');

    // মেনু যখন খোলা থাকবে তখন পেজ স্ক্রল হবে না (Modern Touch)
    if(overlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

//_____________________________\\    
        // ৬টি নির্দিষ্ট ক্যাটাগরি এবং তাদের প্রাথমিক ইমেজ
        const categories = [
            { 
                name: "সাধারণ তহবিল", 
                img: "images/regular.webp",
                desc: "জরুরি মানবিক সহায়তা ও ত্রাণ কার্যক্রম পরিচালনার জন্য আমাদের সাধারণ তহবিল।"
            },
            { 
                name: "শিক্ষা সহায়তা", 
                img: "images/Edu-assist.webp",
                desc: "মেধাবী ও অভাবী শিক্ষার্থীদের উচ্চশিক্ষা নিশ্চিত করতে আমাদের এই প্রকল্প।"
            },
            { 
                name: "চিকিৎসা তহবিল", 
                img: "images/Treatment.webp",
                desc: "অসহায় রোগীদের সুচিকিৎসা ও ব্যয়বহুল অপারেশনে সহায়তা প্রদান।"
            },
            { 
                name: "এতিম কল্যাণ", 
                img: "images/Orphan.webp",
                desc: "এতিম শিশুদের নিরাপদ আশ্রয়, উন্নত খাবার ও সুশিক্ষা নিশ্চিতকরণ।"
            },
            { 
                name: "বৃক্ষরোপণ কর্মসূচি", 
                img: "images/tree-plantation.webp",
                desc: "পরিবেশ রক্ষায় দেশব্যাপী লক্ষ লক্ষ ফলদ ও বনজ বৃক্ষরোপণ কর্মসূচি।"
            },
            { 
                name: "অসহায় ও দরিদ্র কল্যাণ", 
                img: "images/poor.webp",
                desc: "কুরবানী প্রজেক্ট ও স্বাবলম্বীকরণ কার্যক্রমের মাধ্যমে দারিদ্র্য বিমোচন।"
            }
        ];

        const grid = document.getElementById('activitiesGrid');

        // কার্ড রেন্ডার করা
        categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'activity-card';
            card.onclick = () => openDetails(cat.name, cat.img);

            card.innerHTML = `
                <div class="image-wrapper">
                    <img src="${cat.img}" alt="${cat.name}">
                </div>
                <div class="card-content">
                    <span class="card-tag"><i class="fas fa-bullhorn"></i> নিয়মিত কার্যক্রম</span>
                    <h3>${cat.name}</h3>
                    <p>${cat.desc}</p>
    <a href="javascript:void(0)" class="view-details">বিস্তারিত দেখুন</a>
                </div>
            `;
            grid.appendChild(card);
        });

        // ডিটেইলস পেজে যাওয়ার সময় ডাটা সেভ করা
        function openDetails(name, img) {
            // localStorage এ সেভ করা হচ্ছে যাতে ডিটেইলস পেজে গিয়ে হিরো সেকশন বানানো যায়
            localStorage.setItem('selected_category_name', name);
            localStorage.setItem('selected_category_img', img);
            
            // ডিটেইলস পেজে নেভিগেট করা
            window.location.href = 'activity-details.html';
        }
 //_____________________________\\
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

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    // ১. বর্তমান পেজের ফাইল নেম বের করা
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    
    // ২. সব মেনু লিঙ্কগুলো ধরা
    const navLinks = document.querySelectorAll('.overlay-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // কন্ডিশন ১: যদি সরাসরি ফাইল নেম মিলে যায় (যেমন: index.html, gallery.html)
        if (linkPath === currentPath) {
            setActive(link);
        }

        // কন্ডিশন ২: যদি ব্লগ ডিটেইলস পেজে থাকে, তবে 'blogs.html' হাইলাইট হবে
        if (currentPath.includes('blog-details.html') && linkPath === 'blogs.html') {
            setActive(link);
        }

        // কন্ডিশন ৩: যদি ডোনেশন ফরম পেজে থাকে, তবে 'donation.html' হাইলাইট হবে
        if (currentPath.includes('donate-form.html') && linkPath === 'donation.html') {
            setActive(link);
        }

        // কন্ডিশন ৪: যদি কার্যক্রম ডিটেইলস (activity-details.html) পেজে থাকে, তবে 'activities.html' হাইলাইট হবে
        if (currentPath.includes('activity-details.html') && linkPath === 'activities.html') {
            setActive(link);
        }
    });

    // অ্যাক্টিভ ক্লাস বসানো এবং ক্লিক বন্ধ করার ফাংশন
    function setActive(el) {
        el.classList.add('active-link');
        el.addEventListener('click', (e) => {
            // মেনু খোলা থাকলে বন্ধ করার জন্য (যদি আপনার toggleMenu ফাংশন থাকে)
            if(typeof toggleMenu === "function") {
                // toggleMenu(); 
            }
            e.preventDefault(); 
        });
    }
});

// ফর্ম রিডাইরেক্ট ফাংশন
function goToForm(fundName, imgUrl) {
    const targetUrl = `donate-form.html?fund=${encodeURIComponent(fundName)}&img=${encodeURIComponent(imgUrl)}`;
    window.location.href = targetUrl;
}
