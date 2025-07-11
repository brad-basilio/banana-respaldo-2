<?php

use Illuminate\Support\Facades\Route;

// Admin
use App\Http\Controllers\Admin\AboutusController as AdminAboutusController;
use App\Http\Controllers\Admin\HomeController as AdminHomeController;
use App\Http\Controllers\Admin\IndicatorController as AdminIndicatorController;
use App\Http\Controllers\Admin\SliderController as AdminSliderController;
use App\Http\Controllers\Admin\TestimonyController as AdminTestimonyController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CollectionController as AdminCollectionController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\SocialController as AdminSocialController;
use App\Http\Controllers\Admin\StrengthController as AdminStrengthController;
use App\Http\Controllers\Admin\CertificationController as AdminCertificationController;
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Admin\GeneralController as AdminGeneralController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Test\PixelTestController;
use App\Http\Controllers\Test\NotificationTestController;
use App\Http\Controllers\Customer\SaleController as CustomerSaleController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\AdController as AdminAdController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\ItemController as AdminItemController;
use App\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Admin\SystemController as AdminSystemController;
use App\Http\Controllers\Admin\TagController as AdminTagController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\ComboController as AdminComboController;
use App\Http\Controllers\Admin\DeliveryPriceController as AdminDeliveryPriceController;
use App\Http\Controllers\Admin\DeliveryZoneController as AdminDeliveryZoneController;
use App\Http\Controllers\Admin\SaleController as AdminSaleController;
use App\Http\Controllers\Admin\SubCategoryController as AdminSubCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DiscountRulesController as AdminDiscountRulesController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\RepositoryController as AdminRepositoryController;
use App\Http\Controllers\Admin\SaleStatusController as AdminSaleStatusController;
// Public 
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SystemController;
use SoDe\Extend\File;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', fn() => view('coming-soon'));

// Ruta de test para píxeles (solo para desarrollo)
Route::get('/test/pixels', [PixelTestController::class, 'index'])->name('test.pixels');
Route::get('/test/product-tracking', fn() => view('examples.product-tracking'))->name('test.product-tracking');

// Test de notificaciones
Route::get('/test/notifications', [NotificationTestController::class, 'index'])->name('test.notifications');
Route::post('/test/notifications/contact', [NotificationTestController::class, 'testContactNotification']);
Route::post('/test/notifications/purchase', [NotificationTestController::class, 'testPurchaseNotification']);
Route::get('/test/notifications/corporate-email', [NotificationTestController::class, 'checkCorporateEmail']);

// Verificar si el archivo existe, si no, crear uno vacío
$filePath = storage_path('app/pages.json');
if (!file_exists($filePath)) {
    file_put_contents($filePath, json_encode([]));
}

$pages = json_decode(File::get($filePath), true);

// Public routes
foreach ($pages as $page) {
    Route::get($page['path'], [SystemController::class, 'reactView'])->name('System.jsx');
}

Route::get('/base-template', [SystemController::class, 'reactView'])->name('System.jsx');
Route::get('/login', [AuthController::class, 'loginView'])->name('Login.jsx');
Route::middleware('auth')->group(function () {
    Route::get('/profile', [AdminProfileController::class, 'reactView'])->name('Admin/Profile.jsx');
    Route::get('/account', [AdminAccountController::class, 'reactView'])->name('Admin/Account.jsx');
});

