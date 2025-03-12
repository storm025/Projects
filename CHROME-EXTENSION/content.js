const observer = new MutationObserver(() => {
    addBookmarkButton();
});
observer.observe(document.body, { childList: true, subtree: true });

addBookmarkButton();

function onProblemPage(){
    return window.location.pathname.startsWith("/problems/");
}

function addBookmarkButton(){
    if(!onProblemPage() || document.getElementById("bookmarkButton")){
        return;
    }
    const bookmarkImage=chrome.runtime.getURL("assets/bookmark.png");
    const bookmarkButton = document.createElement("img");
    bookmarkButton.height="30";
    bookmarkButton.width="30";
    bookmarkButton.src=bookmarkImage;
    bookmarkButton.id="bookmarkButton";
    bookmarkButton.style.cursor="pointer";
    bookmarkButton.style.margin="10px";

    const doubtButton=document.querySelector(".coding_ask_doubt_button__FjwXJ");
    const parentDiv=doubtButton.closest("div");
    parentDiv.parentNode.insertBefore(bookmarkButton,parentDiv.nextSibling);


    bookmarkButton.addEventListener("click",bookmarkButtonClicked);
}

function bookmarkButtonClicked(){
    const maangURL=window.location.href;
    const UniqueID=getProblemIdFromUrl(maangURL);
    const title=document.querySelector(".Header_resource_heading__cpRp1").textContent;
    const problem={title,maangURL,UniqueID};
    saveProblem(problem);
}


function getProblemIdFromUrl(maangURL) {
    const urlObj = new URL(maangURL);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[2] || null;
}

function saveProblem(problem){
    chrome.storage.sync.get({bookmarks:[]},(data)=>{
        let bookmarks=data.bookmarks;

        if (!bookmarks.some((b) => b.UniqueID === problem.UniqueID)) {
            bookmarks.push(problem);
            chrome.storage.sync.set({ bookmarks });
        }
   })
}

