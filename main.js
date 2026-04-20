(function () {
'use strict';

function isInViewport(el, margin) {
margin = margin || 80;
var r = el.getBoundingClientRect();
return r.top < window.innerHeight - margin && r.bottom > margin;
}

var progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
var st = window.scrollY;
var dh = document.body.scrollHeight - window.innerHeight;
if (progressBar) progressBar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
}

var header = document.getElementById('header');

function updateHeader() {
if (!header) return;
header.classList.toggle('scrolled', window.scrollY > 50);
}

var navToggle = document.getElementById('navToggle');
var mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
navToggle.addEventListener('click', function () {
var open = mobileMenu.classList.toggle('open');
navToggle.classList.toggle('open', open);
navToggle.setAttribute('aria-expanded', String(open));
document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(function (link) {
link.addEventListener('click', function () {
mobileMenu.classList.remove('open');
navToggle.classList.remove('open');
navToggle.setAttribute('aria-expanded', 'false');
document.body.style.overflow = '';
});
});

document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
mobileMenu.classList.remove('open');
navToggle.classList.remove('open');
navToggle.setAttribute('aria-expanded', 'false');
document.body.style.overflow = '';
}
});
}

var mainVideo = document.getElementById('mainVideo');
var heroBlock = document.getElementById('heroTitleBlock');
var scrollHint = document.querySelector('.scroll-hint');
var titleTimer = null;
var lastScrollY = window.scrollY;

function hideTitleBlock() {
if (!heroBlock) return;
heroBlock.classList.remove('hero-revealed');
}

function showTitleBlock() {
if (!heroBlock) return;
heroBlock.classList.add('hero-revealed');
if (scrollHint) scrollHint.classList.add('visible');
}

function scheduleTitleReveal() {
if (titleTimer) clearTimeout(titleTimer);
hideTitleBlock();
titleTimer = setTimeout(showTitleBlock, 3000);
}

if (mainVideo) {
mainVideo.load();
mainVideo.play().catch(function () {});
}

function checkHeroReset() {
var cy = window.scrollY;
var delta = lastScrollY - cy;
var nearTop = cy < 200;
var scrollingUp = delta > 5;

if (nearTop && scrollingUp) {
if (mainVideo) {
mainVideo.currentTime = 0;
mainVideo.play().catch(function () {});
}
if (scrollHint) scrollHint.classList.remove('visible');
scheduleTitleReveal();
}

lastScrollY = cy;
}

scheduleTitleReveal();

var animEls = [];

document.querySelectorAll('.anim-left, .anim-right, .anim-up').forEach(function (el) {
animEls.push({ el: el });
});

var scrollObserver = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
var el = entry.target;
if (entry.isIntersecting) {
el.classList.remove('exit');
el.classList.add('in-view');
} else {
el.classList.remove('in-view');
if (entry.boundingClientRect.top < 0) el.classList.add('exit');
}
});
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

animEls.forEach(function (item) {
scrollObserver.observe(item.el);
});

(function () {
var instaCarousel = document.getElementById('instaCarousel');
if (!instaCarousel) return;

var imgs = instaCarousel.querySelectorAll('img');
var pagination = document.getElementById('instaPagination');

function createMarkers() {
imgs.forEach(function (img, idx) {
var vName = '--img-timeline-' + idx;
img.style.viewTimelineName = vName;

var marker = document.createElement('button');
marker.type = 'button';
marker.style.animationTimeline = vName;

marker.addEventListener('click', function () {
img.scrollIntoView({ behavior: 'smooth', inline: 'center' });
});

pagination.appendChild(marker);
});

document.body.style.timelineScope =
Array.from(imgs).map(function (i) { return i.style.viewTimelineName; }).join(', ');
}

if (CSS.supports('view-timeline-axis', 'inline')) createMarkers();
if (imgs.length > 0) instaCarousel.scrollLeft = 0;
})();

