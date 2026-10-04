/*
 * 看剧AI 诊断脚本(临时)
 *
 * 用途:确认小火箭的 MITM + 脚本注入链路到底通不通,并暴露 app 实际访问的域名。
 *
 * 用法:配合 KanjuAI-Diag.sgmodule 使用。开启后打开任意网页或目标 app,
 *      只要页面顶部出现蓝色浮层,就说明 MITM 解密 + 脚本执行 + body 改写全链路正常,
 *      浮层里显示的 URL 就是实际请求地址(据此就能知道 app 用的是哪个域名)。
 *
 * 测完请删除诊断模块,并把 MITM 里追加的 * 去掉。
 */

(function () {
    var raw = $response && $response.body;
    var body = "";

    if (typeof raw === "string") {
        body = raw;
    } else if (raw && typeof raw === "object" && typeof raw.length === "number") {
        try {
            var bytes = (raw instanceof Uint8Array) ? raw : new Uint8Array(raw);
            if (typeof TextDecoder !== "undefined") {
                body = new TextDecoder("utf-8").decode(bytes);
            } else {
                var s = "";
                for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
                body = decodeURIComponent(escape(s));
            }
        } catch (e) { body = ""; }
    }

    if (!body) return $done({});

    var head = body.slice(0, 4000).toLowerCase();
    var isHtml = head.indexOf("<!doctype html") !== -1 || head.indexOf("<html") !== -1;
    if (!isHtml) return $done({});
    if (body.indexOf("kab-diag-box") !== -1) return $done({});   // 幂等

    var url = ($request && $request.url) || "(未知)";
    var t = new Date();
    var stamp = t.getHours() + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2);

    var css = [
        "position:fixed", "left:50%", "transform:translateX(-50%)",
        "top:calc(env(safe-area-inset-top, 0px) + 12px)",
        "z-index:2147483647", "max-width:92vw", "box-sizing:border-box",
        "padding:9px 13px", "border-radius:12px",
        "background:rgba(12,14,18,.95)", "color:#fff",
        "font:500 11px/1.45 -apple-system,BlinkMacSystemFont,sans-serif",
        "box-shadow:0 8px 28px rgba(0,0,0,.55)",
        "border:1px solid rgba(96,165,250,.65)",
        "word-break:break-all", "text-align:left"
    ].join(";");

    var box = '<div id="kab-diag-box" style="' + css + '">' +
        '<div style="font-weight:700;font-size:12px;margin-bottom:2px">\uD83D\uDD0D 注入链路正常</div>' +
        '<div style="opacity:.9">' + url + '</div>' +
        '<div style="opacity:.45;font-size:10px;margin-top:2px">' +
            stamp + ' \u00b7 诊断浮层,测完请删除诊断模块' +
        '</div>' +
    '</div>';

    var tag = '<script>(function(){var h=' + JSON.stringify(box) +
        ';function go(){if(document.getElementById("kab-diag-box"))return;' +
        'var w=document.createElement("div");w.innerHTML=h;document.body.appendChild(w.firstChild);}' +
        'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",go);}else{go();}})();<\/script>';

    if (body.indexOf("</head>") !== -1) {
        body = body.replace("</head>", tag + "</head>");
    } else if (body.indexOf("<body") !== -1) {
        body = body.replace("<body", tag + "<body");
    } else {
        body = tag + body;
    }

    $done({ body: body });
})();
