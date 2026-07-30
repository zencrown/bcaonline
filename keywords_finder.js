var _searchDebounceTimer = null;

function findKeywords(keyword_x) {
    clearTimeout(_searchDebounceTimer);
    _searchDebounceTimer = setTimeout(function() {
        runFilter(keyword_x);
    }, 500);
}

function runFilter(keyword_x) {
    var raw = (keyword_x || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    var keywords = raw.length ? raw.split(/\s+/) : [];
    
    filterGroup(
        document.querySelectorAll("#mcqList .mcq-block .mcq-question"),
        keywords,
        function(el) { return el.parentNode; } // .mcq-block
    );
    
    filterGroup(
        document.querySelectorAll("#subjectiveList .subjective-list li .qTextSpanX"),
        keywords,
        function(el) { return el.parentNode; } // <li>
    );
}

function filterGroup(nodeList, keywords, getContainer) {
    for (var i = 0; i < nodeList.length; i++) {
        var el = nodeList[i];
        var text = getText(el).toLowerCase();
        var container = getContainer(el);
        var isMatch = matchesAllKeywords(text, keywords);
        container.style.display = isMatch ? "" : "none";
    }
}

function matchesAllKeywords(text, keywords) {
    if (keywords.length === 0) return true;
    for (var i = 0; i < keywords.length; i++) {
        if (text.indexOf(keywords[i]) === -1) return false;
    }
    return true;
}

function getText(el) {
    return el.textContent !== undefined ? el.textContent : el.innerText || "";
}