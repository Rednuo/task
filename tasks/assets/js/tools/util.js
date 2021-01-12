export const getQueryParams = (name, url) => {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
};

export const getWindowInnerHeight = () => {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

export const getWindowInnerWidth = () => {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

export const getHybridVersion = () => {
    if( getQueryParams('platform') && (getQueryParams('platform')==='ios' || getQueryParams('platform')==='android') ){
        return getQueryParams('version')
    }else{
        return false;
    }
};

export const getLocalDate = (dateTimeStamp) => {
    let day = dateTimeStamp.getDate() < 10 ? '0' + dateTimeStamp.getDate() : dateTimeStamp.getDate(),
        month = dateTimeStamp.getMonth() + 1 < 10 ? '0' + (dateTimeStamp.getMonth() + 1) : dateTimeStamp.getMonth() + 1,
        year = dateTimeStamp.getFullYear(),
        result = year + '年' + month + '月' + day + '日';
    return result;
}

export const getDate = (dateTimeStamp = new Date()) => {
    let day = dateTimeStamp.getDate() < 10 ? '0' + dateTimeStamp.getDate() : dateTimeStamp.getDate(),
        month = dateTimeStamp.getMonth() + 1 < 10 ? '0' + (dateTimeStamp.getMonth() + 1) : dateTimeStamp.getMonth() + 1,
        year = dateTimeStamp.getFullYear(),
        result = year + '-' + month + '-' + day;
    return result;
}
export const getYesterdayDate = (dateTimeStamp = new Date()) => {
    dateTimeStamp=new Date(dateTimeStamp.getTime()-24*60*60*1000);
    let day = dateTimeStamp.getDate() < 10 ? '0' + dateTimeStamp.getDate() : dateTimeStamp.getDate(),
        month = dateTimeStamp.getMonth() + 1 < 10 ? '0' + (dateTimeStamp.getMonth() + 1) : dateTimeStamp.getMonth() + 1,
        year = dateTimeStamp.getFullYear(),
        result = year + '-' + month + '-' + day;
    return result;
}
export const getTomorrowDate = (dateTimeStamp = new Date()) => {
    dateTimeStamp=new Date(dateTimeStamp.getTime()+24*60*60*1000);
    let day = dateTimeStamp.getDate() < 10 ? '0' + dateTimeStamp.getDate() : dateTimeStamp.getDate(),
        month = dateTimeStamp.getMonth() + 1 < 10 ? '0' + (dateTimeStamp.getMonth() + 1) : dateTimeStamp.getMonth() + 1,
        year = dateTimeStamp.getFullYear(),
        result = year + '-' + month + '-' + day;
    return result;
}

export const getDateDiff = (dateTimeStamp) => {
    let minute = 1000 * 60,
        hour = minute * 60,
        day = hour * 24,
        month = day * 30,
        year = month * 12,
        now = new Date().getTime(),
        diffValue = now - dateTimeStamp,
        result = '';

    if (diffValue < 0) {
        return;
    }

    let yearC = diffValue / year,
        monthC = diffValue / month,
        weekC = diffValue / (7 * day),
        dayC = diffValue / day,
        hourC = diffValue / hour,
        minC = diffValue / minute;
    if (yearC >= 1) {
        result = "" + parseInt(yearC) + "年前";
    } else if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else {
        result = "刚刚";
    }
    return result;
};

export const formatLargeNum = (num)=>{
    if(num>100000000){
        return (num/100000000).toFixed(1)+'亿';
    }else if(num>10000){
        return (num%10000>0 ? (num/10000).toFixed(1) : num/10000) +'w';
    }else{
        return num;
    }
}

export const getAndroidClientVersion = () => {
    if(navigator.userAgent.indexOf("Android")>-1){
        return parseFloat(navigator.userAgent.slice(navigator.userAgent.indexOf("Android")+8),10);
    }else{
        return -1;
    }
};

export const sortBookNodesAndAds = ( data ) => {
    let nodes = data.nodes || [],
        spread = data.spread || [],
        nodesTemp = [],
        spreadTemp = [];

    for( let i=0; i<nodes.length; i++){
        for(let j=0; j<spread.length; j++){
            if(spread[j].order===1){
                spreadTemp.push(spread[i]);
                spread.splice(0,1);
            }else{
                if(spread[j].order<=nodes[i].order){
                    nodesTemp.push(spread[j]);
                    spread.splice(0,1);
                }
            }
        }
        nodesTemp.push(nodes[i])
    }
    return { nodes:nodesTemp, spread:spreadTemp };
};

/*
    spread
    1 轮换
    2 大图
    3 2矩形
    4 4矩形
*/
export const sortBookNodesAndAdsNew = ( data ) => {
    let spread = data.spread,
        nodes = data.nodes,
        topSpread = [],
        bottomSpread = [];
    for(let i=0; i<spread.length; i++){
        if( spread[i].order === 0 ){
            topSpread.push(spread[i])
        }else{
            bottomSpread.push(spread[i]);
            (nodes.length>spread[i].order)?nodes.splice(spread[i].order-1,0,spread[i]):null
        }
    }
    return { nodes:nodes, spread:topSpread };
};

/*
    spread
    1 轮换
    2 大图
    3 2矩形
    4 4矩形
*/
/*export const sortBookNodesAndAdsForLazyload = ( data ) => {
    let spread = data.spread,
        nodes = data.nodes,
        bookListNodes = data.bookList || [],
        topSpread = [],
        bottomSpread = [];
    for(let i=0; i<spread.length; i++){
        if( spread[i].order === 0 ){
            topSpread.push(spread[i])
        }else{
            bottomSpread.push(spread[i]);
        }
    }
    nodes = nodes.concat(bottomSpread);
    nodes = nodes.concat(bookListNodes);
    nodes = nodes.sort((pre, next)=>{
        return pre.order - next.order;
    })
    console.log( { nodes:nodes, spread:topSpread } )
    return { nodes:nodes, spread:topSpread };
};*/

export const sortBookNodesAndAdsForLazyload = ( data ) => {
    let spread = data.spread || [],
        nodes = data.nodes || [],
        nodeids = data.nodeids || [],
        bookListNodes = data.bookList || [],
        topSpread = [],
        bottomSpread = [];

    for(let i=0; i<spread.length; i++){
        if( spread[i].order === 0 ){
            topSpread.push(spread[i])
        }else if(spread[i].order <= nodes.length){
            nodes.push( spread[i] );
        }else{
            bottomSpread.push(spread[i]);
        }
    }

    nodeids = nodeids.concat(bottomSpread);
    nodeids = nodeids.concat(bookListNodes);
    nodeids = nodeids.sort((pre, next)=>{
        return pre.order - next.order;
    })
    nodes = nodes.sort((pre, next)=>{
        return pre.order - next.order;
    })
    console.log( { spread:topSpread, nodes:nodes, nodeids: nodeids } )
    return { spread:topSpread, nodes:nodes, nodeids: nodeids };
};

export const releaseVerticalTouchEvent = ( id ) => {
    if( getQueryParams('platform')==='android' ){
        window.mLastClientX = 0;
        window.mLastClientY = 0;
        window.isBeingDrag = false;
        window.touchSlop = 20;
        function handleTouchEvent( event ){
            var touch=event.touches[0];
            switch (event.type){
                case "touchstart":
                    mLastClientX=touch.clientX;
                    mLastClientY=touch.clientY;
                    window.isBeingDrag=false;
                    HybridApi.releaseSlide( true );
                    break;
                case "touchmove":
                    // if (!window.isBeingDrag){
                        var xDiff=Math.abs(touch.clientX - mLastClientX);
                        var yDiff=Math.abs(touch.clientY - mLastClientY);
                        // console.log(xDiff+" "+yDiff);
                        if (xDiff>=20){
                            window.isBeingDrag=true;
                            HybridApi.releaseSlide( true );
                        } else if(yDiff>20){
                            //产生app纵向滑动,父控件不强制请求放行事件,这段逻辑主要是不影响外层垂直滑动控件的滑动
                            //js端控制滑动与app端的标准不一样,所以结合上面的onSliderMove:function方法来判断
                            //如果H5端控件已经产生滑动时则必须请求父控件放行事件
                            //如果有些开源控件没有类似onSliderMove方法时,只需提供控件是否产生滑动就行,原理都是一样
                            window.isBeingDrag=true;
                            HybridApi.releaseSlide( false );
                        }
                    // }
                    break;
                case "touchend":
                    window.isBeingDrag=false;
                    HybridApi.releaseSlide( false );
                    break;
            }
        }

        document.getElementById(id).addEventListener("touchstart", handleTouchEvent, false);
        document.getElementById(id).addEventListener("touchmove", handleTouchEvent, false);
        document.getElementById(id).addEventListener("touchend", handleTouchEvent, false);
    }
}

export const getRandomElementFromArray = ( array=[], length=0 ) => {
    let subScriptObject = {},
        randomElement = [],
        temp;
    if( array.length < length ){
        return array;
    }else{
        while( randomElement.length < length ){
            temp = Math.floor(Math.random() * array.length);
            if( !subScriptObject[temp] ){
                subScriptObject[temp] = true;
                randomElement.push(array[temp])
            }
        }
        return randomElement;
    }
}

export const getAvoidanceArray = ( ) => {
    if( getQueryParams('platform')=='android' ){
        return (window.ZssqAndroidApi&&window.ZssqAndroidApi.getAvoidanceArray) ? JSON.parse(window.ZssqAndroidApi.getAvoidanceArray()+'') : [];
    }else{
        return window.avoidanceArray || [];
    }
}

/*
    data.title 表示是书籍节点
*/
export const avoidance = (data, avoidance, nodesBooksLength=5) => {

    window.preShowBookIds = window.preShowBookIds || [];

    let temp = [],
        preShowBookIds = window.preShowBookIds || [],
        newAvoidance = avoidance.concat(preShowBookIds),
        avoidanceStr = newAvoidance.join(','),
        resultBooksLength = 0;

    /*if( !data.hasRender && data.books.length>0 ){
        if( newAvoidance.length > 0 ){
            //是否开启曝光回避
            if( +data.exposureType===2 ){
                for( let i=0; i<data.books.length; i++){
                    if( !avoidanceStr.match(data.books[i]['_id']) ){
                        temp.push(data.books[i])
                    }
                }
            }else{
                for( let j=0; j<data.books.length; j++){
                    if( !preShowBookIds.join(',').match(data.books[j]['_id']) ){
                        temp.push(data.books[j])
                    }
                }
            }
            //曝光回避加去重后的数量
            if( temp.length>=nodesBooksLength || (!data.title && temp.length>0) ){
                data.books = temp;
            }
        }

        if(data.title){
            resultBooksLength = data.books.length>nodesBooksLength ? nodesBooksLength : data.books.length;
            for( let x=0; x<resultBooksLength; x++){
                window.preShowBookIds.push(data.books[x]['_id'])
            }
        }
    }

    //猜你喜欢接口不做处理
    data.hasRender = data.title ? true : false;*/

    if( !data.hasRender && data.books.length>0 ){
        if( newAvoidance.length > 0 ){
            //是否开启曝光回避
            if( +data.exposureType===2 ){
                for( let i=0; i<data.books.length; i++){
                    if( !avoidanceStr.match(data.books[i]['_id']) ){
                        temp.push(data.books[i])
                    }
                }
            }else{
                for( let j=0; j<data.books.length; j++){
                    if( !preShowBookIds.join(',').match(data.books[j]['_id']) ){
                        temp.push(data.books[j])
                    }
                }
            }
            //曝光回避加去重后的数量
            if( temp.length>=nodesBooksLength || (!data.title && temp.length>0) ){
                data.books = temp;
            }
        }

        resultBooksLength = data.books.length>nodesBooksLength ? nodesBooksLength : data.books.length;


        if( !data.ignoreInsertToPreShowBookIds ){
            resultBooksLength = data.books.length>nodesBooksLength ? nodesBooksLength : data.books.length;
            for( let x=0; x<resultBooksLength; x++){
                window.preShowBookIds.push(data.books[x]['_id'])
            }
        }

        data.hasRender = !data.ignoreInsertToPreShowBookIds ? true : false;
    }

    return data;
}

export const getWebviewVersion = () => {
    let version = getQueryParams('version') ? +getQueryParams('version') : -1;
    return version;
}