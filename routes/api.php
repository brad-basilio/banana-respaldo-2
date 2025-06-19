<?php

use Illuminate\Support\Facades\Route;

// Admin
use App\Http\Controllers\Admin\AboutusController as AdminAboutusController;
use App\Http\Controllers\Admin\IndicatorController as AdminIndicatorController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Admin\SliderController as AdminSliderController;
use App\Http\Controllers\Admin\TestimonyController as AdminTestimonyController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CollectionController as AdminCollectionController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\SocialController as AdminSocialController;
use App\Http\Controllers\Admin\StrengthController as AdminStrengthController;
use App\Http\Controllers\Admin\GeneralController as AdminGeneralController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\AdController as AdminAdController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;

use App\Http\Controllers\Admin\DeliveryPriceController as AdminDeliveryPriceController;
use App\Http\Controllers\Admin\TypesDeliveryController as AdminTypesDeliveryController;
use App\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Admin\ItemController as AdminItemController;
use App\Http\Controllers\Admin\SaleController as AdminSaleController;
use App\Http\Controllers\Admin\HomeController as AdminHomeController;
use App\Http\Controllers\Customer\SaleController as CustomerSaleController;

use App\Http\Controllers\Admin\SubCategoryController as AdminSubCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\SystemColorController as AdminSystemColorController;
use App\Http\Controllers\Admin\SystemController as AdminSystemController;
use App\Http\Controllers\Admin\TagController as AdminTagController;
use App\Http\Controllers\Admin\WebDetailController as AdminWebDetailController;

use App\Http\Controllers\Admin\ItemImageController as AdminItemImageController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\ComboController as AdminComboController;
use App\Http\Controllers\Admin\DeliveryZoneController as AdminDeliveryZoneController;
use App\Http\Controllers\Admin\ImageUploadController;
use App\Http\Controllers\Admin\NotificationVariableController;
use App\Http\Controllers\Admin\RepositoryController as AdminRepositoryController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\AuthClientController;
// Public
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\CoverController;
use App\Http\Controllers\DeliveryPriceController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ItemImportController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ScrapController;
use App\Http\Controllers\TemporalyImageController;
use App\Http\Controllers\UnifiedImportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/ubigeo/search', [DeliveryPriceController::class, 'search'])->name('ubigeo.search');
Route::post('/scrap', [ScrapController::class, 'scrap']);
Route::post('/scrap-shopsimon', [ScrapController::class, 'scrapShopSimon']);

Route::post('/import-items', [ItemImportController::class, 'import']);

// Unified Import API
Route::post('/unified-import', [UnifiedImportController::class, 'import']);
Route::post('/unified-import/preview', [UnifiedImportController::class, 'preview']);
Route::get('/unified-import/field-mappings', [UnifiedImportController::class, 'getFieldMappings']);

Route::post('/complaints', [ComplaintController::class, 'saveComplaint']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);

Route::post('/login-client', [AuthClientController::class, 'login']);
Route::post('/signup-client', [AuthClientController::class, 'signup']);
Route::post('/forgot-password-client', [AuthClientController::class, 'forgotPassword']);
Route::post('/reset-password-client', [AuthClientController::class, 'resetPassword']);

Route::post('/delivery-prices', [DeliveryPriceController::class, 'getDeliveryPrice']);
Route::post('/prices-type', [DeliveryPriceController::class, 'getPrices']);

Route::get('/banners/media/{uuid}', [AdminBannerController::class, 'media']);
Route::get('/sliders/media/{uuid}', [AdminSliderController::class, 'media']);
Route::get('/categories/media/{uuid}', [AdminCategoryController::class, 'media']);
Route::get('/collections/media/{uuid}', [AdminCollectionController::class, 'media']);
Route::get('/subcategories/media/{uuid}', [AdminSubCategoryController::class, 'media']);
Route::get('/brands/media/{uuid}', [AdminBrandController::class, 'media']);
Route::get('/testimonies/media/{uuid}', [AdminTestimonyController::class, 'media']);
Route::get('/posts/media/{uuid}', [AdminPostController::class, 'media']);
Route::get('/items/media/{uuid}', [AdminItemController::class, 'media']);

Route::get('/item_images/media/{uuid}', [AdminItemImageController::class, 'media']);