document.querySelectorAll('.insta-card').forEach(function (card) {
var carousel = card.querySelector('.insta-visual');
var prev = card.querySelector('.insta-prev');
var next = card.querySelector('.insta-next');

if (carousel) {

function step() {
return carousel.clientWidth;
}

function atEnd() {
return carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5;
}

function atStart() {
return carousel.scrollLeft <= 5;
}

if (prev) {
prev.addEventListener('click', function () {
if (atStart()) {
carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
} else {
carousel.scrollBy({ left: -step(), behavior: 'smooth' });
}
});
}

if (next) {
next.addEventListener('click', function () {
if (atEnd()) {
carousel.scrollTo({ left: 0, behavior: 'smooth' });
} else {
carousel.scrollBy({ left: step(), behavior: 'smooth' });
}
});
}
}

var likeBtn = card.querySelector('.btn-like');
var repostBtn = card.querySelector('.btn-repost');
var saveBtn = card.querySelector('.btn-save');
var shareBtn = card.querySelector('.btn-share');
var commentBtn = card.querySelector('.btn-comment');

if (likeBtn) {
likeBtn.addEventListener('click', function () {
var icon = likeBtn.querySelector('i');
var active = likeBtn.classList.toggle('active');
icon.className = active ? 'ri-heart-fill' : 'ri-heart-line';
if (active && navigator.vibrate) navigator.vibrate(15);
});
}

if (repostBtn) {
repostBtn.addEventListener('click', function () {
var icon = repostBtn.querySelector('i');
var active = repostBtn.classList.toggle('active');
icon.className = active ? 'ri-repeat-2-fill' : 'ri-repeat-2-line';
if (active && navigator.vibrate) navigator.vibrate(10);
});
}

if (saveBtn) {
saveBtn.addEventListener('click', function () {
var icon = saveBtn.querySelector('i');
var saved = saveBtn.classList.toggle('saved');
icon.className = saved ? 'ri-bookmark-fill' : 'ri-bookmark-line';
saveBtn.classList.remove('animate');
void saveBtn.offsetWidth;
saveBtn.classList.add('animate');
if (saved && navigator.vibrate) navigator.vibrate(10);
});
}

if (shareBtn) {
shareBtn.addEventListener('click', function () {
shareBtn.classList.remove('active');
void shareBtn.offsetWidth;
shareBtn.classList.add('active');
var url = window.location.href;
var text = 'Olha esse Site:';
setTimeout(function () {
if (navigator.share) {
navigator.share({ title: document.title, text: text, url: url }).catch(function () {});
} else {
var shareData = encodeURIComponent(text + ' ' + url);
window.open('https://wa.me/?text=' + shareData, '_blank');
}
}, 300);
});
}

if (commentBtn) {
commentBtn.addEventListener('click', function () {
commentBtn.classList.add('active');
setTimeout(function () {
commentBtn.classList.remove('active');
}, 200);
});
}
});

document.querySelectorAll('a[href^="#"]').forEach(function (a) {
a.addEventListener('click', function (e) {
var target = document.querySelector(this.getAttribute('href'));
if (!target) return;
e.preventDefault();
var hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 72;
var top = target.getBoundingClientRect().top + window.scrollY - hh;
window.scrollTo({ top: top, behavior: 'smooth' });
});
});

var ticking = false;

window.addEventListener('scroll', function () {
if (!ticking) {
requestAnimationFrame(function () {
updateProgressBar();
updateHeader();
checkHeroReset();
ticking = false;
});
ticking = true;
}
}, { passive: true });

function init() {
updateProgressBar();
updateHeader();
animEls.forEach(function (item) {
if (isInViewport(item.el, 50)) item.el.classList.add('in-view');
});
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}

window.addEventListener('load', init);

window.addEventListener('resize', function () {
animEls.forEach(function (item) {
if (isInViewport(item.el, 50) && !item.el.classList.contains('in-view')) {
item.el.classList.add('in-view');
}
});
}, { passive: true });

})();