// Usage constants are defined in the head of index document
// GITHUB_ISSUES_LINK
// NUM_RESULTS_PER_PAGE
// MAX_PAGES
// GITHUB_ACCEPTED_LABELS
// GITHUB_ACCEPTED_CREATORS

var stickyClass = 'sticky';
var dataLabelName = 'data-label';
var dataOrderName = 'data-order';
var dataPageName = 'data-page';
var dataOrderNameNewest = 'newest';
var dataOrderNameOldest = 'oldest';
var contentBoxClassName = 'content-box';
var searchIdName = 'js-search';
var searchBarName = 'js-search-bar';
var page = 1;
var allLabels = [];
var allIssues = [];
var fetchPage = function () {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        try {
            var payload = JSON.parse(xhr.response);
            for (i = 0; i < payload.length; i++) {
                var issue = payload[i];
                var author = issue.user.login;
                // check if issue authoer is accepted one
                if (~GITHUB_ACCEPTED_CREATORS.indexOf(author)) {
                    var newVisibleLabels = addLabelsAndGetSanitzed(
                        issue.labels,
                    );
                    var newIssue = {
                        number: issue.number,
                        title: issue.title,
                        body: issue.body,
                        labels: newVisibleLabels,
                        edited: issue.updated_at,
                    };
                    var found = allIssues.some(
                        (el) => el.number === newIssue.number,
                    );
                    if (!found) allIssues.push(newIssue);
                }
            }
            if (payload.length === NUM_RESULTS_PER_PAGE && page < MAX_PAGES) {
                page++;
                fetchPage();
            } else {
                appendLabelClassesStyle();
            }
        } catch (e) {
            console.error(e);
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
var addLabelsAndGetSanitzed = function (newLabels) {
    var newVisibleLabels = [];
    for (j = 0; j < newLabels.length; j++) {
        var labelName = newLabels[j].name.toLowerCase();
        var labelColor = newLabels[j].color;
        if (labelName != GITHUB_ACCEPTED_LABELS) {
            newVisibleLabels.push(labelName);
            var found = allLabels.some((el) => el.labelName === labelName);
            if (!found) allLabels.push({ labelName, labelColor });
        }
    }
    return newVisibleLabels;
};
var ready = function () {
    var search = document.getElementById(searchIdName);
    var searchbar = document.getElementById(searchBarName);
    var elms = document.getElementsByClassName(contentBoxClassName);
    var sticky = searchbar.offsetHeight;
    for (k = 0; k < elms.length; k++) {
        var id = elms[k].getAttribute('id');
        if (id === null) {
            var prefix = elms[k]
                .getAttribute(dataLabelName)
                .split(' ')
                .join('');
            elms[k].setAttribute('id', prefix + getRandomInt(0, 100));
        }
        var pageNum = elms[k].getAttribute(dataPageName);
        if (pageNum === null) {
            elms[k].setAttribute(dataPageName, 1);
        }
    }
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

var getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var appendLabelClassesStyle = function () {
    var tempStyle = document.createElement('style');
    var tempStyleContent = '';
    for (l = 0; l < allLabels.length; l++) {
        tempStyleContent =
            tempStyleContent +
            ' .' +
            allLabels[l].labelName +
            ' { background-color: #' +
            allLabels[l].labelColor +
            '; }';
    }
    tempStyle.innerHTML = tempStyleContent;
    document.head.appendChild(tempStyle);
};

if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}