Route::get('/indicators/media/{uuid}', [AdminIndicatorController::class, 'media']);

Route::get('/aboutuses/media/{uuid}', [AdminAboutusController::class, 'media']);
Route::get('/strengths/media/{uuid}', [AdminStrengthController::class, 'media']);
Route::get('/ads/media/{uuid}', [AdminAdController::class, 'media'])->withoutMiddleware('throttle');

Route::post('/posts/paginate', [PostController::class, 'paginate']);
Route::post('/items/paginate', [ItemController::class, 'paginate']);

Route::post('/messages', [MessageController::class, 'save']);
Route::post('/subscriptions', [SubscriptionController::class, 'save']);

Route::get('/cover/{uuid}', [CoverController::class, 'full']);
Route::get('/cover/thumbnail/{uuid}', [CoverController::class, 'thumbnail']);
Route::get('/mailing/notify', [BlogController::class, 'notifyToday']);
Route::delete('/mailing/down/{id}', [SubscriptionController::class, 'delete'])->name('mailing.down');

Route::post('/items/verify-stock', [ItemController::class, 'verifyStock']);
Route::post('/items/combo-items', [ItemController::class, 'verifyCombo']);
Route::post('/items/update-items', [ItemController::class, 'updateViews']);
Route::post('/items/relations-items', [ItemController::class, 'relationsItems']);
Route::post('/items/variations-items', [ItemController::class, 'variationsItems']);
Route::post('/items/searchProducts', [ItemController::class, 'searchProduct']);

Route::post('/pago', [PaymentController::class, 'charge']);
Route::get('/pago/{sale_id}', [PaymentController::class, 'getPaymentStatus']);

// Nuevas rutas para MercadoPago
Route::post('/mercadopago/preference', [MercadoPagoController::class, 'createPreference']);
Route::get('/mercadopago/success', [MercadoPagoController::class, 'handleSuccess']);
Route::get('/mercadopago/failure', [MercadoPagoController::class, 'handleFailure']);
Route::get('/mercadopago/pending', [MercadoPagoController::class, 'handlePending']);

Route::post('/temporaly-image', [TemporalyImageController::class, 'save'])->name('save_temporaly_image');
Route::post('/temporaly-image/{id}', [TemporalyImageController::class, 'delete'])->name('delete_temporaly_image');

Route::post('/vouchers/temp', [TemporalyImageController::class, 'storeTemp'])->name('voucher.temp');
Route::delete('/vouchers/temp/{id}', [TemporalyImageController::class, 'deleteTemp'])->name('voucher.delete');
Route::post('/guardarvoucher', [TemporalyImageController::class, 'guardarVoucher'])->name('guardarvoucher');

//pedido
Route::post('/orders', [MercadoPagoController::class, 'getOrder']);

Route::post('/sales', [SaleController::class, 'save']);

Route::get('/person/{dni}', [PersonController::class, 'find']);

