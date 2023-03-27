window.onload = function() {
    disableScroll();
};

function disableScroll() {
    window.scrollTo(0, 0);
    window.document.onmousewheel = function() {
        return false;
    };
}
