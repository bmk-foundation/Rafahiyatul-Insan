// ১. ফায়ারবেস কনফিগ এবং ইনিশিয়ালাইজেশন
const firebaseConfig = {
    apiKey: "AIzaSyAzGK_y9kx5oVFL1-rGTnSDxDvdYoVIqOg",
    authDomain: "bmkf-donation-system.firebaseapp.com",
    databaseURL: "https://bmkf-donation-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bmkf-donation-system",
    storageBucket: "bmkf-donation-system.firebasestorage.app",
    messagingSenderId: "718912081844",
    appId: "1:718912081844:web:98d102b1a6dc07464cace1"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database(); // এখানে আমরা 'db' নাম ব্যবহার করছি

// ১. পেমেন্ট সিলেক্ট করার জন্য ফাংশন (টিক চিহ্নসহ)
function selectPay(el) {
    // সব আইটেম থেকে বর্ডার, ব্যাকগ্রাউন্ড এবং টিক চিহ্ন সরিয়ে ফেলা
    document.querySelectorAll('.method-item').forEach(item => {
        item.style.borderColor = '#ddd';
        item.style.background = '#fff';
        
        // টিক চিহ্নের এলিমেন্টটি খুঁজে সেটি লুকিয়ে রাখা
        const tick = item.querySelector('.tick-icon');
        if (tick) tick.style.display = 'none';
    });

    // বর্তমান সিলেক্ট করা আইটেমের স্টাইল পরিবর্তন
    el.style.borderColor = '#018e49';
    el.style.background = '#f0fdf4';
    
    // বর্তমান আইটেমের টিক চিহ্নটি দেখানো
    const currentTick = el.querySelector('.tick-icon');
    if (currentTick) currentTick.style.display = 'block';
    
    // রেডিও বাটনটি চেক করা
    el.querySelector('input').checked = true;
}

// --- টেলিগ্রাম নোটিফিকেশন কনফিগারেশন ---
const telegramConfig = {
    token: '8769168446:AAE8zU35Tk9Z0zrdmMu77KF9R7tf36J6BxA',
    chatId: '8504870437'
};

function sendTelegramAlert(d) {
    const message = `🔔 *নতুন অনুদান সাবমিট হয়েছে!*
━━━━━━━━━━━━━━━━
👤 *দাতার নাম:* ${d.donorName}
💰 *পরিমাণ:* ৳${d.amount}
📂 *খাত:* ${d.project}
📱 *মোবাইল:* ${d.phone}
🆔 *TrxID:* \`${d.trxID}\`
💳 *মাধ্যম:* ${d.paymentMethod}
━━━━━━━━━━━━━━━━
⚠️ *অ্যাডমিন প্যানেল থেকে যাচাই করুন।*`;

    fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: telegramConfig.chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    }).catch(err => console.error("Telegram Notification Error:", err));
}

function processPayment() {
    const amountInput = document.getElementById('amount');
    const errorDiv = document.getElementById('amount-error');
    const amountValue = parseInt(amountInput.value);

    // চেক করা হচ্ছে পরিমাণ ১০ এর কম কি না অথবা খালি কি না
    if (!amountValue || amountValue < 10) {
        errorDiv.style.display = 'block'; // এরর মেসেজ দেখাবে
        amountInput.style.borderColor = 'red';
        amountInput.focus();
        return; // এখানেই থেমে যাবে, পেমেন্ট গেটওয়েতে যাবে না
    }

    // যদি ১০ বা তার বেশি হয়, তবে এরর মুছে পেমেন্ট শুরু হবে
    errorDiv.style.display = 'none';
    amountInput.style.borderColor = '#ccc';
    
    // এখন আপনার RupantorPay বা অন্য পেমেন্ট ফাংশনটি কল করুন
    startDonation(amountValue); 
}
document.getElementById('amount').addEventListener('input', function() {
    const errorDiv = document.getElementById('amount-error');
    if (this.value < 10 && this.value !== "") {
        this.style.borderColor = 'red';
        errorDiv.style.display = 'block';
    } else {
        this.style.borderColor = '#ccc';
        errorDiv.style.display = 'none';
    }
});


// ২. দান ফর্ম সাবমিশন লজিক (আপডেট করা হয়েছে)
const donationForm = document.getElementById('donationForm');
const submitBtn = document.getElementById('submitBtn');
const donationSuccessModal = document.getElementById('donation-success-modal');