// Admin routes
Route::middleware(['can:Admin', 'auth'])->prefix('admin')->group(function () {
    Route::get('/', fn() => redirect()->route('Admin/Home.jsx'));
    Route::get('/home', [AdminHomeController::class, 'reactView'])->name('Admin/Home.jsx');
    Route::get('/sales', [AdminSaleController::class, 'reactView'])->name('Admin/Sales.jsx');
    Route::get('/items', [AdminItemController::class, 'reactView'])->name('Admin/Items.jsx');
    Route::get('/coupons', [AdminCouponController::class, 'reactView'])->name('Admin/Coupons.jsx');
    Route::get('/discount-rules', [AdminDiscountRulesController::class, 'reactView'])->name('Admin/DiscountRules.jsx');
    Route::get('/ads', [AdminAdController::class, 'reactView'])->name('Admin/Ads.jsx');

    Route::get('/combos', [AdminComboController::class, 'reactView'])->name('Admin/Combos.jsx');

    Route::get('/categories', [AdminCategoryController::class, 'reactView'])->name('Admin/Categories.jsx');
    Route::get('/collections', [AdminCollectionController::class, 'reactView'])->name('Admin/Collections.jsx');
    Route::get('/subcategories', [AdminSubCategoryController::class, 'reactView'])->name('Admin/SubCategories.jsx');
    Route::get('/brands', [AdminBrandController::class, 'reactView'])->name('Admin/Brands.jsx');
    Route::get('/tags', [AdminTagController::class, 'reactView'])->name('Admin/Tags.jsx');
    Route::get('/prices', [AdminDeliveryPriceController::class, 'reactView'])->name('Admin/DeliveryPricesType.jsx');
    Route::get('/messages', [AdminSubscriptionController::class, 'reactView'])->name('Admin/Messages.jsx');
    Route::get('/subscriptions', [AdminSubscriptionController::class, 'reactView'])->name('Admin/Subscriptions.jsx');

    Route::get('/posts', [AdminPostController::class, 'reactView'])->name('Admin/Posts.jsx');
    Route::get('/about', [AdminAboutusController::class, 'reactView'])->name('Admin/About.jsx');
    Route::get('/delivery-zones', [AdminDeliveryZoneController::class, 'reactView'])->name('Admin/DeliveryZones.jsx');
    Route::get('/indicators', [AdminIndicatorController::class, 'reactView'])->name('Admin/Indicators.jsx');
    Route::get('/sliders', [AdminSliderController::class, 'reactView'])->name('Admin/Sliders.jsx');
    Route::get('/banners', [AdminBannerController::class, 'reactView'])->name('Admin/Banners.jsx');
    Route::get('/testimonies', [AdminTestimonyController::class, 'reactView'])->name('Admin/Testimonies.jsx');
    Route::get('/socials', [AdminSocialController::class, 'reactView'])->name('Admin/Socials.jsx');
    Route::get('/statuses', [AdminSaleStatusController::class, 'reactView'])->name('Admin/Statuses.jsx');
    Route::get('/strengths', [AdminStrengthController::class, 'reactView'])->name('Admin/Strengths.jsx');
    Route::get('/certifications', [AdminCertificationController::class, 'reactView'])->name('Admin/Certifications.jsx');
    Route::get('/partners', [AdminPartnerController::class, 'reactView'])->name('Admin/Partners.jsx');
    Route::get('/generals', [AdminGeneralController::class, 'reactView'])->name('Admin/Generals.jsx');
    Route::get('/coupons', [AdminCouponController::class, 'reactView'])->name('Admin/Coupons.jsx');
    Route::get('/faqs', [AdminFaqController::class, 'reactView'])->name('Admin/Faqs.jsx');


    Route::get('/gallery', [AdminGalleryController::class, 'reactView'])->name('Admin/Gallery.jsx');
    Route::get('/repository', [AdminRepositoryController::class, 'reactView'])->name('Admin/Repository.jsx');

    Route::middleware(['can:Root'])->get('/system', [AdminSystemController::class, 'reactView'])->name('Admin/System.jsx');
});

Route::middleware(['can:Customer', 'auth'])->prefix('customer')->group(function () {
    Route::get('/dashboard', [CustomerSaleController::class, 'reactView'])->name('Customer/Sales.jsx');
    Route::get('/orders', [CustomerSaleController::class, 'reactView'])->name('Customer/Sales.jsx');
});


if (env('APP_ENV') === 'local') {
    Route::get('/cloud/{uuid}', [RepositoryController::class, 'media']);
}
