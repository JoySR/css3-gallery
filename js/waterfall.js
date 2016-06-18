function Waterfall(opts) {
    this.container = opts.container;
    this.width = opts.width || 300;

    this.setItemWidth();

    this.resetHeightArr();

    this.curIdx = 0;

    this.isLoaded = true;
    this.isLoadingItem = false;
    this.imgPage = 1;
    this.imgCount = opts.count || 20;

    this.loadMore();
}

Waterfall.prototype = {
    callback: function(res) {
        var _this = this;
        if (parseInt(res.totalHits) > 0) {
            var photos = res.hits;
            photos.forEach(function(photo) {
                _this.loadImg(photo);
            });
        }
    },
    getPaddingSize: function() {
        var body = document.getElementsByTagName('body')[0];
        return parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));
    },
    setItemWidth: function() {
        this.itemWidth = this.width + 2 * this.getPaddingSize();
        this.col = Math.floor(this.container.offsetWidth / this.itemWidth);
        this.gutterSize = Math.floor((this.container.offsetWidth - this.itemWidth * this.col)/(this.col + 1));
    },
    fetchItem : function() {
        if(!this.isLoadingItem) {
            this.isLoadingItem = true;
            // var apiKey = "4840dbd30a0b3ad25d0e3b56bb9985f0";
            // var URL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&tags=flower&api_key="+ apiKey + "&page="+this.imgPage+"&per_page="+this.imgCount+"&format=json";

            var apiKey = "2651964-fc07f3b29cadd5417e5fa1d02";
            var URL = "https://pixabay.com/api/?key="+ apiKey+"&page="+this.imgPage+"&per_page="+this.imgCount+"&image_type=photo&callback=jsonpCallback";

            var newScript = document.createElement("script");
            newScript.setAttribute("type", "text/javascript");
            newScript.setAttribute("src", URL);
            document.getElementsByTagName("head")[0].appendChild(newScript);

            this.imgPage++;
            newScript.remove();
            this.isLoadingItem = false;
        }
    },
    loadImg: function(img) {
        var _this = this;
        var imgUrl = img["webformatURL"];
        var link = img["pageURL"];

        // var farmId = img.farm;
        // var serverId = img.server;
        // var id = img.id;
        // var secret = img.secret;
        // var title = img.title;
        // var userId = img.owner;
        // var link = "https://www.flickr.com/photos/" + userId + "/" + id;
        // var imgUrl = "https://farm"+farmId+".staticflickr.com/"+ serverId +"/"+id+"_"+secret+".jpg";
        //

        var image = new Image();
        image.src = imgUrl;
        image.onload = function() {
            var originWidth = image.width;
            var originHeight = image.height;
            var ratio = originHeight / originWidth;

            var realHeight = parseInt(_this.width * ratio);

            var imgInfo = {
                target: image,
                width: _this.width,
                height: realHeight,
                link: link
            };
            _this.render(imgInfo);
        };
    },
    createElWithAttr: function(tag, attr, val) {
        var el = document.createElement(tag);
        el.setAttribute(attr, val);
        return el;
    },
    render: function(imgInfo) {

        var imgCt = this.createElWithAttr("div","class", "item");
        var polaroidCt = this.createElWithAttr("div", "class", "polaroid");
        var link = this.createElWithAttr("a", "href", imgInfo.link);

        link.appendChild(imgInfo.target);
        polaroidCt.appendChild(link);
        imgCt.appendChild(polaroidCt);

        var minHeight = Math.min.apply(null, this.heightArr);

        this.curIdx = this.heightArr.indexOf(minHeight);

        imgInfo.target.style.width = this.width + "px";
        imgInfo.target.style.height = imgInfo.height + "px";


            imgCt.style.top = minHeight + "px";

        imgCt.style.left = (this.gutterSize * (this.curIdx + 1) + this.itemWidth * this.curIdx)  + "px";

        this.heightArr[this.curIdx] += imgInfo.height + 30;
        var maxHeight = Math.max.apply(null, this.heightArr);

        this.container.setAttribute("style","height: "+ parseInt(maxHeight) +"px;");
        this.container.appendChild(imgCt);
        this.isLoaded = true;
    },
    loadMore: function() {
        var loadingIcn = document.getElementById("loading");
        if(this.isVisible(loadingIcn) && this.isLoaded) {

            this.isLoaded = false;
            this.fetchItem();
            var clock = setInterval(function() { //如果加载过后load图标依然可见,继续加载
                if(_this.container.hasChildNodes()) {
                    _this.fetchItem();
                }
                if (!_this.isVisible(loadingIcn)) {
                    clearInterval(clock);
                }
            },1000);
        }
    },
    isVisible: function(el){
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;
        return (elemTop >= 0) && (elemBottom <= window.innerHeight);
    },
    scrollLoad: function() {
        var _this = this;
        var clock;
        if (clock) {
            clearTimeout(clock);
        }
        clock = setTimeout(function () {
            _this.loadMore();
        }, 300);
    },
    resetHeightArr: function() {
        this.heightArr = []; //高度数组
        //设置初始高度数组
        for (var i = 0; i < this.col; i++) {
            this.heightArr.push(0);
        }
    },
    responseFlow: function() {
        this.setItemWidth();

        this.resetHeightArr();

        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        this.fetchItem();

    }
};

var gallery = document.getElementsByClassName("gallery")[0];
var opts = {
    container: gallery,
    col: 4,
    width: 300,
    count: 10
};

var waterfall = new Waterfall(opts);

function jsonpCallback(response) {
    waterfall.callback(response);
}

window.onscroll = function() {
    waterfall.scrollLoad();
};

window.onresize = function() {
    waterfall.responseFlow();
};