if (donationForm) {
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const selectedMethod = document.querySelector('input[name="payMethod"]:checked');
        if (!selectedMethod) {
            alert("দয়া করে বিকাশ বা নগদ সিলেক্ট করুন");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> প্রসেসিং...';

        const donationData = {
            donorName: document.getElementById('donorName').value,
            donorEmail: document.getElementById('donorEmail').value,
            phone: document.getElementById('donorPhone').value,
            project: document.getElementById('donationProject').value,
            amount: parseInt(document.getElementById('amount').value),
            paymentMethod: selectedMethod.value,
            trxID: document.getElementById('trxID').value,
            status: "pending",
            timestamp: new Date().toLocaleString('bn-BD')
        };

        // ফায়ারবেস ডাটাবেসে ডাটা পাঠানো
        db.ref('pending_donations').push(donationData)
        .then(() => {
            // সফলভাবে সাবমিট হলে টেলিগ্রাম নোটিফিকেশন পাঠানো
            sendTelegramAlert(donationData);

            donationForm.reset();
            document.querySelectorAll('.method-item').forEach(item => {
                item.style.borderColor = '#ddd';
                item.style.background = '#fff';
                const tick = item.querySelector('.tick-icon');
                if (tick) tick.style.display = 'none';
            });

            submitBtn.disabled = false;
            submitBtn.innerText = "দান করুন";

            if (donationSuccessModal) {
                donationSuccessModal.style.display = 'flex';
            }
        })
        .catch(err => {
            alert("দুঃখিত, ডাটা সেভ হয়নি: " + err.message);
            submitBtn.disabled = false;
            submitBtn.innerText = "দান করুন";
        });
    });
}

// মডাল বন্ধ করার ফাংশন
function closeDonationModal() {
    if (donationSuccessModal) {
        donationSuccessModal.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // ৫ সেকেন্ড পর পর পাল্টাবে

    function nextSlide() {
        // বর্তমান স্লাইড থেকে active ক্লাস সরানো
        slides[currentSlide].classList.remove('active');
        
        // পরের ইনডেক্স ঠিক করা
        currentSlide = (currentSlide + 1) % slides.length;
        
        // নতুন স্লাইডে active ক্লাস যোগ করা
        slides[currentSlide].classList.add('active');
    }

    // যদি একাধিক স্লাইড থাকে তবেই ইন্টারভাল শুরু হবে
    if(slides.length > 1) {
        setInterval(nextSlide, slideInterval);
    }
});



// ৩. কন্টেন্ট স্লাইডার ফাংশন
function initSlider(viewportId, prevBtnId, nextBtnId) {
    const viewport = document.getElementById(viewportId);
    const prevBtn = document.getElementById(prevBtnId);
   const nextBtn = document.getElementById(nextBtnId);

   if (viewport && nextBtn && prevBtn) {
        nextBtn.onclick = () => viewport.scrollBy({ left: viewport.offsetWidth, behavior: 'smooth' });
        prevBtn.onclick = () => viewport.scrollBy({ left: -viewport.offsetWidth, behavior: 'smooth' });
}}


// গ্যালারি মডাল ফাংশন (গ্লোবাল স্কোপে রাখা হলো)
window.openGalleryModal = function(url) {
    const modal = document.getElementById('gallery-modal');
    const expandedImg = document.getElementById('expanded-image');
    
    if (modal && expandedImg) {
        expandedImg.src = url;
        modal.style.display = 'flex';
        
        // ছবি বড় হওয়ার সময় সুন্দর একটি বাউন্স ইফেক্ট
        setTimeout(() => {
            expandedImg.style.transform = "scale(1)";
        }, 50);
        
        document.body.style.overflow = 'hidden'; // পেজ স্ক্রল বন্ধ করবে
    }
};

window.closeGalleryModal = function() {
    const modal = document.getElementById('gallery-modal');
    const expandedImg = document.getElementById('expanded-image');
    if (modal) {
        modal.style.display = 'none';
        if(expandedImg) expandedImg.style.transform = "scale(0.8)"; // রিসেট
        document.body.style.overflow = 'auto'; // স্ক্রল চালু
    }
};

// ডাটা লোড করার মেইন ফাংশন
/**
 * BMKF Dynamic Content Loader
 * ৩টি আলাদা সোর্স থেকে ডাটা লোড করার স্ক্রিপ্ট
 */

