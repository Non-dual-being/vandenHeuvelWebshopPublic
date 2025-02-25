export const observerFunction = (hidden_class = "", adding_class = "", threshold) => {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                if (hidden_class !== "") {
                target.classList.remove(hidden_class);
                }

                if (adding_class !== "") {
                target.classList.add(adding_class);
                }

                // Stop met observeren
                observer.unobserve(target);
            }
        });
    }, {
        threshold: threshold
    });

    return observer; // Je kunt de observer retourneren indien nodig
};