Route::middleware('auth')->group(function () {
  Route::get('/notification-variables/{type}', [NotificationVariableController::class, 'variables']);
  Route::post('/upload-image', [ImageUploadController::class, 'store']);
  Route::delete('logout', [AuthController::class, 'destroy'])
    ->name('logout');
  Route::get('/profile/{uuid}', [AdminProfileController::class, 'full']);
  Route::get('/profile/thumbnail/{uuid}', [AdminProfileController::class, 'thumbnail']);
  Route::post('/profile', [AdminProfileController::class, 'saveProfile']);
  Route::patch('/profile', [AdminProfileController::class, 'save']);

  Route::middleware('can:Admin')->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminHomeController::class, 'dashboard']);
    Route::get('/sales/{id}', [AdminSaleController::class, 'get']);
    Route::post('/sales', [AdminSaleController::class, 'save']);
    Route::post('/sales/paginate', [AdminSaleController::class, 'paginate']);
    Route::patch('/sales/status', [AdminSaleController::class, 'status']);
    Route::patch('/sales/{field}', [AdminSaleController::class, 'boolean']);
    Route::delete('/sales/{id}', [AdminSaleController::class, 'delete']);

    //Route::get('/sale-statuses/by-sale/{id}', [AdminSaleStatusController::class, 'bySale']);

    Route::post('/web-details', [AdminWebDetailController::class, 'save']);
    Route::post('/gallery', [AdminGalleryController::class, 'save']);

    Route::post('/items', [AdminItemController::class, 'save']);
    Route::post('/items/paginate', [AdminItemController::class, 'paginate']);
    Route::patch('/items/status', [AdminItemController::class, 'status']);
    Route::patch('/items/{field}', [AdminItemController::class, 'boolean']);
    Route::delete('/items/{id}', [AdminItemController::class, 'delete']);

    // Cupones
    Route::post('/coupons', [AdminCouponController::class, 'save']);
    Route::post('/coupons/paginate', [AdminCouponController::class, 'paginate']);
    Route::patch('/coupons/{field}', [AdminCouponController::class, 'boolean']);
    Route::delete('/coupons/{id}', [AdminCouponController::class, 'delete']);
    Route::post('/coupons/validate', [AdminCouponController::class, 'validateCoupon']);
    Route::get('/coupons/generate-code', [AdminCouponController::class, 'generateCode']);

    Route::post('/ads', [AdminAdController::class, 'save']);
    Route::post('/ads/paginate', [AdminAdController::class, 'paginate']);
    Route::patch('/ads/status', [AdminAdController::class, 'status']);
    Route::patch('/ads/{field}', [AdminAdController::class, 'boolean']);
    Route::delete('/ads/{id}', [AdminAdController::class, 'delete']);


    //Route::get('/items/filters', [AdminItemController::class, 'getFilters']);

    Route::post('/combos', [AdminComboController::class, 'save']);
    Route::post('/combos/paginate', [AdminComboController::class, 'paginate']);
    Route::patch('/combos/status', [AdminComboController::class, 'status']);
    Route::patch('/combos/{field}', [AdminComboController::class, 'boolean']);
    Route::delete('/combos/{id}', [AdminComboController::class, 'delete']);
    Route::get('/combos/{id}', [AdminComboController::class, 'show']);



    Route::post('/messages', [AdminMessageController::class, 'save']);
    Route::post('/messages/paginate', [AdminMessageController::class, 'paginate']);
    Route::patch('/messages/status', [AdminMessageController::class, 'status']);
    Route::patch('/messages/{field}', [AdminMessageController::class, 'boolean']);
    Route::delete('/messages/{id}', [AdminMessageController::class, 'delete']);

    Route::post('/subscriptions/paginate', [AdminSubscriptionController::class, 'paginate']);
    Route::patch('/subscriptions/status', [AdminSubscriptionController::class, 'status']);
    Route::delete('/subscriptions/{id}', [AdminSubscriptionController::class, 'delete']);

    Route::post('/posts', [AdminPostController::class, 'save']);
    Route::post('/posts/paginate', [AdminPostController::class, 'paginate']);
    Route::patch('/posts/status', [AdminPostController::class, 'status']);
    Route::patch('/posts/{field}', [AdminPostController::class, 'boolean']);
    Route::delete('/posts/{id}', [AdminPostController::class, 'delete']);

    Route::post('/aboutus', [AdminAboutusController::class, 'save']);
    Route::post('/aboutus/paginate', [AdminAboutusController::class, 'paginate']);
    Route::patch('/aboutus/status', [AdminAboutusController::class, 'status']);
    Route::patch('/aboutus/{field}', [AdminAboutusController::class, 'boolean']);
    Route::delete('/aboutus/{id}', [AdminAboutusController::class, 'delete']);

    Route::post('/indicators', [AdminIndicatorController::class, 'save']);
    Route::post('/indicators/paginate', [AdminIndicatorController::class, 'paginate']);
    Route::patch('/indicators/status', [AdminIndicatorController::class, 'status']);
    Route::patch('/indicators/{field}', [AdminIndicatorController::class, 'boolean']);
    Route::delete('/indicators/{id}', [AdminIndicatorController::class, 'delete']);

    Route::post('/faqs', [AdminFaqController::class, 'save']);
    Route::post('/faqs/paginate', [AdminFaqController::class, 'paginate']);
    Route::patch('/faqs/status', [AdminFaqController::class, 'status']);
    Route::patch('/faqs/{field}', [AdminFaqController::class, 'boolean']);
    Route::delete('/faqs/{id}', [AdminFaqController::class, 'delete']);


    Route::post('/banners', [AdminBannerController::class, 'save']);
    Route::post('/banners/paginate', [AdminBannerController::class, 'paginate']);
    Route::patch('/banners/status', [AdminBannerController::class, 'status']);
    Route::patch('/banners/{field}', [AdminBannerController::class, 'boolean']);
    Route::delete('/banners/{id}', [AdminBannerController::class, 'delete']);

    Route::post('/sliders', [AdminSliderController::class, 'save']);
    Route::post('/sliders/paginate', [AdminSliderController::class, 'paginate']);
    Route::patch('/sliders/status', [AdminSliderController::class, 'status']);
    Route::patch('/sliders/{field}', [AdminSliderController::class, 'boolean']);
    Route::delete('/sliders/{id}', [AdminSliderController::class, 'delete']);

    Route::post('/testimonies', [AdminTestimonyController::class, 'save']);
    Route::post('/testimonies/paginate', [AdminTestimonyController::class, 'paginate']);
    Route::patch('/testimonies/status', [AdminTestimonyController::class, 'status']);
    Route::patch('/testimonies/{field}', [AdminTestimonyController::class, 'boolean']);
    Route::delete('/testimonies/{id}', [AdminTestimonyController::class, 'delete']);

    Route::post('/categories', [AdminCategoryController::class, 'save']);
    Route::post('/categories/paginate', [AdminCategoryController::class, 'paginate']);
    Route::patch('/categories/status', [AdminCategoryController::class, 'status']);
    Route::patch('/categories/{field}', [AdminCategoryController::class, 'boolean']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'delete']);

    Route::post('/collections', [AdminCollectionController::class, 'save']);
    Route::post('/collections/paginate', [AdminCollectionController::class, 'paginate']);
    Route::patch('/collections/status', [AdminCollectionController::class, 'status']);
    Route::patch('/collections/{field}', [AdminCollectionController::class, 'boolean']);
    Route::delete('/collections/{id}', [AdminCollectionController::class, 'delete']);

    Route::post('/subcategories', [AdminSubCategoryController::class, 'save']);
    Route::post('/subcategories/paginate', [AdminSubCategoryController::class, 'paginate']);
    Route::patch('/subcategories/status', [AdminSubCategoryController::class, 'status']);
    Route::patch('/subcategories/{field}', [AdminSubCategoryController::class, 'boolean']);
    Route::delete('/subcategories/{id}', [AdminSubCategoryController::class, 'delete']);

    Route::post('/brands', [AdminBrandController::class, 'save']);
    Route::post('/brands/paginate', [AdminBrandController::class, 'paginate']);
    Route::patch('/brands/status', [AdminBrandController::class, 'status']);
    Route::patch('/brands/{field}', [AdminBrandController::class, 'boolean']);
    Route::delete('/brands/{id}', [AdminBrandController::class, 'delete']);

    Route::post('/prices', [AdminDeliveryPriceController::class, 'save']);
    Route::post('/prices/paginate', [AdminDeliveryPriceController::class, 'paginate']);
    Route::post('/prices/massive', [AdminDeliveryPriceController::class, 'massive']);
    Route::patch('/prices/status', [AdminDeliveryPriceController::class, 'status']);
    Route::patch('/prices/{field}', [AdminDeliveryPriceController::class, 'boolean']);
    Route::delete('/prices/{id}', [AdminDeliveryPriceController::class, 'delete']);

    Route::post('/types_delivery', [AdminTypesDeliveryController::class, 'save']);
    Route::post('/types_delivery/paginate', [AdminTypesDeliveryController::class, 'paginate']);
    Route::post('/types_delivery/massive', [AdminTypesDeliveryController::class, 'massive']);
    Route::patch('/types_delivery/status', [AdminTypesDeliveryController::class, 'status']);
    Route::patch('/types_delivery/{field}', [AdminTypesDeliveryController::class, 'boolean']);
    Route::delete('/types_delivery/{id}', [AdminTypesDeliveryController::class, 'delete']);

    Route::post('/tags', [AdminTagController::class, 'save']);
    Route::post('/tags/paginate', [AdminTagController::class, 'paginate']);
    Route::patch('/tags/status', [AdminTagController::class, 'status']);
    Route::patch('/tags/{field}', [AdminTagController::class, 'boolean']);
    Route::delete('/tags/{id}', [AdminTagController::class, 'delete']);

    Route::post('/delivery-zones', [AdminDeliveryZoneController::class, 'save']);
    Route::post('/delivery-zones/paginate', [AdminDeliveryZoneController::class, 'paginate']);
    Route::patch('/delivery-zones/status', [AdminDeliveryZoneController::class, 'status']);
    Route::patch('/delivery-zones/{field}', [AdminDeliveryZoneController::class, 'boolean']);
    Route::delete('/delivery-zones/{id}', [AdminDeliveryZoneController::class, 'delete']);

    Route::post('/strengths', [AdminStrengthController::class, 'save']);
    Route::post('/strengths/paginate', [AdminStrengthController::class, 'paginate']);
    Route::patch('/strengths/status', [AdminStrengthController::class, 'status']);
    Route::patch('/strengths/{field}', [AdminStrengthController::class, 'boolean']);
    Route::delete('/strengths/{id}', [AdminStrengthController::class, 'delete']);

    Route::post('/socials', [AdminSocialController::class, 'save']);
    Route::post('/socials/paginate', [AdminSocialController::class, 'paginate']);
    Route::patch('/socials/status', [AdminSocialController::class, 'status']);
    Route::patch('/socials/{field}', [AdminSocialController::class, 'boolean']);
    Route::delete('/socials/{id}', [AdminSocialController::class, 'delete']);

    Route::middleware(['can:Root'])->group(function () {
      Route::post('/system', [AdminSystemController::class, 'save']);
      Route::post('/system/page', [AdminSystemController::class, 'savePage']);
      Route::delete('/system/page/{id}', [AdminSystemController::class, 'deletePage']);
      Route::patch('/system/order', [AdminSystemController::class, 'updateOrder']);
      Route::delete('/system/{id}', [AdminSystemController::class, 'delete']);

      Route::get('/system/backup', [AdminSystemController::class, 'exportBK']);
      Route::post('/system/backup', [AdminSystemController::class, 'importBK']);

      Route::post('/colors', [AdminSystemColorController::class, 'save']);

      Route::get('/system/fetch-remote-changes', [AdminSystemController::class, 'fetchRemoteChanges']);
      Route::get('/system/has-remote-changes', [AdminSystemController::class, 'hasRemoteChanges']);

      Route::get('/system/related/{model}/{method}', [AdminSystemController::class, 'getRelatedFilter']);
    });

    Route::post('/repository', [AdminRepositoryController::class, 'save']);
    Route::post('/repository/paginate', [AdminRepositoryController::class, 'paginate']);
    Route::delete('/repository/{id}', [AdminRepositoryController::class, 'delete']);

    Route::post('/settings', [AdminSettingController::class, 'save']);
    Route::post('/settings/paginate', [AdminSettingController::class, 'paginate']);
    Route::patch('/settings/status', [AdminSettingController::class, 'status']);
    Route::delete('/settings/{id}', [AdminSettingController::class, 'delete']);

    Route::post('/generals', [AdminGeneralController::class, 'save']);
    Route::post('/generals/paginate', [AdminGeneralController::class, 'paginate']);
    Route::patch('/generals/status', [AdminGeneralController::class, 'status']);
    Route::patch('/generals/{field}', [AdminGeneralController::class, 'boolean']);
    Route::delete('/generals/{id}', [AdminGeneralController::class, 'delete']);



    Route::patch('/account/email', [AdminAccountController::class, 'email']);
    Route::patch('/account/password', [AdminAccountController::class, 'password']);
  });

  Route::middleware('can:Customer')->prefix('customer')->group(function () {

    Route::get('/sales/{id}', [CustomerSaleController::class, 'get']);
    Route::post('/sales', [CustomerSaleController::class, 'save']);
    Route::post('/sales/paginate', [CustomerSaleController::class, 'paginate']);
    Route::patch('/sales/status', [CustomerSaleController::class, 'status']);
    Route::patch('/sales/{field}', [CustomerSaleController::class, 'boolean']);
    Route::delete('/sales/{id}', [CustomerSaleController::class, 'delete']);
  });
});