async function loadDynamicContent() {
    const galleryGrid = document.getElementById('image-gallery');
    const blogList = document.getElementById('blog-list');
    const videoGrid = document.getElementById('video-list'); // ভিডিওর জন্য নতুন আইডি

    try {
        // ১. data.json থেকে ব্লগ লোড
        const blogRes = await fetch('data.json');
        if (blogRes.ok) {
            const blogData = await blogRes.json();
            if (blogList && blogData.blogs) {
                renderBlogItems(blogData.blogs.slice(0, 6));
            }
        }

        // ২. image.json থেকে গ্যালারি ইমেজ লোড
        const imageRes = await fetch('image.json');
        if (imageRes.ok) {
            const imageData = await imageRes.json();
            if (galleryGrid && imageData.gallery) {
                window.galleryImages = imageData.gallery; // গ্লোবাল স্টোরেজ
                renderGalleryItems(imageData.gallery.slice(0, 10));
            }
        }

        // ৩. video.json থেকে ভিডিও কার্ড লোড
        const videoRes = await fetch('video.json');
        if (videoRes.ok) {
            const videoData = await videoRes.json();
            if (videoGrid && videoData.videos) {
                renderVideoItems(videoData.videos.slice(0, 4));
            }
        }

        // কন্টেন্ট লোড হওয়ার পর স্ক্রল রিস্টোর করা
        const savedPos = sessionStorage.getItem('bmkf_home_scroll');
        if (savedPos) {
            requestAnimationFrame(() => window.scrollTo(0, parseInt(savedPos)));
        }

    } catch (error) {
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", error);
    }
}

