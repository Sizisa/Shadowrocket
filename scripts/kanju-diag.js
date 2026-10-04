/* 看剧AI 定向诊断：不执行页面 JS，不修改广告配置，不记录响应内容或 URL 查询参数。 */
(function () {
    var body = $response && $response.body;
    if (typeof body !== 'string') return $done({});
    var request = ($request && $request.url) || '';
    var origin = request.match(/^https?:\/\/[^/?#]+/i);
    var host = origin ? origin[0] : '(unknown host)';
    var isHtml = /<!doctype\s+html|<html\b/i.test(body.slice(0, 4000));
    console.log('[KANJU-DIAG html1] host=' + host + ' html=' + isHtml + ' bytes=' + body.length + ' app_experience=' + (body.indexOf('app_experience') !== -1));
    if (!isHtml || body.indexOf('kab-diag-static') !== -1) return $done({});
    var safe = host.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    var banner = '<div id="kab-diag-static" style="position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);left:8px;right:8px;z-index:2147483647;padding:12px;background:#143b62;color:#fff;border:2px solid #60a5fa;border-radius:8px;font:14px/1.5 -apple-system,sans-serif;text-align:center;pointer-events:none">看剧诊断：HTML 已改写（无需 JS）<br>' + safe + '<br>html1 · 测完请停用诊断模块</div>';
    if (/<body\b[^>]*>/i.test(body)) body = body.replace(/<body\b[^>]*>/i, function (tag) { return tag + banner; });
    else body += banner;
    var headers = {};
    Object.keys($response.headers || {}).forEach(function (key) {
        if (key.toLowerCase() !== 'content-length') headers[key] = $response.headers[key];
    });
    $done({body:body,headers:headers});
})();
