var ready = function () {
    window.onscroll = function () {
        stickySearch();
    };

    var search = document.getElementById('js-search');
    var searchbar = document.getElementById('js-search-bar');
    var sticky = searchbar.offsetHeight;

    function stickySearch() {
        if (window.pageYOffset >= sticky) {
            search.classList.add('sticky');
        } else {
            search.classList.remove('sticky');
        }
    }
};

if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}
