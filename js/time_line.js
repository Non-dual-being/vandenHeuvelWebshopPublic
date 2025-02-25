"use strict";


const timeline_items = document.querySelectorAll('.timeline__item');
const navIcon = document.getElementById("navIcon");
// Initialiseer de observer
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const item = entry.target;

        if (entry.isIntersecting) {
            // Voeg 'visible' toe aan het timeline item
            item.classList.add("visible");

            // Zoek het bijbehorende icoon binnen de huidige .timeline__row
            const timelineRow = item.closest('.timeline__row'); // Zoek de parent row
            const timelineIcon = timelineRow.querySelector('.timeline__icon'); // Zoek het icoon binnen de row
            if (timelineIcon) {
                setTimeout(() => {
                    timelineIcon.classList.add("active");
                
                }, 150);
            }
                

            observer.unobserve(item); // Stop met observeren na activatie
        }
    });
}, { threshold: 0.5 }); // Pas de threshold aan naar wens

// Observeer elk timeline item

timeline_items.forEach(item => observer.observe(item));

const observer2 = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const item = entry.target;

        if (entry.isIntersecting) {
            if (item) {
                setTimeout(() => {
                    item.className = "addEffect";
                    console.log(item.classList)
                
                }, 200);
            }
               
           
        



   

            observer.unobserve(item); // Stop met observeren na activatie
        }
    });
}, { threshold: 1 }); // Pas de threshold aan naar wens


observer2.observe(navIcon);



// Smooth scroll voor de knop
document.getElementById('timeline-header__button').addEventListener('click', function () {
    const targetSection = document.getElementById('timeline-grid'); // Vervang met je gewenste sectie
    window.scrollTo({
        top: targetSection.offsetTop - 270, // Scroll iets boven de sectie
        behavior: 'smooth' // Zachte scroll
    });
});

