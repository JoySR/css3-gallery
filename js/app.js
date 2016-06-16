function Barrels($node, count) {
    this.$node = $node;
    this.imgNum = 40;
    this.baseHeight = 300;
    this.rowList = [];
    this.isLoaded = true;
    this.isLoadingItem = false;
    this.imgPage = 1;
    this.imgCount = count || 20;
    this.fetchItem();
    var clock2;
    var _this = this;
    $(window).scroll(function() {
        if (clock2) {
            clearTimeout(clock2);
        }
        clock2 = setTimeout(function () {
            _this.loadMore();
        }, 300);
    });
}

Barrels.prototype = {
    loadImg: function(items) {
        console.log(items);
        var _this = this;
        $.each(items, function(idx, item) {
            var imgUrl = item["webformatURL"],
                url = item["pageURL"];
            var img = new Image();
            img.src = imgUrl;
            img.onload = function() {
                var originWidth = img.width,
                    originHeight = img.height,
                    ratio = originWidth/originHeight;

                var imgInfo = {
                    target: $(img),
                    width: _this.baseHeight * ratio,
                    height: _this.baseHeight,
                    ratio: ratio,
                    url: url
                };
                _this.render(imgInfo);
            };
        });
    },
    render: function(imgInfo) {
        var _this = this;
        var rowList = this.rowList,
            rowWidth = 0,
            rowHeight = 0,
            clientWidth = this.$node.width(),
            lastImgInfo = imgInfo;
        this.rowList.push(imgInfo);
        $.each(rowList, function(idx, imgInfo) {
            rowWidth += imgInfo.width;
            if(rowWidth > clientWidth) {
                rowList.pop();
                rowWidth = rowWidth - lastImgInfo.width;
                rowHeight = clientWidth * _this.baseHeight / rowWidth;

                _this.createRow(rowHeight);
                _this.rowList = [];
                _this.rowList.push(lastImgInfo);
            }
            _this.isLoaded = true;
        });
    },
    createRow: function(rowHeight) {
        var _this = this;
        $.each(this.rowList, function(idx, imgInfo) {
            var $polaroidCt = $('<div class="polaroid"></div>'),
                $imgCt = $('<div class="item"></div>'),
                $link = $('<a href="'+ imgInfo.url  +'"></a>'),
                $img = imgInfo.target;
            $img.height(rowHeight);

            $link.append($img);
            $polaroidCt.append($link);
            $imgCt.append($polaroidCt);
            _this.$node.append($imgCt);
        });

    },
    fetchItem : function() {
        var me = this;
        if(!this.isLoadingItem) {
            this.isLoadingItem = true;
            var apiKey = "2651964-fc07f3b29cadd5417e5fa1d02";
            var URL = "https://pixabay.com/api/?key="+ apiKey+"&page="+this.imgPage+"&per_page="+this.imgCount+"&image_type=photo";
            $.getJSON(URL, function(response){
                if (parseInt(response.totalHits) > 0) {
                    me.isLoadingItem = false;
                    me.loadImg(response['hits']);
                    me.imgPage++;
                    me.isLoadingItem = false;
                }
                else {
                    alert("已经没有更多照片了 :(");
                }
            });
        }
    },
    loadMore: function() {
        var _this = this;
        if(this.isVisible($('#loading')) && this.isLoaded) {
            this.isLoaded = false;
            var clock = setInterval(function() { //如果加载过后load图标依然可见,继续加载
                _this.fetchItem();
                if (!_this.isVisible($('#loading'))) {
                    clearInterval(clock);
                }
            },1000);
        }
    },
    isVisible: function($node){
        var sTop = $(window).scrollTop();
        var wHeight = $(window).height();
        var thisTop = $node.offset().top;

        return ((sTop + wHeight) > thisTop);
    }
};

var barrel = new Barrels($(".gallery"));

var clock;
$(window).scroll(function() {
    if (clock) {
        clearTimeout(clock);
    }
    clock = setTimeout(function () {
        barrel.loadMore();
    }, 100);
});
    