var searchDebounceTimer = null;
var isCaseSensitiveOn = false;

function toggle_case_sensitive(btn_elem) {
    if (isCaseSensitiveOn == false) {
        btn_elem.classList.add('on');
        isCaseSensitiveOn = true;
    }
    else {
        btn_elem.classList.remove('on');
        isCaseSensitiveOn = false;
    }
}

function findKeywords(keyword_x) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function() {
        runFilter(keyword_x);
    }, 500);
}

function runFilter(keyword_x) {
    if (isCaseSensitiveOn == false) {
        var raw = (keyword_x || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    }
    else {
        var raw = (keyword_x || "").replace(/^\s+|\s+$/g, "");
    }
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
        var text = isCaseSensitiveOn == false ? getText(el).toLowerCase() : getText(el);
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