// --- ১. ব্লগ রেন্ডার ফাংশন ---
function renderBlogItems(blogs) {
    const blogList = document.getElementById('blog-list');
    blogList.innerHTML = blogs.map((blog, index) => {
        const id = blog.id || index;
        return `
            <div class="blog-card" onclick="window.location.href='blog-details.html?id=${id}'">
                <div class="blog-img">
                    <img src="${blog.coverImage || blog.image}" alt="${blog.title}">
                </div>
                <div class="blog-info">
                    <h3>${blog.title}</h3>
                    <p>${(blog.shortDescription || "").substring(0, 95)}...</p>
                    <div class="read-more-btn" style="color: #FF8C00; font-weight: bold;">
                        আরও বিস্তারিত দেখুন <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// --- ২. গ্যালারি রেন্ডার ফাংশন ---
function renderGalleryItems(images) {
    const galleryGrid = document.getElementById('image-gallery');
    galleryGrid.innerHTML = images.map((item, index) => `
        <div class="gallery-item">
            <img src="${item.url || item.image}" alt="Gallery" 
                 onclick="openSmartLightbox('${item.url || item.image}', ${index})" 
                 style="cursor: pointer;">
        </div>`).join('');
}

// --- ৩. ভিডিও রেন্ডার ফাংশন (নতুন) ---
function renderVideoItems(videos) {
    const videoGrid = document.getElementById('video-list');
    videoGrid.innerHTML = videos.map((video) => `
        <div class="video-card">
            <div class="video-wrapper">
                <iframe src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
            </div>
        </div>`).join('');
}

// --- স্মার্ট লাইটবক্স লজিক (আগের মতই) ---
window.openSmartLightbox = function(url, index) {
    const modal = document.getElementById('gallery-modal');
    const expandedImg = document.getElementById('expanded-image');
    if (modal && expandedImg) {
        expandedImg.src = url;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        history.pushState({ lightbox: true }, "");
    }
};

window.closeSmartLightbox = function() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.onpopstate = function(event) {
    const modal = document.getElementById('gallery-modal');
    if (modal && modal.style.display === 'flex') {
        closeSmartLightbox();
    }
};
document.addEventListener('DOMContentLoaded', loadDynamicContent);

document.addEventListener('DOMContentLoaded', () => {
    // ১. বর্তমান পেজের ফাইল নেম এবং URL প্যারামিটার বের করা
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const urlParams = new URLSearchParams(window.location.search);
    const hasFund = urlParams.has('fund'); // ডোনেশন পেজের জন্য চেক
    const hasBlogId = urlParams.has('id'); // ব্লগ ডিটেইলস পেজের জন্য চেক

    // ২. সব মেনু লিঙ্কগুলো ধরা
    const navLinks = document.querySelectorAll('.overlay-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // কন্ডিশন ১: যদি সরাসরি ফাইল নেম মিলে যায় (যেমন: index.html)
        if (linkPath === currentPath) {
            setActive(link);
        }

        // কন্ডিশন ২: যদি ব্লগ ডিটেইলস পেজে থাকে, তবে 'blogs.html' লিঙ্কটি হাইলাইট হবে
        if (currentPath.includes('blog-details.html') && linkPath === 'blogs.html') {
            setActive(link);
        }

        // কন্ডিশন ৩: যদি ডোনেশন ডিটেইলস পেজে থাকে, তবে 'donation.html' লিঙ্কটি হাইলাইট হবে
        // আপনার ফাইলের নাম donation-form.html বা যেটা হোক, সেটা নিচে দিন
        if (currentPath.includes('donate-form.html') && linkPath === 'donation.html') {
            setActive(link);
        }
    });

    // অ্যাক্টিভ ক্লাস বসানো এবং ক্লিক বন্ধ করার ফাংশন
    function setActive(el) {
        el.classList.add('active-link');
        // ইউজার ওই পেজেই থাকলে ক্লিক করলে পেজ লোড হবে না
        el.addEventListener('click', (e) => {
            // যদি মেনু বন্ধ করার দরকার হয় তবে এখানে toggleMenu() কল করতে পারেন
            e.preventDefault(); 
        });
    }
});

function goToForm(fundName, imgUrl) {
    const targetUrl = `donate-form.html?fund=${encodeURIComponent(fundName)}&img=${encodeURIComponent(imgUrl)}`;
    window.location.href = targetUrl;
}

function copyNumber() {
    const numberElement = document.getElementById('bkashNumber');
    const copyBtn = document.getElementById('copyBtn');
    const copyText = document.getElementById('copyText');
    
    if (numberElement && copyBtn) {
        const number = numberElement.innerText;
        
        navigator.clipboard.writeText(number).then(() => {
            // আইকন পরিবর্তন (কপি থেকে টিক চিহ্ন)
            const icon = copyBtn.querySelector('i');
            icon.className = "fas fa-check"; // টিক চিহ্ন আইকন
            
            if(copyText) {
                copyText.innerText = "কপি হয়েছে!";
            }
            
            // বাটন স্টাইল পরিবর্তন (সাকসেস কালার)
            copyBtn.style.background = "#43a047"; 

            // ২ সেকেন্ড পর আগের অবস্থায় ফিরে যাওয়া
            setTimeout(() => {
                icon.className = "far fa-copy"; // আবার কপি আইকন
                copyText.innerText = "কপি করুন";
                copyBtn.style.background = "  #546E7A"; // আগের কালার
            }, 2000);
        });
    }
}


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

// ৭. পেজ লোড সম্পন্ন হলে রান করা
document.addEventListener('DOMContentLoaded', () => {
    initSlider('actionViewport', 'prevAction', 'nextAction');
    initSlider('sliderViewport', 'prevBtn', 'nextBtn');
    loadFirebaseData();
});





Chart.register(ChartDataLabels);
const projects = [
"সাধারণ তহবিল","যাকাত তহবিল","শিক্ষা সহায়তা", "চিকিৎসা তহবিল", "এতিম কল্যাণ", "বৃক্ষরোপণ কর্মসূচি", "অসহায় ও দরিদ্র কল্যাণ"];
const colors = [
'#2e7d32','#455a64','#1976d2', '#d32f2f', '#fbc02d', '#f57c00', '#7b1fa2'];

function initDashboard() {
    db.ref().on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const donations = data.donations || {};
        const expenses = data.expenses || {};
        const grid = document.getElementById('category-charts-grid');
        grid.innerHTML = "";
        
        let overallLabels = [];
        let overallIncomes = [];

        projects.forEach((p, index) => {
            const income = donations[p] ? (donations[p].total_amount || 0) : 0;
            let expense = 0;
            if(expenses[p] && expenses[p].items) {
                for(let id in expenses[p].items) {
                    expense += parseFloat(expenses[p].items[id].amount || 0);
                }
            }

            overallLabels.push(p);
            overallIncomes.push(income);

            const cardId = `chart-${index}`;
            grid.innerHTML += `
                <div class="category-card">
                    <h4>${p}</h4>
                    <div class="small-chart-container">
                        <canvas id="${cardId}"></canvas>
                    </div>
                    <div style="margin-top:10px; font-size:13px; font-weight:bold;">
                        <span style="color:#2e7d32">জমা: ৳${income}</span> | 
                        <span style="color:#d32f2f">ব্যয়: ৳${expense}</span>
                    </div>
                </div>
            `;
            setTimeout(() => renderCategoryChart(cardId, income, expense), 100);
        });
        renderOverallChart(overallLabels, overallIncomes);
    });
}

// বড় চার্টে পার্সেন্টেজ দেখানো
function renderOverallChart(labels, values) {
    const ctx = document.getElementById('overallDoughnutChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        return sum > 0 ? ((value * 100) / sum).toFixed(1) + "%" : "";
                    },
                    color: '#fff', font: { weight: 'bold' }
                }
            }
        }
    });
}

// ছোট চার্টে আয়-ব্যয় শতাংশ দেখানো (আপনার ২য় ফটোর মতো)
function renderCategoryChart(canvasId, income, expense) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['জমা', 'ব্যয়'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2e7d32', '#d32f2f']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        return sum > 0 ? ((value * 100) / sum).toFixed(1) + "%" : "";
                    },
                    color: '#fff', font: { weight: 'bold', size: 14 }
                }
            }
        }
    });
}
window.onload = initDashboard;