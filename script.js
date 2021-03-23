// Usage constants are defined in the head of index document
// GITHUB_ISSUES_LINK
// NUM_RESULTS_PER_PAGE
// MAX_PAGES

var stickyClass = 'sticky';
var dataLabelName = 'data-label';
var dataOrderName = 'data-order';
var dataOrderNameNewest = 'newest';
var dataOrderNameOldest = 'oldest';
var contentBoxClassName = 'content-box';
var searchIdName = 'js-search';
var searchBarName = 'js-search-bar';
var page = 0;
var fetchPage = function () {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        try {
            var payload = JSON.parse(xhr.response);

            if (payload.length === NUM_RESULTS_PER_PAGE && page < MAX_PAGES) {
                page++;
                fetchPage();
            } else {
                console.log('all data fetched!', payload);
            }
        } catch (e) {
            console.error(e);
            // todo handle error!;
        }
    };

    xhr.onerror = function (e) {
        console.error(e);
    };
    xhr.open(
        'GET',
        GITHUB_ISSUES_LINK +
            '?page=' +
            page +
            '&per_page=' +
            NUM_RESULTS_PER_PAGE +
            '&labels=' +
            GITHUB_ACCEPTED_LABELS.join(','),
    );
    xhr.send();
};
var ready = function () {
    var search = document.getElementById(searchIdName);
    var searchbar = document.getElementById(searchBarName);
    var sticky = searchbar.offsetHeight;
    var issuesList = (function () {
        var elms = document.getElementsByClassName(contentBoxClassName);
        var tempList = [];
        tempList.push({
            fullLabelsName: UNCATEGORIZED_LABEL,
            labelsList: UNCATEGORIZED_LABEL,
            order: dataOrderNameNewest,
            labeledList: [],
        });
        tempList.push({
            fullLabelsName: ALL_LABEL,
            labelsList: ALL_LABEL,
            order: dataOrderNameNewest,
            labeledList: [],
        });
        for (i = 0; i < elms.length; i++) {
            try {
                var fullLabelName = elms[i].getAttribute(dataLabelName);
                var order = elms[i].getAttribute(dataOrderName);
                if (
                    fullLabelName != ALL_LABEL ||
                    fullLabelName != UNCATEGORIZED_LABEL
                ) {
                    tempList.push({
                        fullLabelsName: fullLabelName,
                        labelsList: fullLabelName.split(' '),
                        order: order != null ? order : dataOrderNameNewest,
                        labeledList: [],
                    });
                }
            } catch (error) {
                throw error;
            }
        }
        return tempList;
    })();

    fetchPage();

    function stickySearch() {
        if (window.pageYOffset >= sticky) {
            search.classList.add(stickyClass);
        } else {
            search.classList.remove(stickyClass);
        }
    }
    window.onscroll = function () {
        stickySearch();
    };
};

if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}
