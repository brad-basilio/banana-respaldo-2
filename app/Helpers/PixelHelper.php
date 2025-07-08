<?php

namespace App\Helpers;

use App\Models\General;

class PixelHelper
{
    public static function getPixelScripts()
    {
        $generals = General::whereIn('correlative', [
            'google_analytics_id',
            'google_tag_manager_id',
            'facebook_pixel_id',
            'google_ads_conversion_id',
            'google_ads_conversion_label',
            'tiktok_pixel_id',
            'hotjar_id',
            'clarity_id',
            'linkedin_insight_tag',
            'twitter_pixel_id',
            'pinterest_tag_id',
            'snapchat_pixel_id',
            'custom_head_scripts',
            'custom_body_scripts'
        ])->get()->keyBy('correlative');

        $headScripts = '';
        $bodyScripts = '';

        // Google Analytics 4
        if ($gaId = $generals->get('google_analytics_id')?->description) {
            $headScripts .= "
<!-- Google Analytics -->
<script async src=\"https://www.googletagmanager.com/gtag/js?id={$gaId}\"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{$gaId}');
</script>
";
        }

        // Google Tag Manager
        if ($gtmId = $generals->get('google_tag_manager_id')?->description) {
            $headScripts .= "
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','{$gtmId}');</script>
";
            $bodyScripts .= "
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id={$gtmId}\"
height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>
";
        }

        // Facebook Pixel
        if ($fbPixelId = $generals->get('facebook_pixel_id')?->description) {
            $headScripts .= "
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{$fbPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height=\"1\" width=\"1\" style=\"display:none\"
src=\"https://www.facebook.com/tr?id={$fbPixelId}&ev=PageView&noscript=1\"/>
</noscript>
";
        }

        // TikTok Pixel
        if ($tiktokId = $generals->get('tiktok_pixel_id')?->description) {
            $headScripts .= "
<!-- TikTok Pixel -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=[\"page\",\"track\",\"identify\",\"instances\",\"debug\",\"on\",\"off\",\"once\",\"ready\",\"alias\",\"group\",\"enableCookie\",\"disableCookie\"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i=\"https://analytics.tiktok.com/i18n/pixel/events.js\";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement(\"script\");o.type=\"text/javascript\",o.async=!0,o.src=i+\"?sdkid=\"+e+\"&lib=\"+t;var a=document.getElementsByTagName(\"script\")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('{$tiktokId}');
  ttq.page();
}(window, document, 'ttq');
</script>
";
        }

        // Hotjar
        if ($hotjarId = $generals->get('hotjar_id')?->description) {
            $headScripts .= "
<!-- Hotjar Tracking -->
<script>
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:{$hotjarId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
";
        }

        // Microsoft Clarity
        if ($clarityId = $generals->get('clarity_id')?->description) {
            $headScripts .= "
<!-- Microsoft Clarity -->
<script type=\"text/javascript\">
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, \"clarity\", \"script\", \"{$clarityId}\");
</script>
";
        }

        // LinkedIn Insight Tag
        if ($linkedinId = $generals->get('linkedin_insight_tag')?->description) {
            $headScripts .= "
<!-- LinkedIn Insight Tag -->
<script type=\"text/javascript\">
_linkedin_partner_id = \"{$linkedinId}\";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type=\"text/javascript\">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName(\"script\")[0];
var b = document.createElement(\"script\");
b.type = \"text/javascript\";b.async = true;
b.src = \"https://snap.licdn.com/li.lms-analytics/insight.min.js\";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height=\"1\" width=\"1\" style=\"display:none;\" alt=\"\" src=\"https://px.ads.linkedin.com/collect/?pid={$linkedinId}&fmt=gif\" />
</noscript>
";
        }

        // Pinterest Tag
        if ($pinterestId = $generals->get('pinterest_tag_id')?->description) {
            $headScripts .= "
<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
n=window.pintrk;n.queue=[],n.version=\"3.0\";var
t=document.createElement(\"script\");t.async=!0,t.src=e;var
r=document.getElementsByTagName(\"script\")[0];
r.parentNode.insertBefore(t,r)}}(\"https://s.pinimg.com/ct/core.js\");
pintrk('load', '{$pinterestId}', {em: '<user_email_address>'});
pintrk('page');
</script>
<noscript>
<img height=\"1\" width=\"1\" style=\"display:none;\" alt=\"\"
src=\"https://ct.pinterest.com/v3/?event=init&tid={$pinterestId}&pd[em]=<hashed_email_address>&noscript=1\" />
</noscript>
";
        }

        // Snapchat Pixel
        if ($snapchatId = $generals->get('snapchat_pixel_id')?->description) {
            $headScripts .= "
<!-- Snapchat Pixel -->
<script type='text/javascript'>
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');
snaptr('init', '{$snapchatId}', {
'user_email': '__INSERT_USER_EMAIL__'
});
snaptr('track', 'PAGE_VIEW');
</script>
";
        }

        // Twitter Pixel
        if ($twitterId = $generals->get('twitter_pixel_id')?->description) {
            $headScripts .= "
<!-- Twitter Pixel -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('init','{$twitterId}');
twq('track','PageView');
</script>
";
        }        // Custom Scripts
        if ($customHead = $generals->get('custom_head_scripts')?->description) {
            $headScripts .= "\n<!-- Custom Head Scripts -->\n" . $customHead;
        }

        if ($customBody = $generals->get('custom_body_scripts')?->description) {
            $bodyScripts .= "\n<!-- Custom Body Scripts -->\n" . $customBody;
        }

        return [
            'head' => $headScripts,
            'body' => $bodyScripts
        ];
    }

    public static function getPixelData($correlative)
    {
        return General::where('correlative', $correlative)->value('description');
    }

    public static function trackPurchase($orderData)
    {
        $scripts = '';
        $generals = General::whereIn('correlative', [
            'facebook_pixel_id',
            'google_ads_conversion_id',
            'google_ads_conversion_label',
            'tiktok_pixel_id'
        ])->get()->keyBy('correlative');        // Facebook Pixel Purchase Event
        if ($fbPixelId = $generals->get('facebook_pixel_id')?->description) {
            $productIds = implode(',', array_map(fn($id) => "'$id'", $orderData['product_ids']));
            $scripts .= "
<script>
fbq('track', 'Purchase', {
    value: {$orderData['total']},
    currency: 'PEN',
    content_ids: [{$productIds}],
    content_type: 'product'
});
</script>
";
        }

        // Google Ads Conversion
        if ($conversionId = $generals->get('google_ads_conversion_id')?->description) {
            $conversionLabel = $generals->get('google_ads_conversion_label')?->description;
            if ($conversionLabel) {
                $scripts .= "
<script>
gtag('event', 'conversion', {
    'send_to': '{$conversionId}/{$conversionLabel}',
    'value': {$orderData['total']},
    'currency': 'PEN',
    'transaction_id': '{$orderData['order_id']}'
});
</script>
";
            }
        }

        // TikTok Pixel Purchase Event
        if ($tiktokId = $generals->get('tiktok_pixel_id')?->description) {
            $tiktokData = [
                'value' => $orderData['total'],
                'currency' => 'PEN',
                'content_id' => $orderData['order_id'],
                'content_type' => 'product'
            ];
            
            // Agregar email y teléfono si están disponibles
            if (!empty($orderData['email'])) {
                $tiktokData['email'] = $orderData['email'];
            }
            if (!empty($orderData['phone'])) {
                $tiktokData['phone'] = $orderData['phone'];
            }
            
            $tiktokDataJson = json_encode($tiktokData, JSON_UNESCAPED_UNICODE);
            
            $scripts .= "
<script>
ttq.track('CompletePayment', {$tiktokDataJson});
</script>
";
        }

        return $scripts;
    }
}
