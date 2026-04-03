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

// ১. ডাটা পুনরুদ্ধার (Activities.html থেকে)
    const selectedName = localStorage.getItem('selected_category_name');
    const selectedImg = localStorage.getItem('selected_category_img');

    if (selectedName) {
        document.getElementById('heroTitle').innerText = selectedName;
        document.getElementById('heroBg').style.backgroundImage = `url('${selectedImg}')`;
    }

// ২. Firebase Config & Live Tracking
const firebaseConfig = { 
    databaseURL: "https://bmkf-donation-system-default-rtdb.asia-southeast1.firebasedatabase.app" 
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ডাটা লোড হওয়ার আগে স্পিনার দেখানো
const amountDisplay = document.getElementById('liveAmount');
amountDisplay.innerHTML = '<div class="spinner"></div>'; 

if (selectedName) {
    // ফায়ারবেস থেকে ডাটা রিড করা
    db.ref('donations/' + selectedName + '/total_amount').on('value', snap => {
        const amt = snap.val() || 0;
        
        // ডাটা চলে আসলে স্পিনার সরিয়ে টাকার অংক বসানো
        amountDisplay.innerText = `৳ ${amt.toLocaleString('bn-BD')}`;
    }, error => {
        console.error("Firebase Error:", error);
        amountDisplay.innerText = "৳ ০";
    });
}


    // ৪. JSON থেকে ডাটা ফেচ করা
    fetch('activities.json')
    .then(res => {
        if (!res.ok) throw new Error("JSON ফাইল পাওয়া যায়নি");
        return res.json();
    })
    .then(data => {
        const p = data[selectedName];
        if(!p) {
            console.error("JSON-এ এই ক্যাটাগরি নেই:", selectedName);
            return;
        }

        // বিবরণ ও ভিডিও আপডেট
        document.getElementById('projectDesc').innerText = p.desc;
        document.getElementById('projectVideo').src = p.video;



// নতুন সেকশন: প্রকল্পের লক্ষ্য-উদ্দেশ্য ও অন্যান্য তথ্য রেন্ডার
const detailsGrid = document.getElementById('projectDetailsGrid');
detailsGrid.innerHTML = ""; // ক্লিয়ার করা

if (p.project_info) {
    for (let [title, value] of Object.entries(p.project_info)) {
        let contentHtml = "";
        let icon = "fa-check-circle"; // ডিফল্ট আইকন

        // আইকন সেট করা টাইটেল অনুযায়ী
        if(title.includes("উপকারভোগী")) icon = "fa-users";
        if(title.includes("এলাকা")) icon = "fa-map-marker-alt";
        if(title.includes("মেয়াদ")) icon = "fa-calendar-alt";

        // যদি ডাটা লিস্ট (Array) আকারে থাকে
        if (Array.isArray(value)) {
            contentHtml = `<ul style="list-style:none; padding:0; margin:0;">
                ${value.map(item => `<li style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-check-circle" style="color:var(--primary); font-size:14px;"></i> ${item}
                </li>`).join('')}
            </ul>`;
        } else {
            // সাধারণ টেক্সট থাকলে
            contentHtml = `<p style="margin:0; display:flex; align-items:center; gap:10px;">
                <i class="fas ${icon}" style="color:var(--primary); font-size:14px;"></i> ${value}
            </p>`;
        }

        // কার্ড তৈরি
        detailsGrid.innerHTML += `
            <div style="background:#f4f7f5; padding:25px; border-radius:18px; border:1px solid #e0e7e4;">
                <h3 style="margin-top:0; font-size:1.2rem; color:#1a3a2a; border-bottom:2px solid #ddd; padding-bottom:10px; margin-bottom:15px;">${title}</h3>
                <div style="font-size:16px; color:#444; font-weight:500;">${contentHtml}</div>
            </div>`;
    }
}
// ৫. প্রিমিয়াম গ্যালারি রেন্ডার
        const thumbBox = document.getElementById('thumbBox');
        thumbBox.innerHTML = ""; // ক্লিয়ার করা
        
        if (p.gallery && p.gallery.length > 0) {
            document.getElementById('mainImg').src = p.gallery[0];
            
            p.gallery.forEach((img, index) => {
                const imgEl = document.createElement('img');
                imgEl.src = img;
                imgEl.className = `thumb-item ${index === 0 ? 'active' : ''}`;
                imgEl.onclick = () => changeMainImg(img, imgEl);
                thumbBox.appendChild(imgEl);
            });
        }

        // ৬. ডাইনামিক ইমপ্যাক্ট কার্ড রেন্ডার (টেবিল স্টাইল)
        const impactBox = document.getElementById('impactBox');
        impactBox.innerHTML = ""; 
        if (p.impact) {
            p.impact.forEach(item => {
                let statRows = "";
                for (let [key, value] of Object.entries(item.stats)) {
                    statRows += `
                        <div class="impact-row">
                            <span>${key}</span> 
                            <b>${value}</b>
                        </div>`;
                }
                impactBox.innerHTML += `
                    <div class="impact-card">
                        <div class="impact-card-head">
                            <span>${item.label}</span> 
                            <span>${item.year}</span>
                        </div>
                        <div class="impact-card-body">${statRows}</div>
                    </div>`;
            });
        }

        // ৭. সামারি বার (Total Summary)
        const summaryBox = document.getElementById('summaryBox');
        summaryBox.innerHTML = "";
        if (p.total_summary) {
            for (let [label, val] of Object.entries(p.total_summary)) {
                summaryBox.innerHTML += `
                    <div>
                        <p style="margin:0; color:#666; font-size:0.9rem;">${label}</p>
                        <h3 style="margin:5px 0; color:var(--primary); font-size:1.5rem;">${val}</h3>
                    </div>`;
            }
        }
    })
    .catch(err => console.error("Loading Error:", err));

    // গ্যালারি ফাংশনালিটি
    function changeMainImg(url, el) {
        const mainImg = document.getElementById('mainImg');
        mainImg.style.opacity = "0.4"; // হালকা ফেড ইফেক্ট
        
        setTimeout(() => {
            mainImg.src = url;
            mainImg.style.opacity = "1";
        }, 150);

        document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        
        // থাম্বনেইল মাঝখানে আনা
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function scrollThumb(direction) {
        const scrollBox = document.getElementById('thumbBox');
        const scrollAmt = 250;
        scrollBox.scrollBy({ left: direction * scrollAmt, behavior: 'smooth' });
    }
//______________________________\\
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
