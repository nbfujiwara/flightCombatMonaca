var UtilWindow = (function () {
    function UtilWindow() {
    }
    UtilWindow.fillWindowSize = function (contentsWidth) {
        document.getElementsByTagName('html')[0].style.zoom = (UtilWindow.getWindowWidth() / contentsWidth).toString();
    };
    UtilWindow.getWindowWidth = function () {
        var w = 0;
        if (0) {
            w = 1;
        }
        else if (window.innerWidth) {
            w = window.innerWidth;
        }
        else if (window.screen.availWidth) {
            w = window.screen.availWidth;
        }
        else if (document.documentElement && document.documentElement.clientWidth != 0) {
            w = document.documentElement.clientWidth;
        }
        else if (document.body) {
            w = document.body.clientWidth;
        }
        return w;
    };
    UtilWindow.getWindowHeight = function () {
        var w = 0;
        if (0) {
            w = 1;
        }
        else if (window.innerHeight) {
            w = window.innerHeight;
        }
        else if (window.screen.availHeight) {
            w = window.screen.availHeight;
        }
        else if (document.documentElement && document.documentElement.clientHeight != 0) {
            w = document.documentElement.clientHeight;
        }
        else if (document.body) {
            w = document.body.clientHeight;
        }
        return w;
    };
    UtilWindow.setViewPortForce = function (contentsWidth) {
        var scale = Math.floor(contentsWidth / UtilWindow.getWindowWidth() * 100) / 100;
        var meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        //meta.setAttribute('content', 'width=device-width ,initial-scale=' + scale + ', user-scalable=no');
        //meta.setAttribute('content', 'width=' + contentsWidth + ', user-scalable=no');
        meta.setAttribute('content', 'width=device-width ,initial-scale=' + scale);
        document.getElementsByTagName('head')[0].appendChild(meta);
    };
    UtilWindow.testWindowSize = function () {
        var msg = "w1=" + window.innerWidth;
        msg += "\nw2=" + document.documentElement.clientWidth;
        msg += "\nw3=" + document.body.clientWidth;
        msg += "\nw4=" + screen.width;
        msg += "\nw5=" + screen.availWidth;
        msg += "\nw6=" + window.outerWidth;
        alert(msg);
    };
    return UtilWindow;
}());
