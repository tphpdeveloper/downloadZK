let currentSongVarName = 'currentSong';
let canDownload = true;
let autoDownloadVarName = 'autoDownload';
//work with localStorage
let LS = {
    get(key) {
        return localStorage.getItem(key);
    },
    has(key) {
        return this.get(key) !== null;
    },
    set(key, val) {
        localStorage.setItem(key, val);
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.crear();
    }
};

let DS = {
    domain: document.location.origin,
    //get link for download track
    urlToGet: '/ajax/inc/',
    downloadBtns: {},
    //sid every song
    sids: [],
    time: 0,
    nextSong: 0,
    excluded: [],
    nextPage: '',

    //filled sids array only numbers sid
    setSidsPage (downloadBtns) {
        this.urlToGet = this.domain + this.urlToGet;
        this.downloadBtns = downloadBtns;
        this.setTime();

        downloadBtns.each((key, item) => {
            this.sids.push(Number($(item).data('sid')));
        });
    },

    setTime () {
        this.time = this.getSecond(0.5, 1);
    },

    getTime () {
        return this.time;
    },

    getSids () {
        return this.sids;
    },

    setNextPage (newPageObject) {
        this.nextPage = newPageObject.attr('href');
    },

    getNumberNextPage () {
        return Number(this.nextPage.match(new RegExp('\\d+$'))[0]);
    },

    getCurrentPage () {
        let nextPageNumber = this.getNumberNextPage();
        return !isNaN(nextPageNumber) ? nextPageNumber - 1 : 0;
    },

    toNextPage () {
        window.location.href = this.domain + this.nextPage;
    },

    //for download song
    downloadSong (sid) {
        $.ajax({
            url: this.urlToGet + sid,
            dataType: 'json'
        })
            .done(data => {
                if (Number(data.isSuccess)) {
                    this.sids.slice(this.sids.indexOf(sid), 1);
                    window.location.href = data.url;
                } else {
                    this.excluded.push(sid);
                    let li = $('span[data-sid="' + sid + '"]').parent().parent().parent();
                    li.css({position: 'relative'});
                    BTN.needDownload(li, sid);
                }
            });
    },

    //generate random seconds
    getSecond (min, max) {
        return Math.ceil(((Math.random() * max) + min) * 1000);
    },

    getNextSong() {
        let currentSong = 0;
        if (!LS.has(currentSongVarName)) {
            LS.set(currentSongVarName, currentSong);
        } else {
            currentSong = Number(LS.get(currentSongVarName));
            ++currentSong;
            LS.set(currentSongVarName, currentSong);
        }
        return currentSong;
    },

    resetNextSong() {
        LS.remove(currentSongVarName);
    },

    isEqual(first, second) {
        return first === second;
    },

    getCountFailDownload() {
        return Number($('.failDownload').length);
    }
};

let BTN = {
    downloadText: 'Скачать',
    stopText: 'Отмена',
    download() {
        $('<button>', {
            text: this.downloadText,
            id: 'btnDownload',
            css: {
                border: 'none',
                'border-radius': '10px',
                'background-color': 'green',
                color: 'white',
                position: 'fixed',
                padding: '5px 10px',
                right: '130px',
                top: '68px',
                'z-index': 555,
                cursor: 'pointer'
            },
            on: {
                click(){
                    LS.set(autoDownloadVarName, true);
                    canDownload = true;
                    run();
                }
            }
        }).appendTo($('body'));
    },
    setTextDownload(text = 0) {
        $('#btnDownload').html(this.downloadText + ' ' + text);
    },
    stop() {
        $('<button>', {
            text: this.stopText,
            id: 'btnStop',
            css: {
                border: 'none',
                'border-radius': '10px',
                'background-color': 'red',
                color: 'white',
                position: 'fixed',
                padding: '5px 10px',
                right: '50px',
                top: '68px',
                'z-index': 555,
                cursor: 'pointer'
            },
            on: {
                click() {
                    LS.set(autoDownloadVarName, false);
                    canDownload = false;
                }
            }
        }).appendTo($('body'));
    },

    needDownload(li, sid) {
        $('<button>', {
            text: 'Дозакачать',
            class: 'failDownload',
            'data-sid': sid,
            css: {
                border: 'none',
                'border-radius': '10px',
                'background-color': 'red',
                color: 'yellow',
                position: 'absolute',
                right: '-90px',
                top: '0px'
            }
        }).appendTo(li);
    }
};

function run(){
    if (!canDownload) {
        return false;
    }
    let sids = DS.getSids();
    let nextSong = DS.getNextSong();
    DS.setTime();

    //when last song reload page
    if (DS.isEqual(nextSong, sids.length) && !DS.getCountFailDownload()) {
        DS.toNextPage();
    } else {
        BTN.setTextDownload(nextSong + 1);

        DS.downloadSong(sids[nextSong]);
    }

    setTimeout(run, DS.getTime());
}

$(document).ready(() => {
    DS.resetNextSong();
    //list all song on page (not from list in top 10)
    DS.setSidsPage($('div.whb_box div.songs-list-item ul.song-menu li:first-child > span'));
    DS.setNextPage($('a.next.next-btn'));

    if (LS.get(autoDownloadVarName) === 'true') {
        run();
    }

    BTN.download();
    BTN.stop();
});
