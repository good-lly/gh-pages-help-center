// Usage constants are defined in the head of index document
// GITHUB_ISSUES_LINK
// NUM_RESULTS_PER_PAGE
// MAX_PAGES
// GITHUB_ACCEPTED_LABELS
// GITHUB_ACCEPTED_CREATORS
// ENTRIES_PER_VIEW

var stickyClass = 'sticky';
var dataLabelName = 'data-label';
var dataOrderName = 'data-order';
var dataPageName = 'data-page';
var dataOrderNameNewest = 'newest';
var dataOrderNameOldest = 'oldest';
var contentBoxClassName = 'content-box';
var searchIdName = 'js-search';
var searchBarName = 'js-search-bar';
var contentName = 'js-content';
var modalId = 'js-modal';
var overlayId = 'js-overlay';
var openClassName = 'open';
var modalTitleId = 'js-modal-title';
var modalContentId = 'js-modal-content';
var modalCloseBtnId = 'js-modal-close';
var page = 1;
var allLabels = [];
var allIssues = [];
var converter = new showdown.Converter();
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
                var elms = document.getElementsByClassName(contentBoxClassName);
                for (m = 0; m < elms.length; m++) {
                    var id = elms[m].getAttribute('id');
                    renderBoxContent(id);
                }
                openPage();
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
var openPage = function () {
    var location = window.location;
    var id = location.hash.split('#')[1];
    for (r = 0; r < allIssues.length; r++) {
        if (allIssues[r].number == id) {
            var title = document.getElementById(modalTitleId);
            title.innerHTML = allIssues[r].title;
            var bodyContent = document.getElementById(modalContentId);
            bodyContent.innerHTML = converter.makeHtml(allIssues[r].body);
            openModal();
        }
    }
};
var ready = function () {
    var search = document.getElementById(searchIdName);
    var searchbar = document.getElementById(searchBarName);
    var elms = document.getElementsByClassName(contentBoxClassName);
    var sticky = searchbar.offsetHeight + 50;
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
            elms[k].setAttribute(dataPageName, 0);
        }
    }
    fetchPage();

    function stickySearch() {
        if (window.pageYOffset >= sticky) {
            search.setAttribute('class', stickyClass);
        } else {
            search.setAttribute('class', '');
        }
    }
    window.onscroll = function () {
        stickySearch();
    };
    var overlay = document.getElementById(overlayId);
    overlay.addEventListener('click', closeModal, false);

    var closeBtn = document.getElementById(modalCloseBtnId);
    closeBtn.addEventListener('click', closeModal, false);

    window.addEventListener('hashchange', openPage, false);
};

var getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var renderBoxContent = function (id) {
    var tempArr = [];
    var elm = document.getElementById(id);
    var elmLabels = elm.getAttribute(dataLabelName).split(' ');
    var elmOrder = elm.getAttribute(dataOrderName);
    var elmPage = elm.getAttribute(dataPageName);

    // clear box - remove skeletons
    if (elmPage == 0) {
        while (elm.firstChild) elm.removeChild(elm.firstChild);
    }
    // filter and prepare entries
    if (~elmLabels.indexOf(ALL_LABEL) || elmLabels[0] == '') {
        var tempArr = JSON.parse(JSON.stringify(allIssues));
    } else if (~elmLabels.indexOf(UNCATEGORIZED_LABEL)) {
        for (n = 0; n < allIssues.length; n++) {
            if (allIssues[n].labels.length === 0) tempArr.push(allIssues[n]);
        }
    } else {
        for (n = 0; n < allIssues.length; n++) {
            var commonArr = allIssues[n].labels.filter(function (o) {
                return elmLabels.indexOf(o) !== -1;
            });
            if (commonArr.length > 0) {
                tempArr.push(allIssues[n]);
            }
        }
    }

    // order them
    if (elmOrder == dataOrderNameNewest) {
        tempArr.sort(function (a, b) {
            return new Date(b.edited) - new Date(a.edited);
        });
    } else if (elmOrder == dataOrderNameOldest) {
        tempArr.sort(function (a, b) {
            return new Date(a.edited) - new Date(b.edited);
        });
    }

    var from = elmPage * ENTRIES_PER_VIEW;
    var to = elmPage * ENTRIES_PER_VIEW + ENTRIES_PER_VIEW;
    var result = tempArr.slice(from, to);
    var resultHtml = '';
    for (n = 0; n < result.length; n++) {
        var labelsHtml = '<div class="labels">';
        for (var p = 0; p < result[n].labels.length; p++) {
            labelsHtml +=
                '<span class="label-tag ' +
                result[n].labels[p] +
                '">' +
                result[n].labels[p] +
                '</span>';
        }
        labelsHtml += '</div>';
        resultHtml +=
            '<a href=#' +
            result[n].number +
            ' class="entry">' +
            labelsHtml +
            '<span class="result-title">' +
            result[n].title +
            '</a>';
    }
    elm.insertAdjacentHTML('beforeend', resultHtml);
    var showMoreBtn = tempArr.slice(to, to + 1).length === 1;
};

var openModal = function () {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(overlayId);
    modal.setAttribute('class', 'modal open');
    overlay.setAttribute('class', 'overlay open');
};

var closeModal = function () {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(overlayId);
    modal.setAttribute('class', 'modal');
    overlay.setAttribute('class', 'overlay');
    var clearUrl = window.location.href.split('#')[0];
    history.replaceState(null, null, clearUrl);
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
